export function buildExternalUrl(request: Request, pathname: string) {
  const requestUrl = new URL(request.url);
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const hostHeader = firstHeaderValue(request.headers.get("host"));
  const host = sanitizeHost(forwardedHost) ?? sanitizeHost(hostHeader) ?? requestUrl.host;
  const protocol =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : requestUrl.protocol.replace(":", "");

  return new URL(pathname, `${protocol}://${host}`);
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}

function sanitizeHost(value: string) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

  if (!normalized || normalized === "0.0.0.0") {
    return null;
  }

  return normalized;
}
