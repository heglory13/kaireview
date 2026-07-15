import type { Metadata } from "next";
import { FptAdminStoredDetailClient } from "@/components/fptjobs/fptjobs-admin-stored-detail-client";
import {
  FptNewsArticlePage,
  FptPageFrame,
  getFptNewsArticleBySlug,
  getFptNewsArticleSlugs,
} from "@/components/fptjobs/fptjobs-home";

type NewsArticlePageProps = {
  params: Promise<{
    articleSlug: string;
  }>;
};

export function generateStaticParams() {
  return getFptNewsArticleSlugs().map((articleSlug) => ({ articleSlug }));
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { articleSlug } = await params;
  const article = getFptNewsArticleBySlug(articleSlug);

  return {
    title: article ? `${article.title} | FPT Jobs` : "Tin tức FPT Jobs",
    description: article?.description ?? "Tin tức mới nhất từ FPT Telecom.",
    openGraph: article
      ? {
          title: article.title,
          description: article.description,
          images: [article.image],
        }
      : undefined,
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { articleSlug } = await params;
  const article = getFptNewsArticleBySlug(articleSlug);

  if (!article) {
    return (
      <FptPageFrame className="fpt-news-detail-page">
        <FptAdminStoredDetailClient
          backHref="/tin-tuc"
          backLabel="Tin tức"
          resource="news"
          slug={articleSlug}
          storageKey="fptjobs.admin.news"
        />
      </FptPageFrame>
    );
  }

  return <FptNewsArticlePage article={article} />;
}
