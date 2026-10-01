import { NextResponse } from "next/server";
import { deleteGroup, renameGroup } from "@/services/groupService";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
        return NextResponse.json(
            { error: "Name ist erforderlich." },
            { status: 400 }
        );
    }

    try {

        if (!await renameGroup(Number(id), name)) {
            return NextResponse.json(
                { error: "Gruppe nicht gefunden." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true
        });

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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    await deleteGroup(Number(id));

    return NextResponse.json({
        success: true
    });
}
