# Matchday — tapşırıq oyunun

Gündəlik tapşırıqları əlavə etmək, redaktə etmək və tamamlamaq üçün sadə TODO tətbiqi.
React interfeysi və .NET backend-i eyni repozitoriyadadır. Layihə Vertical Slice və Hangfire-i oxunaqlı nümunələrlə öyrənmək üçün hazırlanıb.

![.NET 8](https://img.shields.io/badge/.NET-8-512BD4?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Hangfire](https://img.shields.io/badge/Hangfire-1.8-C33)
![SQL Server](https://img.shields.io/badge/SQL_Server-Code_First-CC2927)

## Bu sənəd nə üçündür?

Bu sənəd Matchday tətbiqini işə salmaq və əsas sorğu axınını öyrənmək üçündür. Kodun xəritəsi və detallı qərarlar docs qovluğundadır.

## Xüsusiyyətlər

- JWT ilə qeydiyyat/giriş, səhifə yenilənəndə sessiyanın bərpası və hər istifadəçiyə ayrıca tapşırıqlar.
- Tapşırıq yaratmaq, başlığını dəyişmək, tamamlamaq, geri aktiv etmək və silmək.
- Hamısı / Meydanda / Qol filtrləri və qalan aktiv tapşırıqların sayı.
- Azərbaycan dilində mobil uyğun interfeys, yüklənmə, boş siyahı və xəta vəziyyətləri.
- Başlıq üçün boş olmama və maksimum 200 simvol qaydası.
- SQL Server və EF Core Code First migration-ları ilə daimi məlumat.
- Yeni tapşırıq üçün Hangfire konsol bildirişi; hər saat köhnə tamamlanmış işlərin təmizlənməsi.
- Development mühitində Swagger və Hangfire dashboard.

## Arxitektura

Vertical Slice funksiyanın endpoint-ini, sorğu modelini və məntiqini bir yerdə saxlayır.
Hər feature bir statik qabıq sinif, Request record, Handler və MapEndpoint metodundan ibarətdir.
Handler DI, yəni asılılıqların avtomatik verilməsi ilə yaradılır. Job feature-lərinin MapEndpoint metodu HTTP ünvanı açmır; eyni şablonu qoruyur.
MediatR, AutoMapper və FluentValidation istifadə olunmur.

## Qovluq strukturu

```text
backend/
  .config/dotnet-tools.json
  requests.http
  src/TodoApi/
    Common/             # Todo, User, AppDbContext, parol və JWT xidmətləri
    Composition/        # AddTodoFeatures ilə handler qeydiyyatları
    Features/Auth/      # Register, Login, Me
    Features/Todos/     # Get, Create, Update, Toggle, Delete
    Features/Jobs/      # Bildiriş və təmizləmə
    Migrations/         # Code First baza dəyişiklikləri
    Program.cs          # Qoşulmalar və job planı
frontend/
  .env.example
  src/api/              # todoApi.ts və authApi.ts
  src/auth/             # AuthContext.tsx və tokenStorage.ts
  src/pages/            # LoginPage.tsx və RegisterPage.tsx
  src/components/       # Forma, siyahı, element və filtrlər
  src/types/            # Todo və TodoFilter
  src/App.tsx
  src/App.css
docs/                   # Təlimatlar və əvvəlki demonun arxivi
.github/workflows/ci.yml
```

## Necə işə salmaq

**Tələblər:** .NET 8 SDK və runtime (daha yeni SDK da build edə bilər), Node.js 22.13+ və npm, yerli SQL Server. SQL Server Express də istifadə oluna bilər; ayrıca quraşdırılmış server lazımdır. Bu versiyada SQLite yoxdur.

### Backend

Yerli ayarda server `Revan`, baza `TodoDb`, giriş **Windows Authentication** olaraq nəzərdə tutulub.
`backend/src/TodoApi/appsettings.json` faylındakı ConnectionStrings:TodoDatabase dəyəri:

```text
Server=Revan;Database=TodoDb;Trusted_Connection=True;TrustServerCertificate=True
```

Bu ayar yalnız yerli inkişaf üçündür. TrustServerCertificate yerli sertifikata etibar edir; real yayımlamada sertifikatı düzgün qurun.
İşlədən Windows istifadəçisinin serverdə giriş və ilk açılışda baza yaratmaq icazəsi olmalıdır.
Başqa server üçün həmin ayarı dəyişin və ya `ConnectionStrings__TodoDatabase` mühit dəyişənini verin. Parolu Git-ə yazmayın.

Əvvəl aşağıdakı **Autentifikasiya** bölməsinə uyğun JWT sirrini təyin edin. Sonra kök qovluqda:

```sh
dotnet build backend/src/TodoApi/TodoApi.csproj
dotnet run --project backend/src/TodoApi --launch-profile http
```

Yalnız Development mühitində tətbiq açılarkən `MigrateAsync()` migration-ları tətbiq edir; baza yoxdursa yaradır. Production-da migration ayrıca hazırlanıb tətbiq edilməlidir. Əvvəlcədən mövcud eyniadlı baza varsa, tətbiqdən əvvəl quruluşunun uyğunluğunu yoxlayın.
API: [localhost:5000/api/todos](http://localhost:5000/api/todos)
Swagger: [localhost:5000/swagger](http://localhost:5000/swagger)

Yeni model dəyişikliklərindən sonra, backend qovluğunda:

```sh
dotnet tool restore
dotnet ef migrations add DescribeYourChange --project src/TodoApi
```

Sonra tətbiqi yenidən başladın. `EnsureCreated` istifadə edilmir; sxem migration-larla idarə olunur.

### Frontend

Ayrı terminalda:

```sh
cd frontend
npm install
```

`.env.example` faylını `.env` adı ilə köçürün (PowerShell: `Copy-Item .env.example .env`; Bash: `cp .env.example .env`). Dəyər: `VITE_API_URL=http://localhost:5000`.

```sh
npm run dev
```

İnterfeys: [localhost:5173](http://localhost:5173). Ünvan ayarını dəyişəndən sonra Vite-i yenidən başladın.
Backend CORS origin-i appsettings.json-dakı `FrontendOrigin` dəyərindən oxuyur: `http://localhost:5173`.

## Autentifikasiya

Authentication istifadəçinin kimliyini, authorization isə icazəsini yoxlayır.
Axın: register → login → JWT → `Authorization: Bearer <token>` ilə qorunan sorğu.
Qeydiyyat səhifəsi register uğurlu olduqda özü login edir. Token HS256 ilə imzalanır, 60 dəqiqə yaşayır və sub, email, name claim-lərini daşıyır; claim imzalanmış istifadəçi məlumatıdır.

Bir dəfə, repo kökündə **öz Windows PowerShell terminalınızda**, Visual Studio ilə eyni Windows hesabından işlədin. Aşağıdakı kod təsadüfi sirri yaradıb birbaşa user-secrets-ə yazır; dəyəri ekrana çıxarmır:

```powershell
$secretBytes = New-Object byte[] 48
$generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$generator.GetBytes($secretBytes)
$generator.Dispose()
$jwtSecret = [Convert]::ToBase64String($secretBytes)
dotnet user-secrets set "Jwt:Secret" "$jwtSecret" --project backend/src/TodoApi
dotnet user-secrets set "Jwt:Issuer" "Matchday" --project backend/src/TodoApi
dotnet user-secrets set "Jwt:Audience" "MatchdayFrontend" --project backend/src/TodoApi
dotnet user-secrets set "Jwt:ExpiryMinutes" "60" --project backend/src/TodoApi
```

Bu əmrlər repo kökündən işlədilməlidir. `TodoApi.csproj` daxilində `UserSecretsId=matchday-todoapi` var; yenidən init etmək lazım deyil. Vacib: agentin izolə edilmiş icra mühitində yaradılmış secret faylı Visual Studio-dan görünməyə bilər. Debugger-də SecretLength=0 və secret faylı üçün File.Exists=false çıxırsa, yuxarıdakı əmrləri öz terminalınızda icra edin; kod yoxlamasını zəiflətməyin.

Sirrlər onları təyin edən Windows istifadəçisinə aiddir: Visual Studio da həmin hesabdan açılmalıdır. `dotnet user-secrets list` çıxışı sirri göstərə bilər; onu paylaşmayın.

Visual Studio-da **http** açılış profilini seçin. Bu profil hər iki environment dəyişənini Development edir; appsettings çıxış qovluğundan, yerli sirr UserSecretsId əsasında oxunur. Ayarları dəyişəndə çalışan debug sessiyasını dayandırıb yenidən başladın.

Secret repoda deyil; appsettings.json-da boş placeholder, Issuer, Audience və ExpiryMinutes var.
Yeni backend asılılığı Microsoft.AspNetCore.Authentication.JwtBearer 8.0.22-dir; tam Identity paketi və frontend router kitabxanası əlavə edilməyib.
Parollar PBKDF2-SHA256, 600000 iterasiya və hər parol üçün təsadüfi salt ilə saxlanır; hash cavabda və JWT-də yoxdur.

**DB yenilənməsi:** bu layihə SQL Server istifadə edir, todo.db faylı yoxdur və fayl silmək lazım deyil.
`AddAuthentication` migration-ı Users, unikal email indeksi və nullable Todo.UserId xarici açarını əlavə edir.
Yalnız Development açılışında migration avtomatik tətbiq olunur. Əl ilə tətbiq etmək üçün backend qovluğunda:

```sh
dotnet tool restore
dotnet ef database update --project src/TodoApi -- --environment Development
```

Köhnə todo-lar silinmir, amma sahibi məlum olmadığı üçün yeni istifadəçilərə göstərilmir; interfeysdə itmiş kimi görünə bilər. UserId null yalnız bu legacy qeydlər üçündür; yeni tapşırığın sahibi həmişə tokendən götürülür.
Bazanın özünü silsəniz və ya dağıdıcı migration seçsəniz məlumat itə bilər; bu dəyişiklikdə belə əməliyyat yoxdur.

Frontend tokeni sessionStorage-də saxlayır və əvvəlki localStorage tokenini silir. Tab bağlananda sessiya bitir. Bu sadədir, amma XSS — səhifədə zərərli JavaScript işləməsi — tokeni oxuya bilər; real layihədə httpOnly cookie alternativini öyrənin.
Səhifə yenilənəndə `/api/auth/me` sessiyanı yoxlayır; vaxt bitdikdə, çıxışda və todo sorğusuna 401 gəldikdə token silinir, giriş ekranı açılır.
Çıxış `/api/auth/logout` vasitəsilə serverdə hesabın bütün JWT sessiyalarını ləğv edir. Şifrə sıfırlananda da əvvəlki sessiyalar ləğv olunur. Serverə bağlantı yoxdursa yalnız yerli çıxış mümkündür. Refresh token yoxdur.
Swagger Authorize düyməsinə yalnız tokeni yapışdırın; Bearer prefiksi avtomatik əlavə edilir.

## API endpoint-ləri

| Metod | URL | Təsvir |
| --- | --- | --- |
| POST | /api/auth/register | Email, password, confirmPassword, displayName ilə hesab yaradır; 201. |
| POST | /api/auth/login | Email və password qarşılığında token və açıq istifadəçi məlumatı; 200. |
| GET | /api/auth/me | Token sahibinin açıq məlumatı; Bearer tələb edir. |
| GET | /api/todos?filter=all | Yalnız cari istifadəçinin tapşırıqları; active və completed də qəbul edilir. |
| POST | /api/todos | JSON: {"title":"Kitab oxu"}; 201 qaytarır. |
| PUT | /api/todos/{id} | JSON ilə yalnız başlığı yeniləyir; 200 qaytarır. |
| PATCH | /api/todos/{id}/toggle | Tamamlanmanı dəyişir; 200 qaytarır. |
| DELETE | /api/todos/{id} | Silir; 204 qaytarır. |

Bütün `/api/todos` endpoint-ləri token tələb edir. Başqasının todo-su üçün 404, tokensiz sorğu üçün 401 qaytarılır.
Boş və 200 simvoldan uzun başlıq üçün 400, tapılmayan düzgün Guid ID üçün 404 qaytarılır.
Nümunə sorğular: [backend/requests.http](backend/requests.http).

## Hangfire dashboard

Yalnız Development mühitində: [localhost:5000/hangfire](http://localhost:5000/hangfire).
Dashboard üçün xüsusi giriş nəzarəti yoxdur; API-nin JWT qoruması dashboard-a tətbiq edilmir. Bu, yerli demodur. Swagger də yalnız Development-də açılır.
Yeni tapşırıq işi yalnız ID alır və `Yeni tapşırıq yaradıldı: ...` yazır.
`cleanup-completed-todos` hər saatın başlanğıcında, UTC cədvəli ilə planlanır; tamamlanma tarixi 7 gündən köhnə olan tapşırıqları silir. Tətbiq açıq olmalıdır; ilk işi dərhal gözləməyin.
Hangfire.InMemory növbə və tarixçəni restart zamanı itirir. SQL Server-dəki todo-lar isə qalır.
Əlavə retry ayarı yoxdur; standart Hangfire retry davranışı qalır.

## Build və yoxlama

```sh
dotnet build backend/src/TodoApi/TodoApi.csproj
cd frontend
npm ci
npm run build
```

Əl ilə ssenari: qeydiyyatdan keçin, daxil olun, tapşırıq yaradın, redaktə edin, tamamlayın, filtrləri dəyişin, geri aktiv edin və silin.
Səhifəni yeniləyəndə saxlanmış işlər qalmalıdır. Backend dayananda Azərbaycan dilində xəta mesajı görünməlidir.
Çıxışdan sonra tokensiz GET /api/todos üçün 401 gözləyin. İkinci hesab birinci hesabın todo-larını görməməlidir.
CI build, frontend lint/test və SQLite üzərində backend HTTP inteqrasiya testlərini yoxlayır. Real SQL Server migration və SMTP provayderi ayrıca deployment yoxlaması tələb edir.

## Ekran görüntüsü

| Light | Dark |
| --- | --- |
| ![Light görünüş](docs/screenshot-light.png) | ![Dark görünüş](docs/screenshot-dark.png) |

Yeni ekran görüntüsü çəkərkən eyni görünüşü light və dark sistem rejimlərində saxlayın:
`docs/screenshot-light.png` və `docs/screenshot-dark.png`.
Hər rejimdə 375px mobil və 1280px desktop görünüşünü yoxlamaq tövsiyə olunur.
Giriş ekranı: [screenshot-login.png](docs/screenshot-login.png).
Əvvəlki `docs/screenshot.jpg` köhnə dizayna aiddir.

## Dizayn konsepti

Matchday gündəlik tapşırıqları bir oyun kimi təqdim edir: aktiv işlər meydandadır, tamamlananlar qoldur.
Yaşıl vurğu və yuxarıdakı incə meydan zolaqları futbol hissi yaradır; mövcud təmiz siyahı və klaviatura dəstəyi saxlanılır.
Lokal Barlow Condensed yalnız Matchday başlığında, hesab rəqəmlərində, QOL yazısında və həftəlik hədəf etiketində istifadə olunur.
Klub və liqa loqosu, avtomatik səs, animasiya və konfeti kitabxanası yoxdur; sistemin azaldılmış hərəkət seçimində effektlər sönür.

Rəng və ölçülər `frontend/src/styles/tokens.css`, komponent stilləri `frontend/src/App.css` faylındadır.
Həftəlik hədəf `frontend/src/constants.ts` daxilində 20-dir; bazar ertəsindən indiyədək tamamlanan və hələ tamamlanmış vəziyyətdə olan tapşırıqlar sayılır.
Hesab tablosu tarix etiketinə baxmayaraq bütün mövcud tapşırıqları sayır; gündəlik tarix filtri tətbiq etmir.
Həftəlik göstərici serverin qaytardığı mövcud məlumatdan hesablanır; silinmiş tapşırıqlar ayrıca tarixçə kimi saxlanmır.

## Əlavə sənədlər və oxuma ardıcıllığı

- [Layihə icmalı](docs/01-layihe-icmali.md)
- [Texniki qərarlar](docs/02-qerarlar.md)
- [Sonra öyrəniləcək mövzular](docs/03-sonra-arasdirilacaq-movzular.md)
- [Yeni feature və lüğət](docs/04-yeni-feature-elave-etme-ve-lugət.md)
- [Dəyişiklik jurnalı](docs/05-deyisiklik-jurnali.md)
- [Əvvəlki sifariş demosu](docs/archive/orders-demo/README.md) — əvvəlki kod və sənədlər ayrıca qorunub.

Giriş axını: User → PasswordService → JwtTokenService → Register → Login → Me → AuthenticationRegistration → Program.cs → frontend AuthContext.

TODO axını: Todo → AppDbContext → GetTodos → CreateTodo → TodoCreatedNotification → UpdateTodo / ToggleTodo / DeleteTodo → CleanupCompletedTodos → Program.cs → frontend/types → api → komponentlər → App.tsx.

## Gələcək planlar

- Refresh token, rollar və email təsdiqi.
- Daha geniş performans və deployment testləri.
- Hangfire üçün dayanıqlı SQL storage və idempotent bildirişlər.
- Mərkəzi xəta idarəsi, strukturlaşdırılmış loglar və baza-job əlaqəsinin etibarlılığı.
- Deployment avtomatlaşdırılması və infrastruktur konfiqurasiyası.

## Lisenziya

[MIT](LICENSE).

İstinadlar: [JWT Bearer konfiqurasiyası](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication?view=aspnetcore-8.0), [PBKDF2 API](https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.rfc2898derivebytes.pbkdf2?view=net-8.0).

## Şifrə sıfırlama və SMTP

Forgot/Reset Password səhifələri, birdəfəlik linklər, sorğu limitləri və server sessiya ləğvi əlavə edilib. Quraşdırma, migration, SMTP açarları və təhlükəsizlik qeydləri: [Authentication təlimatı](docs/06-authentication.md).
