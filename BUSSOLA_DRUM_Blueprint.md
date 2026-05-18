# A Bússola DRUM — Blueprint de Produto e Implementação

> Agente de IA conversacional que comprime o **Programa Carreira da DRUM** (7 etapas, semanas) em uma conversa de **~15 minutos**, entregando uma **North Star + 2–3 apostas testáveis para 90 dias**.

Este documento é um guia de ponta a ponta: do conceito de produto à arquitetura de agentes, aos prompts e ao código de referência. Use-o como ponto de partida para construir um MVP em uma tarde (hackathon) ou um produto real em 2–4 semanas.

---

## Índice

1. [Visão do Produto](#1-visão-do-produto)
2. [Princípios de Design](#2-princípios-de-design)
3. [A Experiência: o que o usuário vive](#3-a-experiência-o-que-o-usuário-vive)
4. [Arquitetura de Agentes](#4-arquitetura-de-agentes)
5. [A Metodologia DRUM codificada](#5-a-metodologia-drum-codificada)
6. [Modelo de Dados](#6-modelo-de-dados)
7. [Stack Técnico](#7-stack-técnico)
8. [Prompts dos Agentes](#8-prompts-dos-agentes)
9. [Código de Referência](#9-código-de-referência)
10. [O Artefato Final (North Star + Apostas)](#10-o-artefato-final-north-star--apostas)
11. [Roteiro de Construção](#11-roteiro-de-construção)
12. [Métricas e Riscos](#12-métricas-e-riscos)
13. [Roadmap pós-MVP](#13-roadmap-pós-mvp)

---

## 1. Visão do Produto

**O problema:** recém-formados sofrem de *paralisia de decisão*. Há opções demais (consultoria, produto, dados, empreendedorismo, carreira pública), poucas vagas de entrada, e uma pressão crescente para "construir" e provar valor rapidamente.

**Por que as soluções atuais falham:** ferramentas de IA pura têm baixíssima retenção porque entregam *recomendações estáticas* ("você deveria ser Gerente de Produto"). Isso reduz o déficit de informação, mas não resolve a paralisia — frequentemente a piora.

**A tese da Bússola — Direção, não Destino:**

| Concorrente diz | A Bússola diz |
|---|---|
| "Você deveria ser X" | "Você se realiza quando *[característica]*. Teste isto nos próximos 90 dias." |
| Entrega uma resposta | Entrega uma **hipótese testável** + ações concretas |
| Recomendação estática | Experimento dinâmico de baixo custo |

O usuário não sai com uma resposta. Sai com uma **bússola**: uma direção clara e 2–3 experimentos baratos para começar *hoje*.

**Posicionamento:** primeira solução que combina **metodologia proprietária** (Life Design da DRUM) com **ação prototipada em 90 dias**, num formato **escalável via IA**, focada especificamente em **recém-formados** (não corporativo como BetterUp, não genérico como ChatGPT/LinkedIn, não só assessment como CareerExplorer).

---

## 2. Princípios de Design

Estes princípios devem guiar cada decisão de produto e cada linha de prompt.

1. **Conversa, não formulário.** O usuário deve sentir que conversou com um mentor, não que preencheu um questionário. O agente faz uma pergunta por vez, reage ao que ouviu e aprofunda.
2. **Direção > Destino.** Nunca prescrever um cargo. Sempre traduzir em um *padrão de realização* ("você se energiza quando resolve problemas ambíguos com pessoas").
3. **Ação barata e imediata.** Toda aposta deve ser executável **sem precisar de um emprego**: conversas, projetos pequenos, experimentos. Custo baixo, erro barato.
4. **Metodologia proprietária visível.** O usuário deve perceber que está usando algo *da DRUM* — Termômetro, frameworks de Life Design — e não um chatbot genérico.
5. **Artefato tangível.** A conversa sempre termina com um documento concreto: a North Star + apostas, que a pessoa pode salvar, compartilhar e revisitar.
6. **15 minutos, com saída honrosa.** O fluxo respeita o tempo. Se o usuário quer ir mais fundo, há a ponte para o Programa Carreira completo.
7. **IA dá direção, humano valida.** Comunicar de forma transparente que a IA oferece um ponto de partida testável — não a decisão final.

---

## 3. A Experiência: o que o usuário vive

Fluxo de ~15 minutos dividido em **4 fases** (≈3–4 min cada):

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ 1. ABERTURA │ → │ 2. EXPLORAÇÃO│ → │ 3. SÍNTESE  │ → │ 4. APOSTAS  │
│  (Intaker)  │   │ (Termômetro)│   │ (North Star)│   │  (90 dias)  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
    ~2 min            ~6 min            ~3 min            ~4 min
```

### Fase 1 — Abertura (Intaker)
Acolhimento. O agente explica em uma frase o que vai acontecer e por quê. Captura o contexto inicial: momento de carreira, formação, o que a pessoa está sentindo agora (a ansiedade, a paralisia). Tom: caloroso, sem jargão.

### Fase 2 — Exploração (Termômetro DRUM)
O coração da conversa. O agente investiga, por diálogo, **quando a pessoa se sente viva** e **quando se sente drenada** — usando perguntas do Termômetro DRUM. Não pergunta "o que você quer fazer", pergunta sobre *momentos concretos* do passado (projetos, trabalhos, matérias, situações) e extrai padrões. Aprofunda em 3–4 momentos.

### Fase 3 — Síntese (North Star)
O agente reflete de volta o que ouviu e propõe uma **North Star**: uma frase de direção no formato *"Você se realiza quando [padrão de atividade] em contextos de [tipo de ambiente], gerando [tipo de impacto]."* O usuário confirma, ajusta ou refina — é uma negociação, não um veredito.

### Fase 4 — Apostas de 90 dias
A North Star é traduzida em **2–3 apostas**: experimentos concretos, baratos, executáveis em 90 dias. Cada aposta tem: o que fazer, por que (qual hipótese testa), e como saber se "deu certo". Termina com o artefato exportável e a ponte opcional para o Programa Carreira.

---

## 4. Arquitetura de Agentes

A Bússola é um **agente conversacional com um orquestrador de estado**. O usuário sempre fala com **uma única voz** ("a Bússola"), mas por baixo há fases especializadas e ferramentas.

```
                ┌──────────────────────────┐
usuário ──────► │   ORQUESTRADOR (state)   │
                │   - fase atual           │
                │   - perfil acumulado     │
                │   - decide transições    │
                └────────────┬─────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────────┐  ┌──────────────────┐
│AGENTE INTAKER│    │AGENTE TERMÔMETRO │  │AGENTE SINTETIZADOR│
│ abertura +   │    │ exploração via   │  │ North Star +     │
│ contexto     │    │ Termômetro DRUM  │  │ apostas de 90 d. │
└──────────────┘    └──────────────────┘  └──────────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ▼
                ┌──────────────────────────┐
                │   FERRAMENTAS (tools)    │
                │   - update_profile()     │
                │   - score_termometro()   │
                │   - generate_artifact()  │
                └──────────────────────────┘
```

### Por que essa arquitetura

- **Uma voz, várias fases.** Modelar como fases (não como múltiplos chatbots) preserva a sensação de conversa contínua. O orquestrador troca o *system prompt* conforme a fase, mas a UX é contínua.
- **Estado explícito.** O `perfil` é um objeto estruturado que cresce a cada turno. Isso garante que a North Star seja construída sobre evidências reais, não sobre alucinação.
- **Ferramentas como contrato.** Forçar o modelo a chamar `update_profile()` e `score_termometro()` transforma a conversa em dados estruturados auditáveis.

### Os três agentes

| Agente | Responsabilidade | Entrada | Saída |
|---|---|---|---|
| **Intaker** | Acolher, explicar o processo, capturar contexto inicial | Primeira mensagem do usuário | `perfil.contexto` preenchido |
| **Termômetro** | Explorar momentos de energia/drenagem; extrair padrões | `perfil.contexto` | `perfil.momentos[]`, `perfil.padroes[]` |
| **Sintetizador** | Propor North Star; gerar apostas de 90 dias; produzir o artefato | `perfil` completo | `north_star`, `apostas[]`, artefato |

### Lógica de transição (state machine)

```
INTAKER    → TERMOMETRO    quando: contexto mínimo capturado (momento de carreira + estado emocional)
TERMOMETRO → SINTETIZADOR  quando: ≥3 momentos explorados E ≥2 padrões identificados com confiança
SINTETIZADOR → ENCERRADO   quando: North Star confirmada pelo usuário E apostas geradas
```

O orquestrador decide a transição lendo o `perfil` após cada turno (não confia no modelo para "saber" quando mudar de fase).

---

## 5. A Metodologia DRUM codificada

A defensabilidade do produto está aqui: a Bússola não é matching genérico. Estes artefatos devem ser preenchidos com o conteúdo real e proprietário da DRUM antes de ir a produção. Abaixo está a *estrutura* a ser preenchida.

### 5.1 Termômetro DRUM — banco de perguntas

Perguntas que investigam energia (não competência). O agente escolhe dinamicamente, sem soar como checklist.

```yaml
termometro_drum:
  energia_alta:
    - "Me conta um momento — pode ser do estágio, da faculdade, de um projeto pessoal — em que você perdeu a noção do tempo. O que estava fazendo?"
    - "Qual foi a última vez que terminou algo cansado, mas com vontade de fazer de novo?"
    - "Pensa numa entrega da qual você se orgulha. O que nela te deu essa sensação?"
  energia_baixa:
    - "E o contrário: qual tipo de tarefa faz o relógio andar devagar pra você?"
    - "Teve algum trabalho ou matéria que você foi bem, mas que te esvaziava? Por quê?"
  contexto_e_ambiente:
    - "Você se lembra mais energizado sozinho resolvendo algo, ou junto de outras pessoas?"
    - "Estrutura clara ou ambiguidade — qual te deixa mais à vontade?"
  impacto:
    - "Quando o que você fez gerou impacto, esse impacto foi pra quem? Como você percebeu?"
```

> **Para a DRUM preencher:** substituir/expandir com o banco real de perguntas do Termômetro e os critérios de pontuação proprietários.

### 5.2 Frameworks DRUM

Três lentes; o MVP usa **Life Design**. As outras ficam para a expansão.

| Framework | Para quem | Status no MVP |
|---|---|---|
| **Life Design** | Recém-formados em definição de direção | ✅ Ativo |
| **Empreendedorismo** | Quem quer construir/testar negócio próprio | 📥 Pós-MVP |
| **Transição / Sucessão** | Mid-career mudando de área ou assumindo liderança | 📥 Pós-MVP |

### 5.3 Eixos de padrão (Life Design)

O Sintetizador classifica a pessoa em eixos. Estrutura sugerida (a calibrar com a DRUM):

```yaml
eixos_life_design:
  modo_de_atividade:   [criar, analisar, organizar, conectar, ensinar, decidir]
  ambiente_preferido:  [estruturado, ambíguo, autônomo, colaborativo]
  fonte_de_energia:    [pessoas, ideias, dados, execução, impacto_visível]
  tolerancia_a_risco:  [baixa, média, alta]
```

### 5.4 Banco de apostas (templates)

Apostas são experimentos baratos, executáveis sem emprego. O Sintetizador instancia templates conforme os padrões.

```yaml
templates_de_aposta:
  conversa:
    descricao: "Converse com {n} pessoas que vivem {padrão} no dia a dia."
    exemplo: "Converse com 3 consultores esta semana e pergunte o que mais os energiza."
    custo: baixo
    testa: "Se o dia a dia real bate com a sua hipótese de realização."
  projeto_pequeno:
    descricao: "Faça um projeto de {atividade} sobre {tema} em 2 semanas."
    exemplo: "Faça uma análise de dados de um tema que você curte e publique."
    custo: baixo
    testa: "Se você se energiza fazendo, não só imaginando."
  metodologia:
    descricao: "Aplique {metodologia} num problema real do seu contexto."
    exemplo: "Use design thinking para repensar um processo do seu trabalho atual."
    custo: baixo
    testa: "Se a forma de trabalhar te atrai tanto quanto a área."
  imersao:
    descricao: "Passe {tempo} dentro de um ambiente de {tipo} (evento, voluntariado, shadowing)."
    custo: médio
    testa: "Se o ambiente te dá energia ou te drena."
```

> **Para a DRUM preencher:** mapear quais North Stars do Programa Carreira geraram quais ações bem-sucedidas, e transformar isso em templates calibrados.

---

## 6. Modelo de Dados

O objeto `perfil` é o coração do estado. Cresce a cada turno; nunca é sobrescrito sem evidência.

```ts
interface Momento {
  descricao: string;       // o que a pessoa contou
  tipo: "energia_alta" | "energia_baixa" | "neutro";
  sinais: string[];        // padrões extraídos: "trabalho em grupo", "ambiguidade", ...
}

interface Padrao {
  eixo: string;            // ex: "modo_de_atividade"
  valor: string;           // ex: "criar"
  confianca: number;       // 0–1, sobe conforme momentos confirmam
  evidencias: string[];    // referências a Momento.descricao
}

interface Aposta {
  titulo: string;
  descricao: string;       // o que fazer, concreto
  hipotese: string;        // o que esta aposta testa
  sinal_de_sucesso: string;// como saber se "deu certo"
  custo: "baixo" | "médio";
  prazo_dias: number;      // tipicamente 14–30, dentro da janela de 90
}

interface Perfil {
  contexto: {
    momento_carreira: string;  // "recém-formado", "último ano", ...
    formacao: string;
    estado_emocional: string;  // captura a ansiedade/paralisia
  };
  momentos: Momento[];
  padroes: Padrao[];
  north_star: string | null;
  north_star_confirmada: boolean;
  apostas: Aposta[];
}

type Fase = "INTAKER" | "TERMOMETRO" | "SINTETIZADOR" | "ENCERRADO";

interface EstadoConversa {
  fase: Fase;
  perfil: Perfil;
  historico: { role: "user" | "assistant"; content: string }[];
}
```

---

## 7. Stack Técnico

Recomendação para construir rápido e escalar depois.

| Camada | MVP (hackathon) | Produção |
|---|---|---|
| **LLM** | Claude (via API Anthropic) | Mesmo, com prompts versionados |
| **Backend** | Node.js + Express, ou rota serverless | Node.js + fila para sessões longas |
| **Estado** | Em memória / objeto de sessão | Postgres ou Redis por `session_id` |
| **Frontend** | Página única (HTML + JS) ou React | React, com streaming de tokens |
| **Artefato** | HTML/Markdown renderizado na tela | PDF + link compartilhável |
| **Auth** | Nenhuma (anônimo) | Login leve para salvar histórico |

**Por que Claude:** suporta *tool use* nativo (essencial para `update_profile` / `score_termometro`), mantém tom conversacional consistente e segue instruções de fase com fidelidade. O modelo recomendado é a família mais recente disponível na API; verifique a documentação da Anthropic para o identificador exato no momento da implementação.

> Princípio de arquitetura: **a conversa é stateless do lado do LLM**. Cada chamada envia todo o histórico + `perfil`. O servidor é o dono do estado.

---

## 8. Prompts dos Agentes

Os prompts são o produto. Versione-os. Abaixo, versões de referência — a DRUM deve refiná-las com sua linguagem e metodologia reais.

### 8.1 Prompt-base (compartilhado por todas as fases)

```
Você é "a Bússola", uma mentora de carreira da DRUM. Você conversa com
recém-formados que sentem paralisia diante de opções demais.

PRINCÍPIOS INEGOCIÁVEIS:
- Você dá DIREÇÃO, nunca um destino. Jamais diga "você deveria ser [cargo]".
  Traduza tudo em padrões de realização.
- Uma pergunta por vez. Reaja ao que a pessoa disse antes de seguir.
- Tom caloroso, próximo, sem jargão corporativo. Você é uma mentora, não um RH.
- Conversa de verdade, não formulário. Nunca liste perguntas numeradas.
- Respeite o tempo: a conversa toda dura ~15 minutos.
- Você representa a metodologia Life Design da DRUM. Não é um chatbot genérico.

Você NÃO pode:
- Prometer empregos ou resultados garantidos.
- Substituir a decisão da pessoa. Você oferece hipóteses testáveis.
```

### 8.2 Prompt — Fase INTAKER

```
[PROMPT-BASE]

FASE ATUAL: ABERTURA.

Seu objetivo nesta fase: acolher a pessoa, explicar em 1-2 frases o que vão
fazer juntas, e capturar o contexto inicial.

Capture (e registre via update_profile):
- momento de carreira (recém-formado, último ano da faculdade, etc.)
- formação
- estado emocional atual (a ansiedade, a sensação de paralisia)

Comece se apresentando de forma breve e calorosa. Depois, faça UMA pergunta
aberta sobre o momento de vida da pessoa. Não avance para exploração ainda.

Quando tiver o contexto mínimo, chame update_profile e deixe o orquestrador
decidir a transição.
```

### 8.3 Prompt — Fase TERMÔMETRO

```
[PROMPT-BASE]

FASE ATUAL: EXPLORAÇÃO (Termômetro DRUM).

Seu objetivo: descobrir QUANDO a pessoa se sente viva e QUANDO se sente
drenada — investigando momentos concretos do passado.

REGRAS:
- Pergunte sobre momentos REAIS e específicos (um projeto, uma matéria, um
  estágio), nunca sobre "o que você quer ser".
- A cada resposta, identifique sinais (trabalho em grupo? ambiguidade?
  criação? análise?) e registre via update_profile e score_termometro.
- Aprofunde: se a pessoa cita um momento, pergunte "o que NELE te deu energia".
- Explore pelo menos 3 momentos antes de considerar a fase completa.
- Use o banco de perguntas do Termômetro como inspiração, adaptando ao fluxo.

Banco de perguntas do Termômetro (use com naturalidade, não como lista):
[INSERIR termometro_drum AQUI]
```

### 8.4 Prompt — Fase SINTETIZADOR

```
[PROMPT-BASE]

FASE ATUAL: SÍNTESE + APOSTAS.

Você tem o perfil completo da pessoa. Faça duas coisas, em ordem:

PASSO 1 — NORTH STAR:
Reflita de volta o que você ouviu e proponha uma North Star no formato:
"Você se realiza quando [padrão de atividade] em contextos de [ambiente],
gerando [tipo de impacto]."

Apresente como proposta, não veredito. Pergunte se ressoa e ajuste com a
pessoa até ela confirmar. Registre via update_profile.

PASSO 2 — APOSTAS DE 90 DIAS (só após confirmação):
Traduza a North Star em 2-3 apostas. Cada aposta deve ser:
- concreta e executável SEM precisar de um emprego
- de custo baixo (ou no máximo médio)
- acompanhada da hipótese que testa e do sinal de sucesso

Use os templates de aposta como base:
[INSERIR templates_de_aposta AQUI]

Ao final, chame generate_artifact e convide a pessoa a, se quiser ir mais
fundo, conhecer o Programa Carreira completo da DRUM.
```

### 8.5 Definição das ferramentas (tool use)

```json
[
  {
    "name": "update_profile",
    "description": "Atualiza o perfil acumulado da pessoa com novas informações extraídas da conversa.",
    "input_schema": {
      "type": "object",
      "properties": {
        "contexto": { "type": "object" },
        "novo_momento": {
          "type": "object",
          "properties": {
            "descricao": { "type": "string" },
            "tipo": { "type": "string", "enum": ["energia_alta", "energia_baixa", "neutro"] },
            "sinais": { "type": "array", "items": { "type": "string" } }
          }
        },
        "north_star": { "type": "string" },
        "north_star_confirmada": { "type": "boolean" }
      }
    }
  },
  {
    "name": "score_termometro",
    "description": "Registra ou reforça um padrão identificado em um eixo do Life Design.",
    "input_schema": {
      "type": "object",
      "properties": {
        "eixo": { "type": "string" },
        "valor": { "type": "string" },
        "confianca": { "type": "number" },
        "evidencia": { "type": "string" }
      },
      "required": ["eixo", "valor", "confianca", "evidencia"]
    }
  },
  {
    "name": "generate_artifact",
    "description": "Gera o artefato final (North Star + apostas) para entregar à pessoa.",
    "input_schema": {
      "type": "object",
      "properties": {
        "apostas": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "titulo": { "type": "string" },
              "descricao": { "type": "string" },
              "hipotese": { "type": "string" },
              "sinal_de_sucesso": { "type": "string" },
              "custo": { "type": "string", "enum": ["baixo", "médio"] },
              "prazo_dias": { "type": "number" }
            },
            "required": ["titulo", "descricao", "hipotese", "sinal_de_sucesso"]
          }
        }
      },
      "required": ["apostas"]
    }
  }
]
```

---

## 9. Código de Referência

Implementação mínima em Node.js. Mostra o orquestrador, a máquina de estados e o loop de conversa com *tool use*. É um esqueleto para adaptar — não código de produção pronto.

### 9.1 Estrutura de arquivos

```
bussola-drum/
├── server.js           # API: rota /chat
├── orchestrator.js     # máquina de estados + montagem de prompt
├── prompts.js          # prompt-base e prompts de fase
├── tools.js            # definição e execução das ferramentas
├── methodology/
│   ├── termometro.yaml # banco de perguntas DRUM
│   └── apostas.yaml    # templates de aposta DRUM
└── public/
    └── index.html      # interface de conversa
```

### 9.2 `orchestrator.js` — máquina de estados

```js
// orchestrator.js
// Decide a fase com base no perfil. NÃO confia no modelo para mudar de fase.

function proximaFase(estado) {
  const { fase, perfil } = estado;

  if (fase === "INTAKER") {
    const c = perfil.contexto;
    const contextoOk = c.momento_carreira && c.estado_emocional;
    return contextoOk ? "TERMOMETRO" : "INTAKER";
  }

  if (fase === "TERMOMETRO") {
    const momentosOk = perfil.momentos.length >= 3;
    const padroesOk = perfil.padroes.filter(p => p.confianca >= 0.6).length >= 2;
    return (momentosOk && padroesOk) ? "SINTETIZADOR" : "TERMOMETRO";
  }

  if (fase === "SINTETIZADOR") {
    const fechou = perfil.north_star_confirmada && perfil.apostas.length >= 2;
    return fechou ? "ENCERRADO" : "SINTETIZADOR";
  }

  return fase;
}

function estadoInicial() {
  return {
    fase: "INTAKER",
    perfil: {
      contexto: {},
      momentos: [],
      padroes: [],
      north_star: null,
      north_star_confirmada: false,
      apostas: []
    },
    historico: []
  };
}

module.exports = { proximaFase, estadoInicial };
```

### 9.3 `tools.js` — execução das ferramentas

```js
// tools.js
// Aplica as chamadas de ferramenta do modelo ao estado do servidor.

function aplicarTool(perfil, nome, input) {
  if (nome === "update_profile") {
    if (input.contexto) {
      perfil.contexto = { ...perfil.contexto, ...input.contexto };
    }
    if (input.novo_momento) {
      perfil.momentos.push(input.novo_momento);
    }
    if (input.north_star) perfil.north_star = input.north_star;
    if (typeof input.north_star_confirmada === "boolean") {
      perfil.north_star_confirmada = input.north_star_confirmada;
    }
    return { ok: true };
  }

  if (nome === "score_termometro") {
    const existente = perfil.padroes.find(
      p => p.eixo === input.eixo && p.valor === input.valor
    );
    if (existente) {
      // reforça a confiança quando um novo momento confirma o padrão
      existente.confianca = Math.min(1, existente.confianca + input.confianca * 0.5);
      existente.evidencias.push(input.evidencia);
    } else {
      perfil.padroes.push({
        eixo: input.eixo,
        valor: input.valor,
        confianca: input.confianca,
        evidencias: [input.evidencia]
      });
    }
    return { ok: true };
  }

  if (nome === "generate_artifact") {
    perfil.apostas = input.apostas;
    return { ok: true, artefato: montarArtefato(perfil) };
  }

  return { ok: false, erro: "ferramenta desconhecida" };
}

function montarArtefato(perfil) {
  return {
    north_star: perfil.north_star,
    apostas: perfil.apostas,
    gerado_em: new Date().toISOString()
  };
}

module.exports = { aplicarTool, montarArtefato };
```

### 9.4 `server.js` — loop de conversa

```js
// server.js
// Rota /chat: recebe a mensagem do usuário, roda o turno, devolve a resposta.

const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const { proximaFase, estadoInicial } = require("./orchestrator");
const { aplicarTool } = require("./tools");
const { promptDaFase } = require("./prompts");
const { TOOLS } = require("./tools-schema"); // o array JSON da seção 8.5

const app = express();
app.use(express.json());
app.use(express.static("public"));

const anthropic = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente
const sessoes = new Map();         // session_id -> EstadoConversa (trocar por DB em produção)

app.post("/chat", async (req, res) => {
  const { sessionId, mensagem } = req.body;
  let estado = sessoes.get(sessionId) || estadoInicial();
  estado.historico.push({ role: "user", content: mensagem });

  // Loop de turno: o modelo pode chamar ferramentas várias vezes antes de responder.
  let respostaFinal = "";
  let continuar = true;

  while (continuar) {
    const resp = await anthropic.messages.create({
      model: "claude-<modelo-mais-recente>", // ver docs da Anthropic
      max_tokens: 1024,
      system: promptDaFase(estado.fase),     // system prompt da fase atual
      tools: TOOLS,
      messages: estado.historico
    });

    // Aplica eventuais chamadas de ferramenta ao estado do servidor
    const toolResults = [];
    for (const bloco of resp.content) {
      if (bloco.type === "tool_use") {
        const r = aplicarTool(estado.perfil, bloco.name, bloco.input);
        toolResults.push({
          type: "tool_result",
          tool_use_id: bloco.id,
          content: JSON.stringify(r)
        });
      }
      if (bloco.type === "text") {
        respostaFinal += bloco.text;
      }
    }

    estado.historico.push({ role: "assistant", content: resp.content });

    if (toolResults.length > 0) {
      // devolve os resultados das ferramentas e deixa o modelo continuar
      estado.historico.push({ role: "user", content: toolResults });
      continuar = true;
    } else {
      continuar = false;
    }
  }

  // O orquestrador reavalia a fase DEPOIS de o estado ter sido atualizado.
  estado.fase = proximaFase(estado);
  sessoes.set(sessionId, estado);

  res.json({
    resposta: respostaFinal,
    fase: estado.fase,
    perfil: estado.perfil,
    encerrado: estado.fase === "ENCERRADO"
  });
});

app.listen(3000, () => console.log("Bússola DRUM rodando na porta 3000"));
```

### 9.5 `prompts.js`

```js
// prompts.js
const fs = require("fs");

const PROMPT_BASE = `Você é "a Bússola", uma mentora de carreira da DRUM...`; // seção 8.1
const termometro = fs.readFileSync("./methodology/termometro.yaml", "utf8");
const apostas = fs.readFileSync("./methodology/apostas.yaml", "utf8");

const PROMPTS = {
  INTAKER:      `${PROMPT_BASE}\n\nFASE ATUAL: ABERTURA...`,                          // seção 8.2
  TERMOMETRO:   `${PROMPT_BASE}\n\nFASE ATUAL: EXPLORAÇÃO...\n${termometro}`,         // 8.3
  SINTETIZADOR: `${PROMPT_BASE}\n\nFASE ATUAL: SÍNTESE...\n${apostas}`,               // 8.4
  ENCERRADO:    PROMPT_BASE
};

function promptDaFase(fase) {
  return PROMPTS[fase] || PROMPT_BASE;
}

module.exports = { promptDaFase };
```

> **Nota de implementação:** o `model` exato e a forma de passar `tool_result` podem variar conforme a versão do SDK da Anthropic. Consulte a documentação oficial em `docs.claude.com` no momento de construir.

---

## 10. O Artefato Final (North Star + Apostas)

O que o usuário leva para casa. Deve caber em uma tela e ser bonito o suficiente para a pessoa querer compartilhar.

```
╔═══════════════════════════════════════════════════╗
║                  SUA BÚSSOLA                      ║
║                 powered by DRUM                   ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║   ⭐ SUA NORTH STAR                                ║
║   "Você se realiza quando cria soluções para      ║
║    problemas ambíguos, em ambientes colaborativos,║
║    gerando impacto visível para pessoas."         ║
║                                                   ║
║   🧭 SUAS APOSTAS PARA OS PRÓXIMOS 90 DIAS        ║
║                                                   ║
║   ① Converse com 3 pessoas que constroem produtos ║
║     • Hipótese: o dia a dia de produto te energiza║
║     • Sinal de sucesso: você sai das conversas    ║
║       com mais vontade, não menos                 ║
║     • Custo: baixo  |  Prazo: 14 dias             ║
║                                                   ║
║   ② Faça um projeto pequeno de discovery sobre um ║
║     tema que você curte e publique o resultado    ║
║     • Hipótese: você gosta de FAZER, não só       ║
║       de imaginar                                 ║
║     • Sinal de sucesso: você termina e quer       ║
║       fazer outro                                 ║
║     • Custo: baixo  |  Prazo: 21 dias             ║
║                                                   ║
║   ③ Participe de um evento/comunidade da área     ║
║     • Hipótese: o ambiente te dá energia          ║
║     • Sinal de sucesso: você se sente "em casa"   ║
║     • Custo: baixo  |  Prazo: 30 dias             ║
║                                                   ║
║   ────────────────────────────────────────────    ║
║   Quer ir mais fundo? O Programa Carreira da DRUM ║
║   aprofunda essa direção em 7 etapas. → [saber mais] ║
╚═══════════════════════════════════════════════════╝
```

Implementação: o `generate_artifact` retorna o objeto estruturado; o frontend renderiza esse layout (HTML/CSS). Em produção, gerar também um PDF e um link compartilhável.

---

## 11. Roteiro de Construção

### Trilha A — MVP de hackathon (uma tarde / um dia)

| # | Tarefa | Tempo |
|---|---|---|
| 1 | Escrever os 3 prompts de fase + prompt-base | 1h |
| 2 | Preencher `termometro.yaml` e `apostas.yaml` com conteúdo DRUM | 1h |
| 3 | Implementar `orchestrator.js` + `tools.js` | 1h |
| 4 | Implementar `server.js` com loop de tool use | 1h |
| 5 | Página única de conversa (`index.html`) com streaming simples | 1h |
| 6 | Renderizar o artefato final + testar fluxo ponta a ponta | 1h |

**Resultado:** demo ao vivo funcional, com a conversa completa e o artefato.

### Trilha B — Produto real (2–4 semanas)

- **Semana 1:** persistência de estado (Postgres/Redis), versionamento de prompts, calibração da metodologia com a DRUM.
- **Semana 2:** frontend React com streaming de tokens, geração de PDF, link compartilhável.
- **Semana 3:** testes com usuários reais (recém-formados), ajuste de tom e de profundidade das perguntas.
- **Semana 4:** instrumentação de métricas, modelo freemium, ponte para o Programa Carreira.

---

## 12. Métricas e Riscos

### Métricas-chave

| Métrica | O que mede | Meta inicial |
|---|---|---|
| Taxa de conclusão da conversa | Quantos chegam ao artefato | > 70% |
| Tempo médio de conversa | Fidelidade aos ~15 min | 12–18 min |
| North Star confirmada sem reescrita pesada | Qualidade da síntese | > 60% |
| Retorno em 90 dias (reportar progresso das apostas) | Engajamento real | acompanhar |
| Conversão para Programa Carreira | Valor para o ecossistema DRUM | acompanhar |

> O diferencial competitivo da Bússola sobre IA pura é a retenção. A métrica que importa não é "gostou da conversa", é "voltou para contar como foi a aposta".

### Riscos e mitigações

| Risco | Mitigação no produto |
|---|---|
| Viés algorítmico nas recomendações | Templates de aposta auditáveis; revisão periódica de outputs; teste com populações diversas |
| Falta de engajamento após os 15 min | Acompanhamento de 90 dias; lembretes leves; ponte para mentores DRUM |
| Conversa virar "formulário" | Prompt força uma pergunta por vez e reação ao contexto; revisão de transcrições |
| Modelo "prescrever cargo" (quebrar o princípio) | Princípio explícito no prompt-base; testes que verificam ausência de prescrição de cargo |
| Aceitação de IA para decisões de carreira | Comunicar sempre: IA dá direção testável, não decisão final |
| Concorrência de grandes players | Defensabilidade na metodologia DRUM, não na tecnologia |

---

## 13. Roadmap pós-MVP

A mesma arquitetura, novos contextos — trocando frameworks e banco de apostas:

1. **Bússola para Transição** — profissionais mid-career mudando de área (ativa o framework Transição/Sucessão).
2. **Bússola para Liderança** — transição de IC para gestão.
3. **Bússola Corporativa** — empresas usando internamente para orientar colaboradores; modelo B2B.
4. **Integração com o Intaker** — o Intaker mostra ao mercado quem é o júnior; a Bússola mostra ao júnior para onde ir. Mesmo motor de conversação, dois lados.

Cada expansão reusa o orquestrador, o modelo de dados e a estrutura de tool use. O que muda é o conteúdo da metodologia — exatamente onde está a defensabilidade.

---

## Apêndice — Checklist de prontidão para produção

- [ ] `termometro.yaml` preenchido com o banco real de perguntas DRUM
- [ ] `apostas.yaml` calibrado com North Stars/ações reais do Programa Carreira
- [ ] Eixos do Life Design validados com a equipe DRUM
- [ ] Prompts revisados na voz da marca DRUM
- [ ] Estado persistido em banco (não em memória)
- [ ] Identificador de modelo confirmado na documentação da Anthropic
- [ ] Teste de não-prescrição: o agente nunca diz "você deveria ser [cargo]"
- [ ] Artefato exportável (PDF + link)
- [ ] Instrumentação das 5 métricas-chave
- [ ] Texto de transparência: "a IA oferece direção, não decisão final"

---

*Documento de blueprint — A Bússola DRUM. Estruturado a partir da análise "A Bússola DRUM: Validação Estratégica da Ideia com Dados de Mercado".*
