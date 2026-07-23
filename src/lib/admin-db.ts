import { mkdirSync } from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

import {
  ADMIN_DEFAULT_PASSWORD,
  ADMIN_DEFAULT_USERNAME,
  createPasswordHash,
  verifyPassword,
} from "@/lib/admin-auth";
import {
  heroLeadPost,
  heroMiniPosts,
  heroSidePost,
  navItems,
  reviewPosts,
  technologyPosts,
} from "@/lib/iaa-data";
import type {
  AdminCategoryGroup,
  AdminArticleSummary,
  AdminChartPoint,
  AdminCrudData,
  AdminCrudField,
  AdminDashboardData,
  AdminMessageSummary,
  AdminMetric,
  AdminSearchResult,
  AdminSectionData,
  AdminSectionItem,
  AdminSettings,
  AdminUserSummary,
} from "@/types/admin";

const databasePath = path.join(process.cwd(), "data", "iaa.sqlite");
const homepageFeaturedSeedSettingKey = "homepage_featured_seeded";
const siteAuthorAvatar = "/images/kai-favicon.svg";
const defaultHomepageHrefs = [
  ...new Set([
    heroLeadPost.href,
    ...heroMiniPosts.map((post) => post.href),
    heroSidePost.href,
    ...reviewPosts.slice(0, 3).map((post) => post.href),
    ...technologyPosts.map((post) => post.href),
  ]),
];

let sqliteModule: typeof import("node:sqlite") | undefined;

const defaultSettings: AdminSettings = {
  siteEmail: "hello@kaireview.vn",
  siteName: "kaireview",
};
const defaultContactIntroHtml = `<h2>Liên hệ kaireview</h2>
<ul>
  <li><strong>Website:</strong> kaireview</li>
  <li><strong>Nội dung:</strong> Review, tổng hợp và gợi ý sản phẩm, dịch vụ.</li>
  <li><strong>Email:</strong> hello@kaireview.vn</li>
</ul>
<p><strong>Liên hệ với chúng tôi:</strong> Bạn có thắc mắc hay cần hỗ trợ? Đừng ngần ngại, hãy gửi thông tin cho chúng tôi. Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn!</p>`;

type DashboardRequest = {
  month: number;
  query: string;
  status: string;
  year: number;
};

type ContactMessageInput = {
  email: string;
  message: string;
  name: string;
};

type SettingsInput = {
  siteEmail: string;
  siteName: string;
};

type VisitInput = {
  path: string;
  sessionId: string;
  userAgent: string;
};

type SectionRequest = {
  page: number;
  perPage: number;
};

type AdminCrudEntity =
  | "article"
  | "category"
  | "category_post"
  | "message"
  | "search_index"
  | "setting";

type SectionDefinition = {
  allowCreate?: boolean;
  allowDelete?: boolean;
  allowUpdate?: boolean;
  categorySlugs?: string[];
  description: string;
  emptyMessage: string;
  entity: AdminCrudEntity;
  entityLabel: string;
  imageOnly?: boolean;
  settingsKeys?: string[];
  title: string;
};

function getDatabaseSync() {
  sqliteModule ??= process.getBuiltinModule("node:sqlite");

  return sqliteModule.DatabaseSync;
}

type CrudMutationInput = {
  entity: string;
  id: string;
  intent: string;
  values: Record<string, string>;
};

export function getAdminDashboardData({
  month,
  query,
  status,
  year,
}: DashboardRequest): AdminDashboardData {
  const database = openAdminDatabase();

  try {
    const selectedMonth = clamp(month, 1, 12);
    const selectedYear = clamp(year, 2020, new Date().getFullYear() + 1);
    const settings = readSettings(database);
    const articleCount = count(database, "SELECT COUNT(*) AS value FROM articles");
    const categoryCount = count(database, "SELECT COUNT(*) AS value FROM category_archives");
    const indexedPostCount = count(database, "SELECT COUNT(*) AS value FROM search_index");
    const users = readUsers(database);
    const messages = readMessages(database);
    const unreadMessageCount = count(
      database,
      "SELECT COUNT(*) AS value FROM admin_messages WHERE read_at IS NULL",
    );
    const trafficStats = readTrafficStats(database);
    const chart = readDailyVisitChart(database, selectedMonth, selectedYear);
    const searchQuery = query.trim();

    return {
      articleCount,
      categoryCount,
      chart,
      contentStats: [
        { label: "Bài đã đăng", value: articleCount, tone: "red" },
        { label: "Chuyên mục tự tạo", value: categoryCount, tone: "teal" },
        { label: "Có trong tìm kiếm", value: indexedPostCount, tone: "pink" },
        { label: "Tin liên hệ", value: messages.length, tone: "green" },
      ],
      messages,
      monthOptions: Array.from({ length: 12 }, (_, index) => index + 1),
      searchQuery,
      searchResults: searchQuery ? searchAdminDatabase(database, searchQuery) : [],
      selectedMonth,
      selectedYear,
      recentArticles: readRecentArticlesFromDatabase(database),
      settings,
      shortcutCards: [
        {
          detail: `${articleCount} bài`,
          href: "/admin/bai-viet",
          id: "post",
          title: "Đăng Bài Viết",
          tone: "red",
        },
        {
          detail: `${users.length} tài khoản`,
          href: "#admin-users",
          id: "account",
          title: "Tài Khoản",
          tone: "pink",
        },
        {
          detail: "Bảo mật",
          href: "#change-password",
          id: "password",
          title: "Đổi Mật Khẩu",
          tone: "green",
        },
        {
          detail: `${unreadMessageCount} thư mới`,
          href: "#contact-messages",
          id: "contact",
          title: "Thư Liên Hệ",
          tone: "red",
        },
      ],
      statusMessage: statusMessage(status),
      trafficStats,
      unreadMessageCount,
      users,
      yearOptions: buildYearOptions(selectedYear),
    };
  } finally {
    database.close();
  }
}

export function getAdminSectionData(
  sectionSlug: string,
  { page, perPage }: SectionRequest,
): AdminSectionData {
  const database = openAdminDatabase();
  const slug = normalizeSectionSlug(sectionSlug);

  try {
    const definition = sectionDefinition(slug);
    const requestedPageSize = clamp(Math.trunc(perPage), 5, 50);
    const totalItems = countSectionRows(database, definition);
    const totalPages = Math.max(1, Math.ceil(totalItems / requestedPageSize));
    const currentPage = clamp(Math.trunc(page), 1, totalPages);
    const offset = (currentPage - 1) * requestedPageSize;
    const rows = readCrudRows(database, definition, requestedPageSize, offset);
    const crud: AdminCrudData = {
      allowCreate: definition.allowCreate ?? true,
      allowDelete: definition.allowDelete ?? true,
      allowUpdate: definition.allowUpdate ?? true,
      createFields: createFieldsForEntity(database, definition.entity),
      entity: definition.entity,
      entityLabel: definition.entityLabel,
      pagination: {
        currentPage,
        endItem: totalItems ? offset + rows.length : 0,
        perPage: requestedPageSize,
        startItem: totalItems ? offset + 1 : 0,
        totalItems,
        totalPages,
      },
      rows,
    };

    return {
      crud,
      description: definition.description,
      emptyMessage: definition.emptyMessage,
      items: rows,
      metrics: readSectionMetrics(database, totalItems),
      slug,
      title: definition.title,
    };
  } finally {
    database.close();
  }
}

export function mutateAdminRecord(input: CrudMutationInput) {
  const database = openAdminDatabase();
  const entity = adminCrudEntity(input.entity);
  const intent = input.intent.trim();

  try {
    if (intent === "create") {
      createAdminRecord(database, entity, input.values);

      return entity === "article" ? "article-created" : "crud-created";
    }

    if (intent === "update") {
      updateAdminRecord(database, entity, input.id, input.values);

      return entity === "article" ? "article-updated" : "crud-updated";
    }

    if (intent === "delete") {
      deleteAdminRecord(database, entity, input.id);

      return entity === "article" ? "article-deleted" : "crud-deleted";
    }

    return "crud-error";
  } finally {
    database.close();
  }
}

export function verifyAdminCredentials(username: string, password: string) {
  const database = openAdminDatabase();

  try {
    const row = database
      .prepare("SELECT password_hash FROM admin_users WHERE username = ?")
      .get(username);
    const passwordHash = typeof row?.password_hash === "string" ? row.password_hash : "";

    return Boolean(passwordHash) && verifyPassword(password, passwordHash);
  } finally {
    database.close();
  }
}

export function touchAdminLogin(username: string) {
  const database = openAdminDatabase();

  try {
    database
      .prepare("UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE username = ?")
      .run(new Date().toISOString(), new Date().toISOString(), username);
  } finally {
    database.close();
  }
}

export function saveAdminSettings(input: SettingsInput) {
  const database = openAdminDatabase();

  try {
    const updatedAt = new Date().toISOString();
    const upsert = database.prepare(`
      INSERT INTO admin_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);

    upsert.run("site_name", input.siteName, updatedAt);
    upsert.run("site_email", input.siteEmail, updatedAt);
  } finally {
    database.close();
  }
}

export function changeAdminPassword(username: string, currentPassword: string, nextPassword: string) {
  const database = openAdminDatabase();

  try {
    const row = database
      .prepare("SELECT password_hash FROM admin_users WHERE username = ?")
      .get(username);
    const currentHash = typeof row?.password_hash === "string" ? row.password_hash : "";

    if (!currentHash || !verifyPassword(currentPassword, currentHash)) {
      return false;
    }

    const now = new Date().toISOString();
    database
      .prepare("UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE username = ?")
      .run(createPasswordHash(nextPassword), now, username);

    return true;
  } finally {
    database.close();
  }
}

export function createContactMessage(input: ContactMessageInput) {
  const database = openAdminDatabase();

  try {
    database
      .prepare(
        "INSERT INTO admin_messages (name, email, message, created_at) VALUES (?, ?, ?, ?)",
      )
      .run(input.name, input.email, input.message, new Date().toISOString());
  } finally {
    database.close();
  }
}

export function recordVisit(input: VisitInput) {
  if (
    input.path.startsWith("/admin") ||
    input.path.startsWith("/api") ||
    input.path.startsWith("/_next")
  ) {
    return;
  }

  const database = openAdminDatabase();

  try {
    database
      .prepare(
        "INSERT INTO admin_visit_events (path, session_id, user_agent, created_at) VALUES (?, ?, ?, ?)",
      )
      .run(input.path, input.sessionId, input.userAgent, new Date().toISOString());
  } finally {
    database.close();
  }
}

function openAdminDatabase() {
  mkdirSync(path.dirname(databasePath), { recursive: true });

  const DatabaseSync = getDatabaseSync();
  const database = new DatabaseSync(databasePath, { timeout: 5000 });

  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read_at TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_visit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      session_id TEXT NOT NULL,
      user_agent TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admin_visit_events_created_at
      ON admin_visit_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_admin_visit_events_path_created_at
      ON admin_visit_events(path, created_at);
  `);

  ensureArticleHomeSchema(database);
  seedAdminRows(database);

  return database;
}

function ensureArticleHomeSchema(database: DatabaseSync) {
  const table = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'articles'")
    .get();

  if (!table) {
    return;
  }

  const columns = new Set(
    database
      .prepare("PRAGMA table_info(articles)")
      .all()
      .map((row) => stringValue(row.name)),
  );

  if (!columns.has("home_featured")) {
    database.exec("ALTER TABLE articles ADD COLUMN home_featured INTEGER NOT NULL DEFAULT 0");
  }

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_home_featured_published
      ON articles(home_featured, published_datetime);
  `);

  seedDefaultHomepageFeatured(database);
}

function seedDefaultHomepageFeatured(database: DatabaseSync) {
  const existingSeed = database
    .prepare("SELECT value FROM admin_settings WHERE key = ?")
    .get(homepageFeaturedSeedSettingKey);

  if (existingSeed) {
    return;
  }

  if (!count(database, "SELECT COUNT(*) AS value FROM articles WHERE home_featured = 1")) {
    const markFeatured = database.prepare("UPDATE articles SET home_featured = 1 WHERE href = ?");

    for (const href of defaultHomepageHrefs) {
      markFeatured.run(href);
    }
  }

  database
    .prepare(
      `INSERT INTO admin_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(homepageFeaturedSeedSettingKey, "1", new Date().toISOString());
}

function seedAdminRows(database: DatabaseSync) {
  const now = new Date().toISOString();

  if (!count(database, "SELECT COUNT(*) AS value FROM admin_users")) {
    if (!ADMIN_DEFAULT_PASSWORD) {
      throw new Error("KAI_ADMIN_PASSWORD is required when creating the first admin account.");
    }

    database
      .prepare(
        `INSERT INTO admin_users (username, password_hash, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        ADMIN_DEFAULT_USERNAME,
        createPasswordHash(ADMIN_DEFAULT_PASSWORD),
        "Administrator",
        now,
        now,
      );
  }

  const insertSetting = database.prepare(`
    INSERT OR IGNORE INTO admin_settings (key, value, updated_at)
    VALUES (?, ?, ?)
  `);

  insertSetting.run("site_name", defaultSettings.siteName, now);
  insertSetting.run("site_email", defaultSettings.siteEmail, now);
  insertSetting.run("contact_intro_html", defaultContactIntroHtml, now);
}

function readSettings(database: DatabaseSync): AdminSettings {
  const rows = database.prepare("SELECT key, value FROM admin_settings").all();
  const values = new Map<string, string>();

  for (const row of rows) {
    if (typeof row.key === "string" && typeof row.value === "string") {
      values.set(row.key, row.value);
    }
  }

  return {
    siteEmail: values.get("site_email") ?? defaultSettings.siteEmail,
    siteName: values.get("site_name") ?? defaultSettings.siteName,
  };
}

function readUsers(database: DatabaseSync): AdminUserSummary[] {
  return database
    .prepare(
      "SELECT username, role, last_login_at FROM admin_users ORDER BY username COLLATE NOCASE",
    )
    .all()
    .map((row) => ({
      lastLoginAt: typeof row.last_login_at === "string" ? row.last_login_at : null,
      role: typeof row.role === "string" ? row.role : "Administrator",
      username: typeof row.username === "string" ? row.username : "",
    }))
    .filter((user) => user.username);
}

function readMessages(database: DatabaseSync): AdminMessageSummary[] {
  return database
    .prepare(
      `SELECT id, name, email, message, created_at, read_at
       FROM admin_messages
       ORDER BY created_at DESC
       LIMIT 8`,
    )
    .all()
    .map((row) => ({
      createdAt: stringValue(row.created_at),
      email: stringValue(row.email),
      id: numberValue(row.id),
      message: stringValue(row.message),
      name: stringValue(row.name),
      readAt: typeof row.read_at === "string" ? row.read_at : null,
    }));
}

function readTrafficStats(database: DatabaseSync): AdminMetric[] {
  const now = new Date();
  const onlineSince = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  const todayStart = startOfDay(now).toISOString();
  const weekStart = startOfWeek(now).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  return [
    {
      label: "Đang online",
      tone: "red",
      value: count(
        database,
        "SELECT COUNT(DISTINCT session_id) AS value FROM admin_visit_events WHERE created_at >= ?",
        [onlineSince],
      ),
    },
    {
      label: "Trong ngày",
      tone: "teal",
      value: count(
        database,
        "SELECT COUNT(*) AS value FROM admin_visit_events WHERE created_at >= ?",
        [todayStart],
      ),
    },
    {
      label: "Trong tuần",
      tone: "pink",
      value: count(
        database,
        "SELECT COUNT(*) AS value FROM admin_visit_events WHERE created_at >= ?",
        [weekStart],
      ),
    },
    {
      label: "Trong tháng",
      tone: "green",
      value: count(
        database,
        "SELECT COUNT(*) AS value FROM admin_visit_events WHERE created_at >= ?",
        [monthStart],
      ),
    },
  ];
}

function readDailyVisitChart(
  database: DatabaseSync,
  selectedMonth: number,
  selectedYear: number,
): AdminChartPoint[] {
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const start = new Date(selectedYear, selectedMonth - 1, day);
    const end = new Date(selectedYear, selectedMonth - 1, day + 1);

    return {
      label: String(day),
      value: count(
        database,
        "SELECT COUNT(*) AS value FROM admin_visit_events WHERE created_at >= ? AND created_at < ?",
        [start.toISOString(), end.toISOString()],
      ),
    };
  });
}

function searchAdminDatabase(database: DatabaseSync, rawQuery: string): AdminSearchResult[] {
  const query = normalizeSearchText(rawQuery);

  if (!query) {
    return [];
  }

  const articleResults = database
    .prepare(
      `SELECT title, href, excerpt
       FROM search_index
       WHERE normalized_text LIKE ?
       ORDER BY title COLLATE NOCASE
       LIMIT 6`,
    )
    .all(`%${query}%`)
    .map((row) => ({
      excerpt: stringValue(row.excerpt),
      href: stringValue(row.href),
      kind: "Bài viết" as const,
      title: stringValue(row.title),
    }));

  const settingsResults = database
    .prepare(
      `SELECT key, value
       FROM admin_settings
       WHERE key LIKE ? OR value LIKE ?
       ORDER BY key
       LIMIT 4`,
    )
    .all(`%${rawQuery}%`, `%${rawQuery}%`)
    .map((row) => ({
      excerpt: stringValue(row.value),
      href: settingHref(stringValue(row.key)),
      kind: "Cấu hình" as const,
      title: settingLabel(stringValue(row.key)),
    }));

  const messageResults = database
    .prepare(
      `SELECT id, name, email, message
       FROM admin_messages
       WHERE name LIKE ? OR email LIKE ? OR message LIKE ?
       ORDER BY created_at DESC
       LIMIT 4`,
    )
    .all(`%${rawQuery}%`, `%${rawQuery}%`, `%${rawQuery}%`)
    .map((row) => ({
      excerpt: stringValue(row.message),
      href: "#contact-messages",
      kind: "Tin nhắn" as const,
      title: `${stringValue(row.name)} - ${stringValue(row.email)}`,
    }));

  return [...articleResults, ...settingsResults, ...messageResults].slice(0, 10);
}

function readRecentArticlesFromDatabase(database: DatabaseSync): AdminArticleSummary[] {
  return database
    .prepare(
      `SELECT title, href, category_label, published_datetime
       FROM articles
       ORDER BY published_datetime DESC
       LIMIT 6`,
    )
    .all()
    .map((row) => ({
      category: stringValue(row.category_label),
      href: stringValue(row.href),
      publishedAt: stringValue(row.published_datetime),
      title: stringValue(row.title),
    }));
}

function readSectionMetrics(database: DatabaseSync, visibleItemCount: number): AdminMetric[] {
  return [
    { label: "Dữ liệu hiển thị", tone: "red", value: visibleItemCount },
    {
      label: "Bài viết",
      tone: "teal",
      value: count(database, "SELECT COUNT(*) AS value FROM articles"),
    },
    {
      label: "Chuyên mục",
      tone: "pink",
      value: count(database, "SELECT COUNT(*) AS value FROM category_archives"),
    },
    {
      label: "Tin liên hệ",
      tone: "green",
      value: count(database, "SELECT COUNT(*) AS value FROM admin_messages"),
    },
  ];
}

function sectionDefinition(slug: string): SectionDefinition {
  const copy = sectionCopy(slug);
  const base = {
    description: copy.description,
    emptyMessage: copy.emptyMessage,
    title: copy.title,
  };

  switch (slug) {
    case "chuyen-muc":
      return { ...base, entity: "category", entityLabel: "danh mục" };
    case "bai-theo-chuyen-muc":
      return { ...base, entity: "category_post", entityLabel: "bài trong chuyên mục" };
    case "lien-he":
      return { ...base, entity: "message", entityLabel: "tin liên hệ" };
    case "hinh-anh/anh-chia-se":
      return { ...base, entity: "search_index", entityLabel: "ảnh nội dung", imageOnly: true };
    case "seo/chi-muc":
    case "seo/dieu-huong-link":
      return { ...base, entity: "search_index", entityLabel: "link nội dung" };
    case "hinh-anh/logo":
    case "hinh-anh/favicon":
      return {
        ...base,
        allowCreate: false,
        allowDelete: false,
        entity: "setting",
        entityLabel: "cấu hình",
        settingsKeys: ["site_name"],
      };
    case "cau-hinh/thong-tin":
      return {
        ...base,
        allowCreate: false,
        allowDelete: false,
        entity: "setting",
        entityLabel: "cấu hình",
        settingsKeys: ["site_name", "site_email"],
      };
    case "trang/gioi-thieu":
      return {
        ...base,
        allowCreate: false,
        allowDelete: false,
        entity: "setting",
        entityLabel: "nội dung giới thiệu",
        settingsKeys: ["contact_intro_html"],
      };
    default:
      return { ...base, entity: "article", entityLabel: "bài viết" };
  }
}

function countSectionRows(database: DatabaseSync, definition: SectionDefinition) {
  const { params, where } = sectionWhere(definition);

  switch (definition.entity) {
    case "article":
      return count(database, `SELECT COUNT(*) AS value FROM articles ${where}`, params);
    case "category":
      return count(database, "SELECT COUNT(*) AS value FROM category_archives");
    case "category_post":
      return count(database, `SELECT COUNT(*) AS value FROM category_posts p ${where}`, params);
    case "message":
      return count(database, "SELECT COUNT(*) AS value FROM admin_messages");
    case "search_index":
      return count(database, `SELECT COUNT(*) AS value FROM search_index ${where}`, params);
    case "setting":
      return count(database, `SELECT COUNT(*) AS value FROM admin_settings ${where}`, params);
  }
}

function readCrudRows(
  database: DatabaseSync,
  definition: SectionDefinition,
  limit: number,
  offset: number,
): (AdminSectionItem & { fields: AdminCrudField[] })[] {
  switch (definition.entity) {
    case "article":
      return readArticleCrudRows(database, definition, limit, offset);
    case "category":
      return readCategoryCrudRows(database, limit, offset);
    case "category_post":
      return readCategoryPostCrudRows(database, definition, limit, offset);
    case "message":
      return readMessageCrudRows(database, limit, offset);
    case "search_index":
      return readSearchIndexCrudRows(database, definition, limit, offset);
    case "setting":
      return readSettingCrudRows(database, definition, limit, offset);
  }
}

function readArticleCrudRows(
  database: DatabaseSync,
  definition: SectionDefinition,
  limit: number,
  offset: number,
) {
  const { params, where } = sectionWhere(definition);
  const categorySuggestions = readCategoryLabelSuggestions(database);
  const categoryGroups = readCategoryGroups(database);

  return database
    .prepare(
      `SELECT slug, title, href, description, category_label, published_label, content_html, home_featured
       FROM articles
       ${where}
       ORDER BY published_datetime DESC, title COLLATE NOCASE
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset)
    .map((row) => ({
      description: stringValue(row.description) || "Bài viết đã được lưu trong SQLite.",
      fields: [
        crudField("title", "Tiêu đề", stringValue(row.title), "text", true),
        crudField("href", "Đường dẫn", stringValue(row.href), "text", true),
        crudField(
          "categoryLabel",
          "Chuyên mục",
          stringValue(row.category_label),
          "select",
          true,
          categorySuggestions,
          true,
          categoryGroups,
        ),
        crudField(
          "homeFeatured",
          "Hiện ở trang chủ",
          numberValue(row.home_featured) > 0 ? "1" : "",
          "checkbox",
        ),
        crudField("description", "Mô tả", stringValue(row.description), "textarea", true),
        crudField("contentHtml", "Nội dung bài viết", stringValue(row.content_html), "textarea"),
      ],
      href: stringValue(row.href),
      id: stringValue(row.slug),
      meta: [
        stringValue(row.category_label),
        numberValue(row.home_featured) > 0 ? "Trang chủ" : "",
        stringValue(row.published_label),
      ]
        .filter(Boolean)
        .join(" - "),
      title: stringValue(row.title),
    }));
}

function readCategoryCrudRows(database: DatabaseSync, limit: number, offset: number) {
  return database
    .prepare(
      `SELECT a.slug, a.label, a.href, a.title, COUNT(p.id) AS post_count
       FROM category_archives a
       LEFT JOIN category_posts p ON p.category_slug = a.slug
       GROUP BY a.slug
       ORDER BY a.label COLLATE NOCASE
       LIMIT ? OFFSET ?`,
    )
    .all(limit, offset)
    .map((row) => ({
      description: `${numberValue(row.post_count)} bài đang được gắn vào chuyên mục này.`,
      fields: [
        crudField("slug", "Slug", stringValue(row.slug), "text", true),
        crudField("label", "Tên danh mục", stringValue(row.label), "text", true),
        crudField("href", "Đường dẫn", stringValue(row.href), "text", true),
        crudField("title", "Tiêu đề SEO", stringValue(row.title), "text", true),
      ],
      href: stringValue(row.href),
      id: stringValue(row.slug),
      meta: stringValue(row.slug),
      title: stringValue(row.label),
    }));
}

function readCategoryPostCrudRows(
  database: DatabaseSync,
  definition: SectionDefinition,
  limit: number,
  offset: number,
) {
  const { params, where } = sectionWhere(definition);

  return database
    .prepare(
      `SELECT p.id, p.category_slug, p.title, p.href, p.image, p.alt, p.excerpt,
              p.date_day, p.date_month, p.sort_order, a.label AS category_label
       FROM category_posts p
       LEFT JOIN category_archives a ON a.slug = p.category_slug
       ${where}
       ORDER BY p.sort_order, p.title COLLATE NOCASE
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset)
    .map((row) => ({
      description: stringValue(row.excerpt) || "Bài trong archive chuyên mục.",
      fields: [
        crudField("categorySlug", "Slug danh mục", stringValue(row.category_slug), "text", true),
        crudField("title", "Tiêu đề", stringValue(row.title), "text", true),
        crudField("href", "Đường dẫn", stringValue(row.href), "text", true),
        crudField("image", "Ảnh", stringValue(row.image), "text"),
        crudField("alt", "Alt ảnh", stringValue(row.alt), "text"),
        crudField("excerpt", "Mô tả", stringValue(row.excerpt), "textarea"),
        crudField("dateDay", "Ngày", stringValue(row.date_day), "text"),
        crudField("dateMonth", "Tháng", stringValue(row.date_month), "text"),
        crudField("sortOrder", "Thứ tự", String(numberValue(row.sort_order)), "number"),
      ],
      href: stringValue(row.href),
      id: String(numberValue(row.id)),
      meta: [stringValue(row.category_label), stringValue(row.category_slug)]
        .filter(Boolean)
        .join(" - "),
      title: stringValue(row.title),
    }));
}

function readMessageCrudRows(database: DatabaseSync, limit: number, offset: number) {
  return database
    .prepare(
      `SELECT id, name, email, message, created_at, read_at
       FROM admin_messages
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(limit, offset)
    .map((row) => ({
      description: stringValue(row.message) || "Tin nhắn không có nội dung.",
      fields: [
        crudField("name", "Tên", stringValue(row.name), "text", true),
        crudField("email", "Email", stringValue(row.email), "email", true),
        crudField("message", "Nội dung", stringValue(row.message), "textarea", true),
        crudField("readAt", "Đã đọc lúc", stringValue(row.read_at), "text"),
      ],
      href: `/admin/lien-he#message-${numberValue(row.id)}`,
      id: String(numberValue(row.id)),
      meta: [stringValue(row.email), formatSQLiteDateTime(stringValue(row.created_at))]
        .filter(Boolean)
        .join(" - "),
      title: stringValue(row.name) || "Khách liên hệ",
    }));
}

function readSearchIndexCrudRows(
  database: DatabaseSync,
  definition: SectionDefinition,
  limit: number,
  offset: number,
) {
  const { params, where } = sectionWhere(definition);

  return database
    .prepare(
      `SELECT slug, title, href, image, alt, excerpt
       FROM search_index
       ${where}
       ORDER BY title COLLATE NOCASE
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset)
    .map((row) => ({
      description: stringValue(row.excerpt) || stringValue(row.alt) || "Nội dung trong search index.",
      fields: [
        crudField("slug", "Slug", stringValue(row.slug), "text", true),
        crudField("title", "Tiêu đề", stringValue(row.title), "text", true),
        crudField("href", "Đường dẫn", stringValue(row.href), "text", true),
        crudField("image", "Ảnh", stringValue(row.image), "text"),
        crudField("alt", "Alt ảnh", stringValue(row.alt), "text"),
        crudField("excerpt", "Mô tả", stringValue(row.excerpt), "textarea"),
      ],
      href: stringValue(row.href),
      id: stringValue(row.href),
      meta: stringValue(row.slug),
      title: stringValue(row.title),
    }));
}

function readSettingCrudRows(
  database: DatabaseSync,
  definition: SectionDefinition,
  limit: number,
  offset: number,
) {
  const { params, where } = sectionWhere(definition);

  return database
    .prepare(
      `SELECT key, value, updated_at
       FROM admin_settings
       ${where}
       ORDER BY key
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset)
    .map((row) => ({
      description: stringValue(row.value) || "Chưa có giá trị cấu hình.",
      fields: [
        crudField(
          "value",
          settingValueFieldLabel(stringValue(row.key)),
          stringValue(row.value),
          stringValue(row.key) === "contact_intro_html" ? "richtext" : "textarea",
        ),
      ],
      href: settingHref(stringValue(row.key)),
      id: stringValue(row.key),
      meta: formatSQLiteDateTime(stringValue(row.updated_at)),
      title: settingLabel(stringValue(row.key)),
    }));
}

function sectionWhere(definition: SectionDefinition) {
  if (definition.entity === "category_post" && definition.categorySlugs?.length) {
    return {
      params: definition.categorySlugs,
      where: `WHERE p.category_slug IN (${definition.categorySlugs.map(() => "?").join(", ")})`,
    };
  }

  if (definition.entity === "search_index" && definition.imageOnly) {
    return { params: [], where: "WHERE image <> ''" };
  }

  if (definition.entity === "setting" && definition.settingsKeys?.length) {
    return {
      params: definition.settingsKeys,
      where: `WHERE key IN (${definition.settingsKeys.map(() => "?").join(", ")})`,
    };
  }

  return { params: [] as string[], where: "" };
}

function readCategoryLabelSuggestions(database: DatabaseSync) {
  return database
    .prepare("SELECT label FROM category_archives ORDER BY label COLLATE NOCASE")
    .all()
    .map((row) => stringValue(row.label))
    .filter(Boolean);
}

function readCategoryGroups(database: DatabaseSync): AdminCategoryGroup[] {
  const existingLabels = readCategoryLabelSuggestions(database);
  const seenLabels = new Set<string>();
  const groups = navItems
    .filter((item) => isCategoryHref(item.href))
    .map((item) => {
      const children = [
        { label: `${item.label} (chuyên mục lớn)`, value: item.label },
        ...(item.children ?? [])
          .filter((child) => isCategoryHref(child.href))
          .map((child) => ({ label: child.label, value: child.label })),
      ];

      for (const child of children) {
        seenLabels.add(normalizeSearchText(child.value));
      }

      return {
        children,
        label: item.label,
        value: item.label,
      };
    })
    .filter((group) => group.children.length);
  const otherChildren = existingLabels
    .filter((label) => !seenLabels.has(normalizeSearchText(label)))
    .map((label) => ({ label, value: label }));

  return otherChildren.length
    ? [...groups, { children: otherChildren, label: "Khác", value: "Khác" }]
    : groups;
}

function isCategoryHref(href: string) {
  return href.startsWith("/chuyen-muc/");
}

function createFieldsForEntity(database: DatabaseSync, entity: AdminCrudEntity): AdminCrudField[] {
  switch (entity) {
    case "article":
      return [
        crudField("title", "Tiêu đề", "", "text", true),
        crudField("href", "Đường dẫn", "", "text"),
        crudField(
          "categoryLabel",
          "Chuyên mục",
          "Công Nghệ",
          "select",
          true,
          readCategoryLabelSuggestions(database),
          true,
          readCategoryGroups(database),
        ),
        crudField("homeFeatured", "Hiện ở trang chủ", "", "checkbox"),
        crudField("description", "Mô tả", "", "textarea", true),
        crudField("contentHtml", "Nội dung bài viết", "", "textarea"),
      ];
    case "category":
      return [
        crudField("slug", "Slug", "", "text"),
        crudField("label", "Tên danh mục", "", "text", true),
        crudField("href", "Đường dẫn", "", "text"),
        crudField("title", "Tiêu đề SEO", "", "text"),
      ];
    case "category_post":
      return [
        crudField("categorySlug", "Slug danh mục", "", "text", true),
        crudField("title", "Tiêu đề", "", "text", true),
        crudField("href", "Đường dẫn", "", "text"),
        crudField("image", "Ảnh", "", "text"),
        crudField("alt", "Alt ảnh", "", "text"),
        crudField("excerpt", "Mô tả", "", "textarea"),
        crudField("dateDay", "Ngày", "", "text"),
        crudField("dateMonth", "Tháng", "", "text"),
        crudField("sortOrder", "Thứ tự", "0", "number"),
      ];
    case "message":
      return [
        crudField("name", "Tên", "", "text", true),
        crudField("email", "Email", "", "email", true),
        crudField("message", "Nội dung", "", "textarea", true),
      ];
    case "search_index":
      return [
        crudField("slug", "Slug", "", "text"),
        crudField("title", "Tiêu đề", "", "text", true),
        crudField("href", "Đường dẫn", "", "text"),
        crudField("image", "Ảnh", "", "text"),
        crudField("alt", "Alt ảnh", "", "text"),
        crudField("excerpt", "Mô tả", "", "textarea"),
      ];
    case "setting":
      return [
        crudField("key", "Khoá", "", "text", true),
        crudField("value", "Giá trị", "", "textarea"),
      ];
  }
}

function crudField(
  name: string,
  label: string,
  value: string,
  type: AdminCrudField["type"],
  required = false,
  suggestions?: string[],
  allowCustom = false,
  categoryGroups?: AdminCategoryGroup[],
): AdminCrudField {
  return { allowCustom, categoryGroups, label, name, required, suggestions, type, value };
}

function createAdminRecord(
  database: DatabaseSync,
  entity: AdminCrudEntity,
  values: Record<string, string>,
) {
  switch (entity) {
    case "article":
      createArticleRecord(database, values);
      return;
    case "category":
      createCategoryRecord(database, values);
      return;
    case "category_post":
      createCategoryPostRecord(database, values);
      return;
    case "message":
      createMessageRecord(database, values);
      return;
    case "search_index":
      createSearchIndexRecord(database, values);
      return;
    case "setting":
      createSettingRecord(database, values);
      return;
  }
}

function updateAdminRecord(
  database: DatabaseSync,
  entity: AdminCrudEntity,
  id: string,
  values: Record<string, string>,
) {
  switch (entity) {
    case "article":
      updateArticleRecord(database, id, values);
      return;
    case "category":
      updateCategoryRecord(database, id, values);
      return;
    case "category_post":
      updateCategoryPostRecord(database, id, values);
      return;
    case "message":
      updateMessageRecord(database, id, values);
      return;
    case "search_index":
      updateSearchIndexRecord(database, id, values);
      return;
    case "setting":
      updateSettingRecord(database, id, values);
      return;
  }
}

function deleteAdminRecord(database: DatabaseSync, entity: AdminCrudEntity, id: string) {
  switch (entity) {
    case "article":
      deleteArticleRecord(database, id);
      return;
    case "category":
      database.prepare("DELETE FROM category_archives WHERE slug = ?").run(id);
      return;
    case "category_post":
      database.prepare("DELETE FROM category_posts WHERE id = ?").run(Number(id));
      return;
    case "message":
      database.prepare("DELETE FROM admin_messages WHERE id = ?").run(Number(id));
      return;
    case "search_index":
      database.prepare("DELETE FROM search_index WHERE href = ?").run(id);
      return;
    case "setting":
      database.prepare("DELETE FROM admin_settings WHERE key = ?").run(id);
      return;
  }
}

function createArticleRecord(database: DatabaseSync, values: Record<string, string>) {
  const now = new Date().toISOString();
  const title = requiredValue(values, "title", "Bài viết mới");
  const description = requiredValue(values, "description", "");
  const href = uniqueHref(database, normalizeHref(valueFor(values, "href") || `/${slugify(title)}/`));
  const slug = uniqueSlug(database, slugFromHref(href), "articles");
  const category = resolveCategory(database, requiredValue(values, "categoryLabel", "Công Nghệ"));
  const homeFeatured = checkboxValue(values, "homeFeatured");
  const contentHtml = valueFor(values, "contentHtml") || `<p>${escapeHtml(description)}</p>`;
  const image = firstImageFromHtml(contentHtml) || "/images/iaa/iaa-logo-1-1-968x800.png";
  const rawJson = JSON.stringify({
    description,
    homeFeatured,
    href,
    slug,
    title,
    updatedBy: "admin",
  });

  database
    .prepare(
      `INSERT INTO articles (
        slug, title, description, href, category_label, category_href,
        home_featured, published_label, published_datetime, updated_label, updated_datetime,
        author_name, author_href, author_avatar, tag_label, tag_href,
        previous_title, previous_href, figures_json, content_html, related_posts_json, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      slug,
      title,
      description,
      href,
      category.label,
      category.href,
      homeFeatured ? 1 : 0,
      formatVietnameseDateLabel(now),
      now,
      formatVietnameseDateLabel(now),
      now,
      "kaireview",
      "/",
      siteAuthorAvatar,
      null,
      null,
      null,
      null,
      null,
      contentHtml,
      null,
      rawJson,
    );
  ensureCategoryArchive(database, category.slug, category.label, category.href);
  upsertSearchIndex(database, {
    alt: title,
    excerpt: description,
    href,
    image,
    slug,
    title,
  });
  upsertCategoryPostForArticle(database, {
    categorySlug: category.slug,
    contentHtml,
    excerpt: description,
    href,
    publishedAt: now,
    slug,
    title,
  });
}

function updateArticleRecord(database: DatabaseSync, id: string, values: Record<string, string>) {
  const current = database.prepare("SELECT href FROM articles WHERE slug = ?").get(id);
  const currentHref = stringValue(current?.href);
  const now = new Date().toISOString();
  const title = requiredValue(values, "title", "Bài viết");
  const description = requiredValue(values, "description", "");
  const href = normalizeHref(valueFor(values, "href") || currentHref || `/${id}/`);
  const category = resolveCategory(database, requiredValue(values, "categoryLabel", "Công Nghệ"));
  const homeFeatured = checkboxValue(values, "homeFeatured");
  const contentHtml = valueFor(values, "contentHtml") || `<p>${escapeHtml(description)}</p>`;
  const image = firstImageFromHtml(contentHtml) || "/images/iaa/iaa-logo-1-1-968x800.png";
  const rawJson = JSON.stringify({
    description,
    homeFeatured,
    href,
    slug: id,
    title,
    updatedBy: "admin",
  });

  database
    .prepare(
      `UPDATE articles
       SET title = ?, description = ?, href = ?, category_label = ?, category_href = ?,
           home_featured = ?, updated_label = ?, updated_datetime = ?, content_html = ?, raw_json = ?
       WHERE slug = ?`,
    )
    .run(
      title,
      description,
      href,
      category.label,
      category.href,
      homeFeatured ? 1 : 0,
      formatVietnameseDateLabel(now),
      now,
      contentHtml,
      rawJson,
      id,
    );

  if (currentHref && currentHref !== href) {
    database.prepare("DELETE FROM search_index WHERE href = ?").run(currentHref);
  }

  ensureCategoryArchive(database, category.slug, category.label, category.href);
  upsertSearchIndex(database, {
    alt: title,
    excerpt: description,
    href,
    image,
    slug: id,
    title,
  });
  database.prepare("DELETE FROM category_posts WHERE post_slug = ? OR href = ?").run(id, currentHref || href);
  upsertCategoryPostForArticle(database, {
    categorySlug: category.slug,
    contentHtml,
    excerpt: description,
    href,
    publishedAt: now,
    slug: id,
    title,
  });
}

function deleteArticleRecord(database: DatabaseSync, id: string) {
  const row = database.prepare("SELECT href FROM articles WHERE slug = ?").get(id);
  const href = stringValue(row?.href);

  database.prepare("DELETE FROM articles WHERE slug = ?").run(id);
  database.prepare("DELETE FROM search_index WHERE slug = ? OR href = ?").run(id, href);
  database.prepare("DELETE FROM category_posts WHERE post_slug = ? OR href = ?").run(id, href);
}

function createCategoryRecord(database: DatabaseSync, values: Record<string, string>) {
  const label = requiredValue(values, "label", "Danh mục mới");
  const slug = uniqueSlug(database, valueFor(values, "slug") || slugify(label), "category_archives");
  const href = normalizeHref(valueFor(values, "href") || `/chuyen-muc/${slug}/`);
  const title = valueFor(values, "title") || `Category Archives: ${label}`;

  database
    .prepare(
      `INSERT INTO category_archives (slug, label, href, title, pagination_json, raw_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(slug, label, href, title, "[]", JSON.stringify({ href, label, slug, title }));
}

function updateCategoryRecord(database: DatabaseSync, id: string, values: Record<string, string>) {
  const label = requiredValue(values, "label", "Danh mục");
  const slug = valueFor(values, "slug") || id;
  const href = normalizeHref(valueFor(values, "href") || `/chuyen-muc/${slug}/`);
  const title = valueFor(values, "title") || `Category Archives: ${label}`;

  database
    .prepare(
      `UPDATE category_archives
       SET slug = ?, label = ?, href = ?, title = ?, raw_json = ?
       WHERE slug = ?`,
    )
    .run(slug, label, href, title, JSON.stringify({ href, label, slug, title }), id);

  if (slug !== id) {
    database.prepare("UPDATE category_posts SET category_slug = ? WHERE category_slug = ?").run(slug, id);
  }
}

function createCategoryPostRecord(database: DatabaseSync, values: Record<string, string>) {
  const title = requiredValue(values, "title", "Bài trong danh mục");
  const categorySlug = requiredValue(values, "categorySlug", "cong-nghe");
  const href = normalizeHref(valueFor(values, "href") || `/${slugify(title)}/`);
  const postSlug = slugFromHref(href);
  const image = valueFor(values, "image") || "/images/iaa/iaa-logo-1-1-968x800.png";
  const alt = valueFor(values, "alt") || title;
  const excerpt = valueFor(values, "excerpt");
  const sortOrder = numberFromString(valueFor(values, "sortOrder"));

  ensureCategoryArchive(database, categorySlug);
  database
    .prepare(
      `INSERT INTO category_posts (
        category_slug, post_slug, title, href, image, alt, excerpt,
        date_day, date_month, sort_order, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      categorySlug,
      postSlug,
      title,
      href,
      image,
      alt,
      excerpt,
      valueFor(values, "dateDay"),
      valueFor(values, "dateMonth"),
      sortOrder,
      JSON.stringify({ alt, excerpt, href, image, title }),
    );
}

function updateCategoryPostRecord(database: DatabaseSync, id: string, values: Record<string, string>) {
  const title = requiredValue(values, "title", "Bài trong danh mục");
  const categorySlug = requiredValue(values, "categorySlug", "cong-nghe");
  const href = normalizeHref(valueFor(values, "href") || `/${slugify(title)}/`);
  const image = valueFor(values, "image") || "/images/iaa/iaa-logo-1-1-968x800.png";
  const alt = valueFor(values, "alt") || title;
  const excerpt = valueFor(values, "excerpt");

  ensureCategoryArchive(database, categorySlug);
  database
    .prepare(
      `UPDATE category_posts
       SET category_slug = ?, post_slug = ?, title = ?, href = ?, image = ?, alt = ?,
           excerpt = ?, date_day = ?, date_month = ?, sort_order = ?, raw_json = ?
       WHERE id = ?`,
    )
    .run(
      categorySlug,
      slugFromHref(href),
      title,
      href,
      image,
      alt,
      excerpt,
      valueFor(values, "dateDay"),
      valueFor(values, "dateMonth"),
      numberFromString(valueFor(values, "sortOrder")),
      JSON.stringify({ alt, excerpt, href, image, title }),
      Number(id),
    );
}

function createMessageRecord(database: DatabaseSync, values: Record<string, string>) {
  database
    .prepare("INSERT INTO admin_messages (name, email, message, created_at, read_at) VALUES (?, ?, ?, ?, ?)")
    .run(
      requiredValue(values, "name", "Khách liên hệ"),
      requiredValue(values, "email", "unknown@example.com"),
      requiredValue(values, "message", ""),
      new Date().toISOString(),
      valueFor(values, "readAt") || null,
    );
}

function updateMessageRecord(database: DatabaseSync, id: string, values: Record<string, string>) {
  database
    .prepare("UPDATE admin_messages SET name = ?, email = ?, message = ?, read_at = ? WHERE id = ?")
    .run(
      requiredValue(values, "name", "Khách liên hệ"),
      requiredValue(values, "email", "unknown@example.com"),
      requiredValue(values, "message", ""),
      valueFor(values, "readAt") || null,
      Number(id),
    );
}

function createSearchIndexRecord(database: DatabaseSync, values: Record<string, string>) {
  const title = requiredValue(values, "title", "Nội dung mới");
  const href = uniqueHref(database, normalizeHref(valueFor(values, "href") || `/${slugify(title)}/`));

  upsertSearchIndex(database, {
    alt: valueFor(values, "alt") || title,
    excerpt: valueFor(values, "excerpt"),
    href,
    image: valueFor(values, "image") || "/images/iaa/iaa-logo-1-1-968x800.png",
    slug: valueFor(values, "slug") || slugFromHref(href),
    title,
  });
}

function updateSearchIndexRecord(database: DatabaseSync, id: string, values: Record<string, string>) {
  const title = requiredValue(values, "title", "Nội dung");
  const href = normalizeHref(valueFor(values, "href") || id);

  if (href !== id) {
    database.prepare("DELETE FROM search_index WHERE href = ?").run(id);
  }

  upsertSearchIndex(database, {
    alt: valueFor(values, "alt") || title,
    excerpt: valueFor(values, "excerpt"),
    href,
    image: valueFor(values, "image") || "/images/iaa/iaa-logo-1-1-968x800.png",
    slug: valueFor(values, "slug") || slugFromHref(href),
    title,
  });
}

function createSettingRecord(database: DatabaseSync, values: Record<string, string>) {
  updateSettingRecord(database, valueFor(values, "key"), values);
}

function updateSettingRecord(database: DatabaseSync, id: string, values: Record<string, string>) {
  const key = requiredValue(values, "key", id);
  const now = new Date().toISOString();

  if (key !== id && id) {
    database.prepare("DELETE FROM admin_settings WHERE key = ?").run(id);
  }

  database
    .prepare(
      `INSERT INTO admin_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(key, valueFor(values, "value"), now);
}

function upsertSearchIndex(
  database: DatabaseSync,
  input: {
    alt: string;
    excerpt: string;
    href: string;
    image: string;
    slug: string;
    title: string;
  },
) {
  database
    .prepare(
      `INSERT INTO search_index (href, slug, title, image, alt, excerpt, normalized_text, raw_post_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(href) DO UPDATE SET
         slug = excluded.slug,
         title = excluded.title,
         image = excluded.image,
         alt = excluded.alt,
         excerpt = excluded.excerpt,
         normalized_text = excluded.normalized_text,
         raw_post_json = excluded.raw_post_json`,
    )
    .run(
      input.href,
      input.slug,
      input.title,
      input.image,
      input.alt,
      input.excerpt,
      normalizeSearchText(`${input.title} ${input.excerpt} ${input.alt}`),
      JSON.stringify(input),
    );
}

function upsertCategoryPostForArticle(
  database: DatabaseSync,
  input: {
    categorySlug: string;
    contentHtml: string;
    excerpt: string;
    href: string;
    publishedAt: string;
    slug: string;
    title: string;
  },
) {
  const date = categoryPostDate(input.publishedAt);
  const image = firstImageFromHtml(input.contentHtml) || "/images/iaa/iaa-logo-1-1-968x800.png";
  const rawJson = JSON.stringify({
    alt: input.title,
    excerpt: input.excerpt,
    href: input.href,
    image,
    title: input.title,
  });

  database
    .prepare(
      `INSERT INTO category_posts (
        category_slug, post_slug, title, href, image, alt, excerpt,
        date_day, date_month, sort_order, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(category_slug, post_slug) DO UPDATE SET
        title = excluded.title,
        href = excluded.href,
        image = excluded.image,
        alt = excluded.alt,
        excerpt = excluded.excerpt,
        date_day = excluded.date_day,
        date_month = excluded.date_month,
        sort_order = excluded.sort_order,
        raw_json = excluded.raw_json`,
    )
    .run(
      input.categorySlug,
      input.slug,
      input.title,
      input.href,
      image,
      input.title,
      input.excerpt,
      date.day,
      date.month,
      -Date.now(),
      rawJson,
    );
}

function ensureCategoryArchive(
  database: DatabaseSync,
  slug: string,
  label = titleFromSlug(slug),
  href = `/chuyen-muc/${slug}/`,
) {
  const existing = database.prepare("SELECT slug FROM category_archives WHERE slug = ?").get(slug);

  if (existing) {
    return;
  }

  database
    .prepare(
      "INSERT INTO category_archives (slug, label, href, title, pagination_json, raw_json) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(
      slug,
      label,
      href,
      `Category Archives: ${label}`,
      "[]",
      JSON.stringify({ href, label, slug }),
    );
}

function adminCrudEntity(value: string): AdminCrudEntity {
  if (
    value === "article" ||
    value === "category" ||
    value === "category_post" ||
    value === "message" ||
    value === "search_index" ||
    value === "setting"
  ) {
    return value;
  }

  return "article";
}

function valueFor(values: Record<string, string>, key: string) {
  return values[key]?.trim() ?? "";
}

function checkboxValue(values: Record<string, string>, key: string) {
  const value = valueFor(values, key).toLowerCase();

  return value === "1" || value === "on" || value === "true";
}

function requiredValue(values: Record<string, string>, key: string, fallback: string) {
  return valueFor(values, key) || fallback;
}

function numberFromString(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeHref(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "/";
  }

  const withoutOrigin = trimmed.replace(/^https?:\/\/[^/]+/i, "");
  const withLeadingSlash = withoutOrigin.startsWith("/") ? withoutOrigin : `/${withoutOrigin}`;

  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function uniqueHref(database: DatabaseSync, rawHref: string) {
  const href = normalizeHref(rawHref);
  const existing = database.prepare("SELECT href FROM articles WHERE href = ?").get(href);

  if (!existing) {
    return href;
  }

  const base = href.replace(/\/$/, "");
  let counter = 2;
  let candidate = `${base}-${counter}/`;

  while (database.prepare("SELECT href FROM articles WHERE href = ?").get(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}/`;
  }

  return candidate;
}

function uniqueSlug(database: DatabaseSync, rawSlug: string, table: "articles" | "category_archives") {
  const baseSlug = slugify(rawSlug || "noi-dung");
  let candidate = baseSlug;
  let counter = 2;

  while (database.prepare(`SELECT slug FROM ${table} WHERE slug = ?`).get(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function slugFromHref(href: string) {
  return normalizeHref(href).replace(/\?.*$/, "").replace(/^\/+|\/+$/g, "");
}

function slugify(value: string) {
  const slug = normalizeSearchText(value).replace(/\s+/g, "-").replace(/^-+|-+$/g, "");

  return slug || "noi-dung";
}

function resolveCategory(database: DatabaseSync, input: string) {
  const rawValue = input.trim();
  const fallbackSlug = slugify(rawValue || "cong-nghe");
  const fallbackHref = `/chuyen-muc/${fallbackSlug}/`;
  const hrefCandidate = rawValue.startsWith("/") || /^https?:\/\//i.test(rawValue)
    ? normalizeHref(rawValue)
    : fallbackHref;
  const row = database
    .prepare(
      `SELECT slug, label, href
       FROM category_archives
       WHERE label COLLATE NOCASE = ? OR slug = ? OR href = ?
       LIMIT 1`,
    )
    .get(rawValue, fallbackSlug, hrefCandidate);
  const slug = stringValue(row?.slug) || fallbackSlug;
  const label = stringValue(row?.label) || rawValue || titleFromSlug(slug);
  const href = stringValue(row?.href) || fallbackHref;

  return { href, label, slug };
}

function categoryPostDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { day: "", month: "" };
  }

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: `Th${date.getMonth() + 1}`,
  };
}

function firstImageFromHtml(value: string) {
  return value.match(/<img[^>]+src=["']([^"']+)["']/)?.[1];
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatVietnameseDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeSectionSlug(sectionSlug: string) {
  const slug = sectionSlug
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");

  const aliases: Record<string, string> = {
    "bai-theo-chuyen-muc": "bai-viet",
    blog: "bai-viet",
    "chuyen-muc": "bai-viet",
    "cong-cu-seo/dieu-huong-link": "seo/dieu-huong-link",
    "cong-cu-seo/link-noi-dung": "seo/chi-muc",
    "email/lien-he": "lien-he",
    "hinh-anh/hinh-anh-facebook": "hinh-anh/anh-chia-se",
    "hinh-anh/kenh-yt-tt": "cau-hinh/thong-tin",
    "hinh-anh/mang-xa-hoi": "cau-hinh/thong-tin",
    "hinh-anh/slideshow": "hinh-anh/anh-chia-se",
    "hinh-anh/social-left": "cau-hinh/thong-tin",
    "san-pham": "bai-viet",
    "san-pham/danh-muc-cap-1": "bai-viet",
    "san-pham/danh-muc-cap-2": "bai-viet",
    "san-pham-khac": "bai-viet",
    "seopage/blog": "bai-viet",
    "seopage/san-pham": "bai-viet",
    "seopage/san-pham-khac": "bai-viet",
    "seopage/trang-chu": "seo/trang-chu",
    "trang-tinh/gioi-thieu": "trang/gioi-thieu",
    "trang-tinh/lien-he": "lien-he",
  };

  return aliases[slug] ?? slug;
}

export function canonicalAdminSectionSlug(sectionSlug: string) {
  return normalizeSectionSlug(sectionSlug);
}

function sectionCopy(slug: string) {
  const copies: Record<string, { description: string; emptyMessage: string; title: string }> = {
    "bai-theo-chuyen-muc": {
      description: "Quản lý các bài được gắn vào từng chuyên mục hiển thị ngoài giao diện.",
      emptyMessage: "Chưa có bài nào được gắn vào chuyên mục.",
      title: "Bài trong chuyên mục",
    },
    "bai-viet": {
      description: "Tạo và sửa bài viết. Chuyên mục, trang chuyên mục và tìm kiếm được cập nhật tự động khi lưu.",
      emptyMessage: "Chưa có bài viết nào.",
      title: "Đăng bài viết",
    },
    "cau-hinh/thong-tin": {
      description: "Tên website và email quản trị đang lưu trong bảng admin_settings.",
      emptyMessage: "Chưa có cấu hình website.",
      title: "Thông tin website",
    },
    "chuyen-muc": {
      description: "Quản lý chuyên mục bài viết đã clone về bảng category_archives.",
      emptyMessage: "Chưa có chuyên mục nào.",
      title: "Chuyên mục",
    },
    "lien-he": {
      description: "Tin nhắn form liên hệ được lưu vào bảng admin_messages.",
      emptyMessage: "Chưa có thư liên hệ.",
      title: "Tin liên hệ",
    },
    "hinh-anh/favicon": {
      description: "Thông tin nhận diện favicon lấy từ cấu hình website.",
      emptyMessage: "Chưa có dữ liệu favicon.",
      title: "Favicon",
    },
    "hinh-anh/anh-chia-se": {
      description: "Ảnh từ bài viết, dùng cho ảnh chia sẻ và chỉ mục nội dung.",
      emptyMessage: "Chưa có ảnh trong search_index.",
      title: "Ảnh chia sẻ",
    },
    "hinh-anh/logo": {
      description: "Thông tin logo KAI và tên web kaireview từ cấu hình SQLite.",
      emptyMessage: "Chưa có cấu hình logo.",
      title: "Logo",
    },
    "seo/chi-muc": {
      description: "Danh sách chỉ mục nội dung phục vụ tìm kiếm và SEO.",
      emptyMessage: "Chưa có chỉ mục tìm kiếm.",
      title: "Chỉ mục tìm kiếm",
    },
    "seo/dieu-huong-link": {
      description: "Kiểm tra các link nội bộ của chuyên mục và bài viết đã clone.",
      emptyMessage: "Chưa có link nội bộ.",
      title: "Điều hướng link",
    },
    "seo/trang-chu": {
      description: "Nội dung nổi bật cho SEO trang chủ từ chuyên mục và bài mới.",
      emptyMessage: "Chưa có dữ liệu SEO trang chủ.",
      title: "SEO Trang chủ",
    },
    "trang/gioi-thieu": {
      description: "Thông tin giới thiệu website lấy từ bảng admin_settings.",
      emptyMessage: "Chưa có dữ liệu giới thiệu.",
      title: "Giới thiệu",
    },
  };

  return (
    copies[slug] ?? {
      description: "Dữ liệu liên quan được đọc trực tiếp từ SQLite.",
      emptyMessage: "Chưa có dữ liệu cho mục này.",
      title: "Quản trị nội dung",
    }
  );
}

function formatSQLiteDateTime(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function count(database: DatabaseSync, sql: string, params: (number | string)[] = []) {
  const row = database.prepare(sql).get(...params);

  return numberValue(row?.value);
}

function buildYearOptions(selectedYear: number) {
  const currentYear = new Date().getFullYear();
  const firstYear = Math.min(selectedYear, currentYear - 2);
  const lastYear = Math.max(selectedYear, currentYear + 1);

  return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);
}

function statusMessage(status: string) {
  const messages: Record<string, string> = {
    "article-created": "Bài viết đã được đăng.",
    "article-deleted": "Bài viết đã được xoá.",
    "article-updated": "Bài viết đã được cập nhật.",
    "auth-required": "Bạn cần đăng nhập để thực hiện thao tác quản trị.",
    "contact-sent": "Tin liên hệ đã được lưu vào SQLite.",
    "crud-created": "Đã thêm dữ liệu mới vào SQLite.",
    "crud-deleted": "Đã xoá dữ liệu khỏi SQLite.",
    "crud-error": "Thao tác quản trị chưa hợp lệ.",
    "crud-updated": "Đã cập nhật dữ liệu trong SQLite.",
    "password-short": "Mật khẩu mới phải có ít nhất 6 ký tự.",
    "password-updated": "Mật khẩu admin đã được cập nhật.",
    "settings-saved": "Cấu hình website đã được lưu.",
    "wrong-password": "Mật khẩu hiện tại không đúng.",
  };

  return messages[status] ?? "";
}

function settingLabel(key: string) {
  const labels: Record<string, string> = {
    contact_intro_html: "Nội dung giới thiệu trang liên hệ",
    site_email: "Email website",
    site_name: "Tên website",
  };

  return labels[key] ?? key;
}

function settingValueFieldLabel(key: string) {
  if (key === "contact_intro_html") {
    return "Nội dung";
  }

  return "Giá trị";
}

function settingHref(key: string) {
  if (key === "contact_intro_html") {
    return "/lien-he/";
  }

  return "/admin/cau-hinh/thong-tin";
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = date.getDay() || 7;
  const start = startOfDay(date);

  start.setDate(start.getDate() - day + 1);

  return start;
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, value));
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}
