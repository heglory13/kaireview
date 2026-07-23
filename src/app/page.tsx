import { IaaFooter } from "@/components/iaa/IaaFooter";
import { IaaCategoryArchive } from "@/components/iaa/IaaCategoryArchive";
import { IaaHeader } from "@/components/iaa/IaaHeader";
import { IaaHeroGrid } from "@/components/iaa/IaaHeroGrid";
import { IaaPostSections } from "@/components/iaa/IaaPostSections";
import { getHomePosts } from "@/lib/iaa-db";
import { buildSearchArchive } from "@/lib/iaa-search";

type HomeProps = {
  searchParams: Promise<{ s?: string | string[] }>;
};

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps) {
  const { s } = await searchParams;
  const rawQuery = Array.isArray(s) ? s[0] : s;
  const query = rawQuery?.trim();

  if (query) {
    return (
      <>
        <IaaHeader />
        <IaaCategoryArchive archive={buildSearchArchive(query)} />
        <IaaFooter />
      </>
    );
  }

  const homePosts = getHomePosts();

  return (
    <>
      <IaaHeader />
      <main className="relative bg-white pb-[30px]">
        <IaaHeroGrid
          leadPost={homePosts.heroLeadPost}
          miniPosts={homePosts.heroMiniPosts}
          sidePost={homePosts.heroSidePost}
        />
        <IaaPostSections
          review={homePosts.reviewPosts}
          technology={homePosts.technologyPosts}
        />
      </main>
      <IaaFooter />
    </>
  );
}
