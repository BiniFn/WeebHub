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
import { LuFolderDown, LuEye, LuEyeOff } from "react-icons/lu"
import { PluginSidebarTray } from "../plugin/tray/plugin-sidebar-tray"
import { IconButton, Button } from "@/components/ui/button"
import { useAtom } from "jotai"
import { streamerModeAtom } from "@/app/(main)/_atoms/streamer-mode.atoms"
import { Modal } from "@/components/ui/modal"

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

    return (
        <>
            <div
                data-top-navbar
                className={cn(
                    "w-full h-[5rem] relative overflow-hidden flex items-center",
                    (ts.hideTopNavbar || __isDesktop__) && "lg:hidden",
                    // __isDesktop__ && "absolute top-0 left-0 z-[-1]"
                )}
            >
                {/*{__isDesktop__ && (*/}
                {/*    <div*/}
                {/*        className="absolute inset-0 z-0"*/}
                {/*        style={{ WebkitAppRegion: "drag" } as any}*/}
                {/*    />*/}
                {/*)}*/}
                <div
                    data-top-navbar-content-container
                    className="relative z-10 px-4 w-full flex flex-row md:items-center overflow-x-auto overflow-y-hidden"
                    // className="relative z-10 px-4 w-full flex flex-row md:items-center overflow-x-auto overflow-y-hidden pointer-events-auto"

                >
                    <div data-top-navbar-content className="flex items-center w-full gap-3 z-[90]" style={{ WebkitAppRegion: "no-drag" } as any}>
                        <AppSidebarTrigger />
                        {!isOffline ? <TopMenu /> : <OfflineTopMenu />}
                        <PlaybackManagerProgressTrackingButton />
                        <ManualProgressTrackingButton />
                        <div data-top-navbar-content-separator className="flex flex-1"></div>
                        <PluginSidebarTray place="top" />
                        <Modal
                            title="Streamer Mode"
                            trigger={
                                <IconButton 
                                    icon={isStreamerMode ? <LuEyeOff /> : <LuEye />} 
                                    intent={isStreamerMode ? "primary" : "white-subtle"} 
                                    size="md" 
                                />
                            }
                        >
                            <div className="space-y-4">
                                <p className="text-gray-300">
                                    Streamer Mode blurs sensitive images and video covers so you can safely broadcast your screen. 
                                </p>
                                
                                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">Enable Streamer Mode</span>
                                        <Button 
                                            intent={isStreamerMode ? "primary" : "white-subtle"} 
                                            onClick={() => setStreamerMode(p => !p)}
                                        >
                                            {isStreamerMode ? "Enabled" : "Disabled"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-6">
                                    <h3 className="font-bold text-lg text-brand-300">OBS Streamer Setup</h3>
                                    <p className="text-sm text-gray-400">Pick one of the two methods to stream WeebHub safely:</p>
                                    
                                    <div className="mt-4 space-y-4">
                                        <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                                            <h4 className="font-semibold mb-1 text-white">Option 1 — "Now Playing" Overlay <span className="text-xs text-green-400 ml-1">(Recommended)</span></h4>
                                            <p className="text-sm text-gray-400 mb-3">
                                                Adds a beautiful widget to your stream showing what you're watching, with the cover art automatically blurred. Your main screen stays completely normal.
                                            </p>
                                            <ol className="list-decimal pl-5 text-sm text-gray-300 space-y-2">
                                                <li>In OBS, click <strong>+</strong> under Sources → <strong>Browser</strong></li>
                                                <li>
                                                    Set URL to:{" "}
                                                    <code
                                                        className="bg-black/60 px-2 py-0.5 rounded text-brand-300 cursor-pointer select-all"
                                                        onClick={() => navigator.clipboard?.writeText("http://localhost:43211/obs")}
                                                        title="Click to copy"
                                                    >
                                                        http://localhost:43211/obs
                                                    </code>
                                                </li>
                                                <li>Set Width: <strong>500</strong>, Height: <strong>160</strong></li>
                                                <li>Check <strong>"Refresh browser when scene becomes active"</strong></li>
                                                <li>Click OK — the widget appears automatically when you play anime!</li>
                                            </ol>
                                        </div>

                                        <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                                            <h4 className="font-semibold mb-1 text-white">Option 2 — Full Window Blur</h4>
                                            <p className="text-sm text-gray-400 mb-3">
                                                Streams the entire WeebHub window blurred in OBS. Requires the{" "}
                                                <a
                                                    href="https://obsproject.com/forum/resources/composite-blur.1780/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-brand-300 underline"
                                                >
                                                    Composite Blur plugin
                                                </a>{" "}
                                                for OBS.
                                            </p>
                                            <ol className="list-decimal pl-5 text-sm text-gray-300 space-y-2">
                                                <li>Install the <a href="https://obsproject.com/forum/resources/composite-blur.1780/" target="_blank" rel="noopener noreferrer" className="text-brand-300 underline">Composite Blur plugin</a></li>
                                                <li>In OBS, add a <strong>Window Capture</strong> source and select your WeebHub window</li>
                                                <li>Right-click the source → <strong>Filters</strong> → add <strong>Composite Blur</strong></li>
                                                <li>Enable Streamer Mode above so your personal screen is also blurred</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>

                            </div>
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
            {/*<div data-sidebar-navbar-spacer className="px-4 lg:py-1">*/}
            {/*    <Separator className="px-4" />*/}
            {/*</div>*/}
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
