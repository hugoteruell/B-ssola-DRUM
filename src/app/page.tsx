"use client";
import { useEffect, useRef, useState } from "react";
import type { Aposta, Artefato, Fase } from "@/lib/types";

type Msg = { role: "user" | "assistant"; content: string };

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string>("");
  const [iniciou, setIniciou] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fase, setFase] = useState<Fase>("INTAKER");
  const [artefato, setArtefato] = useState<Artefato | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id = typeof window !== "undefined" ? localStorage.getItem("bussola_sid") : null;
    if (!id) {
      id = uid();
      if (typeof window !== "undefined") localStorage.setItem("bussola_sid", id);
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  async function enviar(texto: string) {
    if (!texto.trim() || loading || !sessionId) return;
    setMsgs((m) => [...m, { role: "user", content: texto }]);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, mensagem: texto }),
      });
      const data = await r.json();
      if (data.error) {
        setMsgs((m) => [...m, { role: "assistant", content: `⚠️ ${data.error}` }]);
      } else {
        setMsgs((m) => [...m, { role: "assistant", content: data.resposta || "..." }]);
        setFase(data.fase as Fase);
        if (data.artefato) setArtefato(data.artefato);
      }
    } catch (e) {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: `⚠️ Erro de rede: ${(e as Error).message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function iniciar() {
    setIniciou(true);
    await enviar("Oi! Estou pronta para conversar.");
  }

  async function resetar() {
    if (!sessionId) return;
    await fetch("/api/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    setMsgs([]);
    setArtefato(null);
    setFase("INTAKER");
    setIniciou(false);
  }

  const labelFase: Record<Fase, string> = {
    INTAKER: "Abertura",
    TERMOMETRO: "Exploração",
    SINTETIZADOR: "Síntese",
    ENCERRADO: "Sua Bússola",
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      <header className="w-full max-w-2xl flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">A Bússola</h1>
          <p className="text-sm text-[var(--muted)]">powered by DRUM</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-full border border-[var(--border)] text-[var(--muted)]">
            {labelFase[fase]}
          </span>
          {iniciou && (
            <button
              onClick={resetar}
              className="text-xs text-[var(--muted)] hover:text-[var(--fg)]"
            >
              recomeçar
            </button>
          )}
        </div>
      </header>

      {!iniciou ? (
        <section className="w-full max-w-2xl text-center mt-12">
          <h2 className="text-3xl font-semibold mb-3">
            Em 15 minutos, uma direção testável.
          </h2>
          <p className="text-[var(--muted)] mb-8 leading-relaxed">
            Não vou te dizer que cargo escolher. Vamos descobrir juntos quando você se sente vivo
            no trabalho — e transformar isso em 2 ou 3 apostas concretas para os próximos 90 dias.
          </p>
          <button
            onClick={iniciar}
            className="px-6 py-3 rounded-full bg-[var(--accent)] text-black font-medium hover:opacity-90"
          >
            Começar conversa
          </button>
        </section>
      ) : (
        <section className="w-full max-w-2xl flex-1 flex flex-col">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2"
            style={{ maxHeight: "calc(100vh - 220px)" }}
          >
            {msgs.slice(1).map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed text-sm ${
                    m.role === "user"
                      ? "bg-[var(--accent)] text-black"
                      : "bg-[var(--surface)] border border-[var(--border)]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--muted)]">
                  pensando…
                </div>
              </div>
            )}

            {artefato && <ArtefatoCard artefato={artefato} />}
          </div>

          {fase !== "ENCERRADO" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar(input);
              }}
              className="flex gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviar(input);
                  }
                }}
                placeholder="Escreva sua resposta…"
                rows={2}
                className="flex-1 resize-none rounded-2xl bg-[var(--surface)] border border-[var(--border)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 rounded-2xl bg-[var(--accent)] text-black font-medium disabled:opacity-40"
              >
                enviar
              </button>
            </form>
          )}
        </section>
      )}
    </main>
  );
}

function ArtefatoCard({ artefato }: { artefato: Artefato }) {
  return (
    <div className="mt-6 rounded-3xl border-2 border-[var(--accent)] bg-[var(--surface)] p-6 shadow-lg">
      <div className="text-center border-b border-[var(--border)] pb-4 mb-5">
        <div className="text-xs uppercase tracking-widest text-[var(--muted)]">Sua Bússola</div>
        <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-1">
          powered by DRUM
        </div>
      </div>
      <div className="mb-5">
        <div className="text-sm text-[var(--accent)] font-medium mb-2">⭐ Sua North Star</div>
        <p className="text-base leading-relaxed italic">&ldquo;{artefato.north_star}&rdquo;</p>
      </div>
      <div className="text-sm text-[var(--accent)] font-medium mb-3">
        🧭 Suas apostas para os próximos 90 dias
      </div>
      <ol className="space-y-4">
        {artefato.apostas.map((a: Aposta, i: number) => (
          <li key={i} className="border-l-2 border-[var(--accent)] pl-3">
            <div className="font-medium">
              {i + 1}. {a.titulo}
            </div>
            <p className="text-sm text-[var(--muted)] mt-1">{a.descricao}</p>
            <ul className="text-xs text-[var(--muted)] mt-2 space-y-0.5">
              <li>• Hipótese: {a.hipotese}</li>
              <li>• Sinal de sucesso: {a.sinal_de_sucesso}</li>
              <li>
                • Custo: {a.custo} | Prazo: {a.prazo_dias} dias
              </li>
            </ul>
          </li>
        ))}
      </ol>
      <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted)]">
        Quer ir mais fundo? O Programa Carreira da DRUM aprofunda essa direção em 7 etapas.
      </div>
    </div>
  );
}
