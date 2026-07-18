import { UploadRecord } from "@/types/upload";
import { TagRecord } from "@/types/tag";
import FileTable from "./FileTable";

interface Props {
    uploads: UploadRecord[];
    allTags: TagRecord[];
}
export default function FileManager({ uploads, allTags }: Props) {

    return (
        <div className="p-6">

            <h1 className="mb-6 text-3xl font-bold">
                Uploads
            </h1>

            <FileTable
                uploads={uploads}
                allTags={allTags}
            />

        </div>
    );
}