import React from "react"
import { VideoCore_VideoPlaybackInfo } from "@/api/generated/types"

export function ObsOverlayPage() {
    const [playbackInfo, setPlaybackInfo] = React.useState<VideoCore_VideoPlaybackInfo | null>(null)

    React.useEffect(() => {
        if (typeof window === "undefined") return
        
        // Make the body transparent for OBS
        document.body.style.backgroundColor = "transparent"
        document.documentElement.style.backgroundColor = "transparent"

        const channel = new BroadcastChannel("weebhub-obs-overlay")
        
        // Ask for current state if we just loaded
        channel.postMessage({ type: "REQUEST_PLAYBACK_STATE" })

        channel.onmessage = (event) => {
            if (event.data?.type === "PLAYBACK_UPDATE") {
                setPlaybackInfo(event.data.data)
            } else if (event.data?.type === "PLAYBACK_CLEARED") {
                setPlaybackInfo(null)
            }
        }

        return () => {
            channel.close()
            document.body.style.backgroundColor = ""
            document.documentElement.style.backgroundColor = ""
        }
    }, [])

    if (!playbackInfo) {
        return null // Show nothing if nothing is playing
    }

    const { media, episode } = playbackInfo
    
    if (!media) return null

    return (
        <div className="fixed bottom-8 left-8 flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl overflow-hidden max-w-[500px] animate-in slide-in-from-bottom-10 fade-in duration-500">
            {/* Blurred Background Glow */}
            {media.coverImage?.large && (
                <div 
                    className="absolute inset-0 opacity-30 blur-3xl z-0 scale-150"
                    style={{ backgroundImage: `url(${media.coverImage.large})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
            )}
            
            {/* Cover Image */}
            {media.coverImage?.large && (
                <div className="relative z-10 w-20 h-28 flex-shrink-0 rounded-md overflow-hidden shadow-lg border border-white/5">
                    {/* Streamer Mode Blur is applied to the image */}
                    <img 
                        src={media.coverImage.large} 
                        alt="Cover" 
                        className="w-full h-full object-cover blur-[10px]" 
                    />
                </div>
            )}
            
            {/* Details */}
            <div className="relative z-10 flex flex-col gap-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[--muted] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Now Playing
                </p>
                <h1 className="text-lg font-bold text-white truncate drop-shadow-md">
                    {media.title?.userPreferred || "Unknown Anime"}
                </h1>
                {episode && (
                    <p className="text-sm text-white/80 font-medium truncate">
                        Episode {episode.episodeNumber || playbackInfo.onlinestreamParams?.episodeNumber}
                        {episode.episodeTitle && ` - ${episode.episodeTitle}`}
                    </p>
                )}
                {!episode && playbackInfo.onlinestreamParams?.episodeNumber && (
                    <p className="text-sm text-white/80 font-medium truncate">
                        Episode {playbackInfo.onlinestreamParams.episodeNumber}
                    </p>
                )}
            </div>
        </div>
    )
}
