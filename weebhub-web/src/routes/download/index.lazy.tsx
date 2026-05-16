import Page from "@/app/download/page"

import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/download/")({
    component: Page,
})
