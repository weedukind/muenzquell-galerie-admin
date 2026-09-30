import { useCallback, useSyncExternalStore } from "react";

// Which columns of the upload list are hidden, per browser (localStorage).
// Stored as hidden rather than visible keys, so columns added later (e.g. a
// new attribute type) show up by default.
const STORAGE_KEY = "uploads.hiddenColumns";
const listeners = new Set<() => void>();

function read(): string {
    try {
        return localStorage.getItem(STORAGE_KEY) ?? "[]";
    } catch {
        return "[]";
    }
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    // other tabs
    window.addEventListener("storage", listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
    };
}

function parse(json: string): string[] {
    try {
        const value = JSON.parse(json);
        return Array.isArray(value) ? value.filter(key => typeof key === "string") : [];
    } catch {
        return [];
    }
}

export function useHiddenColumns() {

    // The raw string is the snapshot, so it compares equal between renders.
    // On the server (and while hydrating) every column is visible.
    const json = useSyncExternalStore(subscribe, read, () => "[]");
    const hiddenKeys = parse(json);

    const setHiddenKeys = useCallback((keys: string[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
        } catch {
            // storage unavailable: the choice just isn't kept
        }
        listeners.forEach(listener => listener());
    }, []);

    return { hiddenKeys, setHiddenKeys };
}
