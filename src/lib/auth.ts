const encoder = new TextEncoder();

export const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function requireSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET environment variable");
  return secret;
}

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export async function createSessionToken(): Promise<string> {
  const secret = requireSecret();
  const expires = Date.now() + SESSION_TTL_MS;
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(String(expires)));
  return `${expires}.${toHex(signature)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expiresStr, sigHex] = token.split(".");
  if (!expiresStr || !sigHex) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  try {
    const secret = requireSecret();
    const key = await getKey(secret);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      fromHex(sigHex),
      encoder.encode(expiresStr)
    );
  } catch {
    return false;
  }
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
