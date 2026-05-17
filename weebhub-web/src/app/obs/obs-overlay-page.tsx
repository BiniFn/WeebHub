import { getServerBaseUrl } from "@/api/client/server-url"
import React from "react"

// ─── Types ──────────────────────────────────────────────────────────────────

type MediaInfo = {
    title?: { userPreferred?: string }
    coverImage?: { large?: string; extraLarge?: string }
}

type AnimePayload = {
    type: "anime"
    media?: MediaInfo
    episode?: { episodeNumber?: number; episodeTitle?: string }
    onlinestreamParams?: { episodeNumber?: number }
    currentTime?: number   // seconds
    duration?: number      // seconds
}

type MangaPayload = {
    type: "manga"
    media?: MediaInfo
    chapter?: string | number
    currentPage?: number
    totalPages?: number
}

type EmptyPayload = { playing: false }

type NowPlayingData = AnimePayload | MangaPayload | EmptyPayload

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return "0:00"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, "0")}`
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ObsOverlayPage() {
    const [data, setData] = React.useState<NowPlayingData | null>(null)
    const [visible, setVisible] = React.useState(false)

    React.useEffect(() => {
        document.body.style.background = "transparent"
        document.documentElement.style.background = "transparent"

        const baseUrl = getServerBaseUrl()
        const url = `${baseUrl}/api/v1/obs/now-playing`

        const poll = async () => {
            try {
                const res = await fetch(url, { credentials: "include" })
                if (!res.ok) { setVisible(false); return }
                const json = await res.json() as NowPlayingData
                if (!json || (json as EmptyPayload).playing === false) {
                    setVisible(false)
                } else {
                    setData(json)
                    setVisible(true)
                }
            } catch {
                setVisible(false)
            }
        }

        poll()
        const interval = setInterval(poll, 3000)
        return () => {
            clearInterval(interval)
            document.body.style.background = ""
            document.documentElement.style.background = ""
        }
    }, [])

    if (!visible || !data) return null

    const isAnime = (data as AnimePayload).type === "anime"
    const isManga = (data as MangaPayload).type === "manga"

    const media = (data as AnimePayload | MangaPayload).media
    const title = media?.title?.userPreferred ?? "Unknown"
    const cover = media?.coverImage?.extraLarge ?? media?.coverImage?.large

    // Anime specifics
    const anime = data as AnimePayload
    const epNum = anime.episode?.episodeNumber ?? anime.onlinestreamParams?.episodeNumber
    const epTitle = anime.episode?.episodeTitle
    const currentTime = anime.currentTime ?? 0
    const duration = anime.duration ?? 0
    const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0

    // Manga specifics
    const manga = data as MangaPayload
    const chapter = manga.chapter
    const currentPage = manga.currentPage ?? 0
    const totalPages = manga.totalPages ?? 0
    const pageProgress = totalPages > 0 ? Math.min(currentPage / totalPages, 1) : 0

    return (
        <div style={{
            position: "fixed",
            bottom: 28,
            left: 28,
            display: "flex",
            alignItems: "stretch",
            gap: 0,
            background: "rgba(10,10,15,0.82)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 12px 60px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.4)",
            overflow: "hidden",
            width: 440,
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            animation: "fadeSlideIn 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.85); }
                }
            `}</style>

            {/* Cover image — visible, not blurred */}
            {cover ? (
                <div style={{ width: 100, flexShrink: 0, position: "relative", overflow: "hidden" }}>
                    <img
                        src={cover}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {/* subtle gradient overlay on right edge to blend into card */}
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to right, transparent 60%, rgba(10,10,15,0.85) 100%)",
                    }} />
                </div>
            ) : (
                <div style={{
                    width: 100, flexShrink: 0,
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <span style={{ fontSize: 32, opacity: 0.4 }}>{isManga ? "📖" : "▶"}</span>
                </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                {/* Status badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: isAnime ? "#a78bfa" : "#34d399",
                        display: "inline-block",
                        animation: "pulse 2s ease-in-out infinite",
                    }} />
                    <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: isAnime ? "#a78bfa" : "#34d399",
                    }}>
                        {isManga ? "Reading" : "Watching"}
                    </span>
                </div>

                {/* Title */}
                <div style={{
                    fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                    {title}
                </div>

                {/* Sub-info */}
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500, lineHeight: 1.4 }}>
                    {isAnime && epNum !== undefined && (
                        <span>Episode {epNum}{epTitle ? ` — ${epTitle}` : ""}</span>
                    )}
                    {isManga && (
                        <span>
                            {chapter != null ? `Ch. ${chapter}` : ""}
                            {currentPage > 0 && totalPages > 0 ? `  ·  Page ${currentPage} / ${totalPages}` : ""}
                        </span>
                    )}
                </div>

                {/* Progress info */}
                {isAnime && duration > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, flexShrink: 0 }}>
                            {fmtTime(currentTime)} / {fmtTime(duration)}
                        </span>
                        <div style={{
                            flex: 1, height: 3, background: "rgba(255,255,255,0.12)",
                            borderRadius: 999, overflow: "hidden",
                        }}>
                            <div style={{
                                width: `${progress * 100}%`, height: "100%",
                                background: "linear-gradient(90deg, #a78bfa, #7c3aed)",
                                borderRadius: 999,
                                transition: "width 1s linear",
                            }} />
                        </div>
                    </div>
                )}

                {isManga && totalPages > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, flexShrink: 0 }}>
                            {currentPage} / {totalPages} pages
                        </span>
                        <div style={{
                            flex: 1, height: 3, background: "rgba(255,255,255,0.12)",
                            borderRadius: 999, overflow: "hidden",
                        }}>
                            <div style={{
                                width: `${pageProgress * 100}%`, height: "100%",
                                background: "linear-gradient(90deg, #34d399, #059669)",
                                borderRadius: 999,
                                transition: "width 0.5s linear",
                            }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
