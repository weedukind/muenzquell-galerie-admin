"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteUpload } from "@/lib/api";
import { settleAll } from "@/lib/bulkAction";

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

        const { failureCount } = await settleAll(selectedIds.map(id => deleteUpload(id)));

        setDeleting(false);

        if (failureCount > 0) {
            alert("Nicht alle Dateien konnten gelöscht werden.");
        }

        onDeleted();
        router.refresh();
    }

    return (
        <button
            onClick={deleteSelected}
            disabled={selectedIds.length === 0 || deleting}
            className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
            <Trash2 className="size-4" />
            {deleting
                ? "Löschen läuft…"
                : `Löschen (${selectedIds.length})`}
        </button>
    );
}
