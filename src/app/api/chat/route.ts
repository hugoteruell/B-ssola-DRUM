import { NextRequest, NextResponse } from "next/server";
import { client, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { TOOLS, aplicarTool, montarArtefato } from "@/lib/tools";
import { proximaFase } from "@/lib/orchestrator";
import { promptDaFase } from "@/lib/prompts";
import { getEstado, setEstado } from "@/lib/sessions";

export const runtime = "nodejs";
export const maxDuration = 60;

type AnthropicBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: string; [k: string]: unknown };

export async function POST(req: NextRequest) {
  try {
    const { sessionId, mensagem } = (await req.json()) as { sessionId: string; mensagem: string };
    if (!sessionId || typeof mensagem !== "string") {
      return NextResponse.json({ error: "sessionId e mensagem são obrigatórios" }, { status: 400 });
    }

    const estado = await getEstado(sessionId);
    estado.historico.push({ role: "user", content: mensagem });

    let respostaFinal = "";
    let continuar = true;
    let artefato: ReturnType<typeof montarArtefato> | undefined;
    let guard = 0;

    while (continuar && guard < 6) {
      guard++;
      const resp = await client().messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: promptDaFase(estado.fase),
        tools: TOOLS,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: estado.historico as any,
      });

      const blocos = resp.content as AnthropicBlock[];
      const toolResults: { type: "tool_result"; tool_use_id: string; content: string }[] = [];
      let textoTurno = "";

      for (const bloco of blocos) {
        if (bloco.type === "tool_use") {
          const r = aplicarTool(estado.perfil, bloco.name as string, bloco.input as Record<string, unknown>);
          if (r.artefato) artefato = r.artefato;
          toolResults.push({
            type: "tool_result",
            tool_use_id: bloco.id as string,
            content: JSON.stringify(r),
          });
        } else if (bloco.type === "text") {
          textoTurno += (bloco as { text: string }).text;
        }
      }

      respostaFinal += textoTurno;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      estado.historico.push({ role: "assistant", content: blocos as any });

      if (toolResults.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        estado.historico.push({ role: "user", content: toolResults as any });
        continuar = resp.stop_reason === "tool_use";
      } else {
        continuar = false;
      }
    }

    estado.fase = proximaFase(estado);
    const artefatoFinal =
      artefato ?? (estado.fase === "ENCERRADO" ? montarArtefato(estado.perfil) : undefined);
    await setEstado(sessionId, estado, artefatoFinal);

    return NextResponse.json({
      resposta: respostaFinal,
      fase: estado.fase,
      perfil: estado.perfil,
      encerrado: estado.fase === "ENCERRADO",
      artefato: artefatoFinal,
    });
  } catch (err) {
    console.error("/api/chat error", err);
    const message = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
