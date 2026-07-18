"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUpload } from "@/lib/api";

interface Props {
    selectedIds: number[];
    onDeleted: () => void;
}

export default function BulkDeleteButton({ selectedIds, onDeleted }: Props) {

    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    async function deleteSelected() {

        if (selectedIds.length === 0)
            return;

        if (!confirm(`${selectedIds.length} Datei(en) wirklich löschen?`))
            return;

        setDeleting(true);

        const results = await Promise.allSettled(
            selectedIds.map(id => deleteUpload(id))
        );

        setDeleting(false);

        if (results.some(result => result.status === "rejected")) {
            alert("Nicht alle Dateien konnten gelöscht werden.");
        }

        onDeleted();
        router.refresh();
    }

    return (
        <button
            onClick={deleteSelected}
            disabled={selectedIds.length === 0 || deleting}
            className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
        >
            {deleting
                ? "Löschen läuft..."
                : `Ausgewählte löschen (${selectedIds.length})`}
        </button>
    );
}
