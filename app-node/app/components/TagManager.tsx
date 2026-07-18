"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

            <div className="mb-4 flex items-end gap-2">

                <div>
                    <label className="block text-sm text-gray-600">
                        Neues Tag
                    </label>
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Name"
                        className="rounded border border-gray-300 px-2 py-1"
                    />
                </div>

                <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="h-9 w-9 rounded border border-gray-300"
                    aria-label="Farbe"
                />

                <button
                    onClick={handleCreate}
                    disabled={busy || !newName.trim()}
                    className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    Anlegen
                </button>

            </div>

            <table className="min-w-full border border-gray-300 border-collapse">

                <thead className="bg-gray-100 text-black">

                    <tr>
                        <th className="border border-gray-300 p-2 text-left">
                            Tag
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                            Name
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                            Farbe
                        </th>
                        <th className="border border-gray-300 p-2 text-right">
                            Verwendet
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                            Aktionen
                        </th>
                    </tr>

                </thead>

                <tbody>

                    {initialTags.length === 0 && (
                        <tr>
                            <td colSpan={5} className="border border-gray-300 p-2 text-center text-gray-500">
                                Noch keine Tags vorhanden.
                            </td>
                        </tr>
                    )}

                    {initialTags.map(tag => (

                        <tr key={tag.id} className="hover:bg-gray-50">

                            <td className="border border-gray-300 p-2">
                                <TagChip tag={tag} active />
                            </td>

                            {editingId === tag.id ? (
                                <>
                                    <td className="border border-gray-300 p-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="w-full rounded border border-gray-300 px-1"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <input
                                            type="color"
                                            value={editColor}
                                            onChange={e => setEditColor(e.target.value)}
                                            className="h-7 w-9"
                                            aria-label="Farbe"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2 text-right">
                                        {tag.usageCount ?? 0}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <button
                                            onClick={() => handleUpdate(tag.id!)}
                                            disabled={busy}
                                            className="mr-2 rounded bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Speichern
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="rounded bg-gray-300 px-2 py-0.5 text-xs hover:bg-gray-400"
                                        >
                                            Abbrechen
                                        </button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="border border-gray-300 p-2">
                                        {tag.name}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        {tag.color}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-right">
                                        {tag.usageCount ?? 0}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <button
                                            onClick={() => startEdit(tag)}
                                            className="mr-2 rounded bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-700"
                                        >
                                            Bearbeiten
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tag)}
                                            disabled={busy}
                                            className="rounded bg-red-600 px-2 py-0.5 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                                        >
                                            Löschen
                                        </button>
                                    </td>
                                </>
                            )}

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}
