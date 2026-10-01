import { connection } from "next/server";
import { getUploads } from "@/services/uploadService";
import { getAttributeTypes } from "@/services/attributeService";
import FileManager from "./components/FileManager";

export default async function HomePage() {

    await connection();

    const uploads = await getUploads();
    const attributeTypes = await getAttributeTypes();

    return <FileManager uploads={uploads} attributeTypes={attributeTypes} />;
}