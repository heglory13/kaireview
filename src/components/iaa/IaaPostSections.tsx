import type { IaaPost } from "@/types/iaa";

import { PostCard } from "./PostCard";

export function IaaPostSections({
  review,
  technology,
}: {
  review: IaaPost[];
  technology: IaaPost[];
}) {
  if (!review.length && !technology.length) {
    return null;
  }

  return (
    <>
      {review.length ? (
        <section className="mx-auto mt-[30px] max-w-[1080px] overflow-hidden px-[15px] md:mt-[30px] md:px-[15px]">
          <h3 className="mb-2 text-[16px] font-bold leading-[25.6px] text-black md:mb-[10px] md:text-[20px] md:leading-8">
            Review Công Nghệ
          </h3>
          <div className="flex w-max gap-[20px] md:grid md:w-auto md:grid-cols-3 md:gap-[20px]">
            {review.slice(0, 3).map((post) => (
              <PostCard key={post.href} post={post} variant="review" />
            ))}
          </div>
        </section>
      ) : null}

      {technology.length ? (
        <section className="mx-auto mt-[30px] max-w-[1080px] px-[15px] md:mt-[42px]">
          <h3 className="mb-2 text-[16px] font-bold leading-[25.6px] text-black md:mb-[10px] md:text-[20px] md:leading-8">
            Tin Công Nghệ
          </h3>
          <div className="grid grid-cols-1 gap-y-[30px] md:grid-cols-3 md:gap-x-[20px] md:gap-y-[30px]">
            {technology.map((post) => (
              <PostCard key={post.href} post={post} variant="news" />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
