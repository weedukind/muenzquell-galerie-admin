interface Props {
    percent: number;
    error?: boolean;
}

export default function ProgressBar({ percent, error = false }: Props) {

    return (
        <div className="h-2 w-full rounded bg-gray-200">
            <div
                className={`h-2 rounded transition-all ${error ? "bg-red-600" : "bg-blue-600"}`}
                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
        </div>
    );
}
