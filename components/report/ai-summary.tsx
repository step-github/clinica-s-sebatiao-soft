"use client";

import { Pencil, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cardClass } from "@/components/report/section";

function StreamingBullets({ text, onDone }: { text: string; onDone: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let index = 0;
    const step = Math.max(2, Math.ceil(text.length / 110));
    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + step);
      setCount(index);
      if (index >= text.length) {
        window.clearInterval(timer);
        onDone();
      }
    }, 16);
    return () => window.clearInterval(timer);
  }, [onDone, text]);

  const lines = text
    .slice(0, count)
    .split("\n")
    .filter((line) => line.length > 0);

  return (
    <ul className="mt-4 space-y-2.5 text-sm leading-6">
      {lines.map((line, index) => (
        <li key={index} className="flex gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>
            {line}
            {index === lines.length - 1 && count < text.length ? (
              <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-primary align-middle" />
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AiSummary({
  bullets,
  streaming,
  onRegenerate,
  onSave,
  onStreamDone,
}: {
  bullets: string[];
  streaming: boolean;
  onRegenerate: () => void;
  onSave: (bullets: string[]) => void;
  onStreamDone: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const text = bullets.join("\n");
  const lines = text.split("\n").filter((line) => line.length > 0);

  return (
    <article className={`${cardClass} border-primary/20 bg-gradient-to-br from-[#e8f4f8] via-card to-card p-5 dark:from-[#063544]/50 sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Resumo do mês</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Gerado por IA
          </span>
        </div>
        <div className="no-print flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRegenerate} disabled={editing}>
            <RefreshCw className={streaming ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Regenerar
          </Button>
          {editing ? (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  const next = draft
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean);
                  onSave(next.length ? next : bullets);
                  setEditing(false);
                }}
              >
                Concluir
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(bullets.join("\n"));
                setEditing(true);
              }}
              disabled={streaming}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="mt-4 min-h-40 w-full rounded-xl border border-border bg-card px-3 py-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Editar resumo"
        />
      ) : streaming ? (
        <StreamingBullets key={text} text={text} onDone={onStreamDone} />
      ) : (
        <ul className="mt-4 space-y-2.5 text-sm leading-6">
          {lines.map((line, index) => (
            <li key={`${index}-${line.slice(0, 24)}`} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-muted-foreground">Revisto antes do envio · pode editar</p>
    </article>
  );
}
