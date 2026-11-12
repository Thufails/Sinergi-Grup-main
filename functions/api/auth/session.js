import { hasValidSession, isLoginConfigured, jsonResponse } from "../../_lib/auth.js";

export async function onRequestGet({ request, env }) {
    return jsonResponse({
        configured: isLoginConfigured(env),
        authenticated: await hasValidSession(request, env),
    });
}
