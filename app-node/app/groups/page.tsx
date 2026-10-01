import { connection } from "next/server";
import { getGroups } from "@/services/groupService";
import GroupManager from "../components/GroupManager";

export default async function GroupsPage() {

    await connection();

    const groups = await getGroups();

    return (
        <div className="mx-auto max-w-4xl p-6">

            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
                Gruppen
            </h1>

            <p className="mb-6 text-sm text-gray-600">
                Benutzer können beliebig vielen Gruppen angehören. Mitglieder verwaltest du auf der Seite der jeweiligen Gruppe.
            </p>

            <GroupManager initialGroups={groups} />

        </div>
    );
}
