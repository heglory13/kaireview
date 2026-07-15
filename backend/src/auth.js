import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const tokenSecret = process.env.AUTH_TOKEN_SECRET ?? "fptjobs-local-development-secret";
const tokenTtlSeconds = Number(process.env.AUTH_TOKEN_TTL_SECONDS ?? 7 * 24 * 60 * 60);

const sign = (value) => createHmac("sha256", tokenSecret).update(value).digest("base64url");

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, 64).toString("base64url");

  return {
    hash,
    salt,
  };
};

export const verifyPassword = (password, salt, expectedHash) => {
  const actualHash = scryptSync(password, salt, 64).toString("base64url");

  return safeCompare(actualHash, expectedHash);
};

export const createAuthToken = (user) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: issuedAt,
    exp: issuedAt + tokenTtlSeconds,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const verifyAuthToken = (token) => {
  if (typeof token !== "string") {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || !safeCompare(sign(encodedPayload), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);

    if (!payload.sub || !payload.exp || payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
