import Image from "next/image";

import { localizeIaaHref } from "@/lib/iaa-links";
import { cn } from "@/lib/utils";
import type { IaaPost } from "@/types/iaa";

type PostCardVariant = "lead" | "mini" | "side" | "review" | "news";

interface PostCardProps {
  post: IaaPost;
  variant: PostCardVariant;
}

const imageClassByVariant: Record<PostCardVariant, string> = {
  lead: "aspect-[512/318] md:aspect-[510/287]",
  mini: "aspect-[3/2] md:aspect-[167/94]",
  side: "aspect-[3/2] md:aspect-[240/134]",
  review: "aspect-[335/189]",
  news: "aspect-[335/189]",
};

const titleClassByVariant: Record<PostCardVariant, string> = {
  lead:
    "mt-[10px] text-[13.6px] font-bold leading-[17.68px] md:text-[16.56px] md:leading-[21.528px]",
  mini:
    "mt-[10px] text-[12.8px] font-bold leading-[16.64px] md:text-[14.72px] md:leading-[19.136px]",
  side:
    "mt-[10px] text-[12.8px] font-bold leading-[16.64px] md:text-[14.72px] md:leading-[19.136px]",
  review:
    "mt-[10px] text-[13.6px] font-bold leading-[17.68px] md:text-[16.56px] md:leading-[21.528px]",
  news:
    "mt-[10px] text-[13.6px] font-bold leading-[17.68px] md:text-[16.56px] md:leading-[21.528px]",
};

const articleClassByVariant: Record<PostCardVariant, string> = {
  lead: "w-full",
  mini: "w-full",
  side: "w-full",
  review: "w-[360px] shrink-0 md:w-full",
  news: "relative w-full",
};

export function PostCard({ post, variant }: PostCardProps) {
  const href = localizeIaaHref(post.href);

  return (
    <article className={cn("group text-left text-black", articleClassByVariant[variant])}>
      <a
        className={cn(
          "relative block overflow-hidden bg-[#f5f5f5]",
          imageClassByVariant[variant],
        )}
        href={href}
      >
        {post.date ? <DateBadge day={post.date.day} month={post.date.month} /> : null}
        <Image
          alt={post.alt}
          className="object-cover transition-opacity duration-300 group-hover:opacity-90"
          fill
          preload={variant === "lead"}
          sizes={
            variant === "mini"
              ? "(max-width: 767px) 360px, 167px"
              : "(max-width: 767px) 360px, 335px"
          }
          src={post.image}
        />
      </a>
      <div
        className={cn(
          variant === "lead" ? "min-h-[84px] pt-[10px] md:min-h-[106px] md:pt-[12px]" : "",
        )}
      >
        <h5 className={cn("my-[1.36px] text-black md:my-[1.656px]", titleClassByVariant[variant])}>
          <a className="transition-colors hover:text-[#446084]" href={href}>
            {post.title}
          </a>
        </h5>
        {post.excerpt ? (
          <p className="mt-[6px] text-[11.2px] leading-[17px] text-[#555] md:text-[12px] md:leading-[18px]">
            {post.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function DateBadge({ day, month }: { day: string; month: string }) {
  return (
    <span className="absolute left-[10px] top-[10px] z-10 flex h-[42px] w-[38px] flex-col items-center justify-center border-2 border-[#446084] bg-white text-[#446084]">
      <span className="text-[15px] font-bold leading-[15px]">{day}</span>
      <span className="mt-[2px] text-[10px] font-bold uppercase leading-[10px]">
        {month}
      </span>
    </span>
  );
}
