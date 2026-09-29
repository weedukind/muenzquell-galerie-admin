"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadRecord } from "@/types/upload";
import { TagRecord } from "@/types/tag";
import { AttributeType, AttributeValues } from "@/types/attribute";
import { getMissingAttributeTypes } from "@/lib/attributes";
import { formatSize } from "@/lib/formatSize";
import { toCsv, downloadCsv } from "@/lib/csv";
import { Download, ExternalLink, AlertTriangle } from "lucide-react";
import { useSelection } from "@/hooks/useSelection";
import TagEditor from "./TagEditor";
import AttributeFilterBar from "./AttributeFilterBar";
import BulkDeleteButton from "./BulkDeleteButton";
import BulkTagButton from "./BulkTagButton";

interface FileTableProps {
    uploads: UploadRecord[];
    allTags: TagRecord[];
    attributeTypes: AttributeType[];
}

export default function FileTable({uploads, allTags, attributeTypes}: FileTableProps) {

    function optionName(type: AttributeType, values: AttributeValues | undefined): string | undefined {
        return type.options.find(option => option.id === values?.[type.id])?.name;
    }

    const [activeOptionIds, setActiveOptionIds] = useState<number[]>([]);

    // Only offer options that at least one upload has, so no filter leads to an empty list.
    const filterTypes = attributeTypes.map(type => ({
        ...type,
        options: type.options.filter(option =>
            uploads.some(upload => upload.attributes?.[type.id] === option.id)
        )
    }));

    // Options of the same type are OR-ed, different types are AND-ed.
    const activeFilters = attributeTypes
        .map(type => ({
            typeId: type.id,
            optionIds: type.options.map(option => option.id).filter(id => activeOptionIds.includes(id))
        }))
        .filter(filter => filter.optionIds.length > 0);

    const filteredUploads = uploads.filter(upload =>
        activeFilters.every(filter =>
            filter.optionIds.includes(upload.attributes?.[filter.typeId] ?? -1)
        )
    );

    const {
        selectedIds,
        setSelectedIds,
        allSelected,
        toggleAll,
        toggleOne
    } = useSelection(filteredUploads.map(upload => upload.id!));

    const selectedUploads = uploads.filter(upload => selectedIds.includes(upload.id!));

    function toggleOptionFilter(optionId: number) {
        setActiveOptionIds(current =>
            current.includes(optionId)
                ? current.filter(existing => existing !== optionId)
                : [...current, optionId]
        );
    }

    function exportCsv() {

        const headers = [
            "Name",
            ...attributeTypes.map(type => type.name),
            "Aufrufe",
            "Größe",
            "Maße",
            "Typ",
            "Hochgeladen",
            "Tags",
            "Link"
        ];

        const rows = filteredUploads.map(upload => [
            upload.name,
            ...attributeTypes.map(type => optionName(type, upload.attributes) ?? ""),
            String(upload.viewCount ?? 0),
            formatSize(upload.size),
            upload.width && upload.height ? `${upload.width} × ${upload.height}` : "",
            upload.mimeType,
            upload.createdAtFormatted ?? "",
            (upload.tags ?? []).map(tag => tag.name).join("; "),
            upload.publicUrl
        ]);

        const activeOptionNames = attributeTypes
            .flatMap(type => type.options)
            .filter(option => activeOptionIds.includes(option.id))
            .map(option => option.name.toLowerCase());

        const filename = activeOptionNames.length > 0
            ? `${activeOptionNames.join("-")}.csv`
            : "uploads.csv";

        downloadCsv(filename, toCsv(headers, rows));
    }

    return (
        <div>

            <div className="mb-2 flex items-center gap-2">

                <BulkDeleteButton
                    selectedIds={selectedIds}
                    onDeleted={() => setSelectedIds([])}
                />

                <BulkTagButton
                    selectedUploads={selectedUploads}
                    allTags={allTags}
                />

                <button
                    onClick={exportCsv}
                    disabled={filteredUploads.length === 0}
                    className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Download className="size-4" />
                    Als CSV exportieren
                </button>

            </div>

            <AttributeFilterBar
                types={filterTypes}
                activeOptionIds={activeOptionIds}
                onToggle={toggleOptionFilter}
                onReset={() => setActiveOptionIds([])}
            />

            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">

            <tr>
                <th className="w-10 p-3 text-center">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label="Alle auswählen"
                        className="size-4 accent-blue-600"
                    />
                </th>

                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Name
                </th>

                {attributeTypes.map(type => (
                    <th
                        key={type.id}
                        className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                        {type.name}
                    </th>
                ))}

                <th className="p-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Aufrufe
                </th>

                <th className="p-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Größe
                </th>

                <th className="p-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Maße
                </th>

                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Typ
                </th>

                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Hochgeladen
                </th>

                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Datei
                </th>
            </tr>

            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">

            {activeFilters.length > 0 && filteredUploads.length === 0 && (

                <tr>
                    <td
                        colSpan={8 + attributeTypes.length}
                        className="p-6 text-center text-sm text-gray-500"
                    >
                        Keine Bilder mit den ausgewählten Attributen gefunden.
                    </td>
                </tr>

            )}

            {filteredUploads.map(upload => (

                <tr
                    key={upload.id}
                    className="transition-colors hover:bg-gray-50"
                >

                    <td className="p-3 text-center">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(upload.id!)}
                            onChange={() => toggleOne(upload.id!)}
                            aria-label={`${upload.name} auswählen`}
                            className="size-4 accent-blue-600"
                        />
                    </td>

                    <td className="p-3">
                        <Link
                            href={`/uploads/${upload.id}`}
                            className="mb-1 block font-medium text-gray-900 hover:text-blue-600 hover:underline"
                        >
                            {upload.name}
                        </Link>
                        {getMissingAttributeTypes(attributeTypes, upload.attributes ?? {}).length > 0 && (
                            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                <AlertTriangle className="size-3" />
                                Attribute fehlen
                            </span>
                        )}
                        <TagEditor
                            tags={upload.tags ?? []}
                        />
                    </td>

                    {attributeTypes.map(type => (
                        <td key={type.id} className="p-3 text-gray-600">
                            {optionName(type, upload.attributes) ?? "—"}
                        </td>
                    ))}

                    <td className="p-3 text-right text-gray-600">
                        {upload.viewCount ?? 0}
                    </td>

                    <td className="p-3 text-right text-gray-600">
                        {formatSize(upload.size)}
                    </td>

                    <td className="p-3 text-right text-gray-600">
                        {upload.width && upload.height
                            ? `${upload.width} × ${upload.height}`
                            : "—"}
                    </td>

                    <td className="p-3 text-gray-600">
                        {upload.mimeType}
                    </td>

                    <td className="p-3 text-gray-600">
                        {upload.createdAtFormatted}
                    </td>

                    <td className="p-3">
                        <a
                            href={upload.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                            Öffnen
                            <ExternalLink className="size-3.5" />
                        </a>
                    </td>

                </tr>

            ))}

            </tbody>

            </table>
            </div>

        </div>
    );
}
