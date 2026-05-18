import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { atom, useAtom } from "jotai"
import React from "react"
import { useTutorialTours } from "./tutorial-manager"

export const tutorialModalOpenAtom = atom(false)

export function TutorialModal() {
    const [open, setOpen] = useAtom(tutorialModalOpenAtom)
    const { startWatchPartyTour, startGesturesTour } = useTutorialTours()

    return (
        <Modal
            open={open}
            onOpenChange={setOpen}
            title="Help & Tutorials"
            contentClass="max-w-2xl bg-[--background] z-[200]"
            overlayClass="z-[190]"
        >
            <div className="space-y-6">
                <div className="p-4 border border-[--border] rounded-md bg-[--paper]">
                    <h3 className="text-lg font-bold mb-2">Watch Party</h3>
                    <p className="text-sm text-[--muted] mb-4">
                        Learn how to create a room, invite friends, and sync playback so you can watch together.
                    </p>
                    <Button intent="primary-subtle" onClick={() => { setOpen(false); startWatchPartyTour(); }}>
                        Watch Party Tutorial
                    </Button>
                </div>
                <div className="p-4 border border-[--border] rounded-md bg-[--paper]">
                    <h3 className="text-lg font-bold mb-2">Mobile Gestures</h3>
                    <p className="text-sm text-[--muted] mb-4">
                        Discover hidden mobile gestures like double-tapping to skip forward or backward.
                    </p>
                    <Button intent="primary-subtle" onClick={() => { setOpen(false); startGesturesTour(); }}>
                        Gestures Tutorial
                    </Button>
                </div>
                <div className="p-4 border border-[--border] rounded-md bg-[--paper]">
                    <h3 className="text-lg font-bold mb-2">Custom Sources</h3>
                    <p className="text-sm text-[--muted]">
                        Custom sources can be added by navigating to the <strong>Extensions</strong> tab and installing the appropriate plugins. This feature is currently documented in our extended knowledge base.
                    </p>
                </div>
            </div>
        </Modal>
    )
}
