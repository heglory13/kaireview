"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type FptAboutSlideshowProps = {
  images: string[];
};

export function FptAboutSlideshow({ images }: FptAboutSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, [images.length]);

  const thumbnailImages = useMemo(
    () => images.map((image, index) => ({ image, index })).filter((item) => item.index !== activeIndex),
    [activeIndex, images],
  );

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="fpt-about-slideshow" aria-label="Hình ảnh giới thiệu FPT Telecom">
      <div className="fpt-about-main-photo">
        {images.map((image, index) => (
          <div className={cn("fpt-about-main-slide", index === activeIndex && "is-active")} key={image}>
            <Image
              alt={`Không gian FPT Telecom ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 92vw, 62vw"
              src={image}
            />
          </div>
        ))}
      </div>

      <div className="fpt-about-photo-dots" aria-label="Chọn hình ảnh">
        {images.map((image, index) => (
          <button
            aria-label={`Xem hình ảnh ${index + 1}`}
            className={cn(index === activeIndex && "is-active")}
            key={image}
            onClick={() => setActiveIndex(index)}
            type="button"
          />
        ))}
      </div>

      <div className="fpt-about-thumbs">
        {thumbnailImages.map(({ image, index }) => (
          <button
            aria-label={`Xem hình ảnh FPT Telecom ${index + 1}`}
            key={image}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <Image src={image} alt={`Không gian FPT Telecom ${index + 1}`} fill sizes="(max-width: 768px) 30vw, 18vw" />
          </button>
        ))}
      </div>
    </div>
  );
}
