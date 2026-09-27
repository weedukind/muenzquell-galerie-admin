export function formatDateTime(iso: string): string {

    return new Intl.DateTimeFormat("de-DE", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Europe/Berlin",
    }).format(new Date(iso));
}
