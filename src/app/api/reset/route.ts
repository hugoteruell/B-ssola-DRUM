import { NextRequest, NextResponse } from "next/server";
import { resetEstado } from "@/lib/sessions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { sessionId } = (await req.json()) as { sessionId: string };
  if (sessionId) resetEstado(sessionId);
  return NextResponse.json({ ok: true });
}
