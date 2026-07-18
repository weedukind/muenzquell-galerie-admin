const MAX_DIGITS = 4;

function formatWithMaxDigits(value: number, suffix: string): string {

    let decimals = Math.max(0, MAX_DIGITS - Math.trunc(value).toString().length);
    let rounded = Number(value.toFixed(decimals));

    // rounding can carry into an extra integer digit (e.g. 999.99 -> 1000), so recheck once
    if (decimals > 0 && Math.trunc(rounded).toString().length > Math.trunc(value).toString().length) {
        decimals -= 1;
        rounded = Number(value.toFixed(decimals));
    }

    return `${rounded.toLocaleString("de-DE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })} ${suffix}`;
}

export function formatSize(bytes: number): string {

    if (bytes < 1024)
        return bytes.toLocaleString("de-DE");

    const kb = bytes / 1024;

    if (kb < 1024)
        return formatWithMaxDigits(kb, "kB");

    return formatWithMaxDigits(kb / 1024, "MB");
}
