import { notFound } from "next/navigation";
import { getUpload } from "@/services/uploadService";
import { getAttributeTypes, getAttributeValuesForUpload } from "@/services/attributeService";
import UploadEditor from "../../components/UploadEditor";

export default async function UploadDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {

    const { id } = await params;

    const upload = Number.isInteger(Number(id))
        ? await getUpload(Number(id))
        : null;

    if (!upload)
        notFound();

    const attributeTypes = await getAttributeTypes();
    const attributeValues = await getAttributeValuesForUpload(upload.id!);

    return (
        <div className="mx-auto max-w-4xl p-6">

            <UploadEditor
                upload={upload}
                attributeTypes={attributeTypes}
                initialValues={attributeValues}
            />

        </div>
    );
}
