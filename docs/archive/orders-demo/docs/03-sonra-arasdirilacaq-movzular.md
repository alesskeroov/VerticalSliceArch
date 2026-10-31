# Sonra araşdırılacaq mövzular

## Bu sənəd nə üçündür?

Bu siyahı demodan real tətbiqə keçərkən hansı mövzuları öyrənəcəyinizi göstərir. Buradakı əlavələr hazırkı layihədə tətbiq olunmuş xüsusiyyətlər deyil.

## 1. Real verilənlər bazası — Yüksək

**Nədir:** EF Core C# obyektlərini verilənlər bazasına yazmağa və oxumağa kömək edir. SQL Server və PostgreSQL məlumatı tətbiqdən kənarda saxlayan baza sistemləridir.

**Niyə:** `VerticalSliceArch/Common/FakeDatabase.cs` tətbiq dayandıqda sifarişləri itirir. Baza və cədvəl qurulmasını öyrətməmək üçün demoda siyahı seçilib.

**Açar sözlər:** `EF Core getting started`, `DbContext`, `migrations`, `SQL Server PostgreSQL ASP.NET Core`.

## 2. Hangfire üçün real storage — Yüksək

**Nədir:** Storage job-un parametrlərini, vəziyyətini və planını saxlayan yerdir. Dayanıqlı storage bu məlumatları tətbiq bağlandıqdan sonra da qoruyur.

**Niyə:** `VerticalSliceArch/Program.cs` daxilindəki `UseInMemoryStorage()` restart zamanı job məlumatlarını itirir. Sifariş bazası və job storage ayrı məsələlərdir; hər ikisi ayrıca həll edilməlidir.

**Açar sözlər:** `Hangfire SQL Server storage`, `Hangfire PostgreSQL storage`, `persistent jobs`.

## 3. Retry və idempotent job — Yüksək

**Nədir:** Retry uğursuz işi yenidən sınamaqdır. İdempotent iş təkrar icra olunsa da əlavə zərərli nəticə yaratmır; məsələn, eyni təsdiq emailini təkrar göndərmir.

**Niyə:** Demoda xüsusi retry ayarı yoxdur, Hangfire-in standart davranışı qalır. `SendOrderConfirmation.Handler` hər icrada konsola yenidən yaza bilər; təkrar icranı aşkarlayan qeyd yoxdur.

**Açar sözlər:** `Hangfire automatic retries`, `idempotent background jobs`, `duplicate email prevention`, `outbox pattern`.

## 4. Validation və FluentValidation — Yüksək

**Nədir:** Validation daxil olan məlumatın qaydalara uyğunluğunun yoxlanmasıdır. FluentValidation bu qaydaları ayrıca yazmağa imkan verən kitabxanadır.

**Niyə:** `VerticalSliceArch/Features/Orders/CreateOrder/CreateOrder.cs` yalnız boş email və məhsul adını yoxlayır. Email formatı və uzunluq qaydaları yoxdur; əlavə kitabxana sayını azaltmaq məqsədi seçilib.

**Açar sözlər:** `ASP.NET Core validation`, `FluentValidation manual validation`, `validation error response`.

## 5. Xətaların idarəsi və logging — Yüksək

**Nədir:** Xəta idarəsi gözlənilməz vəziyyəti uyğun cavaba çevirir. Logging baş verən hadisələri sonradan araşdırmaq üçün qeyd etməkdir.

**Niyə vacibdir:** Demoda job nəticələri `Console.WriteLine` ilə yazılır; çərçivənin standart logları da var. Xüsusi mərkəzi xəta idarəsi yoxdur. Sifariş əlavə edildikdən sonra Enqueue uğursuz olsa, sifariş artıq siyahıda qalır: iki əməliyyat vahid bütöv əməliyyat kimi qorunmur.

**Açar sözlər:** `ASP.NET Core exception handler`, `ProblemDetails`, `ILogger structured logging`, `transactional outbox`.

## 6. Dashboard təhlükəsizliyi — Yüksək

**Nədir:** Authentication istifadəçinin kimliyini, authorization isə nəyə icazəsi olduğunu yoxlayır.

**Niyə:** Program.cs xüsusi dashboard giriş nəzarəti qurmur. Standart yerli sorğu məhdudiyyətini bütün real yerləşdirmələr üçün yetərli həll saymaq olmaz; dashboard idarəetmə imkanları verir.

**Açar sözlər:** `Hangfire dashboard authorization`, `ASP.NET Core authentication roles`.

## 7. Thread-safety və FakeDatabase — Yüksək

**Nədir:** Thread-safety bir neçə icra axınının eyni məlumatla təhlükəsiz işləməsidir. `lock` bir anda yalnız bir axının qorunan bloka girməsini təmin edir.

**Niyə:** FakeDatabase artıq `Add`, `GetAll` və `Find` metodlarında eyni kilidi istifadə edir. `GetAll` siyahının nüsxəsini qaytarır, obyektlərin dərin surətini yaratmır; hazırkı Order xassələri `init` ilə təyin olunur. Kilid yalnız bu prosesdə işləyir və sifariş yaratma ilə Enqueue əməliyyatını birlikdə qorumur.

**Açar sözlər:** `C# lock thread safety`, `List concurrent access`, `shallow copy`, `atomic operations`.

## 8. Unit və integration testlər — Yüksək

**Nədir:** Unit test kiçik məntiq parçasını ayrıca yoxlayır. Integration test HTTP, DI və digər hissələrin birlikdə işləməsini yoxlayır.

**Niyə:** Layihədə avtomatik test layihəsi yoxdur. `VerticalSliceArch/requests.http` əl ilə yoxlama üçündür; təkcə sorğu göndərmək nəticənin avtomatik yoxlanması demək deyil.

**Açar sözlər:** `xUnit ASP.NET Core`, `WebApplicationFactory Minimal API`, `Hangfire IBackgroundJobClient testing`.

## 9. MediatR və pipeline behavior — Orta

**Nədir:** MediatR sorğunu handler-ə yönləndirir. Pipeline behavior handler-dən əvvəl və sonra işləyən ortaq addımdır; məsələn, yoxlama və loglama.

**Niyə:** Demoda endpoint handler-i birbaşa çağırır. Əvvəl bu əlaqəni başa düşmək, sonra çoxlu feature üçün ortaq qaydaları araşdırmaq daha rahatdır.

**Açar sözlər:** `MediatR request handler`, `IPipelineBehavior`, `validation logging pipeline`.

## 10. Delayed və Continuation job-lar — Aşağı

**Nədir:** Delayed job gələcək vaxt üçün planlanan işdir. Continuation başqa işdən sonra işə salınan davam işidir.

**Niyə:** Demoda yalnız dərhal növbəyə qoyulan və təkrarlanan iş var. Email handler-indəki `Task.Delay(2000)` delayed job deyil: iş artıq başlayıb və onun daxilində gözləyir.

**Açar sözlər:** `Hangfire BackgroundJob.Schedule`, `Hangfire ContinueJobWith`, `delayed background jobs`.

## Öyrənmə yol xəritəsi

1. Mövcud POST/GET yolunu oxuyun; validation və xəta cavablarını öyrənin.
2. Unit və integration testlərlə gözlənilən davranışı qeyd edin.
3. Singleton paylaşımını, `lock` və paralel müraciətləri anlayın.
4. EF Core və real sifariş bazasına keçin.
5. Hangfire üçün dayanıqlı storage qurmağı öyrənin.
6. Retry, idempotentlik və sifariş-job əlaqəsinin etibarlılığını araşdırın.
7. Logging və dashboard giriş nəzarətini real yerləşdirmədən əvvəl tamamlayın.
8. Sonra MediatR pipeline-larını və əlavə job növlərini öyrənin.
