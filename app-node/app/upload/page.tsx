import { connection } from "next/server";
import { getTags } from "@/services/tagService";
import { getAttributeTypes } from "@/services/attributeService";
import UploadForm from "../components/UploadForm";

export default async function UploadPage() {

    await connection();

    const allTags = await getTags();
    const attributeTypes = await getAttributeTypes();

    return (
        <div className="mx-auto max-w-3xl p-6">

            <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
                Upload
            </h1>

            <UploadForm allTags={allTags} attributeTypes={attributeTypes} />

        </div>
    );
}