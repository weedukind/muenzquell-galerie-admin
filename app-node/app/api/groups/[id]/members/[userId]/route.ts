import { NextResponse } from "next/server";
import { removeGroupMember } from "@/services/groupService";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; userId: string }> }
) {

    const { id, userId } = await params;

    await removeGroupMember(Number(id), Number(userId));

    return NextResponse.json({
        success: true
    });
}
