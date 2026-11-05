"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InlineNotice, Spinner } from "@/components/ui/States";
import {
  DomainError,
  completeLoginLink,
  getStoredLoginEmail,
  isLoginLink,
  sendLoginLink,
  signInWithGoogle,
} from "@/lib/firebase/auth";
import { FIREBASE_NOT_CONFIGURED_MESSAGE, isFirebaseConfigured } from "@/lib/firebase/config";
import { describeFirebaseError } from "@/lib/firebase/errors";
import { EMAIL_DOMAIN_ERROR, UPJ_STUDENT_DOMAIN, isUpjStudentEmail } from "@/lib/validation/email";
import { useUserStore } from "@/store/useUserStore";

type Stage = "form" | "sent" | "confirm-email" | "completing";

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

  const [stage, setStage] = useState<Stage>("form");
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"google" | "link" | null>(null);

  useEffect(() => {
    if (authStatus === "authenticated") router.replace(nextPath);
  }, [authStatus, nextPath, router]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const url = window.location.href;
    if (!isLoginLink(url)) return;

    const stored = getStoredLoginEmail();
    if (!stored) {
      queueMicrotask(() => setStage("confirm-email"));
      return;
    }
    queueMicrotask(() => setStage("completing"));
    completeLoginLink(stored, url).catch((error: unknown) => {
      setStage("form");
      setFormError(error instanceof DomainError ? error.message : describeFirebaseError(error));
    });
  }, []);

  const handleGoogle = async () => {
    setFormError(null);
    clearError();
    setBusy("google");
    try {
      await signInWithGoogle();
    } catch (error) {
      setFormError(error instanceof DomainError ? error.message : describeFirebaseError(error));
    } finally {
      setBusy(null);
    }
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    clearError();

    if (!isUpjStudentEmail(email)) {
      setFieldError(EMAIL_DOMAIN_ERROR);
      return;
    }
    setFieldError(null);
    setBusy("link");
    try {
      if (stage === "confirm-email") {
        setStage("completing");
        await completeLoginLink(email, window.location.href);
      } else {
        await sendLoginLink(email);
        setStage("sent");
      }
    } catch (error) {
      setStage(stage === "confirm-email" ? "confirm-email" : "form");
      setFormError(error instanceof DomainError ? error.message : describeFirebaseError(error));
    } finally {
      setBusy(null);
    }
  };

  const disabled = !isFirebaseConfigured || busy !== null;
  const shownError = formError ?? storeError;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_1.1fr] md:py-20">
      <div className="flex flex-col justify-center">
        <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">
          Masuk ke Eco Waste Corner
        </h1>
        <p className="mt-4 text-lg text-muted">
          Masuk dengan akun Google, atau minta tautan login ke email Student UPJ. Kamu tidak perlu
          memasukkan NIM.
        </p>
        <p className="mt-3 text-sm text-muted">
          Tautan login lewat email hanya untuk alamat berakhiran{" "}
          <strong className="text-charcoal">{UPJ_STUDENT_DOMAIN}</strong>.
        </p>
      </div>

      <Card className="space-y-6">
        {!isFirebaseConfigured ? (
          <InlineNotice tone="warning">
            <strong>Login belum aktif.</strong> {FIREBASE_NOT_CONFIGURED_MESSAGE}
          </InlineNotice>
        ) : null}

        {shownError ? <InlineNotice tone="error">{shownError}</InlineNotice> : null}

        {stage === "sent" ? (
          <div className="space-y-3 text-center" role="status">
            <CheckCircle2 aria-hidden="true" className="mx-auto size-10 text-leaf-deep" />
            <h2 className="text-xl font-bold">Cek email kamu</h2>
            <p className="text-sm text-muted">
              Tautan login dikirim ke{" "}
              <strong className="text-charcoal">{email.trim().toLowerCase()}</strong>. Buka tautan
              itu di perangkat ini.
            </p>
            <Button variant="outline" onClick={() => setStage("form")}>
              Kirim ke email lain
            </Button>
          </div>
        ) : stage === "completing" ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Spinner className="size-8 text-leaf-deep" label="Menyelesaikan login" />
            <p className="text-sm text-muted" aria-hidden="true">
              Menyelesaikan login...
            </p>
          </div>
        ) : (
          <>
            {stage === "form" ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleGoogle}
                  disabled={disabled}
                >
                  {busy === "google" ? <Spinner label="Membuka Google" /> : <GoogleMark />}
                  Masuk dengan Google
                </Button>
                <div className="flex items-center gap-3 text-sm text-muted" aria-hidden="true">
                  <span className="h-px flex-1 bg-line" />
                  atau
                  <span className="h-px flex-1 bg-line" />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">
                Masukkan email yang kamu pakai saat meminta tautan untuk menyelesaikan login.
              </p>
            )}

            <form onSubmit={handleEmailSubmit} noValidate className="space-y-3">
              <div>
                <label htmlFor="email-upj" className="block text-sm font-semibold">
                  Email Student UPJ
                </label>
                <input
                  id="email-upj"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                  placeholder={`nama${UPJ_STUDENT_DOMAIN}`}
                  disabled={disabled}
                  aria-invalid={fieldError ? true : undefined}
                  aria-describedby={fieldError ? "email-upj-error" : undefined}
                  className="mt-1.5 min-h-12 w-full rounded-lg border-2 border-line bg-white px-3 text-base placeholder:text-muted disabled:bg-sand aria-[invalid=true]:border-brick"
                />
                {fieldError ? (
                  <p
                    id="email-upj-error"
                    role="alert"
                    className="mt-1.5 text-sm font-medium text-brick"
                  >
                    {fieldError}
                  </p>
                ) : null}
              </div>
              <Button type="submit" variant="mint" size="lg" className="w-full" disabled={disabled}>
                {busy === "link" ? (
                  <Spinner label="Mengirim" />
                ) : (
                  <Mail aria-hidden="true" className="size-5" />
                )}
                {stage === "confirm-email" ? "Selesaikan login" : "Kirim tautan login"}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
