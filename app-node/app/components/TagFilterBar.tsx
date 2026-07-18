"use client";

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
        <div className="mb-4 flex flex-wrap items-center gap-2">

            <span className="text-sm text-gray-600">
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
                    className="text-xs text-gray-500 underline"
                >
                    Filter zurücksetzen
                </button>
            )}

        </div>
    );
}
