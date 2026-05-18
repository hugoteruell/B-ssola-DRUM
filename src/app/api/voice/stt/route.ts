import { NextResponse } from "next/server";
import { stt } from "@/lib/elevenlabs";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "audio_missing" }, { status: 400 });
    }
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "audio_too_large" }, { status: 413 });
    }
    const { transcript } = await stt(file);
    return NextResponse.json({ transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
