import Image from "next/image";
import Link from "next/link";
import { Mail, Share2 } from "lucide-react";

import { localizeIaaHref } from "@/lib/iaa-links";
import type { IaaArticle, IaaRelatedPost } from "@/types/iaa";

interface IaaArticleDetailProps {
  article: IaaArticle;
  relatedPosts?: IaaRelatedPost[];
}

export function IaaArticleDetail({
  article,
  relatedPosts = article.relatedPosts ?? [],
}: IaaArticleDetailProps) {
  const articleHref = localizeIaaHref(article.href);
  const categoryHref = localizeIaaHref(article.category.href);
  const authorHref = localizeIaaHref(article.author.href);
  const tagHref = article.tag ? localizeIaaHref(article.tag.href) : undefined;

  return (
    <main className="border-t border-[#ececec] bg-white text-black">
      <div className="mx-auto grid max-w-[1110px] grid-cols-1 pt-[30px] md:grid-cols-[75%_25%]">
        <article className="px-[15px] pb-[30px] md:px-[30px]">
          <header className="pb-[24px] text-center">
            <h6 className="mb-[11px] text-[11.2px] font-bold uppercase leading-[11.76px] tracking-[0.56px] text-[#1e73be]">
              <a className="transition-colors hover:text-[#111]" href={categoryHref}>
                {article.category.label}
              </a>
            </h6>
            <h1 className="mx-auto mb-[13px] max-w-[760px] text-[22.4px] font-bold leading-[29.12px] text-black md:text-[27.2px] md:leading-[35.36px]">
              {article.title}
            </h1>
            <span className="mx-auto mb-[24px] block h-[3px] w-[30px] bg-black/10" />
            <div className="text-[11.2px] uppercase leading-[18px] tracking-[0.56px] text-black">
              <span>Posted on </span>
              <a className="text-[#1e73be] transition-colors hover:text-[#111]" href={articleHref}>
                <time dateTime={article.publishedDateTime}>{article.publishedLabel}</time>
                <time className="hidden" dateTime={article.updatedDateTime}>
                  {article.updatedLabel}
                </time>
              </a>
              <span> by </span>
              <a className="text-[#1e73be] transition-colors hover:text-[#111]" href={authorHref}>
                {article.author.name}
              </a>
            </div>
          </header>

          <div
            className="iaa-article-content py-[24px] text-[16px] leading-[25.6px] text-black"
            dangerouslySetInnerHTML={{ __html: article.contentHtml ?? "" }}
          />

          <ShareRow article={article} />

          <footer className="border-y border-b-2 border-[#ececec] py-[7px] text-center text-[12.8px] leading-[20.48px] text-[#777]">
            This entry was posted in{" "}
            <a className="text-[#1e73be] transition-colors hover:text-[#111]" href={categoryHref}>
              {article.category.label}
            </a>
            {article.tag && tagHref ? (
              <>
                {" "}
                and tagged{" "}
                <a className="text-[#1e73be] transition-colors hover:text-[#111]" href={tagHref}>
                  {article.tag.label}
                </a>
              </>
            ) : null}
            .
          </footer>

          <AuthorBox article={article} />
          {article.previousPost ? <PostNavigation article={article} /> : null}
        </article>

        <aside className="px-[15px] pb-[30px] md:border-l md:border-[#ececec] md:px-[30px]">
          <RelatedPosts categoryHref={categoryHref} posts={relatedPosts} />
        </aside>
      </div>
    </main>
  );
}

function ShareRow({ article }: { article: IaaArticle }) {
  const articleHref = localizeIaaHref(article.href);
  const shareLinks = [
    {
      label: "W",
      title: "Share on WhatsApp",
      href: `whatsapp://send?text=${encodeURIComponent(`${article.title} - ${articleHref}`)}`,
    },
    {
      label: "f",
      title: "Share on Facebook",
      href: `https://www.facebook.com/sharer.php?u=${encodeURIComponent(articleHref)}`,
    },
    {
      label: "X",
      title: "Share on Twitter",
      href: `https://twitter.com/share?url=${encodeURIComponent(articleHref)}`,
    },
    {
      label: null,
      title: "Email to a Friend",
      href: `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(articleHref)}`,
    },
    {
      label: "P",
      title: "Pin on Pinterest",
      href: `https://pinterest.com/pin/create/button?url=${encodeURIComponent(articleHref)}`,
    },
    {
      label: null,
      title: "Share on LinkedIn",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(articleHref)}`,
    },
  ];

  return (
    <div className="pb-[24px] text-center">
      <span className="mx-auto mb-[16px] block h-[3px] w-[30px] bg-black/10" />
      <div className="inline-flex flex-wrap justify-center gap-[5px]">
        {shareLinks.map((link, index) => (
          <a
            aria-label={link.title}
            className="flex size-[34px] items-center justify-center rounded-full border-2 border-[#999] text-[13px] font-bold leading-none text-[#999] transition-colors hover:border-[#666] hover:bg-[#666] hover:text-white"
            href={link.href}
            key={link.title}
            rel={index === 0 || link.href.startsWith("mailto:") ? undefined : "noopener noreferrer nofollow"}
            target={index === 0 || link.href.startsWith("mailto:") ? undefined : "_blank"}
            title={link.title}
          >
            {link.title === "Email to a Friend" ? (
              <Mail className="size-[15px]" strokeWidth={2.2} />
            ) : link.title === "Share on LinkedIn" ? (
              <span className="text-[12px] lowercase">in</span>
            ) : link.label ? (
              link.label
            ) : (
              <Share2 className="size-[15px]" strokeWidth={2.2} />
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

function AuthorBox({ article }: { article: IaaArticle }) {
  const authorHref = localizeIaaHref(article.author.href);

  return (
    <section className="py-[32px]">
      <div className="flex items-start">
        <a className="mr-[18px] shrink-0 overflow-hidden rounded-full" href={authorHref}>
          <Image
            alt=""
            className="size-[90px] rounded-full"
            height={90}
            src={article.author.avatar}
            width={90}
          />
        </a>
        <div className="min-w-0 flex-1 pt-[8px]">
          <h5 className="mb-[8px] text-[16px] font-bold uppercase leading-[19.2px] tracking-[0.8px] text-black">
            {article.author.name}
          </h5>
        </div>
      </div>
    </section>
  );
}

function PostNavigation({ article }: { article: IaaArticle }) {
  if (!article.previousPost) {
    return null;
  }

  const previousHref = localizeIaaHref(article.previousPost.href);

  return (
    <nav className="border-y border-[#ececec]" role="navigation">
      <div className="flex">
        <div className="flex-1 py-[11px] text-left text-[14px] leading-[22.4px]">
          <a
            className="text-[#334862] transition-colors hover:text-[#111]"
            href={previousHref}
            rel="prev"
          >
            <span className="hidden text-[28px] leading-none align-middle sm:inline">‹</span>{" "}
            {article.previousPost.title}
          </a>
        </div>
        <div className="flex-1 border-l border-[#ececec] py-[11px]" />
      </div>
    </nav>
  );
}

function RelatedPosts({
  categoryHref,
  posts,
}: {
  categoryHref: string;
  posts: IaaRelatedPost[];
}) {
  return (
    <div>
      <div className="mb-[15px] flex items-center justify-between">
        <span className="text-[16px] font-semibold uppercase leading-[16.8px] tracking-[0.8px]" />
        <Link
          className="text-[13px] font-medium uppercase leading-[20.8px] text-[#0a0a0a] transition-colors hover:text-[#446084]"
          href={categoryHref}
        >
          Xem tất cả
        </Link>
      </div>
      <div>
        {posts.map((post, index) => (
          <article className={index === 0 ? "flex" : "mt-[15px] flex"} key={post.href}>
            <a className="mr-[10px] block w-[100px] shrink-0" href={localizeIaaHref(post.href)}>
              <Image
                alt={post.alt}
                className="h-auto w-[100px]"
                height={67}
                sizes="100px"
                src={post.image}
                width={100}
              />
            </a>
            <div className="min-w-0 flex-1">
              <a
                className="mb-[8px] overflow-hidden text-[14px] font-bold leading-[19.6px] text-[#334862] transition-colors [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] hover:text-[#111]"
                href={localizeIaaHref(post.href)}
              >
                {post.title}
              </a>
              <ul className="m-0 flex list-none flex-wrap p-0">
                <li className="m-0 flex items-center text-[12px] leading-none text-[#8D8E92]">
                  <Image
                    alt=""
                    className="mr-[5px] mt-[-2px] size-[13px]"
                    height={13}
                    src="/images/iaa/calendar-event.svg"
                    width={13}
                  />
                  {post.age}
                </li>
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
