"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StateMessage } from "@/components/ui/StateMessage";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-line bg-surface">
        <StateMessage
          role="alert"
          tone="danger"
          icon={<TriangleAlert className="size-5" />}
          title="No se pudo cargar la información"
          action={
            <Button variant="primary" onClick={() => reset()}>
              <RotateCw aria-hidden="true" className="size-4" />
              Reintentar
            </Button>
          }
        >
          Puede ser un fallo puntual de conexión. Si persiste, vuelve a intentarlo en unos minutos.
        </StateMessage>
      </div>
    </div>
  );
}
