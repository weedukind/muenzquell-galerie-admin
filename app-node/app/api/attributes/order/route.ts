import { NextResponse } from "next/server";
import { reorderAttributeTypes } from "@/services/attributeService";

export async function PUT(request: Request) {

    const body = await request.json();

    if (!Array.isArray(body.ids) || !body.ids.every(Number.isInteger)) {
        return NextResponse.json(
            { error: "Ungültige Reihenfolge." },
            { status: 400 }
        );
    }

    await reorderAttributeTypes(body.ids);

    return NextResponse.json({
        success: true
    });
}
