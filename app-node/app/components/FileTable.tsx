"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { UploadRecord } from "@/types/upload";
import { TagRecord } from "@/types/tag";
import { AttributeType, AttributeValues } from "@/types/attribute";
import { getMissingAttributeTypes } from "@/lib/attributes";
import { formatSize } from "@/lib/formatSize";
import { toCsv, downloadCsv } from "@/lib/csv";
import { DEFAULT_SORT, formatIdParam, OPTIONS_PARAM, parseIdParam, parseSortParam, PEOPLE_PARAM, SORT_PARAM, SortOrder } from "@/lib/filterParams";
import { Download, ExternalLink, AlertTriangle } from "lucide-react";
import { useSelection } from "@/hooks/useSelection";
import { useHiddenColumns } from "@/hooks/useHiddenColumns";
import TagEditor from "./TagEditor";
import UploadFilterBar from "./UploadFilterBar";
import BulkDeleteButton from "./BulkDeleteButton";
import BulkTagButton from "./BulkTagButton";
import ColumnPicker from "./ColumnPicker";

interface Column {
    key: string;
    label: string;
    align?: "right";
    render: (upload: UploadRecord) => ReactNode;
}

interface FileTableProps {
    uploads: UploadRecord[];
    allTags: TagRecord[];
    attributeTypes: AttributeType[];
}

export default function FileTable({uploads, allTags, attributeTypes}: FileTableProps) {

    function optionName(type: AttributeType, values: AttributeValues | undefined): string | undefined {
        return type.options.find(option => option.id === values?.[type.id])?.name;
    }

    // The filter lives in the URL, as in the frontend: linkable, and "back" undoes it.
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const activeOptionIds = parseIdParam(searchParams.get(OPTIONS_PARAM));
    const activePersonIds = parseIdParam(searchParams.get(PEOPLE_PARAM));
    const sort = parseSortParam(searchParams.get(SORT_PARAM));

    // Everyone tagged on at least one upload, by name.
    const people = [...new Map(
        uploads.flatMap(upload => upload.people ?? []).map(person => [person.id, person])
    ).values()].sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));

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

    const filtering = activeFilters.length > 0 || activePersonIds.length > 0;

    const filteredUploads = uploads
        .filter(upload =>
            activeFilters.every(filter =>
                filter.optionIds.includes(upload.attributes?.[filter.typeId] ?? -1)
            )
            && (activePersonIds.length === 0
                || upload.people?.some(person => activePersonIds.includes(person.id)))
        )
        .sort(compareUploads(sort));

    const {
        selectedIds,
        setSelectedIds,
        allSelected,
        toggleAll,
        toggleOne
    } = useSelection(filteredUploads.map(upload => upload.id!));

    const selectedUploads = uploads.filter(upload => selectedIds.includes(upload.id!));

    function updateParams(update: (params: URLSearchParams) => void) {
        const params = new URLSearchParams(searchParams.toString());
        update(params);
        const query = params.toString();
        window.history.pushState(null, "", query ? `?${query}` : pathname);
    }

    function toggleIdParam(name: string, current: number[], id: number) {
        const next = current.includes(id)
            ? current.filter(existing => existing !== id)
            : [...current, id];
        updateParams(params => {
            if (next.length > 0)
                params.set(name, formatIdParam(next));
            else
                params.delete(name);
        });
    }

    function setSort(value: SortOrder) {
        updateParams(params => {
            if (value === DEFAULT_SORT)
                params.delete(SORT_PARAM);
            else
                params.set(SORT_PARAM, value);
        });
    }

    function exportCsv() {

        const headers = [
            "ID",
            "Name",
            ...attributeTypes.map(type => type.name),
            "Größe",
            "Maße",
            "Typ",
            "Hochgeladen",
            "Tags",
            "Personen",
            "Likes",
            "Aufrufe",
            "Link"
        ];

        const rows = filteredUploads.map(upload => [
            String(upload.id),
            upload.name,
            ...attributeTypes.map(type => optionName(type, upload.attributes) ?? ""),
            formatSize(upload.size),
            upload.width && upload.height ? `${upload.width} × ${upload.height}` : "",
            upload.mimeType,
            upload.createdAtFormatted ?? "",
            (upload.tags ?? []).map(tag => tag.name).join("; "),
            (upload.people ?? []).map(person => person.name).join("; "),
            String(upload.likeCount ?? 0),
            String(upload.viewCount ?? 0),
            upload.publicUrl
        ]);

        const activeOptionNames = [
            ...attributeTypes
                .flatMap(type => type.options)
                .filter(option => activeOptionIds.includes(option.id)),
            ...people.filter(person => activePersonIds.includes(person.id))
        ].map(option => option.name.toLowerCase());

        const filename = activeOptionNames.length > 0
            ? `${activeOptionNames.join("-")}.csv`
            : "uploads.csv";

        downloadCsv(filename, toCsv(headers, rows));
    }

    // Every column except the checkbox and the name can be hidden.
    const columns: Column[] = [
        {
            key: "id",
            label: "ID",
            align: "right",
            render: upload => upload.id
        },
        ...attributeTypes.map(type => ({
            key: `attribute-${type.id}`,
            label: type.name,
            render: (upload: UploadRecord) => optionName(type, upload.attributes) ?? "—"
        })),
        {
            key: "people",
            label: "Personen",
            render: upload => upload.people && upload.people.length > 0
                ? upload.people.map(person => person.name).join(", ")
                : "—"
        },
        {
            key: "likes",
            label: "Likes",
            align: "right",
            render: upload => upload.likeCount ?? 0
        },
        {
            key: "views",
            label: "Aufrufe",
            align: "right",
            render: upload => upload.viewCount ?? 0
        },
        {
            key: "size",
            label: "Größe",
            align: "right",
            render: upload => formatSize(upload.size)
        },
        {
            key: "dimensions",
            label: "Maße",
            align: "right",
            render: upload => upload.width && upload.height
                ? `${upload.width} × ${upload.height}`
                : "—"
        },
        {
            key: "mimeType",
            label: "Typ",
            render: upload => upload.mimeType
        },
        {
            key: "createdAt",
            label: "Hochgeladen",
            render: upload => upload.createdAtFormatted
        },
        {
            key: "file",
            label: "Datei",
            render: upload => (
                <a
                    href={upload.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                    Öffnen
                    <ExternalLink className="size-3.5" />
                </a>
            )
        }
    ];

    const { hiddenKeys, setHiddenKeys } = useHiddenColumns();
    const visibleColumns = columns.filter(column => !hiddenKeys.includes(column.key));

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

                <div className="ml-auto">
                    <ColumnPicker
                        columns={columns}
                        hiddenKeys={hiddenKeys}
                        onChange={setHiddenKeys}
                    />
                </div>

            </div>

            <UploadFilterBar
                types={filterTypes}
                people={people}
                selectedOptionIds={activeOptionIds}
                selectedPersonIds={activePersonIds}
                sort={sort}
                onToggleOption={optionId => toggleIdParam(OPTIONS_PARAM, activeOptionIds, optionId)}
                onTogglePerson={personId => toggleIdParam(PEOPLE_PARAM, activePersonIds, personId)}
                onSortChange={setSort}
                onReset={() => updateParams(params => {
                    params.delete(OPTIONS_PARAM);
                    params.delete(PEOPLE_PARAM);
                })}
            />

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
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

                {visibleColumns.map(column => (
                    <th
                        key={column.key}
                        className={`p-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${column.align === "right" ? "text-right" : "text-left"}`}
                    >
                        {column.label}
                    </th>
                ))}
            </tr>

            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">

            {filtering && filteredUploads.length === 0 && (

                <tr>
                    <td
                        colSpan={2 + visibleColumns.length}
                        className="p-6 text-center text-sm text-gray-500"
                    >
                        Keine Bilder zu den ausgewählten Filtern gefunden.
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

                    {visibleColumns.map(column => (
                        <td
                            key={column.key}
                            className={`p-3 text-gray-600 ${column.align === "right" ? "text-right" : ""}`}
                        >
                            {column.render(upload)}
                        </td>
                    ))}

                </tr>

            ))}

            </tbody>

            </table>
            </div>

        </div>
    );
}

// As in the frontend: newest or oldest first, or by likes or views with ties broken by newest first.
function compareUploads(sort: SortOrder): (a: UploadRecord, b: UploadRecord) => number {

    const byId = (a: UploadRecord, b: UploadRecord) => b.id! - a.id!;

    if (sort === "alt")
        return (a, b) => a.id! - b.id!;

    if (sort === "likes")
        return (a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0) || byId(a, b);

    if (sort === "aufrufe")
        return (a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0) || byId(a, b);

    return byId;
}
