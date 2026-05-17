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
import { usePathname } from "@/lib/navigation"
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
    const mediaMatch = pathname.match(/\/entry\/(\d+)/)
    const mediaId = mediaMatch ? Number(mediaMatch[1]) : undefined

    const port = typeof window !== "undefined" ? window.location.port || "43211" : "43211"
    const obsUrl = `http://localhost:${port}/obs?theme=${obsTheme}&position=${obsPos}`

    const handleCopy = () => {
        navigator.clipboard?.writeText(obsUrl).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <div className="space-y-6">
            {/* Streamer Mode toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
                <div>
                    <p className="font-semibold text-white">Streamer Mode</p>
                    <p className="text-xs text-gray-400 mt-0.5">Blurs covers & sensitive content on your screen</p>
                </div>
                <Button
                    intent={isStreamerMode ? "primary" : "white-subtle"}
                    onClick={() => setStreamerMode(p => !p)}
                >
                    {isStreamerMode ? "ON" : "OFF"}
                </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
                <LuKeyboard className="text-base" />
                Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300 font-mono text-xs">S</kbd> anywhere to toggle quickly
            </div>

            {/* Anime Intel Panel */}
            <div className="space-y-4 pt-2 border-t border-white/5">
                <div>
                    <h3 className="font-bold text-base text-white">Streamer Intel</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Live countdowns, leaks, and trusted links for the anime you're currently viewing.
                    </p>
                </div>
                <AnimeIntelPanel mediaId={mediaId} />
            </div>

            {/* OBS Section */}
            <div className="space-y-4 pt-2 border-t border-white/5">
                <div>
                    <h3 className="font-bold text-base text-white">OBS Overlay</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        A "Now Playing" widget for your stream. Customize it below, then copy the URL into OBS.
                    </p>
                </div>

                {/* Theme picker */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Theme</p>
                    <div className="grid grid-cols-5 gap-2">
                        {OBS_THEMES.map(t => (
                            <button
                                key={t.id}
                                id={`obs-theme-${t.id}`}
                                onClick={() => setObsTheme(t.id)}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer text-center",
                                    obsTheme === t.id
                                        ? "border-[--brand] bg-[--brand]/10 text-white"
                                        : "border-white/5 bg-black/20 text-gray-400 hover:border-white/15 hover:text-gray-300",
                                )}
                            >
                                <span className="text-xl">{t.preview}</span>
                                <span className="text-xs font-semibold leading-none">{t.label}</span>
                                <span className="text-[10px] text-gray-500 leading-tight">{t.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Position picker */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Position</p>
                    <div className="grid grid-cols-4 gap-2">
                        {OBS_POSITIONS.map(p => (
                            <button
                                key={p.id}
                                id={`obs-pos-${p.id}`}
                                onClick={() => setObsPos(p.id)}
                                className={cn(
                                    "flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all cursor-pointer text-center",
                                    obsPos === p.id
                                        ? "border-[--brand] bg-[--brand]/10 text-white"
                                        : "border-white/5 bg-black/20 text-gray-400 hover:border-white/15",
                                )}
                            >
                                <span className="text-lg">{p.icon}</span>
                                <span className="text-[10px] font-medium leading-tight">{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generated URL + copy */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your OBS URL</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-black/50 border border-white/8 rounded-lg px-3 py-2.5 text-[--brand] font-mono overflow-x-auto whitespace-nowrap select-all">
                            {obsUrl}
                        </code>
                        <Button
                            id="obs-copy-url-btn"
                            intent={copied ? "success" : "white-subtle"}
                            size="sm"
                            onClick={handleCopy}
                            leftIcon={copied ? <LuCheck /> : <LuCopy />}
                        >
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                    </div>
                </div>

                {/* Setup steps */}
                <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-1.5">
                    <p className="text-xs font-semibold text-white mb-2">How to add in OBS</p>
                    {[
                        "Click + under Sources → Browser",
                        "Paste the URL above",
                        `Set Width: ${obsTheme === "banner" ? "1920" : "500"}, Height: ${obsTheme === "banner" ? "80" : "160"}`,
                        "Check \"Refresh browser when scene becomes active\"",
                        "The widget updates automatically when you watch or read!",
                    ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                            <span className="text-[--brand] font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>

                {/* Option 2 */}
                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-xs font-semibold text-white mb-1.5">Option 2 — Full Window Blur</p>
                    <p className="text-xs text-gray-400 mb-2">
                        Add a <strong>Window Capture</strong> in OBS, then apply the{" "}
                        <a href="https://obsproject.com/forum/resources/composite-blur.1780/" target="_blank" rel="noopener noreferrer" className="text-[--brand] underline">
                            Composite Blur plugin
                        </a>
                        {" "}as a filter. Enable Streamer Mode above to blur your own screen too.
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
