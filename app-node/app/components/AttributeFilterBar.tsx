"use client";

import { Filter, X } from "lucide-react";
import { AttributeType } from "@/types/attribute";

interface Props {
    // only the options that can be picked, i.e. those assigned to at least one upload
    types: AttributeType[];
    activeOptionIds: number[];
    onToggle: (optionId: number) => void;
    onReset: () => void;
}

export default function AttributeFilterBar({ types, activeOptionIds, onToggle, onReset }: Props) {

    const visibleTypes = types.filter(type => type.options.length > 0);

    if (visibleTypes.length === 0)
        return null;

    return (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">

            <div className="mb-2 flex items-center justify-between gap-2">

                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                    <Filter className="size-3.5" />
                    Nach Attributen filtern:
                </span>

                {activeOptionIds.length > 0 && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                    >
                        <X className="size-3" />
                        Zurücksetzen
                    </button>
                )}

            </div>

            <div className="space-y-1.5">

                {visibleTypes.map(type => (
                    <div key={type.id} className="flex flex-wrap items-center gap-1.5">

                        <span className="w-28 shrink-0 text-xs font-medium text-gray-500">
                            {type.name}
                        </span>

                        {type.options.map(option => {

                            const active = activeOptionIds.includes(option.id);

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => onToggle(option.id)}
                                    aria-pressed={active}
                                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${active
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"}`}
                                >
                                    {option.name}
                                </button>
                            );
                        })}

                    </div>
                ))}

            </div>

        </div>
    );
}
