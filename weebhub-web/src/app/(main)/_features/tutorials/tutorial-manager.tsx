import React, { useEffect, useCallback } from "react"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export const tutorialHasSeenTour = atomWithStorage("sea-has-seen-driver-tour", false, undefined, { getOnInit: true })

export function useTutorialTours() {
    const [hasSeenTour, setHasSeenTour] = useAtom(tutorialHasSeenTour)
    
    const startWatchPartyTour = useCallback(() => {
        const d = driver({
            showProgress: true,
            animate: true,
            steps: [
                { 
                    element: '[data-vc-element="watch-party-button"]', 
                    popover: { 
                        title: 'Watch Party', 
                        description: 'Click here to start a Watch Party session!' 
                    } 
                },
                { 
                    popover: { 
                        title: 'Invite Friends', 
                        description: 'Once you join a room, share the link with your friends so they can join your room.' 
                    } 
                },
            ]
        })
        d.drive()
    }, [])

    const startGesturesTour = useCallback(() => {
        const d = driver({
            showProgress: true,
            animate: true,
            steps: [
                { 
                    element: '[data-vc-element="inner-container"]', 
                    popover: { 
                        title: 'Double Tap to Seek', 
                        description: 'Double tap on the left or right side of the video to skip -10s or +10s respectively.' 
                    } 
                },
            ]
        })
        d.drive()
    }, [])

    const startOnboardingTour = useCallback(() => {
        const d = driver({
            showProgress: true,
            animate: true,
            steps: [
                { 
                    popover: { 
                        title: 'Welcome to WeebHub!', 
                        description: 'Let us show you around some of the cool features. You can always replay this tour from the Help menu.' 
                    } 
                },
                {
                    element: '#streamer-mode-btn',
                    popover: {
                        title: 'Streamer Mode & OBS',
                        description: 'Streaming to friends or on Twitch? Click here to enable Streamer Mode to blur sensitive content, and set up your OBS "Now Playing" overlay.'
                    }
                },
                {
                    element: '#help-tutorials-btn',
                    popover: {
                        title: 'Help & Tutorials',
                        description: 'If you ever get lost or want to replay a tutorial (like Watch Party or Mobile Gestures), you can always find them here!'
                    }
                },
                { 
                    popover: { 
                        title: 'Quick Search', 
                        description: 'Pro Tip: Press the "/" key anywhere in the app to instantly open the global search bar!' 
                    } 
                },
            ],
            onDestroyStarted: () => {
                setHasSeenTour(true)
                d.destroy()
            }
        })
        d.drive()
    }, [setHasSeenTour])
    
    return { 
        hasSeenTour,
        startOnboardingTour,
        startWatchPartyTour,
        startGesturesTour,
    }
}
