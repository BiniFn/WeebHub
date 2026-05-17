"use client"
import { __isCapacitorNative__, clearStoredServerUrl, getStoredServerUrl, setStoredServerUrl } from "@/api/client/server-url"
import React from "react"

type State = "checking" | "ready" | "native-no-server"
type Mode = "connect" | "termux" | "pc"

const S: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh", display: "flex", flexDirection: "column",
        background: "linear-gradient(145deg,#07070f 0%,#0d0d1f 50%,#090910 100%)",
        fontFamily: "'Inter',system-ui,sans-serif", color: "#f1f1f3",
        overflowY: "auto",
    },
    header: {
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "48px 24px 32px", gap: 12,
    },
    logo: { width: 64, height: 64, borderRadius: 18, marginBottom: 4,
        boxShadow: "0 0 40px rgba(99,102,241,0.35)" },
    title: { fontSize: 26, fontWeight: 800, margin: 0,
        background: "linear-gradient(135deg,#a5b4fc,#818cf8)", WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent" },
    subtitle: { fontSize: 14, color: "#6b7280", margin: 0, textAlign: "center" },
    tabs: {
        display: "flex", gap: 8, padding: "0 24px 20px",
        justifyContent: "center",
    },
    card: {
        margin: "0 20px", borderRadius: 20, padding: "24px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
    },
    sectionTitle: { fontSize: 15, fontWeight: 700, color: "#e5e7eb", marginBottom: 6 },
    sectionBody: { fontSize: 13, color: "#9ca3af", lineHeight: 1.7, marginBottom: 16 },
    codeBlock: {
        background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "14px 16px", fontFamily: "monospace", fontSize: 13,
        color: "#a5b4fc", marginBottom: 12, overflowX: "auto" as const,
        lineHeight: 1.8,
    },
    step: {
        display: "flex", alignItems: "flex-start", gap: 10,
        marginBottom: 10,
    },
    stepNum: {
        minWidth: 22, height: 22, borderRadius: "50%",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, marginTop: 1,
    },
    stepText: { fontSize: 13, color: "#d1d5db", lineHeight: 1.6 },
    input: {
        width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 15,
        background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
        color: "#f1f1f3", outline: "none", boxSizing: "border-box" as const,
        fontFamily: "monospace",
    },
    errText: { color: "#f87171", fontSize: 13, marginTop: 6 },
    link: { color: "#818cf8", textDecoration: "underline", fontSize: 13 },
    badge: {
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px", borderRadius: 8,
        background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
        color: "#a5b4fc", fontSize: 12, fontWeight: 600, marginBottom: 14,
    },
    divider: { border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "20px 0" },
}

const getTabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, maxWidth: 160, padding: "10px 12px", borderRadius: 12, border: "1.5px solid",
    borderColor: active ? "#6366f1" : "rgba(255,255,255,0.08)",
    background: active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
    color: active ? "#a5b4fc" : "#6b7280", fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "all 0.2s", textAlign: "center",
})

const getBtnStyle = (disabled: boolean): React.CSSProperties => ({
    width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700,
    background: disabled
        ? "rgba(99,102,241,0.5)"
        : "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff", border: "none", cursor: disabled ? "not-allowed" : "pointer",
    marginTop: 14, boxShadow: disabled ? "none" : "0 4px 24px rgba(99,102,241,0.4)",
    transition: "all 0.2s",
})

export function AndroidServerConnect({ children }: { children: React.ReactNode }) {
    const [state, setState] = React.useState<State>("checking")
    const [mode, setMode] = React.useState<Mode>("connect")
    const [input, setInput] = React.useState("http://")
    const [error, setError] = React.useState("")
    const [testing, setTesting] = React.useState(false)

    React.useEffect(() => {
        if (__isCapacitorNative__()) {
            const stored = getStoredServerUrl()
            setState(stored ? "ready" : "native-no-server")
        } else {
            setState("ready")
        }
    }, [])

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
                const res = await fetch(`${url}/api/v1/status`, { signal: AbortSignal.timeout(8000) })
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
            <div style={S.page}>
                {/* Header */}
                <div style={S.header}>
                    <img src="/weebhub-logo-v2.png" alt="WeebHub" style={S.logo}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    <h1 style={S.title}>WeebHub</h1>
                    <p style={S.subtitle}>Connect to your WeebHub server to get started</p>
                </div>

                {/* Tabs */}
                <div style={S.tabs}>
                    <button style={getTabStyle(mode === "connect")} onClick={() => setMode("connect")}>
                        🔗 Connect
                    </button>
                    <button style={getTabStyle(mode === "termux")} onClick={() => setMode("termux")}>
                        📱 Termux
                    </button>
                    <button style={getTabStyle(mode === "pc")} onClick={() => setMode("pc")}>
                        💻 Use a PC
                    </button>
                </div>

                {/* CONNECT TAB */}
                {mode === "connect" && (
                    <div style={S.card}>
                        <p style={S.sectionTitle}>Enter your server URL</p>
                        <p style={S.sectionBody}>
                            Paste the address of your running WeebHub server (Termux or PC on your network).
                        </p>
                        <input
                            id="server-url-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="http://127.0.0.1:43211"
                            style={S.input}
                            onKeyDown={e => e.key === "Enter" && handleConnect()}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                        {error && <p style={S.errText}>{error}</p>}
                        <button id="connect-btn" onClick={handleConnect} disabled={testing} style={getBtnStyle(testing)}>
                            {testing ? "⏳ Connecting…" : "Connect →"}
                        </button>
                        <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginTop: 14 }}>
                            Using Termux on this phone? URL is{" "}
                            <span style={{ color: "#818cf8", fontFamily: "monospace" }}>http://127.0.0.1:43211</span>
                        </p>
                    </div>
                )}

                {/* TERMUX TAB */}
                {mode === "termux" && (
                    <div style={S.card}>
                        <div style={S.badge}>📱 Run WeebHub on this Android device</div>
                        <p style={S.sectionBody}>
                            Use <strong style={{ color: "#e5e7eb" }}>Termux</strong> to run the WeebHub server
                            directly on your Android phone. No PC needed!
                        </p>

                        {/* Download link */}
                        <a
                            href="https://f-droid.org/en/packages/com.termux/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
                                padding: "12px 16px", borderRadius: 12,
                                background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
                                textDecoration: "none", color: "#a5b4fc",
                            }}
                        >
                            <span style={{ fontSize: 24 }}>📦</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>Download Termux (F-Droid)</div>
                                <div style={{ fontSize: 12, color: "#6b7280" }}>f-droid.org — free & open source</div>
                            </div>
                            <span style={{ marginLeft: "auto", fontSize: 18 }}>↗</span>
                        </a>

                        <hr style={S.divider} />
                        <p style={{ ...S.sectionTitle, marginBottom: 14 }}>Step-by-step setup</p>

                        {[
                            {
                                label: "Open Termux and install dependencies",
                                code: "pkg update && pkg upgrade -y\npkg install -y git golang",
                            },
                            {
                                label: "Clone the WeebHub repository",
                                code: "git clone https://github.com/BiniFn/WeebHub.git\ncd WeebHub",
                            },
                            {
                                label: "Start the server",
                                code: "go run main.go",
                            },
                            {
                                label: "Connect the app — tap the Connect tab and enter",
                                code: "http://127.0.0.1:43211",
                            },
                        ].map((step, i) => (
                            <div key={i} style={S.step}>
                                <div style={S.stepNum}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ ...S.stepText, fontWeight: 600, marginBottom: 6 }}>{step.label}</p>
                                    <div style={S.codeBlock}>{step.code}</div>
                                </div>
                            </div>
                        ))}

                        <button
                            id="termux-connect-btn"
                            onClick={() => { setInput("http://127.0.0.1:43211"); setMode("connect") }}
                            style={getBtnStyle(false)}
                        >
                            → Go Connect
                        </button>
                    </div>
                )}

                {/* PC TAB */}
                {mode === "pc" && (
                    <div style={S.card}>
                        <div style={S.badge}>💻 Host on a PC, connect from Android</div>
                        <p style={S.sectionBody}>
                            Run WeebHub on your Windows/Mac/Linux machine and connect your phone to it
                            over your local Wi-Fi network.
                        </p>

                        {[
                            {
                                label: "Download & run WeebHub on your PC",
                                detail: "Get the latest release from GitHub Releases.",
                            },
                            {
                                label: "Find your PC's local IP address",
                                detail: "Windows: run ipconfig  •  Mac/Linux: run ifconfig or ip a",
                                code: "# Windows\nipconfig\n\n# Mac / Linux\nifconfig | grep 'inet '",
                            },
                            {
                                label: "Make sure both devices are on the same Wi-Fi",
                                detail: "Your phone and PC must be on the same network.",
                            },
                            {
                                label: "Enter the server URL in the Connect tab",
                                detail: "Replace X.X.X.X with your PC's IP address:",
                                code: "http://192.168.X.X:43211",
                            },
                        ].map((step, i) => (
                            <div key={i} style={S.step}>
                                <div style={S.stepNum}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ ...S.stepText, fontWeight: 600, marginBottom: 4 }}>{step.label}</p>
                                    <p style={{ ...S.stepText, color: "#9ca3af", marginBottom: step.code ? 8 : 14 }}>
                                        {step.detail}
                                    </p>
                                    {step.code && <div style={S.codeBlock}>{step.code}</div>}
                                </div>
                            </div>
                        ))}

                        <a
                            href="https://github.com/BiniFn/WeebHub/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "12px 16px", borderRadius: 12, marginBottom: 14,
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                                textDecoration: "none", color: "#a5b4fc",
                            }}
                        >
                            <span style={{ fontSize: 20 }}>🐙</span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>WeebHub GitHub Releases</span>
                            <span style={{ marginLeft: "auto", fontSize: 16 }}>↗</span>
                        </a>

                        <button
                            id="pc-connect-btn"
                            onClick={() => { setInput("http://192.168."); setMode("connect") }}
                            style={getBtnStyle(false)}
                        >
                            → Go Connect
                        </button>
                    </div>
                )}

                <div style={{ height: 40 }} />
            </div>
        )
    }

    return (
        <>
            {children}
            {__isCapacitorNative__() && getStoredServerUrl() && (
                <button
                    id="change-server-btn"
                    onClick={() => { clearStoredServerUrl(); setState("native-no-server"); setInput("http://") }}
                    style={{
                        position: "fixed", bottom: 20, left: 16, zIndex: 999999,
                        background: "rgba(17,17,34,0.85)", backdropFilter: "blur(12px)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        color: "#818cf8", borderRadius: 10, padding: "8px 14px",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
                    }}
                >
                    ⚡ Change Server
                </button>
            )}
        </>
    )
}
