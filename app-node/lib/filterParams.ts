// The upload list's filter lives in the URL, with the same parameters as the
// frontend's gallery (muenzquell-fe, lib/optionParam.ts), so a filter reads
// the same in both:
//   ?optionen=3,7,12  selected attribute options (ids are unique across types)
//   ?personen=12,30   tagged people
//   ?sortierung=alt|likes|aufrufe  without it the newest uploads come first
// Parsing is lenient: invalid entries are dropped rather than rejected.
export const OPTIONS_PARAM = "optionen";
export const PEOPLE_PARAM = "personen";
export const SORT_PARAM = "sortierung";

export function parseIdParam(value: string | null | undefined): number[] {

    if (!value)
        return [];

    const ids = value
        .split(",")
        .map(Number)
        .filter(id => Number.isInteger(id) && id > 0);

    return [...new Set(ids)].sort((a, b) => a - b);
}

export function formatIdParam(ids: number[]): string {
    return [...ids].sort((a, b) => a - b).join(",");
}

export const SORT_ORDERS = ["neu", "alt", "likes", "aufrufe"] as const;
export type SortOrder = typeof SORT_ORDERS[number];
export const DEFAULT_SORT: SortOrder = "neu";

export const SORT_LABELS: Record<SortOrder, string> = {
    neu: "Neueste",
    alt: "Älteste",
    likes: "Meiste Likes",
    aufrufe: "Meiste Aufrufe"
};

export function parseSortParam(value: string | null | undefined): SortOrder {
    return SORT_ORDERS.find(sort => sort === value) ?? DEFAULT_SORT;
}
