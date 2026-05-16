"use client"
import { __isCapacitorNative__, getStoredServerUrl, setStoredServerUrl } from "@/api/client/server-url"
import React, { useEffect, useState } from "react"

/**
 * Shows a server connection prompt when running inside Capacitor (Android/iOS)
 * and no server URL has been configured yet.
 */
export function AndroidServerConnect({ children }: { children: React.ReactNode }) {
    const [isNative, setIsNative] = useState(false)
    const [hasServer, setHasServer] = useState(true)
    const [input, setInput] = useState("http://")
    const [error, setError] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (__isCapacitorNative__()) {
            setIsNative(true)
            const stored = getStoredServerUrl()
            setHasServer(!!stored)
            if (!stored) setInput("http://")
        }
    }, [])

    if (!isNative || hasServer) return <>{children}</>

    function handleConnect() {
        setError("")
        let url = input.trim().replace(/\/$/, "")
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            setError("URL must start with http:// or https://")
            return
        }
        setSaving(true)
        // Test connectivity before saving
        fetch(`${url}/api/v1/status`, { signal: AbortSignal.timeout(5000) })
            .then(r => {
                if (r.ok || r.status < 500) {
                    setStoredServerUrl(url)
                    setHasServer(true)
                    window.location.reload()
                } else {
                    setError(`Server responded with ${r.status}. Check the URL.`)
                    setSaving(false)
                }
            })
            .catch(() => {
                setError("Could not reach server. Make sure WeebHub is running and your phone is on the same Wi-Fi.")
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
            {/* Logo */}
            <img src="/weebhub-logo.png" alt="WeebHub" style={{ width: 80, height: 80, marginBottom: 16 }} />

            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Connect to WeebHub</h1>
            <p style={{ color: "#888", fontSize: 14, textAlign: "center", margin: "0 0 28px", maxWidth: 300 }}>
                Enter the address of your WeebHub server running on your computer. Make sure both devices are on the same Wi-Fi.
            </p>

            {/* Input */}
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
                    border: "1.5px solid #333",
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
                }}
            >
                {saving ? "Connecting..." : "Connect"}
            </button>

            <p style={{ color: "#555", fontSize: 12, textAlign: "center", marginTop: 20, maxWidth: 300 }}>
                Find your computer's IP in System Settings → Wi-Fi → Details.{"\n"}Default port is 43211.
            </p>
        </div>
    )
}
