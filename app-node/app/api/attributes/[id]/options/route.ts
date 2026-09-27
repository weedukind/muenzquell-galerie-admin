import { NextResponse } from "next/server";
import { createAttributeOption } from "@/services/attributeService";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const body = await request.json();
    const name = body.name?.trim();

    if (!name) {
        return NextResponse.json(
            { error: "Name ist erforderlich." },
            { status: 400 }
        );
    }

    try {

        const optionId = await createAttributeOption(Number(id), name);

        return NextResponse.json({ id: optionId });

    } catch (err) {

        if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
            return NextResponse.json(
                { error: "Diese Option existiert bereits." },
                { status: 409 }
            );
        }

        throw err;
    }
}
