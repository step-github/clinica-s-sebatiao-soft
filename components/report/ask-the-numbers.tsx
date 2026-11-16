"use client";

import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { answerQuestion, suggestedQuestions, type AiBar, type AiTable } from "@/lib/ai-scripts";
import { cardClass } from "@/components/report/section";
import { formatNumberPT } from "@/lib/format";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  pending?: boolean;
  table?: AiTable;
  bars?: AiBar[];
};

function StreamingText({
  text,
  messageId,
  onDone,
}: {
  text: string;
  messageId: number;
  onDone: (id: number) => void;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let index = 0;
    const step = Math.max(2, Math.ceil(text.length / 140));
    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + step);
      setCount(index);
      if (index >= text.length) {
        window.clearInterval(timer);
        onDone(messageId);
      }
    }, 16);
    return () => window.clearInterval(timer);
  }, [messageId, onDone, text]);

  const shown = text.slice(0, count);
  const sourceSplit = shown.lastIndexOf("\n\nFonte:");
  const body = sourceSplit >= 0 ? shown.slice(0, sourceSplit) : shown;
  const source = sourceSplit >= 0 ? shown.slice(sourceSplit + 2) : count >= text.length ? "" : "";
  const finished = count >= text.length;
  const sourceText = finished ? text.slice(text.lastIndexOf("Fonte:")) : source.startsWith("Fonte:") ? source : "";

  return (
    <div>
      <p className="whitespace-pre-wrap leading-6">
        {body}
        {count < text.length ? (
          <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-primary align-middle" />
        ) : null}
      </p>
      {sourceText ? <p className="mt-3 text-xs text-muted-foreground">{sourceText}</p> : null}
    </div>
  );
}

export function AskTheNumbers({ monthId }: { monthId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [settled, setSettled] = useState<Record<number, boolean>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const suggestions = suggestedQuestions(monthId);
  const markSettled = useCallback((id: number) => {
    setSettled((current) => ({ ...current, [id]: true }));
    setBusy(false);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, settled]);

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    const userId = nextId.current;
    const assistantId = userId + 1;
    nextId.current += 2;
    setInput("");
    setBusy(true);
    setMessages((current) => [
      ...current,
      { id: userId, role: "user", text: trimmed },
      { id: assistantId, role: "assistant", text: "", pending: true },
    ]);
    window.setTimeout(() => {
      const answer = answerQuestion(trimmed, monthId);
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, text: answer.text, table: answer.table, bars: answer.bars, pending: false }
            : message,
        ),
      );
    }, 280);
  }

  return (
    <section className={`${cardClass} no-print p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Pergunte aos números</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          IA
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Respostas preparadas a partir dos dados deste relatório.
      </p>

      <div ref={listRef} className="mt-4 max-h-96 space-y-3 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={message.role === "user" ? "flex justify-end" : ""}>
            <div
              className={
                message.role === "user"
                  ? "max-w-[85%] rounded-2xl bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
                  : "max-w-[95%] rounded-2xl bg-muted px-3.5 py-2.5 text-sm"
              }
            >
              {message.role === "user" ? (
                message.text
              ) : message.pending ? (
                <span className="text-muted-foreground">A consultar os números…</span>
              ) : (
                <>
                  <StreamingText text={message.text} messageId={message.id} onDone={markSettled} />
                  {settled[message.id] && message.table ? <MiniTable table={message.table} /> : null}
                  {settled[message.id] && message.bars ? <MiniBars bars={message.bars} /> : null}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => ask(question)}
            disabled={busy}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs font-medium hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escreva uma pergunta"
          aria-label="Pergunta sobre os números"
          className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length === 0}
          className="h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Perguntar
        </button>
      </form>
    </section>
  );
}

function MiniTable({ table }: { table: AiTable }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-muted-foreground">
            {table.columns.map((column) => (
              <th key={column} className="py-1 pr-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.join("|")} className="border-t border-border/70">
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className="py-1.5 pr-3 tabular-nums">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniBars({ bars }: { bars: AiBar[] }) {
  const max = Math.max(...bars.map((bar) => bar.value), 1);
  return (
    <div className="mt-3 space-y-1.5">
      {bars.map((bar) => (
        <div key={bar.label} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 text-xs">
          <span className="text-muted-foreground">{bar.label}</span>
          <div className="h-1.5 overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(bar.value / max) * 100}%` }} />
          </div>
          <span className="tabular-nums">{formatNumberPT(bar.value)}</span>
        </div>
      ))}
    </div>
  );
}
