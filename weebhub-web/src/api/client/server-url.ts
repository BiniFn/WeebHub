import { __DEV_SERVER_PORT } from "@/lib/server/config"
import { __isDesktop__ } from "@/types/constants"

const ANDROID_SERVER_KEY = "weebhub_server_url"

function devOrProd(dev: string, prod: string): string {
    return import.meta.env.MODE === "development" ? dev : prod
}

/** Returns true when running inside a Capacitor Android/iOS shell */
export function __isCapacitorNative__(): boolean {
    return typeof window !== "undefined" &&
        (window.location.protocol === "capacitor:" || window.location.protocol === "ionic:")
}

/** Get / set the manually-configured server URL (used by the Android app) */
export function getStoredServerUrl(): string {
    try { return localStorage.getItem(ANDROID_SERVER_KEY) ?? "" } catch { return "" }
}
export function setStoredServerUrl(url: string) {
    try { localStorage.setItem(ANDROID_SERVER_KEY, url.replace(/\/$/, "")) } catch { /* ignore */ }
}
export function clearStoredServerUrl() {
    try { localStorage.removeItem(ANDROID_SERVER_KEY) } catch { /* ignore */ }
}

export function getServerBaseUrl(removeProtocol: boolean = false): string {
    if (__isDesktop__) {
        let ret = devOrProd(`http://127.0.0.1:${__DEV_SERVER_PORT}`, "http://127.0.0.1:43211")
        if (removeProtocol) ret = ret.replace("http://", "").replace("https://", "")
        return ret
    }

    // Capacitor Android/iOS — must use a manually entered server URL
    if (__isCapacitorNative__()) {
        const stored = getStoredServerUrl()
        let ret = stored || "http://127.0.0.1:43211"
        if (removeProtocol) ret = ret.replace("http://", "").replace("https://", "")
        return ret
    }

    // Normal web browser — derive from current host
    let ret = typeof window !== "undefined"
        ? (`${window?.location?.protocol}//` + devOrProd(`${window?.location?.hostname}:${__DEV_SERVER_PORT}`, window?.location?.host))
        : ""
    if (removeProtocol) ret = ret.replace("http://", "").replace("https://", "")
    return ret
}
