import Image from "next/image";
import Link from "next/link";

import { localizeIaaHref } from "@/lib/iaa-links";
import type { IaaArchivePageLink, IaaCategoryArchiveData, IaaPost } from "@/types/iaa";

interface IaaCategoryArchiveProps {
  archive: IaaCategoryArchiveData;
}

export function IaaCategoryArchive({ archive }: IaaCategoryArchiveProps) {
  return (
    <main className="relative bg-white pb-[30px]">
      <header className="border-t border-[#ececec] py-[30px] text-center">
        <div className="mx-auto max-w-[1080px] px-[15px]">
          <h1 className="text-[16px] font-bold uppercase leading-[19.2px] tracking-[0.8px] text-black">
            {archive.title}
          </h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1080px] grid-cols-1 px-[15px] md:grid-cols-[735px_1fr] md:px-0">
        <section className="md:pr-[30px]">
          {archive.posts.length ? (
            <div className="space-y-[42px] md:space-y-[26px]">
              {archive.posts.map((post, index) => (
                <ArchivePostCard key={post.href} post={post} preload={index === 0} />
              ))}
            </div>
          ) : (
            <p className="py-[20px] text-center text-[14px] leading-[22.4px] text-black">
              {archive.slug === "search" ? "Không tìm thấy bài viết phù hợp." : "Chưa có bài viết."}
            </p>
          )}
          <ArchivePagination links={archive.pagination} />
        </section>
        <aside className="hidden border-l border-[#ececec] md:block" />
      </div>
    </main>
  );
}

function ArchivePostCard({
  post,
  preload,
}: {
  post: IaaPost;
  preload: boolean;
}) {
  const href = localizeIaaHref(post.href);

  return (
    <article className="group text-center md:grid md:grid-cols-[309px_1fr] md:items-center md:gap-[28px]">
      <a
        className="relative block aspect-[360/202] overflow-hidden bg-[#f5f5f5] md:aspect-[309/173]"
        href={href}
      >
        {post.date ? (
          <span className="absolute left-[-5px] top-[26px] z-10 flex h-[42px] w-[38px] flex-col items-center justify-center border-2 border-[#446084] bg-white text-[#446084] md:left-[-5px] md:top-[10px]">
            <span className="text-[15px] font-bold leading-[15px]">{post.date.day}</span>
            <span className="mt-[2px] text-[10px] font-bold uppercase leading-[10px]">
              {post.date.month}
            </span>
          </span>
        ) : null}
        <Image
          alt={post.alt}
          className="object-cover transition-opacity duration-300 group-hover:opacity-90"
          fill
          preload={preload}
          sizes="(max-width: 767px) 360px, 309px"
          src={post.image}
        />
      </a>
      <div className="mx-auto w-[340px] pt-[13px] md:w-auto md:pt-0">
        <h5 className="my-[1.36px] text-[13.6px] font-bold leading-[17.68px] text-black md:text-[16.56px] md:leading-[21.528px]">
          <a className="transition-colors hover:text-[#446084]" href={href}>
            {post.title}
          </a>
        </h5>
        {post.excerpt ? (
          <p className="mt-[9px] text-[13px] leading-[20.8px] text-black md:mx-auto md:max-w-[330px] md:text-[14px] md:leading-[22.4px]">
            {post.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function ArchivePagination({ links }: { links: IaaArchivePageLink[] }) {
  return (
    <nav
      aria-label="Pagination"
      className="mt-[34px] flex justify-center gap-[9px] md:mt-[36px]"
    >
      {links.map((page, index) => (
        <Link
          aria-current={page.current ? "page" : undefined}
          className={
            page.current
              ? "flex size-[28px] items-center justify-center rounded-full bg-[#446084] text-[14px] font-bold leading-none text-white"
              : "flex size-[28px] items-center justify-center rounded-full border-2 border-black bg-white text-[14px] font-bold leading-none text-black"
          }
          href={localizeIaaHref(page.href)}
          key={`${page.label}-${index}`}
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
}
