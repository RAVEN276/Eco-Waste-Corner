"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InlineNotice, Spinner } from "@/components/ui/States";
import { useSignOut } from "@/hooks/useSignOut";
import { describeFirebaseError } from "@/lib/firebase/errors";
import { updateProfile } from "@/lib/firebase/firestore";
import { initials } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

const INPUT_CLASS =
  "mt-1 min-h-11 w-full rounded-ctl border-2 border-edge bg-white px-3 placeholder:text-muted";

export function ProfileCard() {
  const profile = useUserStore((s) => s.profile);
  const signOut = useSignOut();
  const [editing, setEditing] = useState(() => !profile?.prodi);
  const [nama, setNama] = useState(profile?.nama ?? "");
  const [prodi, setProdi] = useState(profile?.prodi ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;

  const needsProdi = !profile.prodi;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nama.trim() || !prodi.trim()) {
      setError("Nama dan program studi wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProfile(profile.uid, { nama, prodi });
      setEditing(false);
    } catch (err) {
      setError(describeFirebaseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card aria-labelledby="judul-profil" role="region" className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-ctl bg-cobalt font-display text-3xl font-extrabold text-white"
        >
          {initials(profile.nama || profile.email)}
        </span>
        <div className="min-w-0">
          <h2 id="judul-profil" className="truncate text-3xl">
            {profile.nama || "Mahasiswa UPJ"}
          </h2>
          <p className="truncate text-sm text-muted">{profile.email}</p>
        </div>
      </div>

      {editing ? (
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          {needsProdi ? (
            <InlineNotice tone="warning">Lengkapi program studi supaya profilmu utuh.</InlineNotice>
          ) : null}
          <div>
            <label htmlFor="profil-nama" className="block text-sm font-bold">
              Nama
            </label>
            <input
              id="profil-nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              maxLength={80}
              autoComplete="name"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="profil-prodi" className="block text-sm font-bold">
              Program studi
            </label>
            <input
              id="profil-prodi"
              value={prodi}
              onChange={(e) => setProdi(e.target.value)}
              maxLength={80}
              placeholder="Contoh: Informatika"
              className={INPUT_CLASS}
            />
          </div>
          {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? <Spinner label="Menyimpan" /> : null}
              Simpan
            </Button>
            {!needsProdi ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setNama(profile.nama);
                  setProdi(profile.prodi);
                  setError(null);
                }}
              >
                Batal
              </Button>
            ) : null}
          </div>
        </form>
      ) : (
        <>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted">Program studi</dt>
              <dd className="font-bold">{profile.prodi}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="break-all font-bold">{profile.email}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}>
              Ubah profil
            </Button>
            <Button variant="ghost" onClick={signOut}>
              Keluar
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
