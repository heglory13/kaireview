"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { FptAuthControls } from "@/components/fptjobs/fptjobs-auth-controls";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/fptjobs";

const logo = "/seo/fptjobs-com-public-imgs-version2-general-fpt-telecom-ngang-logo.svg";

const navItems: NavItem[] = [
  {
    label: "Việc làm HOT",
    href: "/tuyen-dung",
    children: [
      { label: "IT", href: "/tuyen-dung?nhom=it" },
      { label: "Marketing", href: "/tuyen-dung?nhom=marketing" },
      { label: "Data", href: "/tuyen-dung?nhom=data" },
      { label: "AI", href: "/tuyen-dung?nhom=ai" },
      { label: "Semiconductor & Embedded", href: "/tuyen-dung?nhom=semiconductor-embedded" },
      { label: "Nhân viên kinh doanh", href: "/tuyen-dung?nhom=nhan-vien-kinh-doanh" },
      { label: "Dịch vụ khách hàng", href: "/tuyen-dung?nhom=dich-vu-khach-hang" },
      { label: "Kỹ thuật viên", href: "/tuyen-dung?nhom=ky-thuat-vien" },
      { label: "Kỹ thuật hỗ trợ qua tổng đài", href: "/tuyen-dung?nhom=ky-thuat-ho-tro-qua-tong-dai" },
      { label: "Thực tập sinh", href: "/tuyen-dung?nhom=thuc-tap-sinh" },
    ],
  },
  {
    label: "Về chúng tôi",
    href: "/gioi-thieu",
    children: [
      { label: "Giới thiệu công ty", href: "/gioi-thieu" },
      { label: "Tham quan văn phòng", href: "/gioi-thieu#tham-quan-van-phong" },
      { label: "Thông tin liên hệ", href: "/gioi-thieu#lien-he" },
      { label: "Câu hỏi thường gặp", href: "/gioi-thieu#cau-hoi-thuong-gap" },
    ],
  },
  {
    label: "Life at FTEL",
    href: "/life-at-ftel",
    children: [
      { label: "Hoạt động", href: "/life-at-ftel" },
      { label: "Văn hóa đặc sắc", href: "/life-at-ftel#van-hoa" },
      { label: "Phát triển sự nghiệp", href: "/life-at-ftel#phat-trien-su-nghiep" },
      { label: "Phúc lợi", href: "/life-at-ftel#phuc-loi" },
    ],
  },
  {
    label: "Tin tức & Sự kiện",
    href: "/tin-tuc",
    children: [
      { label: "Tin tức", href: "/tin-tuc" },
      { label: "Sự kiện", href: "/su-kien" },
    ],
  },
  {
    label: "Dành cho sinh viên",
    href: "/Internship",
    children: [
      { label: "FTEL Career Booming", href: "/LandingPage/CareerBooming" },
      { label: "SV Tài năng", href: "/Nextgen-Leaders" },
      { label: "SV Công nghệ Tập sự", href: "/SVCNTS2026" },
      { label: "Internship", href: "/Internship" },
    ],
  },
];

function NavLabel({ item }: { item: NavItem }) {
  if (item.label === "Việc làm HOT") {
    return (
      <>
        <span>Việc làm</span>
        <span className="fpt-nav-hot-badge">HOT</span>
      </>
    );
  }

  return (
    <>
      {item.label}
      {item.children ? <ChevronDown aria-hidden="true" size={14} /> : null}
    </>
  );
}

function MobileNavLabel({ item }: { item: NavItem }) {
  if (item.label === "Việc làm HOT") {
    return (
      <>
        <span>Việc làm</span>
        <span className="fpt-nav-hot-badge">HOT</span>
      </>
    );
  }

  return item.label;
}

export function FptHeader({ className }: { className?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={cn("fpt-header", isMobileMenuOpen && "is-mobile-menu-open", className)}>
      <div className="fpt-container fpt-header-inner">
        <Link className="fpt-logo" href="/" aria-label="FPT Telecom Careers" onClick={closeMobileMenu}>
          <Image src={logo} alt="FPT Telecom" width={139} height={46} priority />
        </Link>

        <nav className="fpt-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const isHotJobItem = item.label === "Việc làm HOT";

            return (
              <div className="fpt-nav-group" key={item.label}>
                <Link className={isHotJobItem ? "fpt-nav-hot-link" : undefined} href={item.href}>
                  <NavLabel item={item} />
                </Link>
                {item.children ? (
                  <div className="fpt-nav-dropdown">
                    {item.children.map((child) => (
                      <Link href={child.href} key={child.label}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="fpt-auth">
          <FptAuthControls />
        </div>

        <button
          className="fpt-menu-button"
          aria-controls="fpt-mobile-menu"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          type="button"
        >
          {isMobileMenuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>
      </div>

      <button
        className="fpt-mobile-menu-backdrop"
        aria-label="Đóng menu"
        aria-hidden={!isMobileMenuOpen}
        onClick={closeMobileMenu}
        tabIndex={isMobileMenuOpen ? 0 : -1}
        type="button"
      />
      <div className="fpt-mobile-menu" id="fpt-mobile-menu" aria-hidden={!isMobileMenuOpen}>
        <nav className="fpt-mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const isHotJobItem = item.label === "Việc làm HOT";

            return (
              <div className="fpt-mobile-nav-group" key={item.label}>
                <Link
                  className={cn("fpt-mobile-nav-link", isHotJobItem && "is-hot")}
                  href={item.href}
                  onClick={closeMobileMenu}
                >
                  <MobileNavLabel item={item} />
                </Link>
                {item.children ? (
                  <div className="fpt-mobile-subnav">
                    {item.children.map((child) => (
                      <Link href={child.href} key={child.label} onClick={closeMobileMenu}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="fpt-mobile-auth">
          <FptAuthControls />
        </div>
      </div>
    </header>
  );
}
