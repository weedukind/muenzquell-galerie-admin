import { connection } from "next/server";
import { getAttributeTypes } from "@/services/attributeService";
import AttributeManager from "../components/AttributeManager";

export default async function AttributesPage() {

    await connection();

    const types = await getAttributeTypes();

    return (
        <div className="mx-auto max-w-4xl p-6">

            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
                Attribut-Verwaltung
            </h1>

            <p className="mb-6 text-sm text-gray-600">
                Jedes Bild braucht zu jedem Attribut-Typ genau einen Wert.
            </p>

            <AttributeManager initialTypes={types} />

        </div>
    );
}
