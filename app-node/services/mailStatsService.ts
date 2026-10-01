import { DailyMailStats } from "@/types/mailStats";

// The frontend sends its mail (login codes, invitations, deletion links)
// through Mailjet and keeps no record of it, so the numbers come from
// Mailjet's statistics, counted per UTC day for the whole API key. Needs the
// frontend's MAILJET_API_KEY and MAILJET_SECRET_KEY.
interface StatCounter {
    Timeslice: string;
    MessageSentCount: number;
    MessageHardBouncedCount: number;
    MessageSoftBouncedCount: number;
    MessageBlockedCount: number;
    MessageSpamCount: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// The last `days` days including today, oldest first; days without mail are
// included with zeros.
export async function getDailyMailStats(days: number): Promise<DailyMailStats[]> {

    const apiKey = process.env.MAILJET_API_KEY;
    const secretKey = process.env.MAILJET_SECRET_KEY;

    if (!apiKey || !secretKey)
        throw new Error("MAILJET_API_KEY oder MAILJET_SECRET_KEY ist nicht gesetzt.");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const from = new Date(today.getTime() - (days - 1) * DAY_MS);

    const params = new URLSearchParams({
        CounterSource: "APIKey",
        CounterTiming: "Message",
        CounterResolution: "Day",
        FromTS: String(Math.floor(from.getTime() / 1000)),
        ToTS: String(Math.floor(Date.now() / 1000)),
        // one row per day with mail; without it Mailjet returns only 10
        Limit: String(days)
    });

    const res = await fetch(`https://api.mailjet.com/v3/REST/statcounters?${params}`, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`
        },
        cache: "no-store"
    });

    if (!res.ok)
        throw new Error(`Mailjet-Statistik nicht abrufbar: ${res.status} ${res.statusText}`);

    const json: { Data: StatCounter[] } = await res.json();

    const byDate = new Map(json.Data.map(counter => [counter.Timeslice.slice(0, 10), counter]));

    return Array.from({ length: days }, (_, index) => {

        const date = new Date(from.getTime() + index * DAY_MS).toISOString().slice(0, 10);
        const counter = byDate.get(date);

        return {
            date,
            sent: counter?.MessageSentCount ?? 0,
            failed: counter
                ? counter.MessageHardBouncedCount + counter.MessageSoftBouncedCount + counter.MessageBlockedCount + counter.MessageSpamCount
                : 0
        };
    });
}
