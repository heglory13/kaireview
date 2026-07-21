import "./env.js";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAuthToken, verifyAuthToken } from "./auth.js";
import {
  authenticateAdmin,
  authenticateUser,
  changeUserPassword,
  createApplication,
  createUser,
  databasePath,
  getCandidateProfile,
  getApplicationById,
  getAdminSettings,
  getDatabaseStats,
  getJobBySlug,
  getJobsMeta,
  getUserById,
  initializeDatabase,
  listApplications,
  listJobs,
  updateCandidateProfile,
  updateCandidateResumeUrl,
  updateAdminSettings,
  updateApplicationStatus,
} from "./database.js";
import { isMailConfigured, sendMail } from "./mailer.js";

const port = Number(process.env.PORT ?? 4000);
const isCorsOriginConfigured = typeof process.env.CORS_ORIGIN === "string";
const defaultCorsOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];
const allowedOrigins = (process.env.CORS_ORIGIN ?? defaultCorsOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedStatuses = new Set(["new", "reviewing", "interview", "offer", "hired", "rejected"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fallbackAdminNotificationEmail =
  process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL ?? process.env.SMTP_FROM ?? "";
const maxJsonBodySize = 1024 * 1024;
const maxMultipartBodySize = 20 * 1024 * 1024;
const uploadedCvDirectory = fileURLToPath(new URL("../uploads/applications/", import.meta.url));
const uploadedCvUrlPrefix = "/uploads/applications";
const allowedCvExtensions = new Set([".pdf", ".doc", ".docx"]);
const applicationProfileFields = [
  ["fullName", "Họ và tên"],
  ["email", "Email"],
  ["phone", "Số điện thoại"],
  ["birthday", "Ngày sinh"],
  ["address", "Địa chỉ"],
  ["currentCity", "Tỉnh/thành hiện tại"],
  ["currentWard", "Xã/phường hiện tại"],
  ["desiredCity", "Tỉnh/thành mong muốn"],
  ["desiredWard", "Xã/phường mong muốn"],
  ["educationLevel", "Trình độ học vấn"],
  ["school", "Trường"],
  ["major", "Chuyên ngành"],
  ["resumeUrl", "CV/Hồ sơ"],
  ["updatedAt", "Cập nhật profile lúc"],
];

const getCorsOrigin = (request) => {
  if (allowedOrigins.includes("*")) {
    return "*";
  }

  const requestOrigin = request.headers.origin;

  if (!isCorsOriginConfigured && requestOrigin) {
    try {
      const originUrl = new URL(requestOrigin);

      if (
        originUrl.protocol.startsWith("http") &&
        ["localhost", "127.0.0.1"].includes(originUrl.hostname)
      ) {
        return requestOrigin;
      }
    } catch {
      // Fall back to the configured allowlist for malformed Origin values.
    }
  }

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] ?? "http://localhost:3000";
};

const getCorsHeaders = (request) => ({
  "Access-Control-Allow-Origin": getCorsOrigin(request),
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  Vary: "Origin",
});

const sendJson = (request, response, statusCode, payload) => {
  response.writeHead(statusCode, {
    ...getCorsHeaders(request),
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
};

const sendError = (request, response, statusCode, message, details) => {
  sendJson(request, response, statusCode, {
    error: {
      message,
      ...(details ? { details } : {}),
    },
  });
};

const readRequestBuffer = async (request, maxSize) => {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;

    if (size > maxSize) {
      const error = new Error("Request body is too large");
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

const readJsonBody = async (request) => {
  const body = await readRequestBuffer(request, maxJsonBodySize);

  if (body.length === 0) {
    return {};
  }

  try {
    return JSON.parse(body.toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON");
    error.statusCode = 400;
    throw error;
  }
};

const parseContentDisposition = (headerValue) => {
  const result = {};

  for (const part of headerValue.split(";")) {
    const [rawKey, ...rawValueParts] = part.trim().split("=");
    const key = rawKey.trim().toLowerCase();
    const rawValue = rawValueParts.join("=");

    if (!key || !rawValue) {
      continue;
    }

    result[key] = rawValue.trim().replace(/^"|"$/g, "");
  }

  return result;
};

const parseMultipartBody = async (request) => {
  const contentType = request.headers["content-type"] ?? "";
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

  if (!boundaryMatch) {
    const error = new Error("Multipart boundary is missing");
    error.statusCode = 400;
    throw error;
  }

  const boundary = boundaryMatch[1] ?? boundaryMatch[2];
  const body = (await readRequestBuffer(request, maxMultipartBodySize)).toString("latin1");
  const sections = body.split(`--${boundary}`);
  const fields = {};
  const files = {};

  for (const section of sections) {
    const trimmedSection = section.replace(/^\r\n/, "").replace(/\r\n$/, "");

    if (!trimmedSection || trimmedSection === "--") {
      continue;
    }

    const headerEndIndex = trimmedSection.indexOf("\r\n\r\n");

    if (headerEndIndex === -1) {
      continue;
    }

    const headerLines = trimmedSection.slice(0, headerEndIndex).split("\r\n");
    const content = trimmedSection.slice(headerEndIndex + 4);
    const headers = Object.fromEntries(
      headerLines.map((line) => {
        const [name, ...valueParts] = line.split(":");
        return [name.trim().toLowerCase(), valueParts.join(":").trim()];
      }),
    );
    const disposition = parseContentDisposition(headers["content-disposition"] ?? "");
    const fieldName = disposition.name;

    if (!fieldName) {
      continue;
    }

    if (disposition.filename) {
      files[fieldName] = {
        buffer: Buffer.from(content, "latin1"),
        contentType: headers["content-type"] ?? "application/octet-stream",
        filename: disposition.filename,
      };
      continue;
    }

    fields[fieldName] = Buffer.from(content, "latin1").toString("utf8");
  }

  return { fields, files };
};

const sanitizeUploadFilename = (filename) => {
  const extension = extname(filename).toLowerCase();

  if (!allowedCvExtensions.has(extension)) {
    const error = new Error("CV file must be PDF, DOC, or DOCX");
    error.statusCode = 400;
    throw error;
  }

  const safeBase = filename
    .slice(0, Math.max(0, filename.length - extension.length))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${safeBase || "cv"}-${randomUUID()}${extension}`;
};

const saveApplicationCv = async (file) => {
  if (!file?.buffer?.length) {
    return null;
  }

  const filename = sanitizeUploadFilename(file.filename);

  await mkdir(uploadedCvDirectory, { recursive: true });
  await writeFile(join(uploadedCvDirectory, filename), file.buffer);

  return `${uploadedCvUrlPrefix}/${filename}`;
};

const readApplicationBody = async (request) => {
  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return readJsonBody(request);
  }

  const { fields, files } = await parseMultipartBody(request);
  const resumeUrl = await saveApplicationCv(files.cv ?? files.resume ?? files.file);

  return {
    ...fields,
    resumeUrl: resumeUrl ?? fields.resumeUrl,
  };
};

const requireString = (body, field, label, errors) => {
  if (typeof body[field] !== "string" || body[field].trim().length === 0) {
    errors[field] = `${label} is required`;
    return "";
  }

  return body[field].trim();
};

const validateApplicationPayload = (body) => {
  const errors = {};
  const fullName = requireString(body, "fullName", "Full name", errors);
  const email = requireString(body, "email", "Email", errors);
  const phone = requireString(body, "phone", "Phone", errors);
  const jobSlug = typeof body.jobSlug === "string" ? body.jobSlug.trim() : "";
  const parsedJobId =
    typeof body.jobId === "string" && body.jobId.trim()
      ? Number.parseInt(body.jobId, 10)
      : null;
  const jobId =
    typeof body.jobId === "number"
      ? body.jobId
      : parsedJobId && !Number.isNaN(parsedJobId)
        ? parsedJobId
        : null;
  const jobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim() : "";
  const jobLocation = typeof body.jobLocation === "string" ? body.jobLocation.trim() : "";

  if (!jobSlug && !jobId && !jobTitle) {
    errors.job = "jobSlug, jobId, or jobTitle is required";
  }

  if (email && !emailPattern.test(email)) {
    errors.email = "Email is invalid";
  }

  if (phone && !/^[0-9+().\-\s]{8,20}$/.test(phone)) {
    errors.phone = "Phone is invalid";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    value: {
      fullName,
      email,
      phone,
      jobSlug: jobSlug || null,
      jobId,
      jobTitle: jobTitle || null,
      jobLocation: jobLocation || null,
      resumeUrl: typeof body.resumeUrl === "string" ? body.resumeUrl.trim() || null : null,
      coverLetter:
        typeof body.coverLetter === "string" ? body.coverLetter.trim() || null : null,
      gender: optionalString(body, "gender"),
      birthday: optionalString(body, "birthday"),
      address: optionalString(body, "address"),
      currentCity: optionalString(body, "currentCity"),
      currentWard: optionalString(body, "currentWard"),
      desiredCity: optionalString(body, "desiredCity"),
      desiredWard: optionalString(body, "desiredWard"),
      educationLevel: optionalString(body, "educationLevel"),
      school: optionalString(body, "school"),
      major: optionalString(body, "major"),
      graduationYear: optionalString(body, "graduationYear"),
      gpa: optionalString(body, "gpa"),
    },
  };
};

const validateRegisterPayload = (body) => {
  const errors = {};
  const fullName = requireString(body, "fullName", "Full name", errors);
  const email = requireString(body, "email", "Email", errors);
  const password = requireString(body, "password", "Password", errors);

  if (email && !emailPattern.test(email)) {
    errors.email = "Email is invalid";
  }

  if (password && password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (typeof body.confirmPassword === "string" && body.confirmPassword !== password) {
    errors.confirmPassword = "Password confirmation does not match";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    value: {
      fullName,
      email,
      password,
    },
  };
};

const validateLoginPayload = (body) => {
  const errors = {};
  const email = requireString(body, "email", "Email", errors);
  const password = requireString(body, "password", "Password", errors);

  if (email && !emailPattern.test(email)) {
    errors.email = "Email is invalid";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    value: {
      email,
      password,
    },
  };
};

const validateChangePasswordPayload = (body) => {
  const errors = {};
  const currentPassword = requireString(body, "currentPassword", "Current password", errors);
  const newPassword = requireString(body, "newPassword", "New password", errors);
  const confirmNewPassword = requireString(body, "confirmNewPassword", "Password confirmation", errors);

  if (newPassword && newPassword.length < 8) {
    errors.newPassword = "New password must be at least 8 characters";
  }

  if (newPassword && confirmNewPassword && confirmNewPassword !== newPassword) {
    errors.confirmNewPassword = "Password confirmation does not match";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    value: {
      currentPassword,
      newPassword,
    },
  };
};

const optionalString = (body, field) => (typeof body[field] === "string" ? body[field].trim() : "");

const validateCandidateProfilePayload = (body) => {
  const errors = {};
  const fullName = requireString(body, "fullName", "Full name", errors);
  const email = requireString(body, "email", "Email", errors);
  const phone = optionalString(body, "phone");

  if (email && !emailPattern.test(email)) {
    errors.email = "Email is invalid";
  }

  if (phone && !/^[0-9+().\-\s]{8,20}$/.test(phone)) {
    errors.phone = "Phone is invalid";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    value: {
      fullName,
      email,
      phone,
      gender: optionalString(body, "gender"),
      birthday: optionalString(body, "birthday"),
      address: optionalString(body, "address"),
      currentCity: optionalString(body, "currentCity"),
      currentWard: optionalString(body, "currentWard"),
      desiredCity: optionalString(body, "desiredCity"),
      desiredWard: optionalString(body, "desiredWard"),
      educationLevel: optionalString(body, "educationLevel"),
      school: optionalString(body, "school"),
      major: optionalString(body, "major"),
      graduationYear: optionalString(body, "graduationYear"),
      gpa: optionalString(body, "gpa"),
      resumeUrl: optionalString(body, "resumeUrl"),
    },
  };
};

const validateStatusPayload = (body) => {
  if (typeof body.status !== "string" || !allowedStatuses.has(body.status)) {
    return {
      errors: {
        status: `Status must be one of: ${Array.from(allowedStatuses).join(", ")}`,
      },
    };
  }

  return {
    value: {
      status: body.status,
    },
  };
};

const parseNotificationEmails = (value) =>
  String(value ?? "")
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean);

const validateAdminSettingsPayload = (body) => {
  const notificationEmails =
    typeof body.notificationEmails === "string" ? body.notificationEmails.trim() : "";
  const adminEmail = typeof body.adminEmail === "string" ? body.adminEmail.trim() : "";
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
  const emails = parseNotificationEmails(notificationEmails);
  const invalidEmails = emails.filter((email) => !emailPattern.test(email));
  const errors = {};

  if (invalidEmails.length > 0) {
    errors.notificationEmails = `Email chưa hợp lệ: ${invalidEmails.join(", ")}`;
  }

  if (adminEmail && !emailPattern.test(adminEmail)) {
    errors.adminEmail = "Email admin chưa hợp lệ";
  }

  if (newPassword || confirmPassword) {
    if (!currentPassword) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (newPassword.length < 8) {
      errors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự";
    }

    if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    value: {
      adminEmail,
      confirmPassword,
      currentPassword,
      newPassword,
      notificationEmails: emails.join(","),
    },
  };
};

const getProfileString = (profile, field) => {
  const value = profile?.[field];

  return typeof value === "string" ? value.trim() : "";
};

const getApplicationProfileString = (candidateProfile, application, field) =>
  getProfileString(application, field) || getProfileString(candidateProfile, field);

const createApplicationProfileSnapshot = (candidateProfile, application) => ({
  fullName: application.fullName,
  email: application.email,
  phone: application.phone,
  gender: getApplicationProfileString(candidateProfile, application, "gender"),
  birthday: getApplicationProfileString(candidateProfile, application, "birthday"),
  address: getApplicationProfileString(candidateProfile, application, "address"),
  currentCity: getApplicationProfileString(candidateProfile, application, "currentCity"),
  currentWard: getApplicationProfileString(candidateProfile, application, "currentWard"),
  desiredCity: getApplicationProfileString(candidateProfile, application, "desiredCity"),
  desiredWard: getApplicationProfileString(candidateProfile, application, "desiredWard"),
  educationLevel: getApplicationProfileString(candidateProfile, application, "educationLevel"),
  school: getApplicationProfileString(candidateProfile, application, "school"),
  major: getApplicationProfileString(candidateProfile, application, "major"),
  graduationYear: getApplicationProfileString(candidateProfile, application, "graduationYear"),
  gpa: getApplicationProfileString(candidateProfile, application, "gpa"),
  resumeUrl: application.resumeUrl ?? getProfileString(candidateProfile, "resumeUrl"),
  updatedAt: getProfileString(candidateProfile, "updatedAt"),
});

const requiredCandidateProfileFields = [
  ["fullName", "Họ và tên"],
  ["email", "Email"],
  ["phone", "Số điện thoại"],
  ["birthday", "Ngày sinh"],
  ["address", "Địa chỉ hiện tại"],
  ["currentCity", "Tỉnh/thành hiện tại"],
  ["currentWard", "Xã/phường hiện tại"],
  ["desiredCity", "Tỉnh/thành mong muốn"],
  ["desiredWard", "Xã/phường mong muốn"],
  ["educationLevel", "Trình độ học vấn"],
  ["school", "Trường"],
  ["major", "Chuyên ngành"],
];

const validateCandidateProfileCompleteness = (candidateProfile) => {
  const missingFields = [];

  for (const [field, label] of requiredCandidateProfileFields) {
    if (!getProfileString(candidateProfile, field)) {
      missingFields.push(label);
    }
  }

  if (!getProfileString(candidateProfile, "resumeUrl")) {
    missingFields.push("CV");
  }

  return missingFields;
};

const formatMajorValue = (value) => {
  try {
    const parsedValue = JSON.parse(value);

    if (Array.isArray(parsedValue)) {
      const majors = parsedValue.filter((item) => typeof item === "string" && item.trim().length > 0);

      return majors.length > 0 ? majors.join(", ") : "";
    }
  } catch {
    // Older profiles may store a single text value.
  }

  return value;
};

const formatApplicationProfileValue = (field, value, publicApiUrl) => {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    return "Chưa có";
  }

  if (field === "major") {
    return formatMajorValue(normalizedValue) || "Chưa có";
  }

  if (field === "resumeUrl" && normalizedValue.startsWith("/") && publicApiUrl) {
    return `${publicApiUrl}${normalizedValue}`;
  }

  return normalizedValue;
};

const formatEmailValue = (value) => {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  return normalizedValue || "Chưa có";
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatApplicationProfileEntries = (application, publicApiUrl) => {
  const profileSnapshot = {
    ...(application.profileSnapshot ?? {}),
    fullName: application.profileSnapshot?.fullName || application.fullName,
    email: application.profileSnapshot?.email || application.email,
    phone: application.profileSnapshot?.phone || application.phone,
    resumeUrl: application.profileSnapshot?.resumeUrl || application.resumeUrl || "",
  };

  return applicationProfileFields.map(
    ([field, label]) => [label, formatApplicationProfileValue(field, profileSnapshot[field], publicApiUrl)],
  );
};

const formatApplicationProfileLines = (application, publicApiUrl) =>
  formatApplicationProfileEntries(application, publicApiUrl).map(([label, value]) => `- ${label}: ${value}`);

const renderEmailValue = (value) => {
  const normalizedValue = formatEmailValue(value);
  const escapedValue = escapeHtml(normalizedValue);

  if (/^https?:\/\//i.test(normalizedValue)) {
    return `<a href="${escapedValue}" style="color:#1d4ed8;text-decoration:none;">${escapedValue}</a>`;
  }

  return escapedValue;
};

const renderEmailRows = (entries) =>
  entries
    .map(
      ([label, value]) => `
        <tr>
          <td style="width:220px;padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:15px;font-weight:600;line-height:1.5;">${renderEmailValue(value)}</td>
        </tr>`,
    )
    .join("");

const renderEmailSection = (title, entries) => `
  <section style="margin-top:18px;border:1px solid #dbe4f0;border-radius:12px;overflow:hidden;background:#ffffff;">
    <h2 style="margin:0;padding:14px 16px;background:#f8fafc;color:#0f2f5f;font-size:16px;line-height:1.3;">${escapeHtml(title)}</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
      ${renderEmailRows(entries)}
    </table>
  </section>`;

const createApplicationNotificationText = ({
  application,
  adminUrl,
  jobUrl,
  profileLines,
  resumeUrl,
}) =>
  [
    "FPT JOBS - HỒ SƠ ỨNG TUYỂN MỚI",
    "================================",
    "",
    "1. THÔNG TIN ỨNG VIÊN",
    `- Họ và tên: ${formatEmailValue(application.fullName)}`,
    `- Email: ${formatEmailValue(application.email)}`,
    `- Số điện thoại: ${formatEmailValue(application.phone)}`,
    "",
    "2. VỊ TRÍ ỨNG TUYỂN",
    `- Vị trí: ${formatEmailValue(application.job?.title)}`,
    `- Khu vực: ${formatEmailValue(application.job?.location)}`,
    `- Slug: ${formatEmailValue(application.job?.slug)}`,
    jobUrl ? `- Link bài tuyển dụng: ${jobUrl}` : "- Link bài tuyển dụng: Chưa có",
    "",
    "3. THÔNG TIN USER ĐÃ NỘP",
    ...profileLines,
    "",
    "4. CV / HỒ SƠ ĐÍNH KÈM",
    `- Link CV: ${formatEmailValue(resumeUrl)}`,
    "",
    "5. GHI CHÚ / CÂU TRẢ LỜI FORM",
    formatEmailValue(application.coverLetter),
    "",
    "6. THỜI GIAN",
    `- Nộp lúc: ${formatEmailValue(application.createdAt)}`,
    adminUrl ? `- Trang admin: ${adminUrl}` : "- Trang admin: Chưa cấu hình PUBLIC_SITE_URL",
  ].join("\n");

const createApplicationNotificationHtml = ({
  application,
  adminUrl,
  jobUrl,
  profileEntries,
  resumeUrl,
}) => {
  const candidateEntries = [
    ["Họ và tên", application.fullName],
    ["Email", application.email],
    ["Số điện thoại", application.phone],
  ];
  const jobEntries = [
    ["Vị trí", application.job?.title],
    ["Khu vực", application.job?.location],
    ["Slug", application.job?.slug],
    ["Link bài tuyển dụng", jobUrl],
  ];
  const resumeEntries = [["CV / hồ sơ đính kèm", resumeUrl]];
  const timeEntries = [
    ["Thời gian nộp", application.createdAt],
    ["Trang admin", adminUrl],
  ];

  return `<!doctype html>
<html lang="vi">
  <body style="margin:0;background:#f1f5f9;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:16px;padding:24px;border:1px solid #dbe4f0;">
      <p style="margin:0 0 8px;color:#2563eb;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">FPT Jobs</p>
      <h1 style="margin:0;color:#062b5f;font-size:26px;line-height:1.25;">Hồ sơ ứng tuyển mới</h1>
      <p style="margin:8px 0 0;color:#475569;font-size:15px;line-height:1.6;">Một ứng viên vừa gửi hồ sơ. Thông tin được chia rõ theo từng mục bên dưới.</p>

      ${renderEmailSection("1. Thông tin ứng viên", candidateEntries)}
      ${renderEmailSection("2. Vị trí ứng tuyển", jobEntries)}
      ${renderEmailSection("3. Thông tin user đã nộp", profileEntries)}
      ${renderEmailSection("4. CV / hồ sơ đính kèm", resumeEntries)}

      <section style="margin-top:18px;border:1px solid #dbe4f0;border-radius:12px;overflow:hidden;background:#ffffff;">
        <h2 style="margin:0;padding:14px 16px;background:#f8fafc;color:#0f2f5f;font-size:16px;line-height:1.3;">5. Ghi chú / câu trả lời form</h2>
        <div style="padding:14px 16px;color:#0f172a;font-size:15px;font-weight:600;line-height:1.6;white-space:pre-wrap;">${escapeHtml(formatEmailValue(application.coverLetter))}</div>
      </section>

      ${renderEmailSection("6. Thời gian", timeEntries)}

      ${
        adminUrl
          ? `<p style="margin:22px 0 0;"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-size:15px;font-weight:700;">Mở trang admin</a></p>`
          : ""
      }
    </main>
  </body>
</html>`;
};

const getBearerToken = (request) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
};

const getAuthenticatedUser = (request) => {
  const payload = verifyAuthToken(getBearerToken(request));

  if (!payload) {
    return null;
  }

  return getUserById(payload.sub);
};

const sendAuthResponse = (request, response, statusCode, user) => {
  sendJson(request, response, statusCode, {
    data: {
      user,
      token: createAuthToken(user),
    },
  });
};

const handleHealth = (request, response) => {
  sendJson(request, response, 200, {
    status: "ok",
    service: "fptjobs-backend",
    database: "sqlite",
    databasePath,
    stats: getDatabaseStats(),
    timestamp: new Date().toISOString(),
  });
};

const getUploadedCvContentType = (filename) => {
  const extension = extname(filename).toLowerCase();

  if (extension === ".pdf") return "application/pdf";
  if (extension === ".doc") return "application/msword";
  if (extension === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  return "application/octet-stream";
};

const serveUploadedCv = async (request, response, filename) => {
  let safeFilename = "";

  try {
    safeFilename = decodeURIComponent(filename ?? "");
  } catch {
    sendError(request, response, 400, "Invalid CV filename");
    return;
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(safeFilename)) {
    sendError(request, response, 400, "Invalid CV filename");
    return;
  }

  const filePath = join(uploadedCvDirectory, safeFilename);

  try {
    const fileStats = await stat(filePath);

    if (!fileStats.isFile()) {
      sendError(request, response, 404, "CV file not found");
      return;
    }
  } catch {
    sendError(request, response, 404, "CV file not found");
    return;
  }

  response.writeHead(200, {
    ...getCorsHeaders(request),
    "Cache-Control": "private, max-age=3600",
    "Content-Disposition": `inline; filename="${safeFilename}"`,
    "Content-Type": getUploadedCvContentType(safeFilename),
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
};

const handleJobsList = (request, response, url) => {
  const result = listJobs({
    q: url.searchParams.get("q"),
    location: url.searchParams.get("location"),
    department: url.searchParams.get("department"),
    hot: url.searchParams.get("hot"),
    limit: url.searchParams.get("limit"),
    offset: url.searchParams.get("offset"),
  });

  sendJson(request, response, 200, result);
};

const handleApplicationsList = (request, response, url) => {
  const result = listApplications({
    jobSlug: url.searchParams.get("jobSlug"),
    status: url.searchParams.get("status"),
    limit: url.searchParams.get("limit"),
    offset: url.searchParams.get("offset"),
  });

  sendJson(request, response, 200, result);
};

const handleGetAdminSettings = (request, response) => {
  sendJson(request, response, 200, {
    data: getAdminSettings(),
  });
};

const handleAdminLogin = async (request, response) => {
  const body = await readJsonBody(request);
  const validation = validateLoginPayload(body);

  if (validation.errors) {
    sendError(request, response, 400, "Admin login payload is invalid", validation.errors);
    return;
  }

  const admin = authenticateAdmin(validation.value);

  if (!admin) {
    sendError(request, response, 401, "Email hoặc mật khẩu admin chưa đúng.");
    return;
  }

  sendJson(request, response, 200, {
    data: {
      admin,
    },
  });
};

const handleUpdateAdminSettings = async (request, response) => {
  const body = await readJsonBody(request);
  const validation = validateAdminSettingsPayload(body);

  if (validation.errors) {
    sendError(request, response, 400, "Admin settings payload is invalid", validation.errors);
    return;
  }

  const result = updateAdminSettings(validation.value);

  if (result.error === "invalid_current_password") {
    sendError(request, response, 401, "Mật khẩu hiện tại chưa đúng", {
      currentPassword: "Mật khẩu hiện tại chưa đúng",
    });
    return;
  }

  sendJson(request, response, 200, {
    data: result,
  });
};

const sendApplicationNotificationEmail = async (application) => {
  const adminNotificationEmail = getAdminSettings().notificationEmails || fallbackAdminNotificationEmail;

  if (!adminNotificationEmail) {
    console.warn("ADMIN_NOTIFICATION_EMAIL is not configured; application email notification skipped.");
    return false;
  }

  if (!isMailConfigured()) {
    console.warn("SMTP is not configured; application email notification skipped.");
    return false;
  }

  const publicSiteUrl = (process.env.PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  const publicApiUrl = (process.env.API_PUBLIC_URL ?? process.env.BACKEND_PUBLIC_URL ?? "").replace(/\/+$/, "");
  const adminUrl = publicSiteUrl ? `${publicSiteUrl}/admin` : "";
  const jobUrl = publicSiteUrl && application.job?.slug ? `${publicSiteUrl}/${application.job.slug}` : "";
  const resumeUrl =
    application.resumeUrl && application.resumeUrl.startsWith("/") && publicApiUrl
      ? `${publicApiUrl}${application.resumeUrl}`
      : application.resumeUrl;
  const profileLines = formatApplicationProfileLines(application, publicApiUrl);
  const profileEntries = formatApplicationProfileEntries(application, publicApiUrl);

  await sendMail({
    to: adminNotificationEmail,
    subject: `[FPT Jobs] Hồ sơ mới: ${application.fullName} - ${application.job?.title ?? "Ứng tuyển"}`,
    text: createApplicationNotificationText({
      adminUrl,
      application,
      jobUrl,
      profileLines,
      resumeUrl,
    }),
    html: createApplicationNotificationHtml({
      adminUrl,
      application,
      jobUrl,
      profileEntries,
      resumeUrl,
    }),
  });

  return true;
};

const handleCreateApplication = async (request, response) => {
  const body = await readApplicationBody(request);
  const validation = validateApplicationPayload(body);

  if (validation.errors) {
    sendError(request, response, 400, "Application payload is invalid", validation.errors);
    return;
  }

  const user = getAuthenticatedUser(request);
  const candidateProfile = user ? getCandidateProfile(user.id) : null;

  if (user && !validation.value.resumeUrl) {
    const missingProfileFields = validateCandidateProfileCompleteness(candidateProfile);

    if (missingProfileFields.length > 0) {
      sendError(request, response, 400, "Vui lòng cập nhật đầy đủ thông tin hồ sơ trước khi nộp.", {
        profile: `Bạn còn thiếu: ${missingProfileFields.join(", ")}`,
      });
      return;
    }
  }

  const profileSnapshot = createApplicationProfileSnapshot(candidateProfile, validation.value);
  const application = createApplication({
    ...validation.value,
    userId: user?.id ?? null,
    profileSnapshot,
  });

  if (!application) {
    sendError(request, response, 404, "Job not found");
    return;
  }

  let adminEmailSent = false;

  try {
    adminEmailSent = await sendApplicationNotificationEmail(application);
  } catch (error) {
    console.error("Failed to send application notification email", error);
  }

  sendJson(request, response, 201, {
    data: application,
    notification: {
      adminEmailSent,
    },
  });
};

const handleCandidateApplicationsList = (request, response) => {
  const user = getAuthenticatedUser(request);

  if (!user) {
    sendError(request, response, 401, "Unauthorized");
    return;
  }

  const result = listApplications({
    userId: user.id,
    userEmail: user.email,
    limit: 100,
  });

  sendJson(request, response, 200, result);
};

const handleRegister = async (request, response) => {
  const body = await readJsonBody(request);
  const validation = validateRegisterPayload(body);

  if (validation.errors) {
    sendError(request, response, 400, "Register payload is invalid", validation.errors);
    return;
  }

  const result = createUser(validation.value);

  if (result.error === "email_exists") {
    sendError(request, response, 409, "Email already exists");
    return;
  }

  sendAuthResponse(request, response, 201, result.user);
};

const handleLogin = async (request, response) => {
  const body = await readJsonBody(request);
  const validation = validateLoginPayload(body);

  if (validation.errors) {
    sendError(request, response, 400, "Login payload is invalid", validation.errors);
    return;
  }

  const user = authenticateUser(validation.value);

  if (!user) {
    sendError(request, response, 401, "Email or password is incorrect");
    return;
  }

  sendAuthResponse(request, response, 200, user);
};

const handleMe = (request, response) => {
  const user = getAuthenticatedUser(request);

  if (!user) {
    sendError(request, response, 401, "Unauthorized");
    return;
  }

  sendJson(request, response, 200, {
    data: {
      user,
    },
  });
};

const handleChangePassword = async (request, response) => {
  const user = getAuthenticatedUser(request);

  if (!user) {
    sendError(request, response, 401, "Unauthorized");
    return;
  }

  const body = await readJsonBody(request);
  const validation = validateChangePasswordPayload(body);

  if (validation.errors) {
    sendError(request, response, 400, "Change password payload is invalid", validation.errors);
    return;
  }

  const result = changeUserPassword({
    userId: user.id,
    ...validation.value,
  });

  if (result.error === "invalid_current_password") {
    sendError(request, response, 401, "Current password is incorrect");
    return;
  }

  sendJson(request, response, 200, {
    data: {
      user: result.user,
    },
  });
};

const handleGetCandidateProfile = (request, response) => {
  const user = getAuthenticatedUser(request);

  if (!user) {
    sendError(request, response, 401, "Unauthorized");
    return;
  }

  sendJson(request, response, 200, {
    data: {
      user,
      profile: getCandidateProfile(user.id),
    },
  });
};

const handleUpdateCandidateProfile = async (request, response) => {
  const user = getAuthenticatedUser(request);

  if (!user) {
    sendError(request, response, 401, "Unauthorized");
    return;
  }

  const body = await readJsonBody(request);
  const validation = validateCandidateProfilePayload(body);

  if (validation.errors) {
    sendError(request, response, 400, "Candidate profile payload is invalid", validation.errors);
    return;
  }

  const result = updateCandidateProfile(user.id, validation.value);

  if (result?.error === "email_exists") {
    sendError(request, response, 409, "Email already exists");
    return;
  }

  sendJson(request, response, 200, {
    data: result,
  });
};

const handleUploadCandidateResume = async (request, response) => {
  const user = getAuthenticatedUser(request);

  if (!user) {
    sendError(request, response, 401, "Unauthorized");
    return;
  }

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("multipart/form-data")) {
    sendError(request, response, 400, "CV upload must use multipart/form-data.");
    return;
  }

  const { files } = await parseMultipartBody(request);
  const resumeUrl = await saveApplicationCv(files.cv ?? files.resume ?? files.file);

  if (!resumeUrl) {
    sendError(request, response, 400, "CV file is required.");
    return;
  }

  const result = updateCandidateResumeUrl(user.id, resumeUrl);

  sendJson(request, response, 200, {
    data: result,
  });
};

const handleUpdateApplication = async (request, response, applicationId) => {
  const id = Number.parseInt(applicationId, 10);

  if (Number.isNaN(id)) {
    sendError(request, response, 400, "Application id is invalid");
    return;
  }

  const body = await readJsonBody(request);
  const validation = validateStatusPayload(body);

  if (validation.errors) {
    sendError(request, response, 400, "Application payload is invalid", validation.errors);
    return;
  }

  const application = updateApplicationStatus(id, validation.value.status);

  if (!application) {
    sendError(request, response, 404, "Application not found");
    return;
  }

  sendJson(request, response, 200, {
    data: application,
  });
};

const routeRequest = async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const segments = url.pathname.split("/").filter(Boolean);

  if (request.method === "OPTIONS") {
    response.writeHead(204, getCorsHeaders(request));
    response.end();
    return;
  }

  if (request.method === "GET" && (url.pathname === "/health" || url.pathname === "/api/health")) {
    handleHealth(request, response);
    return;
  }

  if (
    ["GET", "HEAD"].includes(request.method) &&
    segments[0] === "uploads" &&
    segments[1] === "applications" &&
    segments.length === 3
  ) {
    await serveUploadedCv(request, response, segments[2]);
    return;
  }

  if (segments[0] === "api" && segments[1] === "jobs") {
    if (request.method === "GET" && segments.length === 2) {
      handleJobsList(request, response, url);
      return;
    }

    if (request.method === "GET" && segments[2] === "meta") {
      sendJson(request, response, 200, {
        data: getJobsMeta(),
      });
      return;
    }

    if (request.method === "GET" && segments.length === 3) {
      const job = getJobBySlug(decodeURIComponent(segments[2]));

      if (!job) {
        sendError(request, response, 404, "Job not found");
        return;
      }

      sendJson(request, response, 200, {
        data: job,
      });
      return;
    }
  }

  if (segments[0] === "api" && segments[1] === "auth") {
    if (request.method === "POST" && segments[2] === "register") {
      await handleRegister(request, response);
      return;
    }

    if (request.method === "POST" && segments[2] === "login") {
      await handleLogin(request, response);
      return;
    }

    if (request.method === "GET" && segments[2] === "me") {
      handleMe(request, response);
      return;
    }

    if (request.method === "POST" && segments[2] === "change-password") {
      await handleChangePassword(request, response);
      return;
    }

    if (request.method === "POST" && segments[2] === "logout") {
      sendJson(request, response, 200, {
        data: {
          ok: true,
        },
      });
      return;
    }
  }

  if (segments[0] === "api" && segments[1] === "candidate" && segments[2] === "applications") {
    if (request.method === "GET") {
      handleCandidateApplicationsList(request, response);
      return;
    }
  }

  if (
    segments[0] === "api" &&
    segments[1] === "candidate" &&
    segments[2] === "profile" &&
    segments[3] === "cv"
  ) {
    if (request.method === "POST") {
      await handleUploadCandidateResume(request, response);
      return;
    }
  }

  if (segments[0] === "api" && segments[1] === "candidate" && segments[2] === "profile" && segments.length === 3) {
    if (request.method === "GET") {
      handleGetCandidateProfile(request, response);
      return;
    }

    if (request.method === "PUT") {
      await handleUpdateCandidateProfile(request, response);
      return;
    }
  }

  if (segments[0] === "api" && segments[1] === "admin" && segments[2] === "settings" && segments.length === 3) {
    if (request.method === "GET") {
      handleGetAdminSettings(request, response);
      return;
    }

    if (request.method === "PUT") {
      await handleUpdateAdminSettings(request, response);
      return;
    }
  }

  if (segments[0] === "api" && segments[1] === "admin" && segments[2] === "login" && segments.length === 3) {
    if (request.method === "POST") {
      await handleAdminLogin(request, response);
      return;
    }
  }

  if (segments[0] === "api" && segments[1] === "applications") {
    if (request.method === "GET" && segments.length === 2) {
      handleApplicationsList(request, response, url);
      return;
    }

    if (request.method === "POST" && segments.length === 2) {
      await handleCreateApplication(request, response);
      return;
    }

    if (request.method === "GET" && segments.length === 3) {
      const application = getApplicationById(Number.parseInt(segments[2], 10));

      if (!application) {
        sendError(request, response, 404, "Application not found");
        return;
      }

      sendJson(request, response, 200, {
        data: application,
      });
      return;
    }

    if (request.method === "PATCH" && segments.length === 3) {
      await handleUpdateApplication(request, response, segments[2]);
      return;
    }
  }

  sendError(request, response, 404, "Not found");
};

initializeDatabase();

const server = createServer((request, response) => {
  routeRequest(request, response).catch((error) => {
    const statusCode = error.statusCode ?? 500;
    const message = statusCode >= 500 ? "Internal server error" : error.message;

    if (statusCode >= 500) {
      console.error(error);
    }

    sendError(request, response, statusCode, message);
  });
});

server.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
