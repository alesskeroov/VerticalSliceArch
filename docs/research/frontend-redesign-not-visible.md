# Redesign görünmür: diaqnostika və düzəliş

- **Status:** Araşdırılır — ilkin səbəb təsdiqlənib, düzəlişin tətbiqi/yekun yoxlaması davam edir
- **Əlaqəli tapşırıq:** TASK-UI-001
- **Tarix:** 2026-10-31
- **Məsul agentlər:** Soprano (diaqnostika/review), Jane (Frontend), Watson (Docs)
- **Qərar:** [0002 — Matchday futbol dizayn sistemi](../decisions/0002-matchday-football-design-system.md)

## İstifadəçinin son göstərişi

Əvvəl 6 bənd üzrə real branch/fayl/server/build vəziyyəti yoxlanmalıdır. Redesign kodu yazılmayıbsa Jane onu öz frontend branch-ində tətbiq etməlidir; ayrı worktree-dədirsə düzgün frontend qovluğu/server istifadə edilməlidir. Silmə, reset və push yoxdur. Soprano kodun yazılmadığını təsdiqləyib; bu şərtli göstəriş implementasiya icazəsidir, yeni təsdiq sualı tələb etmir.

Aşağıdakı ilkin diaqnostika **Jane implementasiyaya başlamazdan əvvəlki** vəziyyəti ayırır. Cari iş irəlilədikcə branch/stat/paketlər dəyişəcək; keçmiş nəticə hazırkı kodun olmaması iddiası kimi oxunmamalıdır.

## 1. Git status, branch, worktree və tarixçə

Soprano `git status --short`, `git branch --show-current`, `git branch -a`, `git worktree list`, `git log --all --oneline -15` əmrlərini işlədib.

İlkin root checkout `feature/TASK-AUTH-lead-review`, HEAD `0ceb86b` idi; yalnız istifadəçinin `agents.md` faylı untracked idi. Frontend redesign branch-i `feature/TASK-UI-001-frontend-redesign`, ayrı `.worktrees/frontend-redesign` qovluğunda `4608d6e` üzərində idi. Docs branch-i `docs/TASK-UI-001-frontend-redesign`, `.worktrees/docs-redesign` qovluğunda `36e33a0` idi. Lokal `main` yoxdur, `origin/main` mövcuddur.

İcazəli tətbiq üçün Soprano root checkout-da ayrıca `feature/TASK-UI-001-lead-review` branch-i açıb; başlanğıc HEAD yenə `0ceb86b`-dir, tam auth baseline saxlanır. İstifadəçinin untracked qayda faylına toxunulmur.

## 2. Redesign hansı qovluqda və hansı commitdə idi?

İlkin yoxlamada **heç bir frontend redesign implementasiyası yox idi**. Jane-in branch/worktree-si yaradılmışdı, amma mənbə kodu dəyişdirilməmişdi. Hazır olanlar Watson-un audit/araşdırma/qərar sənədləri idi; onlar yalnız docs worktree-də idi. Root `frontend/` köhnə Matchday UI-ını göstərirdi.

Buna görə problem yeni dizaynın başqa qovluqda gizlənməsi və ya brauzer cache-i deyil: tətbiq üçün kod hələ yazılmamışdı. Əvvəlki mərhələlər istifadəçi təsdiqi gözləyən plan mərhələləri idi.

İndi Jane eyni frontend branch-ində implementasiyaya başlayıb. Auth funksiyalarını itirməmək üçün əvvəl frontend auth commit-i `7184bff` ayrıca tətbiq edilib; Jane branch-ində qarşılığı `ac85554`-dir. Bu auth baseline bərpasıdır, redesign hazırdır demək deyil. Backend commitləri Jane branch-inə daşınmır.

## 3. Branch diff nəticəsi

İstənən `git diff main..<branch> --stat` lokal `main` olmadığına görə həmin ref ilə işləyə bilmədi. Eyni məqsəd üçün `origin/main` müqayisəsi istifadə edildi.

Diaqnostika başlanğıcında:

| Müqayisə | Nəticə |
|---|---|
| `origin/main..feature/TASK-UI-001-frontend-redesign` | Diff yoxdur; branch `4608d6e` üzərindədir |
| `origin/main..docs/TASK-UI-001-frontend-redesign` | Yalnız 5 docs faylı, 423 əlavə sətr; frontend/backend dəyişməyib |
| Root auth review HEAD | `0ceb86b`; mövcud authentication işi var, redesign yoxdur |

Jane auth baseline commitini aldıqdan sonra frontend branch diff-i artıq auth səhifə/test dəyişikliklərini göstərir; bu ilkin sıfır diff nəticəsini dəyişən yeni iş mərhələsidir. Yekun redesign diff-i implementasiya commitləri gəldikdən sonra ayrıca qeyd olunacaq.

## 4. Dev server qovluğu və port

Soprano read-only CIM proses məlumatını və port bağlantısını yoxlayıb. İlkin frontend listener:

- Ünvan: `http://localhost:5173`, loopback `::1:5173`.
- Vite PID: `30276`.
- Əmr yolu: root `frontend/node_modules/vite/bin/vite.js --host localhost --port 5173 --strictPort`.
- `npm run dev` parent PID: `27520`.
- İşlənən mənbə root `frontend/`-dir, Jane-in `.worktrees/frontend-redesign/frontend/` qovluğu deyil.

Backend `5000` portundakı PID `17524` dəyişdirilməyib. Proses/PID məlumatları həmin yoxlama anına aiddir, daimi deployment identifikatoru deyil.

Düzəliş planı yeni frontend commitlərini review-dan sonra root checkout-a keçirmək, root paketlərini lockfile-a uyğun bərpa etmək və eyni `5173` frontend-in yeni mənbəni yüklədiyini təsdiqləməkdir. Lazım olsa yalnız həmin frontend serveri yenidən başladılacaq; backend servisi dayandırılmayacaq. Bu qeyddə yekun brauzer təsdiqi hələ verilməyib.

## 5. Paket, node_modules, CSS və Tailwind inteqrasiyası

İlkin root `frontend/package.json` və `node_modules` daxilində `motion`, `tailwindcss`, `@tailwindcss/vite`, `lucide-react` yoxdur. `main.tsx` köhnə Barlow fontları və `styles/auth.css` import edir, App isə `App.css` istifadə edir. `vite.config.ts` yalnız React plugin qeyd edir. Tailwind inteqrasiyası və redesign komponentləri yox idi.

Bu faktlar “paket quraşdırılıb, amma CSS yanlış import olunur” diaqnozunu təsdiqləmir: ilkin mərhələdə paket və setup özü edilməmişdi. Qəbul edilmiş stack Jane tərəfindən indi tətbiq olunur: Tailwind + seçilmiş shadcn/ui + Motion (`motion/react`) + Lucide named ikonları.

Tailwind v4 planında Vite plugin, CSS importu və source aşkarlanması yoxlanacaq. Köhnə `tailwind.config.js content` massivinin olmaması v4 üçün öz-özlüyündə xəta deyil; aktiv tətbiqin faktiki plugin/CSS/source quruluşu və production build nəticəsi əsas götürüləcək. Köhnə və yeni CSS-in toqquşması, font Ə/ə və reduced-motion ayrıca yoxlanacaq.

## 6. Build və runtime xəta yoxlaması

İlkin root `npm run build` uğurla tamamlanıb; Soprano xəta/xəbərdarlıq olmadığını qeyd edib. Bu yalnız köhnə baseline-ın build olunduğunu göstərir, redesign kodunun mövcudluğunu sübut etmir. İlkin diaqnostika anında browser console yoxlaması hələ edilməmişdi. Sonrakı baseline yoxlamada Soprano IAB ilə `http://localhost:5173` login ekranını və error/warn loglarını yoxlayıb: köhnə Göstər mətni və qısa password input görünür, həmin login load üçün log siyahısı boşdur (`[]`). Bu yalnız köhnə login baseline-ının console nəticəsidir; protected dashboard və yeni UI üçün yoxlama deyil.

Əvvəlki audit baseline yoxlamaları `npm run lint` və `npm run build` exit 0, `npm test` 12/12 idi. Sonrakı “test etmə” göstərişi səbəbindən yeni kod üçün əlavə final lint/build/test və browser verifikasiyası aparılmayacaq. Əvvəlki baseline nəticələri yeni dizaynın yoxlandığına dəlil deyil.

## Səbəb və icazəli düzəliş

**Səbəb:** əvvəlki mərhələdə yalnız plan/docs hazırlanmışdı, root frontend-ə redesign mənbə kodu və asılılıqları tətbiq edilməmişdi. Hard refresh bu vəziyyəti dəyişmir.

**Düzəliş:** Jane eyni frontend branch-ində qəbul edilmiş futbol dizaynını implementasiya edir. Soprano yalnız frontend dəyişikliklərini review branch-ə keçirir, paketləri bərpa edir və root `frontend`-dən təqdim edilən `5173` UI-ını yoxlayır. Watson-un ilkin docs commitləri Soprano review-dan sonra root review branch-ə `af33342`, `0319683`, `c290d3e` commitləri kimi daxil edilib; plan və diaqnostika artıq root `docs/` altında mövcuddur. Yekun nəticə əlavələri ayrıca keçiriləcək. Mövcud auth, root `docs/06-authentication.md` və backend qorunur.

## Son istifadəçi göstərişi və yekun yoxlama sərhədi

İstifadəçi “test etmə” deyib. Bu göstərişdən sonra əlavə lint/build/test və browser verifikasiyası dayandırılır; implementasiya, paketlərin bərpası və zəruri frontend server açılışı davam edir. Normal “Bitdi” test meyarına açıq istifadəçi istisnası qeydə alınır. Root source/commit/package/server faktları qeyd ediləcək, amma yeni UI işləkliyinin yoxlandığı iddia olunmayacaq.

## Yekun nəticələr — inteqrasiya faktları gözlənilir

- [ ] Redesign mənbə kodu Jane branch-ində commit edilib və Soprano review edib.
- [ ] Yalnız frontend + əlaqəli docs dəyişiklikləri root review branch-ə daxil edilib.
- [ ] Yeni paketlər, Tailwind plugin/CSS/source və Motion/Lucide importları root frontend-də yoxlanıb.
- [ ] Yekun lint/build/test: **aparılmır — istifadəçinin “test etmə” göstərişi**; redesign üçün uğurlu test nəticəsi iddiası yoxdur.
- [ ] Root `localhost:5173` serverinin yeni mənbə ilə işə salınması qeyd edilib; yeni login/dashboard və console/browser verifikasiyası istifadəçi göstərişi ilə aparılmır.
- [ ] Backend/API/auth axınları qorunub, no-delete/no-reset/no-push tələbi saxlanıb.

PR hələ açılmayıb və push edilməyib. Bu mərhələdə tapşırıq “Tamamlandı” deyil; tətbiq və verifikasiya davam edir.

İmza: **Watson**
