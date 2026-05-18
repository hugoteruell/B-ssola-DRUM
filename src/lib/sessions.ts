import "server-only";
import type { EstadoConversa, Artefato } from "./types";
import { estadoInicial } from "./orchestrator";
import { bbSelect, bbInsert, bbUpdate, bbDelete } from "./butterbase";

// Butterbase REST não aceita arrays como valor top-level em colunas JSONB.
// Empacotamos `historico` como { items: [...] } e desempacotamos na leitura.
type HistoricoWrap = { items: EstadoConversa["historico"] };

type Row = {
  id: string;
  session_key: string;
  fase: EstadoConversa["fase"];
  perfil: EstadoConversa["perfil"];
  historico: HistoricoWrap | EstadoConversa["historico"] | null;
  artefato: Artefato | null;
  created_at: string;
  updated_at: string;
};

function unwrapHistorico(h: Row["historico"]): EstadoConversa["historico"] {
  if (!h) return [];
  if (Array.isArray(h)) return h;
  if (typeof h === "object" && "items" in h && Array.isArray((h as HistoricoWrap).items)) {
    return (h as HistoricoWrap).items;
  }
  return [];
}

async function findRow(sessionKey: string): Promise<Row | null> {
  const rows = await bbSelect<Row>("bussola_sessions", {
    session_key: `eq.${sessionKey}`,
    limit: "1",
  });
  return rows[0] ?? null;
}

export async function getEstado(sessionKey: string): Promise<EstadoConversa> {
  const row = await findRow(sessionKey);
  if (row) {
    return {
      fase: row.fase,
      perfil: row.perfil,
      historico: unwrapHistorico(row.historico),
    };
  }
  const novo = estadoInicial();
  await bbInsert<Row>("bussola_sessions", {
    session_key: sessionKey,
    fase: novo.fase,
    perfil: novo.perfil,
    historico: { items: novo.historico },
  });
  return novo;
}

export async function setEstado(
  sessionKey: string,
  estado: EstadoConversa,
  artefato?: Artefato,
): Promise<void> {
  const row = await findRow(sessionKey);
  const patch: Record<string, unknown> = {
    fase: estado.fase,
    perfil: estado.perfil,
    historico: { items: estado.historico },
    updated_at: new Date().toISOString(),
  };
  if (artefato) patch.artefato = artefato;
  if (row) {
    await bbUpdate<Row>("bussola_sessions", row.id, patch);
  } else {
    await bbInsert<Row>("bussola_sessions", { session_key: sessionKey, ...patch });
  }
}

export async function resetEstado(sessionKey: string): Promise<void> {
  const row = await findRow(sessionKey);
  if (row) await bbDelete("bussola_sessions", row.id);
}
