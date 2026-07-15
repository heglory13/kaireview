import type { Metadata } from "next";
import { FptAdminStoredDetailClient } from "@/components/fptjobs/fptjobs-admin-stored-detail-client";
import {
  FptPageFrame,
  FptSurveyEventDetailPage,
  getFptSurveyEventBySlug,
  getFptSurveyEventSlugs,
} from "@/components/fptjobs/fptjobs-home";

type SurveyEventPageProps = {
  params: Promise<{
    eventSlug: string;
  }>;
};

export function generateStaticParams() {
  return getFptSurveyEventSlugs().map((eventSlug) => ({ eventSlug }));
}

export async function generateMetadata({ params }: SurveyEventPageProps): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = getFptSurveyEventBySlug(eventSlug);

  return {
    title: event ? `${event.title} | FPT Jobs` : "Sự kiện FPT Jobs",
    description: event?.description ?? "Sự kiện tuyển dụng FPT Telecom.",
    openGraph: event
      ? {
          title: event.title,
          description: event.description,
          images: [event.bannerImage],
        }
      : undefined,
  };
}

export default async function SurveyEventPage({ params }: SurveyEventPageProps) {
  const { eventSlug } = await params;
  const event = getFptSurveyEventBySlug(eventSlug);

  if (!event) {
    return (
      <FptPageFrame className="fpt-survey-detail-page fpt-news-detail-page">
        <FptAdminStoredDetailClient
          backHref="/su-kien"
          backLabel="Sự kiện"
          resource="event"
          slug={eventSlug}
          storageKey="fptjobs.admin.events"
        />
      </FptPageFrame>
    );
  }

  return <FptSurveyEventDetailPage event={event} />;
}
