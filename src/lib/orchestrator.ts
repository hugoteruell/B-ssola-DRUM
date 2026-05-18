import type { EstadoConversa, Fase } from "./types";

// Decide a fase com base no perfil. NÃO confia no modelo para mudar de fase.
export function proximaFase(estado: EstadoConversa): Fase {
  const { fase, perfil } = estado;

  if (fase === "INTAKER") {
    const c = perfil.contexto;
    const contextoOk = Boolean(c.momento_carreira && c.estado_emocional);
    return contextoOk ? "TERMOMETRO" : "INTAKER";
  }

  if (fase === "TERMOMETRO") {
    const momentosOk = perfil.momentos.length >= 3;
    const padroesOk = perfil.padroes.filter((p) => p.confianca >= 0.6).length >= 2;
    return momentosOk && padroesOk ? "SINTETIZADOR" : "TERMOMETRO";
  }

  if (fase === "SINTETIZADOR") {
    const fechou = perfil.north_star_confirmada && perfil.apostas.length >= 2;
    return fechou ? "ENCERRADO" : "SINTETIZADOR";
  }

  return fase;
}

export function estadoInicial(): EstadoConversa {
  return {
    fase: "INTAKER",
    perfil: {
      contexto: {},
      momentos: [],
      padroes: [],
      north_star: null,
      north_star_confirmada: false,
      apostas: [],
    },
    historico: [],
  };
}
