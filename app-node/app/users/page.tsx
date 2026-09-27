import { connection } from "next/server";
import { getUsers } from "@/services/userService";
import UserTable from "../components/UserTable";

export default async function UsersPage() {

    await connection();

    const users = await getUsers();

    return (
        <div className="mx-auto max-w-6xl p-6">

            <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
                Benutzer
            </h1>

            <UserTable users={users} />

        </div>
    );
}
