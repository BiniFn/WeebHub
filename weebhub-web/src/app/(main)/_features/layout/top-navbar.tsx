import { LayoutHeaderBackground } from "@/app/(main)/_features/layout/_components/layout-header-background"
import { TopMenu } from "@/app/(main)/_features/navigation/top-menu"
import { OfflineTopMenu } from "@/app/(main)/_features/offline/_components/offline-top-menu"
import { ManualProgressTrackingButton } from "@/app/(main)/_features/progress-tracking/manual-progress-tracking"
import { PlaybackManagerProgressTrackingButton } from "@/app/(main)/_features/progress-tracking/playback-manager-progress-tracking"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { ChapterDownloadsButton } from "@/app/(main)/manga/_containers/chapter-downloads/chapter-downloads-button"
import { __manga_chapterDownloadsDrawerIsOpenAtom } from "@/app/(main)/manga/_containers/chapter-downloads/chapter-downloads-drawer"
import { AppSidebarTrigger } from "@/components/ui/app-layout"
import { cn } from "@/components/ui/core/styling"
import { VerticalMenu } from "@/components/ui/vertical-menu"
import { usePathname, useSearchParams } from "@/lib/navigation"
import { useThemeSettings } from "@/lib/theme/theme-hooks"
import { __isDesktop__ } from "@/types/constants"
import { useSetAtom } from "jotai/react"
import React from "react"
import { LuFolderDown, LuEye, LuEyeOff, LuCopy, LuCheck, LuKeyboard } from "react-icons/lu"
import { PluginSidebarTray } from "../plugin/tray/plugin-sidebar-tray"
import { IconButton, Button } from "@/components/ui/button"
import { useAtom } from "jotai"
import { streamerModeAtom } from "@/app/(main)/_atoms/streamer-mode.atoms"
import { Modal } from "@/components/ui/modal"
import { MissingEpisodesBadge } from "./missing-episodes-badge"
import { AnimeIntelPanel } from "./anime-intel-panel"
import { GlobalQuickSearch } from "./global-quick-search"

// ─── OBS URL builder ─────────────────────────────────────────────────────────

type ObsTheme = "glass" | "minimal" | "neon" | "card" | "banner"
type ObsPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right"

const OBS_THEMES: { id: ObsTheme; label: string; desc: string; preview: string }[] = [
    { id: "glass",   label: "Glass",   desc: "Frosted glass blur",    preview: "🪟" },
    { id: "minimal", label: "Minimal", desc: "Clean & lightweight",   preview: "✦" },
    { id: "neon",    label: "Neon",    desc: "Glowing neon borders",  preview: "⚡" },
    { id: "card",    label: "Card",    desc: "Solid dark card",       preview: "🃏" },
    { id: "banner",  label: "Banner",  desc: "Full-width bottom bar", preview: "—" },
]

const OBS_POSITIONS: { id: ObsPosition; label: string; icon: string }[] = [
    { id: "bottom-left",  label: "Bottom Left",  icon: "↙" },
    { id: "bottom-right", label: "Bottom Right", icon: "↘" },
    { id: "top-left",     label: "Top Left",     icon: "↖" },
    { id: "top-right",    label: "Top Right",    icon: "↗" },
]

// ─── Streamer modal content ───────────────────────────────────────────────────

function StreamerModalContent({ isStreamerMode, setStreamerMode }: {
    isStreamerMode: boolean
    setStreamerMode: (fn: (p: boolean) => boolean) => void
}) {
    const [obsTheme, setObsTheme] = React.useState<ObsTheme>("glass")
    const [obsPos, setObsPos]     = React.useState<ObsPosition>("bottom-left")
    const [copied, setCopied]     = React.useState(false)

    const pathname = usePathname()
    const searchParams = useSearchParams()

    const isEntryPage = pathname.startsWith("/entry") || pathname.startsWith("/manga/entry")
    const mediaIdParam = searchParams.get("id")
    const mediaId = isEntryPage && mediaIdParam ? Number(mediaIdParam) : undefined

    const port = typeof window !== "undefined" ? window.location.port || "43211" : "43211"
    const obsUrl = `http://localhost:${port}/obs?theme=${obsTheme}&position=${obsPos}`

    const handleCopy = () => {
        navigator.clipboard?.writeText(obsUrl).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <div className="space-y-5">

            {/* ── Streamer Mode ── */}
            <div className={cn(
                "relative flex items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-300",
                isStreamerMode
                    ? "border-[--brand]/50 bg-gradient-to-r from-[--brand]/15 to-violet-600/10"
                    : "border-white/8 bg-white/[0.03]",
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                        isStreamerMode ? "bg-[--brand]/30 text-[--brand]" : "bg-white/5 text-gray-400",
                    )}>
                        {isStreamerMode ? <LuEyeOff className="text-lg" /> : <LuEye className="text-lg" />}
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm leading-none mb-1">Streamer Mode</p>
                        <p className="text-xs text-gray-400">Blurs covers & sensitive content while streaming</p>
                    </div>
                </div>
                <button
                    onClick={() => setStreamerMode(p => !p)}
                    className={cn(
                        "relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0",
                        isStreamerMode ? "bg-[--brand]" : "bg-white/15",
                    )}
                >
                    <span className={cn(
                        "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300",
                        isStreamerMode ? "left-6" : "left-0.5",
                    )} />
                </button>
            </div>

            {/* Keyboard hint */}
            <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                <LuKeyboard className="text-sm flex-shrink-0" />
                <span>Press <kbd className="mx-1 px-1.5 py-0.5 bg-white/8 border border-white/10 rounded-md text-gray-300 font-mono text-[11px]">S</kbd> anywhere to toggle quickly</span>
            </div>

            {/* ── Streamer Intel ── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[--brand] to-violet-500" />
                    <h3 className="font-bold text-sm text-white">Streamer Intel</h3>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-[--brand]/15 border border-[--brand]/30 text-[10px] font-semibold text-[--brand] uppercase tracking-wide">Live</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                    Live countdowns, episode leaks, and trusted links for the anime you're currently viewing.
                </p>
                <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
                    <AnimeIntelPanel mediaId={mediaId} />
                </div>
            </div>

            {/* ── OBS Overlay ── */}
            <div className="space-y-4 pt-1 border-t border-white/6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-orange-400 to-red-500" />
                        <h3 className="font-bold text-sm text-white">OBS Overlay</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        A "Now Playing" widget for your stream. Pick a theme, position, then paste the URL into OBS as a Browser Source.
                    </p>
                </div>

                {/* Theme picker */}
                <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2.5">Theme</p>
                    <div className="grid grid-cols-5 gap-1.5">
                        {OBS_THEMES.map(t => (
                            <button
                                key={t.id}
                                id={`obs-theme-${t.id}`}
                                onClick={() => setObsTheme(t.id)}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all cursor-pointer",
                                    obsTheme === t.id
                                        ? "border-[--brand]/70 bg-gradient-to-b from-[--brand]/20 to-[--brand]/5 text-white shadow-lg shadow-[--brand]/10"
                                        : "border-white/6 bg-black/25 text-gray-500 hover:border-white/15 hover:text-gray-300",
                                )}
                            >
                                <span className="text-lg leading-none">{t.preview}</span>
                                <span className="text-[10px] font-bold leading-none">{t.label}</span>
                                <span className="text-[9px] text-gray-600 leading-tight text-center">{t.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Position picker */}
                <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2.5">Position</p>
                    <div className="grid grid-cols-4 gap-1.5">
                        {OBS_POSITIONS.map(p => (
                            <button
                                key={p.id}
                                id={`obs-pos-${p.id}`}
                                onClick={() => setObsPos(p.id)}
                                className={cn(
                                    "flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border transition-all cursor-pointer",
                                    obsPos === p.id
                                        ? "border-[--brand]/70 bg-gradient-to-b from-[--brand]/20 to-[--brand]/5 text-white"
                                        : "border-white/6 bg-black/25 text-gray-500 hover:border-white/15",
                                )}
                            >
                                <span className="text-base leading-none">{p.icon}</span>
                                <span className="text-[10px] font-medium leading-tight text-center">{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generated URL */}
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Your OBS URL</p>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/8">
                        <code className="flex-1 text-xs text-[--brand] font-mono overflow-x-auto whitespace-nowrap select-all">
                            {obsUrl}
                        </code>
                        <button
                            id="obs-copy-url-btn"
                            onClick={handleCopy}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all",
                                copied
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-white/8 text-gray-300 border border-white/10 hover:bg-white/12",
                            )}
                        >
                            {copied ? <LuCheck className="text-sm" /> : <LuCopy className="text-sm" />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <button
                            onClick={() => {
                                const w = obsTheme === "banner" ? 1200 : 500
                                const h = obsTheme === "banner" ? 160 : 200
                                window.open(obsUrl + "&test=true", "_blank", `width=${w},height=${h},menubar=no,toolbar=no`)
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 bg-white/8 text-gray-300 border border-white/10 hover:bg-white/12 transition-all"
                        >
                            <LuEye className="text-sm" />
                            Test
                        </button>
                    </div>
                </div>

                {/* Setup steps */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-black/20 border border-white/6 space-y-2">
                    <p className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                        <span className="text-base">📺</span> How to add in OBS
                    </p>
                    {[
                        "Click + under Sources → Browser Source",
                        "Paste the URL above",
                        `Set Width: ${obsTheme === "banner" ? "1920" : "500"}, Height: ${obsTheme === "banner" ? "80" : "160"}`,
                        "Check \"Refresh browser when scene becomes active\"",
                        "Widget auto-updates when you watch or read!",
                    ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-[--brand]/25 flex items-center justify-center text-[--brand] font-bold text-[10px] flex-shrink-0">
                                {i + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                        </div>
                    ))}
                </div>

                {/* Option 2 */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/6">
                    <p className="text-xs font-bold text-white mb-1.5 flex items-center gap-2">
                        <span>🌫️</span> Option 2 — Full-Window Blur
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Add a <strong className="text-gray-300">Window Capture</strong> in OBS, apply the{" "}
                        <a href="https://obsproject.com/forum/resources/composite-blur.1780/" target="_blank" rel="noopener noreferrer"
                            className="text-[--brand] underline hover:text-violet-400 transition-colors">
                            Composite Blur plugin
                        </a>{" "}
                        as a filter. Enable Streamer Mode above to blur your own screen too.
                    </p>
                </div>
            </div>
        </div>
    )
}

// ─── TopNavbar ────────────────────────────────────────────────────────────────

type TopNavbarProps = {
    children?: React.ReactNode
}

export function TopNavbar(props: TopNavbarProps) {

    const {
        children,
        ...rest
    } = props

    const serverStatus = useServerStatus()
    const isOffline = serverStatus?.isOffline
    const ts = useThemeSettings()
    const [isStreamerMode, setStreamerMode] = useAtom(streamerModeAtom)

    // Keyboard shortcut: press S to toggle streamer mode (when not in an input)
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName
            if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return
            if (e.key === "s" || e.key === "S") {
                setStreamerMode(p => !p)
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [setStreamerMode])

    return (
        <>
            <GlobalQuickSearch />
            <div
                data-top-navbar
                className={cn(
                    "w-full h-[5rem] relative overflow-hidden flex items-center",
                    (ts.hideTopNavbar || __isDesktop__) && "lg:hidden",
                )}
            >
                <div
                    data-top-navbar-content-container
                    className="relative z-10 px-4 w-full flex flex-row md:items-center overflow-x-auto overflow-y-hidden"
                >
                    <div data-top-navbar-content className="flex items-center w-full gap-3 z-[90]" style={{ WebkitAppRegion: "no-drag" } as any}>
                        <AppSidebarTrigger />
                        {!isOffline ? <TopMenu /> : <OfflineTopMenu />}
                        <PlaybackManagerProgressTrackingButton />
                        <ManualProgressTrackingButton />
                        <MissingEpisodesBadge />
                        <div data-top-navbar-content-separator className="flex flex-1"></div>
                        <PluginSidebarTray place="top" />
                        <Modal
                            title="Streamer & OBS Settings"
                            trigger={
                                <IconButton
                                    id="streamer-mode-btn"
                                    icon={isStreamerMode ? <LuEyeOff /> : <LuEye />}
                                    intent={isStreamerMode ? "primary" : "white-subtle"}
                                    size="md"
                                />
                            }
                        >
                            <StreamerModalContent isStreamerMode={isStreamerMode} setStreamerMode={setStreamerMode} />
                        </Modal>
                        {!isOffline && <ChapterDownloadsButton />}
                        {/*{!isOffline && <RefreshAnilistButton />}*/}
                    </div>
                </div>
                <LayoutHeaderBackground />
            </div>
        </>
    )
}


type SidebarNavbarProps = {
    isCollapsed: boolean
    handleExpandSidebar: () => void
    handleUnexpandedSidebar: () => void
}

export function SidebarNavbar(props: SidebarNavbarProps) {

    const {
        isCollapsed,
        handleExpandSidebar,
        handleUnexpandedSidebar,
        ...rest
    } = props

    const serverStatus = useServerStatus()
    const ts = useThemeSettings()
    const pathname = usePathname()

    const openDownloadQueue = useSetAtom(__manga_chapterDownloadsDrawerIsOpenAtom)
    const isMangaPage = pathname.startsWith("/manga")

    if (!ts.hideTopNavbar && !__isDesktop__) return null

    return (
        <div data-sidebar-navbar className="flex flex-col gap-1">
            {!serverStatus?.isOffline && <VerticalMenu
                data-sidebar-navbar-vertical-menu
                className="px-4"
                collapsed={isCollapsed}
                itemClass="relative"
                onMouseEnter={handleExpandSidebar}
                onMouseLeave={handleUnexpandedSidebar}
                isSidebar
                items={[
                    ...(isMangaPage ? [
                        {
                            iconType: LuFolderDown,
                            name: "Manga Downloads",
                            onClick: () => {
                                openDownloadQueue(true)
                            },
                        },
                    ] : []),
                ]}
            />}
            <div data-sidebar-navbar-playback-manager-progress-tracking-button className="flex justify-center">
                <PlaybackManagerProgressTrackingButton asSidebarButton />
            </div>
            <div data-sidebar-navbar-manual-progress-tracking-button className="flex justify-center">
                <ManualProgressTrackingButton asSidebarButton />
            </div>
        </div>
    )
}
