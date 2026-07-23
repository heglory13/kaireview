"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const sessionStorageKey = "kai_visit_session_id";

export function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const sessionId = getSessionId();
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    fetch("/api/analytics/visit", {
      body: JSON.stringify({ path, sessionId }),
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      method: "POST",
    }).catch(() => undefined);
  }, [pathname, searchParams]);

  return null;
}

function getSessionId() {
  const existingValue = window.localStorage.getItem(sessionStorageKey);

  if (existingValue) {
    return existingValue;
  }

  const newValue = crypto.randomUUID();

  window.localStorage.setItem(sessionStorageKey, newValue);

  return newValue;
}
