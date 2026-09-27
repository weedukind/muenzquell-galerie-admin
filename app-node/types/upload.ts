import {TagRecord} from "@/types/tag";
import {AttributeValues} from "@/types/attribute";

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
    attributes?: AttributeValues;
}