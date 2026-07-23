import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IaaCategoryArchive } from "@/components/iaa/IaaCategoryArchive";
import { IaaFooter } from "@/components/iaa/IaaFooter";
import { IaaHeader } from "@/components/iaa/IaaHeader";
import { getAllCategorySlugs, getCategoryArchiveBySlug } from "@/lib/iaa-db";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const archive = getCategoryArchiveBySlug(slug);

  if (!archive) {
    return {};
  }

  return {
    title: `${archive.title} - kaireview`,
  };
}

export default async function IaaCategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const archive = getCategoryArchiveBySlug(slug);

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
