import { cn } from "../../../utils.ts";

type Props = {
    className?: string;
};

export const PanelOpenIcon = ({ className }: Props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("", className)}
    >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="15" x2="15" y1="3" y2="21" />
        <path d="m10 15-3-3 3-3" />
    </svg>
);