import { UploadRecord } from "@/types/upload";
import { TagRecord } from "@/types/tag";
import { AttributeType } from "@/types/attribute";
import FileTable from "./FileTable";

interface Props {
    uploads: UploadRecord[];
    allTags: TagRecord[];
    attributeTypes: AttributeType[];
}
export default function FileManager({ uploads, allTags, attributeTypes }: Props) {

    return (
        <div className="mx-auto max-w-7xl p-6">

            <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
                Uploads
            </h1>

            <FileTable
                uploads={uploads}
                allTags={allTags}
                attributeTypes={attributeTypes}
            />

        </div>
    );
}