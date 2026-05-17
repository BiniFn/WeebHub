"use client"
import { useAnilistListAnime } from "@/api/hooks/anilist.hooks"
import React from "react"
import { LuSearch, LuX, LuStar } from "react-icons/lu"
import { useRouter } from "@/lib/navigation"

// ─── Global Quick-Search Overlay ─────────────────────────────────────────────
// Opened with the "/" key from anywhere in the app

export function GlobalQuickSearch() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [debouncedQuery, setDebouncedQuery] = React.useState("")
    const inputRef = React.useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Debounce query
    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 350)
        return () => clearTimeout(t)
    }, [query])

    // "/" key to open
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName
            if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return
            if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
                e.preventDefault()
                setOpen(true)
            }
            if (e.key === "Escape") setOpen(false)
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    // Focus input when opened
    React.useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50)
        } else {
            setQuery("")
        }
    }, [open])

    // Search
    const { data, isFetching } = useAnilistListAnime(
        {
            page: 1,
            perPage: 8,
            search: debouncedQuery || undefined,
            sort: debouncedQuery ? ["SEARCH_MATCH"] : ["POPULARITY_DESC"],
        },
        open && debouncedQuery.length >= 2,
    )

    const results = data?.Page?.media ?? []

    const handleSelect = (id: number) => {
        router.push("/entry?id=" + id)
        setOpen(false)
    }

    if (!open) return null

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "flex-start", justifyContent: "center",
                paddingTop: "10vh",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
            <div style={{
                width: "100%", maxWidth: 600,
                background: "#0f0f17",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
                overflow: "hidden",
                fontFamily: "'Inter', system-ui, sans-serif",
                animation: "qs-in 0.2s cubic-bezier(0.16,1,0.3,1)",
            }}>
                <style>{`
                    @keyframes qs-in { from{opacity:0;transform:scale(0.96)translateY(-8px)} to{opacity:1;transform:scale(1)translateY(0)} }
                `}</style>

                {/* Input */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <LuSearch style={{ color: "#6b7280", fontSize: 20, flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search anime..."
                        style={{
                            flex: 1, background: "transparent", border: "none", outline: "none",
                            color: "#fff", fontSize: 16, fontFamily: "inherit",
                        }}
                    />
                    {isFetching && (
                        <div style={{ width: 16, height: 16, border: "2px solid #6b7280", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                    )}
                    <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4 }}>
                        <LuX />
                    </button>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div style={{ maxHeight: 420, overflowY: "auto" }}>
                        {results.map(anime => (
                            <button
                                key={anime.id}
                                onClick={() => handleSelect(anime.id)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    width: "100%", padding: "10px 20px",
                                    background: "none", border: "none", cursor: "pointer",
                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                    transition: "background 0.1s",
                                    textAlign: "left",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "none")}
                            >
                                {anime.coverImage?.medium && (
                                    <img src={anime.coverImage.medium} alt="" style={{ width: 36, height: 50, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {anime.title?.userPreferred ?? anime.title?.english ?? "Unknown"}
                                    </div>
                                    <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}>
                                        {anime.format && <span>{anime.format}</span>}
                                        {anime.seasonYear && <span>{anime.seasonYear}</span>}
                                        {anime.meanScore && (
                                            <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#fbbf24" }}>
                                                <LuStar style={{ fontSize: 11 }} /> {(anime.meanScore / 10).toFixed(1)}
                                            </span>
                                        )}
                                        {anime.episodes && <span style={{ color: "#4b5563" }}>{anime.episodes} eps</span>}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 4 }}>
                                    {anime.genres?.slice(0, 2).map(g => (
                                        <span key={g} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>{g}</span>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {debouncedQuery.length >= 2 && !isFetching && results.length === 0 && (
                    <div style={{ padding: "24px 20px", textAlign: "center", color: "#4b5563", fontSize: 14 }}>
                        No results for "{debouncedQuery}"
                    </div>
                )}

                {/* Hint bar */}
                <div style={{
                    display: "flex", gap: 16, alignItems: "center",
                    padding: "10px 20px",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                    color: "#4b5563", fontSize: 11,
                }}>
                    <span><kbd style={{ padding: "1px 5px", background: "#1f2937", borderRadius: 4, color: "#6b7280", fontFamily: "monospace" }}>↑↓</kbd> navigate</span>
                    <span><kbd style={{ padding: "1px 5px", background: "#1f2937", borderRadius: 4, color: "#6b7280", fontFamily: "monospace" }}>↵</kbd> open</span>
                    <span><kbd style={{ padding: "1px 5px", background: "#1f2937", borderRadius: 4, color: "#6b7280", fontFamily: "monospace" }}>Esc</kbd> close</span>
                    <span style={{ marginLeft: "auto" }}>
                        <kbd style={{ padding: "1px 5px", background: "#1f2937", borderRadius: 4, color: "#6b7280", fontFamily: "monospace" }}>/</kbd> quick search
                    </span>
                </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    )
}
