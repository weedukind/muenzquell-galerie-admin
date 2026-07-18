import { useState } from "react";

export function useSelection(visibleIds: number[]) {

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const allSelected = visibleIds.length > 0
        && visibleIds.every(id => selectedIds.includes(id));

    function toggleAll() {
        setSelectedIds(current =>
            allSelected
                ? current.filter(id => !visibleIds.includes(id))
                : [...current, ...visibleIds.filter(id => !current.includes(id))]
        );
    }

    function toggleOne(id: number) {
        setSelectedIds(current =>
            current.includes(id)
                ? current.filter(existing => existing !== id)
                : [...current, id]
        );
    }

    return { selectedIds, setSelectedIds, allSelected, toggleAll, toggleOne };
}
