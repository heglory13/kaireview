export type FptApplicationStatus = "new" | "screening" | "interview" | "offer" | "hired" | "rejected";

export type FptApplicationProfileSnapshot = {
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  address?: string;
  currentCity?: string;
  currentWard?: string;
  desiredCity?: string;
  desiredWard?: string;
  educationLevel?: string;
  school?: string;
  major?: string;
  graduationYear?: string;
  gpa?: string;
  resumeUrl?: string;
  updatedAt?: string;
};

export type FptStoredApplication = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  jobSlug?: string;
  location: string;
  source: string;
  status: FptApplicationStatus;
  appliedAt: string;
  cvName?: string;
  note?: string;
  profileSnapshot?: FptApplicationProfileSnapshot;
};

export const adminApplicationsStorageKey = "fptjobs.admin.applications";
const legacyMockApplicationIds = new Set([1083, 1084, 1085, 1086, 1087, 1088]);
const profileSnapshotFields: Array<keyof FptApplicationProfileSnapshot> = [
  "fullName",
  "email",
  "phone",
  "gender",
  "birthday",
  "address",
  "currentCity",
  "currentWard",
  "desiredCity",
  "desiredWard",
  "educationLevel",
  "school",
  "major",
  "graduationYear",
  "gpa",
  "resumeUrl",
  "updatedAt",
];

function hasProfileSnapshotValue(snapshot?: FptApplicationProfileSnapshot) {
  return Object.values(snapshot ?? {}).some((value) => typeof value === "string" && value.trim().length > 0);
}

function normalizeProfileSnapshotValue(value?: string) {
  return value?.trim() ?? "";
}

function mergeProfileSnapshots(
  baseSnapshot?: FptApplicationProfileSnapshot,
  storedSnapshot?: FptApplicationProfileSnapshot,
) {
  const mergedSnapshot: FptApplicationProfileSnapshot = {};

  for (const field of profileSnapshotFields) {
    const storedValue = normalizeProfileSnapshotValue(storedSnapshot?.[field]);
    const baseValue = normalizeProfileSnapshotValue(baseSnapshot?.[field]);

    if (storedValue || baseValue) {
      mergedSnapshot[field] = storedValue || baseValue;
    }
  }

  return hasProfileSnapshotValue(mergedSnapshot) ? mergedSnapshot : undefined;
}

export function readStoredApplications() {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(adminApplicationsStorageKey);
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((application): application is FptStoredApplication => {
      if (legacyMockApplicationIds.has(Number(application?.id))) return false;

      return Boolean(application?.id && application?.fullName?.trim() && application?.email?.trim() && application?.jobTitle?.trim());
    });
  } catch {
    return [];
  }
}

export function writeStoredApplications(applications: FptStoredApplication[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(adminApplicationsStorageKey, JSON.stringify(applications));
}

export function mergeApplications(baseApplications: FptStoredApplication[], storedApplications: FptStoredApplication[]) {
  const applicationsById = new Map<number, FptStoredApplication>();

  for (const application of baseApplications) {
    applicationsById.set(application.id, application);
  }

  for (const application of storedApplications) {
    const existingApplication = applicationsById.get(application.id);

    applicationsById.set(application.id, {
      ...existingApplication,
      ...application,
      appliedAt: existingApplication?.appliedAt ?? application.appliedAt,
      jobSlug: application.jobSlug ?? existingApplication?.jobSlug,
      profileSnapshot: mergeProfileSnapshots(existingApplication?.profileSnapshot, application.profileSnapshot),
    });
  }

  return Array.from(applicationsById.values()).sort((left, right) => right.id - left.id);
}
