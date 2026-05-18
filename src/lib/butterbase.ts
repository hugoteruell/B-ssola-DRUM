import "server-only";

const API_URL = process.env.BUTTERBASE_API_URL;
const API_KEY = process.env.BUTTERBASE_API_KEY;

function ensureEnv() {
  if (!API_URL || !API_KEY) {
    throw new Error("BUTTERBASE_API_URL and BUTTERBASE_API_KEY must be set in .env.local");
  }
}

async function bbFetch(path: string, init?: RequestInit): Promise<Response> {
  ensureEnv();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  return res;
}

export async function bbSelect<T>(
  table: string,
  query: Record<string, string> = {},
): Promise<T[]> {
  const qs = new URLSearchParams(query).toString();
  const res = await bbFetch(`/${table}${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`butterbase select ${table} ${res.status}: ${body}`);
  }
  return (await res.json()) as T[];
}

export async function bbInsert<T>(table: string, data: Record<string, unknown>): Promise<T> {
  const res = await bbFetch(`/${table}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`butterbase insert ${table} ${res.status}: ${body}`);
  }
  return (await res.json()) as T;
}

export async function bbUpdate<T>(
  table: string,
  id: string,
  data: Record<string, unknown>,
): Promise<T> {
  const res = await bbFetch(`/${table}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`butterbase update ${table} ${res.status}: ${body}`);
  }
  return (await res.json()) as T;
}

export async function bbDelete(table: string, id: string): Promise<void> {
  const res = await bbFetch(`/${table}/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`butterbase delete ${table} ${res.status}: ${body}`);
  }
}
