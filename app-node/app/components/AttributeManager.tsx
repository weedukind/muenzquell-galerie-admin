"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, X, Trash2, ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
import { AttributeType } from "@/types/attribute";
import {
    createAttributeType,
    updateAttributeType,
    deleteAttributeType,
    reorderAttributeTypes,
    createAttributeOption,
    updateAttributeOption,
    deleteAttributeOption,
    reorderAttributeOptions
} from "@/lib/api";

interface Props {
    initialTypes: AttributeType[];
}

interface Editing {
    kind: "type" | "option";
    id: number;
}

function moved(ids: number[], index: number, direction: -1 | 1): number[] {

    const next = [...ids];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];

    return next;
}

const iconButton = "rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

export default function AttributeManager({ initialTypes }: Props) {

    const router = useRouter();
    const [newTypeName, setNewTypeName] = useState("");
    const [newOptionNames, setNewOptionNames] = useState<Record<number, string>>({});
    const [editing, setEditing] = useState<Editing | null>(null);
    const [editName, setEditName] = useState("");
    const [busy, setBusy] = useState(false);

    async function run(action: () => Promise<void>, fallbackMessage: string): Promise<boolean> {

        setBusy(true);

        try {
            await action();
            router.refresh();
            return true;
        } catch (err) {
            alert(err instanceof Error ? err.message : fallbackMessage);
            return false;
        } finally {
            setBusy(false);
        }
    }

    async function handleCreateType() {

        const name = newTypeName.trim();

        if (!name)
            return;

        if (await run(() => createAttributeType(name), "Attribut-Typ konnte nicht erstellt werden.")) {
            setNewTypeName("");
        }
    }

    async function handleCreateOption(typeId: number) {

        const name = (newOptionNames[typeId] ?? "").trim();

        if (!name)
            return;

        if (await run(() => createAttributeOption(typeId, name), "Option konnte nicht erstellt werden.")) {
            setNewOptionNames(current => ({ ...current, [typeId]: "" }));
        }
    }

    function startEdit(kind: Editing["kind"], id: number, name: string) {
        setEditing({ kind, id });
        setEditName(name);
    }

    async function handleUpdate() {

        const name = editName.trim();

        if (!editing || !name)
            return;

        const ok = editing.kind === "type"
            ? await run(() => updateAttributeType(editing.id, name), "Attribut-Typ konnte nicht aktualisiert werden.")
            : await run(() => updateAttributeOption(editing.id, name), "Option konnte nicht aktualisiert werden.");

        if (ok) {
            setEditing(null);
        }
    }

    async function handleDeleteType(type: AttributeType) {

        const usage = type.options.reduce((sum, option) => sum + (option.usageCount ?? 0), 0);

        const confirmMessage = usage > 0
            ? `"${type.name}" ist bei ${usage} Datei(en) gesetzt. Alle diese Werte werden mitgelöscht. Trotzdem löschen?`
            : `Attribut-Typ "${type.name}" wirklich löschen?`;

        if (!confirm(confirmMessage))
            return;

        await run(() => deleteAttributeType(type.id), "Attribut-Typ konnte nicht gelöscht werden.");
    }

    async function handleDeleteOption(name: string, id: number) {

        if (!confirm(`Option "${name}" wirklich löschen?`))
            return;

        await run(() => deleteAttributeOption(id), "Option konnte nicht gelöscht werden.");
    }

    function editInput() {
        return (
            <div className="flex items-center gap-1">
                <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") handleUpdate();
                        if (e.key === "Escape") setEditing(null);
                    }}
                    autoFocus
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                />
                <button
                    onClick={handleUpdate}
                    disabled={busy || !editName.trim()}
                    className={iconButton}
                    aria-label="Speichern"
                >
                    <Check className="size-4" />
                </button>
                <button
                    onClick={() => setEditing(null)}
                    className={iconButton}
                    aria-label="Abbrechen"
                >
                    <X className="size-4" />
                </button>
            </div>
        );
    }

    const typeIds = initialTypes.map(type => type.id);

    return (
        <div>

            <div className="mb-6 flex items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">

                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Neuer Attribut-Typ
                    </label>
                    <input
                        type="text"
                        value={newTypeName}
                        onChange={e => setNewTypeName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleCreateType()}
                        placeholder="z. B. Event"
                        className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleCreateType}
                    disabled={busy || !newTypeName.trim()}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Plus className="size-4" />
                    Anlegen
                </button>

            </div>

            {initialTypes.length === 0 && (
                <p className="rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500">
                    Noch keine Attribut-Typen vorhanden.
                </p>
            )}

            <div className="space-y-4">

                {initialTypes.map((type, typeIndex) => {

                    const optionIds = type.options.map(option => option.id);

                    return (
                        <section key={type.id} className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">

                            <header className="flex items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5">

                                {editing?.kind === "type" && editing.id === type.id
                                    ? editInput()
                                    : (
                                        <h2 className="font-semibold text-gray-900">
                                            {type.name}
                                        </h2>
                                    )}

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => run(() => reorderAttributeTypes(moved(typeIds, typeIndex, -1)), "Reihenfolge konnte nicht gespeichert werden.")}
                                        disabled={busy || typeIndex === 0}
                                        className={iconButton}
                                        aria-label="Nach oben"
                                    >
                                        <ChevronUp className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => run(() => reorderAttributeTypes(moved(typeIds, typeIndex, 1)), "Reihenfolge konnte nicht gespeichert werden.")}
                                        disabled={busy || typeIndex === initialTypes.length - 1}
                                        className={iconButton}
                                        aria-label="Nach unten"
                                    >
                                        <ChevronDown className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => startEdit("type", type.id, type.name)}
                                        className={iconButton}
                                        aria-label="Umbenennen"
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteType(type)}
                                        disabled={busy}
                                        className={`${iconButton} hover:bg-red-100 hover:text-red-700`}
                                        aria-label="Löschen"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>

                            </header>

                            <ul className="divide-y divide-gray-100 bg-white">

                                {type.options.length === 0 && (
                                    <li className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-amber-700">
                                        <AlertCircle className="size-4" />
                                        Noch keine Optionen – ohne Optionen kann nichts hochgeladen oder gespeichert werden.
                                    </li>
                                )}

                                {type.options.map((option, optionIndex) => (

                                    <li key={option.id} className="flex items-center justify-between gap-2 px-4 py-2">

                                        {editing?.kind === "option" && editing.id === option.id
                                            ? editInput()
                                            : (
                                                <span className="text-sm text-gray-900">
                                                    {option.name}
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        {option.usageCount ?? 0} Datei(en)
                                                    </span>
                                                </span>
                                            )}

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => run(() => reorderAttributeOptions(type.id, moved(optionIds, optionIndex, -1)), "Reihenfolge konnte nicht gespeichert werden.")}
                                                disabled={busy || optionIndex === 0}
                                                className={iconButton}
                                                aria-label="Nach oben"
                                            >
                                                <ChevronUp className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => run(() => reorderAttributeOptions(type.id, moved(optionIds, optionIndex, 1)), "Reihenfolge konnte nicht gespeichert werden.")}
                                                disabled={busy || optionIndex === type.options.length - 1}
                                                className={iconButton}
                                                aria-label="Nach unten"
                                            >
                                                <ChevronDown className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => startEdit("option", option.id, option.name)}
                                                className={iconButton}
                                                aria-label="Umbenennen"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOption(option.name, option.id)}
                                                disabled={busy || (option.usageCount ?? 0) > 0}
                                                title={(option.usageCount ?? 0) > 0
                                                    ? "Wird noch verwendet und kann nicht gelöscht werden."
                                                    : undefined}
                                                className={`${iconButton} hover:bg-red-100 hover:text-red-700`}
                                                aria-label="Löschen"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>

                                    </li>

                                ))}

                                <li className="flex items-center gap-2 bg-gray-50/50 px-4 py-2">
                                    <input
                                        type="text"
                                        value={newOptionNames[type.id] ?? ""}
                                        onChange={e => setNewOptionNames(current => ({ ...current, [type.id]: e.target.value }))}
                                        onKeyDown={e => e.key === "Enter" && handleCreateOption(type.id)}
                                        placeholder="Neue Option"
                                        className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => handleCreateOption(type.id)}
                                        disabled={busy || !(newOptionNames[type.id] ?? "").trim()}
                                        className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Plus className="size-3.5" />
                                        Option hinzufügen
                                    </button>
                                </li>

                            </ul>

                        </section>
                    );
                })}

            </div>

        </div>
    );
}
