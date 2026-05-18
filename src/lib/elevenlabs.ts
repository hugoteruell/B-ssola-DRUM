import "server-only";

const BASE = "https://api.elevenlabs.io/v1";

function key(): string {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) throw new Error("ELEVENLABS_API_KEY missing");
  return k;
}

export async function tts(text: string): Promise<{ audio: ArrayBuffer; contentType: string }> {
  const voiceId =
    process.env.ELEVENLABS_VOICE_ID ||
    process.env.ELEVENLABS_TTS_VOICE_ID ||
    "21m00Tcm4TlvDq8ikWAM";
  const modelId = process.env.ELEVENLABS_TTS_MODEL_ID || "eleven_multilingual_v2";
  const res = await fetch(`${BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": key(),
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS failed: ${res.status} ${detail.slice(0, 200)}`);
  }
  const audio = await res.arrayBuffer();
  return { audio, contentType: "audio/mpeg" };
}

export async function stt(audio: Blob): Promise<{ transcript: string }> {
  const modelId =
    process.env.ELEVENLABS_STT_MODEL_ID || process.env.ELEVENLABS_STT_MODEL || "scribe_v1";
  const fd = new FormData();
  fd.append("file", audio, "answer.webm");
  fd.append("model_id", modelId);
  const res = await fetch(`${BASE}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": key() },
    body: fd,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs STT failed: ${res.status} ${detail.slice(0, 200)}`);
  }
  const json = (await res.json()) as { text?: string };
  if (typeof json.text !== "string") throw new Error("STT returned no transcript");
  return { transcript: json.text };
}

// Limpa markdown comum antes de mandar pro TTS — asteriscos e backticks
// sairiam como "asterisco" / pausas estranhas na fala.
export function stripForSpeech(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.+?)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/[—–]/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}
