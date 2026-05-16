import React from "react"
import { LuBookOpen, LuDownload, LuExternalLink, LuFolder, LuPlay, LuServer, LuTerminal } from "react-icons/lu"
import { FaDiscord } from "react-icons/fa"

const quickStartSteps = [
    {
        title: "Clone WeebHub",
        body: "Get the project on your machine.",
        command: "git clone https://github.com/BiniFn/WeebHub.git",
    },
    {
        title: "Enter the folder",
        body: "Run the remaining commands from the project root.",
        command: "cd WeebHub",
    },
    {
        title: "Start the local web app",
        body: "This runs the WeebHub server and opens the web app from your browser.",
        command: "go run main.go",
    },
]

const setupCards = [
    {
        icon: LuServer,
        title: "Server",
        text: "The Go server runs locally on your computer and serves the WeebHub web app.",
    },
    {
        icon: LuFolder,
        title: "Library",
        text: "After the app opens, choose the folder where your anime or manga files live.",
    },
    {
        icon: LuBookOpen,
        title: "Use",
        text: "Scan your library, browse entries, and watch or read from the local web interface.",
    },
]

const discordSteps = [
    "Open Discord on the same computer as WeebHub.",
    "Start WeebHub with go run main.go and open http://127.0.0.1:43211.",
    "Open Settings, then Discord.",
    "Turn on Enable, then turn on Anime and Manga.",
    "Leave Hide GitHub Repo Button turned off so your Discord activity shows the WeebHub repository link.",
]

export default function Page() {
    return (
        <main className="min-h-screen bg-[#07070a] text-white">
            <section className="border-b border-white/10">
                <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
                    <nav className="flex items-center justify-between gap-4">
                        <a href="/" className="flex items-center gap-3">
                            <img src="/weebhub-logo.png" alt="WeebHub" className="size-11 rounded-lg" />
                            <span className="text-lg font-bold">WeebHub Docs</span>
                        </a>

                        <div className="flex items-center gap-2 text-sm">
                            <a href="/download" className="rounded-md border border-white/15 px-3 py-2 text-gray-200 hover:border-white/30 hover:text-white">
                                Download
                            </a>
                            <a
                                href="https://github.com/BiniFn/WeebHub"
                                target="_blank"
                                rel="noreferrer"
                                className="hidden rounded-md border border-white/15 px-3 py-2 text-gray-200 hover:border-white/30 hover:text-white sm:inline-flex"
                            >
                                GitHub
                            </a>
                        </div>
                    </nav>

                    <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_.9fr]">
                        <div className="space-y-6">
                            <p className="inline-flex items-center rounded-md border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-sm font-semibold text-violet-100">
                                Local web app available now
                            </p>
                            <div className="space-y-4">
                                <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                                    Run WeebHub on your computer.
                                </h1>
                                <p className="max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                                    WeebHub is a local media server with a browser app for managing anime and manga. Desktop installers are coming soon; for now, run the server from your terminal.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <a href="#quick-start" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-bold text-black hover:bg-gray-200">
                                    <LuPlay />
                                    Start tutorial
                                </a>
                                <a href="/download" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-3 text-sm font-bold text-white hover:border-white/35">
                                    <LuDownload />
                                    Download options
                                </a>
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-black/40 p-4 shadow-2xl shadow-violet-950/30">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
                                <LuTerminal />
                                Terminal
                            </div>
                            <pre className="overflow-x-auto rounded-md bg-[#0d0d12] p-4 text-sm leading-7 text-violet-100">
                                <code>{`git clone https://github.com/BiniFn/WeebHub.git
cd WeebHub
go run main.go`}</code>
                            </pre>
                            <p className="mt-4 text-sm leading-6 text-gray-400">
                                Then open <span className="font-mono text-gray-100">http://127.0.0.1:43211</span> in your browser.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="quick-start" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-10">
                <div className="mb-6 flex flex-col gap-2">
                    <h2 className="text-2xl font-black sm:text-3xl">Quick Start</h2>
                    <p className="max-w-2xl text-gray-400">Use these commands to run WeebHub as a local web app.</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {quickStartSteps.map((step, index) => (
                        <article key={step.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                            <span className="mb-4 inline-flex size-8 items-center justify-center rounded-md bg-violet-400 text-sm font-black text-black">
                                {index + 1}
                            </span>
                            <h3 className="text-lg font-bold">{step.title}</h3>
                            <p className="mt-2 min-h-12 text-sm leading-6 text-gray-400">{step.body}</p>
                            <pre className="mt-4 overflow-x-auto rounded-md bg-black/60 p-3 text-sm text-violet-100">
                                <code>{step.command}</code>
                            </pre>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-12 sm:px-8 lg:grid-cols-3 lg:px-10">
                {setupCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <article key={card.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                            <Icon className="mb-4 text-2xl text-violet-200" />
                            <h3 className="text-lg font-bold">{card.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-gray-400">{card.text}</p>
                        </article>
                    )
                })}
            </section>

            <section id="discord-rich-presence" className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <FaDiscord className="text-3xl text-violet-200" />
                        <div>
                            <h2 className="text-2xl font-black">Discord Rich Presence</h2>
                            <p className="mt-1 text-sm text-gray-400">Show what you are watching or reading, with a button that links to the WeebHub GitHub repo.</p>
                        </div>
                    </div>
                    <ol className="grid gap-3 md:grid-cols-2">
                        {discordSteps.map((step, index) => (
                            <li key={step} className="flex gap-3 rounded-md bg-black/35 p-3 text-sm leading-6 text-gray-300">
                                <span className="flex size-7 flex-none items-center justify-center rounded-md bg-violet-400 text-xs font-black text-black">{index + 1}</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="border-t border-white/10">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-gray-400 sm:px-8 lg:px-10">
                    <p>Desktop apps for Windows, macOS, and Linux are coming soon.</p>
                    <a href="https://github.com/BiniFn/WeebHub" target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 text-violet-200 hover:text-white">
                        View the project on GitHub
                        <LuExternalLink />
                    </a>
                </div>
            </section>
        </main>
    )
}
