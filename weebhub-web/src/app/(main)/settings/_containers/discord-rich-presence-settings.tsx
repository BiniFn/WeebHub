"use client"
import { SettingsCard } from "@/app/(main)/settings/_components/settings-card"
import { cn } from "@/components/ui/core/styling"
import { Field } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { FaDiscord } from "react-icons/fa"
import { BiUnlink } from "react-icons/bi"
import { toast } from "sonner"

type DiscordAccountInfo = {
    connected: boolean
    username: string
    avatar: string
    userId: string
}

type DiscordRichPresenceSettingsProps = {
    children?: React.ReactNode
}

export function DiscordRichPresenceSettings(props: DiscordRichPresenceSettingsProps) {
    const { children, ...rest } = props
    const { watch } = useFormContext()
    const enableRichPresence = watch("enableRichPresence")

    const [account, setAccount] = useState<DiscordAccountInfo | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchAccount()
        // If we were redirected back from server-side OAuth, show feedback
        const params = new URLSearchParams(window.location.search)
        if (params.get("discord") === "connected") {
            toast.success("Discord account connected!")
            window.history.replaceState({}, document.title, window.location.pathname)
        } else if (params.get("discord") === "error") {
            toast.error("Failed to connect Discord account")
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [])

    async function fetchAccount() {
        try {
            const res = await fetch("/api/v1/discord/oauth/account")
            const json = await res.json() as { data?: DiscordAccountInfo }
            setAccount(json.data ?? null)
        } catch {
            // ignore
        }
    }

    function handleConnect() {
        // On Capacitor (Android), window.location.origin = "capacitor://localhost" — unusable.
        // Use the stored server URL instead so Discord redirects to the real server.
        import("@/api/client/server-url").then(({ getServerBaseUrl, __isCapacitorNative__ }) => {
            const origin = __isCapacitorNative__()
                ? getServerBaseUrl()                   // e.g. http://192.168.1.100:43211
                : window.location.origin               // e.g. http://localhost:43211
            const redirectUri = encodeURIComponent(origin + "/discord-callback")
            const clientId = "1224777421941899285"
            const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`

            const popup = window.open(authUrl, "discord-oauth", "width=500,height=700,menubar=no,toolbar=no")
            if (popup) {
                const timer = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(timer)
                        fetchAccount()
                    }
                }, 1000)
            } else {
                window.location.href = authUrl
            }
        })
    }

    async function handleDisconnect() {
        setLoading(true)
        try {
            await fetch("/api/v1/discord/oauth/disconnect", { method: "POST" })
            setAccount(null)
            toast.success("Discord account disconnected")
        } catch {
            toast.error("Failed to disconnect Discord account")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <SettingsCard title="Rich Presence" description="Show what you are watching or reading in Discord.">

                {/* Discord Account Connection */}
                <div className="mb-4 p-3 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30">
                    <p className="text-sm font-medium text-[--muted] mb-2">Discord Account</p>
                    {account?.connected ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {account.avatar && (
                                    <img
                                        src={account.avatar}
                                        alt={account.username}
                                        className="w-9 h-9 rounded-full"
                                    />
                                )}
                                <div>
                                    <p className="text-sm font-semibold">{account.username}</p>
                                    <p className="text-xs text-[--muted]">Connected</p>
                                </div>
                            </div>
                            <Button
                                intent="alert-subtle"
                                size="sm"
                                onClick={handleDisconnect}
                                disabled={loading}
                                leftIcon={<BiUnlink />}
                            >
                                Disconnect
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[--muted]">
                                Connect your Discord account so WeebHub can update your status automatically.
                            </p>
                            <Button
                                intent="primary"
                                size="sm"
                                onClick={handleConnect}
                                disabled={loading}
                                leftIcon={<FaDiscord />}
                                className="bg-[#5865F2] hover:bg-[#4752c4] text-white shrink-0 ml-3"
                            >
                                Connect Discord
                            </Button>
                        </div>
                    )}
                </div>

                <Field.Switch
                    side="right"
                    name="enableRichPresence"
                    label={<span className="flex gap-1 items-center">Enable</span>}
                />
                <div
                    className={cn(
                        "flex gap-4 items-center flex-col md:flex-row !mt-3",
                        enableRichPresence ? "opacity-100" : "opacity-50 pointer-events-none",
                    )}
                >
                    <Field.Checkbox
                        name="enableAnimeRichPresence"
                        label="Anime"
                        fieldClass="w-fit"
                    />
                    <Field.Checkbox
                        name="enableMangaRichPresence"
                        label="Manga"
                        fieldClass="w-fit"
                    />
                </div>

                <Field.Switch
                    side="right"
                    name="richPresenceHideWeebHubRepositoryButton"
                    label="Hide GitHub Repo Button"
                    help="When this is off, Discord Rich Presence shows a button linking to the WeebHub GitHub repository."
                />

                <Field.Switch
                    side="right"
                    name="richPresenceShowAniListProfileButton"
                    label="Show AniList Profile Button"
                    help="Show a button to open your profile page on AniList."
                />
            </SettingsCard>
        </>
    )
}
