/// <reference path="../_external/.onlinestream-provider.d.ts" />
/// <reference path="../_external/core.d.ts" />

class Provider {
    private readonly BASE_URL = "https://hentaihaven.xxx";

    getSettings(): Settings {
        return {
            episodeServers: ["HentaiHaven"],
            supportsDub: false,
        };
    }

    async search(opts: SearchOptions): Promise<SearchResult[]> {
        const query = opts.query.trim();
        const url = `${this.BASE_URL}/?s=${encodeURIComponent(query)}`;

        console.log("Searching:", url);

        let html = "";

        try {
            const browser = await ChromeDP.newBrowser({
                timeout: 60000,
            });

            await browser.navigate(url);
            await browser.sleep(8000);

            html = await browser.evaluate(`document.documentElement.outerHTML`);
            await browser.close();
        } catch (e) {
            console.log("Search error:", e);
            return [];
        }

        const $ = await LoadDoc(html);
        const results: SearchResult[] = [];
        const seen = new Set<string>();

        $("a[href*='/watch/']").each((_, el) => {
            const href = el.attr("href") || "";
            if (!href.includes("/watch/")) return;

            const fullUrl = href.startsWith("http") ? href : `${this.BASE_URL}${href}`;
            if (seen.has(fullUrl)) return;
            seen.add(fullUrl);

            const parts = fullUrl.split("/").filter(Boolean);
            const slugIndex = parts.indexOf("watch");
            if (slugIndex === -1) return;

            const slug = parts[slugIndex + 1];
            if (!slug) return;

            let title = el.attr("title") || el.text().trim() || slug.replace(/-/g, " ");
            title = title.replace(/episode\s*\d+/gi, "").trim();
            if (!title) return;

            results.push({ id: slug, title, url: fullUrl, subOrDub: "sub" });
        });

        console.log(`Found ${results.length} results`);
        return results;
    }

    async findEpisodes(id: string): Promise<EpisodeDetails[]> {
        const url = `${this.BASE_URL}/watch/${id}`;
        console.log("Episodes URL:", url);

        let html = "";

        try {
            const browser = await ChromeDP.newBrowser({ timeout: 60000 });
            await browser.navigate(url);
            await browser.sleep(8000);
            html = await browser.evaluate(`document.documentElement.outerHTML`);
            await browser.close();
        } catch (e) {
            console.log("Episode error:", e);
            return [];
        }

        const $ = await LoadDoc(html);
        const episodes: EpisodeDetails[] = [];
        const seen = new Set<string>();

        $("a[href*='episode-']").each((_, el) => {
            const href = el.attr("href") || "";
            if (!href.includes("episode-")) return;

            const fullUrl = href.startsWith("http") ? href : `${this.BASE_URL}${href}`;
            if (seen.has(fullUrl)) return;
            seen.add(fullUrl);

            const epMatch = href.match(/episode-(\d+)/i);
            const number = epMatch ? parseInt(epMatch[1]) : episodes.length + 1;

            episodes.push({
                id: href.split("/").filter(Boolean).pop() || `ep-${number}`,
                number,
                title: `Episode ${number}`,
                url: fullUrl,
            });
        });

        episodes.sort((a, b) => a.number - b.number);
        console.log(`Found ${episodes.length} episodes`);
        return episodes;
    }

    async findEpisodeServer(episode: EpisodeDetails, server: string): Promise<EpisodeServer> {
        if (server !== "HentaiHaven") {
            return { server: "", headers: {}, videoSources: [] };
        }

        let browser: any;
        const videoSources: VideoSource[] = [];
        const subtitles: VideoSubtitle[] = [];

        try {
            browser = await ChromeDP.newBrowser({ timeout: 90000 });
            console.log("Opening episode:", episode.url);

            await browser.navigate(episode.url);
            await browser.sleep(12000);

            const iframeUrl = await browser.evaluate(`
                (() => {
                    const iframes = [...document.querySelectorAll("iframe")];
                    for (const iframe of iframes) {
                        if (iframe.src) return iframe.src;
                    }
                    return null;
                })()
            `);

            console.log("Iframe:", iframeUrl);

            if (!iframeUrl) {
                return { server: "HentaiHaven", headers: {}, videoSources: [] };
            }

            await browser.navigate(iframeUrl);
            await browser.sleep(10000);

            const extracted = await browser.evaluate(`
                (() => {
                    const sources = [];
                    const subtitles = [];

                    try {
                        if (window.jwplayer) {
                            const player = jwplayer();
                            const playlist = player.getPlaylist();
                            if (playlist && playlist.length > 0) {
                                const item = playlist[0];
                                if (item.sources) {
                                    item.sources.forEach(s => {
                                        sources.push({ file: s.file, label: s.label || "auto", type: s.type || "" });
                                    });
                                }
                                if (item.tracks) {
                                    item.tracks.forEach(t => {
                                        subtitles.push({ file: t.file, label: t.label || "Unknown", default: t.default || false });
                                    });
                                }
                            }
                        }
                    } catch(e) {}

                    document.querySelectorAll("video source").forEach(v => {
                        if (v.src) sources.push({ file: v.src, label: "auto", type: v.type || "" });
                    });

                    document.querySelectorAll("script").forEach(script => {
                        const txt = script.innerHTML;
                        const matches = txt.match(/https?:\\\\/\\\\/[^"' ]+\\.(m3u8|mp4|mpd)[^"' ]*/g);
                        if (matches) {
                            matches.forEach(url => {
                                sources.push({ file: url.replace(/\\\\/g, ""), label: "auto", type: "hls" });
                            });
                        }
                    });

                    return { sources, subtitles };
                })()
            `);

            console.log("Extracted:", JSON.stringify(extracted));

            for (const sub of extracted.subtitles || []) {
                if (!sub.file) continue;
                subtitles.push({
                    id: sub.label,
                    language: sub.label,
                    url: sub.file,
                    isDefault: sub.default || false,
                });
            }

            const seen = new Set<string>();

            for (const source of extracted.sources || []) {
                if (!source.file) continue;
                const url = source.file;
                if (seen.has(url)) continue;
                seen.add(url);

                if (!url.includes(".m3u8") && !url.includes(".mp4") && !url.includes(".mpd")) continue;

                videoSources.push({
                    url,
                    quality: source.label || "auto",
                    type: url.includes(".m3u8") ? "m3u8" : url.includes(".mpd") ? "dash" : "mp4",
                    subtitles,
                });
            }

            if (videoSources.length === 0) {
                console.log("Trying network fallback");
                const networkUrls = await browser.evaluate(`
                    performance.getEntriesByType("resource")
                        .map(r => r.name)
                        .filter(u => u.includes(".m3u8") || u.includes(".mp4") || u.includes(".mpd"))
                `);

                for (const url of networkUrls || []) {
                    if (seen.has(url)) continue;
                    seen.add(url);
                    videoSources.push({
                        url,
                        quality: "auto",
                        type: url.includes(".m3u8") ? "m3u8" : url.includes(".mpd") ? "dash" : "mp4",
                        subtitles,
                    });
                }
            }

            console.log(`Final sources: ${videoSources.length}`);

            return {
                server: "HentaiHaven",
                headers: {
                    Referer: "https://hentaihaven.xxx/",
                    Origin: "https://hentaihaven.xxx",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
                },
                videoSources,
            };

        } catch (e: any) {
            console.log("Source error:", e?.message);
            return { server: "HentaiHaven", headers: {}, videoSources: [] };
        } finally {
            if (browser) {
                try { await browser.close(); } catch {}
            }
        }
    }
}