import { IaaFooter } from "@/components/iaa/IaaFooter";
import { IaaCategoryArchive } from "@/components/iaa/IaaCategoryArchive";
import { IaaHeader } from "@/components/iaa/IaaHeader";
import { buildSearchArchive } from "@/lib/iaa-search";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[]; s?: string | string[] }>;
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = params.s ?? params.q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? "";

  return (
    <>
      <IaaHeader />
      <IaaCategoryArchive archive={buildSearchArchive(query)} />
      <IaaFooter />
    </>
  );
}
