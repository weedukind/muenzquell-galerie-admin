import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getGroup, getGroupMembers } from "@/services/groupService";
import { getUsers } from "@/services/userService";
import GroupMembers from "../../components/GroupMembers";

export default async function GroupDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {

    const { id } = await params;

    const group = Number.isInteger(Number(id))
        ? await getGroup(Number(id))
        : null;

    if (!group)
        notFound();

    const [members, users] = await Promise.all([getGroupMembers(group.id), getUsers()]);

    // Everyone who can still be added: not a member yet and not deleted.
    const memberIds = new Set(members.map(member => member.id));
    const candidates = users
        .filter(user => !user.deletedAt && !memberIds.has(user.id))
        .map(user => ({ id: user.id, displayName: user.displayName, email: user.email }));

    return (
        <div className="mx-auto max-w-4xl p-6">

            <Link
                href="/groups"
                className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
            >
                <ArrowLeft className="size-4" />
                Alle Gruppen
            </Link>

            <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
                Gruppe „{group.name}“
            </h1>

            <GroupMembers groupId={group.id} members={members} candidates={candidates} />

        </div>
    );
}
