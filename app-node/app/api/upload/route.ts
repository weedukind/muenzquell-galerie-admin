import { NextResponse } from "next/server";
import {
    uploadFile,
    deleteFile
} from "@/services/storageService";
import { createHash, randomUUID } from "crypto";
import {insertUpload, deleteUpload, findUploadByHash} from "@/services/uploadService";
import { getAttributeTypes, setUploadAttributes } from "@/services/attributeService";
import { parseAttributeValues, validateAttributeValues } from "@/lib/attributes";
import { imageSize } from "image-size";

function duplicateResponse(existing: { id: number; name: string } | null) {
    return NextResponse.json(
        {
            error: existing
                ? `Dieses Bild wurde schon hochgeladen: "${existing.name}" (ID ${existing.id}).`
                : "Dieses Bild wurde schon hochgeladen.",
            existingId: existing?.id ?? null
        },
        { status: 409 }
    );
}

export async function POST(req: Request) {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    const attributes = (() => {
        try {
            return parseAttributeValues(JSON.parse(String(formData.get("attributes") ?? "{}")));
        } catch {
            return null;
        }
    })();

    if (!attributes) {
        return NextResponse.json(
            { error: "Ungültige Attributwerte." },
            { status: 400 }
        );
    }

    const attributeError = validateAttributeValues(await getAttributeTypes(), attributes);

    if (attributeError) {
        return NextResponse.json(
            { error: attributeError },
            { status: 400 }
        );
    }

    const result = [];

    for (const file of files) {

        const extension = file.name.includes(".")
            ? file.name.substring(file.name.lastIndexOf("."))
            : "";

        const objectKey = `${randomUUID()}${extension}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        // The same content must not be uploaded twice, whatever the file is called.
        const contentHash = createHash("sha256").update(buffer).digest("hex");
        const existing = await findUploadByHash(contentHash);

        if (existing) {
            return duplicateResponse(existing);
        }

        let width: number | null = null;
        let height: number | null = null;

        try {
            // non-image uploads (or unsupported formats) simply keep width/height as null
            ({ width, height } = imageSize(buffer));
        } catch {
        }

        const publicUrl = await uploadFile(
            objectKey,
            buffer,
            file.type
        );

        let id: number | null = null;

        try {

            id = await insertUpload({
                name: file.name,
                objectKey,
                publicUrl,
                mimeType: file.type,
                size: file.size,
                width,
                height,
                contentHash
            });

            await setUploadAttributes(id, attributes);

        } catch (err) {

            if (id !== null) {
                await deleteUpload(id);
            }

            await deleteFile(objectKey);

            // Uploaded at the same time as an identical file, which got in first.
            if (id === null && err instanceof Error && err.message.includes("UNIQUE constraint failed: uploads.content_hash")) {
                return duplicateResponse(await findUploadByHash(contentHash));
            }

            throw err;
        }


        result.push({
            id,
            fileName: file.name,
            objectKey: objectKey,
            publicUrl: `${process.env.R2_PUBLIC_URL}/${objectKey}`,
        });
    }

    return NextResponse.json(result);
}