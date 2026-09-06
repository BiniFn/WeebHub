import { atomWithStorage } from "jotai/utils"
import React from "react"
import { useAtom } from "jotai"

export const streamerModeAtom = atomWithStorage<boolean>("sea-streamer-mode", false)
export const streamerModeShortcutAtom = atomWithStorage<string>("weebhub-streamer-mode-shortcut", "S")

export function useStreamerModeEffect() {
    const [isStreamerMode, setIsStreamerMode] = useAtom(streamerModeAtom)
    
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            // Automatically enable streamer mode when loaded in OBS Browser Source
            if (window.navigator.userAgent.includes("OBS") || window.navigator.userAgent.includes("OBSBrowser")) {
                setIsStreamerMode(true)
            }
        }
    }, [setIsStreamerMode])

    React.useEffect(() => {
        if (typeof document === "undefined") return
        if (isStreamerMode) {
            document.body.classList.add("sea-streamer-mode")
        } else {
            document.body.classList.remove("sea-streamer-mode")
        }
    }, [isStreamerMode])
}
