# Unitic CMS

Unitic CMS, üç uygulama ve bir ortak veritabanı paketinden oluşan bir monorepo CMS projesidir:

- `apps/api`: Kimlik doğrulama, roller, içerik tipleri, kayıtlar, medya ve public içerik için NestJS API
- `apps/admin`: İçerik ve kullanıcı yönetimi için Next.js admin paneli
- `apps/web`: Yayınlanmış içerikleri gösteren Next.js public site
- `packages/database`: Prisma şeması, migration'lar ve client üretimi

Temel akış şudur: içerik tiplerini tanımla, alanları ekle, kayıtları oluştur, medyayı yükle, içerikleri yayınla ve public tarafta yayınlanmış verileri tüket.

## Proje Yapısı

```text
unitic-cms/
|- apps/
|  |- api/      # NestJS backend
|  |- admin/    # Next.js admin paneli
|  \- web/      # Next.js public site
|- packages/
|  \- database/ # Prisma şeması ve migration'lar
|- scripts/
|  \- seed-demo.js
|- docker-compose.yml
|- package.json
|- README.md
```

## Mimari Genel Bakış

### API (`apps/api`)

- NestJS kullanır
- JWT tabanlı kimlik doğrulama ve rol bazlı yetkilendirme içerir
- Kullanıcılar, içerik tipleri, kayıtlar ve medya için CRUD endpoint'leri sunar
- Public içeriği `/api/public` altından servis eder
- Swagger UI'ı API kök URL'inde yayınlar
- Yüklenen dosyaları `/uploads/*` altından servis eder

### Admin (`apps/admin`)

- Next.js 16 kullanır
- API'ye `NEXT_PUBLIC_API_URL` ile bağlanır
- Route korumasını middleware ve `admin_token` cookie'si ile yapar
- `ADMIN` ve `EDITOR` kullanıcılarının içerik yönetmesini sağlar
- Kullanıcı yönetimi ve içerik tipi şema değişikliklerini `ADMIN` ile sınırlar

### Web (`apps/web`)

- Next.js 16 kullanır
- Sadece yayınlanmış içerikleri `/api/public` üzerinden çeker
- Ana sayfada tüm yayınlanmış içerikleri listeler
- Detay sayfalarını `/:contentType/:slug` deseninde üretir

### Database (`packages/database`)

- PostgreSQL ile Prisma kullanır
- Şemayı ve migration'ları `packages/database/prisma` altında tutar
- API ve seed script'i tarafından kullanılan Prisma Client'ı üretir

## Gerçek Çalışma Alanı Durumu

Bu repoda şu anda şunlar vardır:

- API container imajı için `apps/api/Dockerfile`
- `postgres` ve `api` için `docker-compose.yml`
- Demo admin/editor üretimi için `scripts/seed-demo.js`
- AI destekli geliştirme notları için `WORKFLOW.md`

Bu repoda şu anda şunlar yoktur:

- commit edilmiş bir `.env`
- `admin` için ayrı bir Docker servisi
- `web` için ayrı bir Docker servisi

## Gereksinimler

- Node.js 20+
- npm 10+
- Docker Desktop (PostgreSQL ve API için önerilir)

## Ortam Değişkenleri

Önce örnek dosyayı kopyalayın:

```bash
copy .env.example .env
```

Ana değişkenler:

- `PORT`: API portu. Varsayılan: `3000`
- `JWT_SECRET`: JWT imzalama anahtarı
- `DATABASE_URL`: PostgreSQL bağlantı adresi
- `CORS_ORIGIN`: API için izin verilen origin'ler, virgülle ayrılır
- `NEXT_PUBLIC_API_URL`: `apps/admin` ve `apps/web` tarafından kullanılan API taban URL'i
- `APP_ENV_FILE`: API için opsiyonel özel env dosyası yolu
- `POSTGRES_USER`: Docker PostgreSQL kullanıcı adı
- `POSTGRES_PASSWORD`: Docker PostgreSQL şifresi
- `POSTGRES_DB`: Docker PostgreSQL veritabanı adı
- `UPLOAD_DIR`: API için opsiyonel upload dizini
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`: opsiyonel demo admin seed değerleri
- `SEED_EDITOR_EMAIL`, `SEED_EDITOR_USERNAME`, `SEED_EDITOR_PASSWORD`: opsiyonel demo editor seed değerleri

Kod tarafında env yükleme mantığı:

- `apps/api/src/main.ts`, `APP_ENV_FILE` verilmemişse kökteki `.env` dosyasını yükler
- `apps/admin/next.config.ts`, kökteki `.env` dosyasını yükler
- `apps/web/next.config.ts`, kökteki `.env` dosyasını yükler
- `packages/database/prisma.config.ts`, kökteki `.env` dosyasını yükler

## Hızlı Başlangıç

### 1. Bağımlılıkları kur

```bash
npm install
```

### 2. `.env` dosyasını oluştur

Kökteki örnek dosyayı kullan:

```bash
copy .env.example .env
```

### 3. PostgreSQL ve API'yi Docker ile başlat

```bash
npm run docker:up
```

Sonraki açılışlarda:

```bash
npm run docker:start
```

### 4. Prisma Client üret ve migration'ları çalıştır

```bash
npm --workspace database run prisma:generate
npm --workspace database run prisma:migrate:dev
```

### 5. Frontend uygulamalarını lokal başlat

Admin paneli:

```bash
npm --workspace admin run dev
```

Public site:

```bash
npm --workspace web run dev
```

Varsayılan lokal adresler:

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/`
- Admin: `http://localhost:3002`
- Web: `http://localhost:3001`

## Çalıştırma Modları

### Seçenek A: Günlük geliştirme için önerilen akış

`postgres` ve `api` için Docker kullanın; `admin` ve `web` uygulamalarını lokal çalıştırın.

```bash
npm run docker:up
npm --workspace database run prisma:generate
npm --workspace database run prisma:migrate:dev
npm --workspace admin run dev
npm --workspace web run dev
```

### Seçenek B: Lokal API debug akışı

Sadece PostgreSQL'i Docker ile ayağa kaldırın ve API'yi lokal başlatın.

```bash
docker compose up -d postgres
npm --workspace database run prisma:generate
npm --workspace database run prisma:migrate:dev
npm --workspace api run start:dev
npm --workspace admin run dev
npm --workspace web run dev
```

### Seçenek C: Sadece backend'i Docker'da çalıştır

Daha production benzeri bir API runtime istediğinizde kullanışlıdır.

```bash
npm run docker:up
npm run docker:logs
```

Mevcut repo yapısında `admin` ve `web` yine lokal çalışır.

## Root Script'leri

Kök `package.json` içinde şu script'ler vardır:

- `npm run seed:demo`
- `npm run docker:up`
- `npm run docker:start`
- `npm run docker:down`
- `npm run docker:clean`
- `npm run docker:restart`
- `npm run docker:ps`
- `npm run docker:logs`

`docker:clean`, bu compose kurulumuna ait container, volume ve local image'ları temizler.

## Veritabanı ve Prisma

Prisma şeması burada bulunur:

- `packages/database/prisma/schema.prisma`

Mevcut enum'lar:

- `Role`: `ADMIN`, `EDITOR`, `USER`
- `EntryStatus`: `DRAFT`, `PUBLISHED`
- `FieldType`: `TEXT`, `RICHTEXT`, `NUMBER`, `BOOLEAN`, `DATE`, `MEDIA`

Ana modeller:

- `User`
- `ContentType`
- `ContentField`
- `Entry`
- `EntryValue`
- `Media`

Database paketi script'leri:

- `npm --workspace database run prisma:generate`
- `npm --workspace database run prisma:migrate:dev`
- `npm --workspace database run prisma:migrate:deploy`
- `npm --workspace database run prisma:migrate:status`
- `npm --workspace database run prisma:studio`

## Kimlik Doğrulama ve Yetkilendirme

API tarafındaki kimlik doğrulama detayları:

- JWT tabanlı kimlik doğrulama kullanılır
- Token, `Authorization: Bearer <token>` üzerinden okunabilir
- Token ayrıca `admin_token` isimli HttpOnly cookie'den de okunabilir
- Korunan route'lar guard ve `@Roles(...)` ile kontrol edilir
- Public route'lar `@Public()` ile işaretlenir

`/auth/register`, varsayılan olarak `USER` rolünde yeni bir kullanıcı oluşturur.

Bunun anlamı:

- kayıt olan kullanıcılar otomatik olarak admin paneline erişemez
- admin paneli erişimi `ADMIN` ve `EDITOR` için tasarlanmıştır
- rol ataması admin veya seed/kurulum akışı üzerinden yapılmalıdır

## Demo Seed

Demo admin/editor kullanıcıları oluşturmak için:

```bash
npm run seed:demo
```

Varsayılan demo kullanıcılar:

- `admin@unitic.dev` / `Admin123!` -> `ADMIN`
- `editor@unitic.dev` / `Editor123!` -> `EDITOR`

Gerekirse env ile override edebilirsiniz:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_USERNAME`
- `SEED_ADMIN_PASSWORD`
- `SEED_EDITOR_EMAIL`
- `SEED_EDITOR_USERNAME`
- `SEED_EDITOR_PASSWORD`

## Yetki Matrisi

| Özellik | ADMIN | EDITOR | USER | Public |
|---|---|---|---|---|
| Admin panel girişi | Evet | Evet | Hayır | Hayır |
| İçerik tipi oluştur/güncelle/sil | Evet | Hayır | Hayır | Hayır |
| Kayıt oluştur/güncelle/sil | Evet | Evet | Hayır | Hayır |
| Kayıt publish/unpublish | Evet | Evet | Hayır | Hayır |
| Medya yükle/listele/sil | Evet | Evet | Hayır | Hayır |
| Kullanıcı yönetimi | Evet | Hayır | Hayır | Hayır |
| Public içerik görüntüleme | Evet | Evet | Evet | Evet |

## API Özeti

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Users

- `GET /users`
- `POST /users`
- `PATCH /users/:id/active`
- `PATCH /users/:id`
- `DELETE /users/:id`

Bu route'lara sadece `ADMIN` erişebilir.

### Content Types

- `GET /content-types`
- `GET /content-types/:id`
- `POST /content-types`
- `POST /content-types/:id/fields`
- `PATCH /content-types/:id/fields/:fieldId`
- `DELETE /content-types/:id/fields/:fieldId`
- `PATCH /content-types/:id`
- `DELETE /content-types/:id`

Okuma erişimi `ADMIN` ve `EDITOR` içindir. Mutation işlemleri sadece `ADMIN` içindir.

### Entries

- `GET /entries/content-type/:contentType`
- `GET /entries/content-type/:contentType/status/:status`
- `GET /entries/:id`
- `POST /entries/content-type/:contentType`
- `PATCH /entries/:id`
- `PATCH /entries/:id/status`
- `DELETE /entries/:id`

Bu route'lar `ADMIN` ve `EDITOR` için tasarlanmıştır.

### Media

- `GET /media`
- `POST /media`
- `DELETE /media/:id`

Medya upload davranışı:

- form field adı: `file`
- maksimum boyut: `10 MB`
- izin verilen tipler: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`

### Public Content

- `GET /api/public`
- `GET /api/public/all`
- `GET /api/public/:contentType`
- `GET /api/public/:contentType/:slug`

Bu endpoint'ler public'tir ve sadece yayınlanmış içerikleri döndürür.

## Admin Panel

Mevcut admin uygulaması şunları içerir:

- login ve register ekranları
- dashboard
- içerik tipi listeleme ve detay yönetimi
- kayıt listeleme ve detay yönetimi
- medya kütüphanesi
- kullanıcı yönetimi

Middleware davranışı:

- kimliği doğrulanmamış kullanıcılar protected route'larda `/login` sayfasına yönlendirilir
- geçerli oturumu olan kullanıcılar auth sayfalarından içeri yönlendirilir
- geçersiz cookie'ler otomatik temizlenir

## Public Web Uygulaması

Mevcut public uygulama davranışı:

- ana sayfa tüm yayınlanmış içerikleri çeker
- detay sayfaları `contentType` ve `slug` ile veri alır
- API'nin döndürdüğü relative medya URL'leri absolute URL'ye çevrilir
- server-side isteklerde, daha yavaş `localhost` fallback durumlarını azaltmak için `localhost` yerine `127.0.0.1` kullanılır

## Docker Notları

`docker-compose.yml` şu servisleri tanımlar:

- `postgres` container'ı: `unitic-db`
- `api` container'ı: `unitic-api`

Volume kullanımı:

- PostgreSQL kalıcılığı için `postgres_data`
- yüklenen medya dosyalarının kalıcılığı için `uploads_data`

Docker içindeki API şu değerleri kullanır:

- `DATABASE_URL=postgresql://...@postgres:5432/...`
- `UPLOAD_DIR=/app/apps/api/uploads`

## Windows Tailwind / Lightning CSS Sorun Giderme

Bu proje, Tailwind CSS v4'ü `@tailwindcss/postcss` üzerinden kullanıyor. Ayrıca admin uygulamasında Windows native paketi de sabitlenmiş durumda:

- `lightningcss-win32-x64-msvc`

Windows tarafında `lightningcss` kurulumunda veya çözümlemesinde; npm workspace yapısı, optional/native paket çözümlemesi, lockfile durumu ya da platforma özgü bağımlılık farkları nedeniyle hata görülebilir.

`lightningcss`, `tailwindcss` veya Windows native binding hataları alırsanız:

1. Kurulum bozulduysa `node_modules` ve lockfile'ı temizleyin.
2. Repo kökünden temiz bir `npm install` çalıştırın.
3. Kurulumun gerçekten Windows ortamında yapıldığından emin olun; Linux/macOS'tan taşınmış `node_modules` ile devam etmeyin.
4. Sorun devam ederse şu tartışmayı inceleyin:

https://github.com/tailwindlabs/tailwindcss/discussions/16653

Windows tarafındaki workaround ve paket çözümleme geçmişi için referans verilmesi gereken doğru tartışma budur.

## AI Destekli Geliştirme

Bu proje; mimari kararlar, iterasyon, debugging ve geliştirme hızlandırma süreçlerinde agentic AI araçlarının desteğiyle geliştirildi.

Süreç notları için:

- `WORKFLOW.md`

## Lisans

Detaylar için `LICENSE` dosyasına bakın.
