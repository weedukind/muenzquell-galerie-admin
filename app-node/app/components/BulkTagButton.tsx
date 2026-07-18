"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadRecord } from "@/types/upload";
import { TagRecord } from "@/types/tag";
import { assignTag, unassignTag } from "@/lib/api";
import TagPicker from "./TagPicker";

interface Props {
    selectedUploads: UploadRecord[];
    allTags: TagRecord[];
}

function tagIdKey(upload: UploadRecord): string {
    return (upload.tags ?? [])
        .map(tag => tag.id!)
        .sort((a, b) => a - b)
        .join(",");
}

export default function BulkTagButton({ selectedUploads, allTags }: Props) {

    const router = useRouter();
    const [showPicker, setShowPicker] = useState(false);

    const canEdit = selectedUploads.length > 0
        && selectedUploads.every(upload => tagIdKey(upload) === tagIdKey(selectedUploads[0]));

    async function save(checkedTagIds: number[]) {

        const assignedTagIds = (selectedUploads[0].tags ?? []).map(tag => tag.id!);
        const toAdd = checkedTagIds.filter(tagId => !assignedTagIds.includes(tagId));
        const toRemove = assignedTagIds.filter(tagId => !checkedTagIds.includes(tagId));

        const results = await Promise.allSettled(
            selectedUploads.flatMap(upload => [
                ...toAdd.map(tagId => assignTag(upload.id!, tagId)),
                ...toRemove.map(tagId => unassignTag(upload.id!, tagId))
            ])
        );

        if (results.some(result => result.status === "rejected")) {
            alert("Nicht alle Tags konnten aktualisiert werden.");
        }

        setShowPicker(false);
        router.refresh();
    }

    return (
        <span className="relative inline-block">

            <button
                onClick={() => setShowPicker(current => !current)}
                disabled={!canEdit}
                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
            >
                Tags bearbeiten
            </button>

            {showPicker && canEdit && (
                <TagPicker
                    currentTagIds={(selectedUploads[0].tags ?? []).map(tag => tag.id!)}
                    allTags={allTags}
                    onSave={save}
                />
            )}

        </span>
    );
}
