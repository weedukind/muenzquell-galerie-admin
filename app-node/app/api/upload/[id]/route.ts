import { NextResponse } from "next/server";

import {
    getUpload,
    deleteUpload
} from "@/services/uploadService";

import {
    getTagIdsForUpload,
    deleteTagIfOrphaned
} from "@/services/tagService";

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

    const tagIds = await getTagIdsForUpload(upload.id!);

    await deleteFile(upload.objectKey);

    await deleteUpload(upload.id!);

    for (const tagId of tagIds) {
        await deleteTagIfOrphaned(tagId);
    }

    return NextResponse.json({
        success: true
    });
}