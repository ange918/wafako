import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-2xl border border-line bg-surface px-4 text-fg " +
  "placeholder:text-fg-muted/70 outline-none transition-colors " +
  "focus:border-hospital focus:ring-2 focus:ring-hospital/25";

function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold text-fg"
    >
      {children}
      {hint ? (
        <span className="ml-2 font-normal text-fg-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({
  label,
  id,
  hint,
  className,
  ...rest
}: { label?: string; hint?: string } & React.ComponentProps<"input">) {
  const inputId = id ?? rest.name ?? undefined;
  return (
    <div>
      {label ? (
        <Label htmlFor={inputId ?? ""} hint={hint}>
          {label}
        </Label>
      ) : null}
      <input
        id={inputId}
        {...rest}
        className={cn(CONTROL, "h-12", className)}
      />
    </div>
  );
}

export function Textarea({
  label,
  id,
  hint,
  className,
  ...rest
}: { label?: string; hint?: string } & React.ComponentProps<"textarea">) {
  const fieldId = id ?? rest.name ?? undefined;
  return (
    <div>
      {label ? (
        <Label htmlFor={fieldId ?? ""} hint={hint}>
          {label}
        </Label>
      ) : null}
      <textarea
        id={fieldId}
        {...rest}
        className={cn(
          CONTROL,
          "min-h-32 resize-y py-3 leading-relaxed",
          className,
        )}
      />
    </div>
  );
}

export function Select({
  label,
  id,
  hint,
  className,
  children,
  ...rest
}: { label?: string; hint?: string } & React.ComponentProps<"select">) {
  const fieldId = id ?? rest.name ?? undefined;
  return (
    <div>
      {label ? (
        <Label htmlFor={fieldId ?? ""} hint={hint}>
          {label}
        </Label>
      ) : null}
      <select
        id={fieldId}
        {...rest}
        className={cn(CONTROL, "h-12 appearance-none pr-10", className)}
        style={{
          // Chevron en SVG inline : évite un composant client pour un décor.
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%235a6b80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.85rem center",
        }}
      >
        {children}
      </select>
    </div>
  );
}
