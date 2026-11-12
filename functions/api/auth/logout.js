import { clearSessionCookie, hasSameOrigin, jsonResponse } from "../../_lib/auth.js";

export async function onRequestPost({ request }) {
    if (!hasSameOrigin(request)) return jsonResponse({ error: "Permintaan ditolak." }, 403);
    return jsonResponse({ loggedOut: true }, 200, { "Set-Cookie": await clearSessionCookie(request) });
}

export async function onRequest(context) {
    if (context.request.method === "OPTIONS") return new Response(null, { status: 204 });
    return jsonResponse({ error: "Metode tidak diizinkan." }, 405, { Allow: "POST" });
}
