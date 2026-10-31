# Frontend redesign araşdırması

- **Status:** Tamamlandı
- **Əlaqəli tapşırıq:** TASK-UI-001
- **Tarix:** 2026-10-31
- **Müəllif:** Watson (Docs)
- **Mərhələ:** Audit və plan; frontend kodu dəyişdirilmir

## Sual

React 19, TypeScript strict və Vite ilə qurulmuş mövcud To-Do tətbiqini API və funksionallığı dəyişmədən hansı dizayn sistemi və animasiya vasitələri ilə yeniləmək olar?

## Mövcud texniki vəziyyət

Audit üçün mənbə `feature/TASK-AUTH-lead-review` branch-indəki frontend-dir. `origin/main` bu branch-dən 7 commit geri qalır; Forgot/Reset və əlavə auth testləri həmin əsas branch-də hələ yoxdur. Redesign zamanı bu funksiyalar qorunmalıdır.

- React/React DOM 19.2, TypeScript ~5.9.3 və Vite ^7.2 mövcuddur; `strict: true` aktivdir.
- `package.json` daxilində UI və animasiya kitabxanası yoxdur. React, React DOM və Barlow Condensed fontu runtime asılılıqlarıdır.
- Tokenlər `src/styles/tokens.css`, ümumi stillər `src/App.css`, authentication stilləri `src/styles/auth.css` fayllarındadır.
- API çağırışları mövcud `src/api/` qatındadır. Bunu yalnız qovluq adı fərqinə görə köçürmək redesign üçün tələb olunmur.
- Root qayda faylı faktiki `agents.md` adlanır və Windows-da `AGENTS.md` yolu ilə oxunur. İstifadəçinin faylı dəyişdirilməyib.
- Qayda faylı Vitest-i standart kimi göstərir, cari `npm test` isə Node test runner + jsdom istifadə edir. Bu sənəd mövcud runner-i Vitest kimi təqdim etmir; dəyişiklik ehtiyacı tətbiq planında ayrıca qiymətləndiriləcək.

## Rəsmi mənbələrdən tapıntılar

### Tailwind CSS

Vite üçün rəsmi inteqrasiya `tailwindcss` və `@tailwindcss/vite` ilə edilir; mövcud Vite layihəsini yenidən yaratmaq lazım deyil. Tailwind-in tema dəyişənləri dizayn tokenlərini mərkəzləşdirməyə uyğundur. V4 müasir browser imkanlarına söykənir; tətbiqdən əvvəl hədəf browser dəstəyi yoxlanmalıdır. Bu mərhələdə paket quraşdırılmayıb.

Mənbələr: [Vite inteqrasiyası](https://tailwindcss.com/docs/installation/using-vite), [uyğunluq](https://tailwindcss.com/docs/compatibility).

### shadcn/ui

Rəsmi təlimat mövcud Vite layihəsi üçün ayrıca quraşdırma yolu verir. Yalnız lazım olan UI komponentlərinin mənbə kodunu layihəyə əlavə etmək mümkündür; böyük hazır tətbiq skeleti yaradılmamalıdır. Rəsmi React 19 səhifəsinin yenilənmə qeydi cari relizdə React 19 və Tailwind v4 dəstəyini təsdiq edir, amma həmin səhifənin köhnə RC tövsiyələri artıq tarixi kontekstdir. Peer dependency problemlərini `--force` ilə örtmək planlaşdırılmır.

Mənbələr: [mövcud Vite layihəsi](https://ui.shadcn.com/docs/installation/vite), [React 19 dəstəyinin yenilənmə qeydi](https://ui.shadcn.com/docs/react-19).

### Motion

Təklif edilən npm paketi `motion`, React import yolu `motion/react`-dır. Deklarativ state keçidləri, hover/tap, stagger və scroll görünməsi üçün istifadə oluna bilər. `MotionConfig reducedMotion="user"` və `useReducedMotion` istifadəçinin azaldılmış hərəkət seçimini nəzərə almağa kömək edir. Motion-un dəstəklədiyi bütün effektləri işlətmək tələb deyil: bu tapşırıqda yalnız transform və opacity, 150–300ms ease-out seçilir.

Mənbələr: [React başlanğıc təlimatı](https://motion.dev/docs/react), [əlçatan animasiyalar](https://motion.dev/docs/react-accessibility).

### Əlçatanlıq

WCAG AA minimumu adi mətn üçün 4.5:1, böyük mətn üçün 3:1-dir. İnteraktiv elementi və vacib vəziyyəti tanıdan qeyri-mətn göstəriciləri üçün qonşu səthə qarşı 3:1 hədəflənir. Bunlar rəng tokeni seçməklə avtomatik təmin olunmur; hover, focus, disabled, error və dark vəziyyətlərdə render edilmiş kombinasiya yoxlanmalıdır.

Mənbələr: [W3C mətn kontrastı](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [qeyri-mətn kontrastı](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## İstinadların istifadə sərhədi

| İstinad | Bu layihə üçün təklif edilən istifadə |
|---|---|
| [Linear](https://linear.app) | Tapşırıq yönümlü iyerarxiya və sakit məhsul interfeysi üçün ilham |
| [Stripe](https://stripe.com) | Başlıq, məzmun və əsas əməl arasında aydın prioritet üçün ilham |
| [Vercel](https://vercel.com) | Təmiz səthlər, nizamlı boşluq və aydın naviqasiya üçün ilham |
| [shadcn/ui](https://ui.shadcn.com) | Seçilmiş button, input, card, dialog, skeleton kimi əsaslar |
| [Motion](https://motion.dev) | Məqsədli vəziyyət və səhifə keçidləri |
| [Magic UI](https://magicui.design) | Mikro-interaksiya nümunələri; ayrıca paket və dekorativ effekt toplusu planlaşdırılmır |
| [Aceternity UI](https://ui.aceternity.com) | Keçid nümunələri; landing-page bloklarını To-Do ekranına köçürmək planlaşdırılmır |
| [React Bits](https://reactbits.dev) | Mikro-interaksiya ilhamı; ağır fon və davamlı hərəkət planlaşdırılmır |
| [Laws of UX](https://lawsofux.com) | Seçimlərin qruplaşdırılması və idrak yükünün azaldılması üçün prinsip |
| [Refactoring UI](https://refactoringui.com) | Tipografiya, səth və boşluq iyerarxiyası üçün istinad; kitab alınmayıb və ödənişli məzmun istifadə edilməyib |

Cədvəldəki vizual istiqamətlər komandanın tövsiyəsidir; məhsulların öz dizayn sisteminin rəsmi təsviri kimi qəbul edilməməlidir. Heç bir saytın maketi və brend elementi kopyalanmır.

## Nəticə / Tövsiyə

İstifadəçinin son göstərişinə uyğun Matchday futbol konsepti, tünd yaşıl səthlər, scoreboard, qol sayı və qısa celebration saxlanır. Əvvəlki slate/mavi istiqamət qəbul edilməyib və qüvvədən düşüb. UI kitabxanası olmadığı üçün Tailwind CSS + seçilmiş shadcn/ui komponentləri + Motion + lucide-react təklif edilir. Bu, hələ qəbul edilmiş qərar deyil. Paketlərin konkret versiyaları tətbiq mərhələsində mövcud React/Vite/Node və lockfile ilə yoxlanacaq. Əlavə animasiya kitabxanası, router və form/state kitabxanası bu audit əsasında tələb olunmur.

Əlaqəli cari qərar təklifi: [0002 — Matchday futbol dizayn sistemi](../decisions/0002-matchday-football-design-system.md). Tarixi, qəbul edilməmiş [0001 təklifi](../decisions/0001-frontend-design-system.md) yeni istifadəçi tələbi ilə əvəz olunub. Audit və qəbul meyarları: [TASK-UI-001](../tasks/TASK-UI-001-frontend-redesign.md).


## Son prompt üzrə dəqiqləşdirmələr

Login centering, sticky blur header, transform əsaslı filter indicator, password düyməsinin type/aria/keyboard dəstəyi və latin-ext font importu artıq mövcuddur. Yeni plan bunları yoxdan yaratmaq kimi təqdim etmir; hizalama/ölçü, menyu, typo, loading və motion davranışını təkmilləşdirir. Scoreboard grid-inin boş sahəsi və təkrar brand, progress-in 0 vəziyyəti, row exit-in olmaması və Ə render riski ayrıca qəbul meyarlarına çevrilib.

Font auditində Jane lokal latin-ext 600 fontunun Ə/ə glyph-lərini əhatə etdiyini təsdiqləyib. `main.tsx` ext subset-i latin subset-dən əvvəl import edir; hər iki CSS eyni family/style/weight və unicode-range olmadan face elan edir. Ona görə “latin-ext əlavə et” təkbaşına düzgün diaqnoz deyil. Təklif Azərbaycan başlıqlarında system-ui, Barlow-da ASCII brand/rəqəmlərdir; real glyph/fallback render testi tələb olunur. [Barlow Condensed rəsmi Fontsource səhifəsi](https://fontsource.org/fonts/barlow-condensed).

Lucide React rəsmi sənədi standalone inline SVG komponentləri, TypeScript tipləri və tree-shaking dəstəyini göstərir. `lucide-react`-dən yalnız lazım olan named ikonlar (Mail, Lock, Eye/EyeOff, LogOut və s.) seçiləcək; icon-only düymənin accessible adı düyməyə verilir, dekorativ ikon aria-hidden olur. [Lucide React](https://lucide.dev/guide/react).

Motion `layoutId` ortaq indicator keçidi üçün nəzərdə tutulub. Bu tətbiqdə yalnız izolə edilmiş, bərabər slot ölçülü filtr indicator-u transform-only tween ilə hərəkət edəcək; label scale, ölçü interpolasiyası və spring default-u yoxdur. Sətirlərdə ehtiyac olarsa yalnız `layout="position"` mümkündür. [Motion layout animasiyaları](https://motion.dev/docs/react-layout-animations).

Tailwind/shadcn semantic tema dəyişənləri mövcud yaşıl tokenləri vahid background/foreground/primary/input/ring kimi xəritələməyə uyğundur; ümumi `transition: all` istifadə etmək tələb deyil. [Tailwind theme](https://tailwindcss.com/docs/theme), [shadcn theming](https://ui.shadcn.com/docs/theming).

Soprano bu mərhələdə repodakı tarixi login/dashboard şəkillərini yoxlayıb. Son promptla yeni image attachment gəlməyib; istifadəçinin yazılı screenshot düzəlişləri agentin yeni screenshot görməsi kimi təqdim edilmir. Protected dashboard canlı login ilə yoxlanmayıb. Bütün tətbiq detalları istifadəçi təsdiqini gözləyən təklifdir.

İmza: **Watson**
