# Unitic CMS API

Bu servis, Unitic CMS için modüler NestJS backend katmanıdır.

## Mimari

- `AuthModule`: JWT tabanlı kimlik doğrulama.
- `UsersModule`: kullanıcı oluşturma, listeleme, aktif/pasif yönetimi.
- `ContentTypesModule`: içerik tipi ve alan şema yönetimi.
- `EntriesModule`: kayıt oluşturma, listeleme, durum güncelleme.
- `MediaModule`: dosya yükleme ve medya listeleme.
- `PublicContentModule`: sadece yayınlanmış içeriklerin public okunması.

## Güvenlik ve Doğrulama

- Global `ValidationPipe` aktif (`whitelist`, `forbidNonWhitelisted`, `transform`).
- Global JWT guard ve role guard aktif.
- `@Public()` ile public endpointler işaretlenir.
- Hata çıktıları tek formatta döner:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Açıklayıcı hata mesajı",
  "path": "/ornek",
  "timestamp": "2026-03-16T00:00:00.000Z"
}
```

## API Endpointleri

### Auth
- `POST /auth/login`
- `GET /auth/me`

### Users (ADMIN)
- `GET /users`
- `POST /users`
- `PATCH /users/:id/active`

### Content Types
- `GET /content-types`
- `GET /content-types/:id`
- `POST /content-types` (ADMIN)
- `POST /content-types/:id/fields` (ADMIN)

### Entries
- `GET /entries?contentType=:slug&status=DRAFT|PUBLISHED`
- `GET /entries/:id`
- `POST /entries?contentType=:slug`
- `PATCH /entries/:id/status`

### Media
- `GET /media`
- `POST /media` (`multipart/form-data`, `file` alanı)

### Public Content
- `GET /public/:contentTypeSlug`
- `GET /public/:contentTypeSlug/:entrySlug`

## Çalıştırma

```bash
npm install
npx prisma generate --schema packages/database/prisma/schema.prisma
cd apps/api
npm run start:dev
```

## Notlar

- Yüklenen dosyalar `uploads/` klasörüne yazılır ve `/uploads/*` olarak servis edilir.
- JWT için ortam değişkenleri:
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN` (opsiyonel)
- CORS için ortam değişkeni:
  - `CORS_ORIGIN` (virgülle ayrılmış origin listesi)
