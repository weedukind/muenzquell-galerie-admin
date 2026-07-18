import {
    PutObjectCommand,
    DeleteObjectCommand
} from "@aws-sdk/client-s3";

import r2 from "@/lib/r2";

export async function uploadFile(
    objectKey: string,
    buffer: Buffer,
    mimeType: string
): Promise<string> {

    await r2.send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: objectKey,
            Body: buffer,
            ContentType: mimeType,
        })
    );

    return `${process.env.R2_PUBLIC_URL}/${objectKey}`;
}

export async function deleteFile(
    objectKey: string
): Promise<void> {

    await r2.send(
        new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: objectKey,
        })
    );
}