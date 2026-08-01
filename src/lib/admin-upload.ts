import path from "node:path";

const defaultUploadDirectory = path.join(process.cwd(), "data", "uploads", "admin");
const uploadUrlPrefix = "/api/admin/uploads";
const allowedFilenamePattern = /^[a-z0-9][a-z0-9-]*-[0-9a-f-]+\.(gif|jpg|png|webp)$/i;

export const imageExtensions = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export function getUploadDirectory() {
  const configuredDirectory = process.env.UPLOAD_DIR?.trim();

  return configuredDirectory ? path.resolve(configuredDirectory) : defaultUploadDirectory;
}

export function getUploadUrl(filename: string) {
  return `${uploadUrlPrefix}/${filename}`;
}

export function isValidUploadedFilename(filename: string) {
  return allowedFilenamePattern.test(filename);
}

