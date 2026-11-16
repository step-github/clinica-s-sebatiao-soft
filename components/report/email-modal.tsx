"use client";

import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function EmailModal({
  open,
  onOpenChange,
  monthLabel,
  bullets,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthLabel: string;
  bullets: string[];
}) {
  const body = [
    "Bom dia,",
    "",
    `Segue o relatório de atividade de ${monthLabel}, gerado automaticamente.`,
    "",
    ...bullets.map((bullet) => `• ${bullet}`),
    "",
    "O PDF segue em anexo.",
    "",
    "Com os melhores cumprimentos,",
    "Painel de gestão · Clínica São Sebastião",
  ].join("\n");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Enviar por email">
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <dl className="grid grid-cols-[4.5rem_1fr] gap-y-1">
            <dt className="text-muted-foreground">Para</dt>
            <dd>Direção geral; Holding Marques SGPS</dd>
            <dt className="text-muted-foreground">Assunto</dt>
            <dd>Relatório de atividade — {monthLabel}</dd>
          </dl>
          <p className="mt-4 whitespace-pre-wrap border-t border-border pt-4 leading-6">{body}</p>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Paperclip className="h-3.5 w-3.5" />
            PDF em anexo
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast.success("Relatório enviado (simulação)");
              onOpenChange(false);
            }}
          >
            Enviar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
