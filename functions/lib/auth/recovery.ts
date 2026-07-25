// Recovery ("backup") codes for accounts that lose access to their
// authenticator app. Codes are shown exactly once at generation time — only
// a SHA-256 hash of each code is ever persisted.

const CODE_COUNT = 10;
const GROUP_LENGTH = 4;
// Unambiguous alphabet: no 0/O or 1/I confusion.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomGroup(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(GROUP_LENGTH));
  let group = "";
  for (const byte of bytes) {
    group += ALPHABET[byte % ALPHABET.length];
  }
  return group;
}

/** Generates N plaintext recovery codes, formatted like ABCD-EFGH. */
export function generateRecoveryCodes(count = CODE_COUNT): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(`${randomGroup()}-${randomGroup()}`);
  }
  return codes;
}

/** Normalizes user input (case/whitespace) before hashing or comparison. */
export function normalizeRecoveryCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export async function hashRecoveryCode(code: string): Promise<string> {
  const normalized = normalizeRecoveryCode(code);
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type StoredRecoveryCode = {
  id: string;
  codeHash: string;
};

/**
 * Finds the stored code matching the submitted plaintext, if any and unused.
 * Returns null when there's no match — callers should treat that the same
 * as an invalid code rather than a 500, to avoid leaking which codes exist.
 */
export async function matchRecoveryCode(
  submittedCode: string,
  candidates: StoredRecoveryCode[],
): Promise<StoredRecoveryCode | null> {
  const submittedHash = await hashRecoveryCode(submittedCode);
  return candidates.find((c) => c.codeHash === submittedHash) ?? null;
}
