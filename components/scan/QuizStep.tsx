"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuizStepProps {
  questions: QuizQuestion[];
  onFinish: (correctCount: number) => void;
}

export function QuizStep({ questions, onFinish }: QuizStepProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const isCorrect = checked && selected === question.answerIndex;

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    if (selected === question.answerIndex) setCorrect((n) => n + 1);
  };

  const next = () => {
    if (isLast) {
      onFinish(correct);
      return;
    }
    setIndex((n) => n + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold text-leaf-deep">
        Pertanyaan {index + 1} dari {questions.length}
      </p>

      <fieldset disabled={checked} className="space-y-3">
        <legend className="text-xl font-bold leading-snug">{question.question}</legend>
        <div className="mt-4 space-y-2.5">
          {question.options.map((option, optionIndex) => {
            const isSelected = selected === optionIndex;
            const showRight = checked && optionIndex === question.answerIndex;
            const showWrong = checked && isSelected && optionIndex !== question.answerIndex;
            return (
              <label
                key={option}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest",
                  showRight
                    ? "border-leaf-deep bg-mint"
                    : showWrong
                      ? "border-brick bg-[#fbe4e1]"
                      : isSelected
                        ? "border-forest bg-mint-soft"
                        : "border-line bg-white hover:border-leaf",
                )}
              >
                <input
                  type="radio"
                  name={`kuis-${question.id}`}
                  className="size-5 shrink-0 accent-forest"
                  checked={isSelected}
                  onChange={() => setSelected(optionIndex)}
                />
                <span className="flex-1">{option}</span>
                {showRight ? (
                  <>
                    <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-forest" />
                    <span className="sr-only">Jawaban benar</span>
                  </>
                ) : null}
                {showWrong ? (
                  <>
                    <XCircle aria-hidden="true" className="size-5 shrink-0 text-brick" />
                    <span className="sr-only">Jawabanmu salah</span>
                  </>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      {checked ? (
        <div
          role="status"
          className={cn(
            "rounded-xl p-4 text-sm",
            isCorrect ? "bg-mint text-forest" : "bg-[#fbe4e1] text-[#5c1a14]",
          )}
        >
          <p className="font-bold">{isCorrect ? "Benar." : "Belum tepat."}</p>
          <p className="mt-1">{question.explanation}</p>
        </div>
      ) : null}

      {checked ? (
        <Button size="lg" onClick={next} className="w-full sm:w-auto">
          {isLast ? "Lanjut ke foto bukti" : "Pertanyaan berikutnya"}
        </Button>
      ) : (
        <Button size="lg" onClick={check} disabled={selected === null} className="w-full sm:w-auto">
          Periksa jawaban
        </Button>
      )}
    </div>
  );
}
