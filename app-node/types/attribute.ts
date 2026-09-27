export interface AttributeOption {
    id: number;
    attributeTypeId: number;
    name: string;
    sortOrder: number;
    usageCount?: number;
}

export interface AttributeType {
    id: number;
    name: string;
    sortOrder: number;
    options: AttributeOption[];
}

// attribute type id -> selected option id
export type AttributeValues = Record<number, number>;
