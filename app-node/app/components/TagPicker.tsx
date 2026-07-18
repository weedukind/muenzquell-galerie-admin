"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { TagRecord } from "@/types/tag";
import { createTag } from "@/lib/api";
import TagChip from "./TagChip";

interface Props {
    currentTagIds: number[];
    allTags: TagRecord[];
    onSave: (tagIds: number[]) => void | Promise<void>;
}

export default function TagPicker({ currentTagIds, allTags, onSave }: Props) {

    const [newTagName, setNewTagName] = useState("");
    const [checkedTagIds, setCheckedTagIds] = useState<number[]>(currentTagIds);
    const [localTags, setLocalTags] = useState<TagRecord[]>([]);
    const [saving, setSaving] = useState(false);

    const pickerTags = [
        ...allTags,
        ...localTags.filter(local => !allTags.some(tag => tag.id === local.id))
    ];

    function toggleTag(tagId: number) {

        setCheckedTagIds(current =>
            current.includes(tagId)
                ? current.filter(id => id !== tagId)
                : [...current, tagId]
        );
    }

    async function handleCreateTag() {

        const name = newTagName.trim();

        if (!name)
            return;

        let newTag: TagRecord;

        try {
            newTag = await createTag(name);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Tag konnte nicht erstellt werden.");
            return;
        }

        setLocalTags(current => [...current, newTag]);
        setCheckedTagIds(current => [...current, newTag.id!]);
        setNewTagName("");
    }

    async function handleSave() {

        setSaving(true);

        await onSave(checkedTagIds);

        setSaving(false);
    }

    return (
        <div className="absolute left-0 top-full z-10 mt-1.5 w-44 rounded-lg border border-gray-200 bg-white p-2.5 shadow-lg">

            <div className="flex max-h-40 flex-wrap gap-1 overflow-y-auto">

                {pickerTags.map(tag => (
                    <TagChip
                        key={tag.id}
                        tag={tag}
                        active={checkedTagIds.includes(tag.id!)}
                        onClick={() => toggleTag(tag.id!)}
                    />
                ))}

            </div>

            <div className="mt-2 flex items-center gap-1 border-t border-gray-100 pt-2">

                <input
                    type="text"
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    placeholder="Neues Tag…"
                    className="w-full min-w-0 rounded-md border border-gray-300 px-1.5 py-1 text-xs text-black focus:border-blue-400 focus:outline-none"
                />

                <button
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                    className="flex shrink-0 items-center justify-center rounded-md bg-emerald-600 p-1 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Plus className="size-3.5" />
                </button>

            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Check className="size-3.5" />
                {saving ? "Speichert…" : "Speichern"}
            </button>

        </div>
    );
}
