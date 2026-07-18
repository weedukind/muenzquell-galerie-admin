import { getTagsWithUsageCounts } from "@/services/tagService";
import TagManager from "../components/TagManager";

export default async function TagsPage() {

    const tags = await getTagsWithUsageCounts();

    return (
        <div className="mx-auto max-w-4xl p-6">

            <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
                Tag-Verwaltung
            </h1>

            <TagManager initialTags={tags} />

        </div>
    );
}
