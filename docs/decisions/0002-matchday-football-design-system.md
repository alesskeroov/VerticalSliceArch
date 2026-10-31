# 0002: Matchday futbol dizayn sistemi və UI düzəlişləri

- **Status:** Təklif
- **Tarix:** 2026-10-31
- **Əlaqəli tapşırıq:** TASK-UI-001
- **Təklif edən:** Jane (Frontend), Soprano (Team Lead)
- **Sənədləşdirən:** Watson (Docs)
- **Əvəz etdiyi:** [0001 — qəbul edilməmiş slate/mavi təklif](0001-frontend-design-system.md)
- **Təsdiq:** İstifadəçinin təsdiqi gözlənilir; implementasiya icazəsi verilməyib

## Kontekst

İstifadəçinin yeni göstərişi Matchday futbol konseptini saxlamaqdır: tünd yaşıl palitra, scoreboard, tapşırıq oyunu, qol sayları, zəif meydan xətləri və qısa tamamlama effekti. Məqsəd konsepti dəyişmək deyil, login və dashboard-un ölçü, hizalama, tipoqrafiya və interaksiya keyfiyyətini yüksəltməkdir. Backend/API/auth/route funksionallığı qorunur. 0001 təklifi heç vaxt qəbul edilməyib; yalnız bu yeni təklif təsdiqə təqdim olunur.

## Qərar təklifi

### Texniki baza və sərhəd

Mövcud React 19 + TypeScript strict + Vite layihəsinə Tailwind CSS, seçilmiş shadcn/ui komponentləri, `motion` (`motion/react`) və `lucide-react` təklif olunur. İkonlar named import ilə alınır; ikinci ikon kitabxanası və ayrıca tween/counter paketi əlavə edilmir. shadcn primitivləri üçün cari Base UI/Radix variantının uyğunluğu tətbiqdən əvvəl yoxlanır, köhnə təlimat avtomatik seçilmir. Yeni framework, router, form/state kitabxanası və premium animasiya bloku tələb olunmur. Paketlər bu mərhələdə quraşdırılmayıb.

### Semantic tokenlər

| Token | Tünd yaşıl — ilkin təklif | Açıq alternativ |
|---|---|---|
| Fon | `#07130D` | `#F4F7F3` |
| Səth | `#10241A` | `#FFFFFF` |
| Elevated səth | `#173324` | `#FFFFFF` |
| Əsas mətn | `#F1F8F3` | `#14251A` |
| İkinci mətn | `#A9BFAF` | `#4A6252` |
| Input sərhədi | `#597A65` | `#64806C` |
| Vurğu / focus | `#4ADE80` | `#166534` |
| Vurğu üzərində mətn | `#052E16` | `#FFFFFF` |

Scoreboard səthi `#0C3B25`, muted mətn `#B7D7C2`, incə qızılı vurğu `#FDE68A`. Jane-in sRGB hesablaması: tünd text/surface 15.09:1, muted/surface 8.34:1, CTA 8.55:1, input border/surface 3.41:1; açıq rejimdə müvafiq 16.04:1, 6.65:1, 7.13:1, 4.33:1. Scoreboard muted 8.10:1, gold 10.11:1. Bunlar yalnız həmin rəng cütlərinin ölçüləridir; bütün hazır UI üçün WCAG uyğunluğu nəticəsi deyil. Hover/focus/error/success/disabled vəziyyətləri ayrıca yoxlanacaq.

- **Tema:** ilkin tünd yaşıl; açıq/tünd/sistem seçimi təklif olunur. Auth storage dəyişmir, tema seçimi ayrıca saxlanır.
- **Tipoqrafiya:** body `system-ui`, 16px/1.5; başlıqlar 20/28/32px, 500/600 weight. Barlow Condensed yalnız ASCII MATCHDAY və scoreboard rəqəmləri üçün saxlanır.
- **Azərbaycan hərfləri:** HƏFTƏLİK HƏDƏF və digər Azərbaycan başlıqları system font-dan istifadə edir. Mövcud latin-ext importları artıq var və ext font Ə/ə-ni əhatə edir; eyni family/weight və unicode-range olmayan subset elanları sıralama/fallback riski yaradır. Alternativ düzgün unicode-range quruluşu ayrıca təsdiqlənərək yoxlana bilər. `ƏəİıĞğÖöŞşÜüÇç` real render testi qəbul meyarıdır.
- **Spacing:** 4/8/12/16/20/24/32/48/64px.
- **Radius:** input 12px, card 20px, filter 10px, menu 14px.
- **Ölçülər:** input 48px; interaktiv target 44–48px; ikon 18px; focus 2px + 2px offset.
- **Kölgə:** açıq `0 8px 32px rgb(5 46 22 / .08)`, tünd `0 12px 40px rgb(0 0 0 / .24)`; sərhəd/kölgə statikdir.
- **Konteyner:** header və əsas məzmun eyni maksimum 960px daxili konteynerə, mobil 16px/tablet 24px kənar boşluğa malikdir.

### Login kompozisiyası

Logo və card bir kompozisiya kimi mərkəzləşdirilir: outer min-height 100dvh/grid, inner maksimum 440px. Mövcud flex mərkəzləşdirmə yox sayılmır; yeni quruluş qısa viewport və açıq mobil keyboard-da üst hissəni kəsmədən scroll təmin edir.

Email və password eyni 48px wrapper ölçüsünü paylaşır; Mail/Lock solda, Eye/EyeOff sağdadır. Göstər/gizlət icon button-u `type="button"`, 44px target, uyğun aria-label/aria-pressed və görünən focus saxlayır. Mövcud düymə onsuz da keyboard/aria dəstəklidir; dəyişiklik onun mətnini, yerini və ölçü balansını düzəldir. “Şifrəmi unutdum?” password label sətirinin sağında, dar ekranda wrap ilə yerləşir.

Submit zamanı label və düymə ölçüsü sabit qalır, yanında spinner və busy status görünür. Field xətaları aria-invalid/aria-describedby ilə, təhlükəsiz server xətası form səviyyəsində saxlanır; input dəyərləri itmir. Yumşaq entrance və uğursuz submit-də bir dəfə shake tətbiq olunur; reduced-motion-da hərəkət yoxdur.

### Dashboard kompozisiyası

- Mövcud sticky blur header saxlanıb məzmunla eyni daxili enə gətirilir; brand ölçüsü scroll zamanı font-size animasiyası ilə dəyişmir.
- 44px initials avatar/account trigger kiçik menyu açır. Tooltip hover və focus-da görünür; trigger klik logout etmir. LogOut ikonu və “Çıxış” əməli menyunun içindədir. `aria-expanded`, Enter/Space/Arrow/Escape və fokusun geri qayıtması yoxlanır.
- Scoreboard-da tarix yuxarıda tam enli sətir, altında bərabər QOL/QALAN sütunları və ortada colon olur. Card-da təkrar MATCHDAY və boş üçüncü sütun yoxdur. Semantik `aria-live` və hazır completed/remaining hesabı saxlanır.
- Qol rəqəmi qısa keçidlə dəyişir. Yalnız server tamamlanmanı təsdiqləyəndə maksimum 6–8 aria-hidden confetti/sparkle hissəciyi bir dəfə görünür; geri aktiv etmə/reload celebration yaratmır.
- Həftəlik progress track 10–12px, 0-da aydın kontur və `0 / 20` mətni ilə görünür. Saxta minimum fill yoxdur; transform scaleX, origin-left ilə doğru dəyər göstərilir və aria dəyərləri dəyişmir.
- Mövcud transform əsaslı filtr indicator-u təkmilləşir; ayrıca sabit ölçülü indicator `layoutId` ilə bərabər slotlar arasında hərəkət edir, button label-ları scale olunmur. Hamısı/Meydanda/Qol davranışı saxlanır; state keçidində siyahı yumşaq crossfade/translate alır.
- Yeni/silinən sətirlər keyed enter/exit alır, add/edit formu Enter/Escape və görünən focus-u saxlayır. Empty PitchIcon bir dəfə zəif görünmə effekti alır; sonsuz bounce yoxdur.
- Statik futbol meydanı xətləri maksimum təxminən 3% opacity ilə dekorativ qalır; pointer-events yoxdur, məzmun oxunaqlı opaque səthlər üzərindədir.

### Animasiya spesifikasiyası

| Hadisə | Ölçü və müddət |
|---|---|
| Auth/səhifə görünüşü | opacity + y 8→0, 220ms |
| Form xəta shake | x `[0,-3,3,0]`, 220ms, yalnız bir uğursuz submit üçün bir dəfə |
| Submit spinner | rotate transform, 250ms ease-out dövrü yalnız busy müddətində; reduced-motion-da statik ikon+mətn |
| Qol rəqəmi | opacity + y 6→0, 180–220ms |
| Qısa celebration | transform+opacity, maksimum 6–8 hissəcik, 260–300ms, bir dəfə |
| Progress | scaleX, origin-left, 220ms |
| Filter indicator | İzolə edilmiş `layoutId`, sabit bərabər slotlar, transform-only tween 180–220ms, ease-out |
| Row enter / exit | opacity + y 6→0 180ms / opacity + x 0→-6 160ms |
| İlkin stagger | 30ms, maksimum ilk 4 sətir; enter daxil ümumi maksimum 270ms |
| Empty PitchIcon | opacity + y 3→0, 180–220ms, bir dəfə |
| Hover / tap | y maksimum -1px / scale .98–1.01, 150ms |
| Scroll ilə görünmə | yalnız ikinci dərəcəli hissə, bir dəfə, opacity+y 8→0, 200ms; əsas idarələr əvvəlcədən görünür |
| Skeleton / boş / xəta keçidi | opacity 180–250ms; skeleton statik blokdur, sonsuz shimmer yoxdur |

Bütün motion 150–300ms, `cubic-bezier(.16,1,.3,1)` ease-out, yalnız transform/opacity-dir. Focus görünüşü dərhal tətbiq edilir. Width/height/max-height, font-size, blur, rəng və kölgə animasiyaları yoxdur. Filtr indicator-u üçün `layoutId` sabit bərabər ölçüdə slotlar arasında yalnız transform hərəkəti edir; yazılar scale edilmir. Sətir yeri dəyişərsə `layout="position"` yalnız transform üçün mümkündür; hündürlük interpolasiyası və spring default-u istifadə olunmur. Ümumi `transition: all` qaydası əlavə edilmir.

`MotionConfig reducedMotion="user"`, `useReducedMotion` və CSS media fallback travel/stagger/shake/particles-i söndürür. Busy məlumatı və loading/success/error bütün hallarda əlçatandır. Logout/401 zamanı protected To-Do dərhal unmount olur; `AnimatePresence` wait/exit əvvəlki istifadəçinin məlumatını ekranda saxlamır. Reduced-motion-da skeleton və progress ikon statikdir.

## Alternativlər

Əvvəlki slate/mavi workspace yeni istifadəçi tələbinə uyğun olmadığı üçün geri götürülüb. Mövcud custom CSS-i təmizləmək daha az dependency tələb edər, amma istifadəçi Tailwind/shadcn/Motion təklifini istəyir. Magic UI, Aceternity və React Bits yalnız ilhamdır; paketlərini və dekorativ bloklarını birlikdə quraşdırmaq planlaşdırılmır. Mövcud arxitekturanın yenidən scaffold edilməsi və API refaktorinqi scope xaricindədir.

## Nəticələr və yoxlama

Təsdiqdən sonra əvvəl token/primitivlər, sonra AuthShell/form vəziyyətləri, header/menu, scoreboard/progress, filter/list/add/empty, ən sonda motion və regression/visual QA hazırlanır. Risklər Tailwind Preflight toqquşması, fontface subset sıralaması, React 19 peer uyğunluğu, menu/dialog focus və pending auth baseline-ıdır. Hədəf browser, mobil viewport, 200% zoom, AA kontrast və Azərbaycan glyph-ləri yoxlanacaq. `npm run lint`, `npm run build`, `npm test`, PR və Soprano review olmadan “Bitdi” deyil.

Əlaqəli sənədlər: [araşdırma və rəsmi mənbələr](../research/frontend-redesign.md), [tam qəbul meyarları](../tasks/TASK-UI-001-frontend-redesign.md).

İmza: **Watson**
