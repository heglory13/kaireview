import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IaaArticleDetail } from "@/components/iaa/IaaArticleDetail";
import { IaaFooter } from "@/components/iaa/IaaFooter";
import { IaaHeader } from "@/components/iaa/IaaHeader";
import { getAllArticlePageSlugs, getArticleBySlug } from "@/lib/iaa-db";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllArticlePageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
    },
  };
}

export default async function IaaArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <IaaHeader activeHref={article.category.href} />
      <IaaArticleDetail article={article} />
      <IaaFooter />
    </>
  );
}
