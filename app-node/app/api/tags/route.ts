import { NextResponse } from "next/server";
import { getTags, createTag } from "@/services/tagService";

export async function GET() {

    const tags = await getTags();

    return NextResponse.json(tags);
}

export async function POST(request: Request) {

    const body = await request.json();
    const name = body.name?.trim();
    const color = body.color?.trim() || undefined;

    if (!name) {
        return NextResponse.json(
            { error: "Name ist erforderlich." },
            { status: 400 }
        );
    }

    try {

        const tag = await createTag(name, color);

        return NextResponse.json(tag);

    } catch (err) {

        if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
            return NextResponse.json(
                { error: "Ein Tag mit diesem Namen existiert bereits." },
                { status: 409 }
            );
        }

        throw err;
    }
}