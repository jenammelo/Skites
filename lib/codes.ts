import { randomBytes } from "crypto";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity

function randomSegment(len: number) {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  return out;
}

export function generateActivationCode() {
  return `EVT-${randomSegment(4)}-${randomSegment(4)}`;
}

export function generateUsherToken() {
  return randomBytes(16).toString("hex");
}
