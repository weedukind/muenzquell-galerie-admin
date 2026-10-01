"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, LockOpen, LogOut, UserX } from "lucide-react";
import { UserRecord } from "@/types/user";
import { setUserLocked, logoutUser } from "@/lib/api";
import { formatDateTime } from "@/lib/formatDateTime";

interface Props {
    users: UserRecord[];
}

const headerCell = "p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function UserTable({ users }: Props) {

    const router = useRouter();
    const [busyId, setBusyId] = useState<number | null>(null);

    async function toggleLock(user: UserRecord) {

        const locking = !user.isLocked;

        if (locking && !confirm(`"${user.displayName}" (${user.email}) wirklich sperren? Der Benutzer wird dabei auch ausgeloggt.`))
            return;

        setBusyId(user.id);

        try {
            await setUserLocked(user.id, locking);
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Status konnte nicht geändert werden.");
        }

        setBusyId(null);
    }

    async function logout(user: UserRecord) {

        if (!confirm(`"${user.displayName}" auf allen Geräten ausloggen?`))
            return;

        setBusyId(user.id);

        try {
            await logoutUser(user.id);
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Benutzer konnte nicht ausgeloggt werden.");
        }

        setBusyId(null);
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">
                    <tr>
                        <th className={headerCell}>E-Mail</th>
                        <th className={headerCell}>Anzeigename</th>
                        <th className={headerCell}>Status</th>
                        <th className={headerCell}>Gruppen</th>
                        <th className={headerCell}>Eingeladen von</th>
                        <th className={headerCell}>Letzter Login</th>
                        <th className={headerCell}>Session</th>
                        <th className={headerCell}>Aktionen</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">

                    {users.length === 0 && (
                        <tr>
                            <td colSpan={8} className="p-6 text-center text-sm text-gray-500">
                                Noch keine Benutzer vorhanden.
                            </td>
                        </tr>
                    )}

                    {users.map(user => (

                        <tr key={user.id} className="transition-colors hover:bg-gray-50">

                            {/* A deleted account only has placeholders left. */}
                            {user.deletedAt ? (
                                <td colSpan={2} className="p-3 text-gray-400">
                                    Gelöschtes Konto
                                </td>
                            ) : (
                                <>
                                    <td className="p-3 text-gray-900">
                                        {user.email}
                                    </td>

                                    <td className="p-3 font-medium text-gray-900">
                                        {user.displayName}
                                    </td>
                                </>
                            )}

                            <td className="p-3">
                                {user.deletedAt ? (
                                    <div>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                            <UserX className="size-3" />
                                            Gelöscht
                                        </span>
                                        <div className="mt-0.5 text-xs text-gray-500">
                                            am {formatDateTime(user.deletedAt)}
                                        </div>
                                    </div>
                                ) : user.isLocked ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                        <Lock className="size-3" />
                                        Gesperrt
                                    </span>
                                ) : (
                                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                        Aktiv
                                    </span>
                                )}
                            </td>

                            <td className="p-3">
                                {user.groups.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {user.groups.map(group => (
                                            <Link
                                                key={group.id}
                                                href={`/groups/${group.id}`}
                                                className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 hover:bg-indigo-200"
                                            >
                                                {group.name}
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>

                            <td className="p-3 text-gray-600">
                                {user.invitedByDeleted
                                    ? <span className="text-gray-400">Gelöschtes Konto</span>
                                    : user.invitedByName ?? "—"}
                            </td>

                            <td className="p-3 text-gray-600">
                                {user.lastLoginAt
                                    ? formatDateTime(user.lastLoginAt)
                                    : <span className="text-gray-400">{user.deletedAt ? "Noch nie" : "Noch nie (Einladung offen)"}</span>}
                            </td>

                            <td className="p-3">
                                {user.activeSessionCount > 0 ? (
                                    <div>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
                                            <span className="size-1.5 rounded-full bg-sky-500" />
                                            Angemeldet
                                            {user.activeSessionCount > 1 && ` (${user.activeSessionCount} Geräte)`}
                                        </span>
                                        {user.lastSessionStartedAt && (
                                            <div className="mt-0.5 text-xs text-gray-500">
                                                seit {formatDateTime(user.lastSessionStartedAt)}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>

                            <td className="p-3">
                                {/* Nothing left to lock or log out: the frontend ignores deleted users. */}
                                {user.deletedAt ? (
                                    <span className="text-gray-400">—</span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => logout(user)}
                                            disabled={busyId !== null || user.activeSessionCount === 0}
                                            className="flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <LogOut className="size-3.5" />
                                            Ausloggen
                                        </button>
                                        <button
                                            onClick={() => toggleLock(user)}
                                            disabled={busyId !== null}
                                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${user.isLocked
                                                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                : "bg-red-600 text-white hover:bg-red-700"}`}
                                        >
                                            {user.isLocked ? (
                                                <>
                                                    <LockOpen className="size-3.5" />
                                                    Entsperren
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="size-3.5" />
                                                    Sperren
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>
        </div>
    );
}
