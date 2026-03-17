# Unitic CMS

Bu repo, içerik yönetimi için üç ana uygulama ve bir ortak veritabanı paketi içerir:

- `apps/api`: NestJS tabanlı CMS API
- `apps/admin`: Next.js tabanlı yönetim paneli
- `apps/web`: Next.js tabanlı public içerik sitesi
- `packages/database`: Prisma şeması ve migration yönetimi

Amaç: içerik tiplerini (şemaları) tanımlamak, bu şemalara göre kayıt üretmek, medya yüklemek ve yayınlanan içerikleri public olarak sunmaktır.

## Proje Mimarisi ve Çalışma Mantığı

- **API (apps/api)**: Tüm veri yönetimi burada yapılır. JWT tabanlı kimlik doğrulama, rol bazlı yetkilendirme, içerik tipleri/alanları, kayıtlar ve medya yönetimi bu serviste bulunur.
- **Admin (apps/admin)**: Yönetici ve editörlerin içerik tiplerini ve kayıtları yönetebildiği paneldir. API ile konuşur, HttpOnly cookie üzerinden oturum yönetir.
- **Web (apps/web)**: Sadece yayınlanmış içerikleri gösteren public arayüzdür. Public API endpoint’lerinden veri çeker.
- **Prisma (packages/database)**: PostgreSQL şemasını ve migration’ları yönetir. API, Prisma Client ile aynı şemayı kullanır.
- **Docker**: PostgreSQL + API servislerini tek komutla ayağa kaldırmak için kullanılır.

## Monorepo Yapısı

- `apps/api`: NestJS API kaynağı
- `apps/admin`: Admin panel (Next.js)
- `apps/web`: Public site (Next.js)
- `packages/database`: Prisma şeması ve migration’lar
- `docker-compose.yml`: PostgreSQL + API konteynerleri
- `.env` / `.env.example`: Ortam değişkenleri

## Ortam Değişkenleri (.env)

Root dizindeki `.env` dosyası tüm uygulamalar için ana kaynaktır. `.env.example` üzerinden kopyalanabilir.

- Next.js uygulamaları (`apps/admin`, `apps/web`) root `.env` dosyasını `next.config.ts` içinde yükler.
- Prisma (`packages/database`) root `.env` dosyasını `prisma.config.ts` içinde yükler.
- API (`apps/api`) varsayılan olarak root `.env` dosyasını kullanır.
- İhtiyaç olursa API için `APP_ENV_FILE` ile farklı bir env dosyası verilebilir.

- `PORT`: API portu (varsayılan 3000)
- `JWT_SECRET`: JWT imzalama anahtarı
- `DATABASE_URL`: PostgreSQL bağlantı adresi
- `CORS_ORIGIN`: API için izin verilen origin’ler (virgülle ayrılmış)
- `NEXT_PUBLIC_API_URL`: Admin ve Web uygulamalarının API adresi
- `APP_ENV_FILE`: (Opsiyonel) API tarafında farklı env dosyası yolu (absolute path önerilir)
- `POSTGRES_USER`: Docker Postgres kullanıcı adı
- `POSTGRES_PASSWORD`: Docker Postgres şifresi
- `POSTGRES_DB`: Docker Postgres veritabanı adı
- `UPLOAD_DIR`: (Opsiyonel) Medya upload dizini
- `SEED_*`: (Opsiyonel) demo admin/editor seed bilgileri

Örnek:
```
PORT=3000
JWT_SECRET="dev-secret"
DATABASE_URL="postgresql://username:password@localhost:5432/cms"
CORS_ORIGIN="http://localhost:3000,http://localhost:3001,http://localhost:3002"
NEXT_PUBLIC_API_URL="http://localhost:3000"
# APP_ENV_FILE="/absolute/path/to/.env"
POSTGRES_USER=devilyxrd
POSTGRES_PASSWORD="devilyxrdwashere123"
POSTGRES_DB=cms
UPLOAD_DIR="C:\\path\\to\\unitic-cms\\apps\\api\\uploads"
```

### Env Yükleme Kaynakları (Kodda Nerede?)

- `apps/admin/next.config.ts`
- `apps/web/next.config.ts`
- `packages/database/prisma.config.ts`
- `apps/api/src/main.ts`

## Sistemi Ayağa Kaldırma Seçenekleri

### Seçenek A - Önerilen günlük akış (DB + API Docker, Admin/Web lokal)

Bu akış en pratik geliştirme modelidir: backend servisleri konteynerde, frontendler hızlı local reload ile çalışır.

1. **PostgreSQL + API (Docker ile)**
   ```
  npm run docker:up
   ```
  Not: Sonraki açılışlarda `npm run docker:start` yeterlidir.

2. **Prisma migration/client**
   ```
  npm --workspace database run prisma:generate
  npm --workspace database run prisma:migrate:dev
   ```

3. **Admin**
   ```
  npm --workspace admin run dev
   ```
  Port: `http://localhost:3002`

4. **Web**
   ```
  npm --workspace web run dev
   ```
  Port: `http://localhost:3001`

### Seçenek B - DB Docker, API lokal (backend debug ağırlıklı)

`start:dev` ve debugger ihtiyacı varsa API'yi lokal çalıştırmak daha uygundur.

1. DB'yi aç:
  ```
  docker compose up -d postgres
  ```
2. Prisma hazırlığı:
  ```
  npm --workspace database run prisma:generate
  npm --workspace database run prisma:migrate:dev
  ```
3. API lokal:
  ```
  npm --workspace api run start:dev
  ```
4. Admin/Web lokal:
   ```
  npm --workspace admin run dev
  npm --workspace web run dev
   ```
  Admin: `http://localhost:3002` | Web: `http://localhost:3001`

### Seçenek C - Tam konteyner odaklı backend (production-like)

`docker-compose.yml` + `apps/api/Dockerfile` kombinasyonu API'yi `start:prod` (dist) ile çalıştırır.

1. Build + up:
  ```
  npm run docker:up
  ```
2. Loglar:
  ```
  npm run docker:logs
  ```

Notlar:
- API ayağa kalkınca Swagger arayüzü `/` yolunda servis edilir.
- Admin/Web uygulamaları `NEXT_PUBLIC_API_URL` üzerinden API'ye bağlanır.
- Demo kullanıcı için root'ta `npm run seed:demo` kullanılabilir.

## Docker Komutları (root `package.json`)

Bu komutlar **PostgreSQL + API** servislerini yönetir:

- `npm run docker:up` → build + up
- `npm run docker:start` → up (mevcut image ile)
- `npm run docker:down` → down
- `npm run docker:clean` → projeye ait container + volume + local image temizliği (tam sıfırlama)
- `npm run docker:restart` → restart
- `npm run docker:ps` → container list
- `npm run docker:logs` → log takip

`docker:clean` notu: Postgres verisi ve upload volume dahil projeye ait Docker state silinir.

### Docker Davranışı Kodda Nerede Tanımlı?

- `docker-compose.yml`: servisler, environment, port/volume tanımları
- `apps/api/Dockerfile`: API build ve runtime (start:prod)
- `package.json`: root docker scriptleri

## AI Usage & Development Workflow

Bu proje geliştirilirken agentic AI araçlarından aktif olarak yararlanılmıştır.  
AI; yalnızca autocomplete amacıyla değil, mimari kararlar, dosya organizasyonu, API tasarımı, dynamic form yaklaşımı ve debug süreçlerinde kullanılmıştır.

### Kullanım Alanları
- Monorepo mimarisinin netleştirilmesi (`apps/api`, `apps/admin`, `apps/web`, `packages/database`)
- Auth + role tabanlı erişim akışının iyileştirilmesi
- Dynamic entry form yapısının kurgulanması
- Media upload güvenlik kontrollerinin checklist’lenmesi
- README’nin teknik kararlar perspektifinde güçlendirilmesi

Detaylı AI çalışma notları için: **`WORKFLOW.md`**

## Veritabanı Modeli (Prisma)

### Temel Varlıklar
- `User`: Admin/editör/kullanıcı hesapları
- `ContentType`: İçerik tipleri (ör. Blog Yazısı)
- `ContentField`: İçerik tipine ait alanlar (TEXT, RICHTEXT, MEDIA, vs.)
- `Entry`: İçerik tipine bağlı kayıtlar
- `EntryValue`: Entry’nin alan değerleri
- `Media`: Medya dosyaları

### Rol ve Durumlar
- `Role`: `ADMIN`, `EDITOR`, `USER`
- `EntryStatus`: `DRAFT`, `PUBLISHED`
- `FieldType`: `TEXT`, `RICHTEXT`, `NUMBER`, `BOOLEAN`, `DATE`, `MEDIA`

## Register ve Rol Atama Notu

`/auth/register` endpoint’i yeni kullanıcıyı varsayılan olarak `USER` rolüyle oluşturur.  
Admin panel (`/admin`) erişimi yalnızca `ADMIN` / `EDITOR` rollerine açıktır.

Bu nedenle kayıt olan kullanıcıların panel erişimi için rol ataması gerekir (ör. seed veya admin müdahalesi ile).

## Neden `USER` Rolü Var?

Case içinde admin/editor ağırlığı olsa da `USER` rolünü **public web** tarafı için konumlandırdım:
- `/auth/register` ile oluşan kullanıcılar admin paneline giremez (sadece public içerik tarafında kullanılabilir).
- Böylece panel güvenliği bozulmadan, public taraf için gerçekçi bir kullanıcı tipi sağlanır.

## Demo Kullanıcılar (Seed)

Değerlendirici için hızlı giriş sağlamak adına demo admin/editor kullanıcıları seed ile eklenebilir:

```
npm run seed:demo
```

Demo hesaplar (varsayılan):
- `admin@unitic.dev` / `Admin123!` (ADMIN)
- `editor@unitic.dev` / `Editor123!` (EDITOR)

> İstersen `.env` içindeki `SEED_*` değişkenleriyle bu bilgileri değiştirebilirsin.

## Role Matrix (Yetki Tablosu)

| Özellik | ADMIN | EDITOR | USER | Public |
|---|---|---|---|---|
| Admin panel login | ✅ | ✅ | ❌ | ❌ |
| Content Type oluştur/güncelle/sil | ✅ | ❌ | ❌ | ❌ |
| Entry oluştur/güncelle/sil | ✅ | ✅ | ❌ | ❌ |
| Entry publish/unpublish | ✅ | ✅ | ❌ | ❌ |
| Media upload/list | ✅ | ✅ | ❌ | ❌ |
| Media delete | ✅ | ❌ | ❌ | ❌ |
| User management | ✅ | ❌ | ❌ | ❌ |
| Public içerik görüntüleme | ✅ | ✅ | ✅ | ✅ |

## API (apps/api)

### Kimlik Doğrulama ve Yetkilendirme

- JWT tabanlı kimlik doğrulama vardır.
- Token, `Authorization: Bearer <token>` header’ı veya `admin_token` adlı HttpOnly cookie ile geçilebilir.
- `@Public()` işaretli endpoint’ler herkese açıktır.
- `@Roles()` ile rol kontrolü yapılır.

### Auth Endpoint’leri (`/auth`)

1. `POST /auth/register`
   - Yeni kullanıcı kaydı (role otomatik `USER`).
   - Request:
     ```json
     {
       "email": "ornek@domain.com",
       "username": "ornekkullanici",
       "password": "Sifre123!"
     }
     ```
   - Response:
     ```json
     {
       "ok": true,
       "user": {
         "id": "uuid",
         "email": "ornek@domain.com",
         "username": "ornekkullanici",
         "role": "USER"
       },
       "message": "Kayıt oluşturuldu..."
     }
     ```

2. `POST /auth/login`
   - Admin veya editör girişi için.
   - Başarılı olursa `admin_token` cookie set edilir.
   - Request:
     ```json
     {
       "email": "ornek@domain.com",
       "password": "Sifre123!"
     }
     ```
   - Response:
     ```json
     {
       "ok": true,
       "user": {
         "id": "uuid",
         "email": "ornek@domain.com",
         "username": "ornekkullanici",
         "role": "ADMIN"
       }
     }
     ```

3. `POST /auth/logout`
   - `admin_token` cookie temizlenir.
   - Response:
     ```json
     { "ok": true }
     ```

4. `GET /auth/me`
   - Aktif kullanıcı bilgisi.
   - Response:
     ```json
     {
       "id": "uuid",
       "email": "ornek@domain.com",
       "username": "ornekkullanici",
       "role": "ADMIN",
       "isActive": true,
       "createdAt": "2026-03-17T..."
     }
     ```

### Kullanıcı Yönetimi (`/users`) — Sadece `ADMIN`

1. `GET /users`
   - Response:
     ```json
     { "data": [/* User[] */], "total": 3 }
     ```

2. `POST /users`
   - Request:
     ```json
     {
       "email": "a@b.com",
       "username": "admin",
       "password": "Sifre123!",
       "role": "EDITOR"
     }
     ```
   - Response: yeni user objesi

3. `PATCH /users/:id/active`
   - Request:
     ```json
     { "active": true }
     ```
   - Response: güncellenmiş user objesi

4. `PATCH /users/:id`
   - Request:
     ```json
     {
       "email": "yeni@domain.com",
       "username": "yeni",
       "password": "YeniSifre123!",
       "role": "ADMIN"
     }
     ```
   - Response: güncellenmiş user objesi

5. `DELETE /users/:id`
   - Response:
     ```json
     { "success": true }
     ```

### İçerik Tipleri (`/content-types`)

1. `GET /content-types` (ADMIN, EDITOR)
   - Response:
     ```json
     { "data": [/* ContentType[] */], "total": 2 }
     ```

2. `GET /content-types/:id` (ADMIN, EDITOR)
   - Response: tek içerik tipi + alanları

3. `POST /content-types` (ADMIN)
   - Request:
     ```json
     {
       "name": "Blog Yazısı",
       "slug": "blog-yazisi",
       "description": "Blog içerikleri"
     }
     ```
   - Response: oluşturulan içerik tipi

4. `POST /content-types/:id/fields` (ADMIN)
   - Request:
     ```json
     {
       "name": "Başlık",
       "slug": "baslik",
       "type": "TEXT",
       "required": true
     }
     ```
   - Response: güncel içerik tipi

5. `PATCH /content-types/:id/fields/:fieldId` (ADMIN)
   - Request:
     ```json
     { "name": "Yeni Başlık", "type": "RICHTEXT" }
     ```
   - Response: güncel içerik tipi

6. `DELETE /content-types/:id/fields/:fieldId` (ADMIN)
   - Response: güncel içerik tipi

7. `PATCH /content-types/:id` (ADMIN)
   - Request:
     ```json
     { "name": "Yeni Ad", "slug": "yeni-slug", "description": "..." }
     ```
   - Response: güncellenmiş içerik tipi

8. `DELETE /content-types/:id` (ADMIN)
   - Response:
     ```json
     { "success": true }
     ```

### Kayıtlar (`/entries`) — ADMIN, EDITOR

1. `GET /entries/content-type/:contentType`
2. `GET /entries/content-type/:contentType/status/:status`
   - Response:
     ```json
     { "data": [/* Entry[] */], "total": 5 }
     ```

3. `GET /entries/:id`
   - Response: tek entry + values

4. `POST /entries/content-type/:contentType`
   - Request:
     ```json
     {
       "slug": "blog-yazisi-1",
       "status": "DRAFT",
       "values": [
         { "fieldId": "uuid", "value": "Merhaba" },
         { "fieldId": "uuid", "mediaId": "uuid" }
       ]
     }
     ```
   - Response: oluşturulan entry + values

5. `PATCH /entries/:id`
   - Request:
     ```json
     { "slug": "yeni-slug", "status": "PUBLISHED", "values": [/* ... */] }
     ```
   - Response: güncellenmiş entry + values

6. `PATCH /entries/:id/status`
   - Request:
     ```json
     { "status": "PUBLISHED" }
     ```
   - Response: güncellenmiş entry

7. `DELETE /entries/:id`
   - Response:
     ```json
     { "success": true }
     ```

Notlar:
- `MEDIA` tipli alanlarda `mediaId` zorunludur.
- `slug` verilmezse içerik alanlarından otomatik üretilir.
- `PUBLISHED` durumunda `publishedAt` otomatik set edilir.

### Medya (`/media`) — ADMIN, EDITOR

1. `GET /media`
   - Response:
     ```json
     { "data": [/* Media[] */], "total": 3 }
     ```

2. `POST /media`
   - `multipart/form-data`
   - `file` alanı ile dosya yüklenir.
   - 10MB limit, izinli mime type kontrolü vardır.

3. `DELETE /media/:id` (ADMIN)
   - Response:
     ```json
     { "success": true }
     ```

**Upload kalıcılığı**
- Varsayılan upload dizini: `apps/api/uploads` (değiştirilebilir: `UPLOAD_DIR`)
- Docker ile çalıştırıldığında `uploads_data` volume bu dizine bağlıdır; konteyner yeniden başlasa da dosyalar korunur.

### Public İçerik (`/api/public`)

Bu endpoint’ler public ve sadece `PUBLISHED` içerikleri döner.

1. `GET /api/public`
   - Yayınlanmış içerik tipleri listesi
2. `GET /api/public/all`
   - Tüm yayınlar içerik tipine göre gruplanmış
3. `GET /api/public/:contentType`
   - İçerik tipine göre yayın listesi
4. `GET /api/public/:contentType/:slug`
   - Yayınlanan tek içerik detayı

## Admin Panel (apps/admin)

### Yapılabilenler

- Kullanıcı girişi / kayıt
- Dashboard (kullanıcı, içerik tipi, medya, yayın istatistikleri)
- İçerik tipi oluşturma, düzenleme, silme
- İçerik tipi alanları (field) ekleme, düzenleme, silme
- Kayıt oluşturma, listeleme, filtreleme, güncelleme, silme
- Medya yükleme, listeleme, silme (silme sadece ADMIN)
- Kullanıcı yönetimi (sadece ADMIN)

### Erişim Kuralları

- `ADMIN`: Tüm panel yetkileri
- `EDITOR`: İçerik ve medya yönetimi, kullanıcı yönetimi yok
- `USER`: Admin paneline giriş yapamaz

UI kanıtları:
- Editor rolü `Kullanıcılar` menüsünü görmez ve kullanıcı yönetimi ekranına erişemez.
- İçerik tipi oluşturma/düzenleme alanları admin rolü olmayan kullanıcılar için kapatılır ve uyarı mesajı gösterilir.

Admin panel, `admin_token` cookie ile oturum doğrular. Next.js middleware ile korumalı sayfalar yönlendirilir.

## Web (apps/web)

Public sitede sadece yayınlanan içerikler gösterilir:

- Ana sayfa tüm yayınları listeler (`GET /api/public/all`)
- Detay sayfası belirli içerik tipine ve slug’a göre içerik gösterir
- Medya alanları varsa, görsel veya dosya linkiyle render edilir

## Prisma Nasıl Ayağa Kaldırılır, Amacı Nedir?

Prisma, veritabanı şemasını tanımlar ve migration yönetir.

Amaçlar:
- Schema üzerinden güvenli TypeScript client üretmek
- Migration’ları sürümlemek
- Veritabanı değişikliklerini tutarlı biçimde uygulamak

Temel komutlar `packages/database` altında:
- `npm run prisma:generate`
- `npm run prisma:migrate:dev`
- `npm run prisma:migrate:status`
- `npm run prisma:studio`

## Docker Bu Projede Ne İşe Yarıyor?

`docker-compose.yml` ile PostgreSQL ve API birlikte ayağa kaldırılır. Bu sayede:
- Lokal DB kurulumuna gerek kalmaz
- Tutarlı bir veritabanı ortamı sağlanır
- API tek komutla çalıştırılabilir
- `uploads_data` volume ile medya dosyaları kalıcı hale gelir

## İmza

made by devilyxrd
