"use client";

import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { AttributeType } from "@/types/attribute";
import { TaggedPerson } from "@/types/person";
import { SORT_LABELS, SORT_ORDERS, SortOrder } from "@/lib/filterParams";
import FilterDropdown, { FilterChip } from "./FilterDropdown";

interface Props {
    // only the options that can be picked, i.e. those assigned to at least one upload
    types: AttributeType[];
    // everyone tagged on at least one upload
    people: TaggedPerson[];
    selectedOptionIds: number[];
    selectedPersonIds: number[];
    sort: SortOrder;
    onToggleOption: (optionId: number) => void;
    onTogglePerson: (personId: number) => void;
    onSortChange: (sort: SortOrder) => void;
    onReset: () => void;
}

// Filters and sort order as in the frontend's gallery: one dropdown per
// attribute type plus "Personen", the sort order on the right and the active
// filters as removable tags below.
export default function UploadFilterBar({ types, people, selectedOptionIds, selectedPersonIds, sort, onToggleOption, onTogglePerson, onSortChange, onReset }: Props) {

    // the open dropdown ("type-<id>" or "people"); one at a time
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const openChange = useCallback((key: string, open: boolean) => {
        setOpenFilter(current => open ? key : current === key ? null : current);
    }, []);

    const visibleTypes = types.filter(type => type.options.length > 0);

    const activeOptions = visibleTypes.flatMap(type =>
        type.options
            .filter(option => selectedOptionIds.includes(option.id))
            .map(option => ({ type, option }))
    );
    const activePeople = people.filter(person => selectedPersonIds.includes(person.id));

    return (
        <div className="mb-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                {/* Options within a type are OR-ed, types are AND-ed; people are OR-ed. */}
                <div className="flex flex-wrap items-center gap-2">
                    {visibleTypes.map(type => (
                        <FilterDropdown
                            key={type.id}
                            label={type.name}
                            options={type.options}
                            selectedIds={selectedOptionIds}
                            open={openFilter === `type-${type.id}`}
                            onOpenChange={open => openChange(`type-${type.id}`, open)}
                            onToggle={onToggleOption}
                        />
                    ))}
                    {people.length > 0 && (
                        <FilterDropdown
                            label="Personen"
                            options={people}
                            selectedIds={selectedPersonIds}
                            open={openFilter === "people"}
                            onOpenChange={open => openChange("people", open)}
                            onToggle={onTogglePerson}
                        />
                    )}
                </div>

                <div role="group" aria-label="Sortierung" className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Sortierung</span>
                    {SORT_ORDERS.map(value => (
                        <FilterChip
                            key={value}
                            label={SORT_LABELS[value]}
                            active={sort === value}
                            onClick={() => onSortChange(value)}
                        />
                    ))}
                </div>

            </div>

            {(activeOptions.length > 0 || activePeople.length > 0) && (
                <div role="group" aria-label="Aktive Filter" className="mt-3 flex flex-wrap items-center gap-2">
                    {activeOptions.map(({ type, option }) => (
                        <ActiveTag
                            key={option.id}
                            label={`${type.name}: ${option.name}`}
                            onRemove={() => onToggleOption(option.id)}
                        />
                    ))}
                    {activePeople.map(person => (
                        <ActiveTag
                            key={`person-${person.id}`}
                            label={`Personen: ${person.name}`}
                            onRemove={() => onTogglePerson(person.id)}
                        />
                    ))}
                    {/* resets the filters; the sort order stays */}
                    <button
                        onClick={onReset}
                        className="ml-1 text-sm text-gray-500 underline hover:text-blue-600"
                    >
                        Filter zurücksetzen
                    </button>
                </div>
            )}

        </div>
    );
}

function ActiveTag({ label, onRemove }: { label: string; onRemove: () => void }) {

    return (
        <button
            onClick={onRemove}
            aria-label={`Filter entfernen: ${label}`}
            className="flex items-center gap-1.5 rounded-full bg-blue-600 py-1 pr-2 pl-3 text-sm font-medium text-white hover:bg-blue-700"
        >
            {label}
            <X className="size-3.5" />
        </button>
    );
}
