import { UserX } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { StateMessage } from "@/components/ui/StateMessage";

export default function ContactNotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-line bg-surface">
        <StateMessage
          icon={<UserX className="size-5" />}
          title="Contacto no encontrado"
          action={<ButtonLink href="/">Volver a contactos</ButtonLink>}
        >
          Puede que el enlace sea antiguo o que el contacto se haya eliminado.
        </StateMessage>
      </div>
    </div>
  );
}
