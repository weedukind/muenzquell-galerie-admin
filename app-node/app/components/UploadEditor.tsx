"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import { UploadRecord } from "@/types/upload";
import { AttributeType, AttributeValues } from "@/types/attribute";
import { getMissingAttributeTypes } from "@/lib/attributes";
import { saveUploadAttributes } from "@/lib/api";
import { formatSize } from "@/lib/formatSize";
import AttributeSelects from "./AttributeSelects";

interface Props {
    upload: UploadRecord;
    attributeTypes: AttributeType[];
    initialValues: AttributeValues;
}

export default function UploadEditor({ upload, attributeTypes, initialValues }: Props) {

    const router = useRouter();
    const [values, setValues] = useState<AttributeValues>(initialValues);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const missing = getMissingAttributeTypes(attributeTypes, values);

    function onChange(next: AttributeValues) {
        setValues(next);
        setSaved(false);
    }

    async function save() {

        if (missing.length > 0)
            return;

        setSaving(true);

        try {
            await saveUploadAttributes(upload.id!, values);
            setSaved(true);
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Attribute konnten nicht gespeichert werden.");
        }

        setSaving(false);
    }

    return (
        <div>

            <Link
                href="/"
                className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft className="size-4" />
                Zurück zur Übersicht
            </Link>

            <h1 className="mb-6 break-all text-2xl font-semibold tracking-tight text-gray-900">
                {upload.name}
            </h1>

            <div className="grid gap-6 md:grid-cols-2">

                <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    {upload.mimeType?.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={upload.publicUrl}
                            alt={upload.name}
                            className="max-h-96 object-contain"
                        />
                    ) : (
                        <span className="text-sm text-gray-500">Keine Vorschau verfügbar</span>
                    )}
                </div>

                <div className="space-y-6">

                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                        <dt className="text-gray-500">Größe</dt>
                        <dd className="text-gray-900">{formatSize(upload.size)}</dd>
                        <dt className="text-gray-500">Maße</dt>
                        <dd className="text-gray-900">
                            {upload.width && upload.height ? `${upload.width} × ${upload.height}` : "—"}
                        </dd>
                        <dt className="text-gray-500">Typ</dt>
                        <dd className="text-gray-900">{upload.mimeType}</dd>
                        <dt className="text-gray-500">Datei</dt>
                        <dd>
                            <a
                                href={upload.publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            >
                                Öffnen
                                <ExternalLink className="size-3.5" />
                            </a>
                        </dd>
                    </dl>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">

                        <h2 className="mb-3 text-sm font-semibold text-gray-700">
                            Attribute
                        </h2>

                        {attributeTypes.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                Es sind noch keine Attribut-Typen angelegt.
                            </p>
                        ) : (
                            <AttributeSelects
                                types={attributeTypes}
                                values={values}
                                onChange={onChange}
                                disabled={saving}
                            />
                        )}

                        {missing.length > 0 && (
                            <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
                                <AlertTriangle className="size-3.5 shrink-0" />
                                Speichern ist erst möglich, wenn alle Attribute gesetzt sind
                                (fehlt: {missing.map(type => type.name).join(", ")}).
                            </p>
                        )}

                        <div className="mt-4 flex items-center gap-3">

                            <button
                                onClick={save}
                                disabled={saving || missing.length > 0 || attributeTypes.length === 0}
                                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Save className="size-4" />
                                {saving ? "Speichern…" : "Speichern"}
                            </button>

                            {saved && (
                                <span className="flex items-center gap-1 text-xs text-emerald-600">
                                    <CheckCircle2 className="size-3.5" />
                                    Gespeichert
                                </span>
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}
