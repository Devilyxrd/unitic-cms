# AI Development Workflow

## 1) Kullandığım Araçlar

- ChatGPT / Codex tabanlı agentic destek
- GitHub Copilot (kod önerisi + refactor hızlandırma)
- Terminal + Prisma + NestJS CLI + Next.js tooling

> Not: Bu projede yalnızca autocomplete kullanılmadı. AI; dosya yapısı tasarımı, mimari kararlar, API contract netleştirme, refactor ve debug adımlarında aktif şekilde kullanıldı.

---

## 2) AI’ı Nerede Kullandım? (Agentic Kullanım Senaryoları)

### Senaryo A — Monorepo Mimarisinin Kurulması
Amaç: `apps/api`, `apps/admin`, `apps/web`, `packages/database` yapısını netleştirmek.

AI’dan istenen:
- Monorepo klasör ayrımı
- Backend / frontend / shared sorumluluk sınırları
- Prisma şemasının `packages/database` altında konumlanması
- Çalıştırma akışı ve environment değişkenlerinin standardizasyonu

Çıktı:
- Daha düzenli klasörleme
- API ve UI’nin sorumluluklarının ayrılması
- README’de daha açıklanabilir teknik mimari

### Senaryo B — Dynamic Content Entry Form Akışı
Amaç: Content type alanlarına göre admin panelde dinamik form üretmek.

AI’dan istenen:
- Field type (`TEXT`, `RICHTEXT`, `NUMBER`, `BOOLEAN`, `DATE`, `MEDIA`) bazlı form kurgusu
- Validation akışının sadeleştirilmesi
- Form state yönetiminin okunabilir hale getirilmesi

Çıktı:
- Dinamik form generation
- Zorunlu alan / tip doğrulama
- Entry oluşturma payload’ının daha stabil hale gelmesi

---

## 3) Örnek Prompt’lar (en az 5)

1. "NestJS + Prisma tabanlı bir headless CMS için monorepo klasör yapısını öner; api/admin/web/database ayrımını net ver."

2. "Content type builder için field type enum tasarımı yap: text, richtext, number, boolean, date, media. Buna uygun entry value modelini öner."

3. "JWT auth + HttpOnly cookie yaklaşımında admin panel route protection için güvenli bir akış öner."

4. "Dynamic form renderer yazmak istiyorum: field tipine göre React input component seçimi ve validation stratejisini çıkar."

5. "Media upload endpoint’i için güvenlik kontrolleri (mime, extension, max size, dangerous extension) checklist’i ver."

6. "README’de teknik kararlar bölümünü mülakat odaklı nasıl yazarım? NestJS/Prisma/Next.js seçimlerini savun."

---

## 4) Debug Örneği (zorunlu)

### Problem
Login başarılı görünmesine rağmen bazı route geçişlerinde kullanıcı yetkili sayılmıyordu.

### AI ile yaklaşım
- Cookie adı, SameSite, credentials: include, middleware token okuma sırası kontrol edildi.
- API tarafında token’ın header/cookie fallback mantığı gözden geçirildi.
- Admin middleware’de protected/public route eşleşmeleri sadeleştirildi.

### Sonuç
- Token okuma akışı netleşti.
- Route-level protection daha stabil çalıştı.
- Hata senaryolarında kullanıcı mesajları iyileştirildi.

---

## 5) Kişisel Değerlendirme

AI bu projede hızlandırıcı rol oynadı; özellikle:
- Mimari kararları hızlı karşılaştırma,
- Tekrarlı kodlarda şablon üretimi,
- Debug sırasında hipotez üretimi

konularında ciddi fayda sağladı.

Ancak tüm öneriler birebir alınmadı; güvenlik, domain kuralları ve case gereksinimleri doğrultusunda manuel doğrulama yapıldı.