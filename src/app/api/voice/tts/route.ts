import { NextResponse } from "next/server";
import { tts, stripForSpeech } from "@/lib/elevenlabs";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text?: string };
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "text obrigatório" }, { status: 400 });
    }
    const clean = stripForSpeech(text).slice(0, 2500);
    const { audio, contentType } = await tts(clean);
    return new Response(audio, {
      status: 200,
      headers: { "content-type": contentType, "cache-control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
