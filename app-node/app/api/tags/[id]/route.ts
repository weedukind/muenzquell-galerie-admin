import { NextResponse } from "next/server";
import { updateTag, deleteTag } from "@/services/tagService";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const body = await request.json();
    const name = body.name?.trim();
    const color = body.color?.trim();

    if (!name || !color) {
        return NextResponse.json(
            { error: "Name und Farbe sind erforderlich." },
            { status: 400 }
        );
    }

    try {

        await updateTag(Number(id), name, color);

        return NextResponse.json({
            success: true
        });

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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    await deleteTag(Number(id));

    return NextResponse.json({
        success: true
    });
}
