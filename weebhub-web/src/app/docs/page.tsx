import { __publicBasePath__ } from "@/types/constants"
import React from "react"
import { LuBookOpen, LuDownload, LuExternalLink, LuFolder, LuPlay, LuServer, LuSmartphone, LuTerminal } from "react-icons/lu"
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
    "Install the Discord desktop app, then sign in to the Discord account you want WeebHub to use.",
    "Keep Discord open in the background. Browser-only Discord will not connect to Rich Presence.",
    "Start WeebHub with go run main.go and open http://127.0.0.1:43211.",
    "Open Settings, then Discord.",
    "Turn on Enable, then turn on Anime and Manga. Discord may ask you to authorize or trust the activity.",
    "Leave Hide GitHub Repo Button turned off so your Discord activity shows the WeebHub repository link.",
]

const discordAccountTips = [
    "Use the same computer for Discord and WeebHub.",
    "Make sure Discord shows your account as online, idle, or do-not-disturb, not fully closed.",
    "If nothing shows, quit Discord completely, open it again, then restart WeebHub.",
]

const androidSteps = [
    {
        title: "Start WeebHub for your Wi-Fi",
        body: "Run this on the computer that has your media files.",
        command: "go run main.go --host 0.0.0.0",
    },
    {
        title: "Find your computer IP",
        body: "Use the command for your computer, then copy the LAN IP.",
        command: "macOS: ipconfig getifaddr en0\nWindows: ipconfig\nLinux: hostname -I",
    },
    {
        title: "Open it on Android",
        body: "On your phone, use the same Wi-Fi network and open this address.",
        command: "http://YOUR-COMPUTER-IP:43211",
    },
]

const pagesSteps = [
    "Open the repository on GitHub.",
    "Go to Settings, then Pages.",
    "Set Source to Deploy from a branch.",
    "Choose the gh-pages branch and the / root folder.",
    "Save, then wait a minute and open https://binifn.github.io/WeebHub/.",
]

export default function Page() {
    const docsHref = `${__publicBasePath__}/docs`
    const downloadHref = `${__publicBasePath__}/download`
    const logoSrc = `${__publicBasePath__}/weebhub-logo-v2.png`

    return (
        <main className="min-h-screen bg-[#07070a] text-white">
            <section className="border-b border-white/10">
                <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
                    <nav className="flex items-center justify-between gap-4">
                        <a href={docsHref} className="flex items-center gap-3">
                            <img src={logoSrc} alt="WeebHub" className="size-11 rounded-lg" />
                            <span className="text-lg font-bold">WeebHub Docs</span>
                        </a>

                        <div className="flex items-center gap-2 text-sm">
                            <a href={downloadHref} className="rounded-md border border-white/15 px-3 py-2 text-gray-200 hover:border-white/30 hover:text-white">
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
                                    WeebHub is a local media server with a browser app for managing anime and manga. Desktop builds are published through GitHub Releases, and the local web app runs from your terminal.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <a href="#quick-start" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-bold text-black hover:bg-gray-200">
                                    <LuPlay />
                                    Start tutorial
                                </a>
                                <a href={downloadHref} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-3 text-sm font-bold text-white hover:border-white/35">
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

            <section id="android-local" className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10">
                <div className="mb-6 flex items-center gap-3">
                    <LuSmartphone className="text-3xl text-violet-200" />
                    <div>
                        <h2 className="text-2xl font-black sm:text-3xl">Open From Android</h2>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-400">
                            No APK is needed for this path. Start the server on your computer, then open WeebHub from your Android browser on the same Wi-Fi.
                        </p>
                    </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                    {androidSteps.map((step, index) => (
                        <article key={step.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                            <span className="mb-4 inline-flex size-8 items-center justify-center rounded-md bg-violet-400 text-sm font-black text-black">
                                {index + 1}
                            </span>
                            <h3 className="text-lg font-bold">{step.title}</h3>
                            <p className="mt-2 min-h-12 text-sm leading-6 text-gray-400">{step.body}</p>
                            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md bg-black/60 p-3 text-sm text-violet-100">
                                <code>{step.command}</code>
                            </pre>
                        </article>
                    ))}
                </div>
                <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
                    If your phone cannot connect, allow WeebHub through your computer firewall and make sure both devices are on the same Wi-Fi network.
                </p>
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
                    <div className="mt-5 rounded-md border border-violet-300/15 bg-violet-300/10 p-4">
                        <h3 className="text-sm font-bold text-violet-100">Connect your Discord account</h3>
                        <ul className="mt-3 grid gap-2 text-sm leading-6 text-gray-300 md:grid-cols-3">
                            {discordAccountTips.map((tip) => (
                                <li key={tip} className="rounded-md bg-black/25 p-3">{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section id="github-pages" className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <h2 className="text-2xl font-black">GitHub Pages 404 Fix</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
                        The deploy workflow publishes the site to the <span className="font-mono text-gray-100">gh-pages</span> branch. If GitHub shows “There is not a GitHub Pages site here,” enable Pages once in the repository settings.
                    </p>
                    <ol className="mt-5 grid gap-3 md:grid-cols-2">
                        {pagesSteps.map((step, index) => (
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
                    <p>Desktop apps for Windows, macOS, and Linux are published from GitHub Releases when a desktop release tag runs.</p>
                    <a href="https://github.com/BiniFn/WeebHub" target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 text-violet-200 hover:text-white">
                        View the project on GitHub
                        <LuExternalLink />
                    </a>
                </div>
            </section>
        </main>
    )
}
