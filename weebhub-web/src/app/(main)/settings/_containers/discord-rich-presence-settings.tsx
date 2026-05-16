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
        // Handle OAuth callback code from URL
        const params = new URLSearchParams(window.location.search)
        const code = params.get("discord_code")
        if (code) {
            handleOAuthCallback(code)
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [])

    async function fetchAccount() {
        try {
            const res = await fetch("/api/v1/discord/oauth/account")
            const json = await res.json()
            setAccount(json.data ?? null)
        } catch {
            // ignore
        }
    }

    async function handleConnect() {
        try {
            const res = await fetch("/api/v1/discord/oauth/url")
            const json = await res.json()
            const authUrl = json.data as string
            // Redirect to Discord OAuth
            window.location.href = authUrl
        } catch (e) {
            toast.error("Failed to start Discord login")
        }
    }

    async function handleOAuthCallback(code: string) {
        setLoading(true)
        try {
            const res = await fetch("/api/v1/discord/oauth/callback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, redirectUri: window.location.origin + "/discord-callback" }),
            })
            const json = await res.json()
            if (json.data) {
                toast.success("Discord account connected!")
                await fetchAccount()
            } else {
                toast.error("Failed to connect Discord account")
            }
        } catch {
            toast.error("Failed to connect Discord account")
        } finally {
            setLoading(false)
        }
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
