import React from "react"
import { LuApple, LuDownload, LuExternalLink, LuMonitor, LuTerminal } from "react-icons/lu"
import { SiLinux } from "react-icons/si"

const platforms = [
    {
        name: "Windows app",
        icon: LuMonitor,
        status: "Coming soon",
        text: "A packaged Windows desktop app is planned.",
    },
    {
        name: "Mac app",
        icon: LuApple,
        status: "Coming soon",
        text: "A packaged macOS desktop app is planned.",
    },
    {
        name: "Linux app",
        icon: SiLinux,
        status: "Coming soon",
        text: "A packaged Linux desktop app is planned.",
    },
]

export default function Page() {
    return (
        <main className="min-h-screen bg-[#07070a] text-white">
            <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
                <nav className="mb-12 flex items-center justify-between gap-4">
                    <a href="/docs" className="flex items-center gap-3">
                        <img src="/weebhub-logo.png" alt="WeebHub" className="size-11 rounded-lg" />
                        <span className="text-lg font-bold">WeebHub Download</span>
                    </a>
                    <a href="/docs" className="rounded-md border border-white/15 px-3 py-2 text-sm text-gray-200 hover:border-white/30 hover:text-white">
                        Docs
                    </a>
                </nav>

                <div className="grid items-end gap-10 lg:grid-cols-[1fr_.9fr]">
                    <div className="space-y-5">
                        <p className="inline-flex items-center gap-2 rounded-md border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-sm font-semibold text-violet-100">
                            <LuMonitor />
                            Download
                        </p>
                        <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                            Desktop apps are coming soon.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-gray-300">
                            For now, WeebHub runs as a local web app. Start the server from your terminal, then use it from your browser at the local address.
                        </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
                            <LuTerminal />
                            Current local command
                        </div>
                        <pre className="overflow-x-auto rounded-md bg-[#0d0d12] p-4 text-sm leading-7 text-violet-100">
                            <code>{`git clone https://github.com/BiniFn/WeebHub.git
cd WeebHub
go run main.go`}</code>
                        </pre>
                    </div>
                </div>

                <div className="mt-10 grid gap-4 lg:grid-cols-3">
                    {platforms.map((platform) => {
                        const Icon = platform.icon
                        return (
                            <article key={platform.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                                <Icon className="mb-4 text-3xl text-violet-200" />
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-bold">{platform.name}</h2>
                                    <span className="rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100">
                                        {platform.status}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-gray-400">{platform.text}</p>
                            </article>
                        )
                    })}
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <a href="/docs#quick-start" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-bold text-black hover:bg-gray-200">
                        <LuDownload />
                        Run local web app
                    </a>
                    <a
                        href="https://github.com/BiniFn/WeebHub/releases"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-3 text-sm font-bold text-white hover:border-white/35"
                    >
                        GitHub releases
                        <LuExternalLink />
                    </a>
                </div>
            </section>
        </main>
    )
}
