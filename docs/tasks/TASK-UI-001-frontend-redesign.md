# TASK-UI-001: Matchday frontend dizaynının yenilənməsi

- **Status:** İcrada
- **Mərhələ:** Əvvəlki dəyişikliklər push edilib; yeni giriş screenshotu və kök README yenilənməsi hazırlanır
- **Tarix:** 2026-11-01
- **Məsul agentlər:** Soprano (Team Lead), Jane (Frontend), Watson (Docs)
- **Cari ortaq branch:** `feature/TASK-UI-001-publish-changes`
- **Əvvəlki branch-lər:** `feature/TASK-UI-001-frontend-redesign`, `feature/TASK-UI-001-lead-review`, `docs/TASK-UI-001-frontend-redesign`
- **Branch bazası:** `origin/main` — `4608d6e`; lokal `main` branch-i mövcud deyil
- **Audit baseline-ı:** `feature/TASK-AUTH-lead-review` — `0ceb86b`
- **PR-lər:** Hələ açılmayıb; 2026-11-01 tarixli göstəriş GitHub-a push etməyə icazə verir
- **Sənədləşdirən:** Watson

## Təsvir və son istiqamət

### 2026-11-01: GitHub README üçün yeni giriş screenshotu

İstifadəçi GitHub README-nin screenshot bölməsinin yeni giriş ekranı ilə yenilənməsini istəyib. İş eyni `feature/TASK-UI-001-publish-changes` branch-ində davam edir. Soprano əvvəlki `c3e3ca1` commitinin GitHub-a uğurla push edildiyini və remote ilə eyni olduğunu təsdiqləyib. Bu yeni screenshot/README dəyişikliklərinin push-u isə hələ gözlənilir.

Soprano yeni giriş ekranının şəklini `docs/screenshot-login-current.jpg` kimi saxlayacaq və kök `README.md` screenshot bölməsini yeniləyəcək. Watson yalnız bu tapşırıq qeydini və sənəd indeksini yeniləyir. Screenshot çəkmək istifadəçinin istədiyi artefaktın hazırlanmasıdır; build, lint və test işə salınmır və nəticələri barədə uğur iddiası yoxdur. Yeni PR və ya `main`-ə merge edildiyi bildirilmir.

### 2026-11-01: Əsas qovluq və GitHub-a push hazırlığı

İstifadəçi worktree-dəki dəyişikliklərin əsas layihə qovluğuna gətirilməsini, yeni branch yaradılmasını və GitHub-a push edilməsini istəyib. Əvvəlki no-push məhdudiyyəti bu göstərişlə dəyişib. Soprano-nun yoxlamasına görə `git worktree list` yalnız əsas `C:/Users/elesg/OneDrive/Desktop/VerticalSliceArch` qovluğunu göstərir; dəyişikliklər artıq həmin qovluqda və commit tarixçəsindədir. Başlanğıc iş ağacı təmizdir. `git fetch origin` uğurludur; mövcud tarixçə `origin/main`-dən 15 commit irəlidə, 0 commit geridədir. Soprano dəyişiklikləri qoruyan `feature/TASK-UI-001-publish-changes` branch-ini yaradıb. Bu qeyd yazılarkən push hələ təsdiqlənməyib.

Yeni kod yazılmır. İstifadəçinin “hər şeyi test etmə ehtiyac yoxdu” göstərişi ilə build, lint, test və browser yoxlamaları işə salınmır; uğurlu nəticə kimi təqdim edilmir. Bu qeyddə `main`-ə merge edildiyi və ya PR təsdiqləndiyi iddia olunmur.

PR açılmayıb və `main`-ə merge edilməyib. Soprano GitHub CLI-nin (`gh`) quraşdırılmadığını və PR yaratmaq üçün uyğun connector-un olmadığını bildirib; push-dan sonra GitHub müqayisə/PR yaratma keçidi təqdim olunacaq.

İstifadəçi mövcud görünüşün keyfiyyətini yüksəltmək istəyir, amma Matchday-in futbol konsepti **saxlanmalıdır**: tünd yaşıl palitra, scoreboard, tapşırıq oyunu, qol sayı və qısa tamamlama effekti. Əvvəlki slate/mavi workspace təklifi qəbul edilməyib və [0002 futbol dizayn sistemi təklifi](../decisions/0002-matchday-football-design-system.md) ilə əvəz olunur. Əvvəlki mərhələdə yalnız audit/plan icazəsi var idi. Son diaqnostika/düzəliş promptu kod yoxdursa implementasiya etməyə açıq icazə verir. Soprano mənbə kodunun yazılmadığını təsdiqlədiyi üçün Jane tətbiqə başlayıb; əlavə təsdiq gözlənilmir.

Soprano işi Jane-ə həvalə edib; Watson yalnız `docs/` yazır. Kökdə `agents.md` qayda faylı Windows-da `AGENTS.md` yolu ilə oxunub; istifadəçinin faylı dəyişdirilməyib. Rocky üçün backend işi yoxdur.

## API kontraktı və qorunan axınlar

Backend, endpoint-lər, request/response sahələri və auth semantikası dəyişmir. Cari `src/api/` servisləri, sessionStorage axını və TypeScript strict saxlanır. Login/Register/Forgot/Reset səhifələrinin mövcud state əsaslı keçidləri və reset fragmentinin oxunub tarixçədən silinməsi qorunur; ayrıca router əlavə edilmir.

To-Do yaratma, redaktə, tamamlama/aktiv etmə, silmə təsdiqi, filtr, aktiv/tamamlanmış saylar və həftəlik məqsəd hesablaması dəyişmir. Scoreboard vizual balansı düzəlir, məlumat hesablaması dəyişmir. Avatar menyusu real logout əməlini saxlayır, əlavə saxta hesab funksiyası yaratmır.

## Sübutların sərhədi

- **Kod auditi:** Jane cari checkout-un komponentlərini, stillərini, paketlərini və strict ayarını oxuyub. Dashboard tapıntıları kod və repodakı tarixi screenshot-lara əsaslanır.
- **Əvvəlki canlı yoxlama:** Soprano Vite login ekranını browser-də açıb, dar tünd panel və böyük MATCHDAY yazısını müşahidə edib. Real hesabla protected dashboard-a daxil olunmayıb.
- **Son istifadəçi məlumatı:** Login/dashboard üzrə aşağıdakı konkret düzəlişlər istifadəçinin yazılı təsviridir. Son promptla yeni screenshot attachment mövcud deyil; təsvir yeni screenshot-un agent tərəfindən görülməsi kimi təqdim edilmir.
- **Font sübutu:** `main.tsx` artıq latin-ext 600/700 və latin 600/700 import edir. Jane font binary cmap-də latin-ext 600 üçün U+018F Ə və U+0259 ə əhatəsini təsdiq edib. Hər iki subset eyni family/style/weight və unicode-range olmadan elan olunduğundan sıralama/fallback riski var; problem sadəcə latin-ext paketinin olmaması deyil.

## Mövcud UI auditinin nəticələri

| Tapıntı | Dəqiq mənbə / düzəliş istiqaməti |
|---|---|
| Login formunun qrupu və ritmi zəifdir | `auth.css` dar 30rem paneldə logo+card artıq flex ilə mərkəzləşir; yeni AuthShell ölçü/hizalama/keyboard-safe scroll-u təkmilləşdirəcək |
| Password göstərişi xarici mətn düyməsidir | Password daxilində sağ Eye/EyeOff icon button; ölçü email ilə bərabər |
| Auth markup təkrarlanır | Dörd auth səhifəsi üçün ortak FormField/AuthShell/status elementləri |
| Header və məzmun kənarları eyni davranmır | Sticky blur artıq var; header eyni content container ilə hizalanacaq |
| Scoreboard grid-ində boş sahə var | `Scoreboard.tsx` üç sütun təklif edir, iki görünən blok və gizli status var; QOL/QALAN balanslanacaq |
| Card daxilində MATCHDAY təkrarı var | `match-meta` daxilində əlavə brand çıxarılacaq, tarix qalacaq |
| Font importu mövcuddur, Ə riski qalır | Eyni-weight face sıralaması; Azərbaycan başlıqları üçün system-ui, Barlow yalnız ASCII brand/rəqəm və ya unicode-range həlli yoxlanacaq |
| Loading struktur göstərmir | Mətn/spinner var; ölçünü qoruyan skeleton + status əlavə olunacaq |
| Tema yalnız OS-dən gəlir | Açıq/tünd/sistem seçimi və semantic tokenlər təklif olunur; futbol palitrası saxlanır |
| Mövcud motion yeni tələbə uyğun deyil | `row-enter` max-height, header font-size, progress width/background; konfetti 700ms/QOL 1000ms əvəzinə transform/opacity 150–300ms |
| Qlobal CSS və təkrar qaydalar var | button/input/h1 və təkrar `.page`/`.filters`; komponent sərhədləri ilə azaldılacaq |
| Test runner qayda nümunəsindən fərqlidir | Faktiki Node test runner + jsdom, qayda faylında Vitest yazılıb; cari suite yanlış təqdim edilmir |

Mövcud yaxşı əsaslar qorunur: 44px idarələr, focus-visible, native dialog-un klaviatura/Escape davranışı, reduced-motion media qaydası, API qatının ayrılması və strict TypeScript.

## İcazələndirilmiş icra ardıcıllığı

1. Jane-in branch-i origin/main əsasında saxlanır və əvvəl yalnız frontend auth commit-i `7184bff` tətbiq olunur (Jane branch-ində `ac85554`). Soprano-nun `feature/TASK-UI-001-lead-review` branch-i tam mövcud auth baseline-ını saxlayır. Yalnız yeni frontend implementasiya commitləri bu review branch-inə keçiriləcək; backend commitləri redesign adı ilə daşınmır.
2. Tailwind + Vite setup, semantic tokenlər, seçilmiş shadcn/ui primitivləri, `motion/react` və named `lucide-react` ikonları; paket/lockfile dəyişikliyi Team Lead review-dan keçir.
3. Button/Input/Label/FormField, PasswordField, AuthShell, StatusPanel, Skeleton, avatar DropdownMenu, AlertDialog, filtr indicator və statik PitchDecoration hazırlanır.
4. Login, Register, Forgot/Reset və dashboard yeni primitivlərə keçirilir; scoreboard və həftəlik hədəf saxlanır.
5. Məhdud view/list/mikro-interaksiya, qısa goal/confetti, progress scaleX və reduced-motion davranışı əlavə olunur.
6. Regression, responsive/AA/klaviatura/zoom/font yoxlamaları, `npm run lint`, `npm run build`, `npm test`, PR şablonu və Soprano review; Watson yekun statusu yeniləyir.

## Qəbul meyarları

### Addım 1 və təsdiq

- [x] Kök qayda faylı yenidən oxunub, real Jane/Watson rolları ilə iş bölünüb.
- [x] Komponentlər, stillər, paketlər və TypeScript strict audit edilib.
- [x] İstifadəçinin futbol konseptini saxlamaq tələbi slate/mavi təklifi əvəz edib.
- [x] Araşdırma, yeni qərar təklifi və docs indeksi yenilənib.
- [x] Yeni prompt kod yoxdursa implementasiya etməyi icazələndirib; kodun yazılmadığı təsdiqlənib, Jane tətbiqə başlayıb.

### Login və auth səhifələri

- [ ] Logo və card birlikdə həm üfüqi, həm şaquli mərkəzdədir; kiçik hündürlükdə forma və keçidlər scroll ilə əlçatandır.
- [ ] Email/password eyni eni və hündürlüyü bölüşür; solda Mail/Lock ikonları var.
- [ ] Password daxilində sağ Eye/EyeOff button `type="button"`, `aria-label="Parolu göstər"` / `"Parolu gizlət"`, klaviatura və görünən focus ilə işləyir; dekorativ ikonlar aria-hidden-dir.
- [ ] “Şifrəmi unutdum?” password label-in sağında eyni sətirdədir; mobil ekranda daşmır.
- [ ] Submit zamanı spinner, busy/disabled və təkrar submit qoruması var; düymə ölçüsü dəyişmir.
- [ ] Yanlış girişdə yumşaq card shake və inline xəta var; reduced-motion-da shake söndürülür, error yenə əlçatandır.
- [ ] Card yumşaq giriş effekti ilə görünür; auth səhifələri eyni design system-i paylaşır.
- [ ] Register/Forgot/Reset validation, loading/success/error və mövcud keçidlər pozulmayıb.

### Header, hesab menyusu və fon

- [ ] Sticky, yarımşəffaf blur header məzmunla eyni konteyner enində/hizasındadır; statik blur readability-ni pozmur.
- [ ] Ayrı “Çıxış” mətni əvəzinə istifadəçi inisialı avatar və LogOut icon trigger var; hover/focus tooltip “Çıxış” göstərir.
- [ ] Trigger klikdə kiçik menyu açır; real logout menyunun içindədir, trigger öz-özünə logout etmir.
- [ ] Menyu klaviatura, Escape, xaricə klik və fokusun trigger-ə qayıtmasını dəstəkləyir; inisial uzun/boş adlarda daşmır.
- [ ] Arxa fonda statik, zəif futbol meydanı xətləri var; mətn/form kontrastını azaltmır və klikləri tutmur.

### Scoreboard və həftəlik hədəf

- [ ] 0:0 daxil QOL/QALAN rəqəmləri balanslı sol/sağ yerləşir, boş sütun yoxdur.
- [ ] Card daxilində təkrar MATCHDAY çıxarılıb, tarix saxlanır; əsas header brendi qalır.
- [ ] Qol sayı dəyişəndə qısa rəqəm animasiyası və yalnız server tamamlanmanı təsdiqləyəndə qısa confetti/sparkle var.
- [ ] Geri aktiv etmə/reload zamanı yanlış qol effekti yaranmır; reduced-motion-da dekorativ effekt söndürülür.
- [ ] HƏFTƏLİK HƏDƏF və bütün başlıqlarda Ə/ə və digər Azərbaycan hərfləri render olunur; sadəcə import əlavə etməklə yoxlanmış sayılmır.
- [ ] Progress track qalın və 0-da aydındır; 0 dəyər saxta müsbət fill kimi göstərilmir.
- [ ] Progress rəvan artır; width/background animasiyası əvəzinə transform scaleX istifadə olunur, semantik aria dəyərləri düzgün qalır.

### Filtr və tapşırıq siyahısı

- [ ] Hamısı/Meydanda/Qol seçimi izolə edilmiş indicator `layoutId` ilə sabit bərabər slotlar arasında transform-only tween 180–220ms hərəkət edir; label scale və width/height animasiyası yoxdur.
- [ ] Filter dəyişəndə yumşaq siyahı keçidi, mövcud `aria-pressed` və keyboard davranışı qorunur.
- [ ] Add input-un focus vəziyyəti görünür; yeni sətir daxilolma, silinən sətir çıxış effektinə malikdir.
- [ ] İlkin görünmə stagger-i məhduddur və uzun siyahını gecikdirmir; çıxış animasiyası olmayan sətirlər üçün də action state düzgün qalır.
- [ ] Empty state PitchIcon ilə zəif, qısa görünmə effekti istifadə edir; sonsuz dekorativ animasiya yoxdur.
- [ ] Create/edit/toggle/delete, delete təsdiqi, filtrlər və bütün mövcud say/weekly hesablamaları regression testlərindən keçir.

### Ümumi keyfiyyət və “Bitdi”

- [ ] Bütün animasiyalar 150–300ms ease-out, yalnız transform/opacity; reduced-motion nəzərə alınır.
- [ ] Skeleton, boş/xəta/success vəziyyətləri ölçünü və ekran oxuyucu statuslarını düzgün saxlayır.
- [ ] Mobile-first responsive, 200% zoom, uzun Azərbaycan mətnləri, WCAG AA kontrastı, keyboard və görünən focus yoxlanıb.
- [ ] TypeScript strict saxlanılıb, yeni `any` yoxdur; yalnız named lucide ikonları import olunur.
- [ ] Backend/API/route və auth storage dəyişməyib; pending auth baseline-ı qorunub. Logout/401-də protected To-Do dərhal bağlanır, exit/wait animasiyası köhnə istifadəçinin məlumatını ekranda saxlamır.
- [ ] Uyğun testlər əlavə edilib; `npm run lint`, `npm run build`, `npm test` keçir.
- [ ] PR açılıb, qaydadakı şablon və ingiliscə commit + `Agent: Jane` footer istifadə olunub, Soprano təsdiqləyib; main-ə birbaşa push yoxdur.
- [ ] Watson task/qərar/araşdırma/index sənədlərini yekun nəticə ilə yeniləyib.

## Asılılıqlar və sənəd uyğunsuzluqları

Audit baseline-ı `origin/main`-dən 7 commit irəlidədir; Forgot/Reset və auth testləri itirilməməlidir. Asılılıq frontend auth commitinin Jane branch-inə ayrıca keçirilməsi və Soprano review branch-ində tam auth baseline-ının saxlanması ilə idarə olunur. Qayda faylının standart qovluq/runner nümunəsi faktiki `src/TodoApi`, `src/api`, Node/jsdom ilə fərqlənir; bu redesign üçün böyük struktur refaktorinqi planlaşdırılmır.

Köhnə docs/01, docs/02 və docs/03-də localStorage, revocation olmaması, test/rate limit planları kimi tarixlə əlaqəli auth qeydləri var. Cari auth review sənədi docs/06-authentication.md-dir. Ziddiyyət Soprano-ya bildirilib, tarixi qəbul edilmiş qərarlar səssiz dəyişdirilməyib.

## Diaqnostika və tətbiq qeydi

İstifadəçinin tələb etdiyi 6 bənd üzrə faktlar [redesign görünmür diaqnostikasında](../research/frontend-redesign-not-visible.md) qeyd olunub. İlkin səbəb cache deyil: əvvəlki mərhələlərdə yalnız docs yazılmışdı, frontend redesign mənbə kodu/dependency inteqrasiyası edilməmişdi. Hard refresh mövcud olmayan kodu göstərə bilməz.

## Son istifadəçi göstərişi: test etmə

İstifadəçi implementasiya davam edərkən “test etmə” göstərişi verib. Bu göstərişdən sonra əlavə lint/build/test və browser verifikasiyası aparılmır. Əvvəlki baseline build/lint/12 test və login console nəticələri tarixidir, yeni redesign üçün yekun yoxlama kimi təqdim edilmir. Implementasiya və zəruri paket bərpası/dev-server açılışı davam edə bilər; bunlar test nəticəsi sayılmır. AGENTS.md-dəki normal test meyarından bu tapşırıq üçün istifadəçinin açıq göstərişi ilə istisna edilir. Yekun hesabatda test edilmədiyi, PR/push vəziyyəti və yoxlanmamış hissələr açıq qalacaq; “Bitdi” və “testlər keçir” iddiası yoxdur.

## Yoxlamalar və nəticə

Bu yenilənmiş audit mərhələsində Soprano cari frontend baseline-ında `npm run lint` — exit 0, `npm run build` — exit 0 (TypeScript strict + Vite 7.3.7), `npm test` — 12/12, exit 0 nəticələrini yenidən təsdiqləyib. Bunlar redesign sonrası nəticə deyil. Repodakı tarixi login/dashboard screenshot-ları bu mərhələdə Soprano tərəfindən vizual yoxlanıb; yeni attachment kimi təqdim edilmir. Kod/dependency dəyişdirilməyib.

Tapşırıq “Tamamlandı” deyil. Yeni prompt əsasında real implementasiya başlanıb; root/frontend inteqrasiyası və sənədləşdirilmiş nəticə gözlənilir. İstifadəçinin “test etmə” göstərişinə görə yekun test/vizual verifikasiya aparılmayacaq və bu məhdudiyyət qeyd olunacaq. PR/no-push vəziyyəti ayrıca göstərilir.

İmza: **Watson**
