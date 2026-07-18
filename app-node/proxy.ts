import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {

    const validUser = process.env.SITE_USERNAME;
    const validPass = process.env.SITE_PASSWORD;

    const authHeader = request.headers.get("authorization");

    if (authHeader?.startsWith("Basic ")) {

        const decoded = Buffer.from(authHeader.slice("Basic ".length), "base64").toString();
        const separatorIndex = decoded.indexOf(":");
        const user = decoded.slice(0, separatorIndex);
        const pass = decoded.slice(separatorIndex + 1);

        if (user === validUser && pass === validPass) {
            return;
        }
    }

    return new Response("Authentication required.", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Cloud Upload Manager"'
        }
    });
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
