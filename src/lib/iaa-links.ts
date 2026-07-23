const pathAliases: Record<string, string> = {
  "/loi-iphone-7-mat-vi-trinh-modem/": "/iphone-7-mat-vi-trinh-modem/",
};

function withTrailingSlash(pathname: string) {
  if (pathname === "/" || pathname.endsWith("/")) {
    return pathname;
  }

  return `${pathname}/`;
}

function normalizeLocalPath(pathname: string) {
  const slashPath = withTrailingSlash(pathname);
  return pathAliases[slashPath] ?? slashPath;
}

export function localizeIaaHref(href: string) {
  if (href.startsWith("/")) {
    const [pathnameWithSearch, hash = ""] = href.split("#");
    const [pathname, search = ""] = pathnameWithSearch.split("?");
    return `${normalizeLocalPath(pathname)}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
  }

  try {
    const url = new URL(href);

    if (url.hostname === "iaa.uk.net") {
      return `${normalizeLocalPath(url.pathname)}${url.search}${url.hash}`;
    }
  } catch {
    return href;
  }

  return href;
}
