import { hasValidSession, jsonResponse } from "./_lib/auth.js";

const publicAdminPaths = new Set([
    "/admin/login.html",
    "/admin/login.css",
    "/admin/login.js",
]);

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const isAdminPage = url.pathname === "/admin" || url.pathname.startsWith("/admin/");
    const isAdminApi = url.pathname === "/api/admin" || url.pathname.startsWith("/api/admin/");

    if (!isAdminPage && !isAdminApi) return context.next();

    const authenticated = await hasValidSession(context.request, context.env);
    if (isAdminApi && !authenticated) {
        return jsonResponse({ error: "Sesi login dibutuhkan." }, 401);
    }

    if (isAdminPage && publicAdminPaths.has(url.pathname)) {
        if (url.pathname === "/admin/login.html" && authenticated) {
            return Response.redirect(new URL("/admin/", url), 302);
        }
        return context.next();
    }

    if (!authenticated) {
        const destination = url.pathname + url.search;
        const loginUrl = new URL("/admin/login.html", url);
        loginUrl.searchParams.set("next", destination);
        return Response.redirect(loginUrl, 302);
    }

    const response = await context.next();
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "same-origin");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
