"use client";

import { useEffect, useId } from "react";
import { ChevronDown, X } from "lucide-react";

export interface FilterOption {
    id: number;
    name: string;
}

interface Props {
    label: string;
    options: FilterOption[];
    selectedIds: number[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onToggle: (id: number) => void;
}

// A filter as a button whose options open below it, as in the frontend's
// gallery. While open, an invisible layer covers the page, so a click
// elsewhere only closes it. The × and Esc close it too.
export default function FilterDropdown({ label, options, selectedIds, open, onOpenChange, onToggle }: Props) {

    const panelId = useId();
    const selectedCount = options.filter(option => selectedIds.includes(option.id)).length;

    useEffect(() => {

        if (!open)
            return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape")
                onOpenChange(false);
        }

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onOpenChange]);

    return (
        <div className="relative">

            <button
                onClick={() => onOpenChange(!open)}
                aria-expanded={open}
                aria-controls={panelId}
                // above the layer while open, so clicking it again closes it
                className={`relative z-30 flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-sm font-medium transition-colors ${selectedCount > 0
                    ? "border-blue-600 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:border-gray-500"}`}
            >
                {label}
                {selectedCount > 0 && (
                    <span className="rounded-full bg-blue-600 px-1.5 text-xs text-white">
                        {selectedCount}
                        <span className="sr-only"> ausgewählt</span>
                    </span>
                )}
                <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && <div aria-hidden="true" onClick={() => onOpenChange(false)} className="fixed inset-0 z-20" />}

            {open && (
                <div
                    id={panelId}
                    role="group"
                    aria-label={label}
                    className="absolute left-0 top-full z-30 mt-2 flex w-max max-w-[min(32rem,calc(100vw-2rem))] flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
                >

                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-gray-500">{label}</span>
                        <button
                            onClick={() => onOpenChange(false)}
                            aria-label="Schließen"
                            className="-my-1 -mr-1 rounded-full p-1 text-gray-500 hover:text-gray-900"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {options.map(option => (
                            <FilterChip
                                key={option.id}
                                label={option.name}
                                active={selectedIds.includes(option.id)}
                                onClick={() => onToggle(option.id)}
                            />
                        ))}
                    </div>

                </div>
            )}

        </div>
    );
}

// Outlined when inactive, filled when active.
export function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {

    return (
        <button
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${active
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"}`}
        >
            {label}
        </button>
    );
}
