import { getTags } from "@/services/tagService";
import UploadForm from "../components/UploadForm";

export default async function UploadPage() {

    const allTags = await getTags();

    return (
        <div className="p-6">

            <h1 className="mb-6 text-3xl font-bold">
                Upload
            </h1>

            <UploadForm allTags={allTags} />

        </div>
    );
}