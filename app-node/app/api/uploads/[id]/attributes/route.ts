import { NextResponse } from "next/server";
import { getAttributeTypes, setUploadAttributes } from "@/services/attributeService";
import { getUpload } from "@/services/uploadService";
import { parseAttributeValues, validateAttributeValues } from "@/lib/attributes";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const upload = await getUpload(Number(id));

    if (!upload) {
        return NextResponse.json(
            { error: "Datei nicht gefunden." },
            { status: 404 }
        );
    }

    const body = await request.json();
    const values = parseAttributeValues(body.values);

    if (!values) {
        return NextResponse.json(
            { error: "Ungültige Attributwerte." },
            { status: 400 }
        );
    }

    const error = validateAttributeValues(await getAttributeTypes(), values);

    if (error) {
        return NextResponse.json(
            { error },
            { status: 400 }
        );
    }

    await setUploadAttributes(upload.id!, values);

    return NextResponse.json({
        success: true
    });
}
