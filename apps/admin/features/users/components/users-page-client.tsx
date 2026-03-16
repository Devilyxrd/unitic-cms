"use client";

import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";

import { createUser, deleteUser, listUsers, setUserActive, updateUser } from "@/features/users/api/users";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/state-blocks";
import { ToastStack } from "@/shared/components/toast-stack";
import { apiClient } from "@/shared/lib/api-client";
import { getAuthToken } from "@/shared/lib/auth-token";
import { confirmDestructiveAction } from "@/shared/lib/confirm-dialog";
import { useToast } from "@/shared/hooks/use-toast";
import type { Role, User } from "@/types";

const ROLE_OPTIONS: Role[] = ["ADMIN", "EDITOR"];

function roleLabel(role: Role) {
  return role === "ADMIN" ? "Yönetici" : "Editör";
}

export function UsersPageClient() {
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("EDITOR");
  const [creating, setCreating] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const me = await apiClient<User>("/auth/me", { method: "GET" });
        setCurrentUser(me);
      } finally {
        setAuthChecked(true);
      }
    };

    void loadCurrentUser();
  }, []);

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
    if (!authChecked) {
      return;
    }

    if (currentUser?.role !== "ADMIN") {
      setLoading(false);
      setUsers([]);
      setError(null);
      return;
    }

    void load();
  }, [authChecked, currentUser?.role]);

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
      showSuccess("Kullanıcı oluşturuldu", "Yeni kullanıcı başarıyla eklendi.");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kullanıcı oluşturulamadı.";
      setError(message);
      showError("Kullanıcı oluşturulamadı", message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleUserActive = async (user: User) => {
    setUpdatingUserId(user.id);

    try {
      await setUserActive(user.id, !user.isActive, getAuthToken());
      showSuccess(
        user.isActive ? "Kullanıcı pasife alındı" : "Kullanıcı aktifleştirildi",
        `${user.username} güncellendi.`,
      );
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kullanıcı durumu güncellenemedi.";
      showError("Durum güncellenemedi", message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleEditUser = async (user: User) => {
    const result = await Swal.fire({
      title: "Kullaniciyi duzenle",
      html: `
        <input id="swal-user-email" class="swal2-input" placeholder="E-posta" value="${user.email}" />
        <input id="swal-user-username" class="swal2-input" placeholder="Kullanici adi" value="${user.username}" />
        <input id="swal-user-password" class="swal2-input" placeholder="Yeni sifre (opsiyonel)" type="password" />
        <select id="swal-user-role" class="swal2-input">
          <option value="ADMIN" ${user.role === "ADMIN" ? "selected" : ""}>Yonetici</option>
          <option value="EDITOR" ${user.role === "EDITOR" ? "selected" : ""}>Editor</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: "Kaydet",
      cancelButtonText: "Iptal",
      background: "#0f1420",
      color: "#e2e8f0",
      preConfirm: () => {
        const email = (document.getElementById("swal-user-email") as HTMLInputElement | null)?.value?.trim();
        const username = (document.getElementById("swal-user-username") as HTMLInputElement | null)?.value?.trim();
        const password = (document.getElementById("swal-user-password") as HTMLInputElement | null)?.value ?? "";
        const roleValue = (document.getElementById("swal-user-role") as HTMLSelectElement | null)?.value as Role | undefined;

        if (!email || !username || !roleValue) {
          Swal.showValidationMessage("E-posta, kullanici adi ve rol zorunlu.");
          return null;
        }

        return { email, username, password, role: roleValue };
      },
    });

    if (!result.isConfirmed || !result.value) {
      return;
    }

    setUpdatingUserId(user.id);
    try {
      const payload = {
        email: result.value.email,
        username: result.value.username,
        role: result.value.role,
        ...(result.value.password ? { password: result.value.password } : {}),
      };

      await updateUser(user.id, payload, getAuthToken());
      showSuccess("Kullanici guncellendi", `${user.username} bilgileri kaydedildi.`);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kullanici guncellenemedi.";
      showError("Guncelleme basarisiz", message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = await confirmDestructiveAction({
      title: "Kullaniciyi silmek istiyor musun?",
      text: `${user.username} hesabi kalici olarak silinecek.`,
      confirmText: "Sil",
      cancelText: "Iptal",
    });

    if (!confirmed) {
      return;
    }

    setDeletingUserId(user.id);
    try {
      await deleteUser(user.id, getAuthToken());
      showSuccess("Kullanici silindi", `${user.username} listeden kaldirildi.`);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kullanici silinemedi.";
      showError("Silme basarisiz", message);
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <section className="page-card ui-elevate">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <p className="page-kicker">Hesaplar</p>
      <h1 className="page-title">Kullanıcılar</h1>
      <p className="page-subtitle">Yönetici ve editör hesaplarını buradan ekleyip listeleyebilirsin.</p>

      {!authChecked ? <LoadingBlock title="Yetki kontrolü yapılıyor..." /> : null}

      {authChecked && currentUser?.role !== "ADMIN" ? (
        <ErrorBlock
          title="Yetkisiz işlem"
          description="Editor rolü kullanıcı yönetimi yapamaz. Bu alan sadece admin için erişilebilir."
        />
      ) : null}

      {authChecked && currentUser?.role !== "ADMIN" ? null : (
        <>

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

      {!loading && !error && users.length === 0 ? <EmptyBlock title="Kullanıcı bulunamadı" description="Sisteme giriş yapacak ilk hesabı oluşturabilirsin." /> : null}

      {!loading && users.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-(--line)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-(--surface-muted) text-slate-300">
              <tr>
                <th className="px-4 py-3">Kullanıcı adı</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Aktif</th>
                <th className="px-4 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-(--line) text-slate-100">
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3 text-slate-300">{user.email}</td>
                  <td className="px-4 py-3 text-slate-300">{roleLabel(user.role)}</td>
                  <td className="px-4 py-3 text-slate-300">{user.isActive ? "Evet" : "Hayır"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleToggleUserActive(user)}
                        disabled={updatingUserId === user.id}
                        className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200 disabled:opacity-60"
                      >
                        {updatingUserId === user.id ? "Guncelleniyor..." : user.isActive ? "Pasife Al" : "Aktiflestir"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleEditUser(user)}
                        disabled={updatingUserId === user.id}
                        className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200 disabled:opacity-60"
                      >
                        Duzenle
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDeleteUser(user)}
                        disabled={deletingUserId === user.id}
                        className="ui-control rounded-md border border-rose-500/35 px-2 py-1 text-xs text-rose-300 disabled:opacity-60"
                      >
                        {deletingUserId === user.id ? "Siliniyor..." : "Sil"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
        </>
      )}
    </section>
  );
}
