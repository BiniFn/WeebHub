"use client"
import { __isCapacitorNative__, clearStoredServerUrl, getStoredServerUrl, setStoredServerUrl } from "@/api/client/server-url"
import React from "react"

type State = "checking" | "ready" | "native-no-server"

export function AndroidServerConnect({ children }: { children: React.ReactNode }) {
    const [state, setState] = React.useState<State>("checking")
    const [input, setInput] = React.useState("http://")
    const [error, setError] = React.useState("")
    const [testing, setTesting] = React.useState(false)

    React.useEffect(() => {
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

    // While detecting environment, render nothing
    if (state === "checking") return null

    if (state === "native-no-server") {
        const handleConnect = async () => {
            setError("")
            const url = input.trim().replace(/\/$/, "")
            if (!url.startsWith("http")) {
                setError("URL must start with http:// or https://")
                return
            }
            setTesting(true)
            try {
                const res = await fetch(`${url}/api/v1/status`, { signal: AbortSignal.timeout(5000) })
                if (!res.ok) throw new Error("Not a WeebHub server")
                setStoredServerUrl(url)
                setState("ready")
            } catch {
                setError("Could not connect. Make sure WeebHub is running and the URL is correct.")
            } finally {
                setTesting(false)
            }
        }

        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: "#09090f", fontFamily: "system-ui, sans-serif", padding: "24px",
            }}>
                <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>📡</div>
                    <h2 style={{ color: "#f1f1f3", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                        Connect to WeebHub
                    </h2>
                    <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                        Enter the IP address of the machine running WeebHub on your local network.
                    </p>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="http://192.168.1.x:43211"
                        style={{
                            width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 15,
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "#f1f1f3", outline: "none", marginBottom: 12, boxSizing: "border-box",
                        }}
                        onKeyDown={e => e.key === "Enter" && handleConnect()}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                    {error && (
                        <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12, textAlign: "left" }}>
                            {error}
                        </p>
                    )}
                    <button
                        onClick={handleConnect}
                        disabled={testing}
                        style={{
                            width: "100%", padding: "13px", borderRadius: 10, fontSize: 15, fontWeight: 600,
                            background: testing ? "#4f52e0" : "#6366f1", color: "#fff",
                            border: "none", cursor: testing ? "not-allowed" : "pointer",
                        }}
                    >
                        {testing ? "Connecting…" : "Connect"}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            {children}
            {__isCapacitorNative__() && getStoredServerUrl() && (
                <button
                    onClick={() => { clearStoredServerUrl(); setState("native-no-server"); setInput("http://") }}
                    style={{
                        position: "fixed", bottom: 16, right: 16, zIndex: 9999,
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#9ca3af", borderRadius: 8, padding: "6px 12px",
                        fontSize: 12, cursor: "pointer",
                    }}
                >
                    Change Server
                </button>
            )}
        </>
    )
}
