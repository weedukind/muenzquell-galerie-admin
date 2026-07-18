import { getTagsWithUsageCounts } from "@/services/tagService";
import TagManager from "../components/TagManager";

export default async function TagsPage() {

    const tags = await getTagsWithUsageCounts();

    return (
        <div className="p-6">

            <h1 className="mb-6 text-3xl font-bold">
                Tag-Verwaltung
            </h1>

            <TagManager initialTags={tags} />

        </div>
    );
}
