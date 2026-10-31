# TASK-UI-001: Frontend dizaynının yenilənməsi

- **Status:** İcrada
- **Mərhələ:** Addım 1 — audit və plan hazırdır; tətbiq üçün istifadəçi təsdiqi gözlənilir
- **Tarix:** 2026-10-31
- **Məsul agentlər:** Soprano (Team Lead), Jane (Frontend), Watson (Docs)
- **Branch-lər:** `feature/TASK-UI-001-frontend-redesign`, `docs/TASK-UI-001-frontend-redesign`
- **Branch bazası:** `origin/main` — `4608d6e`; lokal `main` branch-i mövcud deyil
- **Audit baseline-ı:** `feature/TASK-AUTH-lead-review` — `0ceb86b`
- **PR-lər:** Açılmayıb; tətbiq və final review mərhələsi başlamayıb
- **Sənədləşdirən:** Watson

## Təsvir

İstifadəçi mövcud frontend görünüşünü bəyənmir və müasir, peşəkar, səliqəli, responsive və əlçatan dizaynla yenilənməsini istəyir. Addım 1-də yalnız audit, araşdırma və plan hazırlanır. Addım 2 istifadəçi təklifi təsdiqləyəndən sonra başlanır. Backend/API və mövcud funksiyalar dəyişdirilmir.

Kökdə qayda faylı `agents.md` adlanır; Windows-da `AGENTS.md` yolu ilə oxunur. Fayl oxunub və istifadəçinin faylı dəyişdirilməyib. Soprano işi Jane-ə həvalə edib; Watson yalnız `docs/` yazır. Rocky üçün backend işi yoxdur.

## API kontraktı və qorunan axınlar

Redesign API-yə endpoint, request/response sahəsi və auth semantikası əlavə etmir. Cari `src/api/` servisləri və sessionStorage auth axını saxlanır. Mövcud ekranlar React state ilə dəyişir; ayrıca router yoxdur. Login, Register, Forgot Password, Reset Password, reset fragmentinin oxunub tarixçədən silinməsi, logout, protected To-Do görünüşü saxlanmalıdır.

To-Do yaratma, redaktə, tamamlama/aktiv etmə, silmə təsdiqi, filtr, aktiv/tamamlanmış saylar və həftəlik məqsəd hesablaması qorunur. Layout dəyişməsi məlumat modelinin və hesablamanın dəyişməsi deyil.

## Audit sübutları və sərhədi

Jane cari checkout-un komponentlərini, stillərini, `package.json` və `tsconfig.json` fayllarını oxuyub. Soprano cari Vite frontend-in login ekranını browser-də açıb: tünd görünüşdə dar panel, böyük MATCHDAY yazısı, yaşıl CTA və ekranın aşağısında qeydiyyat keçidi müşahidə olunub. Protected To-Do ekranına real hesabla daxil olunmayıb; dashboard tapıntıları kod və mövcud tarixi screenshot-lara əsaslanır. Tarixi screenshot cari runtime yoxlaması kimi təqdim edilmir.

| Tapıntı | Mənbə / təsir |
|---|---|
| Desktop-da da dar, tək sütun | `App.css` `.page` maksimum 42.5rem/680px; geniş ekranın sahəsi zəif istifadə edilir |
| Hesab tablosu əsas işdən dominantdır | `.score-display strong` 4.5rem; futbol zolaqları, QOL və konfetti gündəlik tapşırıqdan diqqət yayındıra bilər — estetik qiymətləndirmə |
| Auth ekranları sadə, təcrid edilmiş paneldir | `auth.css` maksimum 30rem; dörd səhifədə label/input/button/error strukturu təkrarlanır |
| Vahid UI primitivləri yoxdur | Button, Input, FormField və StatusPanel səviyyəsi ayrı qurulmayıb; UI kitabxanası yoxdur |
| CSS məsuliyyətləri qarışır | Qlobal button/input/h1, təkrar `.page`, `.filters` və media qaydaları; yeni stilin yan təsir riski var |
| Loading üçün struktur əvəzedicisi yoxdur | Mətn və spinner var, skeleton yoxdur |
| Tema yalnız OS seçiminə bağlıdır | `prefers-color-scheme`; tətbiqdə açıq/tünd/sistem nəzarəti yoxdur |
| Animasiya dili yeni tələbə uyğun deyil | `row-enter` max-height, navigation font-size, proqres width/background animasiyası; konfetti 700ms, QOL 1000ms |
| Test runner sənədlə fərqlənir | Qayda faylı Vitest deyir, faktiki `npm test` Node test runner + jsdom-dur |

Qorunacaq yaxşı əsaslar: TypeScript strict, 44px minimum idarələr, görünən focus, native dialog fokus/Escape davranışı və reduced-motion media qaydası. Bunların mövcudluğu bütün UI üçün tam əlçatanlıq auditi keçirildiyi mənasına gəlmir.

## Təklif olunan istiqamət

Sakit slate + mavi vurğulu məhsuldarlıq workspace-i; Matchday adı və mövcud göstəricilər saxlanır. Desktop-da əsas tapşırıq siyahısı və kompakt həftəlik xülasə, mobil ekranda bir sütun. Auth səhifələri ortaq AuthShell daxilində eyni tipoqrafiya və forma vəziyyətlərini istifadə edir.

Dəqiq rənglər, şrift, ölçülər, spacing, radius, kölgə, tema və motion qaydaları [qərar təklifində](../decisions/0001-frontend-design-system.md) yazılıb. Bu təklif hələ istifadəçi tərəfindən qəbul edilməyib.

## Addım 2 — yalnız təsdiqdən sonra plan

1. Authentication dəyişikliklərinin `main`-ə inteqrasiyası həll edilir; frontend branch-i bu baseline üzərinə yenilənir. Backend commitləri redesign adı altında daşınmır və dəyişdirilmir.
2. Mövcud Vite layihəsinə Tailwind inteqrasiyası və mərkəzi semantic tokenlər əlavə edilir; paket/lockfile dəyişikliyi Soprano tərəfindən review olunur.
3. Seçilmiş shadcn Button/Input/Label/Checkbox/Card/AlertDialog/ToggleGroup/Skeleton və kiçik FormField/StatusPanel/AuthShell hazırlanır.
4. Mövcud To-Do ekranı və dörd auth səhifəsi yeni primitivlərə keçirilir; endpoint, URL/reset fragment və davranış qorunur.
5. Motion səhifə/görünüş, ilkin siyahı stagger-i, mikro-interaksiya və vacib olmayan scroll görünməsinə tətbiq edilir; yalnız transform/opacity, 150–300ms ease-out.
6. Mobile-first responsive, AA rəng kombinasiyaları, klaviatura, focus, dialog focus return, 200% zoom, uzun Azərbaycan mətnləri və reduced-motion yoxlanır.
7. Regression testləri, `npm run lint`, `npm run build`, `npm test`, vizual QA və qaydadakı PR şablonu ilə PR; Soprano review-dan sonra yekun sənədləşmə.

## Asılılıqlar və sənəd uyğunsuzluqları

- Audit baseline-ı `origin/main`-dən 7 commit irəlidədir. Forgot/reset frontend-i və testləri itirilməməlidir. Bu asılılıq tətbiqdən əvvəl həll edilmədən köhnə frontend əsasında redesign başlanmamalıdır.
- Root qayda faylının standart struktur/əmrləri faktiki layihə ilə tam eyni deyil: backend `src/TodoApi`, frontend API qatı `src/api`, test runner isə Node/jsdom-dur. Təkcə standart sxemə uyğunlaşmaq üçün scope-dan kənar köçürmə edilməyəcək.
- `docs/01-layihe-icmali.md`, `02-qerarlar.md` və `03-sonra-arasdirilacaq-movzular.md` əvvəlki auth vəziyyətini təsvir edən hissələr daşıyır (localStorage, sessiya ləğvinin olmaması, avtomatik migration/test planları). Cari auth qeydləri `06-authentication.md`-dədir; köhnə qəbul edilmiş qərarlar bu tapşırıqda səssiz dəyişdirilmir. Soprano-ya məlumat verilib.

## Qəbul meyarları və "Bitdi"

- [x] Mövcud komponentlər, stillər, paketlər və strict ayarı audit edilib.
- [x] Araşdırma, qərar təklifi və docs indeksi hazırlanıb.
- [ ] İstifadəçi dizayn və kitabxana təklifini təsdiqləyib.
- [ ] Mövcud auth baseline-ı qorunmaqla implementasiya başlayıb.
- [ ] Tokenlər və reusable komponentlər, sonra bütün səhifələr hazırlanıb.
- [ ] Backend/API dəyişməyib, bütün mövcud funksiyalar və görünüş keçidləri işləyir.
- [ ] Responsive, WCAG AA kontrast, klaviatura və focus yoxlanıb.
- [ ] Yalnız transform/opacity animasiyaları 150–300ms, reduced-motion dəstəyi ilə tətbiq edilib.
- [ ] TypeScript strict saxlanılıb, yeni `any` yoxdur.
- [ ] Uyğun regression testləri əlavə edilib və `npm run lint`, `npm run build`, `npm test` keçir.
- [ ] PR açılıb və Soprano təsdiqləyib; `main`-ə birbaşa push edilməyib.
- [ ] Watson yekun nəticə, qərar statusu və docs indeksini yeniləyib.

## Nəticə / Qeydlər

Bu mərhələdə frontend/backend kodu, konfiqurasiya və paketlər dəyişdirilməyib. Cari frontend baseline-ı Soprano tərəfindən yoxlanıb: `npm run lint` — exit 0, `npm run build` — exit 0 (TypeScript strict və Vite 7.3.7), `npm test` — 12/12, exit 0. Bunlar mövcud tətbiqin baseline yoxlamalarıdır; redesign implementasiyası üçün yekun yoxlama deyil. Tapşırıq "Tamamlandı" deyil; yalnız Addım 1 hazırlanıb, tətbiq üçün təsdiq gözlənilir.

İmza: **Watson**
