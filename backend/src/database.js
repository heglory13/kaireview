import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { hashPassword, verifyPassword } from "./auth.js";
import { seedJobs } from "./seed-data.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const defaultDatabasePath = resolve(currentDirectory, "../data/fptjobs.sqlite");

const resolveDatabasePath = () => {
  const configuredPath = process.env.SQLITE_PATH;

  if (!configuredPath) {
    return defaultDatabasePath;
  }

  return isAbsolute(configuredPath) ? configuredPath : resolve(process.cwd(), configuredPath);
};

export const databasePath = resolveDatabasePath();

mkdirSync(dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);

const jobColumns = `
  id,
  slug,
  title,
  location,
  deadline,
  salary,
  href,
  hot,
  department,
  employment_type,
  level,
  description,
  requirements_json,
  benefits_json,
  created_at,
  updated_at
`;

const toSlug = (href) => {
  const url = new URL(href, "https://fptjobs.com");
  return url.pathname.replace(/^\/+|\/+$/g, "");
};

const slugifyText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createUniqueJobSlug = (value) => {
  const baseSlug = slugifyText(value) || `viec-lam-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 2;

  while (database.prepare("SELECT 1 FROM jobs WHERE slug = ?").get(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const toBoolean = (value) => value === true || value === 1;

const parseJsonArray = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseJsonObject = (value) => {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const createFallbackApplicationProfileSnapshot = (row) => ({
  fullName: row.profile_full_name ?? row.full_name,
  email: row.profile_email ?? row.email,
  phone: row.profile_phone ?? row.phone,
  gender: row.profile_gender ?? "",
  birthday: row.profile_birthday ?? "",
  address: row.profile_address ?? "",
  currentCity: row.profile_current_city ?? "",
  currentWard: row.profile_current_ward ?? "",
  desiredCity: row.profile_desired_city ?? "",
  desiredWard: row.profile_desired_ward ?? "",
  educationLevel: row.profile_education_level ?? "",
  school: row.profile_school ?? "",
  major: row.profile_major ?? "",
  graduationYear: row.profile_graduation_year ?? "",
  gpa: row.profile_gpa ?? "",
  resumeUrl: row.profile_resume_url ?? row.resume_url ?? "",
  updatedAt: row.profile_updated_at ?? "",
});

const normalizeProfileSnapshotValue = (value) =>
  typeof value === "string" ? value.trim() : value ?? "";

const mergeApplicationProfileSnapshot = (storedProfileSnapshot, row) => {
  const fallbackProfileSnapshot = createFallbackApplicationProfileSnapshot(row);

  return Object.fromEntries(
    Object.entries(fallbackProfileSnapshot).map(([field, fallbackValue]) => {
      const storedValue = normalizeProfileSnapshotValue(storedProfileSnapshot[field]);

      return [field, storedValue || normalizeProfileSnapshotValue(fallbackValue)];
    }),
  );
};

const mapJob = (row) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  location: row.location,
  deadline: row.deadline,
  salary: row.salary,
  href: row.href,
  hot: toBoolean(row.hot),
  department: row.department,
  employmentType: row.employment_type,
  level: row.level,
  description: row.description,
  requirements: parseJsonArray(row.requirements_json),
  benefits: parseJsonArray(row.benefits_json),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapApplication = (row) => {
  const storedProfileSnapshot = parseJsonObject(row.profile_snapshot_json);
  const profileSnapshot = mergeApplicationProfileSnapshot(storedProfileSnapshot, row);

  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    resumeUrl: row.resume_url,
    coverLetter: row.cover_letter,
    profileSnapshot,
    status: row.status,
    createdAt: row.created_at,
    job: {
      id: row.job_id,
      slug: row.job_slug,
      title: row.job_title,
      location: row.job_location,
    },
  };
};

const mapUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeEmail = (email) => email.trim().toLowerCase();

const mapCandidateProfile = (user, row) => ({
  fullName: row?.full_name ?? user.fullName,
  email: row?.email ?? user.email,
  phone: row?.phone ?? "",
  gender: row?.gender ?? "",
  birthday: row?.birthday ?? "",
  address: row?.address ?? "",
  currentCity: row?.current_city ?? "",
  currentWard: row?.current_ward ?? "",
  desiredCity: row?.desired_city ?? "",
  desiredWard: row?.desired_ward ?? "",
  educationLevel: row?.education_level ?? "",
  school: row?.school ?? "",
  major: row?.major ?? "",
  graduationYear: row?.graduation_year ?? "",
  gpa: row?.gpa ?? "",
  resumeUrl: row?.resume_url ?? "",
  updatedAt: row?.profile_updated_at ?? user.updatedAt,
});

const clampPaginationNumber = (value, fallback, min, max) => {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
};

const normalizeHotFilter = (value) => {
  if (value === "true" || value === "1") {
    return 1;
  }

  if (value === "false" || value === "0") {
    return 0;
  }

  return null;
};

const ensureTextColumn = (tableName, columnName) => {
  const columns = database.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} TEXT NOT NULL DEFAULT ''`);
  }
};

const ensureIntegerColumn = (tableName, columnName) => {
  const columns = database.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} INTEGER`);
  }
};

export const initializeDatabase = () => {
  database.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      deadline TEXT NOT NULL,
      salary TEXT NOT NULL,
      href TEXT NOT NULL,
      hot INTEGER NOT NULL DEFAULT 0,
      department TEXT NOT NULL DEFAULT 'Tuyển dụng',
      employment_type TEXT NOT NULL DEFAULT 'Toàn thời gian',
      level TEXT NOT NULL DEFAULT 'Nhân viên',
      description TEXT NOT NULL DEFAULT '',
      requirements_json TEXT NOT NULL DEFAULT '[]',
      benefits_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      user_id INTEGER,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      resume_url TEXT,
      cover_letter TEXT,
      profile_snapshot_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'candidate',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidate_profiles (
      user_id INTEGER PRIMARY KEY,
      phone TEXT NOT NULL DEFAULT '',
      gender TEXT NOT NULL DEFAULT '',
      birthday TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      current_city TEXT NOT NULL DEFAULT '',
      current_ward TEXT NOT NULL DEFAULT '',
      desired_city TEXT NOT NULL DEFAULT '',
      desired_ward TEXT NOT NULL DEFAULT '',
      education_level TEXT NOT NULL DEFAULT '',
      school TEXT NOT NULL DEFAULT '',
      major TEXT NOT NULL DEFAULT '',
      graduation_year TEXT NOT NULL DEFAULT '',
      gpa TEXT NOT NULL DEFAULT '',
      resume_url TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS jobs_location_idx ON jobs(location);
    CREATE INDEX IF NOT EXISTS jobs_department_idx ON jobs(department);
    CREATE INDEX IF NOT EXISTS jobs_hot_idx ON jobs(hot);
    CREATE INDEX IF NOT EXISTS applications_job_id_idx ON applications(job_id);
    CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);
    CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
  `);

  ensureTextColumn("candidate_profiles", "current_city");
  ensureTextColumn("candidate_profiles", "current_ward");
  ensureTextColumn("candidate_profiles", "desired_city");
  ensureTextColumn("candidate_profiles", "desired_ward");
  ensureTextColumn("candidate_profiles", "resume_url");
  ensureIntegerColumn("applications", "user_id");
  ensureTextColumn("applications", "profile_snapshot_json");

  const statement = database.prepare(`
    INSERT INTO jobs (
      slug,
      title,
      location,
      deadline,
      salary,
      href,
      hot,
      department,
      employment_type,
      level,
      description,
      requirements_json,
      benefits_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      location = excluded.location,
      deadline = excluded.deadline,
      salary = excluded.salary,
      href = excluded.href,
      hot = excluded.hot,
      department = excluded.department,
      employment_type = excluded.employment_type,
      level = excluded.level,
      description = excluded.description,
      requirements_json = excluded.requirements_json,
      benefits_json = excluded.benefits_json,
      updated_at = CURRENT_TIMESTAMP
  `);

  database.exec("BEGIN");

  try {
    for (const job of seedJobs) {
      statement.run(
        toSlug(job.href),
        job.title,
        job.location,
        job.deadline,
        job.salary,
        job.href,
        job.hot ? 1 : 0,
        job.department,
        job.employmentType,
        job.level,
        job.description,
        JSON.stringify(job.requirements),
        JSON.stringify(job.benefits),
      );
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
};

export const getDatabaseStats = () => {
  const jobs = database.prepare("SELECT COUNT(*) AS count FROM jobs").get().count;
  const applications = database.prepare("SELECT COUNT(*) AS count FROM applications").get().count;
  const users = database.prepare("SELECT COUNT(*) AS count FROM users").get().count;

  return {
    jobs,
    applications,
    users,
  };
};

export const getUserById = (id) => {
  const row = database
    .prepare(
      `
        SELECT id, full_name, email, role, created_at, updated_at
        FROM users
        WHERE id = ?
      `,
    )
    .get(id);

  return row ? mapUser(row) : null;
};

export const createUser = ({ fullName, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = database
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(normalizedEmail);

  if (existingUser) {
    return {
      error: "email_exists",
    };
  }

  const passwordData = hashPassword(password);
  const result = database
    .prepare(
      `
        INSERT INTO users (
          full_name,
          email,
          password_hash,
          password_salt
        )
        VALUES (?, ?, ?, ?)
      `,
    )
    .run(fullName, normalizedEmail, passwordData.hash, passwordData.salt);

  return {
    user: getUserById(Number(result.lastInsertRowid)),
  };
};

export const authenticateUser = ({ email, password }) => {
  const row = database
    .prepare(
      `
        SELECT
          id,
          full_name,
          email,
          password_hash,
          password_salt,
          role,
          created_at,
          updated_at
        FROM users
        WHERE email = ?
      `,
    )
    .get(normalizeEmail(email));

  if (!row || !verifyPassword(password, row.password_salt, row.password_hash)) {
    return null;
  }

  return mapUser(row);
};

export const changeUserPassword = ({ userId, currentPassword, newPassword }) => {
  const row = database
    .prepare(
      `
        SELECT
          id,
          password_hash,
          password_salt
        FROM users
        WHERE id = ?
      `,
    )
    .get(userId);

  if (!row || !verifyPassword(currentPassword, row.password_salt, row.password_hash)) {
    return {
      error: "invalid_current_password",
    };
  }

  const passwordData = hashPassword(newPassword);
  database
    .prepare(
      `
        UPDATE users
        SET
          password_hash = ?,
          password_salt = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    )
    .run(passwordData.hash, passwordData.salt, userId);

  return {
    user: getUserById(userId),
  };
};

export const getCandidateProfile = (userId) => {
  const user = getUserById(userId);

  if (!user) {
    return null;
  }

  const row = database
    .prepare(
      `
        SELECT
          users.full_name,
          users.email,
          candidate_profiles.phone,
          candidate_profiles.gender,
          candidate_profiles.birthday,
          candidate_profiles.address,
          candidate_profiles.current_city,
          candidate_profiles.current_ward,
          candidate_profiles.desired_city,
          candidate_profiles.desired_ward,
          candidate_profiles.education_level,
          candidate_profiles.school,
          candidate_profiles.major,
          candidate_profiles.graduation_year,
          candidate_profiles.gpa,
          candidate_profiles.resume_url,
          candidate_profiles.updated_at AS profile_updated_at
        FROM users
        LEFT JOIN candidate_profiles ON candidate_profiles.user_id = users.id
        WHERE users.id = ?
      `,
    )
    .get(userId);

  return mapCandidateProfile(user, row);
};

export const updateCandidateProfile = (userId, profile) => {
  const currentUser = getUserById(userId);

  if (!currentUser) {
    return null;
  }

  database.exec("BEGIN");

  try {
    database
      .prepare(
        `
          UPDATE users
          SET full_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
      )
      .run(profile.fullName, normalizeEmail(profile.email), userId);

    database
      .prepare(
        `
          INSERT INTO candidate_profiles (
            user_id,
            phone,
            gender,
            birthday,
            address,
            current_city,
            current_ward,
            desired_city,
            desired_ward,
            education_level,
            school,
            major,
            graduation_year,
            gpa,
            resume_url,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(user_id) DO UPDATE SET
            phone = excluded.phone,
            gender = excluded.gender,
            birthday = excluded.birthday,
            address = excluded.address,
            current_city = excluded.current_city,
            current_ward = excluded.current_ward,
            desired_city = excluded.desired_city,
            desired_ward = excluded.desired_ward,
            education_level = excluded.education_level,
            school = excluded.school,
            major = excluded.major,
            graduation_year = excluded.graduation_year,
            gpa = excluded.gpa,
            resume_url = excluded.resume_url,
            updated_at = CURRENT_TIMESTAMP
        `,
      )
      .run(
        userId,
        profile.phone,
        profile.gender,
        profile.birthday,
        profile.address,
        profile.currentCity,
        profile.currentWard,
        profile.desiredCity,
        profile.desiredWard,
        profile.educationLevel,
        profile.school,
        profile.major,
        profile.graduationYear,
        profile.gpa,
        profile.resumeUrl ?? "",
      );

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");

    if (error.code === "ERR_SQLITE_CONSTRAINT_UNIQUE") {
      return {
        error: "email_exists",
      };
    }

    throw error;
  }

  return {
    profile: getCandidateProfile(userId),
    user: getUserById(userId),
  };
};

export const updateCandidateResumeUrl = (userId, resumeUrl) => {
  const currentUser = getUserById(userId);

  if (!currentUser) {
    return null;
  }

  database
    .prepare(
      `
        INSERT INTO candidate_profiles (
          user_id,
          resume_url,
          updated_at
        )
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          resume_url = excluded.resume_url,
          updated_at = CURRENT_TIMESTAMP
      `,
    )
    .run(userId, resumeUrl);

  return {
    profile: getCandidateProfile(userId),
    user: getUserById(userId),
  };
};

export const getAdminSettings = () => {
  const notificationEmailsRow = database.prepare("SELECT value FROM admin_settings WHERE key = ?").get("notification_emails");
  const adminEmailRow = database.prepare("SELECT value FROM admin_settings WHERE key = ?").get("admin_email");

  return {
    adminEmail:
      typeof adminEmailRow?.value === "string" && adminEmailRow.value.trim()
        ? adminEmailRow.value.trim()
        : process.env.ADMIN_EMAIL ?? "admin@fptjobs.com",
    notificationEmails: typeof notificationEmailsRow?.value === "string" ? notificationEmailsRow.value : "",
  };
};

const getAdminPasswordCredentials = () => {
  const hashRow = database.prepare("SELECT value FROM admin_settings WHERE key = ?").get("admin_password_hash");
  const saltRow = database.prepare("SELECT value FROM admin_settings WHERE key = ?").get("admin_password_salt");

  return {
    hash: typeof hashRow?.value === "string" ? hashRow.value : "",
    salt: typeof saltRow?.value === "string" ? saltRow.value : "",
  };
};

const setAdminSetting = (key, value) => {
  database
    .prepare(
      `
        INSERT INTO admin_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = CURRENT_TIMESTAMP
      `,
    )
    .run(key, value);
};

export const authenticateAdmin = ({ email, password }) => {
  const settings = getAdminSettings();
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== settings.adminEmail.trim().toLowerCase()) {
    return null;
  }

  const credentials = getAdminPasswordCredentials();
  const isValidPassword =
    credentials.hash && credentials.salt
      ? verifyPassword(password, credentials.salt, credentials.hash)
      : password === (process.env.ADMIN_PASSWORD ?? "Admin@123");

  return isValidPassword
    ? {
        email: settings.adminEmail,
      }
    : null;
};

export const updateAdminSettings = ({ adminEmail, currentPassword, newPassword, notificationEmails }) => {
  const normalizedNotificationEmails =
    typeof notificationEmails === "string" ? notificationEmails.trim() : "";
  const currentSettings = getAdminSettings();
  const normalizedAdminEmail = typeof adminEmail === "string" && adminEmail.trim() ? adminEmail.trim() : currentSettings.adminEmail;
  const shouldUpdateAdminEmail = normalizedAdminEmail.toLowerCase() !== currentSettings.adminEmail.toLowerCase();
  const shouldUpdatePassword = typeof newPassword === "string" && newPassword.length > 0;

  if (shouldUpdateAdminEmail || shouldUpdatePassword) {
    if (!currentPassword || !authenticateAdmin({ email: currentSettings.adminEmail, password: currentPassword })) {
      return {
        error: "invalid_current_password",
      };
    }
  }

  setAdminSetting("notification_emails", normalizedNotificationEmails);

  if (shouldUpdateAdminEmail) {
    setAdminSetting("admin_email", normalizedAdminEmail);
  }

  if (shouldUpdatePassword) {
    const passwordData = hashPassword(newPassword);
    setAdminSetting("admin_password_hash", passwordData.hash);
    setAdminSetting("admin_password_salt", passwordData.salt);
  }

  return getAdminSettings();
};

export const listJobs = (filters = {}) => {
  const clauses = [];
  const parameters = [];
  const limit = clampPaginationNumber(filters.limit, 20, 1, 100);
  const offset = clampPaginationNumber(filters.offset, 0, 0, 100000);
  const hot = normalizeHotFilter(filters.hot);

  if (filters.q) {
    const search = `%${filters.q.trim()}%`;
    clauses.push("(title LIKE ? OR location LIKE ? OR department LIKE ?)");
    parameters.push(search, search, search);
  }

  if (filters.location) {
    clauses.push("location = ?");
    parameters.push(filters.location.trim());
  }

  if (filters.department) {
    clauses.push("department = ?");
    parameters.push(filters.department.trim());
  }

  if (hot !== null) {
    clauses.push("hot = ?");
    parameters.push(hot);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = database
    .prepare(
      `
        SELECT ${jobColumns}
        FROM jobs
        ${where}
        ORDER BY hot DESC, id ASC
        LIMIT ? OFFSET ?
      `,
    )
    .all(...parameters, limit, offset);
  const total = database
    .prepare(`SELECT COUNT(*) AS count FROM jobs ${where}`)
    .get(...parameters).count;

  return {
    data: rows.map(mapJob),
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + rows.length < total,
    },
  };
};

export const getJobBySlug = (slug) => {
  const row = database
    .prepare(
      `
        SELECT ${jobColumns}
        FROM jobs
        WHERE slug = ?
      `,
    )
    .get(slug);

  return row ? mapJob(row) : null;
};

export const getJobsMeta = () => {
  const locations = database
    .prepare(
      `
        SELECT location, COUNT(*) AS count
        FROM jobs
        GROUP BY location
        ORDER BY location ASC
      `,
    )
    .all();
  const departments = database
    .prepare(
      `
        SELECT department, COUNT(*) AS count
        FROM jobs
        GROUP BY department
        ORDER BY department ASC
      `,
    )
    .all();
  const hotJobs = database.prepare("SELECT COUNT(*) AS count FROM jobs WHERE hot = 1").get().count;

  return {
    locations,
    departments,
    hotJobs,
  };
};

export const createApplication = (payload) => {
  let job = payload.jobSlug
    ? database.prepare("SELECT id FROM jobs WHERE slug = ?").get(payload.jobSlug)
    : payload.jobId !== null && payload.jobId !== undefined
      ? database.prepare("SELECT id FROM jobs WHERE id = ?").get(payload.jobId)
      : null;

  if (!job && payload.jobTitle) {
    const slug = createUniqueJobSlug(payload.jobSlug || payload.jobTitle);
    const result = database
      .prepare(
        `
          INSERT INTO jobs (
            slug,
            title,
            location,
            deadline,
            salary,
            href,
            hot,
            department,
            employment_type,
            level
          )
          VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
        `,
      )
      .run(
        slug,
        payload.jobTitle,
        payload.jobLocation || "Toàn quốc",
        "Cập nhật",
        "Lương thỏa thuận",
        `/${slug}`,
        "Tuyển dụng",
        "Toàn thời gian",
        "Nhân viên",
      );

    job = { id: Number(result.lastInsertRowid) };
  }

  if (!job) {
    return null;
  }

  const result = database
    .prepare(
      `
        INSERT INTO applications (
          job_id,
          user_id,
          full_name,
          email,
          phone,
          resume_url,
          cover_letter,
          profile_snapshot_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      job.id,
      payload.userId ?? null,
      payload.fullName,
      payload.email,
      payload.phone,
      payload.resumeUrl ?? null,
      payload.coverLetter ?? null,
      JSON.stringify(payload.profileSnapshot ?? {}),
    );

  return getApplicationById(Number(result.lastInsertRowid));
};

export const getApplicationById = (id) => {
  const row = database
    .prepare(
      `
        SELECT
          applications.id,
          applications.user_id,
          applications.full_name,
          applications.email,
          applications.phone,
          applications.resume_url,
          applications.cover_letter,
          applications.profile_snapshot_json,
          applications.status,
          applications.created_at,
          jobs.id AS job_id,
          jobs.slug AS job_slug,
          jobs.title AS job_title,
          jobs.location AS job_location,
          COALESCE(application_users.full_name, email_users.full_name) AS profile_full_name,
          COALESCE(application_users.email, email_users.email) AS profile_email,
          candidate_profiles.phone AS profile_phone,
          candidate_profiles.gender AS profile_gender,
          candidate_profiles.birthday AS profile_birthday,
          candidate_profiles.address AS profile_address,
          candidate_profiles.current_city AS profile_current_city,
          candidate_profiles.current_ward AS profile_current_ward,
          candidate_profiles.desired_city AS profile_desired_city,
          candidate_profiles.desired_ward AS profile_desired_ward,
          candidate_profiles.education_level AS profile_education_level,
          candidate_profiles.school AS profile_school,
          candidate_profiles.major AS profile_major,
          candidate_profiles.graduation_year AS profile_graduation_year,
          candidate_profiles.gpa AS profile_gpa,
          candidate_profiles.resume_url AS profile_resume_url,
          candidate_profiles.updated_at AS profile_updated_at
        FROM applications
        INNER JOIN jobs ON jobs.id = applications.job_id
        LEFT JOIN users AS application_users ON application_users.id = applications.user_id
        LEFT JOIN users AS email_users ON lower(email_users.email) = lower(applications.email)
        LEFT JOIN candidate_profiles ON candidate_profiles.user_id = COALESCE(application_users.id, email_users.id)
        WHERE applications.id = ?
      `,
    )
    .get(id);

  return row ? mapApplication(row) : null;
};

export const listApplications = (filters = {}) => {
  const clauses = [];
  const parameters = [];
  const limit = clampPaginationNumber(filters.limit, 20, 1, 100);
  const offset = clampPaginationNumber(filters.offset, 0, 0, 100000);

  if (filters.jobSlug) {
    clauses.push("jobs.slug = ?");
    parameters.push(filters.jobSlug.trim());
  }

  if (filters.status) {
    clauses.push("applications.status = ?");
    parameters.push(filters.status.trim());
  }

  if (filters.userId && filters.userEmail) {
    clauses.push("(applications.user_id = ? OR lower(applications.email) = lower(?))");
    parameters.push(filters.userId, filters.userEmail.trim());
  } else if (filters.userId) {
    clauses.push("applications.user_id = ?");
    parameters.push(filters.userId);
  } else if (filters.userEmail) {
    clauses.push("lower(applications.email) = lower(?)");
    parameters.push(filters.userEmail.trim());
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = database
    .prepare(
      `
        SELECT
          applications.id,
          applications.user_id,
          applications.full_name,
          applications.email,
          applications.phone,
          applications.resume_url,
          applications.cover_letter,
          applications.profile_snapshot_json,
          applications.status,
          applications.created_at,
          jobs.id AS job_id,
          jobs.slug AS job_slug,
          jobs.title AS job_title,
          jobs.location AS job_location,
          COALESCE(application_users.full_name, email_users.full_name) AS profile_full_name,
          COALESCE(application_users.email, email_users.email) AS profile_email,
          candidate_profiles.phone AS profile_phone,
          candidate_profiles.gender AS profile_gender,
          candidate_profiles.birthday AS profile_birthday,
          candidate_profiles.address AS profile_address,
          candidate_profiles.current_city AS profile_current_city,
          candidate_profiles.current_ward AS profile_current_ward,
          candidate_profiles.desired_city AS profile_desired_city,
          candidate_profiles.desired_ward AS profile_desired_ward,
          candidate_profiles.education_level AS profile_education_level,
          candidate_profiles.school AS profile_school,
          candidate_profiles.major AS profile_major,
          candidate_profiles.graduation_year AS profile_graduation_year,
          candidate_profiles.gpa AS profile_gpa,
          candidate_profiles.resume_url AS profile_resume_url,
          candidate_profiles.updated_at AS profile_updated_at
        FROM applications
        INNER JOIN jobs ON jobs.id = applications.job_id
        LEFT JOIN users AS application_users ON application_users.id = applications.user_id
        LEFT JOIN users AS email_users ON lower(email_users.email) = lower(applications.email)
        LEFT JOIN candidate_profiles ON candidate_profiles.user_id = COALESCE(application_users.id, email_users.id)
        ${where}
        ORDER BY applications.created_at DESC, applications.id DESC
        LIMIT ? OFFSET ?
      `,
    )
    .all(...parameters, limit, offset);
  const total = database
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM applications
        INNER JOIN jobs ON jobs.id = applications.job_id
        ${where}
      `,
    )
    .get(...parameters).count;

  return {
    data: rows.map(mapApplication),
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + rows.length < total,
    },
  };
};

export const updateApplicationStatus = (id, status) => {
  const result = database
    .prepare("UPDATE applications SET status = ? WHERE id = ?")
    .run(status, id);

  if (result.changes === 0) {
    return null;
  }

  return getApplicationById(id);
};
