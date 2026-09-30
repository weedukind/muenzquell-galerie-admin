"use client";

import { useEffect, useId, useState } from "react";
import { Columns3 } from "lucide-react";

interface Props {
    columns: { key: string; label: string }[];
    hiddenKeys: string[];
    onChange: (hiddenKeys: string[]) => void;
}

// A button that opens a checkbox per column. Closes on Esc or a click outside,
// like the filter dropdowns.
export default function ColumnPicker({ columns, hiddenKeys, onChange }: Props) {

    const panelId = useId();
    const [open, setOpen] = useState(false);
    const hiddenCount = columns.filter(column => hiddenKeys.includes(column.key)).length;

    useEffect(() => {

        if (!open)
            return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape")
                setOpen(false);
        }

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    function toggle(key: string) {
        onChange(hiddenKeys.includes(key)
            ? hiddenKeys.filter(existing => existing !== key)
            : [...hiddenKeys, key]);
    }

    return (
        <div className="relative">

            <button
                onClick={() => setOpen(current => !current)}
                aria-expanded={open}
                aria-controls={panelId}
                className="relative z-30 flex items-center gap-1.5 rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-300"
            >
                <Columns3 className="size-4" />
                Spalten
                {hiddenCount > 0 && (
                    <span className="rounded-full bg-gray-500 px-1.5 text-xs text-white">
                        {hiddenCount}
                        <span className="sr-only"> ausgeblendet</span>
                    </span>
                )}
            </button>

            {open && <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 z-20" />}

            {open && (
                <div
                    id={panelId}
                    role="group"
                    aria-label="Sichtbare Spalten"
                    className="absolute right-0 top-full z-30 mt-2 flex w-56 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
                >

                    <span className="mb-1 text-sm font-medium text-gray-500">Sichtbare Spalten</span>

                    {columns.map(column => (
                        <label key={column.key} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm text-gray-700 hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={!hiddenKeys.includes(column.key)}
                                onChange={() => toggle(column.key)}
                                className="size-4 accent-blue-600"
                            />
                            {column.label}
                        </label>
                    ))}

                    {hiddenCount > 0 && (
                        <button
                            onClick={() => onChange([])}
                            className="mt-1 self-start text-sm text-gray-500 underline hover:text-blue-600"
                        >
                            Alle anzeigen
                        </button>
                    )}

                </div>
            )}

        </div>
    );
}
