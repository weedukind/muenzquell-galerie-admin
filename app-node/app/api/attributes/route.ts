import { NextResponse } from "next/server";
import { getAttributeTypes, createAttributeType } from "@/services/attributeService";

export async function GET() {

    const types = await getAttributeTypes();

    return NextResponse.json(types);
}

export async function POST(request: Request) {

    const body = await request.json();
    const name = body.name?.trim();

    if (!name) {
        return NextResponse.json(
            { error: "Name ist erforderlich." },
            { status: 400 }
        );
    }

    try {

        const id = await createAttributeType(name);

        return NextResponse.json({ id });

    } catch (err) {

        if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
            return NextResponse.json(
                { error: "Ein Attribut-Typ mit diesem Namen existiert bereits." },
                { status: 409 }
            );
        }

        throw err;
    }
}
