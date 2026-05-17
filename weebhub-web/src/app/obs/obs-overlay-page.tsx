import { getServerBaseUrl } from "@/api/client/server-url"
import React from "react"

type NowPlayingData = {
    playing: false
} | {
    playing?: undefined
    mediaId?: number
    media?: {
        title?: { userPreferred?: string }
        coverImage?: { large?: string }
    }
    episode?: {
        episodeNumber?: number
        episodeTitle?: string
    }
    onlinestreamParams?: {
        episodeNumber?: number
    }
}

export function ObsOverlayPage() {
    const [data, setData] = React.useState<NowPlayingData | null>(null)
    const [visible, setVisible] = React.useState(false)

    React.useEffect(() => {
        // Make background transparent for OBS
        document.body.style.background = "transparent"
        document.documentElement.style.background = "transparent"

        const baseUrl = getServerBaseUrl()
        const url = `${baseUrl}/api/v1/obs/now-playing`

        const poll = async () => {
            try {
                const res = await fetch(url, { credentials: "include" })
                if (!res.ok) return
                const json = await res.json() as NowPlayingData
                if (json && (json as any).playing === false) {
                    setVisible(false)
                } else {
                    setData(json)
                    setVisible(true)
                }
            } catch {
                // server not available yet, hide overlay
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

    const d = data as Exclude<NowPlayingData, { playing: false }>
    const title = d.media?.title?.userPreferred ?? "Unknown Anime"
    const cover = d.media?.coverImage?.large
    const epNum = d.episode?.episodeNumber ?? d.onlinestreamParams?.episodeNumber
    const epTitle = d.episode?.episodeTitle

    return (
        <div
            style={{
                position: "fixed",
                bottom: 32,
                left: 32,
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                padding: "14px 20px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
                maxWidth: 480,
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                animation: "fadeSlideIn 0.4s ease",
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>

            {/* Glow blob behind */}
            {cover && (
                <div style={{
                    position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden", zIndex: 0, opacity: 0.25,
                }}>
                    <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) scale(1.4)" }} />
                </div>
            )}

            {/* Cover art — blurred for streamer privacy */}
            {cover && (
                <div style={{
                    position: "relative", zIndex: 1,
                    width: 64, height: 88, flexShrink: 0,
                    borderRadius: 8, overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                }}>
                    <img
                        src={cover}
                        alt="Cover"
                        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(12px) brightness(0.7)", transform: "scale(1.1)" }}
                    />
                </div>
            )}

            {/* Text */}
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                        width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
                        display: "inline-block", animation: "pulse 1.8s ease-in-out infinite",
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>
                        Now Playing
                    </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320 }}>
                    {title}
                </div>
                {epNum !== undefined && (
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320 }}>
                        Episode {epNum}{epTitle ? ` — ${epTitle}` : ""}
                    </div>
                )}
            </div>
        </div>
    )
}
