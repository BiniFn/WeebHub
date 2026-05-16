import { __publicBasePath__ } from "@/types/constants"
import React from "react"
import { LuApple, LuDownload, LuExternalLink, LuMonitor, LuSmartphone, LuTerminal } from "react-icons/lu"
import { SiLinux } from "react-icons/si"

const androidApkUrl = "https://github.com/BiniFn/WeebHub/releases/download/android-debug-2026-05-16-3/weebhub-android-debug.apk"
const releasesUrl = "https://github.com/BiniFn/WeebHub/releases"

const platforms = [
    {
        name: "Android browser",
        icon: LuSmartphone,
        status: "Available",
        text: "Open the local WeebHub server from your Android browser on the same Wi-Fi.",
        href: "#android-local",
    },
    {
        name: "Windows app",
        icon: LuMonitor,
        status: "Release build",
        text: "The Windows installer is built by the desktop release workflow.",
        href: releasesUrl,
    },
    {
        name: "Mac app",
        icon: LuApple,
        status: "Release build",
        text: "The macOS app is built by the desktop release workflow.",
        href: releasesUrl,
    },
    {
        name: "Linux app",
        icon: SiLinux,
        status: "Release build",
        text: "The Linux AppImage is built by the desktop release workflow.",
        href: releasesUrl,
    },
]

export default function Page() {
    const docsHref = `${__publicBasePath__}/docs`
    const logoSrc = `${__publicBasePath__}/weebhub-logo.png`

    return (
        <main className="min-h-screen bg-[#07070a] text-white">
            <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
                <nav className="mb-12 flex items-center justify-between gap-4">
                    <a href={docsHref} className="flex items-center gap-3">
                        <img src={logoSrc} alt="WeebHub" className="size-11 rounded-lg" />
                        <span className="text-lg font-bold">WeebHub Download</span>
                    </a>
                    <a href={docsHref} className="rounded-md border border-white/15 px-3 py-2 text-sm text-gray-200 hover:border-white/30 hover:text-white">
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
                            Desktop apps and Android browser access.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-gray-300">
                            WeebHub can run as a local web app, open from an Android browser on your Wi-Fi, or ship as desktop builds from GitHub Releases.
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

                <div className="mt-10 grid gap-4 lg:grid-cols-4">
                    {platforms.map((platform) => {
                        const Icon = platform.icon
                        const content = (
                            <>
                                <Icon className="mb-4 text-3xl text-violet-200" />
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-bold">{platform.name}</h2>
                                    <span className="rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100">
                                        {platform.status}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-gray-400">{platform.text}</p>
                            </>
                        )

                        return (
                            <a key={platform.name} href={platform.href} className="rounded-lg border border-violet-300/25 bg-violet-300/10 p-5 hover:border-violet-200/50" rel="noreferrer">
                                {content}
                            </a>
                        )
                    })}
                </div>

                <section id="android-local" className="mt-10 rounded-lg border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <LuSmartphone className="text-2xl text-violet-200" />
                        <h2 className="text-xl font-black">Android Local Server</h2>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-gray-400">
                        Run the server on your computer, find your computer LAN IP, then open WeebHub from Chrome on Android.
                    </p>
                    <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md bg-black/60 p-4 text-sm leading-7 text-violet-100">
                        <code>{`go run main.go --host 0.0.0.0
macOS: ipconfig getifaddr en0
Windows: ipconfig
Linux: hostname -I
Android Chrome: http://YOUR-COMPUTER-IP:43211`}</code>
                    </pre>
                </section>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <a href={`${docsHref}#quick-start`} className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-bold text-black hover:bg-gray-200">
                        <LuDownload />
                        Run local web app
                    </a>
                    <a
                        href={androidApkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-3 text-sm font-bold text-white hover:border-white/35"
                    >
                        APK release file
                        <LuExternalLink />
                    </a>
                </div>
            </section>
        </main>
    )
}
