"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { CatalogFormDialog } from "@/components/admin/CatalogFormDialog";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { RefreshIcon } from "@/components/ui/Icons";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/ui/States";
import { useWasteCatalog } from "@/hooks/useWasteCatalog";
import { BINS, BIN_LIST } from "@/lib/data/bins";
import { deleteWasteCatalogItem, restoreBuiltInWasteItem, saveWasteCatalogItem } from "@/lib/firebase/firestore";
import type { BinCategory, WasteCatalogInput, WasteCatalogItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "semua" | BinCategory;

/** Kelola kamus sampah serta soal Cek cepat dan Coba pilah langsung dari dashboard admin. */
export function AdminCatalog() {
  const { items, hiddenBuiltIns, status, error, reload, fetchLatest } = useWasteCatalog();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WasteCatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WasteCatalogItem | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useLayoutEffect(() => {
    return () => {
      setFormOpen(false);
      setDeleteTarget(null);
    };
  }, []);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (filter === "semua" || item.category === filter) &&
          (needle === "" ||
            item.label.toLowerCase().includes(needle) ||
            item.question.toLowerCase().includes(needle) ||
            BINS[item.category].label.toLowerCase().includes(needle)),
      ),
    [items, filter, needle],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: WasteCatalogItem) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSave = async (input: WasteCatalogInput) => {
    const saved = await saveWasteCatalogItem(input);
    await fetchLatest();
    setNotice({
      tone: "success",
      text: input.id
        ? `"${saved.label}" diperbarui dan langsung aktif di Kamus, Cek cepat, serta Coba pilah.`
        : `"${saved.label}" ditambahkan dan siap muncul acak di Cek cepat serta Coba pilah.`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionBusy(true);
    setNotice(null);
    try {
      await deleteWasteCatalogItem(deleteTarget);
      await fetchLatest();
      setNotice({
        tone: "success",
        text: deleteTarget.builtIn
          ? `"${deleteTarget.label}" disembunyikan dari kamus dan latihan acak.`
          : `"${deleteTarget.label}" dihapus permanen dari kamus.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setNotice({
        tone: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus barang kamus.",
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleRestore = async (item: WasteCatalogItem) => {
    setActionBusy(true);
    setNotice(null);
    try {
      await restoreBuiltInWasteItem(item.id);
      await fetchLatest();
      setNotice({ tone: "success", text: `"${item.label}" dikembalikan ke kamus aktif.` });
    } catch (err) {
      setNotice({
        tone: "error",
        text: err instanceof Error ? err.message : "Gagal memulihkan barang bawaan.",
      });
    } finally {
      setActionBusy(false);
    }
  };

  if (status === "loading" && items.length === 0) {
    return <LoadingState label="Memuat kamus sampah" className="py-16" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-3xl sm:text-4xl">Kamus & soal acak ({items.length})</h2>
          <p className="mt-1 text-sm text-muted">
            Barang baru atau suntingan di sini otomatis tampil di Kamus, Cek cepat kondisi, dan Coba pilah pada ronde acak berikutnya.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <Button variant="outline" onClick={reload} className="w-full sm:w-auto">
            <RefreshIcon className="size-4" />
            Muat ulang
          </Button>
          <Button onClick={openCreate} className="w-full sm:w-auto">
            Tambah barang kamus
          </Button>
        </div>
      </div>

      {status === "error" && error ? (
        <ErrorState title="Gagal membaca kamus terbaru" message={error} onRetry={reload} className="py-8" />
      ) : null}

      {notice ? <InlineNotice tone={notice.tone}>{notice.text}</InlineNotice> : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label htmlFor="cari-kamus-admin" className="text-sm font-bold">
            Cari barang atau isi soal
          </label>
          <input
            id="cari-kamus-admin"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ketik nama barang, kata di soal, atau tong"
            autoComplete="off"
            className="mt-1 min-h-11 w-full rounded-ctl border-2 border-edge bg-surface px-3.5 text-base"
          />
        </div>

        <div role="group" aria-label="Saring kamus per tong" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {[{ id: "semua" as const, label: "Semua" }, ...BIN_LIST].map((option) => {
            const selected = filter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(option.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-ctl border-2 px-3.5 text-sm font-bold transition-colors",
                  selected
                    ? "border-pick bg-pick text-on-pick"
                    : "border-edge bg-surface text-ink hover:bg-cobalt-soft",
                )}
              >
                {option.id !== "semua" ? (
                  <span
                    aria-hidden="true"
                    className={cn("size-3 shrink-0 border border-on-pick", BINS[option.id].tone.solid)}
                  />
                ) : null}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted sm:text-sm">
        Menampilkan {filtered.length} dari {items.length} barang kamus aktif.
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada barang kamus yang cocok"
          description="Ubah kata kunci pencarian, pilih saringan tong lain, atau tambahkan barang baru."
          action={
            query || filter !== "semua" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setFilter("semua");
                }}
              >
                Reset saringan
              </Button>
            ) : (
              <Button onClick={openCreate}>Tambah barang kamus</Button>
            )
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((item) => {
            const bin = BINS[item.category];
            return (
              <li
                key={item.id}
                className="flex flex-col justify-between gap-4 rounded-plate border-2 border-line bg-surface p-4"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-ctl border-2 border-line px-2.5 py-0.5 text-xs font-bold",
                        bin.tone.solid,
                      )}
                    >
                      {bin.label}
                    </span>
                    <span className="rounded-ctl border-2 border-rule bg-paper px-2 py-0.5 text-xs font-bold text-muted">
                      {!item.builtIn ? "Tambahan admin" : item.overridden ? "Bawaan (diubah)" : "Bawaan"}
                    </span>
                  </div>

                  <div>
                    <h3 className="break-words text-2xl sm:text-3xl">{item.label}</h3>
                    <p className="mt-1.5 text-sm font-bold text-ink">{item.question}</p>
                    <p className="mt-1 text-xs text-muted">
                      Jawaban benar: <strong className="text-ink">{item.choices[item.correctIndex]}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t-2 border-rule pt-3">
                  <Button variant="outline" onClick={() => openEdit(item)} className="flex-1 sm:flex-none">
                    Ubah
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setDeleteTarget(item)}
                    className="flex-1 sm:flex-none"
                  >
                    {item.builtIn ? "Sembunyikan" : "Hapus"}
                  </Button>
                  {item.builtIn && item.overridden ? (
                    <Button
                      variant="ghost"
                      disabled={actionBusy}
                      onClick={() => void handleRestore(item)}
                      className="w-full sm:w-auto"
                    >
                      Reset bawaan
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hiddenBuiltIns.length > 0 ? (
        <section aria-labelledby="judul-bawaan-tersembunyi" className="rounded-plate border-2 border-rule bg-paper p-4">
          <h3 id="judul-bawaan-tersembunyi" className="text-xl">
            Barang bawaan disembunyikan ({hiddenBuiltIns.length})
          </h3>
          <p className="mt-1 text-xs text-muted">
            Tidak muncul di Kamus, Cek cepat, maupun Coba pilah. Pulihkan kapan saja bila diperlukan.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {hiddenBuiltIns.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-ctl border-2 border-line bg-surface px-3 py-1.5 text-sm"
              >
                <span className="font-bold">{item.label}</span>
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => void handleRestore(item)}
                  className="min-h-11 px-1.5 text-xs font-bold text-link underline decoration-2 underline-offset-4 hover:text-ink"
                >
                  Pulihkan
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CatalogFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <Dialog
        open={deleteTarget !== null}
        onClose={() => !actionBusy && setDeleteTarget(null)}
        title={deleteTarget?.builtIn ? "Sembunyikan barang bawaan?" : "Hapus barang kamus?"}
      >
        {deleteTarget ? (
          <div className="space-y-4">
            <p className="text-base">
              {deleteTarget.builtIn
                ? `"${deleteTarget.label}" akan disembunyikan dari Kamus, Cek cepat, dan Coba pilah. Riwayat scan mahasiswa tetap aman dan bisa dipulihkan lagi.`
                : `"${deleteTarget.label}" akan dihapus permanen dari Kamus, Cek cepat, dan Coba pilah.`}
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={actionBusy}>
                Batal
              </Button>
              <Button variant="danger" onClick={() => void confirmDelete()} disabled={actionBusy}>
                {actionBusy ? "Memproses..." : deleteTarget.builtIn ? "Ya, sembunyikan" : "Ya, hapus"}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
