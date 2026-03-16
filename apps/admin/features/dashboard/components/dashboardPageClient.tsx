"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { listContentTypes } from "@/features/contentTypes/api/contentTypes";
import { listEntries } from "@/features/entries/api/entries";
import { listMedia } from "@/features/media/api/media";
import { listUsers } from "@/features/users/api/users";
import { ErrorBlock, LoadingBlock } from "@/shared/components/stateBlocks";
import { apiClient } from "@/shared/lib/apiClient";
import type { Entry, User } from "@/types";

type DashboardStats = {
  userCount: number;
  contentTypeCount: number;
  mediaCount: number;
  totalEntryCount: number;
  publishedEntryCount: number;
};

type RecentActivityItem = {
  id: string;
  title: string;
  description: string;
  at: string;
  href?: string;
};

const QUICK_ACTIONS = [
  {
    href: ROUTES.contentTypes,
    title: "İçerik tipleri",
    description: "Yeni içerik modeli oluştur ve alanlarını tanımla.",
    buttonText: "Yönet",
  },
  {
    href: ROUTES.media,
    title: "Medya kütüphanesi",
    description: "Dosya yükle ve içeriklerde kullanacağın varlıkları hazırla.",
    buttonText: "Medyaya git",
  },
  {
    href: ROUTES.users,
    title: "Kullanıcılar",
    description: "Yönetici ve editör hesaplarını düzenle.",
    buttonText: "Kullanıcıları aç",
  },
] as const;

export function DashboardPageClient() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const me = await apiClient<User>("/auth/me", { method: "GET" }).catch(() => null);
      const isAdmin = me?.role === "ADMIN";

      const [users, contentTypes, media] = await Promise.all([
        isAdmin ? listUsers(null) : Promise.resolve([]),
        listContentTypes(null),
        listMedia(null),
      ]);

      const entryCollections = await Promise.all(
        contentTypes.map(async (contentType) => {
          const [allEntries, publishedEntries] = await Promise.all([
            listEntries({ contentTypeSlug: contentType.slug }, null).catch(() => []),
            listEntries({ contentTypeSlug: contentType.slug, status: "PUBLISHED" }, null).catch(() => []),
          ]);

          return {
            contentTypeSlug: contentType.slug,
            entries: allEntries,
            total: allEntries.length,
            published: publishedEntries.length,
          };
        }),
      );

      const totalEntryCount = entryCollections.reduce((sum, item) => sum + item.total, 0);
      const publishedEntryCount = entryCollections.reduce((sum, item) => sum + item.published, 0);

      const entryActivities: RecentActivityItem[] = entryCollections.flatMap((collection) =>
        collection.entries.map((entry: Entry) => ({
          id: `entry-${entry.id}`,
          title: `Kayıt güncellendi (${collection.contentTypeSlug})`,
          description: entry.slug || entry.id,
          at: entry.updatedAt,
          href: `/entries/${collection.contentTypeSlug}/${entry.id}`,
        })),
      );

      const contentTypeActivities: RecentActivityItem[] = contentTypes.map((contentType) => ({
        id: `content-type-${contentType.id}`,
        title: "İçerik tipi güncellendi",
        description: `${contentType.name} (${contentType.slug})`,
        at: contentType.updatedAt,
        href: `${ROUTES.contentTypes}/${contentType.id}`,
      }));

      const mediaActivities: RecentActivityItem[] = media.map((item) => ({
        id: `media-${item.id}`,
        title: "Medya yüklendi",
        description: item.filename,
        at: item.createdAt,
        href: ROUTES.media,
      }));

      const userActivities: RecentActivityItem[] = users.map((user) => ({
        id: `user-${user.id}`,
        title: "Kullanıcı oluşturuldu",
        description: `${user.username} (${user.role})`,
        at: user.createdAt,
        href: ROUTES.users,
      }));

      const recent = [...entryActivities, ...contentTypeActivities, ...mediaActivities, ...userActivities]
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 8);

      setCurrentUser(me);
      setRecentActivities(recent);
      setStats({
        userCount: users.length,
        contentTypeCount: contentTypes.length,
        mediaCount: media.length,
        totalEntryCount,
        publishedEntryCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dashboard verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const publishRate = useMemo(() => {
    if (!stats || stats.totalEntryCount === 0) {
      return 0;
    }

    return Math.round((stats.publishedEntryCount / stats.totalEntryCount) * 100);
  }, [stats]);

  return (
    <section className="page-card ui-elevate">
      <p className="page-kicker">Genel Durum</p>
      <h1 className="page-title">Kontrol Paneli</h1>
      <p className="page-subtitle">
        {currentUser
          ? `Hoş geldin ${currentUser.username}. API ile senkron veriler aşağıda.`
          : "API ile senkron veriler aşağıda. Oturum bilgisi alınamadıysa sayfayı yenileyin."}
      </p>

      {error ? (
        <ErrorBlock
          title="Veri alınamadı"
          description={error}
          action={
            <button
              type="button"
              onClick={() => void load()}
              className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100"
            >
              Tekrar dene
            </button>
          }
        />
      ) : null}

      {loading ? <LoadingBlock title="Dashboard verileri yükleniyor..." /> : null}

      {!loading && stats ? (
        <>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {currentUser?.role === "ADMIN" ? (
              <article className="rounded-xl border border-(--line) bg-(--surface-muted) p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Kullanıcı</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{stats.userCount}</p>
              </article>
            ) : null}

            <article className="rounded-xl border border-(--line) bg-(--surface-muted) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">İçerik Tipi</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{stats.contentTypeCount}</p>
            </article>

            <article className="rounded-xl border border-(--line) bg-(--surface-muted) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Medya</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{stats.mediaCount}</p>
            </article>

            <article className="rounded-xl border border-(--line) bg-(--surface-muted) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Yayın Oranı</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">%{publishRate}</p>
              <p className="mt-1 text-xs text-slate-400">
                {stats.publishedEntryCount} / {stats.totalEntryCount} kayıt yayınlandı
              </p>
            </article>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {QUICK_ACTIONS.filter((action) => {
              if (
                currentUser?.role === "EDITOR" &&
                action.href === ROUTES.users
              ) {
                return false;
              }

              return true;
            }).map((action) => (
              <article key={action.href} className="ui-elevate rounded-xl border border-(--line) bg-(--surface-muted) p-4">
                <h2 className="text-sm font-semibold text-slate-100">{action.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{action.description}</p>
                <Link
                  href={action.href}
                  className="ui-control mt-3 inline-flex rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-200"
                >
                  {action.buttonText}
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-100">Son güncellemeler</h2>
              <button
                type="button"
                onClick={() => void load()}
                className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200"
              >
                Yenile
              </button>
            </div>

            {recentActivities.length === 0 ? (
              <p className="mt-3 text-sm text-slate-300">Henüz kayıtlı bir güncelleme bulunmuyor.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100">{activity.title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-300">{activity.description}</p>
                      </div>
                      <p className="shrink-0 text-xs text-slate-400">{new Date(activity.at).toLocaleString()}</p>
                    </div>

                    {activity.href ? (
                      <Link href={activity.href} className="ui-control mt-2 inline-flex rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200">
                        Detayı aç
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
