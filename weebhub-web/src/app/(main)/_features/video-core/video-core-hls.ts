import { vc_audioManager } from "@/app/(main)/_features/video-core/video-core"
import { vc_autoPlayVideoAtom } from "@/app/(main)/_features/video-core/video-core.atoms"
import { logger } from "@/lib/helpers/debug"
import Hls, { ErrorData, Events, Level } from "hls.js"
import { atom, useAtomValue } from "jotai"
import { useAtom, useSetAtom } from "jotai/react"
import React, { useEffect, useRef } from "react"
import { toast } from "sonner"

export interface HlsQualityLevel {
    index: number
    height: number
    width: number
    bitrate: number
    name: string
}

export interface HlsAudioTrack {
    id: number
    name: string
    language?: string
    default?: boolean
}

export const vc_hlsQualityLevels = atom<HlsQualityLevel[]>([])
export const vc_hlsCurrentQuality = atom<number>(-1)
export const vc_hlsSetQuality = atom<((level: number) => void) | null>(null)
export const vc_hlsAudioTracks = atom<HlsAudioTrack[]>([])
export const vc_hlsCurrentAudioTrack = atom<number>(-1)
export const vc_hlsSetAudioTrack = atom<((trackId: number) => void) | null>(null)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const hlsLog = logger("VIDEO CORE HLS")


export const HLS_VIDEO_EXTENSIONS = /\.(m3u8)($|\?)/i

export function isHLSSrc(src: string): boolean {
    return HLS_VIDEO_EXTENSIONS.test(src)
}

export const NATIVE_VIDEO_EXTENSIONS = /\.(mp4|avi|3gp|ogg)($|\?)/i

export function isNativeVideoExtension(src: string): boolean {
    return NATIVE_VIDEO_EXTENSIONS.test(src)
}

export function useVideoCoreHls({
    videoElement,
    streamUrl,
    streamType,
    headers,
    onFatalError,
    onStalled,
    onMediaDetached,
}: {
    videoElement: HTMLVideoElement | null
    streamUrl: string | undefined
    streamType?: string
    headers?: Record<string, string>
    onMediaDetached?: () => void
    onFatalError?: (error: ErrorData) => void
    onStalled?: (error: ErrorData) => void
}) {
    const hlsRef = useRef<Hls | null>(null)

    const audioManager = useAtomValue(vc_audioManager)
    const autoPlay = useAtomValue(vc_autoPlayVideoAtom)

    const [currentAudioTrack, setCurrentAudioTrack] = useAtom(vc_hlsCurrentAudioTrack)
    const setQualityLevels = useSetAtom(vc_hlsQualityLevels)
    const setCurrentQuality = useSetAtom(vc_hlsCurrentQuality)
    const setSetQuality = useSetAtom(vc_hlsSetQuality)
    const setAudioTracks = useSetAtom(vc_hlsAudioTracks)
    const setSetAudioTrack = useSetAtom(vc_hlsSetAudioTrack)

    useEffect(() => {
        if (!streamUrl || !videoElement) return

        const isHls = streamType === "hls" || isHLSSrc(streamUrl)

        if (!isHls) {
            hlsLog.info("Non-HLS stream, using native video element")
            // Cleanup HLS if it exists
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
            setQualityLevels([])
            setCurrentQuality(-1)
            setSetQuality(() => {})
            setAudioTracks([])
            setCurrentAudioTrack(-1)
            setSetAudioTrack(() => {})
            return
        }

        const isMobilePlatform = typeof navigator !== "undefined" && /android|iphone|ipad/i.test(navigator.userAgent)
        
        // Only use native playback on iOS if no headers are required (native doesn't support custom headers)
        if (isMobilePlatform && videoElement.canPlayType("application/vnd.apple.mpegurl") && !headers) {
            hlsLog.info("Native HLS support detected on mobile (no auth headers), using native playback")
            videoElement.crossOrigin = "anonymous"
            videoElement.src = streamUrl
            videoElement.playsInline = true
            videoElement.preload = "auto"
            setQualityLevels([])
            setCurrentQuality(-1)
            setSetQuality(() => {})
            setAudioTracks([])
            setCurrentAudioTrack(-1)
            setSetAudioTrack(() => {})
            return
        } else if (isMobilePlatform && headers) {
            hlsLog.info("Mobile platform with auth headers detected - using HLS.js for header support")
        }

        if (Hls.isSupported()) {
            hlsLog.info("HLS.js supported, initializing HLS instance")

            // Destroy existing instance
            if (hlsRef.current) {
                hlsRef.current.destroy()
            }

            // Create new HLS instance with mobile-optimized config
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: isMobilePlatform ? false : false,
                backBufferLength: isMobilePlatform ? 30 : 90,
                maxBufferLength: isMobilePlatform ? 60 : 120,
                maxMaxBufferLength: isMobilePlatform ? 120 : 600,
                enableWebVTT: true,
                renderTextTracksNatively: false,
                fetchSetup: (context, initParams) => {
                    if (headers && context.url) {
                        for (const [key, value] of Object.entries(headers)) {
                            initParams.headers = initParams.headers || {}
                            initParams.headers[key] = value
                        }
                    }
                    return initParams
                },
                xhrSetup: (xhr, url) => {
                    if (headers) {
                        for (const [key, value] of Object.entries(headers)) {
                            xhr.setRequestHeader(key, value)
                        }
                    }
                }
            })

            hlsRef.current = hls

            // Quality setter function
            const qualitySetter = (levelIndex: number) => {
                if (!hls) return
                hlsLog.info("Setting quality level to", levelIndex)
                hls.currentLevel = levelIndex
                setCurrentQuality(levelIndex)
            }
            setSetQuality(() => qualitySetter)

            // Audio track setter function
            const audioTrackSetter = (trackId: number) => {
                if (!hls) return
                hlsLog.info("Setting audio track to", trackId)
                hls.audioTrack = trackId
                setCurrentAudioTrack(trackId)
            }
            setSetAudioTrack(() => audioTrackSetter)

            // Attach media element
            hls.attachMedia(videoElement)

            hls.on(Events.MEDIA_ATTACHED, () => {
                hlsLog.info("HLS media attached")
                hls.loadSource(streamUrl)
            })

            hls.on(Events.MEDIA_DETACHED, () => {
                hlsLog.info("HLS media detached")
                onMediaDetached?.()
            })

            hls.on(Events.MANIFEST_PARSED, (event, data) => {
                hlsLog.info("HLS manifest parsed", data)

                // Extract quality levels
                const levels: HlsQualityLevel[] = data.levels.map((level: Level, index: number) => ({
                    index,
                    height: level.height,
                    width: level.width,
                    bitrate: level.bitrate,
                    name: level.height ? `${level.height}p` : `Level ${index + 1}`,
                }))

                setQualityLevels(levels)
                setCurrentQuality(hls.currentLevel)

                // Extract audio tracks
                if (data.audioTracks && data.audioTracks.length > 0) {
                    hlsLog.info("Raw audio tracks from HLS", data.audioTracks)

                    // Deduplicate audio tracks
                    const uniqueTracks = new Map<string, { track: any, index: number }>()

                    data.audioTracks.forEach((track: any, index: number) => {
                        const key = `${track.id ?? index}-${track.groupId || ""}-${track.lang || "unknown"}-${track.name || ""}-${track.audioCodec || ""}`

                        // Keep the first occurrence of each unique track
                        if (!uniqueTracks.has(key)) {
                            uniqueTracks.set(key, { track, index })
                        }
                    })

                    const audioTracks: HlsAudioTrack[] = Array.from(uniqueTracks.values()).map(({ track, index }) => ({
                        id: typeof track.id === "number" ? track.id : index,
                        name: track.name || track.lang || `Track ${track.id}`,
                        language: track.lang,
                        default: track.default,
                    }))

                    hlsLog.info("Audio tracks", audioTracks)
                    setAudioTracks(audioTracks)
                    setCurrentAudioTrack(hls.audioTrack)
                } else {
                    setAudioTracks([])
                    setCurrentAudioTrack(-1)
                }

                if (autoPlay) {
                    videoElement.play().catch(err => {
                        hlsLog.error("Failed to autoplay", err)
                    })
                }
            })

            hls.on(Events.LEVEL_SWITCHED, (event, data) => {
                hlsLog.info("Quality level switched to", data.level)
                setCurrentQuality(hls.currentLevel)
            })

            hls.on(Events.AUDIO_TRACK_SWITCHED, (event, data) => {
                hlsLog.info("Audio track switched to", data.id)
                setCurrentAudioTrack(hls.audioTrack)
            })

            hls.on(Events.ERROR, (event, data: ErrorData) => {
                hlsLog.error("HLS error", {
                    type: data.type,
                    details: data.details,
                    error: data.error?.message,
                    fatal: data.fatal,
                })
                
                if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR || data.details === Hls.ErrorDetails.BUFFER_NUDGE_ON_STALL) {
                    hlsLog.warn("Buffer stalled, attempting to recover")
                    onStalled?.(data)
                }
                
                if (data.fatal) {
                    hlsLog.error("Fatal HLS error, attempting recovery")
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hlsLog.error("Fatal network error, restarting load")
                            hls.startLoad()
                            break
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hlsLog.error("Fatal media error, attempting recovery")
                            hls.recoverMediaError()
                            break
                        default:
                            hlsLog.error("Unrecoverable error, destroying HLS")
                            hls.destroy()
                            onFatalError?.(data)
                    }
                }
            })

            return () => {
                if (hlsRef.current) {
                    hlsLog.info("Destroying HLS instance")
                    hlsRef.current.destroy()
                    hlsRef.current = null
                }
            }
        } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
            hlsLog.info("Native HLS support detected, using native playback (with headers support caveat)")
            videoElement.crossOrigin = "anonymous"
            videoElement.src = streamUrl
            videoElement.playsInline = true
            videoElement.preload = "auto"
            setQualityLevels([])
            setCurrentQuality(-1)
            setSetQuality(() => {})
            setAudioTracks([])
            setCurrentAudioTrack(-1)
            setSetAudioTrack(() => {})
        } else {
            hlsLog.error("HLS not supported on this browser")
            toast.error("HLS playback not supported on this browser")
        }
    }, [streamUrl, videoElement, streamType, headers])


    // Update audio manager when HLS audio track changes
    React.useEffect(() => {
        if (audioManager && currentAudioTrack !== -1) {
            audioManager.onHlsTrackChange?.(currentAudioTrack)
        }
    }, [currentAudioTrack, audioManager])
}

export const HLSMimeTypes = ["application/vnd.apple.mpegurl", "audio/mpegurl", "audio/x-mpegurl", "application/x-mpegurl", "video/x-mpegurl",
    "video/mpegurl", "application/mpegurl"]

export async function isProbablyHls(url: string): Promise<"hls" | "unknown"> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(url, {
            method: "HEAD",
            cache: "no-store",
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            console.warn(`Request for URL failed: ${response.status}`)
            return "unknown"
        }

        const contentType = response.headers.get("Content-Type")?.toLowerCase()

        if (contentType && HLSMimeTypes.includes(contentType)) {
            return "hls"
        }

        return "unknown"
    }
    catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            console.warn("Request timed out")
        } else {
            console.error("Error detecting stream type:", error)
        }
        return "unknown"
    }
}
