"use client"
import { __isCapacitorNative__, getStoredServerUrl, setStoredServerUrl, clearStoredServerUrl } from "@/api/client/server-url"
import React, { useEffect, useState } from "react"

type State = "checking" | "native-no-server" | "ready"

/**
 * On Capacitor (Android/iOS): blocks rendering until the user has configured a server URL.
 * On browser/desktop: renders children immediately.
 */
export function AndroidServerConnect({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<State>("checking")
    const [input, setInput] = useState("http://")
    const [error, setError] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (__isCapacitorNative__()) {
            const stored = getStoredServerUrl()
            if (stored) {
                setState("ready")
            } else {
                setState("native-no-server")
                setInput("http://")
            }
        } else {
            setState("ready")
        }
    }, [])

    // While detecting environment, render nothing (avoids flash of children)
    if (state === "checking") return null

    // Native but no server URL configured yet — show connection screen
    if (state === "native-no-server") {
        function handleConnect() {
            setError("")
            const url = input.trim().replace(/\/$/, "")
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                setError("URL must start with http:// or https://")
                return
            }
            setSaving(true)
            fetch(`${url}/api/v1/status`, { signal: AbortSignal.timeout(6000) })
                .then(r => {
                    if (r.ok || r.status < 500) {
                        setStoredServerUrl(url)
                        setState("ready")
                        window.location.reload()
                    } else {
                        setError(`Server responded with ${r.status}. Check the URL.`)
                        setSaving(false)
                    }
                })
                .catch(() => {
                    setError("Could not reach the server. Make sure WeebHub is running and your phone is on the same Wi-Fi.")
                    setSaving(false)
                })
        }

        return (
            <div style={{
                minHeight: "100vh",
                background: "#0c0c0f",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                fontFamily: "system-ui, sans-serif",
            }}>
                <img src="/weebhub-logo.png" alt="WeebHub" style={{ width: 80, height: 80, marginBottom: 20, borderRadius: 16 }} />

                <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Connect to WeebHub</h1>
                <p style={{ color: "#888", fontSize: 14, textAlign: "center", margin: "0 0 28px", maxWidth: 300 }}>
                    Enter the address of your WeebHub server. Both devices must be on the same Wi-Fi network.
                </p>

                <input
                    type="url"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="http://192.168.1.100:43211"
                    style={{
                        width: "100%",
                        maxWidth: 340,
                        padding: "14px 16px",
                        borderRadius: 12,
                        border: error ? "1.5px solid #f87171" : "1.5px solid #333",
                        background: "#18181f",
                        color: "#fff",
                        fontSize: 16,
                        outline: "none",
                        marginBottom: 8,
                        boxSizing: "border-box",
                    }}
                    onKeyDown={e => e.key === "Enter" && handleConnect()}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                />

                {error && (
                    <p style={{ color: "#f87171", fontSize: 13, textAlign: "center", margin: "0 0 12px", maxWidth: 320 }}>
                        {error}
                    </p>
                )}

                <button
                    onClick={handleConnect}
                    disabled={saving}
                    style={{
                        width: "100%",
                        maxWidth: 340,
                        padding: "14px",
                        borderRadius: 12,
                        background: saving ? "#3730a3" : "#6366f1",
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: 600,
                        border: "none",
                        cursor: saving ? "not-allowed" : "pointer",
                        marginTop: 4,
                        transition: "background 0.2s",
                    }}
                >
                    {saving ? "Connecting…" : "Connect"}
                </button>

                <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 24, maxWidth: 300, lineHeight: 1.6 }}>
                    Find your computer's IP in System Settings → Wi-Fi → Details.{"\n"}Default port: <strong style={{ color: "#666" }}>43211</strong>
                </p>

                {/* Allow clearing a bad stored URL */}
                <button
                    onClick={() => { clearStoredServerUrl(); setInput("http://"); setError("") }}
                    style={{ marginTop: 16, background: "none", border: "none", color: "#555", fontSize: 12, cursor: "pointer" }}
                >
                    Reset saved server
                </button>
            </div>
        )
    }

    // Ready — native with server URL set, or non-native
    return <>{children}</>
}
