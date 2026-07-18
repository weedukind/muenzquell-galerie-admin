interface Props {
    percent: number;
    error?: boolean;
}

export default function ProgressBar({ percent, error = false }: Props) {

    return (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
                className={`h-full rounded-full transition-all duration-300 ${error ? "bg-red-500" : "bg-blue-600"}`}
                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
        </div>
    );
}
