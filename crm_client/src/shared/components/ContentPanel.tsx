import { cn } from "@/src/lib/utils";

/**
 * Light zone — white surfaces inside the dark dashboard shell.
 *
 * ContentPanel and white dialogs share this context. Global `--primary` is
 * near-black (for the shell); outline/default shadcn controls can look low-contrast
 * here without explicit styling.
 *
 * Buttons:
 * - Primary submit → `variant="default"`
 * - Secondary / Cancel → `variant="secondary"` (avoid raw `outline` unless you add
 *   `text-gray-900` or similar for readable label contrast)
 *
 * Selects in tables/toolbars: prefer `SelectContent` with `position="popper"` and
 * light-menu classes where needed (see feature lists); defaults live in `select.tsx`.
 */
interface ContentPanelProps {
  children: React.ReactNode;
  className?: string;
}

export default function ContentPanel({ children, className }: ContentPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white/95 text-gray-900 shadow-sm p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
