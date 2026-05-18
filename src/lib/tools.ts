import type { Perfil, Artefato, Aposta, Momento } from "./types";

export const TOOLS = [
  {
    name: "update_profile",
    description:
      "Atualiza o perfil acumulado da pessoa com novas informações extraídas da conversa. Chame sempre que capturar contexto (momento de carreira, formação, estado emocional), um novo momento concreto contado pela pessoa, ou uma North Star proposta/confirmada.",
    input_schema: {
      type: "object" as const,
      properties: {
        contexto: {
          type: "object",
          properties: {
            momento_carreira: { type: "string" },
            formacao: { type: "string" },
            estado_emocional: { type: "string" },
          },
        },
        novo_momento: {
          type: "object",
          properties: {
            descricao: { type: "string" },
            tipo: { type: "string", enum: ["energia_alta", "energia_baixa", "neutro"] },
            sinais: { type: "array", items: { type: "string" } },
          },
          required: ["descricao", "tipo"],
        },
        north_star: { type: "string" },
        north_star_confirmada: { type: "boolean" },
      },
    },
  },
  {
    name: "score_termometro",
    description:
      "Registra ou reforça um padrão identificado em um eixo do Life Design (modo_de_atividade, ambiente_preferido, fonte_de_energia, tolerancia_a_risco). Confianca é 0–1.",
    input_schema: {
      type: "object" as const,
      properties: {
        eixo: { type: "string" },
        valor: { type: "string" },
        confianca: { type: "number" },
        evidencia: { type: "string" },
      },
      required: ["eixo", "valor", "confianca", "evidencia"],
    },
  },
  {
    name: "generate_artifact",
    description:
      "Gera o artefato final (North Star + apostas) para entregar à pessoa. Chame SOMENTE depois que a North Star estiver confirmada pela pessoa E você tiver 2–3 apostas claras.",
    input_schema: {
      type: "object" as const,
      properties: {
        apostas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              titulo: { type: "string" },
              descricao: { type: "string" },
              hipotese: { type: "string" },
              sinal_de_sucesso: { type: "string" },
              custo: { type: "string", enum: ["baixo", "médio"] },
              prazo_dias: { type: "number" },
            },
            required: ["titulo", "descricao", "hipotese", "sinal_de_sucesso"],
          },
        },
      },
      required: ["apostas"],
    },
  },
];

type ToolInput = Record<string, unknown>;

export function aplicarTool(
  perfil: Perfil,
  nome: string,
  input: ToolInput,
): { ok: boolean; artefato?: Artefato; erro?: string } {
  if (nome === "update_profile") {
    if (input.contexto && typeof input.contexto === "object") {
      perfil.contexto = { ...perfil.contexto, ...(input.contexto as Perfil["contexto"]) };
    }
    if (input.novo_momento && typeof input.novo_momento === "object") {
      const m = input.novo_momento as Momento;
      perfil.momentos.push({ ...m, sinais: m.sinais ?? [] });
    }
    if (typeof input.north_star === "string") perfil.north_star = input.north_star;
    if (typeof input.north_star_confirmada === "boolean") {
      perfil.north_star_confirmada = input.north_star_confirmada;
    }
    return { ok: true };
  }

  if (nome === "score_termometro") {
    const eixo = String(input.eixo);
    const valor = String(input.valor);
    const conf = Number(input.confianca);
    const evidencia = String(input.evidencia);
    const existente = perfil.padroes.find((p) => p.eixo === eixo && p.valor === valor);
    if (existente) {
      existente.confianca = Math.min(1, existente.confianca + conf * 0.5);
      existente.evidencias.push(evidencia);
    } else {
      perfil.padroes.push({ eixo, valor, confianca: conf, evidencias: [evidencia] });
    }
    return { ok: true };
  }

  if (nome === "generate_artifact") {
    const apostas = (input.apostas as Aposta[]) ?? [];
    perfil.apostas = apostas;
    return { ok: true, artefato: montarArtefato(perfil) };
  }

  return { ok: false, erro: "ferramenta desconhecida" };
}

export function montarArtefato(perfil: Perfil): Artefato {
  return {
    north_star: perfil.north_star,
    apostas: perfil.apostas,
    gerado_em: new Date().toISOString(),
  };
}
