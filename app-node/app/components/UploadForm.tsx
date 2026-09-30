"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileIcon, CheckCircle2, XCircle } from "lucide-react";
import { AttributeType, AttributeValues } from "@/types/attribute";
import { getMissingAttributeTypes } from "@/lib/attributes";
import { uploadFileWithProgress } from "@/lib/api";
import { settleAll } from "@/lib/bulkAction";
import ProgressBar from "./ProgressBar";
import AttributeSelects from "./AttributeSelects";

interface Props {
    attributeTypes: AttributeType[];
}

interface FileState {
    progress: number;
    error: boolean;
    // why the upload failed, e.g. that the image was uploaded before
    message?: string;
}

export default function UploadForm({ attributeTypes }: Props) {

    const router = useRouter();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [fileStates, setFileStates] = useState<FileState[]>([]);
    const [uploading, setUploading] = useState(false);
    const [attributeValues, setAttributeValues] = useState<AttributeValues>({});

    const missingAttributes = getMissingAttributeTypes(attributeTypes, attributeValues);

    function onSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        setFileStates(files.map(() => ({ progress: 0, error: false })));
    }

    function updateFileState(index: number, patch: Partial<FileState>) {
        setFileStates(current =>
            current.map((state, i) => (i === index ? { ...state, ...patch } : state))
        );
    }

    async function upload() {

        if (selectedFiles.length === 0 || missingAttributes.length > 0)
            return;

        setUploading(true);

        const { results, failureCount } = await settleAll(
            selectedFiles.map((file, index) =>
                uploadFileWithProgress(file, attributeValues, pct => updateFileState(index, { progress: pct }))
            )
        );

        setUploading(false);

        results.forEach((result, index) => {
            if (result.status === "rejected") {
                updateFileState(index, {
                    error: true,
                    message: result.reason instanceof Error ? result.reason.message : undefined
                });
            }
        });

        if (failureCount > 0) {
            alert(`${failureCount} Datei(en) konnten nicht hochgeladen werden.`);
        }

        if (failureCount === 0) {
            router.push("/");
        }
    }

    return (
        <div className="space-y-6">

            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50">
                <UploadCloud className="size-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                    Dateien auswählen oder hierher ziehen
                </span>
                <span className="text-xs text-gray-500">
                    Mehrfachauswahl möglich
                </span>
                <input
                    type="file"
                    multiple
                    onChange={onSelectFiles}
                    className="hidden"
                />
            </label>

            {selectedFiles.length > 0 && (

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">

                    <h2 className="mb-3 text-sm font-semibold text-gray-700">
                        Ausgewählte Dateien
                    </h2>

                    <ul className="space-y-3">

                        {selectedFiles.map((file, index) => (
                            <li key={`${file.name}-${index}`}>
                                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                                    <span className="flex min-w-0 items-center gap-1.5 truncate text-gray-700">
                                        <FileIcon className="size-3.5 shrink-0 text-gray-400" />
                                        <span className="truncate">{file.name}</span>
                                    </span>
                                    <span className="flex shrink-0 items-center gap-1 text-xs">
                                        {fileStates[index]?.error ? (
                                            <span className="flex items-center gap-1 text-red-600">
                                                <XCircle className="size-3.5" />
                                                Fehlgeschlagen
                                            </span>
                                        ) : fileStates[index]?.progress === 100 ? (
                                            <span className="flex items-center gap-1 text-emerald-600">
                                                <CheckCircle2 className="size-3.5" />
                                                Fertig
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">
                                                {fileStates[index]?.progress ?? 0}%
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <ProgressBar
                                    percent={fileStates[index]?.progress ?? 0}
                                    error={fileStates[index]?.error}
                                />
                                {fileStates[index]?.message && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fileStates[index].message}
                                    </p>
                                )}
                            </li>
                        ))}

                    </ul>

                    {attributeTypes.length > 0 && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                            <h2 className="mb-3 text-sm font-semibold text-gray-700">
                                Attribute
                            </h2>
                            <AttributeSelects
                                types={attributeTypes}
                                values={attributeValues}
                                onChange={setAttributeValues}
                                disabled={uploading}
                            />
                        </div>
                    )}

                    <div className="mt-4 flex items-center gap-2">

                        <button
                            onClick={upload}
                            disabled={uploading || missingAttributes.length > 0}
                            title={missingAttributes.length > 0
                                ? `Bitte zuerst auswählen: ${missingAttributes.map(type => type.name).join(", ")}`
                                : undefined}
                            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <UploadCloud className="size-4" />
                            {uploading
                                ? "Upload läuft…"
                                : "Zu Cloudflare hochladen"}
                        </button>

                        {missingAttributes.length > 0 && (
                            <span className="text-xs text-amber-700">
                                Bitte alle Attribute auswählen.
                            </span>
                        )}

                    </div>

                </div>

            )}

        </div>
    );
}
