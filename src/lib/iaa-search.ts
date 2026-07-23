import { buildSearchArchiveFromDatabase } from "@/lib/iaa-db";

export function buildSearchArchive(query: string) {
  return buildSearchArchiveFromDatabase(query);
}
