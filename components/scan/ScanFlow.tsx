"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { StationScene } from "@/components/art/BinArt";
import { PhotoStep } from "@/components/scan/PhotoStep";
import { QuizStep } from "@/components/scan/QuizStep";
import { ResultStep } from "@/components/scan/ResultStep";
import { ScanStep } from "@/components/scan/ScanStep";
import { Stepper } from "@/components/scan/Stepper";
import { Button } from "@/components/ui/Button";
import { ScrollLinked } from "@/components/ui/ScrollLinked";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useCooldown } from "@/hooks/useCooldown";
import { useLocations } from "@/hooks/useRemoteList";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useStepHistory } from "@/hooks/useStepHistory";
import { pickQuestions } from "@/lib/data/quiz";
import { describeFirebaseError } from "@/lib/firebase/errors";
import { submitScan, type SubmitScanResult } from "@/lib/firebase/firestore";
import { QR_PARAM_BIN, QR_PARAM_LOCATION, scanTargetFromParams, type ScanTarget } from "@/lib/qr";
import { COOLDOWN_MINUTES } from "@/lib/scoring";
import type { QuizQuestion } from "@/lib/types";
import { useUserStore } from "@/store/useUserStore";

type Step = "scan" | "quiz" | "photo" | "result";
const STEP_INDEX: Record<Step, number> = { scan: 0, quiz: 1, photo: 2, result: 3 };

const BROKEN_LINK = "Tautan QR tidak lengkap atau tidak dikenal. Pindai ulang QR yang tertempel di tong.";

export function ScanFlow() {
  const searchParams = useSearchParams();
  const authStatus = useRequireAuth();
  const profile = useUserStore((s) => s.profile);
  const profileStatus = useUserStore((s) => s.profileStatus);
  const profileError = useUserStore((s) => s.error);
  const retryProfile = useUserStore((s) => s.retryProfile);
  const cooldown = useCooldown();
  const locations = useLocations();

  // Halaman dibuka dari QR lewat kamera bawaan ponsel: lokasi dan tong sudah ada di tautan.
  const linkHadParams = searchParams.has(QR_PARAM_LOCATION) || searchParams.has(QR_PARAM_BIN);
  const [linkNotice] = useState(() => (linkHadParams && !scanTargetFromParams(searchParams) ? BROKEN_LINK : null));
  const [step, setStep] = useState<Step>("scan");
  const [target, setTarget] = useState<ScanTarget | null>(() => scanTargetFromParams(searchParams));
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState(0);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitScanResult | null>(null);
  const [scannedItem, setScannedItem] = useState<string | null>(null);

  const clearProgress = () => {
    setStep("scan");
    setQuestions([]);
    setQuizCorrect(0);
    setResult(null);
    setScannedItem(null);
    setSubmitError(null);
  };

  const stepHistory = useStepHistory({
    // Dari hasil, scan berikutnya mulai dari QR baru. Dari kuis atau foto, QR yang tadi terbaca tetap tampil.
    onBack: () => {
      clearProgress();
      if (step === "result") setTarget(null);
    },
    onHide: () => {
      clearProgress();
      setTarget(scanTargetFromParams(searchParams));
      setSession((n) => n + 1);
    },
    locked: submitting,
  });

  if (authStatus === "initializing" || authStatus === "unauthenticated") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <LoadingState
          label={
            authStatus === "initializing" ? "Memeriksa sesi login" : "Mengarahkan ke halaman login"
          }
        />
      </div>
    );
  }

  if (profileStatus === "error") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <ErrorState
          title="Profil gagal dimuat"
          message={profileError ?? "Terjadi kesalahan."}
          onRetry={retryProfile}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <LoadingState label="Memuat profil" />
      </div>
    );
  }

  const category = target?.category ?? null;
  const location = locations.items.find((l) => l.locationId === target?.locationId) ?? null;

  const startQuiz = () => {
    if (!category || !location || cooldown.active) return;
    setQuestions(pickQuestions(category));
    setQuizCorrect(0);
    setSubmitError(null);
    stepHistory.enter();
    setStep("quiz");
  };

  const handleSubmit = async ({ photo, itemId }: { photo: File | null; itemId: string }) => {
    if (!category || !location || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const outcome = await submitScan({
        uid: profile.uid,
        category,
        locationId: location.locationId,
        locationName: location.name,
        itemId,
        quizCorrect,
        quizTotal: questions.length,
        photo,
      });
      setResult(outcome);
      setScannedItem(itemId);
      setStep("result");
    } catch (error) {
      setSubmitError(describeFirebaseError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="border-b-2 border-line bg-cobalt text-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">
          <ScrollLinked
            y={[0, 24]}
            scale={[1, 0.97]}
            range="exit"
            originClassName="flex origin-top items-end justify-between gap-6"
          >
            <div>
              <h1 className="fade-up text-5xl sm:text-7xl">Scan QR tong</h1>
              <p className="fade-up mt-3 text-lg" style={{ ["--delay" as string]: "120ms" }}>
                Pindai QR di tong, jawab kuis, lalu klaim poin.
              </p>
            </div>
            <div
              className="fade-up hidden w-48 shrink-0 rounded-plate border-2 border-line bg-paper p-2 sm:block"
              style={{ ["--delay" as string]: "200ms" }}
            >
              <StationScene drops={false} className="block w-full" />
            </div>
          </ScrollLinked>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8 md:py-10">
      {cooldown.active && step !== "result" ? (
        <div
          role="status"
          className="fade-up flex items-center gap-4 rounded-plate border-2 border-line bg-kertas-soft px-4 py-3"
        >
          <span
            aria-hidden="true"
            className="font-display text-5xl font-extrabold leading-none tabular-nums"
          >
            {cooldown.label}
          </span>
          <p className="text-sm">
            <strong className="sr-only">Jeda scan {cooldown.label}. </strong>Jeda {COOLDOWN_MINUTES} menit mencegah scan
            berulang berurutan. Kamu bisa menyiapkan pilihan sambil menunggu.
          </p>
        </div>
      ) : null}

      {/* Menempel di bawah navbar: form foto bukti cukup panjang, jadi posisi langkah tetap terlihat. */}
      <div className="sticky top-[4.125rem] z-30 -mx-4 mt-3 bg-paper px-4 py-3 sm:-mx-6 sm:mt-6 sm:px-6">
        <Stepper current={STEP_INDEX[step]} />
      </div>

      <div className="mt-4 rounded-plate border-2 border-line bg-surface p-5 sm:mt-8 sm:p-8">
        {step === "quiz" || step === "photo" ? (
          <div className="mb-6">
            <Button variant="outline" onClick={stepHistory.back} disabled={submitting}>
              Kembali ke pindai QR
            </Button>
          </div>
        ) : null}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {step === "scan" ? (
              <ScanStep
                key={session}
                locations={locations.items}
                locationsStatus={locations.status}
                target={target}
                onTarget={setTarget}
                initialNotice={linkNotice}
                onStart={startQuiz}
                blocked={cooldown.active}
              />
            ) : null}

            {step === "quiz" && questions.length > 0 ? (
              <QuizStep
                key={questions.map((q) => q.id).join("-")}
                questions={questions}
                onFinish={(correct) => {
                  setQuizCorrect(correct);
                  setStep("photo");
                }}
              />
            ) : null}

            {step === "photo" ? (
              <PhotoStep submitting={submitting} error={submitError} onSubmit={handleSubmit} />
            ) : null}

            {step === "result" && result ? (
              <ResultStep result={result} category={category} item={scannedItem} onAgain={stepHistory.back} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </>
  );
}
