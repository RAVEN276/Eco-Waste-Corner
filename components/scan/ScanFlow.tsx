"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Timer } from "lucide-react";
import { PhotoStep } from "@/components/scan/PhotoStep";
import { QuizStep } from "@/components/scan/QuizStep";
import { ResultStep } from "@/components/scan/ResultStep";
import { SelectStep } from "@/components/scan/SelectStep";
import { Stepper } from "@/components/scan/Stepper";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useCooldown } from "@/hooks/useCooldown";
import { useLocations } from "@/hooks/useRemoteList";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { pickQuestions } from "@/lib/data/quiz";
import { describeFirebaseError } from "@/lib/firebase/errors";
import { submitScan, type SubmitScanResult } from "@/lib/firebase/firestore";
import { COOLDOWN_MINUTES } from "@/lib/scoring";
import type { BinCategory, QuizQuestion } from "@/lib/types";
import { useUserStore } from "@/store/useUserStore";

type Step = "select" | "quiz" | "photo" | "result";
const STEP_INDEX: Record<Step, number> = { select: 0, quiz: 1, photo: 2, result: 3 };

export function ScanFlow() {
  const authStatus = useRequireAuth();
  const profile = useUserStore((s) => s.profile);
  const profileStatus = useUserStore((s) => s.profileStatus);
  const profileError = useUserStore((s) => s.error);
  const retryProfile = useUserStore((s) => s.retryProfile);
  const cooldown = useCooldown();
  const locations = useLocations();

  const [step, setStep] = useState<Step>("select");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [category, setCategory] = useState<BinCategory | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitScanResult | null>(null);

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

  const location = locations.items.find((l) => l.locationId === locationId) ?? null;

  const startQuiz = () => {
    if (!category || cooldown.active) return;
    setQuestions(pickQuestions(category));
    setQuizCorrect(0);
    setSubmitError(null);
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
      setStep("result");
    } catch (error) {
      setSubmitError(describeFirebaseError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep("select");
    setCategory(null);
    setQuestions([]);
    setResult(null);
    setSubmitError(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">Scan QR slot tong</h1>
      <p className="mt-2 text-muted">Pilah dulu, jawab kuis, lalu klaim poin JSDP.</p>

      {cooldown.active && step !== "result" ? (
        <div
          role="status"
          className="mt-6 flex items-center gap-3 rounded-xl border border-sun/70 bg-sun-soft/60 px-4 py-3"
        >
          <Timer aria-hidden="true" className="size-6 shrink-0" />
          <p className="text-sm">
            <strong>Jeda scan {cooldown.label}.</strong> Jeda {COOLDOWN_MINUTES} menit mencegah scan
            berulang berurutan. Kamu bisa menyiapkan pilihan sambil menunggu.
          </p>
        </div>
      ) : null}

      <div className="mt-8">
        <Stepper current={STEP_INDEX[step]} />
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {step === "select" ? (
              <SelectStep
                locations={locations.items}
                locationsStatus={locations.status}
                locationsSource={locations.source}
                locationsError={locations.error}
                onReloadLocations={locations.reload}
                locationId={locationId}
                onLocationChange={setLocationId}
                category={category}
                onCategoryChange={setCategory}
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

            {step === "result" && result ? <ResultStep result={result} onAgain={reset} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
