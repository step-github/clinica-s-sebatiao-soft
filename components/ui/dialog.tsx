"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  title,
}: {
  className?: string;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="overlay-in fixed inset-0 z-50 bg-slate-900/45" />
      <DialogPrimitive.Content
        className={cn(
          "dialog-in fixed left-1/2 top-1/2 z-50 max-h-[min(90vh,40rem)] w-[min(100%-2rem,40rem)] overflow-y-auto rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl",
          className,
        )}
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <DialogPrimitive.Title className="text-lg font-semibold tracking-tight">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Pré-visualização do email com o resumo do relatório e o PDF em anexo.
          </DialogPrimitive.Description>
          <DialogPrimitive.Close
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
