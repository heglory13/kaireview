import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const siteOrigin = "https://iaa.uk.net";
const projectRoot = process.cwd();
const dataFile = path.join(projectRoot, "src/lib/iaa-data.ts");
const categoryDataFile = path.join(projectRoot, "src/lib/iaa-category-pages.generated.ts");
const outputFile = path.join(projectRoot, "src/lib/iaa-article-pages.generated.ts");
const assetRoot = path.join(projectRoot, "public/images/iaa/generated");
const publicAssetRoot = "/images/iaa/generated";
const fallbackAvatar = "/images/kai-favicon.svg";
const fallbackCategory = {
  label: "Công Nghệ",
  href: "/chuyen-muc/cong-nghe/",
};

const nonArticlePaths = new Set([
  "/",
  "/lien-he/",
  "/dieu-khoan-dich-vu/",
  "/chinh-sach-bao-mat/",
  "/chinh-sach-cookies/",
]);

const pathAliases = new Map([
  ["/loi-iphone-7-mat-vi-trinh-modem/", "/iphone-7-mat-vi-trinh-modem/"],
]);

function decodeEntities(value = "") {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value = "") {
  return decodeEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function extractFirst(html, pattern, fallback = "") {
  const match = html.match(pattern);
  return match ? match[1].trim() : fallback;
}

function slugFromHref(href) {
  return href.replace(/^\/+|\/+$/g, "");
}

function withTrailingSlash(pathname) {
  if (pathname === "/" || pathname.endsWith("/")) {
    return pathname;
  }

  return `${pathname}/`;
}

function normalizeLocalPath(pathname) {
  const slashPath = withTrailingSlash(pathname);
  return pathAliases.get(slashPath) ?? slashPath;
}

function localizeHref(href = "") {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }

  try {
    const url = new URL(decodeEntities(href), siteOrigin);
    if (url.hostname === "iaa.uk.net") {
      return `${normalizeLocalPath(url.pathname)}${url.search}${url.hash}`;
    }
  } catch {
    return href;
  }

  return href;
}

function absoluteUrl(url) {
  const decoded = decodeEntities(url);
  if (decoded.startsWith("//")) {
    return `https:${decoded}`;
  }
  return new URL(decoded, siteOrigin).href;
}

function sanitizeFileName(fileName) {
  return decodeURIComponent(fileName)
    .replace(/\?.*$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

function fileNameFromUrl(url, fallback = "asset.jpg") {
  const parsed = new URL(url);
  const base = sanitizeFileName(path.basename(parsed.pathname));
  return base.includes(".") ? base : fallback;
}

function collectArticleHrefs(source) {
  const hrefs = [...source.matchAll(/(?:href:|"href":)\s*"([^"]+)"/g)].map((match) =>
    localizeHref(match[1]),
  );
  return [...new Set(hrefs)]
    .filter((href) => href.startsWith("/"))
    .filter((href) => !href.startsWith("/chuyen-muc/"))
    .filter((href) => !href.startsWith("/author/"))
    .filter((href) => !href.startsWith("/tag/"))
    .filter((href) => !href.startsWith("/images/"))
    .filter((href) => !nonArticlePaths.has(href));
}

function collectKnownPosts(source) {
  const posts = new Map();
  const postPattern =
    /\{\s*title:\s*"([^"]+)",\s*href:\s*"([^"]+)",\s*image:\s*"([^"]+)",\s*alt:\s*"([^"]*)"([\s\S]*?)(?=\n\s*\}[,;])/g;

  for (const match of source.matchAll(postPattern)) {
    const rest = match[5];
    const excerpt = extractFirst(rest, /excerpt:\s*"([^"]+)"/, "");
    const date = rest.match(/date:\s*\{\s*day:\s*"([^"]+)",\s*month:\s*"([^"]+)"/);

    posts.set(match[2], {
      title: match[1],
      href: match[2],
      image: match[3],
      alt: match[4],
      excerpt,
      date: date ? { day: date[1], month: date[2] } : undefined,
    });
  }

  return posts;
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildDateLabels(date) {
  if (!date) {
    return {
      publishedLabel: "",
      publishedDateTime: "",
      updatedLabel: "",
      updatedDateTime: "",
    };
  }

  const month = date.month.replace(/^Th/i, "");
  const year = ["1", "2", "3"].includes(month) ? "2026" : "2025";
  const label = `Tháng ${month} ${date.day}, ${year}`;
  const dateTime = `${year}-${month.padStart(2, "0")}-${date.day.padStart(2, "0")}T00:00:00+07:00`;

  return {
    publishedLabel: label,
    publishedDateTime: dateTime,
    updatedLabel: label,
    updatedDateTime: dateTime,
  };
}

function inferCategory(href) {
  if (
    href.includes("ot-") ||
    href.includes("sate") ||
    href.includes("tinh-bot") ||
    href.includes("gia-vi")
  ) {
    return {
      label: "Ẩm Thực",
      href: "/chuyen-muc/am-thuc/",
    };
  }

  return fallbackCategory;
}

function buildFallbackArticle(href, knownPosts) {
  const slug = slugFromHref(href);
  const knownPost = knownPosts.get(href);
  const title = knownPost?.title ?? titleFromSlug(slug);
  const description = knownPost?.excerpt || title;
  const imageHtml = knownPost?.image
    ? `<p><img class="aligncenter size-full" src="${knownPost.image}" alt="${escapeHtml(
        knownPost.alt,
      )}" width="600" height="400" /></p>`
    : "";
  const excerptHtml = description ? `<p>${escapeHtml(description)}</p>` : "";

  return {
    slug,
    title,
    description,
    href,
    category: inferCategory(href),
    ...buildDateLabels(knownPost?.date),
    author: {
      name: "kaireview",
      href: "/author/tiengdung00/",
      avatar: fallbackAvatar,
    },
    contentHtml: `<div id="ftwp-postcontent">${imageHtml}${excerptHtml}</div>`,
    relatedPosts: [],
  };
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function downloadAsset(url, slug) {
  const absolute = absoluteUrl(url);
  const parsed = new URL(absolute);

  if (parsed.hostname !== "iaa.uk.net") {
    return url;
  }

  const fileName = fileNameFromUrl(absolute);
  const localDir = path.join(assetRoot, slug);
  const localPath = path.join(localDir, fileName);
  const publicPath = `${publicAssetRoot}/${slug}/${fileName}`;

  if (existsSync(localPath)) {
    return publicPath;
  }

  const response = await fetch(absolute);
  if (!response.ok) {
    return localizeHref(url);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return localizeHref(url);
  }

  await mkdir(localDir, { recursive: true });
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(localPath, buffer);

  return publicPath;
}

async function localizeImages(html, slug) {
  let output = html
    .replace(/\s+srcset=(["'])[\s\S]*?\1/g, "")
    .replace(/\s+sizes=(["'])[\s\S]*?\1/g, "");

  const srcMatches = [...output.matchAll(/src=(["'])([^"']+)\1/g)];
  const replacements = new Map();

  for (const match of srcMatches) {
    const original = match[2];
    if (original.startsWith("data:")) {
      continue;
    }

    const absolute = absoluteUrl(original);
    const url = new URL(absolute);
    if (url.hostname !== "iaa.uk.net") {
      continue;
    }

    replacements.set(original, await downloadAsset(absolute, slug));
  }

  for (const [from, to] of replacements.entries()) {
    output = output.replaceAll(from, to);
    output = output.replaceAll(from.replace(/&/g, "&amp;"), to);
  }

  return output;
}

async function localizeRelatedPosts(html, slug) {
  const relatedPosts = [];
  const itemPattern =
    /<div class="related__postItem">[\s\S]*?<a class="post__img" href="([^"]+)"><img src="([^"]+)"[^>]*><\/a>[\s\S]*?<a class="post__title" href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<li class="post__date"><img[^>]*>([\s\S]*?)<\/li>/g;

  for (const match of html.matchAll(itemPattern)) {
    const href = localizeHref(match[1] || match[3]);
    const image = await downloadAsset(match[2], slug);
    relatedPosts.push({
      title: stripTags(match[4]),
      href,
      image,
      alt: "",
      age: stripTags(match[5]),
    });
  }

  return relatedPosts;
}

function extractContent(html) {
  return (
    extractFirst(html, /<div class="entry-content single-page">\s*([\s\S]*?)\s*<div class="blog-share/, "") ||
    extractFirst(html, /<div class="entry-content single-page">\s*([\s\S]*?)\s*<footer class="entry-meta/, "")
  );
}

function extractPreviousPost(html) {
  const previous = html.match(/<div class="nav-previous"><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/div>/);
  if (!previous) {
    return undefined;
  }

  return {
    href: localizeHref(previous[1]),
    title: stripTags(previous[2]).replace(/^‹\s*/, ""),
  };
}

function extractTag(html) {
  const footer = extractFirst(html, /<footer class="entry-meta text-center">([\s\S]*?)<\/footer>/, "");
  const tag = footer.match(/rel="tag">([\s\S]*?)<\/a>/);
  const href = footer.match(/href="([^"]+)" rel="tag"/);
  if (!tag || !href) {
    return undefined;
  }

  return {
    label: stripTags(tag[1]),
    href: localizeHref(href[1]),
  };
}

async function extractArticle(href) {
  const slug = slugFromHref(href);
  const remoteUrl = `${siteOrigin}${href}`;
  const html = await fetchText(remoteUrl);
  const contentHtml = await localizeImages(extractContent(html), slug);
  const relatedPosts = await localizeRelatedPosts(html, slug);
  const categoryHref = extractFirst(html, /<h6 class="entry-category is-xsmall"><a href="([^"]+)"/, "/");
  const categoryLabel = extractFirst(
    html,
    /<h6 class="entry-category is-xsmall"><a href="[^"]+"[^>]*>([\s\S]*?)<\/a><\/h6>/,
    "Tin tức",
  );

  return {
    slug,
    title: stripTags(extractFirst(html, /<h1 class="entry-title">([\s\S]*?)<\/h1>/, "")),
    description: decodeEntities(
      extractFirst(html, /<meta name="description" content="([^"]*)"/, "").replace(/\s+/g, " "),
    ),
    href,
    category: {
      label: stripTags(categoryLabel),
      href: localizeHref(categoryHref),
    },
    publishedLabel: stripTags(
      extractFirst(html, /<time class="entry-date published"[^>]*>([\s\S]*?)<\/time>/, ""),
    ),
    publishedDateTime: extractFirst(html, /<time class="entry-date published" datetime="([^"]+)"/, ""),
    updatedLabel: stripTags(extractFirst(html, /<time class="updated"[^>]*>([\s\S]*?)<\/time>/, "")),
    updatedDateTime: extractFirst(html, /<time class="updated" datetime="([^"]+)"/, ""),
    author: {
      name: stripTags(extractFirst(html, /<a class="url fn n" href="[^"]+">([\s\S]*?)<\/a>/, "kaireview")),
      href: localizeHref(extractFirst(html, /<a class="url fn n" href="([^"]+)"/, "/author/tiengdung00/")),
      avatar: fallbackAvatar,
    },
    tag: extractTag(html),
    previousPost: extractPreviousPost(html),
    contentHtml: contentHtml
      .replace(/\s+decoding=(["'])[^"']*\1/g, "")
      .replace(/\s+loading=(["'])[^"']*\1/g, "")
      .replace(/href=(["'])([^"']+)\1/g, (_, quote, url) => `href=${quote}${localizeHref(url)}${quote}`),
    relatedPosts,
  };
}

function writeGeneratedFile(articles) {
  const body = `import type { IaaArticle } from "@/types/iaa";

export const generatedArticleDetails = ${JSON.stringify(articles, null, 2)} satisfies IaaArticle[];

export const generatedArticleDetailsBySlug = Object.fromEntries(
  generatedArticleDetails.map((article) => [article.slug, article]),
) as Record<string, IaaArticle>;
`;

  return writeFile(outputFile, body);
}

async function main() {
  const source = await readFile(dataFile, "utf8");
  const categorySource = existsSync(categoryDataFile) ? await readFile(categoryDataFile, "utf8") : "";
  const knownPosts = collectKnownPosts(`${source}\n${categorySource}`);
  const hrefs = collectArticleHrefs(`${source}\n${categorySource}`);
  const articles = [];

  for (const [index, href] of hrefs.entries()) {
    process.stdout.write(`[${index + 1}/${hrefs.length}] ${href} ... `);
    try {
      const article = await extractArticle(href);
      articles.push(article);
      process.stdout.write("ok\n");
    } catch (error) {
      articles.push(buildFallbackArticle(href, knownPosts));
      process.stdout.write(
        `fallback: ${error instanceof Error ? error.message : String(error)}\n`,
      );
    }
  }

  await writeGeneratedFile(articles);
  process.stdout.write(`Wrote ${articles.length} articles to ${path.relative(projectRoot, outputFile)}\n`);
}

await main();
