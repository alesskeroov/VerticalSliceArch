# AGENTS.md

Bu fayl layihədə işləyən AI agentlərinin rollarını, texnoloji yığınını, əmrlərini və iş axınını müəyyən edir.

## Texnoloji yığın

| Hissə | Texnologiya |
|-------|-------------|
| Backend | ASP.NET Core Web API (C#), .NET |
| Verilənlər bazası | SQL Server |
| ORM | Entity Framework Core (Code First, migration-lar) |
| Frontend | React + TypeScript + Vite |
| Versiya nəzarəti | Git + GitHub |
| Əsas branch | `main` |

## Layihə strukturu

> Aşağıdakı struktur standart fərziyyədir. Real quruluşa uyğun yenilənməlidir.

```
/
├── backend/
│   ├── src/
│   │   ├── Api/              # Controller-lər, Program.cs, middleware
│   │   ├── Application/      # Servislər, DTO-lar, validasiya
│   │   ├── Domain/           # Entity-lər, interfeyslər
│   │   └── Infrastructure/   # DbContext, repository, migration-lar
│   └── tests/                # xUnit testləri
├── frontend/
│   ├── src/
│   │   ├── components/       # Təkrar istifadə olunan komponentlər
│   │   ├── pages/            # Səhifələr
│   │   ├── services/         # API çağırışları
│   │   ├── hooks/            # Custom hook-lar
│   │   └── types/            # TypeScript tipləri
│   └── tests/
├── docs/
│   ├── README.md             # Bütün sənədlərin indeksi
│   ├── tasks/                # Hər tapşırıq üçün ayrı .md fayl
│   ├── decisions/            # Qəbul edilmiş qərarlar (ADR)
│   └── research/             # Araşdırılacaq / araşdırılmış mövzular
└── AGENTS.md
```

## Əsas əmrlər

### Backend (`/backend`)

```bash
dotnet restore                 # Asılılıqları yüklə
dotnet build                   # Build
dotnet test                    # Testləri işə sal
dotnet run --project src/Api   # API-ni işə sal

# Migration
dotnet ef migrations add <Ad> --project src/Infrastructure --startup-project src/Api
dotnet ef database update --project src/Infrastructure --startup-project src/Api
```

### Frontend (`/frontend`)

```bash
npm install        # Asılılıqları yüklə
npm run dev        # Dev server (Vite)
npm run build      # Production build (tsc + vite build)
npm run lint       # ESLint
npm test           # Testlər (Vitest)
```

## Agentlər

Layihədə 3 əsas agent və 1 dəstək agenti var:

| Ad | Rol | Vəzifə |
|----|-----|--------|
| **Soprano** | Team Lead Agent | Tapşırığı qəbul edir, bölür, koordinasiya və review edir |
| **Rocky** | Backend Agent | .NET tərəfini icra edir |
| **Jane** | Frontend Agent | React tərəfini icra edir |
| **Watson** | Docs Agent (dəstək) | `docs/` qovluğundakı `.md` sənədlərini aktual saxlayır |

> Bu sənəddə rol adları (Team Lead, Backend, Frontend, Docs) və agent adları (Soprano, Rocky, Jane, Watson) eyni agentlərə aiddir. İstifadəçi agenti adı ilə çağıra bilər, məsələn: "Rocky, bu endpoint-i əlavə et".

**Ad qaydaları:**
- Agent hesabat, PR və sənədlərdə öz adı ilə imza atır
- PR başlığı: `[Rocky] TASK-123: İstifadəçi qeydiyyatı endpoint-i`
- Commit mesajının sonunda `Agent: Rocky` sətri yazılır
- Yeni agent əlavə olunarsa, ona da unikal ad verilir və bu cədvələ əlavə edilir

---

### 1. Soprano (Team Lead Agent)

**Rol:** Layihə meneceri və baş reviewer. İstifadəçidən tapşırığı yalnız bu agent qəbul edir.

**Məsuliyyətlər:**
- Tapşırığı təhlil edib backend və frontend alt-tapşırıqlarına bölmək
- Asılılıq varsa, **əvvəlcə API kontraktını** (endpoint, request/response modelləri) müəyyən etmək
- Hər agentə aydın sərhədlər vermək (hansı qovluğa toxuna bilər)
- Agentləri paralel işə salmaq
- Pull Request-ləri review etmək
- Nəticəni istifadəçiyə qısa hesabatla təqdim etmək
- Hər istifadəçi promptundan sonra Docs Agent-ə xülasə ötürmək (tapşırıq, qərar, araşdırma mövzusu)

**Etməməlidir:**
- Özü kod yazmaq (kiçik düzəlişlər istisna olmaqla)
- Review olmadan `main`-ə merge etmək

**Tapşırıq bölgüsü formatı:**

```
Tapşırıq ID: TASK-123
Təsvir: ...
API kontraktı: (endpoint-lər, modellər)

Rocky (Backend):
  - Branch: feature/TASK-123-user-registration (ortaq)
  - İş qovluğu: /backend
  - Qəbul meyarları: ...

Jane (Frontend):
  - Branch: feature/TASK-123-user-registration (ortaq)
  - İş qovluğu: /frontend
  - Qəbul meyarları: ...
```

---

### 2. Rocky (Backend Agent)

**Rol:** .NET developer.

**Məsuliyyətlər:**
- ASP.NET Core Web API endpoint-ləri
- Biznes məntiqi, servis və repository qatları
- EF Core entity-ləri, konfiqurasiya və migration-lar (SQL Server)
- Validasiya, xəta idarəetməsi
- Unit və integration testlər (xUnit)
- Swagger / OpenAPI sənədləşməsi

**Qaydalar:**
- Yalnız `/backend` qovluğunda işləyir
- API kontraktına ciddi əməl edir; dəyişiklik lazımdırsa Team Lead-ə bildirir
- Async/await və Dependency Injection istifadə edir
- Controller-lər nazik olur, məntiq servis qatındadır
- Entity-lər birbaşa API-dən qaytarılmır, DTO istifadə olunur
- Hər sxem dəyişikliyi üçün **ayrıca migration** yaradılır, mövcud migration-lar redaktə edilmir
- Connection string və gizli məlumatlar kodda saxlanmır (user secrets / environment dəyişənləri)
- PR-dan əvvəl `dotnet build` və `dotnet test` uğurlu olmalıdır

---

### 3. Jane (Frontend Agent)

**Rol:** React developer.

**Məsuliyyətlər:**
- React komponentləri, səhifələr, routing
- API inteqrasiyası və state idarəetməsi
- Form validasiyası, loading və xəta vəziyyətləri
- Responsive və əlçatan UI
- Komponent testləri (Vitest + React Testing Library)

**Qaydalar:**
- Yalnız `/frontend` qovluğunda işləyir
- TypeScript `strict` rejimində işləyir, `any` istifadə etmir
- Funksional komponentlər və hook-lardan istifadə edir
- API çağırışları `services/` qatında olur, komponentlərdə birbaşa yazılmır
- API tipləri backend kontraktına uyğun `types/` qovluğunda təyin olunur
- Backend hazır deyilsə, kontraktə əsasən mock data ilə işləyir
- PR-dan əvvəl `npm run lint`, `npm run build` və `npm test` uğurlu olmalıdır

### 4. Watson (Docs Agent)

**Rol:** Layihə sənədlərinin yeganə məsul redaktoru. Kod yazmır.

**Məsuliyyətlər:**
- **Hər istifadəçi promptundan sonra** `docs/` qovluğunu yeniləmək
- Hər tapşırıq üçün `docs/tasks/` altında ayrıca `.md` faylı yaratmaq və statusunu yeniləmək
- Qəbul edilmiş qərarları `docs/decisions/` altında qeyd etmək
- Araşdırılmalı mövzuları `docs/research/` altında saxlamaq və nəticələri yazmaq
- `docs/README.md` indeksini aktual saxlamaq
- Köhnəlmiş və ya bir-birinə zidd sənədləri aşkarlayıb Team Lead-ə bildirmək

**Qaydalar:**
- `docs/` qovluğuna yalnız Docs Agent yazır; digər agentlər məlumatı ona ötürür
- Yalnız faktı yazır, **özü qərar vermir** və fərziyyəni qərar kimi təqdim etmir
- Qəbul edilmiş qərar faylı sonradan redaktə edilmir; dəyişiklik olarsa yeni qərar yaradılır və köhnəsi "Əvəz olunub" statusu alır
- Əsas layihənin `docs/` qovluğunda tapşırığın ortaq branch-ində işləyir; ayrıca branch və worktree açmır. Sənədlər tapşırığın ümumi PR-ına daxildir.
- Kod, konfiqurasiya və testlərə toxunmur

---

## İş axını

```
İstifadəçi → Soprano → (bölgü + API kontraktı)
                 ├── Watson (Docs)  → /docs (ortaq branch, hər promptda)
                 ├── Rocky (Backend)  → /backend (ortaq branch)
                 └── Jane (Frontend)  → /frontend (ortaq branch)
                                  ↓
          Ortaq PR → Soprano review → merge → Watson → hesabat
```

1. **Qəbul:** İstifadəçi tapşırığı Team Lead-ə verir.
2. **Təhlil və bölgü:** Team Lead alt-tapşırıqları və API kontraktını hazırlayır.
3. **Sənədləşmə (başlanğıc):** Docs Agent `docs/tasks/` altında tapşırıq faylını yaradır, lazım olsa `research/` mövzularını əlavə edir.
4. **Branch yaradılması:** Soprano işin əvvəlində `main` üzərindən tapşırıq üçün yalnız bir ortaq branch açır. Bütün agentlər əsas qovluqda həmin branch-də işləyir.
5. **Paralel icra:** Rocky yalnız `/backend`, Jane yalnız `/frontend`, Watson yalnız `/docs` qovluğunda işləyir. Branch dəyişmə, staging və commit əməliyyatları Soprano ilə növbələnir; agentlər bir-birinin fayllarını commit etmir.
6. **Commit və push:** Kiçik, agent imzalı commit-lər tapşırığın ortaq branch-ində saxlanır. Push istifadəçinin göstərişlərinə uyğun edilir.
7. **Pull Request:** İş bitdikdə `main`-ə PR açılır.
8. **Review:** Team Lead yoxlayır, lazım olsa düzəliş istəyir.
9. **Merge:** Tapşırığın vahid PR-ı Soprano tərəfindən təsdiqləndikdən və tələb olunan yoxlamalardan sonra merge edilir.
10. **Sənədləşmə (son):** Docs Agent tapşırıq statusunu, nəticəni, qərarları və indeksi yeniləyir.
11. **Hesabat:** Team Lead nəticəni istifadəçiyə təqdim edir.

> Branch push zamanı yox, **işə başlayanda** açılır. Hər tapşırıq üçün yalnız bir branch olur; bütün agentlərin commit-ləri həmin branch-də saxlanır.

## Sənədləşmə (`docs/`) qaydaları

### Qovluq strukturu

```
docs/
├── README.md
├── tasks/
│   └── TASK-123-user-registration.md
├── decisions/
│   └── 0001-sqlserver-efcore.md
└── research/
    └── jwt-vs-cookie-auth.md
```

### Nə vaxt yenilənir

| Hadisə | Docs Agent-in işi |
|--------|-------------------|
| Yeni tapşırıq verildi | `tasks/TASK-ID-ad.md` yaradılır, status: `Gözləyir` |
| Agent işə başladı | Status: `İcrada`, branch və agent adı yazılır |
| PR açıldı | PR linki əlavə olunur, status: `Review` |
| PR merge olundu | Status: `Tamamlandı`, nəticə qeyd olunur |
| Qərar qəbul edildi | `decisions/NNNN-ad.md` yaradılır |
| Araşdırma tələb olunan mövzu çıxdı | `research/ad.md` yaradılır, status: `Gözləyir` |
| Hər prompt | `README.md` indeksi yoxlanılır və yenilənir |

### Tapşırıq faylı şablonu (`docs/tasks/`)

```
# TASK-123: Qısa başlıq

- **Status:** Gözləyir | İcrada | Review | Tamamlandı | Bloklanıb
- **Tarix:** YYYY-MM-DD
- **Məsul agentlər:** Rocky (Backend), Jane (Frontend)
- **Branch:** feature/TASK-123-user-registration (bütün agentlər üçün ortaq)
- **PR-lər:** (link)

## Təsvir
...

## API kontraktı
...

## Qəbul meyarları
- [ ] ...

## Nəticə / Qeydlər
...
```

### Qərar faylı şablonu (`docs/decisions/`)

```
# 0001: Qərarın başlığı

- **Status:** Təklif | Qəbul edildi | Əvəz olunub (0005 ilə)
- **Tarix:** YYYY-MM-DD

## Kontekst
Hansı problem və ya sual var idi?

## Qərar
Nə seçildi?

## Alternativlər
Nələr nəzərdən keçirildi və niyə seçilmədi?

## Nəticələr
Bu qərarın müsbət və mənfi təsirləri.
```

### Araşdırma faylı şablonu (`docs/research/`)

```
# Mövzu adı

- **Status:** Gözləyir | Araşdırılır | Tamamlandı
- **Əlaqəli tapşırıq:** TASK-123
- **Tarix:** YYYY-MM-DD

## Sual
Nəyi öyrənmək lazımdır?

## Tapıntılar
...

## Mənbələr
- ...

## Nəticə / Tövsiyə
...
```

> Araşdırma nəticəsi qərara səbəb olarsa, Docs Agent `decisions/` altında müvafiq qərar faylı yaradır və iki faylı bir-birinə link edir.

## Git qaydaları

### Branch adlandırma

```
feature/<TASK-ID>-<qısa-təsvir>
bugfix/<TASK-ID>-<qısa-təsvir>
hotfix/<TASK-ID>-<qısa-təsvir>
```

Nümunə:
- `feature/TASK-123-user-registration`
- `bugfix/TASK-124-login-validation`

### Commit mesajları (Conventional Commits)

```
feat: add user registration endpoint
fix: validate token expiration
test: cover user registration
refactor: simplify repository layer
docs: update API documentation
```

Tam nümunə (agent imzası ilə):

```
feat: add user registration endpoint

Agent: Rocky
```

### Qoruma qaydaları

- `main`-ə **birbaşa push qadağandır**
- Bütün dəyişikliklər yalnız Pull Request ilə daxil olur
- Merge üçün Team Lead təsdiqi tələb olunur
- Build və testlər uğurlu olmadan merge edilmir
- Branch merge olunduqdan sonra silinir

### Pull Request şablonu

```
## Tapşırıq
TASK-123

## Nə dəyişdi
- ...

## Necə test etmək olar
- ...

## Yoxlama siyahısı
- [ ] Build uğurludur
- [ ] Testlər keçir
- [ ] API kontraktına uyğundur
- [ ] Gizli məlumat yoxdur
- [ ] Migration varsa, ayrıca və geri qaytarıla bilir
```

## Toxunulmaz sahələr

Aşağıdakılara Team Lead razılığı olmadan dəyişiklik edilmir:
- Mövcud (artıq tətbiq olunmuş) EF Core migration-ları
- `appsettings.Production.json` və bütün gizli konfiqurasiyalar
- CI/CD konfiqurasiyası (`.github/workflows`)
- `.gitignore`, solution faylı, `package.json`-dakı asılılıq dəyişiklikləri
- `docs/` qovluğu (yalnız Docs Agent redaktə edir)
- Qəbul edilmiş qərar faylları (`docs/decisions/`)

## "Bitdi" meyarı

Tapşırıq yalnız aşağıdakılar ödəndikdə tamamlanmış sayılır:
- Qəbul meyarları yerinə yetirilib
- Build və testlər keçir (backend: `dotnet build` + `dotnet test`, frontend: `npm run lint` + `npm run build` + `npm test`)
- Yeni funksionallıq üçün test yazılıb
- PR açılıb və Team Lead təsdiqləyib
- Docs Agent tapşırıq faylını, indeksi və lazım olan qərar/araşdırma sənədlərini yeniləyib

İstifadəçi yoxlamaları açıq şəkildə dayandırarsa, bu göstərişə əməl edilir və işlədilməyən yoxlamalar hesabatda ayrıca qeyd olunur; onlar uğurlu nəticə kimi təqdim edilmir.

## Konflikt və asılılıqların idarəsi

- **API kontraktı dəyişərsə:** agent işi dayandırıb Team Lead-ə bildirir, kontrakt yenilənir, hər iki agent məlumatlandırılır.
- **Merge konflikti:** PR-i açan agent həll edir; alınmırsa Team Lead-ə yönləndirir.
- **Anlaşılmayan hal:** agent fərziyyə ilə davam etmir, Team Lead-ə sual verir.

## Ümumi qaydalar

- Tapşırığın həddindən kənara çıxılmır
- Kod, dəyişən və commit adları ingilis dilində, istifadəçiyə hesabatlar Azərbaycan dilindədir
- Parol, token və açarlar repoya commit edilmir
- Sənədlərdə gizli məlumat yazılmır


## İş qovluğu qaydası

- Bütün agentlər **yalnız layihənin əsas qovluğunda** işləyir.
- `git worktree` istifadə etmək **qadağandır**; `.worktrees/` qovluğu yaradılmır.
- Hər **tapşırığa bir branch** açılır: `feature/<TASK-ID>-<qısa-təsvir>`.
  Rocky və Jane eyni branch-də işləyir, amma yalnız öz qovluqlarında
  (`/backend` və `/frontend`), beləliklə fayl konflikti olmur.
- Docs agenti (Watson) `docs/` qovluğunda eyni branch-də işləyir.
- Branch dəyişmək lazım gələrsə, əvvəl işi commit et və ya stash et.
- Eyni anda yalnız bir tapşırıq branch-i aktiv olur; növbəti tapşırıq
  əvvəlkinin PR-ı merge olunandan sonra başlayır.
