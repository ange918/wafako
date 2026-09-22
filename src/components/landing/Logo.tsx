import Link from "next/link";
import { ShieldPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  tone = "default",
}: {
  className?: string;
  href?: string;
  tone?: "default" | "inverted";
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-hospital text-white shadow-soft">
        <ShieldPlus className="size-5" />
      </span>
      <span
        className={cn(
          "font-display text-xl font-extrabold",
          tone === "inverted" ? "text-white" : "text-fg",
        )}
      >
        SafeCare
      </span>
    </Link>
  );
}
