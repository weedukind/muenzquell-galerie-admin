import { NextResponse } from "next/server";
import { reorderAttributeOptions } from "@/services/attributeService";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const body = await request.json();

    if (!Array.isArray(body.ids) || !body.ids.every(Number.isInteger)) {
        return NextResponse.json(
            { error: "Ungültige Reihenfolge." },
            { status: 400 }
        );
    }

    await reorderAttributeOptions(Number(id), body.ids);

    return NextResponse.json({
        success: true
    });
}
