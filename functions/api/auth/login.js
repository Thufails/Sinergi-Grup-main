import { createSessionCookie, hasSameOrigin, isLoginConfigured, jsonResponse, safeEqual } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
    if (!hasSameOrigin(request)) return jsonResponse({ error: "Permintaan ditolak." }, 403);
    if (!isLoginConfigured(env)) return jsonResponse({ error: "Login admin belum disiapkan di Cloudflare." }, 503);

    let credentials;
    try {
        credentials = await request.json();
    } catch (error) {
        return jsonResponse({ error: "Format permintaan tidak valid." }, 400);
    }

    const email = typeof credentials.email === "string" ? credentials.email.trim().toLowerCase() : "";
    const password = typeof credentials.password === "string" ? credentials.password : "";
    if (email.length > 254 || password.length > 256 || !email || !password) {
        return jsonResponse({ error: "Email atau kata sandi belum benar." }, 400);
    }

    const emailMatches = safeEqual(email, env.ADMIN_EMAIL.trim().toLowerCase());
    const passwordMatches = safeEqual(password, env.ADMIN_PASSWORD);
    if (!emailMatches || !passwordMatches) {
        return jsonResponse({ error: "Email atau kata sandi salah." }, 401);
    }

    return jsonResponse({ authenticated: true }, 200, {
        "Set-Cookie": await createSessionCookie(env, request),
    });
}

export async function onRequest(context) {
    if (context.request.method === "OPTIONS") return new Response(null, { status: 204 });
    return jsonResponse({ error: "Metode tidak diizinkan." }, 405, { Allow: "POST" });
}
