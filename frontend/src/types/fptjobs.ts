export type NavItem = {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
  }[];
};

export type Job = {
  id?: number;
  title: string;
  department?: string;
  position?: string;
  location: string;
  employmentType?: string;
  deadline: string;
  salary: string;
  href: string;
  hot?: boolean;
  status?: "active" | "draft" | "paused";
  unit?: string;
  quantity?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  workplace?: string;
  branchName?: string;
  branchIntro?: string[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  landline?: string;
};

export type BenefitCard = {
  title: string;
  kicker: string;
  description: string;
  image: string;
  tone: "blue" | "orange" | "green";
};

export type Metric = {
  value: string;
  label: string;
  description: string;
};

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

export type Testimonial = {
  title: string;
  quote: string;
  name: string;
  role: string;
  image: string;
  tone: "blue" | "orange" | "green";
};

export type ContactItem = {
  title: string;
  subtitle: string;
  icon: string;
  href: string;
};
