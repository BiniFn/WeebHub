import { useGetAnilistAnimeDetails } from "@/api/hooks/anilist.hooks"
import { AL_BaseAnime } from "@/api/generated/types"
import React from "react"
import { LuExternalLink, LuRadio, LuCalendar, LuEye, LuEyeOff, LuTv, LuZap } from "react-icons/lu"
import { SiAnilist, SiReddit } from "react-icons/si"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCountdown(seconds: number): string {
    if (seconds <= 0) return "Airing now!"
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (d > 0) return `${d}d ${h}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

function formatDate(unix: number): string {
    return new Date(unix * 1000).toLocaleDateString(undefined, {
        weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    })
}

// ─── Anime Intel Panel ────────────────────────────────────────────────────────
// Shows next episode countdown, trailer, and trusted source links
// Used inside the Streamer modal

type AnimeIntelProps = {
    mediaId: number | undefined
}

export function AnimeIntelPanel({ mediaId }: AnimeIntelProps) {
    const [showSynopsis, setShowSynopsis] = React.useState(false)
    const [secondsLeft, setSecondsLeft] = React.useState<number | null>(null)

    const { data, isLoading } = useGetAnilistAnimeDetails(mediaId)
    const anime = data as AL_BaseAnime | undefined

    // Live countdown timer
    React.useEffect(() => {
        if (!anime?.nextAiringEpisode?.timeUntilAiring) { setSecondsLeft(null); return }
        setSecondsLeft(anime.nextAiringEpisode.timeUntilAiring)
        const interval = setInterval(() => {
            setSecondsLeft(s => (s !== null && s > 0 ? s - 1 : s))
        }, 1000)
        return () => clearInterval(interval)
    }, [anime?.nextAiringEpisode?.timeUntilAiring])

    if (!mediaId) {
        return (
            <div className="p-4 text-center text-sm text-gray-500 bg-black/20 rounded-xl border border-white/5">
                <LuTv className="inline-block mr-2 text-gray-600" />
                Play something first to see intel for it
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="p-4 text-center text-sm text-gray-500 animate-pulse">
                Loading anime intel…
            </div>
        )
    }

    if (!anime) {
        return (
            <div className="p-4 text-center text-sm text-gray-500">
                No data available
            </div>
        )
    }

    const title = anime.title?.userPreferred ?? anime.title?.english ?? "Unknown"
    const next = anime.nextAiringEpisode
    const trailerUrl = anime.trailer
        ? (anime.trailer.site === "youtube"
            ? `https://www.youtube.com/watch?v=${anime.trailer.id}`
            : `https://www.dailymotion.com/video/${anime.trailer.id}`)
        : null

    const trustedLinks = [
        {
            label: "AniList",
            href: anime.siteUrl ?? `https://anilist.co/anime/${anime.id}`,
            icon: "🔵",
            desc: "Full details & community",
        },
        {
            label: "AniChart",
            href: `https://anichart.net/`,
            icon: "📅",
            desc: "Season preview & schedule",
        },
        {
            label: "r/anime",
            href: `https://www.reddit.com/r/anime/search/?q=${encodeURIComponent(title)}&restrict_sr=1&sort=new`,
            icon: "🟠",
            desc: "Episode discussions & leaks",
        },
        ...(anime.idMal ? [{
            label: "MyAnimeList",
            href: `https://myanimelist.net/anime/${anime.idMal}`,
            icon: "🔷",
            desc: "Reviews & stats",
        }] : []),
        {
            label: "r/manga",
            href: `https://www.reddit.com/r/manga/search/?q=${encodeURIComponent(title)}&restrict_sr=1&sort=new`,
            icon: "📕",
            desc: "Manga source discussions",
        },
    ]

    return (
        <div className="space-y-4">
            {/* Anime identity */}
            <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                {anime.coverImage?.medium && (
                    <img src={anime.coverImage.medium} alt="" className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="min-w-0">
                    <p className="font-bold text-white text-sm leading-tight truncate">{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {anime.seasonYear} · {anime.format} · {anime.episodes ? `${anime.episodes} eps` : anime.status}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {anime.genres?.slice(0, 3).map(g => (
                            <span key={g} className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand/10 text-brand-300">{g}</span>
                        ))}
                    </div>
                </div>
                {anime.meanScore && (
                    <div className="ml-auto text-right flex-shrink-0">
                        <p className="text-lg font-black text-yellow-400">{(anime.meanScore / 10).toFixed(1)}</p>
                        <p className="text-[10px] text-gray-500">AniList</p>
                    </div>
                )}
            </div>

            {/* Next episode countdown */}
            {next ? (
                <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-800/30">
                    <div className="flex items-center gap-2 mb-1">
                        <LuRadio className="text-purple-400 animate-pulse" />
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Next Episode</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">Ep {next.episode}</span>
                        <span className="text-sm text-purple-300 font-semibold">
                            in {secondsLeft !== null ? fmtCountdown(secondsLeft) : fmtCountdown(next.timeUntilAiring)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        <LuCalendar className="inline-block mr-1" />
                        {formatDate(next.airingAt)}
                    </p>
                </div>
            ) : (
                <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-xs text-gray-500">
                    {anime.status === "FINISHED" ? "✅ Series complete — no more episodes scheduled" :
                     anime.status === "NOT_YET_RELEASED" ? "⏳ Not yet airing" :
                     "No next episode scheduled yet"}
                </div>
            )}

            {/* Synopsis (spoiler-blurred) */}
            {anime.description && (
                <div className="rounded-xl border border-white/5 overflow-hidden">
                    <button
                        onClick={() => setShowSynopsis(p => !p)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-black/20 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                        <span className="flex items-center gap-1.5">
                            {showSynopsis ? <LuEyeOff className="text-sm" /> : <LuEye className="text-sm" />}
                            Synopsis {!showSynopsis && <span className="text-[10px] text-gray-600">(spoiler — click to reveal)</span>}
                        </span>
                    </button>
                    <div className={`px-3 py-2 text-xs text-gray-300 leading-relaxed transition-all ${showSynopsis ? "" : "blur-sm select-none pointer-events-none"}`}
                        dangerouslySetInnerHTML={{ __html: anime.description.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "") }}
                    />
                </div>
            )}

            {/* Trailer */}
            {trailerUrl && (
                <a
                    href={trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 bg-red-950/30 border border-red-800/30 rounded-xl text-sm text-red-300 hover:text-red-200 hover:bg-red-900/40 transition-colors group"
                >
                    <LuZap className="text-red-400 group-hover:animate-bounce" />
                    <span className="font-semibold">Watch Official Trailer</span>
                    <LuExternalLink className="ml-auto opacity-50" />
                </a>
            )}

            {/* Trusted sources */}
            <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Trusted Sources & Discussions</p>
                <div className="grid grid-cols-2 gap-2">
                    {trustedLinks.map(l => (
                        <a
                            key={l.label}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-white/5 rounded-lg hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                        >
                            <span className="text-base">{l.icon}</span>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">{l.label}</p>
                                <p className="text-[10px] text-gray-500 truncate">{l.desc}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}
