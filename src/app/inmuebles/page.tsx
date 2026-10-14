import type { Metadata } from "next";
import { Bath, BedDouble, Car, PawPrint, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import catalog from "@/data/kb-propiedades.json";

export const metadata: Metadata = { title: "Inmuebles" };

interface Property {
  ref: string;
  titulo: string;
  operacion: string;
  zona: string;
  precio: number;
  habitaciones: number;
  banos: number;
  m2: number;
  planta?: number | null;
  ascensor?: boolean;
  plaza_garaje?: boolean;
  admite_mascotas?: boolean;
  descripcion_corta: string;
  horario_visitas?: string;
}

const properties = catalog.properties as Property[];

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function PropertiesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Inmuebles</h1>
        <p className="mt-1 text-sm text-ink-muted">{properties.length} inmuebles en cartera</p>
      </header>

      <ul className="grid gap-4 md:grid-cols-2">
        {properties.map((p) => {
          const rent = p.operacion === "alquiler";
          return (
            <li key={p.ref} className="flex flex-col rounded-lg border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-ink-subtle">{p.ref}</p>
                  <h2 className="mt-0.5 font-medium text-ink">{p.titulo}</h2>
                  <p className="text-sm text-ink-muted">{p.zona}</p>
                </div>
                <Badge tone={rent ? "info" : "accent"}>{rent ? "Alquiler" : "Venta"}</Badge>
              </div>

              <p className="mt-3 text-xl font-semibold tabular-nums text-ink">
                {euros.format(p.precio)}
                {rent && <span className="text-sm font-normal text-ink-muted"> /mes</span>}
              </p>

              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-muted">
                <Feature icon={BedDouble}>{p.habitaciones} hab.</Feature>
                <Feature icon={Bath}>{p.banos} {p.banos === 1 ? "baño" : "baños"}</Feature>
                <Feature icon={Ruler}>{p.m2} m²</Feature>
                {p.plaza_garaje && <Feature icon={Car}>Garaje</Feature>}
                {p.admite_mascotas && <Feature icon={PawPrint}>Mascotas</Feature>}
              </ul>

              <p className="mt-3 text-sm text-pretty text-ink">{p.descripcion_corta}</p>
              {p.horario_visitas && <p className="mt-auto pt-3 text-xs text-ink-subtle">Visitas {p.horario_visitas}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Feature({ icon: Icon, children }: { icon: typeof BedDouble; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <Icon aria-hidden="true" className="size-4 text-ink-subtle" />
      {children}
    </li>
  );
}
