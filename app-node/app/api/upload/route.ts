import { NextResponse } from "next/server";
import {
    uploadFile,
    deleteFile
} from "@/services/storageService";
import { randomUUID } from "crypto";
import {insertUpload} from "@/services/uploadService";
import { imageSize } from "image-size";

export async function POST(req: Request) {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    const result = [];

    for (const file of files) {

        const extension = file.name.includes(".")
            ? file.name.substring(file.name.lastIndexOf("."))
            : "";

        const objectKey = `${randomUUID()}${extension}`;

        const buffer = Buffer.from(await file.arrayBuffer());

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

        let id: number;

        try {

            id = await insertUpload({
                name: file.name,
                objectKey,
                publicUrl,
                mimeType: file.type,
                size: file.size,
                width,
                height
            });

        } catch (err) {

            await deleteFile(objectKey);

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