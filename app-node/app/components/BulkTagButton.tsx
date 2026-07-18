"use client";

import { useRouter } from "next/navigation";
import { UploadRecord } from "@/types/upload";
import { TagRecord } from "@/types/tag";
import { assignTag, unassignTag } from "@/lib/api";
import { settleAll } from "@/lib/bulkAction";
import TagPickerButton from "./TagPickerButton";

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

    const canEdit = selectedUploads.length > 0
        && selectedUploads.every(upload => tagIdKey(upload) === tagIdKey(selectedUploads[0]));

    async function save(checkedTagIds: number[]) {

        const assignedTagIds = (selectedUploads[0].tags ?? []).map(tag => tag.id!);
        const toAdd = checkedTagIds.filter(tagId => !assignedTagIds.includes(tagId));
        const toRemove = assignedTagIds.filter(tagId => !checkedTagIds.includes(tagId));

        const { failureCount } = await settleAll(
            selectedUploads.flatMap(upload => [
                ...toAdd.map(tagId => assignTag(upload.id!, tagId)),
                ...toRemove.map(tagId => unassignTag(upload.id!, tagId))
            ])
        );

        if (failureCount > 0) {
            alert("Nicht alle Tags konnten aktualisiert werden.");
        }

        router.refresh();
    }

    return (
        <TagPickerButton
            label="Tags bearbeiten"
            currentTagIds={(selectedUploads[0]?.tags ?? []).map(tag => tag.id!)}
            allTags={allTags}
            onSave={save}
            disabled={!canEdit}
        />
    );
}
