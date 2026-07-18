import { getTags } from "@/services/tagService";
import UploadForm from "../components/UploadForm";

export default async function UploadPage() {

    const allTags = await getTags();

    return (
        <div className="mx-auto max-w-3xl p-6">

            <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
                Upload
            </h1>

            <UploadForm allTags={allTags} />

        </div>
    );
}