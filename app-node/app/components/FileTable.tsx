"use client";

import { useState } from "react";
import { UploadRecord } from "@/types/upload";
import { TagRecord } from "@/types/tag";
import { formatSize } from "@/lib/formatSize";
import { toCsv, downloadCsv } from "@/lib/csv";
import { useSelection } from "@/hooks/useSelection";
import TagEditor from "./TagEditor";
import TagFilterBar from "./TagFilterBar";
import BulkDeleteButton from "./BulkDeleteButton";
import BulkTagButton from "./BulkTagButton";

interface FileTableProps {
    uploads: UploadRecord[];
    allTags: TagRecord[];
}

export default function FileTable({uploads, allTags}: FileTableProps) {

    const [activeTagFilters, setActiveTagFilters] = useState<number[]>([]);

    const filteredUploads = activeTagFilters.length === 0
        ? uploads
        : uploads.filter(upload =>
            activeTagFilters.every(tagId =>
                upload.tags?.some(tag => tag.id === tagId)
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

    function toggleTagFilter(tagId: number) {
        setActiveTagFilters(current =>
            current.includes(tagId)
                ? current.filter(existing => existing !== tagId)
                : [...current, tagId]
        );
    }

    function exportCsv() {

        const headers = ["Name", "Größe", "Maße", "Typ", "Hochgeladen", "Tags", "Link"];

        const rows = filteredUploads.map(upload => [
            upload.name,
            formatSize(upload.size),
            upload.width && upload.height ? `${upload.width} × ${upload.height}` : "",
            upload.mimeType,
            upload.createdAtFormatted ?? "",
            (upload.tags ?? []).map(tag => tag.name).join("; "),
            upload.publicUrl
        ]);

        const activeTagNames = activeTagFilters
            .map(tagId => allTags.find(tag => tag.id === tagId)?.name)
            .filter((name): name is string => !!name)
            .map(name => name.toLowerCase());

        const filename = activeTagNames.length > 0
            ? `${activeTagNames.join("-")}.csv`
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
                    className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:opacity-50"
                >
                    Als CSV exportieren
                </button>

            </div>

            <TagFilterBar
                allTags={allTags}
                activeTagIds={activeTagFilters}
                onToggle={toggleTagFilter}
                onReset={() => setActiveTagFilters([])}
            />

            <table className="min-w-full border border-gray-300 border-collapse">

            <thead className="bg-gray-100 text-black">

            <tr>
                <th className="border border-gray-300 p-2 text-center">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label="Alle auswählen"
                    />
                </th>

                <th className="border border-gray-300 p-2 text-left">
                    Name
                </th>

                <th className="border border-gray-300 p-2 text-right">
                    Größe
                </th>

                <th className="border border-gray-300 p-2 text-right">
                    Maße
                </th>

                <th className="border border-gray-300 p-2 text-left">
                    Typ
                </th>

                <th className="border border-gray-300 p-2 text-left">
                    Hochgeladen
                </th>

                <th className="border border-gray-300 p-2 text-left">
                    Datei
                </th>
            </tr>

            </thead>

            <tbody>

            {activeTagFilters.length > 0 && filteredUploads.length === 0 && (

                <tr>
                    <td
                        colSpan={7}
                        className="border border-gray-300 p-2 text-center text-gray-500"
                    >
                        Keine Bilder mit allen ausgewählten Tags gefunden.
                    </td>
                </tr>

            )}

            {filteredUploads.map(upload => (

                <tr
                    key={upload.id}
                    className="hover:bg-gray-50"
                >

                    <td className="border border-gray-300 p-2 text-center">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(upload.id!)}
                            onChange={() => toggleOne(upload.id!)}
                            aria-label={`${upload.name} auswählen`}
                        />
                    </td>

                    <td className="border border-gray-300 p-2">
                        <div className="mb-1">{upload.name}</div>
                        <TagEditor
                            tags={upload.tags ?? []}
                        />
                    </td>

                    <td className="border border-gray-300 p-2 text-right">
                        {formatSize(upload.size)}
                    </td>

                    <td className="border border-gray-300 p-2 text-right">
                        {upload.width && upload.height
                            ? `${upload.width} × ${upload.height}`
                            : "—"}
                    </td>

                    <td className="border border-gray-300 p-2">
                        {upload.mimeType}
                    </td>

                    <td className="border border-gray-300 p-2">
                        {upload.createdAtFormatted}
                    </td>

                    <td className="border border-gray-300 p-2">
                        <a
                            href={upload.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            Öffnen
                        </a>
                    </td>

                </tr>

            ))}

            </tbody>

            </table>

        </div>
    );
}
