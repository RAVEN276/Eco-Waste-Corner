"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StationScene } from "@/components/art/BinArt";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckIcon } from "@/components/ui/Icons";
import { InlineNotice, Spinner } from "@/components/ui/States";
import {
  LOGIN_EMAIL_SENDER,
  checkVerified,
  registerWithEmail,
  resendVerification,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOut,
} from "@/lib/firebase/auth";
import { FIREBASE_NOT_CONFIGURED_MESSAGE, isFirebaseConfigured } from "@/lib/firebase/config";
import { describeFirebaseError } from "@/lib/firebase/errors";
import {
  EMAIL_INVALID_ERROR,
  MIN_PASSWORD_LENGTH,
  PASSWORD_REQUIRED_ERROR,
  PASSWORD_SHORT_ERROR,
  isValidEmail,
  normalizeEmail,
} from "@/lib/validation/email";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

type Mode = "masuk" | "daftar";
type Stage = "form" | "lupa" | "lupa-terkirim" | "verifikasi";
type Busy = "google" | "submit" | "resend" | "check" | null;

// Jeda sebelum email verifikasi boleh dikirim ulang, supaya klik berulang tidak membanjiri
// kotak masuk atau menghabiskan kuota pengiriman Firebase.
const RESEND_SECONDS = 60;

const INPUT_CLASS =
  "mt-1.5 min-h-12 w-full rounded-ctl border-2 border-edge bg-white px-3 text-base placeholder:text-muted disabled:bg-paper aria-[invalid=true]:border-brick";

function safeNextPath(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

export function LoginPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = safeNextPath(params.get("next"));

  const authStatus = useUserStore((s) => s.authStatus);
  const storeError = useUserStore((s) => s.error);
  const clearError = useUserStore((s) => s.clearError);

  const [mode, setMode] = useState<Mode>("masuk");
  const [stage, setStage] = useState<Stage>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (authStatus === "authenticated") router.replace(nextPath);
  }, [authStatus, nextPath, router]);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  const clearMessages = () => {
    setFormError(null);
    setNotice(null);
    clearError();
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setEmailError(null);
    setPasswordError(null);
    clearMessages();
  };

  const toForm = () => {
    setStage("form");
    clearMessages();
  };

  const handleGoogle = async () => {
    clearMessages();
    setBusy("google");
    try {
      await signInWithGoogle();
    } catch (error) {
      setFormError(describeFirebaseError(error));
    } finally {
      setBusy(null);
    }
  };

  const validate = (needPassword: boolean): boolean => {
    const emailOk = isValidEmail(email);
    setEmailError(emailOk ? null : EMAIL_INVALID_ERROR);
    let passwordOk = true;
    if (needPassword) {
      if (!password) {
        setPasswordError(PASSWORD_REQUIRED_ERROR);
        passwordOk = false;
      } else if (mode === "daftar" && password.length < MIN_PASSWORD_LENGTH) {
        setPasswordError(PASSWORD_SHORT_ERROR);
        passwordOk = false;
      } else {
        setPasswordError(null);
      }
    }
    return emailOk && passwordOk;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    if (!validate(true)) return;

    setBusy("submit");
    try {
      if (mode === "daftar") {
        const { verificationError } = await registerWithEmail(email, password);
        setStage("verifikasi");
        if (verificationError) setFormError(verificationError);
        else setWait(RESEND_SECONDS);
      } else {
        const user = await signInWithEmail(email, password);
        if (!user.emailVerified) {
          setStage("verifikasi");
          setNotice("Emailmu belum terverifikasi. Kirim ulang email verifikasi bila perlu.");
        }
        // Bila sudah terverifikasi, AuthProvider membuka akses dan halaman ini berpindah sendiri.
      }
    } catch (error) {
      setFormError(describeFirebaseError(error));
    } finally {
      setBusy(null);
    }
  };

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    if (!validate(false)) return;
    setBusy("submit");
    try {
      await sendPasswordReset(email);
      setStage("lupa-terkirim");
    } catch (error) {
      setFormError(describeFirebaseError(error));
    } finally {
      setBusy(null);
    }
  };

  const handleResend = async () => {
    if (wait > 0) return;
    clearMessages();
    setBusy("resend");
    try {
      await resendVerification();
      setWait(RESEND_SECONDS);
      setNotice("Email verifikasi dikirim ulang.");
    } catch (error) {
      setFormError(describeFirebaseError(error));
    } finally {
      setBusy(null);
    }
  };

  const handleCheck = async () => {
    clearMessages();
    setBusy("check");
    try {
      const verified = await checkVerified();
      if (!verified) {
        setFormError("Emailmu belum terverifikasi. Buka tautan di email itu dulu, lalu coba lagi.");
      }
      // Bila sudah, AuthProvider membuka akses dan halaman ini berpindah sendiri.
    } catch (error) {
      setFormError(describeFirebaseError(error));
    } finally {
      setBusy(null);
    }
  };

  const handleLeaveVerification = async () => {
    setBusy("check");
    try {
      await signOut();
    } finally {
      setBusy(null);
      setPassword("");
      toForm();
    }
  };

  const disabled = !isFirebaseConfigured || busy !== null;
  const shownError = formError ?? storeError;
  const shownEmail = normalizeEmail(email);

  return (
    <div className="grid min-h-[calc(100dvh-4rem)] md:grid-cols-2">
      <div className="flex flex-col justify-center gap-10 border-b-2 border-ink bg-cobalt px-4 py-10 text-white sm:px-8 md:border-b-0 md:border-r-2 md:px-12 md:py-16">
        <div className="fade-up">
          <h1 className="text-6xl sm:text-7xl">Masuk ke Eco Waste Corner</h1>
          <p className="mt-5 max-w-md text-lg">
            Masuk dengan akun Google, atau daftar dan masuk dengan email dan kata sandi. Email apa
            pun bisa dipakai, termasuk Gmail. Kamu tidak perlu memasukkan NIM.
          </p>
          <p className="mt-3 max-w-md text-sm text-mist">
            Pendaftaran dengan email perlu verifikasi: kami mengirim tautan ke emailmu, dan akunnya
            aktif setelah tautan itu dibuka.
          </p>
        </div>
        <div className="hidden max-w-md overflow-hidden rounded-sheet border-2 border-ink bg-paper p-3 md:block">
          <StationScene className="block w-full" />
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8 md:px-12">
        <Card
          strong
          className="fade-up w-full max-w-md space-y-6"
          style={{ ["--delay" as string]: "150ms" }}
        >
          {!isFirebaseConfigured ? (
            <InlineNotice tone="warning">
              <strong>Login belum aktif.</strong> {FIREBASE_NOT_CONFIGURED_MESSAGE}
            </InlineNotice>
          ) : null}

          {shownError ? <InlineNotice tone="error">{shownError}</InlineNotice> : null}
          {notice ? <InlineNotice tone="info">{notice}</InlineNotice> : null}

          {stage === "verifikasi" ? (
            <div className="space-y-5">
              <div className="space-y-3 text-center" role="status">
                <CheckIcon className="mx-auto size-10 text-organik" />
                <h2 className="text-4xl">Verifikasi email kamu</h2>
                <p className="text-sm text-muted">
                  Tautan verifikasi dikirim ke{" "}
                  <strong className="break-words text-ink">{shownEmail}</strong>. Buka tautannya, lalu
                  kembali ke sini dan tekan tombol di bawah.
                </p>
              </div>

              <div className="rounded-plate border-2 border-rule bg-paper p-4 text-left text-sm">
                <p className="font-bold">Belum ada di kotak masuk?</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">
                  <li>Tunggu beberapa menit, lalu cek folder Junk atau Spam.</li>
                  {LOGIN_EMAIL_SENDER ? (
                    <li>
                      Pengirimnya{" "}
                      <strong className="break-words text-ink">{LOGIN_EMAIL_SENDER}</strong>.
                    </li>
                  ) : null}
                  <li>Salah ketik email? Kembali, lalu daftar dengan alamat yang benar.</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleCheck} disabled={disabled}>
                  {busy === "check" ? <Spinner label="Memeriksa" /> : null}
                  Saya sudah verifikasi
                </Button>
                <Button variant="outline" onClick={handleResend} disabled={disabled || wait > 0}>
                  {busy === "resend" ? <Spinner label="Mengirim" /> : null}
                  {wait > 0 ? `Kirim ulang email (${wait} dtk)` : "Kirim ulang email verifikasi"}
                </Button>
                <Button variant="ghost" onClick={handleLeaveVerification} disabled={disabled}>
                  Kembali
                </Button>
              </div>
            </div>
          ) : stage === "lupa-terkirim" ? (
            <div className="space-y-5">
              <div className="space-y-3 text-center" role="status">
                <CheckIcon className="mx-auto size-10 text-organik" />
                <h2 className="text-4xl">Cek email kamu</h2>
                <p className="text-sm text-muted">
                  Jika <strong className="break-words text-ink">{shownEmail}</strong> terdaftar,
                  tautan untuk mengatur ulang kata sandi sudah dikirim. Cek juga folder Junk atau
                  Spam.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={toForm}>
                Kembali ke halaman masuk
              </Button>
            </div>
          ) : stage === "lupa" ? (
            <form onSubmit={handleReset} noValidate className="space-y-4">
              <div>
                <h2 className="text-4xl">Lupa kata sandi</h2>
                <p className="mt-1 text-sm text-muted">
                  Masukkan email akunmu. Kami kirim tautan untuk membuat kata sandi baru.
                </p>
              </div>
              <div>
                <label htmlFor="login-email" className="block text-sm font-bold">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="nama@gmail.com"
                  disabled={disabled}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? "login-email-error" : undefined}
                  className={INPUT_CLASS}
                />
                {emailError ? (
                  <p
                    id="login-email-error"
                    role="alert"
                    className="mt-1.5 text-sm font-bold text-brick"
                  >
                    {emailError}
                  </p>
                ) : null}
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={disabled}>
                {busy === "submit" ? <Spinner label="Mengirim" /> : null}
                Kirim tautan reset
              </Button>
              <Button variant="ghost" className="w-full" onClick={toForm} disabled={disabled}>
                Kembali
              </Button>
            </form>
          ) : (
            <>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoogle}
                disabled={disabled}
              >
                {busy === "google" ? <Spinner label="Membuka Google" /> : <GoogleMark />}
                Masuk dengan Google
              </Button>
              <div className="flex items-center gap-3 text-sm text-muted" aria-hidden="true">
                <span className="h-0.5 flex-1 bg-rule" />
                atau pakai email
                <span className="h-0.5 flex-1 bg-rule" />
              </div>

              <div role="group" aria-label="Masuk atau daftar" className="grid grid-cols-2 gap-2">
                {(["masuk", "daftar"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={mode === option}
                    onClick={() => switchMode(option)}
                    disabled={disabled}
                    className={cn(
                      "min-h-11 rounded-ctl border-2 px-4 text-sm font-bold transition-colors duration-150 disabled:opacity-55",
                      mode === option
                        ? "border-ink bg-ink text-white"
                        : "border-edge bg-white hover:bg-cobalt-soft",
                    )}
                  >
                    {option === "masuk" ? "Masuk" : "Daftar"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-bold">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder="nama@gmail.com"
                    disabled={disabled}
                    aria-invalid={emailError ? true : undefined}
                    aria-describedby={emailError ? "login-email-error" : undefined}
                    className={INPUT_CLASS}
                  />
                  {emailError ? (
                    <p
                      id="login-email-error"
                      role="alert"
                      className="mt-1.5 text-sm font-bold text-brick"
                    >
                      {emailError}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-bold">
                    Kata sandi
                  </label>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "daftar" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    disabled={disabled}
                    aria-invalid={passwordError ? true : undefined}
                    aria-describedby={
                      passwordError
                        ? "login-password-error"
                        : mode === "daftar"
                          ? "login-password-hint"
                          : undefined
                    }
                    className={INPUT_CLASS}
                  />
                  {mode === "daftar" && !passwordError ? (
                    <p id="login-password-hint" className="mt-1.5 text-sm text-muted">
                      Minimal {MIN_PASSWORD_LENGTH} karakter.
                    </p>
                  ) : null}
                  {passwordError ? (
                    <p
                      id="login-password-error"
                      role="alert"
                      className="mt-1.5 text-sm font-bold text-brick"
                    >
                      {passwordError}
                    </p>
                  ) : null}
                  <label className="mt-2 flex min-h-11 items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      className="size-5 accent-cobalt"
                      checked={showPassword}
                      onChange={(event) => setShowPassword(event.target.checked)}
                    />
                    Tampilkan kata sandi
                  </label>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={disabled}>
                  {busy === "submit" ? <Spinner label="Memproses" /> : null}
                  {mode === "daftar" ? "Daftar" : "Masuk"}
                </Button>
                {mode === "masuk" ? (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      clearMessages();
                      setStage("lupa");
                    }}
                    disabled={disabled}
                  >
                    Lupa kata sandi?
                  </Button>
                ) : null}
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
