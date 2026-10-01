"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, UserMinus, UserPlus } from "lucide-react";
import { GroupMember } from "@/types/group";
import { addGroupMember, removeGroupMember } from "@/lib/api";
import { formatDateTime } from "@/lib/formatDateTime";

interface Candidate {
    id: number;
    displayName: string;
    email: string;
}

interface Props {
    groupId: number;
    members: GroupMember[];
    // users who can be added: not a member yet and not deleted
    candidates: Candidate[];
}

const headerCell = "p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function GroupMembers({ groupId, members, candidates }: Props) {

    const router = useRouter();
    const [selectedId, setSelectedId] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleAdd() {

        if (!selectedId)
            return;

        setBusy(true);

        try {
            await addGroupMember(groupId, Number(selectedId));
            setSelectedId("");
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Benutzer konnte nicht hinzugefügt werden.");
        }

        setBusy(false);
    }

    async function handleRemove(member: GroupMember) {

        const label = member.deletedAt ? "Das gelöschte Konto" : `"${member.displayName}"`;

        if (!confirm(`${label} aus der Gruppe entfernen?`))
            return;

        setBusy(true);

        try {
            await removeGroupMember(groupId, member.id);
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Benutzer konnte nicht entfernt werden.");
        }

        setBusy(false);
    }

    return (
        <div>

            <form
                onSubmit={event => { event.preventDefault(); handleAdd(); }}
                className="mb-6 flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >

                <div className="min-w-0 flex-1">
                    <label htmlFor="add-member" className="mb-1 block text-xs font-medium text-gray-600">
                        Benutzer hinzufügen
                    </label>
                    <select
                        id="add-member"
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                        disabled={candidates.length === 0}
                        className="w-full max-w-md rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-400 focus:outline-none disabled:text-gray-400"
                    >
                        <option value="">
                            {candidates.length === 0 ? "Alle Benutzer sind schon Mitglied" : "Benutzer auswählen …"}
                        </option>
                        {candidates.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.displayName} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={busy || !selectedId}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <UserPlus className="size-4" />
                    Hinzufügen
                </button>

            </form>

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">
                    <tr>
                        <th className={headerCell}>Anzeigename</th>
                        <th className={headerCell}>E-Mail</th>
                        <th className={headerCell}>Mitglied seit</th>
                        <th className={headerCell}>Aktionen</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white text-sm">

                    {members.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-6 text-center text-gray-500">
                                Diese Gruppe hat noch keine Mitglieder.
                            </td>
                        </tr>
                    )}

                    {members.map(member => (

                        <tr key={member.id} className="transition-colors hover:bg-gray-50">

                            {/* A deleted account only has placeholders left. */}
                            {member.deletedAt ? (
                                <td colSpan={2} className="p-3 text-gray-400">
                                    Gelöschtes Konto
                                </td>
                            ) : (
                                <>
                                    <td className="p-3 font-medium text-gray-900">
                                        <span className="inline-flex items-center gap-1.5">
                                            {member.displayName}
                                            {member.isLocked && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                                    <Lock className="size-3" />
                                                    Gesperrt
                                                </span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        {member.email}
                                    </td>
                                </>
                            )}

                            <td className="p-3 text-gray-600">
                                {formatDateTime(member.addedAt)}
                            </td>

                            <td className="p-3">
                                <button
                                    onClick={() => handleRemove(member)}
                                    disabled={busy}
                                    className="flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <UserMinus className="size-3.5" />
                                    Entfernen
                                </button>
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>
            </div>

        </div>
    );
}
