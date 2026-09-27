import { NextResponse } from "next/server";
import { setUserLocked } from "@/services/userService";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const body = await request.json();

    if (typeof body.isLocked !== "boolean") {
        return NextResponse.json(
            { error: "isLocked muss true oder false sein." },
            { status: 400 }
        );
    }

    const updated = await setUserLocked(Number(id), body.isLocked);

    if (!updated) {
        return NextResponse.json(
            { error: "Benutzer nicht gefunden." },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true
    });
}
