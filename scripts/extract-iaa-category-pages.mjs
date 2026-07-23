import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const siteOrigin = "https://iaa.uk.net";
const projectRoot = process.cwd();
const dataFile = path.join(projectRoot, "src/lib/iaa-data.ts");
const outputFile = path.join(projectRoot, "src/lib/iaa-category-pages.generated.ts");
const assetRoot = path.join(projectRoot, "public/images/iaa/categories");
const publicAssetRoot = "/images/iaa/categories";

const pathAliases = new Map([
  ["/loi-iphone-7-mat-vi-trinh-modem/", "/iphone-7-mat-vi-trinh-modem/"],
]);

function decodeEntities(value = "") {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&hellip;/g, "...")
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

function extractFirst(html, pattern, fallback = "") {
  const match = html.match(pattern);
  return match ? match[1].trim() : fallback;
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

function slugFromCategoryHref(href) {
  return href.replace(/^\/chuyen-muc\/|\/+$/g, "");
}

function parseAttributes(tag = "") {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)=["']([^"']*)["']/g)].map((match) => [match[1], decodeEntities(match[2])]),
  );
}

function collectTargetCategories(source) {
  const categories = new Map();
  const categoryMatches = [...source.matchAll(/label:\s*"([^"]+)",\s*href:\s*"([^"]+)"/g)];

  for (const match of categoryMatches) {
    const category = {
      label: match[1],
      href: localizeHref(match[2]),
    };

    if (category.href.startsWith("/chuyen-muc/")) {
      categories.set(category.href, category);
    }
  }

  return [...categories.values()];
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

async function downloadAsset(url, categorySlug) {
  const absolute = absoluteUrl(url);
  const parsed = new URL(absolute);

  if (parsed.hostname !== "iaa.uk.net") {
    return url;
  }

  const fileName = fileNameFromUrl(absolute);
  const localDir = path.join(assetRoot, categorySlug);
  const localPath = path.join(localDir, fileName);
  const publicPath = `${publicAssetRoot}/${categorySlug}/${fileName}`;

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

async function extractPost(block, categorySlug) {
  const titleLink = block.match(/<h5 class="post-title[\s\S]*?<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
  if (!titleLink) {
    return undefined;
  }

  const imageTag = extractFirst(block, /(<img[\s\S]*?>)/, "");
  const imageAttrs = parseAttributes(imageTag);
  const dateDay = stripTags(extractFirst(block, /<span class="post-date-day">([\s\S]*?)<\/span>/, ""));
  const dateMonth = stripTags(
    extractFirst(block, /<span class="post-date-month[^"]*">([\s\S]*?)<\/span>/, ""),
  );

  return {
    title: stripTags(titleLink[2]),
    href: localizeHref(titleLink[1]),
    image: imageAttrs.src ? await downloadAsset(imageAttrs.src, categorySlug) : "/images/iaa/iaa-logo-1-1-968x800.png",
    alt: imageAttrs.alt ?? "",
    excerpt: stripTags(extractFirst(block, /<p class="from_the_blog_excerpt[^"]*"[^>]*>([\s\S]*?)<\/p>/, "")),
    date: dateDay && dateMonth ? { day: dateDay, month: dateMonth } : undefined,
  };
}

async function extractPosts(html, categorySlug) {
  const blocks = html.split(/<div class="col post-item"[^>]*>/).slice(1);
  const posts = [];

  for (const block of blocks) {
    const post = await extractPost(block, categorySlug);
    if (post) {
      posts.push(post);
    }
  }

  return posts;
}

function extractPagination(html, categoryHref) {
  const pagination = extractFirst(html, /<ul class="page-numbers[\s\S]*?>([\s\S]*?)<\/ul>/, "");
  if (!pagination) {
    return [{ label: "1", href: categoryHref, current: true }];
  }

  const links = [];
  for (const match of pagination.matchAll(/<li>([\s\S]*?)<\/li>/g)) {
    const item = match[1];
    const isCurrent = item.includes("current");
    const isNext = item.includes("next page-number");
    const label = isNext ? "›" : stripTags(item);

    links.push({
      label,
      href: categoryHref,
      current: isCurrent || undefined,
      isNext: isNext || undefined,
    });
  }

  return links.length ? links : [{ label: "1", href: categoryHref, current: true }];
}

function buildFallbackArchive(category) {
  const label = category.label;

  return {
    slug: slugFromCategoryHref(category.href),
    label,
    href: category.href,
    title: `Category Archives: ${label}`,
    posts: [],
    pagination: [{ label: "1", href: category.href, current: true }],
  };
}

async function extractCategory(category) {
  const slug = slugFromCategoryHref(category.href);
  const remoteUrl = `${siteOrigin}${category.href}`;
  const html = await fetchText(remoteUrl);
  const label = stripTags(
    extractFirst(html, /Category Archives:\s*<span>([\s\S]*?)<\/span>/, category.label),
  );

  return {
    slug,
    label,
    href: category.href,
    title: `Category Archives: ${label}`,
    posts: await extractPosts(html, slug),
    pagination: extractPagination(html, category.href),
  };
}

function writeGeneratedFile(archives) {
  const body = `import type { IaaCategoryArchiveData } from "@/types/iaa";

export const generatedCategoryArchives = ${JSON.stringify(archives, null, 2)} satisfies IaaCategoryArchiveData[];

export const generatedCategoryArchivesBySlug = Object.fromEntries(
  generatedCategoryArchives.map((archive) => [archive.slug, archive]),
) as Record<string, IaaCategoryArchiveData>;
`;

  return writeFile(outputFile, body);
}

async function main() {
  const source = await readFile(dataFile, "utf8");
  const categories = collectTargetCategories(source);
  const archives = [];

  for (const [index, category] of categories.entries()) {
    process.stdout.write(`[${index + 1}/${categories.length}] ${category.href} ... `);
    try {
      archives.push(await extractCategory(category));
      process.stdout.write("ok\n");
    } catch (error) {
      archives.push(buildFallbackArchive(category));
      process.stdout.write(
        `fallback: ${error instanceof Error ? error.message : String(error)}\n`,
      );
    }
  }

  await writeGeneratedFile(archives);
  process.stdout.write(`Wrote ${archives.length} archives to ${path.relative(projectRoot, outputFile)}\n`);
}

await main();
