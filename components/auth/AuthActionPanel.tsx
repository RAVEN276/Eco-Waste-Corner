"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { StationScene } from "@/components/art/BinArt";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertIcon, CheckIcon } from "@/components/ui/Icons";
import { InlineNotice, LoadingState, Spinner } from "@/components/ui/States";
import {
  applyEmailVerificationCode,
  confirmResetPassword,
  verifyResetCode,
} from "@/lib/firebase/auth";
import { FIREBASE_NOT_CONFIGURED_MESSAGE, isFirebaseConfigured } from "@/lib/firebase/config";
import { describeFirebaseError } from "@/lib/firebase/errors";

const MIN_RESET_PASSWORD_LENGTH = 6;

const INPUT_CLASS =
  "mt-1.5 min-h-12 w-full rounded-ctl border-2 border-edge bg-surface px-3 text-base placeholder:text-muted disabled:bg-paper aria-[invalid=true]:border-brick-text";

type ActionState =
  | { status: "loading"; label: string }
  | { status: "valid"; email: string }
  | { status: "reset-success"; email: string }
  | { status: "verify-success" }
  | { status: "error"; message: string };

const MISSING_LINK_MESSAGE =
  "Tautan tidak lengkap atau tidak dikenal. Pastikan kamu membuka tautan langsung dari email.";

/** Penangan aksi Firebase Auth (/auth/action) untuk reset kata sandi dan verifikasi email. */
export function AuthActionPanel() {
  const params = useSearchParams();
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  const supported = Boolean(oobCode) && (mode === "resetPassword" || mode === "verifyEmail");

  const [state, setState] = useState<ActionState>(() => {
    if (!isFirebaseConfigured) {
      return { status: "error", message: FIREBASE_NOT_CONFIGURED_MESSAGE };
    }
    if (!supported) {
      return { status: "error", message: MISSING_LINK_MESSAGE };
    }
    return {
      status: "loading",
      label:
        mode === "verifyEmail"
          ? "Memverifikasi alamat email"
          : "Memeriksa tautan atur ulang kata sandi",
    };
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !supported || !oobCode) return;
    let cancelled = false;

    if (mode === "resetPassword") {
      verifyResetCode(oobCode)
        .then((email) => {
          if (!cancelled) setState({ status: "valid", email });
        })
        .catch((error: unknown) => {
          if (!cancelled) setState({ status: "error", message: describeFirebaseError(error) });
        });
    } else if (mode === "verifyEmail") {
      applyEmailVerificationCode(oobCode)
        .then(() => {
          if (!cancelled) setState({ status: "verify-success" });
        })
        .catch((error: unknown) => {
          if (!cancelled) setState({ status: "error", message: describeFirebaseError(error) });
        });
    }

    return () => {
      cancelled = true;
    };
  }, [mode, oobCode, supported]);

  const validate = (): boolean => {
    let valid = true;
    if (!newPassword) {
      setPasswordError("Masukkan kata sandi baru.");
      valid = false;
    } else if (newPassword.length < MIN_RESET_PASSWORD_LENGTH) {
      setPasswordError(`Kata sandi minimal ${MIN_RESET_PASSWORD_LENGTH} karakter.`);
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!confirmPassword) {
      setConfirmError("Masukkan ulang kata sandi baru untuk konfirmasi.");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError("Konfirmasi kata sandi tidak cocok.");
      valid = false;
    } else {
      setConfirmError(null);
    }

    return valid;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    if (state.status !== "valid" || !oobCode || !validate()) return;

    setSubmitting(true);
    try {
      await confirmResetPassword(oobCode, newPassword);
      setState({ status: "reset-success", email: state.email });
    } catch (error) {
      setSubmitError(describeFirebaseError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100dvh-4rem)] md:grid-cols-2">
      <div className="flex flex-col justify-center gap-10 border-b-2 border-line bg-cobalt px-4 py-10 text-white sm:px-8 md:border-b-0 md:border-r-2 md:px-12 md:py-16">
        <div className="fade-up">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl">
            {mode === "verifyEmail" ? "Verifikasi akunmu" : "Atur ulang kata sandi"}
          </h1>
          <p className="mt-5 max-w-md text-lg">
            {mode === "verifyEmail"
              ? "Konfirmasi alamat email supaya akun Eco Waste Corner UPJ milikmu siap dipakai."
              : "Buat kata sandi baru untuk akun Eco Waste Corner UPJ milikmu agar bisa masuk kembali."}
          </p>
        </div>
        <div className="hidden max-w-md overflow-hidden rounded-sheet border-2 border-line bg-paper p-3 md:block">
          <StationScene className="block w-full" />
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8 md:px-12">
        <Card
          strong
          className="fade-up w-full max-w-md"
          style={{ ["--delay" as string]: "150ms" }}
        >
          {!isFirebaseConfigured ? (
            <InlineNotice tone="warning" className="mb-5">
              <strong>Layanan belum aktif.</strong> {FIREBASE_NOT_CONFIGURED_MESSAGE}
            </InlineNotice>
          ) : null}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={state.status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {state.status === "loading" ? (
                <LoadingState label={state.label} className="py-12" />
              ) : state.status === "valid" ? (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div>
                    <h2 className="text-4xl">Buat kata sandi baru</h2>
                    <p className="mt-1.5 text-sm text-muted">
                      Untuk akun <strong className="break-all text-ink">{state.email}</strong>
                    </p>
                  </div>

                  {submitError ? <InlineNotice tone="error">{submitError}</InlineNotice> : null}

                  <div>
                    <label htmlFor="reset-password" className="block text-sm font-bold">
                      Kata sandi baru
                    </label>
                    <input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(event.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      disabled={submitting}
                      aria-invalid={passwordError ? true : undefined}
                      aria-describedby={passwordError ? "reset-password-error" : "reset-password-hint"}
                      className={INPUT_CLASS}
                    />
                    {!passwordError ? (
                      <p id="reset-password-hint" className="mt-1.5 text-sm text-muted">
                        Minimal {MIN_RESET_PASSWORD_LENGTH} karakter.
                      </p>
                    ) : (
                      <p
                        id="reset-password-error"
                        role="alert"
                        className="mt-1.5 text-sm font-bold text-brick-text"
                      >
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="reset-password-confirm" className="block text-sm font-bold">
                      Konfirmasi kata sandi baru
                    </label>
                    <input
                      id="reset-password-confirm"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        if (confirmError) setConfirmError(null);
                      }}
                      disabled={submitting}
                      aria-invalid={confirmError ? true : undefined}
                      aria-describedby={confirmError ? "reset-confirm-error" : undefined}
                      className={INPUT_CLASS}
                    />
                    {confirmError ? (
                      <p
                        id="reset-confirm-error"
                        role="alert"
                        className="mt-1.5 text-sm font-bold text-brick-text"
                      >
                        {confirmError}
                      </p>
                    ) : null}

                    <label className="mt-2 flex min-h-11 items-center gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        className="size-5 accent-link"
                        checked={showPassword}
                        onChange={(event) => setShowPassword(event.target.checked)}
                      />
                      Tampilkan kata sandi
                    </label>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? <Spinner label="Menyimpan" /> : null}
                    Simpan kata sandi baru
                  </Button>
                </form>
              ) : state.status === "reset-success" ? (
                <div className="space-y-5 text-center" role="status">
                  <CheckIcon className="mx-auto size-10 text-organik" />
                  <h2 className="text-4xl">Kata sandi diperbarui</h2>
                  <p className="text-sm text-muted">
                    Kata sandi untuk <strong className="break-all text-ink">{state.email}</strong>{" "}
                    berhasil diubah. Silakan masuk dengan kata sandi barumu.
                  </p>
                  <Button href="/login" size="lg" className="w-full">
                    Masuk sekarang
                  </Button>
                </div>
              ) : state.status === "verify-success" ? (
                <div className="space-y-5 text-center" role="status">
                  <CheckIcon className="mx-auto size-10 text-organik" />
                  <h2 className="text-4xl">Email terverifikasi</h2>
                  <p className="text-sm text-muted">
                    Alamat email akunmu berhasil dikonfirmasi. Kamu bisa langsung masuk ke Eco Waste
                    Corner UPJ.
                  </p>
                  <Button href="/login" size="lg" className="w-full">
                    Masuk ke Eco Waste Corner
                  </Button>
                </div>
              ) : (
                <div className="space-y-5 text-center" role="alert">
                  <AlertIcon className="mx-auto size-10 text-brick-text" />
                  <h2 className="text-4xl">Tautan tidak dapat dipakai</h2>
                  <p className="text-sm text-brick-ink">{state.message}</p>
                  <Button href="/login" variant="outline" size="lg" className="w-full">
                    Kembali ke halaman masuk
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
