"use client";

import { type FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Eye, EyeOff, LockKeyhole, LogOut, UserRound, X } from "lucide-react";

type AuthMode = "register" | "login";
type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};
type AuthData = {
  user: AuthUser;
  token: string;
};
type AuthResponse = {
  data: AuthData;
};
type MeResponse = {
  data: {
    user: AuthUser;
  };
};
type ChangePasswordResponse = {
  data?: {
    user: AuthUser;
  };
};
type CandidateApplication = {
  id: number;
  createdAt: string;
  job: {
    title: string;
    location: string;
    slug: string;
  };
};
type CandidateApplicationsResponse = {
  data?: CandidateApplication[];
};
type ApiErrorResponse = {
  error?: {
    message?: string;
    details?: Record<string, string>;
  };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const authStorageKey = "fptjobs.auth";
const authChangeEventName = "fptjobs-auth-change";
const candidateApplicationsChangeEventName = "fptjobs-candidate-applications-change";

async function parseJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

async function submitAuth(endpoint: "/api/auth/register" | "/api/auth/login", payload: object) {
  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<AuthResponse & ApiErrorResponse>(response);

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Không thể xử lý yêu cầu. Vui lòng thử lại.");
  }

  return data.data;
}

function readStoredAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(authStorageKey);

    return value ? (JSON.parse(value) as AuthData) : null;
  } catch {
    return null;
  }
}

function storeAuth(auth: AuthData) {
  window.localStorage.setItem(authStorageKey, JSON.stringify(auth));
  window.dispatchEvent(new Event(authChangeEventName));
}

function clearStoredAuth() {
  window.localStorage.removeItem(authStorageKey);
  window.dispatchEvent(new Event(authChangeEventName));
}

export function FptAuthControls() {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<CandidateApplication[]>([]);

  const close = () => setMode(null);
  const closePasswordDialog = () => setIsPasswordDialogOpen(false);
  const handleAuthSuccess = (auth: AuthData) => {
    storeAuth(auth);
    setCurrentUser(auth.user);
    close();
  };
  const logout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setNotifications([]);
    setNotificationOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    const loadCandidateNotifications = (token: string) => {
      fetch(`${apiBaseUrl}/api/candidate/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (response) => {
          if (cancelled || !response.ok) {
            return;
          }

          const data = await parseJson<CandidateApplicationsResponse>(response);
          setNotifications((data.data ?? []).slice(0, 5));
        })
        .catch(() => {
          // Keep the existing notification badge if the API is temporarily unavailable.
        });
    };

    const verifyStoredAuth = () => {
      const storedAuth = readStoredAuth();

      if (!storedAuth) {
        setCurrentUser(null);
        setNotifications([]);
        return;
      }

      setCurrentUser(storedAuth.user);
      loadCandidateNotifications(storedAuth.token);

      fetch(`${apiBaseUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${storedAuth.token}`,
        },
      })
        .then(async (response) => {
          if (cancelled) {
            return;
          }

          if (response.status === 401) {
            clearStoredAuth();
            setCurrentUser(null);
            return;
          }

          if (!response.ok) {
            return;
          }

          const data = await parseJson<MeResponse>(response);
          setCurrentUser(data.data.user);
        })
        .catch(() => {
          // Keep the stored user visible if the local API is temporarily unavailable.
        });
    };

    const refreshCandidateNotifications = () => {
      const storedAuth = readStoredAuth();

      if (storedAuth?.token) {
        loadCandidateNotifications(storedAuth.token);
      }
    };

    window.addEventListener("storage", verifyStoredAuth);
    window.addEventListener(authChangeEventName, verifyStoredAuth);
    window.addEventListener(candidateApplicationsChangeEventName, refreshCandidateNotifications);
    verifyStoredAuth();

    return () => {
      cancelled = true;
      window.removeEventListener("storage", verifyStoredAuth);
      window.removeEventListener(authChangeEventName, verifyStoredAuth);
      window.removeEventListener(candidateApplicationsChangeEventName, refreshCandidateNotifications);
    };
  }, []);

  const modal = (
    <div
      aria-hidden={mode === null}
      aria-label="Đăng ký và đăng nhập"
      className={mode ? "fpt-auth-modal is-open" : "fpt-auth-modal"}
    >
      <button className="fpt-auth-backdrop" onClick={close} type="button" aria-label="Đóng popup" />
      {mode === "register" ? (
        <RegisterDialog close={close} onAuthSuccess={handleAuthSuccess} switchMode={setMode} />
      ) : null}
      {mode === "login" ? (
        <LoginDialog close={close} onAuthSuccess={handleAuthSuccess} switchMode={setMode} />
      ) : null}
    </div>
  );
  const passwordModal = (
    <div
      aria-hidden={!isPasswordDialogOpen}
      aria-label="Đổi mật khẩu"
      className={isPasswordDialogOpen ? "fpt-auth-modal is-open" : "fpt-auth-modal"}
    >
      <button className="fpt-auth-backdrop" onClick={closePasswordDialog} type="button" aria-label="Đóng popup" />
      <ChangePasswordDialog close={closePasswordDialog} onUserChange={setCurrentUser} />
    </div>
  );

  if (currentUser) {
    return (
      <>
        <div className="fpt-account">
          <div className="fpt-notification-menu">
            <button
              className="fpt-account-bell"
              onClick={() => setNotificationOpen((isOpen) => !isOpen)}
              type="button"
              aria-label="Thông báo"
              aria-expanded={isNotificationOpen}
            >
              <Bell aria-hidden="true" size={22} />
              {notifications.length > 0 ? <strong aria-hidden="true">{notifications.length}</strong> : <span aria-hidden="true" />}
            </button>
            {isNotificationOpen ? (
              <div className="fpt-notification-dropdown">
                <h3>Thông báo</h3>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <Link
                      href="/ung-vien#vi-tri-da-ung-tuyen"
                      key={notification.id}
                      onClick={() => setNotificationOpen(false)}
                    >
                      <strong>Hồ sơ đã được nộp</strong>
                      <span>{notification.job.title}</span>
                      <small>{notification.job.location}</small>
                    </Link>
                  ))
                ) : (
                  <p>Chưa có thông báo mới.</p>
                )}
              </div>
            ) : null}
          </div>
          <div className="fpt-account-menu">
            <button
              className="fpt-account-trigger"
              type="button"
              title={currentUser.email}
              aria-label={`${currentUser.fullName} - Quản lý tài khoản`}
            >
              <Image
                src="/images/fptjobs/fptjobs-com-public-imgs-version2-fox-avt.png"
                alt=""
                width={42}
                height={42}
              />
              <span>
                <strong>{currentUser.fullName}</strong>
                <small>
                  Quản lý tài khoản
                  <ChevronDown aria-hidden="true" size={14} />
                </small>
              </span>
            </button>
            <div className="fpt-account-dropdown">
              <Link href="/ung-vien">
                <UserRound aria-hidden="true" size={16} />
                Thông tin cá nhân
              </Link>
              <button onClick={() => setIsPasswordDialogOpen(true)} type="button">
                <LockKeyhole aria-hidden="true" size={16} />
                Đổi mật khẩu
              </button>
              <button onClick={logout} type="button">
                <LogOut aria-hidden="true" size={16} />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
        {isPasswordDialogOpen ? createPortal(passwordModal, document.body) : null}
      </>
    );
  }

  return (
    <>
      <button className="fpt-register" onClick={() => setMode("register")} type="button">
        Đăng ký
      </button>
      <button className="fpt-login" onClick={() => setMode("login")} type="button">
        Đăng nhập
      </button>

      {mode ? createPortal(modal, document.body) : null}
    </>
  );
}

function ChangePasswordDialog({
  close,
  onUserChange,
}: {
  close: () => void;
  onUserChange: (user: AuthUser) => void;
}) {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmNewPassword = String(form.get("confirmNewPassword") ?? "");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage("Mật khẩu mới nhập lại chưa khớp.");
      return;
    }

    const storedAuth = readStoredAuth();

    if (!storedAuth) {
      setMessage("Vui lòng đăng nhập lại để đổi mật khẩu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedAuth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });
      const data = await parseJson<ChangePasswordResponse & ApiErrorResponse>(response);

      if (!response.ok) {
        throw new Error(data.error?.message ?? "Không thể đổi mật khẩu.");
      }

      if (data.data?.user) {
        const nextAuth = {
          ...storedAuth,
          user: data.data.user,
        };
        storeAuth(nextAuth);
        onUserChange(data.data.user);
      }

      setIsSuccess(true);
      setMessage("Mật khẩu đã được cập nhật.");
      event.currentTarget.reset();
    } catch (changePasswordError) {
      setMessage(changePasswordError instanceof Error ? changePasswordError.message : "Không thể đổi mật khẩu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div aria-labelledby="doi-mat-khau-title" aria-modal="true" className="fpt-auth-dialog is-password" role="dialog">
      <button className="fpt-auth-close" onClick={close} type="button" aria-label="Đóng popup đổi mật khẩu">
        <X aria-hidden="true" size={26} />
      </button>
      <h2 id="doi-mat-khau-title">Đổi mật khẩu</h2>
      <form className="fpt-auth-form fpt-change-password-form" onSubmit={submitPasswordChange}>
        <label>
          <span>Mật khẩu cũ *</span>
          <input name="currentPassword" placeholder="************" required type="password" />
        </label>
        <label>
          <span>Mật khẩu mới *</span>
          <input minLength={8} name="newPassword" placeholder="************" required type="password" />
        </label>
        <label>
          <span>Nhập lại mật khẩu mới *</span>
          <input minLength={8} name="confirmNewPassword" placeholder="************" required type="password" />
        </label>
        {message ? <p className={isSuccess ? "fpt-auth-message is-success" : "fpt-auth-message is-error"}>{message}</p> : null}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang xác nhận..." : "Xác nhận"}
        </button>
      </form>
    </div>
  );
}

function RegisterDialog({
  close,
  onAuthSuccess,
  switchMode,
}: {
  close: () => void;
  onAuthSuccess: (auth: AuthData) => void;
  switchMode: (mode: AuthMode) => void;
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const submitRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại chưa khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = await submitAuth("/api/auth/register", {
        fullName,
        email,
        password,
        confirmPassword,
      });
      onAuthSuccess(auth);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Đăng ký chưa thành công.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div aria-labelledby="dang-ky-title" aria-modal="true" className="fpt-auth-dialog is-register" role="dialog">
      <button className="fpt-auth-close" onClick={close} type="button" aria-label="Đóng popup đăng ký">
        <X aria-hidden="true" size={26} />
      </button>
      <span className="fpt-auth-eyebrow">Đăng ký</span>
      <h2 id="dang-ky-title">Khai Phóng Sự Nghiệp</h2>
      <p>Điểm khởi đầu của những giấc mơ lớn!</p>
      <form className="fpt-auth-form" onSubmit={submitRegister}>
        <label>
          <span>Chúng tôi sẽ gọi bạn là gì ? *</span>
          <input name="fullName" placeholder="Họ và tên" required />
        </label>
        <label>
          <span>Địa chỉ Email *</span>
          <input name="email" placeholder="kickstart-career@fpt.com" required type="email" />
        </label>
        <label>
          <span>Mật khẩu *</span>
          <span className="fpt-auth-password">
            <input minLength={8} name="password" placeholder="************" required type={isPasswordVisible ? "text" : "password"} />
            <button
              aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="fpt-auth-password-toggle"
              onClick={() => setPasswordVisible((value) => !value)}
              type="button"
            >
              {isPasswordVisible ? <Eye aria-hidden="true" size={20} /> : <EyeOff aria-hidden="true" size={20} />}
            </button>
          </span>
        </label>
        <label>
          <span>Nhập lại Mật khẩu *</span>
          <span className="fpt-auth-password">
            <input
              minLength={8}
              name="confirmPassword"
              placeholder="************"
              required
              type={isConfirmPasswordVisible ? "text" : "password"}
            />
            <button
              aria-label={isConfirmPasswordVisible ? "Ẩn mật khẩu nhập lại" : "Hiện mật khẩu nhập lại"}
              className="fpt-auth-password-toggle"
              onClick={() => setConfirmPasswordVisible((value) => !value)}
              type="button"
            >
              {isConfirmPasswordVisible ? <Eye aria-hidden="true" size={20} /> : <EyeOff aria-hidden="true" size={20} />}
            </button>
          </span>
        </label>
        <label className="fpt-auth-check">
          <input required type="checkbox" />
          <span>Đồng ý với các điều khoản và chính sách của chúng tôi</span>
        </label>
        {error ? <p className="fpt-auth-message is-error">{error}</p> : null}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
      <small>
        Bạn đã có tài khoản?{" "}
        <button className="fpt-auth-switch" onClick={() => switchMode("login")} type="button">
          Đăng nhập ngay
        </button>
      </small>
    </div>
  );
}

function LoginDialog({
  close,
  onAuthSuccess,
  switchMode,
}: {
  close: () => void;
  onAuthSuccess: (auth: AuthData) => void;
  switchMode: (mode: AuthMode) => void;
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setIsSubmitting(true);

    try {
      const auth = await submitAuth("/api/auth/login", {
        email,
        password,
      });
      onAuthSuccess(auth);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Đăng nhập chưa thành công.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div aria-labelledby="dang-nhap-title" aria-modal="true" className="fpt-auth-dialog is-login" role="dialog">
      <button className="fpt-auth-close" onClick={close} type="button" aria-label="Đóng popup đăng nhập">
        <X aria-hidden="true" size={26} />
      </button>
      <span className="fpt-auth-eyebrow">Đăng nhập</span>
      <h2 id="dang-nhap-title">Chào Mừng Bạn</h2>
      <p>
        Bước vào thế giới việc làm! Cơ hội đang chờ!
        <br />
        Bạn đã sẵn sàng chinh phục thử thách chưa?
      </p>
      <form className="fpt-auth-form" onSubmit={submitLogin}>
        <label>
          <span>Địa chỉ Email *</span>
          <input autoComplete="email" name="email" placeholder="example@gmail.com" required type="email" />
        </label>
        <label>
          <span>Mật khẩu *</span>
          <span className="fpt-auth-password">
            <input name="password" placeholder="************" required type={isPasswordVisible ? "text" : "password"} />
            <button
              aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="fpt-auth-password-toggle"
              onClick={() => setPasswordVisible((value) => !value)}
              type="button"
            >
              {isPasswordVisible ? <Eye aria-hidden="true" size={20} /> : <EyeOff aria-hidden="true" size={20} />}
            </button>
          </span>
        </label>
        <div className="fpt-auth-row">
          <label className="fpt-auth-check">
            <input type="checkbox" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <button className="fpt-auth-forgot" type="button">
            Quên mật khẩu
          </button>
        </div>
        {error ? <p className="fpt-auth-message is-error">{error}</p> : null}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <small>
        Bạn chưa có tài khoản?{" "}
        <button className="fpt-auth-switch" onClick={() => switchMode("register")} type="button">
          Đăng ký ngay
        </button>
      </small>
    </div>
  );
}
