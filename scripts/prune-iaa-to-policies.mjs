import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const databasePath = path.join(rootDir, "data", "iaa.sqlite");

const keepSlugs = new Set([
  "dieu-khoan-dich-vu",
  "chinh-sach-bao-mat",
  "chinh-sach-cookies",
]);

const database = new DatabaseSync(databasePath);

const getCount = (table) => {
  const row = database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();

  return Number(row?.count ?? 0);
};

database.exec("BEGIN");

try {
  const keptArticles = database
    .prepare(
      `SELECT slug, href
       FROM articles
       WHERE slug IN (?, ?, ?)`,
    )
    .all(...keepSlugs);

  const keepHrefs = new Set(keptArticles.map((article) => article.href));

  database
    .prepare(
      `DELETE FROM search_index
       WHERE slug NOT IN (?, ?, ?)
         AND href NOT IN (?, ?, ?)`,
    )
    .run(...keepSlugs, ...keepHrefs);

  database
    .prepare(
      `DELETE FROM category_posts
       WHERE post_slug NOT IN (?, ?, ?)
         AND href NOT IN (?, ?, ?)`,
    )
    .run(...keepSlugs, ...keepHrefs);

  database.prepare("DELETE FROM category_archives").run();

  database
    .prepare(
      `DELETE FROM articles
       WHERE slug NOT IN (?, ?, ?)`,
    )
    .run(...keepSlugs);

  database.prepare("UPDATE articles SET home_featured = 0").run();

  database.exec("COMMIT");

  console.log(
    JSON.stringify(
      {
        keptSlugs: [...keepSlugs],
        counts: {
          articles: getCount("articles"),
          category_archives: getCount("category_archives"),
          category_posts: getCount("category_posts"),
          search_index: getCount("search_index"),
        },
      },
      null,
      2,
    ),
  );
} catch (error) {
  database.exec("ROLLBACK");
  throw error;
} finally {
  database.close();
}
