import { NextResponse } from "next/server";
import { addGroupMember, getGroup } from "@/services/groupService";
import { findUser } from "@/services/userService";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const body = await request.json();
    const userId = Number(body.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
        return NextResponse.json(
            { error: "userId fehlt oder ist ungültig." },
            { status: 400 }
        );
    }

    const [group, user] = await Promise.all([getGroup(Number(id)), findUser(userId)]);

    if (!group || !user) {
        return NextResponse.json(
            { error: group ? "Benutzer nicht gefunden." : "Gruppe nicht gefunden." },
            { status: 404 }
        );
    }

    // only placeholders are left of a deleted account
    if (user.deletedAt) {
        return NextResponse.json(
            { error: "Gelöschte Konten können keiner Gruppe hinzugefügt werden." },
            { status: 400 }
        );
    }

    await addGroupMember(group.id, user.id);

    return NextResponse.json({
        success: true
    });
}
