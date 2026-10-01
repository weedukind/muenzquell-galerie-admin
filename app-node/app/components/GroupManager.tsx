"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, X, Trash2 } from "lucide-react";
import { GroupRecord } from "@/types/group";
import { createGroup, renameGroup, deleteGroup } from "@/lib/api";

interface Props {
    initialGroups: GroupRecord[];
}

export default function GroupManager({ initialGroups }: Props) {

    const router = useRouter();
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleCreate() {

        const name = newName.trim();

        if (!name)
            return;

        setBusy(true);

        try {
            await createGroup(name);
            setNewName("");
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Gruppe konnte nicht angelegt werden.");
        }

        setBusy(false);
    }

    function startEdit(group: GroupRecord) {
        setEditingId(group.id);
        setEditName(group.name);
    }

    async function handleRename(id: number) {

        const name = editName.trim();

        if (!name)
            return;

        setBusy(true);

        try {
            await renameGroup(id, name);
            setEditingId(null);
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Gruppe konnte nicht umbenannt werden.");
        }

        setBusy(false);
    }

    async function handleDelete(group: GroupRecord) {

        const confirmMessage = group.memberCount > 0
            ? `Gruppe "${group.name}" hat ${group.memberCount} Mitglied(er). Trotzdem löschen? Die Benutzer selbst bleiben erhalten.`
            : `Gruppe "${group.name}" wirklich löschen?`;

        if (!confirm(confirmMessage))
            return;

        setBusy(true);

        try {
            await deleteGroup(group.id);
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Gruppe konnte nicht gelöscht werden.");
        }

        setBusy(false);
    }

    return (
        <div>

            <form
                onSubmit={event => { event.preventDefault(); handleCreate(); }}
                className="mb-6 flex items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >

                <div>
                    <label htmlFor="new-group" className="mb-1 block text-xs font-medium text-gray-600">
                        Neue Gruppe
                    </label>
                    <input
                        id="new-group"
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Name"
                        maxLength={100}
                        className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={busy || !newName.trim()}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Plus className="size-4" />
                    Anlegen
                </button>

            </form>

            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">

                    <tr>
                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Name
                        </th>
                        <th className="p-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Mitglieder
                        </th>
                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Aktionen
                        </th>
                    </tr>

                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">

                    {initialGroups.length === 0 && (
                        <tr>
                            <td colSpan={3} className="p-6 text-center text-sm text-gray-500">
                                Noch keine Gruppen vorhanden.
                            </td>
                        </tr>
                    )}

                    {initialGroups.map(group => (

                        <tr key={group.id} className="transition-colors hover:bg-gray-50">

                            {editingId === group.id ? (
                                <>
                                    <td className="p-3">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") handleRename(group.id);
                                                if (e.key === "Escape") setEditingId(null);
                                            }}
                                            maxLength={100}
                                            autoFocus
                                            aria-label="Name der Gruppe"
                                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                                        />
                                    </td>
                                    <td className="p-3 text-right text-gray-600">
                                        {group.memberCount}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRename(group.id)}
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
                                    <td className="p-3">
                                        <Link
                                            href={`/groups/${group.id}`}
                                            className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                        >
                                            {group.name}
                                        </Link>
                                    </td>
                                    <td className="p-3 text-right text-gray-600">
                                        {group.memberCount}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => startEdit(group)}
                                                className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                                            >
                                                <Pencil className="size-3.5" />
                                                Umbenennen
                                            </button>
                                            <button
                                                onClick={() => handleDelete(group)}
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
