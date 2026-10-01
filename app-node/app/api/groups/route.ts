import { NextResponse } from "next/server";
import { createGroup } from "@/services/groupService";

export async function POST(request: Request) {

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
        return NextResponse.json(
            { error: "Name ist erforderlich." },
            { status: 400 }
        );
    }

    try {

        const id = await createGroup(name);

        return NextResponse.json({ id });

    } catch (err) {

        if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
            return NextResponse.json(
                { error: "Eine Gruppe mit diesem Namen existiert bereits." },
                { status: 409 }
            );
        }

        throw err;
    }
}
