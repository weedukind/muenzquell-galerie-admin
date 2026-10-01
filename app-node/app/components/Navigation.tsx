import Link from "next/link";
import { Cloud, LayoutGrid, Upload, Tags, ListChecks, Users, UsersRound, Gauge } from "lucide-react";

export default function Navigation() {

    return (
        <nav className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900/95 text-white shadow-sm backdrop-blur">

            <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-3.5">

                <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <Cloud className="size-5 text-sky-400" />
                    Cloud Upload Manager
                </div>

                <div className="flex items-center gap-1">

                    <Link
                        href="/"
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <LayoutGrid className="size-4" />
                        Übersicht
                    </Link>

                    <Link
                        href="/upload"
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <Upload className="size-4" />
                        Upload
                    </Link>

                    <Link
                        href="/tags"
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <Tags className="size-4" />
                        Tag-Verwaltung
                    </Link>

                    <Link
                        href="/attributes"
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <ListChecks className="size-4" />
                        Attribut-Verwaltung
                    </Link>

                    <Link
                        href="/users"
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <Users className="size-4" />
                        Benutzer
                    </Link>

                    <Link
                        href="/groups"
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <UsersRound className="size-4" />
                        Gruppen
                    </Link>

                    <Link
                        href="/ressourcen"
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <Gauge className="size-4" />
                        Ressourcen
                    </Link>

                </div>

            </div>

        </nav>
    );
}