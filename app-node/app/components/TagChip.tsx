import { TagRecord } from "@/types/tag";

interface Props {
    tag: TagRecord;
    active: boolean;
    onClick?: () => void;
}

export default function TagChip({ tag, active, onClick }: Props) {

    const style = {
        backgroundColor: active ? tag.color : "transparent",
        color: active ? "white" : tag.color,
        border: `1px solid ${tag.color}`
    };

    if (!onClick) {
        return (
            <span className="rounded px-2 py-0.5 text-xs" style={style}>
                {tag.name}
            </span>
        );
    }

    return (
        <button
            onClick={onClick}
            className="rounded px-2 py-0.5 text-xs"
            style={style}
        >
            {tag.name}
        </button>
    );
}
