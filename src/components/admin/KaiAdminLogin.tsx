"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

export function KaiAdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/admin/login", {
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        setError("Sai tài khoản hoặc mật khẩu.");
        return;
      }

      router.refresh();
    } catch {
      setError("Không thể đăng nhập lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen overflow-x-hidden bg-[#eef2f8] p-4 text-[#23283b] sm:p-8">
      <section className="m-auto grid w-full min-w-0 max-w-[960px] overflow-hidden border border-[#dfe6f2] bg-white shadow-[0_18px_50px_rgba(31,42,68,0.14)] lg:grid-cols-[360px_1fr]">
        <div className="flex min-h-[260px] min-w-0 flex-col justify-between bg-[#a3062f] p-8 text-white">
          <div>
            <span className="block font-serif text-[64px] font-black leading-[58px]">
              <span>K</span>
              <span className="text-[#8fd0ff]">AI</span>
            </span>
            <span className="block text-[11px] font-bold uppercase leading-none text-white/82">
              INSIGHT AND ADVICE
            </span>
          </div>
          <div>
            <h1 className="text-[30px] font-black leading-tight">Đăng nhập quản trị</h1>
            <p className="mt-3 max-w-[260px] text-[15px] leading-6 text-white/78">
              Khu vực quản trị nội dung của kaireview.
            </p>
          </div>
        </div>

        <form className="min-w-0 p-6 sm:p-9" onSubmit={handleSubmit}>
          <div className="mb-7">
            <h2 className="text-[26px] font-black leading-tight text-[#2d3245]">Administrator</h2>
            <p className="mt-2 text-[15px] leading-6 text-[#747b8c]">
              Nhập tài khoản để vào bảng điều khiển.
            </p>
          </div>

          <label className="mb-4 block min-w-0">
            <span className="mb-2 block text-[14px] font-bold text-[#51596b]">Tài khoản</span>
            <span className="flex h-12 w-full min-w-0 items-center border border-[#d7dfeb] bg-white px-4 focus-within:border-[#b00632]">
              <UserRound className="mr-3 size-5 shrink-0 text-[#7e8798]" strokeWidth={1.9} />
              <input
                autoComplete="username"
                className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-[#23283b] outline-none placeholder:text-[#9aa2b0]"
                name="username"
                placeholder="admin"
                required
                type="text"
              />
            </span>
          </label>

          <label className="mb-5 block min-w-0">
            <span className="mb-2 block text-[14px] font-bold text-[#51596b]">Mật khẩu</span>
            <span className="flex h-12 w-full min-w-0 items-center border border-[#d7dfeb] bg-white px-4 focus-within:border-[#b00632]">
              <LockKeyhole className="mr-3 size-5 shrink-0 text-[#7e8798]" strokeWidth={1.9} />
              <input
                autoComplete="current-password"
                className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-[#23283b] outline-none placeholder:text-[#9aa2b0]"
                name="password"
                placeholder="Nhập mật khẩu"
                required
                type={isPasswordVisible ? "text" : "password"}
              />
              <button
                aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="ml-3 flex size-8 items-center justify-center text-[#7e8798] transition-colors hover:text-[#b00632]"
                onClick={() => setIsPasswordVisible((current) => !current)}
                type="button"
              >
                {isPasswordVisible ? (
                  <EyeOff className="size-5" strokeWidth={1.9} />
                ) : (
                  <Eye className="size-5" strokeWidth={1.9} />
                )}
              </button>
            </span>
          </label>

          <div
            className={cn(
              "mb-5 min-h-[24px] text-[14px] font-bold leading-6 text-[#c5103d]",
              error ? "opacity-100" : "opacity-0",
            )}
            role="status"
          >
            {error || "Không có lỗi"}
          </div>

          <button
            className="flex h-12 w-full items-center justify-center gap-2 bg-[#b00632] px-5 text-[16px] font-black text-white shadow-[0_8px_18px_rgba(176,6,50,0.22)] transition-colors hover:bg-[#8f0529] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            <LogIn className="size-5" strokeWidth={2.2} />
            {isSubmitting ? "Đang đăng nhập" : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}
