"use client";

import { Filter, X } from "lucide-react";
import { TagRecord } from "@/types/tag";
import TagChip from "./TagChip";

interface Props {
    allTags: TagRecord[];
    activeTagIds: number[];
    onToggle: (tagId: number) => void;
    onReset: () => void;
}

export default function TagFilterBar({ allTags, activeTagIds, onToggle, onReset }: Props) {

    return (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">

            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <Filter className="size-3.5" />
                Nach Tags filtern:
            </span>

            {allTags.map(tag => (
                <TagChip
                    key={tag.id}
                    tag={tag}
                    active={activeTagIds.includes(tag.id!)}
                    onClick={() => onToggle(tag.id!)}
                />
            ))}

            {activeTagIds.length > 0 && (
                <button
                    onClick={onReset}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                >
                    <X className="size-3" />
                    Zurücksetzen
                </button>
            )}

        </div>
    );
}
