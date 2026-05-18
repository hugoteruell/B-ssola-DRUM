export interface Momento {
  descricao: string;
  tipo: "energia_alta" | "energia_baixa" | "neutro";
  sinais: string[];
}

export interface Padrao {
  eixo: string;
  valor: string;
  confianca: number;
  evidencias: string[];
}

export interface Aposta {
  titulo: string;
  descricao: string;
  hipotese: string;
  sinal_de_sucesso: string;
  custo: "baixo" | "médio";
  prazo_dias: number;
}

export interface Perfil {
  contexto: {
    momento_carreira?: string;
    formacao?: string;
    estado_emocional?: string;
  };
  momentos: Momento[];
  padroes: Padrao[];
  north_star: string | null;
  north_star_confirmada: boolean;
  apostas: Aposta[];
}

export type Fase = "INTAKER" | "TERMOMETRO" | "SINTETIZADOR" | "ENCERRADO";

export interface EstadoConversa {
  fase: Fase;
  perfil: Perfil;
  historico: { role: "user" | "assistant"; content: unknown }[];
}

export interface Artefato {
  north_star: string | null;
  apostas: Aposta[];
  gerado_em: string;
}
