import Link from "next/link";

export default function Navigation() {

    return (
        <nav className="bg-slate-800 text-white">

            <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-4">

                <div className="text-xl font-bold">
                    Cloud Upload Manager
                </div>

                <Link
                    href="/"
                    className="hover:text-sky-300"
                >
                    Übersicht
                </Link>

                <Link
                    href="/upload"
                    className="hover:text-sky-300"
                >
                    Upload
                </Link>

                <Link
                    href="/tags"
                    className="hover:text-sky-300"
                >
                    Tag-Verwaltung
                </Link>

            </div>

        </nav>
    );
}