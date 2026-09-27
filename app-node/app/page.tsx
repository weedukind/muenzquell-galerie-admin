import { connection } from "next/server";
import { getUploads } from "@/services/uploadService";
import { getTags } from "@/services/tagService";
import FileManager from "./components/FileManager";

export default async function HomePage() {

    await connection();

    const uploads = await getUploads();
    const allTags = await getTags();

    return <FileManager uploads={uploads} allTags={allTags} />;
}