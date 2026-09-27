import { NextResponse } from "next/server";
import { updateAttributeType, deleteAttributeType } from "@/services/attributeService";

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

        await updateAttributeType(Number(id), name);

        return NextResponse.json({
            success: true
        });

    } catch (err) {

        if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
            return NextResponse.json(
                { error: "Ein Attribut-Typ mit diesem Namen existiert bereits." },
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

    await deleteAttributeType(Number(id));

    return NextResponse.json({
        success: true
    });
}
