function escapeCsvField(value: string): string {

    if (/["\r\n,]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
}

export function toCsv(headers: string[], rows: string[][]): string {

    return [headers, ...rows]
        .map(row => row.map(escapeCsvField).join(","))
        .join("\r\n");
}

const UTF8_BOM = "﻿";

export function downloadCsv(filename: string, csv: string): void {

    const blob = new Blob([UTF8_BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}
