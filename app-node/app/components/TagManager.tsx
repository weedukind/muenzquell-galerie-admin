"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, X, Trash2 } from "lucide-react";
import { TagRecord } from "@/types/tag";
import { createTag, updateTag, deleteTag } from "@/lib/api";
import TagChip from "./TagChip";

interface Props {
    initialTags: TagRecord[];
}

export default function TagManager({ initialTags }: Props) {

    const router = useRouter();
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#3b82f6");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleCreate() {

        const name = newName.trim();

        if (!name)
            return;

        setBusy(true);

        try {
            await createTag(name, newColor);
            setNewName("");
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Tag konnte nicht erstellt werden.");
        }

        setBusy(false);
    }

    function startEdit(tag: TagRecord) {
        setEditingId(tag.id!);
        setEditName(tag.name);
        setEditColor(tag.color);
    }

    async function handleUpdate(id: number) {

        const name = editName.trim();

        if (!name)
            return;

        setBusy(true);

        try {
            await updateTag(id, name, editColor);
            setEditingId(null);
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Tag konnte nicht aktualisiert werden.");
        }

        setBusy(false);
    }

    async function handleDelete(tag: TagRecord) {

        const confirmMessage = tag.usageCount
            ? `"${tag.name}" wird bei ${tag.usageCount} Datei(en) verwendet. Trotzdem löschen?`
            : `Tag "${tag.name}" wirklich löschen?`;

        if (!confirm(confirmMessage))
            return;

        setBusy(true);

        try {
            await deleteTag(tag.id!);
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Tag konnte nicht gelöscht werden.");
        }

        setBusy(false);
    }

    return (
        <div>

            <div className="mb-6 flex items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">

                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Neues Tag
                    </label>
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Name"
                        className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
                    />
                </div>

                <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="h-9 w-9 rounded-md border border-gray-300"
                    aria-label="Farbe"
                />

                <button
                    onClick={handleCreate}
                    disabled={busy || !newName.trim()}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Plus className="size-4" />
                    Anlegen
                </button>

            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">

                    <tr>
                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Tag
                        </th>
                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Name
                        </th>
                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Farbe
                        </th>
                        <th className="p-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Verwendet
                        </th>
                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Aktionen
                        </th>
                    </tr>

                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">

                    {initialTags.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-6 text-center text-sm text-gray-500">
                                Noch keine Tags vorhanden.
                            </td>
                        </tr>
                    )}

                    {initialTags.map(tag => (

                        <tr key={tag.id} className="transition-colors hover:bg-gray-50">

                            <td className="p-3">
                                <TagChip tag={tag} active />
                            </td>

                            {editingId === tag.id ? (
                                <>
                                    <td className="p-3">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="color"
                                            value={editColor}
                                            onChange={e => setEditColor(e.target.value)}
                                            className="h-7 w-9 rounded-md border border-gray-300"
                                            aria-label="Farbe"
                                        />
                                    </td>
                                    <td className="p-3 text-right text-gray-600">
                                        {tag.usageCount ?? 0}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleUpdate(tag.id!)}
                                                disabled={busy}
                                                className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Check className="size-3.5" />
                                                Speichern
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300"
                                            >
                                                <X className="size-3.5" />
                                                Abbrechen
                                            </button>
                                        </div>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="p-3 font-medium text-gray-900">
                                        {tag.name}
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        {tag.color}
                                    </td>
                                    <td className="p-3 text-right text-gray-600">
                                        {tag.usageCount ?? 0}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => startEdit(tag)}
                                                className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                                            >
                                                <Pencil className="size-3.5" />
                                                Bearbeiten
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag)}
                                                disabled={busy}
                                                className="flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Trash2 className="size-3.5" />
                                                Löschen
                                            </button>
                                        </div>
                                    </td>
                                </>
                            )}

                        </tr>

                    ))}

                </tbody>

            </table>
            </div>

        </div>
    );
}
