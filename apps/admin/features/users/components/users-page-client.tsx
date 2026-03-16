"use client";

import { FormEvent, useEffect, useState } from "react";

import { createUser, listUsers } from "@/features/users/api/users";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/state-blocks";
import { getAuthToken } from "@/shared/lib/auth-token";
import type { Role, User } from "@/types";

const ROLE_OPTIONS: Role[] = ["ADMIN", "EDITOR"];

function roleLabel(role: Role) {
  return role === "ADMIN" ? "Yönetici" : "Editör";
}

export function UsersPageClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("EDITOR");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUsers(getAuthToken());
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kullanıcılar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createUser({ email, username, password, role }, getAuthToken());
      setEmail("");
      setUsername("");
      setPassword("");
      setRole("EDITOR");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kullanıcı oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="page-card ui-elevate">
      <p className="page-kicker">Hesaplar</p>
      <h1 className="page-title">Kullanıcılar</h1>
      <p className="page-subtitle">Rol duyarlı yetkilerle yönetici ve editör hesaplarını yönetin.</p>

      <form onSubmit={handleCreate} className="mt-4 grid gap-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4 md:grid-cols-4">
        <input
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
          placeholder="E-posta"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
        />
        <input
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <input
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
          placeholder="Şifre"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
        />
        <select
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
        >
          {ROLE_OPTIONS.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleLabel(roleOption)}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="ui-control md:col-span-4 h-10 rounded-lg bg-(--brand) px-4 text-sm font-semibold text-white disabled:opacity-60"
          disabled={creating}
        >
          {creating ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
        </button>
      </form>

      {error ? <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} /> : null}
      {loading ? <LoadingBlock title="Kullanıcılar yükleniyor..." /> : null}

      {!loading && !error && users.length === 0 ? <EmptyBlock title="Kullanıcı bulunamadı" description="Rol tabanlı yönetimi etkinleştirmek için ilk hesabı oluşturun." /> : null}

      {!loading && users.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-(--line)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-(--surface-muted) text-slate-300">
              <tr>
                <th className="px-4 py-3">Kullanıcı adı</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Aktif</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-(--line) text-slate-100">
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3 text-slate-300">{user.email}</td>
                  <td className="px-4 py-3 text-slate-300">{roleLabel(user.role)}</td>
                  <td className="px-4 py-3 text-slate-300">{user.isActive ? "Evet" : "Hayır"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
