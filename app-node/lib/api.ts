import { TagRecord } from "@/types/tag";

export interface UploadedFile {
    id: number;
    fileName: string;
    objectKey: string;
    publicUrl: string;
}

async function request(
    url: string,
    options: RequestInit,
    fallbackMessage = "Anfrage fehlgeschlagen."
): Promise<Response> {

    const res = await fetch(url, options);

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error ?? fallbackMessage);
    }

    return res;
}

function jsonRequest(
    url: string,
    method: string,
    body: unknown,
    fallbackMessage?: string
): Promise<Response> {

    return request(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    }, fallbackMessage);
}

export async function assignTag(uploadId: number, tagId: number): Promise<void> {
    await jsonRequest(
        `/api/uploads/${uploadId}/tags`,
        "POST",
        { tagId },
        "Tag konnte nicht zugewiesen werden."
    );
}

export async function unassignTag(uploadId: number, tagId: number): Promise<void> {
    await jsonRequest(
        `/api/uploads/${uploadId}/tags`,
        "DELETE",
        { tagId },
        "Tag konnte nicht entfernt werden."
    );
}

export async function createTag(name: string, color?: string): Promise<TagRecord> {
    const res = await jsonRequest(
        "/api/tags",
        "POST",
        { name, color },
        "Tag konnte nicht erstellt werden."
    );
    return res.json();
}

export async function updateTag(id: number, name: string, color: string): Promise<void> {
    await jsonRequest(
        `/api/tags/${id}`,
        "PATCH",
        { name, color },
        "Tag konnte nicht aktualisiert werden."
    );
}

export async function deleteTag(id: number): Promise<void> {
    await request(
        `/api/tags/${id}`,
        { method: "DELETE" },
        "Tag konnte nicht gelöscht werden."
    );
}

export async function deleteUpload(id: number): Promise<void> {
    await request(
        `/api/upload/${id}`,
        { method: "DELETE" },
        "Datei konnte nicht gelöscht werden."
    );
}

export function uploadFileWithProgress(
    file: File,
    onProgress: (pct: number) => void
): Promise<UploadedFile> {

    return new Promise((resolve, reject) => {

        const form = new FormData();
        form.append("files", file);

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        xhr.onload = () => {

            if (xhr.status < 200 || xhr.status >= 300) {
                const message = (() => {
                    try {
                        return JSON.parse(xhr.responseText)?.error;
                    } catch {
                        return null;
                    }
                })();
                reject(new Error(message ?? "Upload fehlgeschlagen."));
                return;
            }

            const uploaded: UploadedFile[] = JSON.parse(xhr.responseText);
            resolve(uploaded[0]);
        };

        xhr.onerror = () => reject(new Error("Upload fehlgeschlagen."));

        xhr.open("POST", "/api/upload");
        xhr.send(form);
    });
}
