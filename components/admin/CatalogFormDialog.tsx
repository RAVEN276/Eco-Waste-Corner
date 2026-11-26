"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { InlineNotice } from "@/components/ui/States";
import { BINS, BIN_LIST } from "@/lib/data/bins";
import type { BinCategory, WasteCatalogInput, WasteCatalogItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CatalogFormDialogProps {
  open: boolean;
  editing: WasteCatalogItem | null;
  onClose: () => void;
  onSave: (input: WasteCatalogInput) => Promise<void>;
}

const DEFAULT_CHOICES: Record<BinCategory, [string, string]> = {
  organik: ["Ya, masuk Organik", "Tidak, masuk Residu"],
  plastik_kertas: ["Masuk Plastik / Kertas", "Pindah ke Residu"],
  residu: ["Masuk Residu", "Masuk Plastik / Kertas"],
};

interface InnerFormProps {
  editing: WasteCatalogItem | null;
  onClose: () => void;
  onSave: (input: WasteCatalogInput) => Promise<void>;
}

function CatalogFormBody({ editing, onClose, onSave }: InnerFormProps) {
  const [label, setLabel] = useState(editing?.label ?? "");
  const [category, setCategory] = useState<BinCategory>(editing?.category ?? "organik");
  const [question, setQuestion] = useState(editing?.question ?? "");
  const [choiceA, setChoiceA] = useState(editing?.choices[0] ?? DEFAULT_CHOICES.organik[0]);
  const [choiceB, setChoiceB] = useState(editing?.choices[1] ?? DEFAULT_CHOICES.organik[1]);
  const [correctIndex, setCorrectIndex] = useState<0 | 1>(editing?.correctIndex ?? 0);
  const [reason, setReason] = useState(editing?.reason ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectCategory = (next: BinCategory) => {
    const prevDefaults = DEFAULT_CHOICES[category];
    setCategory(next);
    if (!editing && choiceA === prevDefaults[0] && choiceB === prevDefaults[1]) {
      setChoiceA(DEFAULT_CHOICES[next][0]);
      setChoiceB(DEFAULT_CHOICES[next][1]);
      setCorrectIndex(0);
    }
  };

  const applyTemplate = () => {
    const cleanLabel = label.trim() || "Barang ini";
    const binName = BINS[category].label;
    setQuestion(`${cleanLabel} akan dibuang di kampus. Tong mana yang paling tepat?`);
    setChoiceA(DEFAULT_CHOICES[category][0]);
    setChoiceB(DEFAULT_CHOICES[category][1]);
    setCorrectIndex(0);
    if (!reason.trim()) {
      setReason(`${cleanLabel} dikelompokkan ke ${binName}. ${BINS[category].tip}`);
    }
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!label.trim()) {
      setError("Nama barang kamus wajib diisi.");
      return;
    }
    if (!question.trim()) {
      setError("Pertanyaan untuk Cek cepat wajib diisi.");
      return;
    }
    if (!choiceA.trim() || !choiceB.trim()) {
      setError("Kedua pilihan jawaban wajib diisi.");
      return;
    }
    if (!reason.trim()) {
      setError("Penjelasan alasan wajib diisi.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        id: editing?.id,
        label: label.trim(),
        category,
        question: question.trim(),
        choices: [choiceA.trim(), choiceB.trim()],
        correctIndex,
        reason: reason.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan kamus.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="kamus-nama" className="block text-sm font-bold">
          Nama barang
        </label>
        <input
          id="kamus-nama"
          type="text"
          maxLength={120}
          value={label}
          disabled={saving}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Contoh: Gelas kertas bekas kopi"
          className="mt-1 min-h-11 w-full rounded-ctl border-2 border-edge bg-surface px-3.5 text-base"
        />
      </div>

      <fieldset disabled={saving}>
        <legend className="text-sm font-bold">Kategori tong</legend>
        <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {BIN_LIST.map((bin) => {
            const selected = category === bin.id;
            return (
              <label
                key={bin.id}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-ctl border-2 px-3 py-2 text-sm font-bold transition-colors",
                  selected
                    ? "border-pick bg-pick text-on-pick"
                    : "border-edge bg-surface text-ink hover:bg-cobalt-soft",
                )}
              >
                <input
                  type="radio"
                  name="kategori-kamus"
                  value={bin.id}
                  checked={selected}
                  onChange={() => selectCategory(bin.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-3.5 shrink-0 rounded-sm border-2",
                    selected ? "border-on-pick" : "border-ink",
                    bin.tone.solid,
                  )}
                />
                <span>{bin.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="rounded-plate border-2 border-rule bg-paper p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold">Soal Cek cepat & Coba pilah</p>
          <button
            type="button"
            disabled={saving}
            onClick={applyTemplate}
            className="min-h-11 rounded-ctl px-2.5 text-xs font-bold text-link underline decoration-2 underline-offset-4 hover:text-ink"
          >
            Bantu isi draf soal
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          Setelah disimpan, barang ini masuk ke daftar Kamus dan otomatis ikut diacak di Cek cepat serta Coba pilah.
        </p>

        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="kamus-soal" className="block text-sm font-bold">
              Pertanyaan Cek cepat
            </label>
            <textarea
              id="kamus-soal"
              rows={2}
              maxLength={300}
              value={question}
              disabled={saving}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Contoh: Gelas kertas kopi punya lapisan plastik tipis di dalam. Masuk tong mana?"
              className="mt-1 block w-full resize-y rounded-ctl border-2 border-edge bg-surface px-3 py-2 text-base"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="kamus-pilihan-a" className="block text-sm font-bold">
                Pilihan A
              </label>
              <input
                id="kamus-pilihan-a"
                type="text"
                maxLength={100}
                value={choiceA}
                disabled={saving}
                onChange={(e) => setChoiceA(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-ctl border-2 border-edge bg-surface px-3 text-base"
              />
            </div>
            <div>
              <label htmlFor="kamus-pilihan-b" className="block text-sm font-bold">
                Pilihan B
              </label>
              <input
                id="kamus-pilihan-b"
                type="text"
                maxLength={100}
                value={choiceB}
                disabled={saving}
                onChange={(e) => setChoiceB(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-ctl border-2 border-edge bg-surface px-3 text-base"
              />
            </div>
          </div>

          <fieldset disabled={saving}>
            <legend className="text-sm font-bold">Jawaban yang benar</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {([0, 1] as const).map((idx) => {
                const selected = correctIndex === idx;
                return (
                  <label
                    key={idx}
                    className={cn(
                      "flex min-h-11 items-center justify-center rounded-ctl border-2 px-3 text-sm font-bold",
                      selected
                        ? "border-pick bg-pick text-on-pick"
                        : "border-edge bg-surface text-ink hover:bg-cobalt-soft",
                    )}
                  >
                    <input
                      type="radio"
                      name="jawaban-benar-kamus"
                      checked={selected}
                      onChange={() => setCorrectIndex(idx)}
                      className="sr-only"
                    />
                    {idx === 0 ? "Pilihan A" : "Pilihan B"}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="kamus-alasan" className="block text-sm font-bold">
              Penjelasan jawaban
            </label>
            <textarea
              id="kamus-alasan"
              rows={2}
              maxLength={400}
              value={reason}
              disabled={saving}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan singkat mengapa barang masuk tong tersebut."
              className="mt-1 block w-full resize-y rounded-ctl border-2 border-edge bg-surface px-3 py-2 text-base"
            />
          </div>
        </div>
      </div>

      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button variant="outline" size="lg" onClick={onClose} disabled={saving} className="w-full sm:w-auto">
          Batal
        </Button>
        <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Tambahkan ke kamus"}
        </Button>
      </div>
    </form>
  );
}

export function CatalogFormDialog({ open, editing, onClose, onSave }: CatalogFormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Ubah barang kamus" : "Tambah barang ke kamus"}
      className="sm:max-w-2xl"
    >
      <CatalogFormBody
        key={editing?.id ?? (open ? "new-open" : "new-closed")}
        editing={editing}
        onClose={onClose}
        onSave={onSave}
      />
    </Dialog>
  );
}
