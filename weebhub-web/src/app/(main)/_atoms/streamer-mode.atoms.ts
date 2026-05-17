import { atomWithStorage } from "jotai/utils"
import React from "react"
import { useAtomValue } from "jotai"

export const streamerModeAtom = atomWithStorage<boolean>("sea-streamer-mode", false)

export function useStreamerModeEffect() {
    const isStreamerMode = useAtomValue(streamerModeAtom)
    
    React.useEffect(() => {
        if (typeof document === "undefined") return
        if (isStreamerMode) {
            document.body.classList.add("sea-streamer-mode")
        } else {
            document.body.classList.remove("sea-streamer-mode")
        }
    }, [isStreamerMode])
}
