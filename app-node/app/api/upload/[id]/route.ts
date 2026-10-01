import { NextResponse } from "next/server";

import {
    getUpload,
    deleteUpload
} from "@/services/uploadService";

import { deleteFile } from "@/services/storageService";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const upload = await getUpload(Number(id));

    if (!upload) {
        return NextResponse.json(
            { error: "Upload nicht gefunden." },
            { status: 404 }
        );
    }

    await deleteFile(upload.objectKey);

    await deleteUpload(upload.id!);

    return NextResponse.json({
        success: true
    });
}