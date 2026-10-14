import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150 cursor-pointer";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-sunken",
  ghost: "text-ink-muted hover:bg-sunken hover:text-ink",
};

const DISABLED = "border border-line bg-sunken text-ink-subtle cursor-not-allowed";

export function Button({ variant = "secondary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${BASE} ${props.disabled ? DISABLED : VARIANTS[variant]} ${className}`} {...props} />;
}

interface ButtonLinkProps {
  href?: string;
  variant?: Variant;
  external?: boolean;
  disabledReason?: string;
  children: ReactNode;
}

/**
 * Enlace con forma de botón. Sin href se renderiza deshabilitado: se mantiene visible (para que se
 * entienda qué acción existe) y explica por qué no está disponible.
 */
export function ButtonLink({ href, variant = "secondary", external, disabledReason, children }: ButtonLinkProps) {
  if (!href) {
    return (
      <span className={`${BASE} ${DISABLED}`} aria-disabled="true" title={disabledReason}>
        {children}
        {disabledReason && <span className="sr-only">. No disponible: {disabledReason}</span>}
      </span>
    );
  }
  if (external || /^(tel|mailto|https?):/.test(href)) {
    return (
      <a
        href={href}
        className={`${BASE} ${VARIANTS[variant]}`}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {external && <span className="sr-only"> (se abre en otra pestaña)</span>}
      </a>
    );
  }
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]}`}>
      {children}
    </Link>
  );
}
