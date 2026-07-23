export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface PostDate {
  day: string;
  month: string;
}

export interface IaaPost {
  title: string;
  href: string;
  image: string;
  alt: string;
  excerpt?: string;
  date?: PostDate;
}

export interface IaaHomePosts {
  heroLeadPost?: IaaPost;
  heroMiniPosts: IaaPost[];
  heroSidePost?: IaaPost;
  reviewPosts: IaaPost[];
  technologyPosts: IaaPost[];
}

export interface IaaArticleFigure {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  maxWidth: number;
}

export interface IaaArticle {
  slug: string;
  title: string;
  description: string;
  href: string;
  category: {
    label: string;
    href: string;
  };
  publishedLabel: string;
  publishedDateTime: string;
  updatedLabel: string;
  updatedDateTime: string;
  author: {
    name: string;
    href: string;
    avatar: string;
  };
  tag?: {
    label: string;
    href: string;
  };
  previousPost?: {
    title: string;
    href: string;
  };
  figures?: {
    redChili: IaaArticleFigure;
    harvest: IaaArticleFigure;
    workers: IaaArticleFigure;
    greenChili: IaaArticleFigure;
    chiliSatay: IaaArticleFigure;
  };
  contentHtml?: string;
  relatedPosts?: IaaRelatedPost[];
}

export interface IaaRelatedPost extends IaaPost {
  age: string;
}

export interface IaaArchivePageLink {
  label: string;
  href: string;
  current?: boolean;
  isNext?: boolean;
}

export interface IaaCategoryArchiveData {
  slug: string;
  label: string;
  href: string;
  title: string;
  posts: IaaPost[];
  pagination: IaaArchivePageLink[];
}

export type IaaSearchSuggestion = Pick<IaaPost, "title" | "href" | "image" | "alt" | "excerpt">;
