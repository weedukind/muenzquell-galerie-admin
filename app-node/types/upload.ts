import {TagRecord} from "@/types/tag";
import {AttributeValues} from "@/types/attribute";
import {TaggedPerson} from "@/types/person";

export interface UploadRecord {
    id?: number;
    name: string;
    objectKey: string;
    publicUrl: string;
    mimeType: string;
    size: number;
    // SHA-256 of the content (hex); null for uploads not backfilled yet
    contentHash?: string | null;
    width?: number | null;
    height?: number | null;
    created_at?: string;
    createdAtFormatted?: string;
    tags?: TagRecord[];
    attributes?: AttributeValues;
    // people tagged on the image in the frontend
    people?: TaggedPerson[];
    // likes from the frontend's users
    likeCount?: number;
    // logged-in frontend users who opened the image in the lightbox, each counted once
    viewCount?: number;
}