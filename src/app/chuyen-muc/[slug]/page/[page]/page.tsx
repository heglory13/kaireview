import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IaaCategoryArchive } from "@/components/iaa/IaaCategoryArchive";
import { IaaFooter } from "@/components/iaa/IaaFooter";
import { IaaHeader } from "@/components/iaa/IaaHeader";
import { getCategoryArchiveBySlug, getCategoryPageParams } from "@/lib/iaa-db";

type CategoryPageNumberProps = {
  params: Promise<{ slug: string; page: string }>;
};

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getCategoryPageParams();
}

export async function generateMetadata({
  params,
}: CategoryPageNumberProps): Promise<Metadata> {
  const { slug, page } = await params;
  const pageNumber = parsePageNumber(page);
  const archive = pageNumber ? getCategoryArchiveBySlug(slug, pageNumber) : undefined;

  if (!archive) {
    return {};
  }

  return {
    title: `${archive.title} - Page ${pageNumber} - kaireview`,
  };
}

export default async function IaaCategoryNumberedPage({
  params,
}: CategoryPageNumberProps) {
  const { slug, page } = await params;
  const pageNumber = parsePageNumber(page);
  const archive = pageNumber ? getCategoryArchiveBySlug(slug, pageNumber) : undefined;

  if (!archive) {
    notFound();
  }

  return (
    <>
      <IaaHeader activeHref={archive.href} />
      <IaaCategoryArchive archive={archive} />
      <IaaFooter />
    </>
  );
}

function parsePageNumber(value: string) {
  const pageNumber = Number(value);

  return Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : undefined;
}
