import type { Metadata } from "next";

import { IaaFooter } from "@/components/iaa/IaaFooter";
import { IaaHeader } from "@/components/iaa/IaaHeader";
import { getContactIntroHtml } from "@/lib/iaa-db";

export const metadata: Metadata = {
  title: "Liên Hệ - kaireview",
  description:
    "Liên hệ kaireview: Bạn có thắc mắc hay cần hỗ trợ? Đừng ngần ngại, hãy gửi thông tin cho chúng tôi.",
};

type ContactPageProps = {
  searchParams: Promise<{ sent?: string | string[] }>;
};

export default async function IaaContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const sentValue = Array.isArray(params.sent) ? params.sent[0] : params.sent;
  const isSent = sentValue === "1";
  const contactIntroHtml = getContactIntroHtml();

  return (
    <>
      <IaaHeader activeHref="/lien-he/" />
      <main className="border-t border-[#ececec] bg-white py-[30px] text-black">
        <div className="mx-auto max-w-[1080px] px-[15px]">
          <div className="iaa-article-content max-w-[760px] text-[16px] leading-[25.6px]">
            <div dangerouslySetInnerHTML={{ __html: contactIntroHtml }} />
            <h2 className="mb-[13px] text-[25.6px] font-bold leading-[33.28px] text-black">
              Liên hệ
            </h2>
            {isSent ? (
              <p className="mb-[16px] border border-[#d8e8d3] bg-[#f3fbf0] px-[14px] py-[10px] text-[14px] font-bold text-[#2f6f28]">
                Tin nhắn của bạn đã được lưu, quản trị viên sẽ xem trong trang admin.
              </p>
            ) : null}
            <form action="/api/contact" className="space-y-[14px]" method="post">
              <label className="block text-[14px] font-bold leading-[22.4px]" htmlFor="contact-name">
                Tên<span className="ml-[3px] font-normal">(yêu cầu)</span>
              </label>
              <input
                className="h-[39px] w-full border border-[#ddd] px-[12px] text-[16px] outline-none focus:border-[#999]"
                id="contact-name"
                name="name"
                required
                type="text"
              />

              <label className="block text-[14px] font-bold leading-[22.4px]" htmlFor="contact-email">
                Thư điện tử<span className="ml-[3px] font-normal">(yêu cầu)</span>
              </label>
              <input
                className="h-[39px] w-full border border-[#ddd] px-[12px] text-[16px] outline-none focus:border-[#999]"
                id="contact-email"
                name="email"
                required
                type="email"
              />

              <label className="block text-[14px] font-bold leading-[22.4px]" htmlFor="contact-message">
                Tin nhắn
              </label>
              <textarea
                className="min-h-[120px] w-full border border-[#ddd] px-[12px] py-[9px] text-[16px] outline-none focus:border-[#999]"
                id="contact-message"
                name="message"
              />

              <button
                className="inline-flex h-[39px] items-center bg-[#446084] px-[18px] text-[13px] font-bold uppercase leading-none text-white transition-colors hover:bg-[#334862]"
                type="submit"
              >
                Lưu
              </button>
            </form>
          </div>
        </div>
      </main>
      <IaaFooter />
    </>
  );
}
