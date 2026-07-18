"use client";

import { useState } from "react";
import { Tags } from "lucide-react";
import { TagRecord } from "@/types/tag";
import TagPicker from "./TagPicker";

interface Props {
    label: React.ReactNode;
    currentTagIds: number[];
    allTags: TagRecord[];
    onSave: (tagIds: number[]) => void | Promise<void>;
    disabled?: boolean;
}

export default function TagPickerButton({ label, currentTagIds, allTags, onSave, disabled }: Props) {

    const [open, setOpen] = useState(false);

    async function handleSave(tagIds: number[]) {
        await onSave(tagIds);
        setOpen(false);
    }

    return (
        <span className="relative inline-block">

            <button
                onClick={() => setOpen(current => !current)}
                disabled={disabled}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Tags className="size-4" />
                {label}
            </button>

            {open && !disabled && (
                <TagPicker
                    currentTagIds={currentTagIds}
                    allTags={allTags}
                    onSave={handleSave}
                />
            )}

        </span>
    );
}
