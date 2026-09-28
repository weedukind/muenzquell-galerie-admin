import { NextResponse } from "next/server";
import { deleteUserSessions } from "@/services/userService";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const deleted = await deleteUserSessions(Number(id));

    return NextResponse.json({
        deleted
    });
}
