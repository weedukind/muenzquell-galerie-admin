import { AlertCircle } from "lucide-react";
import { AttributeType, AttributeValues } from "@/types/attribute";
import { getMissingAttributeTypes } from "@/lib/attributes";

interface Props {
    types: AttributeType[];
    values: AttributeValues;
    onChange: (values: AttributeValues) => void;
    disabled?: boolean;
}

export default function AttributeSelects({ types, values, onChange, disabled }: Props) {

    const missingIds = getMissingAttributeTypes(types, values).map(type => type.id);

    if (types.length === 0)
        return null;

    return (
        <div className="grid gap-3 sm:grid-cols-2">

            {types.map(type => {

                const missing = missingIds.includes(type.id);

                return (
                    <label key={type.id} className="block">

                        <span className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600">
                            {type.name}
                            <span className="text-red-600">*</span>
                        </span>

                        <select
                            value={values[type.id] ?? ""}
                            onChange={e => onChange({ ...values, [type.id]: Number(e.target.value) })}
                            disabled={disabled || type.options.length === 0}
                            required
                            className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${missing
                                ? "border-amber-400 focus:border-amber-500"
                                : "border-gray-300 focus:border-blue-400"}`}
                        >
                            <option value="" disabled>
                                Bitte auswählen…
                            </option>
                            {type.options.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>

                        {type.options.length === 0 && (
                            <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="size-3.5" />
                                Keine Optionen angelegt – bitte in der Attribut-Verwaltung ergänzen.
                            </span>
                        )}

                    </label>
                );
            })}

        </div>
    );
}
