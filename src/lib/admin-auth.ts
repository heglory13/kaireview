import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "kai_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;
export const ADMIN_DEFAULT_USERNAME = process.env.KAI_ADMIN_USERNAME ?? "admin";
export const ADMIN_DEFAULT_PASSWORD = process.env.KAI_ADMIN_PASSWORD;

const ADMIN_SESSION_PAYLOAD = "kaireview-admin";
const ADMIN_SESSION_SECRET =
  process.env.KAI_ADMIN_SESSION_SECRET ?? randomBytes(32).toString("base64url");
const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = "sha256";

export function createAdminSessionValue() {
  const signature = sign(ADMIN_SESSION_PAYLOAD);

  return `${ADMIN_SESSION_PAYLOAD}.${signature}`;
}

export function isAdminSessionValid(value: string | undefined) {
  if (!value) {
    return false;
  }

  return safeEqual(value, createAdminSessionValue());
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(
    password,
    salt,
    PASSWORD_ITERATIONS,
    PASSWORD_KEY_LENGTH,
    PASSWORD_DIGEST,
  ).toString("base64url");

  return `${PASSWORD_DIGEST}$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [digest, iterationsValue, salt, expectedHash] = storedHash.split("$");
  const iterations = Number(iterationsValue);

  if (
    digest !== PASSWORD_DIGEST ||
    !Number.isInteger(iterations) ||
    iterations <= 0 ||
    !salt ||
    !expectedHash
  ) {
    return false;
  }

  const hash = pbkdf2Sync(password, salt, iterations, PASSWORD_KEY_LENGTH, digest).toString(
    "base64url",
  );

  return safeEqual(hash, expectedHash);
}

function sign(value: string) {
  return createHmac("sha256", ADMIN_SESSION_SECRET).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
