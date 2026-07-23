import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const databasePath = path.join(dataDir, "iaa.sqlite");
const snapshotPath = path.join(rootDir, "src/lib/iaa-db.snapshot.ts");
const siteAuthorAvatar = "/images/kai-favicon.svg";

function readGeneratedArray(relativePath, exportName) {
  const source = readFileSync(path.join(rootDir, relativePath), "utf8");
  const marker = `export const ${exportName} = `;
  const start = source.indexOf(marker);

  if (start === -1) {
    throw new Error(`Cannot find ${exportName} in ${relativePath}`);
  }

  const afterMarker = source.slice(start + marker.length);
  const end = afterMarker.indexOf(" satisfies ");

  if (end === -1) {
    throw new Error(`Cannot find end of ${exportName} in ${relativePath}`);
  }

  return JSON.parse(afterMarker.slice(0, end));
}

function slugFromHref(href) {
  return href.replace(/\?.*$/, "").replace(/^\/+|\/+$/g, "");
}

function normalizeSearchText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function firstImageFromHtml(value = "") {
  return value.match(/<img[^>]+src="([^"]+)"/)?.[1];
}

function textExcerpt(value) {
  const clean = stripHtml(value);

  if (clean.length <= 150) {
    return clean;
  }

  return `${clean.slice(0, 147).trim()}...`;
}

function createSearchEntries(articles, archives) {
  const entries = new Map();

  for (const archive of archives) {
    for (const post of archive.posts) {
      const existing = entries.get(post.href);
      const text = `${post.title} ${post.excerpt ?? ""} ${archive.label}`;

      entries.set(post.href, {
        post: existing?.post ?? post,
        text: `${existing?.text ?? ""} ${text}`,
      });
    }
  }

  for (const article of articles) {
    const existing = entries.get(article.href);
    const body = stripHtml(article.contentHtml ?? "");
    const text = `${article.title} ${article.description} ${article.category.label} ${body}`;

    entries.set(article.href, {
      post:
        existing?.post ??
        {
          title: article.title,
          href: article.href,
          image:
            firstImageFromHtml(article.contentHtml) ??
            article.relatedPosts?.[0]?.image ??
            "/images/iaa/iaa-logo-1-1-968x800.png",
          alt: article.title,
          excerpt: article.description || textExcerpt(article.contentHtml ?? ""),
        },
      text: `${existing?.text ?? ""} ${text}`,
    });
  }

  return [...entries.values()];
}

mkdirSync(dataDir, { recursive: true });

const articles = readGeneratedArray("src/lib/iaa-article-pages.generated.ts", "generatedArticleDetails").map((article) => ({
  ...article,
  author: {
    ...article.author,
    name: article.author.name === "Trần Dũng" ? "kaireview" : article.author.name,
    avatar: siteAuthorAvatar,
  },
}));
const archives = readGeneratedArray("src/lib/iaa-category-pages.generated.ts", "generatedCategoryArchives");
const searchEntries = createSearchEntries(articles, archives);
const defaultHomepageHrefs = new Set([
  "/ot-chia-voi-quang-tri-thu-gia-vi-lam-nao-long-nguoi-di-xa/",
  "/thu-mua-laptop-cu-gia-cao-tphcm/",
  "/shop-ban-macbook-cu-uy-tin-tphcm/",
  "/thu-mua-macbook-cu-gia-cao-tphcm/",
  "/loi-reset-counter-tren-iphone/",
  "/top-3-cua-hang-sua-iphone-uy-tin-tai-binh-tan/",
  "/top-10-cua-hang-sua-iphone-uy-tin-gia-re-tai-tp-hcm/",
  "/top-10-dia-chi-sua-ipad-uy-tin-gia-re-tai-tphcm/",
  "/kiem-tra-macbook-khi-mua-cu/",
  "/cach-kiem-tra-macbook-bypass/",
  "/danh-sach-cac-trung-tam-bao-hanh-apple-tai-tphcm/",
  "/iphone-bi-do-man-hinh-cam-ung-nguyen-nhan-va-cach-khac-phuc/",
  "/nguyen-nhan-va-cach-sua-iphone-bi-mat-tieng-loa-ngoai/",
  "/cach-xu-ly-iphone-bi-dinh-nuoc-vao-man-hinh/",
]);
const defaultContactIntroHtml = `<h2>Liên hệ kaireview</h2>
<ul>
  <li><strong>Website:</strong> kaireview</li>
  <li><strong>Nội dung:</strong> Review, tổng hợp và gợi ý sản phẩm, dịch vụ.</li>
  <li><strong>Email:</strong> hello@kaireview.vn</li>
</ul>
<p><strong>Liên hệ với chúng tôi:</strong> Bạn có thắc mắc hay cần hỗ trợ? Đừng ngần ngại, hãy gửi thông tin cho chúng tôi. Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn!</p>`;
const database = new DatabaseSync(databasePath);

database.exec(`
  PRAGMA journal_mode = DELETE;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS articles (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    href TEXT NOT NULL UNIQUE,
    category_label TEXT NOT NULL,
    category_href TEXT NOT NULL,
    home_featured INTEGER NOT NULL DEFAULT 0,
    published_label TEXT NOT NULL,
    published_datetime TEXT NOT NULL,
    updated_label TEXT NOT NULL,
    updated_datetime TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_href TEXT NOT NULL,
    author_avatar TEXT NOT NULL,
    tag_label TEXT,
    tag_href TEXT,
    previous_title TEXT,
    previous_href TEXT,
    figures_json TEXT,
    content_html TEXT,
    related_posts_json TEXT,
    raw_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS category_archives (
    slug TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    href TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    pagination_json TEXT NOT NULL,
    raw_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS category_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_slug TEXT NOT NULL,
    post_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    href TEXT NOT NULL,
    image TEXT NOT NULL,
    alt TEXT NOT NULL,
    excerpt TEXT,
    date_day TEXT,
    date_month TEXT,
    sort_order INTEGER NOT NULL,
    raw_json TEXT NOT NULL,
    FOREIGN KEY (category_slug) REFERENCES category_archives(slug) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS search_index (
    href TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    alt TEXT NOT NULL,
    excerpt TEXT,
    normalized_text TEXT NOT NULL,
    raw_post_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_category_posts_category_slug_sort_order
    ON category_posts(category_slug, sort_order);
  CREATE INDEX IF NOT EXISTS idx_category_posts_post_slug
    ON category_posts(post_slug);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_category_posts_unique
    ON category_posts(category_slug, post_slug);
  CREATE INDEX IF NOT EXISTS idx_search_index_normalized_text
    ON search_index(normalized_text);
`);

const articleColumns = new Set(
  database.prepare("PRAGMA table_info(articles)").all().map((row) => row.name),
);

if (!articleColumns.has("home_featured")) {
  database.exec("ALTER TABLE articles ADD COLUMN home_featured INTEGER NOT NULL DEFAULT 0");
}

database.exec(`
  CREATE INDEX IF NOT EXISTS idx_articles_home_featured_published
    ON articles(home_featured, published_datetime);
`);

const insertArticle = database.prepare(`
  INSERT OR IGNORE INTO articles (
    slug,
    title,
    description,
    href,
    category_label,
    category_href,
    home_featured,
    published_label,
    published_datetime,
    updated_label,
    updated_datetime,
    author_name,
    author_href,
    author_avatar,
    tag_label,
    tag_href,
    previous_title,
    previous_href,
    figures_json,
    content_html,
    related_posts_json,
    raw_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertArchive = database.prepare(`
  INSERT OR IGNORE INTO category_archives (
    slug,
    label,
    href,
    title,
    pagination_json,
    raw_json
  ) VALUES (?, ?, ?, ?, ?, ?)
`);

const insertPost = database.prepare(`
  INSERT OR IGNORE INTO category_posts (
    category_slug,
    post_slug,
    title,
    href,
    image,
    alt,
    excerpt,
    date_day,
    date_month,
    sort_order,
    raw_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertSearchEntry = database.prepare(`
  INSERT OR IGNORE INTO search_index (
    href,
    slug,
    title,
    image,
    alt,
    excerpt,
    normalized_text,
    raw_post_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertAdminSetting = database.prepare(`
  INSERT OR IGNORE INTO admin_settings (key, value, updated_at)
  VALUES (?, ?, ?)
`);

database.exec("BEGIN");

try {
  const now = new Date().toISOString();

  insertAdminSetting.run("site_name", "kaireview", now);
  insertAdminSetting.run("site_email", "hello@kaireview.vn", now);
  insertAdminSetting.run("contact_intro_html", defaultContactIntroHtml, now);

  for (const article of articles) {
    insertArticle.run(
      article.slug,
      article.title,
      article.description,
      article.href,
      article.category.label,
      article.category.href,
      defaultHomepageHrefs.has(article.href) ? 1 : 0,
      article.publishedLabel,
      article.publishedDateTime,
      article.updatedLabel,
      article.updatedDateTime,
      article.author.name,
      article.author.href,
      article.author.avatar,
      article.tag?.label ?? null,
      article.tag?.href ?? null,
      article.previousPost?.title ?? null,
      article.previousPost?.href ?? null,
      article.figures ? JSON.stringify(article.figures) : null,
      article.contentHtml ?? null,
      article.relatedPosts ? JSON.stringify(article.relatedPosts) : null,
      JSON.stringify(article),
    );
  }

  for (const archive of archives) {
    insertArchive.run(
      archive.slug,
      archive.label,
      archive.href,
      archive.title,
      JSON.stringify(archive.pagination),
      JSON.stringify(archive),
    );

    archive.posts.forEach((post, index) => {
      insertPost.run(
        archive.slug,
        slugFromHref(post.href),
        post.title,
        post.href,
        post.image,
        post.alt,
        post.excerpt ?? null,
        post.date?.day ?? null,
        post.date?.month ?? null,
        index,
        JSON.stringify(post),
      );
    });
  }

  for (const entry of searchEntries) {
    insertSearchEntry.run(
      entry.post.href,
      slugFromHref(entry.post.href),
      entry.post.title,
      entry.post.image,
      entry.post.alt,
      entry.post.excerpt ?? null,
      normalizeSearchText(entry.text),
      JSON.stringify(entry.post),
    );
  }

  database.exec("COMMIT");
} catch (error) {
  database.exec("ROLLBACK");
  throw error;
} finally {
  database.close();
}

writeFileSync(
  snapshotPath,
  `import type { IaaArticle, IaaCategoryArchiveData, IaaPost } from "@/types/iaa";

export const sqliteArticleDetails = ${JSON.stringify(articles, null, 2)} satisfies IaaArticle[];

export const sqliteCategoryArchives = ${JSON.stringify(archives, null, 2)} satisfies IaaCategoryArchiveData[];

export const sqliteSearchEntries = ${JSON.stringify(
    searchEntries.map((entry) => ({
      post: entry.post,
      normalizedText: normalizeSearchText(entry.text),
    })),
    null,
    2,
  )} satisfies { post: IaaPost; normalizedText: string }[];
`,
);

console.log(
  `Seeded ${articles.length} articles and ${archives.length} category archives into ${databasePath}`,
);
console.log(`Wrote SQLite snapshot for Next dev to ${snapshotPath}`);
