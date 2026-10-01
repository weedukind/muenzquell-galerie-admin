import { connection } from "next/server";
import { Mail } from "lucide-react";
import { getDailyMailStats } from "@/services/mailStatsService";
import { DailyMailStats } from "@/types/mailStats";

const DAYS = 30;

const dayFormat = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
});

export default async function ResourcesPage() {

    await connection();

    let stats: DailyMailStats[] | null = null;
    let error: string | null = null;

    try {
        stats = await getDailyMailStats(DAYS);
    } catch (err) {
        error = err instanceof Error ? err.message : "Mailjet-Statistik nicht abrufbar.";
    }

    return (
        <div className="mx-auto max-w-4xl p-6">

            <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
                Ressourcen
            </h1>

            <section>

                <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Mail className="size-5 text-gray-500" />
                    E-Mails
                </h2>

                <p className="mb-4 text-sm text-gray-600">
                    Vom Frontend über Mailjet verschickte Mails (Anmeldecodes, Einladungen, Löschbestätigungen), pro Tag (UTC).
                </p>

                {error && (
                    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {stats && <MailStats stats={stats} />}

            </section>

        </div>
    );
}

function MailStats({ stats }: { stats: DailyMailStats[] }) {

    const sum = (days: DailyMailStats[]) => days.reduce((total, day) => total + day.sent, 0);
    const max = Math.max(1, ...stats.map(day => day.sent));
    const newestFirst = [...stats].reverse();

    const tiles = [
        { label: "Heute", value: sum(stats.slice(-1)) },
        { label: "Letzte 7 Tage", value: sum(stats.slice(-7)) },
        { label: `Letzte ${stats.length} Tage`, value: sum(stats) }
    ];

    return (
        <>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {tiles.map(tile => (
                    <div key={tile.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm text-gray-500">{tile.label}</div>
                        <div className="text-2xl font-semibold tabular-nums text-gray-900">{tile.value}</div>
                    </div>
                ))}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">

                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tag</th>
                            <th className="w-full p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Verschickt</th>
                            <th className="p-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Fehlgeschlagen</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white text-sm">
                        {newestFirst.map(day => (
                            <tr key={day.date}>
                                <td className="whitespace-nowrap p-3 text-gray-600">
                                    {dayFormat.format(new Date(`${day.date}T00:00:00Z`))}
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-blue-600"
                                                style={{ width: `${(day.sent / max) * 100}%` }}
                                            />
                                        </div>
                                        <span className={`w-8 text-right tabular-nums ${day.sent > 0 ? "text-gray-900" : "text-gray-400"}`}>
                                            {day.sent}
                                        </span>
                                    </div>
                                </td>
                                <td className={`p-3 text-right tabular-nums ${day.failed > 0 ? "font-medium text-red-600" : "text-gray-400"}`}>
                                    {day.failed}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </>
    );
}
