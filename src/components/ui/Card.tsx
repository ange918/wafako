import { cn } from "@/lib/utils";

/** Conteneur de surface standard. Server Component : aucune animation ici. */
export function Card({
  className,
  children,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-3xl border border-line bg-surface shadow-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-line px-6 py-5",
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="font-display text-lg font-extrabold text-fg">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
