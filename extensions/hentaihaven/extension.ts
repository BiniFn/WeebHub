/// <reference path="../_external/.onlinestream-provider.d.ts" />
/// <reference path="../_external/core.d.ts" />

const PROVIDERS = {
    hentaihaven: {
        baseUrl: "https://hentaihaven.xxx",
        searchPath: "/?s=",
        watchPath: "/watch/",
        episodePattern: /episode-(\d+)/i,
    },
    hentaitv: {
        baseUrl: "https://hentai.tv",
        searchPath: "/search.html?keyword=",
        watchPath: "/watch/",
        episodePattern: /episode-(\d+)/i,
    },
    hanime: {
        baseUrl: "https://hanime.tv",
        searchPath: "/browse?q=",
        watchPath: "/watch/",
        episodePattern: /episode-(\d+)/i,
    },
} as const;

type ProviderId = keyof typeof PROVIDERS;

class MultiProvider {
    private getSettings(): Settings {
        return {
            episodeServers: ["HentaiHaven", "HentaiTV", "Hanime"],
            supportsDub: false,
        };
    }

    private async fetchWithBrowser(url: string, waitTime: number = 8000): Promise<string> {
        try {
            const browser = await ChromeDP.newBrowser({ timeout: 60000 });
            await browser.navigate(url);
            await browser.sleep(waitTime);
            const html = await browser.evaluate(`document.documentElement.outerHTML`);
            await browser.close();
            return html;
        } catch (e) {
            console.log("Browser fetch error:", e);
            return "";
        }
    }

    private extractSlug(url: string, provider: ProviderId): string | null {
        const parts = url.split("/").filter(Boolean);
        const watchIndex = parts.indexOf("watch");
        if (watchIndex === -1 || watchIndex + 1 >= parts.length) return null;
        return parts[watchIndex + 1];
    }

    // ---------------- SEARCH ----------------

    async search(opts: SearchOptions): Promise<SearchResult[]> {
        const query = opts.query.trim();
        const results: SearchResult[] = [];
        const seen = new Set<string>();

        // Search all providers
        const searchPromises = Object.entries(PROVIDERS).map(async ([providerId, provider]) => {
            const url = `${provider.baseUrl}${provider.searchPath}${encodeURIComponent(query)}`;
            console.log(`Searching ${providerId}:`, url);

            try {
                const html = await this.fetchWithBrowser(url);

                const $ = await LoadDoc(html);

                $("a[href*='/watch/']").each((_, el) => {
                    const href = el.attr("href") || "";
                    if (!href.includes("/watch/")) return;

                    const fullUrl = href.startsWith("http") ? href : `${provider.baseUrl}${href}`;
                    if (seen.has(fullUrl)) return;
                    seen.add(fullUrl);

                    const slug = this.extractSlug(fullUrl, providerId as ProviderId);
                    if (!slug) return;

                    let title = el.attr("title") || el.text().trim() || slug.replace(/-/g, " ");
                    title = title.replace(/episode\s*\d+/gi, "").trim();
                    if (!title) return;

                    results.push({
                        id: `${providerId}:${slug}`,
                        title,
                        url: fullUrl,
                        subOrDub: "sub",
                    });
                });
            } catch (e) {
                console.log(`${providerId} search error:`, e);
            }
        });

        await Promise.all(searchPromises);
        console.log(`Total results: ${results.length}`);
        return results;
    }

    // ---------------- EPISODES ----------------

    async findEpisodes(id: string): Promise<EpisodeDetails[]> {
        const [providerId, ...slugParts] = id.split(":");
        const slug = slugParts.join(":");
        const provider = PROVIDERS[providerId as ProviderId];
        
        if (!provider) return [];

        const url = `${provider.baseUrl}${provider.watchPath}${slug}`;
        console.log(`Episodes URL (${providerId}):`, url);

        const html = await this.fetchWithBrowser(url);
        const $ = await LoadDoc(html);
        const episodes: EpisodeDetails[] = [];
        const seen = new Set<string>();

        $("a[href*='episode-']").each((_, el) => {
            const href = el.attr("href") || "";
            if (!href.includes("episode-")) return;

            const fullUrl = href.startsWith("http") ? href : `${provider.baseUrl}${href}`;
            if (seen.has(fullUrl)) return;
            seen.add(fullUrl);

            const epMatch = href.match(provider.episodePattern);
            const number = epMatch ? parseInt(epMatch[1]) : episodes.length + 1;

            episodes.push({
                id: href.split("/").filter(Boolean).pop() || `ep-${number}`,
                number,
                title: `Episode ${number}`,
                url: fullUrl,
            });
        });

        episodes.sort((a, b) => a.number - b.number);
        console.log(`Found ${episodes.length} episodes for ${providerId}`);
        return episodes;
    }

    // ---------------- SOURCES ----------------

    async findEpisodeServer(episode: EpisodeDetails, server: string): Promise<EpisodeServer> {
        const serverMap: Record<string, ProviderId> = {
            "HentaiHaven": "hentaihaven",
            "HentaiTV": "hentaitv",
            "Hanime": "hanime",
        };

        const providerId = serverMap[server];
        if (!providerId) {
            return { server: "", headers: {}, videoSources: [] };
        }

        const provider = PROVIDERS[providerId];
        let browser: any;
        const videoSources: VideoSource[] = [];
        const subtitles: VideoSubtitle[] = [];

        try {
            browser = await ChromeDP.newBrowser({ timeout: 90000 });
            console.log(`Opening episode (${providerId}):`, episode.url);

            await browser.navigate(episode.url);
            await browser.sleep(12000);

            // Try multiple methods to find video source
            const videoData = await browser.evaluate(`
                (() => {
                    const results = { sources: [], subtitles: [] };

                    // Method 1: JWPlayer
                    try {
                        if (window.jwplayer) {
                            const player = jwplayer();
                            const playlist = player.getPlaylist();
                            if (playlist && playlist.length > 0) {
                                const item = playlist[0];
                                if (item.sources) {
                                    item.sources.forEach((s: any) => {
                                        results.sources.push({ file: s.file, label: s.label || "auto" });
                                    });
                                }
                                if (item.tracks) {
                                    item.tracks.forEach((t: any) => {
                                        if (t.kind === "subtitles") {
                                            results.subtitles.push({ file: t.file, label: t.label || "Subtitle" });
                                        }
                                    });
                                }
                            }
                        }
                    } catch(e) {}

                    // Method 2: Video tags
                    document.querySelectorAll("video source").forEach((v: any) => {
                        if (v.src) results.sources.push({ file: v.src, label: "auto" });
                    });

                    // Method 3: Script URL extraction
                    document.querySelectorAll("script").forEach((script: any) => {
                        const txt = script.innerHTML;
                        const matches = txt.match(/https?:[\\]*[\/]{2}[^"'\\s]+/g);
                        if (matches) {
                            matches.forEach((url: string) => {
                                const cleanUrl = url.replace(/\\\\/g, "");
                                if (cleanUrl.match(/\\.(m3u8|mp4|webm)/)) {
                                    results.sources.push({ file: cleanUrl, label: "auto" });
                                }
                            });
                        }
                    });

                    return results;
                })()
            `);

            console.log("Video data extracted:", JSON.stringify(videoData));

            const seen = new Set<string>();

            // Process subtitles
            for (const sub of videoData.subtitles || []) {
                if (!sub.file) continue;
                subtitles.push({
                    id: sub.label,
                    language: sub.label,
                    url: sub.file,
                    isDefault: false,
                });
            }

            // Process sources
            for (const source of videoData.sources || []) {
                if (!source.file) continue;
                const url = source.file;
                if (seen.has(url)) continue;
                seen.add(url);

                const type = url.includes(".m3u8") ? "m3u8" : url.includes(".mpd") ? "dash" : "mp4";

                videoSources.push({
                    url,
                    quality: source.label || "auto",
                    type,
                    subtitles,
                });
            }

            // Network resource fallback
            if (videoSources.length === 0) {
                console.log("Trying network resource fallback...");
                const networkUrls = await browser.evaluate(`
                    performance.getEntriesByType("resource")
                        .map((r: any) => r.name)
                        .filter((u: string) => u.includes(".m3u8") || u.includes(".mp4") || u.includes(".mpd"))
                `);

                for (const url of networkUrls || []) {
                    if (seen.has(url)) continue;
                    seen.add(url);

                    const type = url.includes(".m3u8") ? "m3u8" : url.includes(".mpd") ? "dash" : "mp4";
                    videoSources.push({
                        url,
                        quality: "auto",
                        type,
                        subtitles,
                    });
                }
            }

            console.log(`Final sources for ${providerId}: ${videoSources.length}`);

            return {
                server,
                headers: {
                    Referer: provider.baseUrl + "/",
                    Origin: provider.baseUrl,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                },
                videoSources,
            };

        } catch (e: any) {
            console.log(`Source error (${providerId}):`, e?.message);
            return { server, headers: {}, videoSources: [] };
        } finally {
            if (browser) {
                try { await browser.close(); } catch {}
            }
        }
    }
}