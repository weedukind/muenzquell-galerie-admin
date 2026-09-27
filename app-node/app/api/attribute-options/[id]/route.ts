import { NextResponse } from "next/server";
import { updateAttributeOption, deleteAttributeOption } from "@/services/attributeService";

export async function PATCH(
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

        await updateAttributeOption(Number(id), name);

        return NextResponse.json({
            success: true
        });

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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const deleted = await deleteAttributeOption(Number(id));

    if (!deleted) {
        return NextResponse.json(
            { error: "Die Option wird noch von Bildern verwendet und kann nicht gelöscht werden." },
            { status: 409 }
        );
    }

    return NextResponse.json({
        success: true
    });
}
