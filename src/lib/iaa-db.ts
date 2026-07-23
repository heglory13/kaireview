import { existsSync } from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

import {
  heroLeadPost as fallbackHeroLeadPost,
  heroMiniPosts as fallbackHeroMiniPosts,
  heroSidePost as fallbackHeroSidePost,
  navItems,
  reviewPosts as fallbackReviewPosts,
  technologyPosts as fallbackTechnologyPosts,
} from "@/lib/iaa-data";
import {
  sqliteArticleDetails,
  sqliteCategoryArchives,
  sqliteSearchEntries,
} from "@/lib/iaa-db.snapshot";
import type {
  IaaArchivePageLink,
  IaaArticle,
  IaaCategoryArchiveData,
  IaaHomePosts,
  IaaPost,
  IaaRelatedPost,
  IaaSearchSuggestion,
} from "@/types/iaa";

const POSTS_PER_CATEGORY_PAGE = 10;
const HOMEPAGE_FEATURED_LIMIT = 14;
const SITE_AUTHOR_AVATAR = "/images/kai-favicon.svg";
const databasePath = path.join(process.cwd(), "data", "iaa.sqlite");

let sqliteModule: typeof import("node:sqlite") | undefined;

type SearchEntry = { normalizedText: string; post: IaaPost };
type RankedSearchMatch = { entry: SearchEntry; index: number; score: number };
type SyntheticCategoryRule = {
  fallbackSourceSlugs?: string[];
  limit?: number;
  minPosts?: number;
  queries: string[];
  sourceSlugs?: string[];
};

type SqliteRow = Record<string, unknown>;

const fallbackHomePosts: IaaHomePosts = {
  heroLeadPost: fallbackHeroLeadPost,
  heroMiniPosts: fallbackHeroMiniPosts,
  heroSidePost: fallbackHeroSidePost,
  reviewPosts: fallbackReviewPosts,
  technologyPosts: fallbackTechnologyPosts,
};
const defaultContactIntroHtml = `<h2>Liên hệ kaireview</h2>
<ul>
  <li><strong>Website:</strong> kaireview</li>
  <li><strong>Nội dung:</strong> Review, tổng hợp và gợi ý sản phẩm, dịch vụ.</li>
  <li><strong>Email:</strong> hello@kaireview.vn</li>
</ul>
<p><strong>Liên hệ với chúng tôi:</strong> Bạn có thắc mắc hay cần hỗ trợ? Đừng ngần ngại, hãy gửi thông tin cho chúng tôi. Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn!</p>`;

function getDatabaseSync() {
  sqliteModule ??= process.getBuiltinModule("node:sqlite");

  return sqliteModule.DatabaseSync;
}

const categoryRouteAliases: Record<
  string,
  {
    label: string;
    href: string;
    sourceSlug: string;
    title: string;
  }
> = {
  "nha-noi-that": {
    label: "Nhà & Nội Thất",
    href: "/chuyen-muc/nha-noi-that/",
    sourceSlug: "xay-dung",
    title: "Category Archives: Nhà & Nội Thất",
  },
  "giao-duc": {
    label: "Giáo Dục",
    href: "/chuyen-muc/giao-duc/",
    sourceSlug: "english",
    title: "Category Archives: Giáo Dục",
  },
};

const sourceCategoryAliasesByHref = Object.fromEntries(
  Object.values(categoryRouteAliases).map((alias) => [
    sqliteCategoryArchives.find((archive) => archive.slug === alias.sourceSlug)?.href,
    {
      label: alias.label,
      href: alias.href,
    },
  ]),
);

const syntheticCategoryRules: Record<string, SyntheticCategoryRule> = {
  "thiet-ke": {
    sourceSlugs: ["xay-dung"],
    queries: ["thiết kế", "theo thiết kế", "nội thất", "mặt bàn", "quầy bar", "bàn ghế"],
  },
  "trang-tri": {
    sourceSlugs: ["xay-dung"],
    queries: ["chậu cây", "sân vườn", "ngoài trời", "sân thượng", "composite"],
  },
  "vat-lieu": {
    sourceSlugs: ["xay-dung"],
    queries: ["bê tông", "đá mài", "xi măng", "terrazzo", "composite"],
  },
  "review-san-pham": {
    sourceSlugs: ["xay-dung"],
    queries: ["top", "xưởng sản xuất", "uy tín", "review", "furnio"],
  },
  "doi-song": {
    fallbackSourceSlugs: ["xay-dung", "suc-khoe", "am-thuc"],
    queries: ["mẹo", "hướng dẫn", "không gian", "gia đình", "tiêu dùng"],
  },
  "meo-hay": {
    fallbackSourceSlugs: ["cong-nghe", "am-thuc"],
    queries: ["hướng dẫn", "cách", "xử lý", "kiểm tra", "khắc phục", "làm sa tế"],
  },
  "gia-dinh": {
    fallbackSourceSlugs: ["suc-khoe", "xay-dung"],
    queries: ["trẻ em", "người lớn", "gia đình", "sức khỏe", "không gian"],
  },
  "khong-gian-song": {
    fallbackSourceSlugs: ["xay-dung"],
    queries: ["sân vườn", "ngoài trời", "sân thượng", "chậu cây", "bàn ghế"],
  },
  "tieu-dung": {
    fallbackSourceSlugs: ["cong-nghe", "am-thuc", "suc-khoe"],
    queries: ["shop", "cửa hàng", "mua", "giá rẻ", "thương hiệu", "chính hãng"],
  },
  "ky-nang": {
    fallbackSourceSlugs: ["english"],
    queries: ["khác biệt", "sử dụng", "mã zip", "postcode", "vương quốc anh"],
  },
  "hoc-tap": {
    sourceSlugs: ["english"],
    queries: ["trường đại học", "đại học", "British University", "Anh Quốc Việt Nam"],
  },
  "cong-nghe-giao-duc": {
    fallbackSourceSlugs: ["english", "cong-nghe"],
    queries: ["đại học", "postcode", "công nghệ", "mã zip", "Anh Quốc"],
  },
  "dinh-duong": {
    fallbackSourceSlugs: ["am-thuc", "suc-khoe"],
    queries: ["tinh bột", "dinh dưỡng", "sức khỏe", "lợi ích", "loại nào tốt"],
  },
  "lam-dep": {
    fallbackSourceSlugs: ["suc-khoe"],
    queries: ["kính", "thể thao", "chạy bộ", "bơi", "chính hãng"],
  },
  "cham-soc-suc-khoe": {
    sourceSlugs: ["suc-khoe"],
    queries: ["bác sĩ", "phòng khám", "cột sống", "chiropractic", "sức khỏe"],
  },
  ai: {
    fallbackSourceSlugs: ["cong-nghe"],
    queries: ["camera", "màn hình", "phần mềm", "modem", "reset counter"],
  },
  "dien-thoai": {
    sourceSlugs: ["cong-nghe"],
    queries: ["iphone", "ipad", "điện thoại", "màn hình", "loa", "camera"],
  },
  laptop: {
    sourceSlugs: ["cong-nghe"],
    queries: ["laptop", "macbook", "icloud", "bypass", "thu mua"],
  },
  "phan-mem": {
    sourceSlugs: ["cong-nghe"],
    queries: ["phần mềm", "icloud", "bypass", "modem", "reset counter", "lỗi"],
  },
  "tai-chinh": {
    fallbackSourceSlugs: ["cong-nghe", "xay-dung", "am-thuc"],
    queries: ["giá", "mua", "bán", "thu mua", "cửa hàng", "kinh doanh"],
  },
  "mua-sam": {
    fallbackSourceSlugs: ["cong-nghe", "am-thuc", "suc-khoe"],
    queries: ["shop", "cửa hàng", "bán", "mua", "giá rẻ", "chính hãng"],
  },
  "tiet-kiem": {
    fallbackSourceSlugs: ["cong-nghe"],
    queries: ["mua cũ", "thu mua", "giá cao", "giá rẻ", "macbook cũ", "laptop cũ"],
  },
  "kinh-doanh": {
    fallbackSourceSlugs: ["xay-dung", "cong-nghe", "am-thuc"],
    queries: ["xưởng sản xuất", "thương hiệu", "cửa hàng", "dịch vụ", "uy tín"],
  },
  "xe-co": {
    fallbackSourceSlugs: ["cong-nghe", "suc-khoe"],
    queries: ["camera", "màn hình", "phụ kiện", "kiểm tra", "sửa"],
  },
  "o-to": {
    fallbackSourceSlugs: ["cong-nghe"],
    queries: ["camera", "màn hình", "kiểm tra", "bảo hành", "sửa"],
  },
  "xe-may": {
    fallbackSourceSlugs: ["cong-nghe"],
    queries: ["mua cũ", "kiểm tra", "sửa", "giá rẻ", "cửa hàng"],
  },
  "phu-kien": {
    fallbackSourceSlugs: ["suc-khoe", "cong-nghe"],
    queries: ["phụ kiện", "kính", "chính hãng", "camera", "mặt kính"],
  },
  "du-lich": {
    fallbackSourceSlugs: ["english", "am-thuc"],
    queries: ["vương quốc anh", "quảng trị", "lai châu", "việt nam", "địa điểm"],
  },
  "dia-diem": {
    fallbackSourceSlugs: ["english", "am-thuc"],
    queries: ["vương quốc anh", "quảng trị", "lai châu", "việt nam", "tphcm"],
  },
  resort: {
    fallbackSourceSlugs: ["english", "am-thuc"],
    queries: ["vương quốc anh", "địa điểm", "khách sạn", "du lịch"],
  },
  "khach-san": {
    fallbackSourceSlugs: ["english", "cong-nghe"],
    queries: ["vương quốc anh", "địa điểm", "trung tâm", "cửa hàng"],
  },
  "kinh-nghiem": {
    fallbackSourceSlugs: ["english", "cong-nghe", "am-thuc"],
    queries: ["kinh nghiệm", "hướng dẫn", "so với", "khác biệt", "gồm những nước", "cách"],
  },
  review: {
    fallbackSourceSlugs: ["cong-nghe", "suc-khoe", "am-thuc", "xay-dung"],
    queries: ["top", "review", "uy tín", "thương hiệu", "cửa hàng"],
  },
  "review-quan-an": {
    fallbackSourceSlugs: ["am-thuc"],
    queries: ["sa tế", "sate", "thương hiệu", "ngon", "ẩm thực"],
  },
  "cong-thuc": {
    sourceSlugs: ["am-thuc"],
    queries: ["hướng dẫn", "cách làm", "sa tế", "công thức", "làm"],
  },
  "dac-san": {
    sourceSlugs: ["am-thuc"],
    queries: ["đặc sản", "quảng trị", "lai châu", "ớt", "peru", "thái lan"],
  },
  "thuong-hieu": {
    fallbackSourceSlugs: ["am-thuc", "suc-khoe", "cong-nghe"],
    queries: ["thương hiệu", "chính hãng", "top", "uy tín"],
  },
  "san-pham": {
    fallbackSourceSlugs: ["cong-nghe", "suc-khoe", "am-thuc", "xay-dung"],
    queries: ["sản phẩm", "kính", "sa tế", "macbook", "iphone", "bàn ghế", "chậu"],
  },
  "dich-vu": {
    fallbackSourceSlugs: ["cong-nghe", "suc-khoe", "xay-dung"],
    queries: ["cửa hàng", "trung tâm", "phòng khám", "dịch vụ", "sửa", "thu mua"],
  },
  "so-sanh": {
    fallbackSourceSlugs: ["english", "am-thuc", "cong-nghe"],
    queries: ["so với", "khác biệt", "mấy loại", "loại nào", "top"],
  },
};

function readFromContentDatabase<T>(reader: (database: DatabaseSync) => T, fallback: T) {
  if (!existsSync(databasePath)) {
    return fallback;
  }

  let database: DatabaseSync | undefined;

  try {
    const DatabaseSync = getDatabaseSync();

    database = new DatabaseSync(databasePath, { readOnly: true, timeout: 5000 });

    return reader(database);
  } catch {
    return fallback;
  } finally {
    database?.close();
  }
}

function getArticleDetailsSource() {
  return readFromContentDatabase<IaaArticle[]>(
    (database) =>
      database
        .prepare(
          `SELECT slug, title, description, href, category_label, category_href,
                  published_label, published_datetime, updated_label, updated_datetime,
                  author_name, author_href, author_avatar, tag_label, tag_href,
                  previous_title, previous_href, figures_json, content_html, related_posts_json
           FROM articles
           ORDER BY published_datetime DESC, title COLLATE NOCASE`,
        )
        .all()
        .map(articleFromRow)
        .filter((article) => article.slug && article.href && article.title),
    sqliteArticleDetails,
  );
}

function getCategoryArchivesSource() {
  return readFromContentDatabase<IaaCategoryArchiveData[]>(
    (database) => {
      const archiveRows = database
        .prepare(
          `SELECT slug, label, href, title, pagination_json
           FROM category_archives
           ORDER BY label COLLATE NOCASE`,
        )
        .all();
      const postRows = database
        .prepare(
          `SELECT category_slug, post_slug, title, href, image, alt, excerpt,
                  date_day, date_month, sort_order
           FROM category_posts
           ORDER BY sort_order, title COLLATE NOCASE`,
        )
        .all();
      const postsByCategory = new Map<string, IaaPost[]>();

      for (const row of postRows) {
        const categorySlug = rowString(row, "category_slug");
        const title = rowString(row, "title");
        const href = rowString(row, "href");

        if (!categorySlug || !title || !href) {
          continue;
        }

        const dateDay = rowString(row, "date_day");
        const dateMonth = rowString(row, "date_month");
        const post: IaaPost = {
          alt: rowString(row, "alt") || title,
          href,
          image: rowString(row, "image") || "/images/kai-favicon.svg",
          title,
          ...(rowString(row, "excerpt")
            ? { excerpt: rowString(row, "excerpt") }
            : {}),
          ...(dateDay && dateMonth ? { date: { day: dateDay, month: dateMonth } } : {}),
        };

        postsByCategory.set(categorySlug, [...(postsByCategory.get(categorySlug) ?? []), post]);
      }

      return archiveRows
        .map((row) => {
          const slug = rowString(row, "slug");
          const label = rowString(row, "label");
          const href = rowString(row, "href");
          const title = rowString(row, "title");

          return {
            href,
            label,
            pagination:
              parseJsonValue<IaaArchivePageLink[]>(rowString(row, "pagination_json")) ?? [],
            posts: postsByCategory.get(slug) ?? [],
            slug,
            title,
          };
        })
        .filter((archive) => archive.slug && archive.href && archive.label);
    },
    sqliteCategoryArchives,
  );
}

function getSearchEntriesSource() {
  return readFromContentDatabase<SearchEntry[]>(
    (database) =>
      database
        .prepare(
          `SELECT href, slug, title, image, alt, excerpt, normalized_text
           FROM search_index
           ORDER BY title COLLATE NOCASE`,
        )
        .all()
        .map((row) => {
          const title = rowString(row, "title");
          const href = rowString(row, "href");
          const alt = rowString(row, "alt") || title;
          const excerpt = rowString(row, "excerpt");
          const image = rowString(row, "image") || "/images/kai-favicon.svg";

          return {
            normalizedText:
              rowString(row, "normalized_text") ||
              normalizeSearchText(`${title} ${excerpt} ${alt} ${rowString(row, "slug")}`),
            post: {
              alt,
              href,
              image,
              title,
              ...(excerpt ? { excerpt } : {}),
            },
          };
        })
        .filter((entry) => entry.post.href && entry.post.title),
    sqliteSearchEntries,
  );
}

function getHomepageFeaturedPostsSource() {
  return readFromContentDatabase<IaaPost[] | undefined>(
    (database) => {
      const columns = new Set(
        database
          .prepare("PRAGMA table_info(articles)")
          .all()
          .map((row) => rowString(row, "name")),
      );

      if (!columns.has("home_featured")) {
        return undefined;
      }

      return database
        .prepare(
          `SELECT slug, title, description, href, category_label, category_href,
                  published_label, published_datetime, updated_label, updated_datetime,
                  author_name, author_href, author_avatar, tag_label, tag_href,
                  previous_title, previous_href, figures_json, content_html, related_posts_json
           FROM articles
           WHERE home_featured = 1
           ORDER BY published_datetime DESC, title COLLATE NOCASE
           LIMIT ?`,
        )
        .all(HOMEPAGE_FEATURED_LIMIT)
        .map(articleFromRow)
        .filter((article) => article.slug && article.href && article.title)
        .map(articleToPost);
    },
    undefined,
  );
}

function getAdminSettingValueSource(key: string, fallback: string) {
  return readFromContentDatabase<string>(
    (database) => {
      const row = database.prepare("SELECT value FROM admin_settings WHERE key = ?").get(key);
      const value = row && typeof row === "object" ? rowString(row as SqliteRow, "value") : "";

      return value || fallback;
    },
    fallback,
  );
}

function buildHomePosts(featuredPosts: IaaPost[]): IaaHomePosts {
  const usedHrefs = new Set<string>();
  const takePosts = (limit: number) => {
    const posts: IaaPost[] = [];

    for (const post of featuredPosts) {
      if (usedHrefs.has(post.href)) {
        continue;
      }

      usedHrefs.add(post.href);
      posts.push(post);

      if (posts.length >= limit) {
        break;
      }
    }

    return posts;
  };
  const heroLeadPost = takePosts(1)[0];
  const heroMiniPosts = takePosts(3);
  const heroSidePost = takePosts(1)[0];
  const reviewPosts = takePosts(3);
  const technologyPosts = takePosts(fallbackTechnologyPosts.length);

  return {
    ...(heroLeadPost ? { heroLeadPost } : {}),
    heroMiniPosts,
    ...(heroSidePost ? { heroSidePost } : {}),
    reviewPosts,
    technologyPosts,
  };
}

function articleFromRow(row: SqliteRow): IaaArticle {
  const tagLabel = rowString(row, "tag_label");
  const tagHref = rowString(row, "tag_href");
  const previousTitle = rowString(row, "previous_title");
  const previousHref = rowString(row, "previous_href");
  const figures = parseJsonValue<IaaArticle["figures"]>(rowString(row, "figures_json"));
  const relatedPosts = parseJsonValue<IaaRelatedPost[]>(rowString(row, "related_posts_json"));
  const title = rowString(row, "title");

  return {
    author: {
      avatar: rowString(row, "author_avatar") || SITE_AUTHOR_AVATAR,
      href: rowString(row, "author_href") || "/",
      name: rowString(row, "author_name") || "kaireview",
    },
    category: {
      href: rowString(row, "category_href") || "/chuyen-muc/cong-nghe/",
      label: rowString(row, "category_label") || "Công Nghệ",
    },
    contentHtml: rowString(row, "content_html"),
    description: rowString(row, "description"),
    href: rowString(row, "href"),
    publishedDateTime: rowString(row, "published_datetime"),
    publishedLabel: rowString(row, "published_label"),
    slug: rowString(row, "slug"),
    title,
    updatedDateTime: rowString(row, "updated_datetime"),
    updatedLabel: rowString(row, "updated_label"),
    ...(figures ? { figures } : {}),
    ...(previousTitle && previousHref
      ? { previousPost: { href: previousHref, title: previousTitle } }
      : {}),
    ...(relatedPosts ? { relatedPosts } : {}),
    ...(tagLabel && tagHref ? { tag: { href: tagHref, label: tagLabel } } : {}),
  };
}

function parseJsonValue<T>(value: string): T | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    return parsed as T;
  } catch {
    return undefined;
  }
}

function rowString(row: SqliteRow, key: string) {
  const value = row[key];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }

  return "";
}

function slugFromHref(href: string) {
  return href.replace(/\?.*$/, "").replace(/^\/+|\/+$/g, "");
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

function tokenizeSearchText(value: string) {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function scoreSearchTokens(tokens: string[], term: string, exactScore: number, prefixScore: number) {
  if (tokens.includes(term)) {
    return exactScore;
  }

  return tokens.some((token) => token.startsWith(term)) ? prefixScore : 0;
}

function scoreSearchEntry(
  entry: SearchEntry,
  terms: string[],
  normalizedQuery: string,
  allowSubstring: boolean,
) {
  if (!terms.length) {
    return 0;
  }

  const normalizedTitle = normalizeSearchText(entry.post.title);
  const normalizedHref = normalizeSearchText(slugFromHref(entry.post.href).replace(/-/g, " "));
  const normalizedExcerpt = normalizeSearchText(entry.post.excerpt ?? "");
  const titleTokens = tokenizeSearchText(normalizedTitle);
  const hrefTokens = tokenizeSearchText(normalizedHref);
  const excerptTokens = tokenizeSearchText(normalizedExcerpt);
  const fullTextTokens = tokenizeSearchText(entry.normalizedText);
  let score = 0;

  for (const term of terms) {
    let termScore = 0;

    termScore += scoreSearchTokens(titleTokens, term, 180, 110);
    termScore += scoreSearchTokens(hrefTokens, term, 150, 90);
    termScore += scoreSearchTokens(excerptTokens, term, 80, 35);
    termScore += scoreSearchTokens(fullTextTokens, term, 45, 20);

    if (!termScore && allowSubstring && entry.normalizedText.includes(term)) {
      termScore = 1;
    }

    if (!termScore) {
      return undefined;
    }

    score += termScore;
  }

  if (normalizedTitle === normalizedQuery) {
    score += 700;
  }

  if (normalizedQuery.length >= 3) {
    if (normalizedTitle.includes(normalizedQuery)) {
      score += 300;
    }

    if (normalizedHref.includes(normalizedQuery)) {
      score += 250;
    }

    if (entry.normalizedText.includes(normalizedQuery)) {
      score += 40;
    }
  }

  return score;
}

function rankSearchEntries(query: string, entries = getSearchEntriesSource()) {
  const normalizedQuery = normalizeSearchText(query.trim());
  const terms = tokenizeSearchText(query);
  const rankMatches = (allowSubstring: boolean) =>
    entries
      .map((entry, index) => ({
        entry,
        index,
        score: scoreSearchEntry(entry, terms, normalizedQuery, allowSubstring),
      }))
      .filter((match): match is RankedSearchMatch => typeof match.score === "number")
      .sort((left, right) => right.score - left.score || left.index - right.index);
  const matches = rankMatches(false);

  return {
    matches: matches.length || !terms.length ? matches : rankMatches(true),
    normalizedQuery,
    terms,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function firstImageFromHtml(value = "") {
  return value.match(/<img[^>]+src="([^"]+)"/)?.[1];
}

function normalizeArticleCategory(article: IaaArticle): IaaArticle {
  const categoryAlias = sourceCategoryAliasesByHref[article.category.href];

  if (!categoryAlias) {
    return article;
  }

  return {
    ...article,
    category: categoryAlias,
  };
}

function articleToPost(article: IaaArticle): IaaPost {
  const dateParts = article.publishedLabel.match(/Tháng\s+\d+\s+(\d+)/);

  return {
    title: article.title,
    href: article.href,
    image:
      firstImageFromHtml(article.contentHtml) ??
      article.relatedPosts?.[0]?.image ??
      "/images/kai-favicon.svg",
    alt: article.title,
    excerpt: article.description,
    date: dateParts
      ? {
          day: dateParts[1].padStart(2, "0"),
          month: `Th${article.publishedLabel.match(/Tháng\s+(\d+)/)?.[1] ?? ""}`,
        }
      : undefined,
  };
}

function categorySlugFromHref(href: string) {
  return href.match(/\/chuyen-muc\/([^/]+)\//)?.[1];
}

function getPostSourceSlug(
  href: string,
  articleDetails = getArticleDetailsSource(),
  categoryArchives = getCategoryArchivesSource(),
) {
  const article = articleDetails.find((item) => item.href === href);

  if (article) {
    return categorySlugFromHref(article.category.href);
  }

  return categoryArchives.find((archive) =>
    archive.posts.some((post) => post.href === href),
  )?.slug;
}

function uniquePosts(posts: IaaPost[]) {
  const seenHrefs = new Set<string>();

  return posts.filter((post) => {
    if (seenHrefs.has(post.href)) {
      return false;
    }

    seenHrefs.add(post.href);
    return true;
  });
}

function getPostsFromSourceSlugs(
  sourceSlugs: string[],
  articleDetails = getArticleDetailsSource(),
  categoryArchives = getCategoryArchivesSource(),
) {
  const sourceSet = new Set(sourceSlugs);
  const articlePosts = articleDetails
    .filter((article) => {
      const sourceSlug = categorySlugFromHref(article.category.href);

      return sourceSlug ? sourceSet.has(sourceSlug) : false;
    })
    .map(articleToPost);
  const archivePosts = categoryArchives
    .filter((archive) => sourceSet.has(archive.slug))
    .flatMap((archive) => archive.posts);

  return uniquePosts([...articlePosts, ...archivePosts]);
}

// Kept for compatibility with the imported snapshot taxonomy; category pages no longer call it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSyntheticPostsForArchive(archive: IaaCategoryArchiveData) {
  const rule = syntheticCategoryRules[archive.slug];

  if (!rule) {
    return [];
  }

  const articleDetails = getArticleDetailsSource();
  const categoryArchives = getCategoryArchivesSource();
  const searchEntries = getSearchEntriesSource();
  const scoredPosts = new Map<
    string,
    {
      index: number;
      post: IaaPost;
      score: number;
    }
  >();
  const sourceSet = rule.sourceSlugs ? new Set(rule.sourceSlugs) : undefined;
  const minPosts = rule.minPosts ?? 4;
  const limit = rule.limit ?? POSTS_PER_CATEGORY_PAGE;

  const addPost = (post: IaaPost, score: number, index: number) => {
    const existing = scoredPosts.get(post.href);

    if (existing) {
      existing.score += score;
      existing.index = Math.min(existing.index, index);
      return;
    }

    scoredPosts.set(post.href, {
      index,
      post,
      score,
    });
  };

  rule.queries.forEach((query, queryIndex) => {
    rankSearchEntries(query, searchEntries).matches.forEach((match) => {
      const sourceSlug = getPostSourceSlug(match.entry.post.href, articleDetails, categoryArchives);

      if (sourceSet && (!sourceSlug || !sourceSet.has(sourceSlug))) {
        return;
      }

      addPost(match.entry.post, match.score - queryIndex, match.index);
    });
  });

  const fallbackSourceSlugs = rule.fallbackSourceSlugs ?? rule.sourceSlugs;

  if (fallbackSourceSlugs && scoredPosts.size < minPosts) {
    getPostsFromSourceSlugs(fallbackSourceSlugs, articleDetails, categoryArchives).forEach((post, index) => {
      addPost(post, -1000 - index, index);
    });
  }

  return [...scoredPosts.values()]
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map((item) => item.post);
}

function getAllPostsForArchive(archive: IaaCategoryArchiveData) {
  const sourceHref = getSourceCategoryHrefForArchive(archive);
  const navItem = navItems.find((item) => item.href === archive.href);
  const childHrefs = navItem?.children?.map((child) => child.href) ?? [];
  const matchingCategoryHrefs = new Set([archive.href, sourceHref, ...childHrefs]);
  const childPosts = getCategoryArchivesSource()
    .filter((item) => childHrefs.includes(item.href))
    .flatMap((item) => item.posts);
  const archivePosts = uniquePosts([...archive.posts, ...childPosts]);
  const sourceHrefs = new Set(archivePosts.map((post) => post.href));
  const articlePosts = getArticleDetailsSource()
    .filter((article) => matchingCategoryHrefs.has(article.category.href))
    .map(articleToPost)
    .filter((post) => !sourceHrefs.has(post.href));

  return uniquePosts([...archivePosts, ...articlePosts]);
}

function getSourceCategoryHrefForArchive(archive: IaaCategoryArchiveData) {
  const alias = categoryRouteAliases[archive.slug];

  if (!alias) {
    return archive.href;
  }

  return getCategoryArchivesSource().find((item) => item.slug === alias.sourceSlug)?.href ?? archive.href;
}

function getArchiveByRouteSlug(slug: string): IaaCategoryArchiveData | undefined {
  const categoryArchives = getCategoryArchivesSource();
  const alias = categoryRouteAliases[slug];

  if (!alias) {
    const ownArchive = categoryArchives.find((item) => item.slug === slug);

    if (ownArchive) {
      return ownArchive;
    }

    const parentNavItem = navItems.find(
      (item) => categorySlugFromHref(item.href) === slug && item.children?.length,
    );
    const hasChildArchive = parentNavItem?.children?.some((child) =>
      categoryArchives.some((archive) => archive.href === child.href),
    );

    if (parentNavItem && hasChildArchive) {
      return {
        href: parentNavItem.href,
        label: parentNavItem.label,
        pagination: [],
        posts: [],
        slug,
        title: `Category Archives: ${parentNavItem.label}`,
      };
    }

    return undefined;
  }

  const sourceArchive = categoryArchives.find((item) => item.slug === alias.sourceSlug);
  const ownArchive = categoryArchives.find((item) => item.slug === slug);

  if (!sourceArchive && !ownArchive) {
    return undefined;
  }

  const baseArchive = sourceArchive ?? ownArchive;

  if (!baseArchive) {
    return undefined;
  }

  return {
    ...baseArchive,
    slug,
    label: alias.label,
    href: alias.href,
    posts: uniquePosts([...(ownArchive?.posts ?? []), ...(sourceArchive?.posts ?? [])]),
    title: alias.title,
  };
}

function categoryPageHref(archiveHref: string, page: number) {
  return page <= 1 ? archiveHref : `${archiveHref.replace(/\/$/, "")}/page/${page}/`;
}

function buildCategoryPagination(
  archiveHref: string,
  currentPage: number,
  pageCount: number,
): IaaArchivePageLink[] {
  if (pageCount <= 1) {
    return [{ label: "1", href: archiveHref, current: true }];
  }

  const links: IaaArchivePageLink[] = Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1;

    return {
      label: String(page),
      href: categoryPageHref(archiveHref, page),
      current: page === currentPage,
    };
  });

  if (currentPage < pageCount) {
    links.push({
      label: "›",
      href: categoryPageHref(archiveHref, currentPage + 1),
      isNext: true,
    });
  }

  return links;
}

function buildFallbackArticle(
  post: IaaPost,
  archive: IaaCategoryArchiveData,
): IaaArticle {
  const description = post.excerpt ?? post.title;
  const dateLabel = post.date ? `${post.date.day} ${post.date.month}` : "";

  return {
    slug: slugFromHref(post.href),
    title: post.title,
    description,
    href: post.href,
    category: {
      label: archive.label,
      href: archive.href,
    },
    publishedLabel: dateLabel,
    publishedDateTime: "",
    updatedLabel: dateLabel,
    updatedDateTime: "",
    author: {
      name: "kaireview",
      href: "/author/tiengdung00/",
      avatar: SITE_AUTHOR_AVATAR,
    },
    contentHtml: `<div id="ftwp-postcontent"><p><img class="aligncenter size-full" src="${post.image}" alt="${escapeHtml(
      post.alt,
    )}" width="600" height="400" /></p><p>${escapeHtml(description)}</p></div>`,
  };
}

export function getAllArticlePageSlugs() {
  const articleDetails = getArticleDetailsSource();
  const categoryArchives = getCategoryArchivesSource();
  const slugs = new Set([
    ...articleDetails.map((article) => article.slug),
    ...categoryArchives.flatMap((archive) =>
      archive.posts.map((post) => slugFromHref(post.href)),
    ),
  ]);

  return [...slugs];
}

export function getHomePosts() {
  const featuredPosts = getHomepageFeaturedPostsSource();

  return featuredPosts ? buildHomePosts(featuredPosts) : fallbackHomePosts;
}

export function getContactIntroHtml() {
  return getAdminSettingValueSource("contact_intro_html", defaultContactIntroHtml);
}

export function getArticleBySlug(slug: string): IaaArticle | undefined {
  const articleDetails = getArticleDetailsSource();
  const categoryArchives = getCategoryArchivesSource();
  const article = articleDetails.find((item) => item.slug === slug);

  if (article) {
    return normalizeArticleCategory(article);
  }

  for (const archive of categoryArchives) {
    const post = archive.posts.find((item) => slugFromHref(item.href) === slug);

    if (post) {
      return buildFallbackArticle(post, archive);
    }
  }

  return undefined;
}

export function getAllCategorySlugs() {
  return [...new Set([...getCategoryArchivesSource().map((archive) => archive.slug), ...Object.keys(categoryRouteAliases)])];
}

export function getCategoryPageParams() {
  return getAllCategorySlugs().flatMap((slug) => {
    const archive = getArchiveByRouteSlug(slug);

    if (!archive) {
      return [];
    }

    const pageCount = Math.ceil(getAllPostsForArchive(archive).length / POSTS_PER_CATEGORY_PAGE);

    return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => ({
      slug,
      page: String(index + 2),
    }));
  });
}

export function getCategoryArchiveBySlug(
  slug: string,
  page = 1,
): IaaCategoryArchiveData | undefined {
  const archive = getArchiveByRouteSlug(slug);

  if (!archive) {
    return undefined;
  }

  const allPosts = getAllPostsForArchive(archive);
  const pageCount = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_CATEGORY_PAGE));

  if (!Number.isInteger(page) || page < 1 || page > pageCount) {
    return undefined;
  }

  const startIndex = (page - 1) * POSTS_PER_CATEGORY_PAGE;
  const posts = allPosts.slice(startIndex, startIndex + POSTS_PER_CATEGORY_PAGE);

  return {
    ...archive,
    posts,
    pagination: buildCategoryPagination(archive.href, page, pageCount),
  };
}

export function buildSearchArchiveFromDatabase(query: string): IaaCategoryArchiveData {
  const encodedQuery = encodeURIComponent(query);
  const { matches } = rankSearchEntries(query);

  return {
    slug: "search",
    label: "Search",
    href: `/search?s=${encodedQuery}`,
    title: query ? `Search Results for: ${query}` : "Search",
    posts: matches.map((match) => match.entry.post),
    pagination: [{ label: "1", href: `/search?s=${encodedQuery}`, current: true }],
  };
}

export function getSearchSuggestionsFromDatabase(
  query: string,
  limit = 6,
): IaaSearchSuggestion[] {
  if (!query.trim()) {
    return [];
  }

  return rankSearchEntries(query)
    .matches.slice(0, limit)
    .map((match) => ({
      title: match.entry.post.title,
      href: match.entry.post.href,
      image: match.entry.post.image,
      alt: match.entry.post.alt,
      excerpt: match.entry.post.excerpt,
    }));
}
