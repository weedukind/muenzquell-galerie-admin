"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TagRecord } from "@/types/tag";
import { assignTag, uploadFileWithProgress } from "@/lib/api";
import TagPicker from "./TagPicker";
import ProgressBar from "./ProgressBar";

interface Props {
    allTags: TagRecord[];
}

interface FileState {
    progress: number;
    error: boolean;
}

export default function UploadForm({ allTags }: Props) {

    const router = useRouter();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [fileStates, setFileStates] = useState<FileState[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [showTagPicker, setShowTagPicker] = useState(false);

    function onSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        setFileStates(files.map(() => ({ progress: 0, error: false })));
    }

    function saveTagSelection(tagIds: number[]) {
        setSelectedTagIds(tagIds);
        setShowTagPicker(false);
    }

    function updateFileState(index: number, patch: Partial<FileState>) {
        setFileStates(current =>
            current.map((state, i) => (i === index ? { ...state, ...patch } : state))
        );
    }

    async function upload() {

        if (selectedFiles.length === 0)
            return;

        setUploading(true);

        const results = await Promise.allSettled(
            selectedFiles.map((file, index) =>
                uploadFileWithProgress(file, pct => updateFileState(index, { progress: pct }))
            )
        );

        setUploading(false);

        const uploaded = [];

        for (let index = 0; index < results.length; index++) {

            const result = results[index];

            if (result.status === "fulfilled") {
                uploaded.push(result.value);
            } else {
                updateFileState(index, { error: true });
            }
        }

        const failedCount = results.length - uploaded.length;

        if (failedCount > 0) {
            alert(`${failedCount} Datei(en) konnten nicht hochgeladen werden.`);
        }

        if (selectedTagIds.length > 0 && uploaded.length > 0) {
            await Promise.all(
                uploaded.flatMap(file =>
                    selectedTagIds.map(tagId => assignTag(file.id, tagId))
                )
            );
        }

        if (failedCount === 0) {
            router.push("/");
        }
    }

    return (
        <div className="space-y-6">

            <input
                type="file"
                multiple
                onChange={onSelectFiles}
            />

            {selectedFiles.length > 0 && (

                <div>

                    <h2 className="font-semibold mb-2">
                        Ausgewählte Dateien
                    </h2>

                    <ul className="space-y-2">

                        {selectedFiles.map((file, index) => (
                            <li key={`${file.name}-${index}`}>
                                <div className="flex justify-between text-sm">
                                    <span>{file.name}</span>
                                    <span>
                                        {fileStates[index]?.error
                                            ? "Fehlgeschlagen"
                                            : `${fileStates[index]?.progress ?? 0}%`}
                                    </span>
                                </div>
                                <ProgressBar
                                    percent={fileStates[index]?.progress ?? 0}
                                    error={fileStates[index]?.error}
                                />
                            </li>
                        ))}

                    </ul>

                    <div className="relative mt-4 inline-block">

                        <button
                            onClick={() => setShowTagPicker(current => !current)}
                            className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                        >
                            {selectedTagIds.length > 0
                                ? `Tags (${selectedTagIds.length})`
                                : "Tags auswählen"}
                        </button>

                        {showTagPicker && (
                            <TagPicker
                                currentTagIds={selectedTagIds}
                                allTags={allTags}
                                onSave={saveTagSelection}
                            />
                        )}

                    </div>

                    <div>
                        <button
                            onClick={upload}
                            disabled={uploading}
                            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading
                                ? "Upload läuft..."
                                : "Zu Cloudflare hochladen"}
                        </button>
                    </div>

                </div>

            )}

        </div>
    );
}
