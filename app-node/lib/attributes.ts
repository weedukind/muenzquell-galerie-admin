import { AttributeType, AttributeValues } from "@/types/attribute";

export function getMissingAttributeTypes(
    types: AttributeType[],
    values: AttributeValues
): AttributeType[] {

    return types.filter(type => !type.options.some(option => option.id === values[type.id]));
}

// returns an error message, or null if every attribute type has exactly one valid option
export function validateAttributeValues(
    types: AttributeType[],
    values: AttributeValues
): string | null {

    for (const typeId of Object.keys(values)) {
        if (!types.some(type => type.id === Number(typeId))) {
            return "Unbekannter Attribut-Typ.";
        }
    }

    for (const type of types) {

        if (type.options.length === 0) {
            return `Für "${type.name}" sind noch keine Optionen angelegt.`;
        }

        if (values[type.id] === undefined) {
            return `Bitte einen Wert für "${type.name}" auswählen.`;
        }

        if (!type.options.some(option => option.id === values[type.id])) {
            return `Ungültiger Wert für "${type.name}".`;
        }
    }

    return null;
}

export function parseAttributeValues(input: unknown): AttributeValues | null {

    if (typeof input !== "object" || input === null || Array.isArray(input)) {
        return null;
    }

    const values: AttributeValues = {};

    for (const [typeId, optionId] of Object.entries(input)) {

        if (!Number.isInteger(Number(typeId)) || !Number.isInteger(optionId)) {
            return null;
        }

        values[Number(typeId)] = optionId as number;
    }

    return values;
}
