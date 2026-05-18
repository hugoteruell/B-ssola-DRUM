import "server-only";
import type { EstadoConversa } from "./types";
import { estadoInicial } from "./orchestrator";

// MVP: estado em memória. Em produção, trocar por Supabase/Redis.
const g = globalThis as unknown as { __bussolaSessions?: Map<string, EstadoConversa> };
if (!g.__bussolaSessions) g.__bussolaSessions = new Map();
const sessoes = g.__bussolaSessions;

export function getEstado(sessionId: string): EstadoConversa {
  let s = sessoes.get(sessionId);
  if (!s) {
    s = estadoInicial();
    sessoes.set(sessionId, s);
  }
  return s;
}

export function setEstado(sessionId: string, estado: EstadoConversa): void {
  sessoes.set(sessionId, estado);
}

export function resetEstado(sessionId: string): void {
  sessoes.delete(sessionId);
}
