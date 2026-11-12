const encoder = new TextEncoder();
function cookieNameFor(request) {
    return new URL(request.url).protocol === "https:" ? "__Host-sinergi_admin" : "sinergi_admin_dev";
}
const sessionDurationSeconds = 8 * 60 * 60;

function toBase64Url(bytes) {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function readCookie(request) {
    const cookieName = cookieNameFor(request);
    const cookies = request.headers.get("Cookie") || "";
    const entry = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(cookieName + "="));
    return entry ? entry.slice(cookieName.length + 1) : "";
}

async function importSessionKey(secret, usages) {
    return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usages);
}

export function isLoginConfigured(env) {
    return Boolean(
        env.ADMIN_EMAIL &&
        env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length >= 8 &&
        env.ADMIN_SESSION_SECRET && env.ADMIN_SESSION_SECRET.length >= 32
    );
}

export function safeEqual(left, right) {
    const a = encoder.encode(String(left));
    const b = encoder.encode(String(right));
    let difference = a.length ^ b.length;
    const length = Math.max(a.length, b.length);
    for (let index = 0; index < length; index += 1) {
        difference |= (a[index] || 0) ^ (b[index] || 0);
    }
    return difference === 0;
}

export async function createSessionCookie(env, request) {
    const cookieName = cookieNameFor(request);
    const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
    const payload = `v1.${expiresAt}`;
    const key = await importSessionKey(env.ADMIN_SESSION_SECRET, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const token = `${payload}.${toBase64Url(new Uint8Array(signature))}`;
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionDurationSeconds}${secure}`;
}

export async function clearSessionCookie(request) {
    const cookieName = cookieNameFor(request);
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    return `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export async function hasValidSession(request, env) {
    if (!isLoginConfigured(env)) return false;
    const token = readCookie(request);
    const [version, expiresText, signatureText, extra] = token.split(".");
    if (version !== "v1" || !expiresText || !signatureText || extra) return false;

    const expiresAt = Number(expiresText);
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;

    try {
        const key = await importSessionKey(env.ADMIN_SESSION_SECRET, ["verify"]);
        const signature = fromBase64Url(signatureText);
        return await crypto.subtle.verify("HMAC", key, signature, encoder.encode(`${version}.${expiresAt}`));
    } catch (error) {
        return false;
    }
}

export function jsonResponse(data, status = 200, headers = {}) {
    return Response.json(data, {
        status,
        headers: { "Cache-Control": "no-store", ...headers },
    });
}

export function hasSameOrigin(request) {
    const origin = request.headers.get("Origin");
    return !origin || origin === new URL(request.url).origin;
}
