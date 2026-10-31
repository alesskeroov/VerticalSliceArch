# Authentication tətbiqi və yoxlanması

Mövcud .NET 8 JWT bearer authentication genişləndirilib; ayrıca Identity sistemi yaradılmayıb. React interfeysi mövcud Matchday dizaynından istifadə edir. Şifrələr əvvəlki salt-lı PBKDF2 formatında qalır. Bütün To-Do əməliyyatları serverdə tokenin istifadəçi ID-si ilə məhdudlaşır.

## API kontraktı

| Metod | Ünvan | Sorğu |
|---|---|---|
| POST | `/api/auth/register` | `{displayName,email,password,confirmPassword}` |
| POST | `/api/auth/login` | `{email,password}` |
| GET | `/api/auth/me` | Bearer token |
| POST | `/api/auth/logout` | Bearer token |
| POST | `/api/auth/forgot-password` | `{email}` |
| POST | `/api/auth/reset-password` | `{email,token,password,confirmPassword}` |

Forgot cavabı hesabın mövcudluğunu açıqlamır. Reset linki yalnız konfiqurasiyadakı frontend URL-dən qurulur; istifadəçinin göndərdiyi Host başlığına etibar edilmir. Bazada xam token əvəzinə hash saxlanır. Reset və logout hesabın əvvəlki JWT-lərini etibarsız edir; logout bütün cihazlardakı sessiyalara təsir edir.

## Məlumatların qorunması və migration

Əvvəlcə bazanın ehtiyat nüsxəsini yaradın. Migration əlavə sahələrdən ibarətdir; mövcud istifadəçilər və tapşırıqlar silinmir. Sahibi olmayan legacy tapşırıqlar heç bir yeni hesaba avtomatik verilmir.

Production-da tətbiq açılışında migration işləmir. SQL skriptini hazırlayın, yoxlayın və ayrıca deployment addımında tətbiq edin:

```sh
cd backend
dotnet tool restore
dotnet ef migrations script --idempotent --project src/TodoApi --output auth-migration.sql
```

Migration əmri üçün JWT və connection string konfiqurasiyası da mövcud olmalıdır. Hazırlanmış SQL faylını review etmədən production bazasında işlətməyin.

## Təhlükəsizlik və deployment

JWT yalnız açıq Authorization başlığı ilə göndərilir; cookie ilə avtomatik autentifikasiya yoxdur. Buna görə klassik cookie CSRF axını istifadə olunmur. Frontend tokeni sessionStorage-də saxlayır: tab bağlananda sessiya bitir, amma eyni origin-də işləyən zərərli JavaScript yenə tokenə çata bilər. HTTPS, etibarlı frontend hosting və XSS-dən qorunma vacibdir.

Sorğu limitləri ASP.NET Core-un hazır middleware-i ilə tətbiq olunur. Sayğaclar proses daxilindədir; çox instansiyalı deployment üçün gateway və ya paylaşılmış limiter istifadə edin. Reverse proxy arxasında real client IP üçün yalnız etibar edilən proxy-ləri konfiqurasiya edin; sərbəst X-Forwarded-For başlığına etibar etməyin. [Microsoft rate limiting sənədi](https://learn.microsoft.com/aspnet/core/performance/rate-limit?view=aspnetcore-8.0).

## Email göndərilməsinin konfiqurasiyası

SMTP provayderindən göndərən ünvanı və giriş məlumatlarını alın. Nümunə açarlar (dəyərləri özünüzə uyğun dəyişin):

```powershell
# Repo kökündə öz terminalınızda:
dotnet user-secrets set "Smtp:Host" "smtp.example.com" --project backend/src/TodoApi
dotnet user-secrets set "Smtp:Port" "587" --project backend/src/TodoApi
dotnet user-secrets set "Smtp:EnableSsl" "true" --project backend/src/TodoApi
dotnet user-secrets set "Smtp:From" "no-reply@example.com" --project backend/src/TodoApi
dotnet user-secrets set "Smtp:Username" "smtp-user" --project backend/src/TodoApi
dotnet user-secrets set "Smtp:Password" "YOUR_SMTP_PASSWORD" --project backend/src/TodoApi
dotnet user-secrets set "PasswordReset:FrontendUrl" "http://localhost:5173" --project backend/src/TodoApi
```

Production-da user-secrets əvəzinə secret manager/environment istifadə edin: `Smtp__Host`, `Smtp__Port`, `Smtp__EnableSsl`, `Smtp__From`, `Smtp__Username`, `Smtp__Password`, `PasswordReset__FrontendUrl`. FrontendUrl production interfeysinin tam HTTPS ünvanı olmalıdır. `FrontendOrigin` və frontend `VITE_API_URL` də deployment ünvanlarına uyğunlaşdırılmalıdır. Mövcud `Jwt__Secret`, `Jwt__Issuer`, `Jwt__Audience` və `ConnectionStrings__TodoDatabase` ayarları tələb olunur. SMTP parolunu appsettings və Git-ə yazmayın.

İstifadə olunan SMTP transport STARTTLS üçündür (adətən port 587); implicit TLS port 465 əvəzinə provayderin STARTTLS endpoint-ini seçin. Yerli test SMTP serverində TLS yalnız yerli mühit üçün söndürülə bilər. Production-da TLS aktiv saxlayın.

SMTP konfiqurasiyası yoxdursa və ya göndəriş alınmazsa istifadəçiyə hesabın mövcudluğunu açıqlamayan cavab qalır. Göndərilməni öz test email ünvanınızla ayrıca yoxlayın; SMTP hesabı və xarici provayder bu repozitoriyanın testləri ilə əvəz olunmur.

Reset linki `/#reset-password?email=...&token=...` fragment formatındadır; frontend açılışda onu ünvan sətrindən silir. Token server access log və HTTP Referer-ə göndərilmir. Linki açdıqdan sonra səhifəni yeniləsəniz yeni linki emaildən yenidən açın.

Email göndərişi məhdud ölçülü, yaddaşdakı növbə ilə sorğudan ayrılıb. Restart, dolu növbə və SMTP nasazlığı zamanı göndəriş itə bilər; 5 dəqiqə sonra yenidən sorğu göndərin. Növbə xam reset tokenlərini diskə yazmır. Çox instansiyalı və yüksək etibarlılıq tələb edən deployment üçün paylaşılmış limit və qorunan dayanıqlı göndəriş infrastrukturu lazımdır. IP üzrə auth cəhdləri 15 dəqiqədə 10, forgot/reset birlikdə 15 dəqiqədə 5 sorğudur; eyni email üçün yeni linkə 5 dəqiqə fasilə tətbiq edilir.

## Avtomatik yoxlamalar

```sh
dotnet build backend/Todo.sln
dotnet test backend/tests/TodoApi.Tests/TodoApi.Tests.csproj
cd frontend
npm ci
npm run lint
npm run build
npm test
```

Backend testləri real HTTP pipeline, JWT middleware və SQLite relational bazasından istifadə edir. Email test adapteri ilə əvəz olunur. SQL Server migration SQL-inin yaradılması ayrıca yoxlanıb; mövcud real bazada migration icrası və provayder üzərindən email çatdırılması deployment zamanı yoxlanmalıdır.
