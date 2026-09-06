import { createFileRoute } from "@tanstack/react-router"
import { ObsOverlayPage } from "@/app/obs/obs-overlay-page"

export const Route = createFileRoute("/obs")({
    component: () => <ObsOverlayPage />,
})
