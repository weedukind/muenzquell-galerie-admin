import { UploadRecord } from "@/types/upload";
import { AttributeType } from "@/types/attribute";
import FileTable from "./FileTable";

interface Props {
    uploads: UploadRecord[];
    attributeTypes: AttributeType[];
}
export default function FileManager({ uploads, attributeTypes }: Props) {

    return (
        <div className="mx-auto max-w-7xl p-6">

            <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
                Uploads
            </h1>

            <FileTable
                uploads={uploads}
                attributeTypes={attributeTypes}
            />

        </div>
    );
}