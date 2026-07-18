import { TagRecord } from "@/types/tag";
import TagChip from "./TagChip";

interface Props {
    tags: TagRecord[];
}

export default function TagEditor({ tags }: Props) {

    return (
        <div className="flex flex-wrap items-center gap-1">

            {tags.map(tag => (
                <TagChip key={tag.id} tag={tag} active />
            ))}

        </div>
    );
}
