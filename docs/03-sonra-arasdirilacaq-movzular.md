# Sonra öyrəniləcək mövzular

## Bu sənəd nə üçündür?

Bu siyahı işləyən demodan daha etibarlı real tətbiqə keçid üçündür. Göstərilən imkanların hamısı hazırkı kodda yoxdur.

| Mövzu və prioritet | Nədir və niyə öyrənmək lazımdır? | Axtarış sözləri |
| --- | --- | --- |
| Testlər — Yüksək | Unit test kiçik məntiqi, integration test hissələrin birlikdə işləməsini yoxlayır. Hazırda CI build edir; HTTP faylı avtomatik test deyil. | xUnit, WebApplicationFactory, SQL Server integration testing |
| Validation — Yüksək | Giriş məlumatını yoxlayır. Hazırda başlıq, email, minimum parol və ad qaydaları var; böyük layihədə qaydaları ayrıca saxlamaq olar. | FluentValidation manual validation, ProblemDetails |
| Migration və baza icazələri — Yüksək | Migration sxem dəyişikliyinin tarixçəsidir. Code First var; ehtiyat nüsxə, geri qaytarma və ayrıca yayım addımı sonrakı mövzudur. | EF Core migrations deployment, SQL Server permissions |
| Dayanıqlı Hangfire storage — Yüksək | Job növbəsini tətbiqdən kənarda saxlayır. InMemory restartda itir; todo bazasının SQL olması bunu həll etmir. | Hangfire SQL Server storage |
| Retry və idempotentlik — Yüksək | Retry uğursuz işi yenidən sınayır; idempotent iş təkrar icrada əlavə nəticə yaratmır. Standart retry var, bildirişin təkrarını önləyən qeyd yoxdur. | Hangfire retries, idempotent jobs, outbox pattern |
| Təhlükəsizlik — Yüksək | Authentication kimliyi, authorization icazəni yoxlayır. Əsas JWT girişi və istifadəçi izolyasiyası tamamlanıb. Dashboard hələ Development-lə məhduddur; Admin qoruması ayrıca mövzudur. | ASP.NET Core authentication, Hangfire dashboard authorization |
| Xəta idarəsi və loglar — Yüksək | Mərkəzi xəta cavabı və axtarıla bilən hadisə qeydləridir. Hazırda sadə 400/404 və konsol bildirişləri var. | IExceptionHandler, ProblemDetails, ILogger |
| Paralel işləmə — Yüksək | Eyni məlumata eyni vaxtda dəyişikliklər edilə bilər. DbContext scoped-dur, amma iki istifadəçinin eyni todo-nu redaktə etməsi üçün xüsusi münaqişə yoxlaması yoxdur. | EF Core optimistic concurrency, rowversion, DbContext thread safety |
| MediatR pipeline — Orta | Handler-dən əvvəl və sonra ortaq addımlar işlədir. Hazırda birbaşa çağırış başlanğıc üçün daha sadədir. | MediatR IPipelineBehavior |
| Delayed və Continuation job — Aşağı | Gələcək vaxt üçün iş və başqa işdən sonra davam edən işdir. Hazırda yalnız fire-and-forget və recurring istifadə olunur. | Hangfire Schedule, ContinueJobWith |
| Frontend server vəziyyəti — Orta | Server dəyişiklikləri ilə brauzeri sinxronlaşdırır. Hazırda cleanup-dan sonra səhifəni yeniləmək lazımdır. | React data fetching, polling, request cancellation |
| Refresh token — Yüksək | Qısaömürlü giriş tokenini yeniləyən ayrıca etimad məlumatıdır. Hazırda 60 dəqiqədən sonra yenidən giriş lazımdır. | JWT refresh token rotation, revocation |
| httpOnly cookie — Yüksək | JavaScript-in oxuya bilmədiyi brauzer saxlayıcısıdır. localStorage XSS riskini azalda bilmir; cookie seçiləndə CSRF də öyrənilməlidir. | httpOnly Secure SameSite cookie, CSRF |
| Rollar — Orta | User/Admin kimi icazə qruplarıdır. Hazırda yalnız sahiblik var, rol claim-i yoxdur. | ASP.NET Core role policy authorization |
| Email təsdiqi — Orta | Hesabın email sahibinə aidliyini təsdiqləyir. Hazırda emailə məktub göndərilmir. | email confirmation tokens |
| Parolu unutdum — Yüksək | Məhdudömürlü, birdəfəlik tokenlə parolu yeniləyir. Sadə giriş demosunda yoxdur. | password reset token security |
| Rate limiting — Yüksək | Giriş və qeydiyyat cəhdlərini məhdudlaşdırır. Hazırda avtomatik parol sınamalarına qarşı limit yoxdur. | ASP.NET Core rate limiting login brute force |
| Dashboard Admin qoruması — Yüksək | İdarəetmə səhifəsini yalnız icazəli rola açır. API JWT-si dashboard-u avtomatik qorumur. | Hangfire dashboard authorization Admin |

**Tamamlandı:** sadə JWT girişi, PBKDF2 hash, serverdə sahiblik yoxlaması və frontend-də 401/çıxış axını.

## Mövcud kodla əlaqə

`backend/src/TodoApi/Common/AppDbContext.cs` real SQL bazasına çıxış verir; əvvəlki FakeDatabase yalnız arxivdədir. Burada List üçün lock əlavə etməklə baza münaqişələri həll olunmur.
`backend/src/TodoApi/Features/Todos/CreateTodo/CreateTodo.cs` daxilində SaveChanges və Enqueue ayrıdır. Outbox modeli sonradan bu əlaqənin etibarlılığı üçün öyrənilə bilər.
`backend/src/TodoApi/Features/Jobs/CleanupCompletedTodos/CleanupCompletedTodos.cs` silməni bazada edir; təkrar icrada artıq silinmiş sətirlər yenidən silinmir.

## Öyrənmə yol xəritəsi

1. Mövcud CRUD axınını anlayın; validation və xəta cavablarını yoxlayın.
2. Unit və integration testlər əlavə edin.
3. Code First migration-ları, SQL icazələrini və paralel dəyişiklikləri öyrənin.
4. Dayanıqlı job storage, retry, idempotentlik və outbox mövzusuna keçin.
5. Mövcud JWT axınından sonra refresh token, httpOnly cookie, rate limiting və parol bərpasını öyrənin.
6. Real yayımdan əvvəl rollar, email təsdiqi, dashboard Admin qoruması və logları tamamlayın.
7. Sonra frontend sinxronlaşması, MediatR və əlavə job növlərini araşdırın.
