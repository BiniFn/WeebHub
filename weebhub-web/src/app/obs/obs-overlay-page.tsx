import { getServerBaseUrl } from "@/api/client/server-url"
import React from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaInfo = {
    title?: { userPreferred?: string }
    coverImage?: { large?: string; extraLarge?: string }
}

type AnimePayload = {
    type: "anime"
    media?: MediaInfo
    episode?: { episodeNumber?: number; episodeTitle?: string }
    onlinestreamParams?: { episodeNumber?: number }
    currentTime?: number
    duration?: number
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

type Theme = "glass" | "minimal" | "neon" | "card" | "banner"
type Position = "bottom-left" | "bottom-right" | "top-left" | "top-right"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(seconds: number): string {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, "0")}`
}

function getPositionStyle(pos: Position): React.CSSProperties {
    const base: React.CSSProperties = { position: "fixed", zIndex: 9999 }
    switch (pos) {
        case "top-left":    return { ...base, top: 28, left: 28 }
        case "top-right":   return { ...base, top: 28, right: 28 }
        case "bottom-right":return { ...base, bottom: 28, right: 28 }
        default:            return { ...base, bottom: 28, left: 28 }
    }
}

// ─── Theme renderers ─────────────────────────────────────────────────────────

interface CardData {
    title: string
    cover?: string
    isAnime: boolean
    isManga: boolean
    statusLabel: string
    subInfo: string
    timeText?: string
    progress: number        // 0–1
    accentColor: string
}

function GlassCard({ d }: { d: CardData }) {
    return (
        <div style={{
            display: "flex", alignItems: "stretch", gap: 0,
            background: "rgba(10,10,15,0.78)",
            backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 16px 64px rgba(0,0,0,0.7)",
            overflow: "hidden", width: 420,
            fontFamily: "'Inter', system-ui, sans-serif",
            animation: "fadeIn .5s cubic-bezier(.16,1,.3,1)",
        }}>
            {/* Cover */}
            {d.cover ? (
                <div style={{ width: 96, flexShrink: 0, position: "relative", overflow: "hidden" }}>
                    <img src={d.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 55%, rgba(10,10,15,0.85))" }} />
                </div>
            ) : (
                <div style={{ width: 96, flexShrink: 0, background: "#0d0d18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 28, opacity: 0.4 }}>{d.isManga ? "📖" : "▶"}</span>
                </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.accentColor, display: "inline-block", animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: d.accentColor }}>{d.statusLabel}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.title}</div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{d.subInfo}</div>
                {d.progress > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        {d.timeText && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{d.timeText}</span>}
                        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ width: `${d.progress * 100}%`, height: "100%", background: d.accentColor, borderRadius: 999, transition: "width 1s linear" }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function MinimalCard({ d }: { d: CardData }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            borderRadius: 10, padding: "10px 16px",
            borderLeft: `3px solid ${d.accentColor}`,
            fontFamily: "'Inter', system-ui, sans-serif",
            animation: "fadeIn .4s ease",
            maxWidth: 380,
        }}>
            {d.cover && (
                <img src={d.cover} alt="" style={{ width: 36, height: 50, objectFit: "cover", borderRadius: 5, flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: d.accentColor, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{d.statusLabel}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }}>{d.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{d.subInfo}{d.timeText ? ` · ${d.timeText}` : ""}</div>
            </div>
        </div>
    )
}

function NeonCard({ d }: { d: CardData }) {
    const neonColor = d.isAnime ? "#c084fc" : "#4ade80"
    const glow = `0 0 20px ${neonColor}55, 0 0 60px ${neonColor}22, 0 2px 40px rgba(0,0,0,0.8)`
    return (
        <div style={{
            display: "flex", alignItems: "stretch", gap: 0,
            background: "rgba(5,5,12,0.92)",
            borderRadius: 12,
            border: `1px solid ${neonColor}44`,
            boxShadow: glow,
            overflow: "hidden", width: 400,
            fontFamily: "'Inter', system-ui, sans-serif",
            animation: "fadeIn .5s ease",
        }}>
            {d.cover && (
                <div style={{ width: 80, flexShrink: 0, position: "relative", overflow: "hidden" }}>
                    <img src={d.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 40%, rgba(5,5,12,0.9))" }} />
                </div>
            )}
            <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: neonColor, textTransform: "uppercase", letterSpacing: "0.15em", textShadow: `0 0 8px ${neonColor}` }}>
                    ◉ {d.statusLabel}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.title}</div>
                <div style={{ fontSize: 11, color: `${neonColor}cc`, fontWeight: 500 }}>{d.subInfo}</div>
                {d.progress > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        {d.timeText && <span style={{ fontSize: 10, color: `${neonColor}88`, flexShrink: 0 }}>{d.timeText}</span>}
                        <div style={{ flex: 1, height: 2, background: `${neonColor}22`, borderRadius: 999 }}>
                            <div style={{ width: `${d.progress * 100}%`, height: "100%", background: neonColor, boxShadow: `0 0 6px ${neonColor}`, borderRadius: 999, transition: "width 1s linear" }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function SolidCard({ d }: { d: CardData }) {
    return (
        <div style={{
            display: "flex", alignItems: "stretch", gap: 0,
            background: "#0f0f17",
            borderRadius: 14,
            border: "1px solid #2a2a3a",
            overflow: "hidden", width: 400,
            fontFamily: "'Inter', system-ui, sans-serif",
            animation: "fadeIn .4s ease",
        }}>
            {/* Colored accent bar */}
            <div style={{ width: 4, flexShrink: 0, background: d.accentColor }} />
            {d.cover && (
                <div style={{ width: 80, flexShrink: 0 }}>
                    <img src={d.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
            )}
            <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: d.accentColor, textTransform: "uppercase", letterSpacing: "0.12em" }}>{d.statusLabel}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.title}</div>
                <div style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>{d.subInfo}</div>
                {d.progress > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        {d.timeText && <span style={{ fontSize: 10, color: "#555", flexShrink: 0 }}>{d.timeText}</span>}
                        <div style={{ flex: 1, height: 3, background: "#2a2a3a", borderRadius: 999 }}>
                            <div style={{ width: `${d.progress * 100}%`, height: "100%", background: d.accentColor, borderRadius: 999, transition: "width 1s linear" }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function BannerCard({ d }: { d: CardData }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 0,
            background: "rgba(8,8,15,0.88)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            overflow: "hidden", width: 600, height: 72,
            borderTop: `2px solid ${d.accentColor}`,
            fontFamily: "'Inter', system-ui, sans-serif",
            animation: "fadeIn .4s ease",
            position: "relative",
        }}>
            {/* Background cover blur */}
            {d.cover && (
                <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.15 }}>
                    <img src={d.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(20px) scale(1.2)" }} />
                </div>
            )}
            {d.cover && (
                <div style={{ width: 50, flexShrink: 0, position: "relative", zIndex: 1, alignSelf: "stretch" }}>
                    <img src={d.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
            )}
            <div style={{ flex: 1, padding: "0 16px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: d.accentColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>{d.statusLabel}</span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>·</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{d.subInfo}</span>
                    {d.timeText && <><span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>·</span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{d.timeText}</span></>}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 480 }}>{d.title}</div>
            </div>
            {/* Progress bar at bottom */}
            {d.progress > 0 && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.08)" }}>
                    <div style={{ width: `${d.progress * 100}%`, height: "100%", background: d.accentColor, transition: "width 1s linear" }} />
                </div>
            )}
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ObsOverlayPage() {
    const [data, setData] = React.useState<NowPlayingData | null>(null)
    const [visible, setVisible] = React.useState(false)

    // Read URL params
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    const theme = (params.get("theme") ?? "glass") as Theme
    const position = (params.get("position") ?? "bottom-left") as Position

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
                    setData(json); setVisible(true)
                }
            } catch { setVisible(false) }
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

    const anime = data as AnimePayload
    const epNum = anime.episode?.episodeNumber ?? anime.onlinestreamParams?.episodeNumber
    const epTitle = anime.episode?.episodeTitle
    const currentTime = anime.currentTime ?? 0
    const duration = anime.duration ?? 0
    const animeProgress = duration > 0 ? Math.min(currentTime / duration, 1) : 0

    const manga = data as MangaPayload
    const chapter = manga.chapter
    const currentPage = manga.currentPage ?? 0
    const totalPages = manga.totalPages ?? 0
    const mangaProgress = totalPages > 0 ? Math.min(currentPage / totalPages, 1) : 0

    const accentColor = isAnime ? "#a78bfa" : "#34d399"
    const statusLabel = isManga ? "Reading" : "Watching"

    let subInfo = ""
    if (isAnime) subInfo = epNum != null ? `Episode ${epNum}${epTitle ? ` — ${epTitle}` : ""}` : ""
    if (isManga) subInfo = `Ch. ${chapter ?? "?"}${currentPage > 0 && totalPages > 0 ? `  ·  Page ${currentPage} / ${totalPages}` : ""}`

    let timeText: string | undefined
    if (isAnime && duration > 0) timeText = `${fmtTime(currentTime)} / ${fmtTime(duration)}`

    const progress = isAnime ? animeProgress : mangaProgress

    const d: CardData = { title, cover, isAnime, isManga, statusLabel, subInfo, timeText, progress, accentColor }

    const posStyle = getPositionStyle(position)
    // Banner always sticks to bottom edges, override position
    const wrapStyle: React.CSSProperties = theme === "banner"
        ? { position: "fixed", zIndex: 9999, bottom: 0, left: 0, right: 0 }
        : posStyle

    return (
        <div style={wrapStyle}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
                * { box-sizing: border-box; }
            `}</style>
            {theme === "glass"   && <GlassCard d={d} />}
            {theme === "minimal" && <MinimalCard d={d} />}
            {theme === "neon"    && <NeonCard d={d} />}
            {theme === "card"    && <SolidCard d={d} />}
            {theme === "banner"  && <BannerCard d={d} />}
        </div>
    )
}
