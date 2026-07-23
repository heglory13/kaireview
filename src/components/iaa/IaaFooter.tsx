import { localizeIaaHref } from "@/lib/iaa-links";

const policyLinks = [
  { label: "Giới thiệu", href: "/lien-he/" },
  { label: "Chính sách sử dụng", href: "/dieu-khoan-dich-vu/" },
  { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat/" },
  { label: "Chính sách Cookies", href: "/chinh-sach-cookies/" },
];

export function IaaFooter() {
  return (
    <footer className="mt-[30px] bg-[#5a5a5a] text-[#f1f1f1] md:mt-[30px]">
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 px-[15px] py-[31px] md:grid-cols-3 md:px-0">
        <div className="pb-6 md:px-[15px]">
          <h4 className="mb-[12px] text-[11px] font-bold uppercase leading-[18px]">
            kaireview
          </h4>
          <ul className="space-y-[8px] text-[11px] leading-[18px] text-[#e6e6e6]">
            <li>Trang review và tổng hợp thông tin đa lĩnh vực.</li>
            <li>Chọn lọc nội dung theo từng chuyên mục.</li>
            <li>Liên hệ qua biểu mẫu trên website.</li>
          </ul>
        </div>

        <div className="pb-6 md:px-[15px]">
          <h4 className="mb-[12px] text-[11px] font-bold uppercase leading-[18px]">
            Chính Sách
          </h4>
          <ul className="space-y-[8px] text-[11px] leading-[18px]">
            {policyLinks.map((link) => (
              <li key={link.href}>
                  <a className="transition-colors hover:text-white" href={localizeIaaHref(link.href)}>
                    {link.label}
                  </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:px-[15px]">
          <h4 className="mb-[12px] text-[11px] font-bold uppercase leading-[18px]">
            Giới thiệu
          </h4>
          <p className="mb-[14px] text-[11px] leading-[18px] text-[#e6e6e6]">
            kaireview là trang giới thiệu, đánh giá và khuyên dùng các sản phẩm, dịch
            vụ các lĩnh vực mà bạn quan tâm.
          </p>
          <p className="text-[11px] leading-[18px] text-[#e6e6e6]">
            Kết quả từ quá trình tổng hợp chuyên sâu của kaireview bao gồm doanh
            nghiệp sở hữu (tuổi đời, đánh giá từ khách hàng, quy mô,...)
          </p>
        </div>
      </div>
      <div className="bg-[#4f4f4f]">
        <div className="mx-auto max-w-[1080px] px-[15px] py-[14px] text-[10px] leading-[16px] text-[#bdbdbd] md:px-[15px]">
          Copyright 2026 © kaireview
        </div>
      </div>
    </footer>
  );
}
