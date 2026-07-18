import {TagRecord} from "@/types/tag";

export interface UploadRecord {
    id?: number;
    name: string;
    objectKey: string;
    publicUrl: string;
    mimeType: string;
    size: number;
    width?: number | null;
    height?: number | null;
    created_at?: string;
    createdAtFormatted?: string;
    tags?: TagRecord[];
}