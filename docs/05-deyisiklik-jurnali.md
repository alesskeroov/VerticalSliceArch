# Dəyişiklik jurnalı

## Bu sənəd nə üçündür?

Bu sənəd kod dəyişikliklərini və onların səbəbini izləmək üçündür. Yeni qeydlər yuxarıda yerləşir; yollar repozitoriyanın kökündən başlayır.

## [2026-10-31] JWT açılış konfiqurasiyası düzəldildi

Debugger-də faktiki səbəb müəyyən edildi: Development düzgündür, amma Visual Studio prosesində user-secrets faylı görünmür (File.Exists=false), SecretLength=0-dır. Agent mühitindəki faylın mövcudluğu yetərli yoxlama deyil. README-yə istifadəçinin öz PowerShell terminalında təsadüfi secret yaratma əmri əlavə edildi; 32 simvol limiti saxlanıldı.

README-də Secret, Issuer, Audience və ExpiryMinutes üçün tam, layihə yolu açıq user-secrets əmrləri verildi. Mövcud UserSecretsId və property uyğunluğu yoxlanıldı; dörd açar eyni yerli saxlayıcıda quruldu. Real sirr dəyişdirilmədi və repoya yazılmadı.

- `backend/src/TodoApi/Program.cs`: appsettings üçün sabit çıxış qovluğu; Development-də user-secrets-in açıq yüklənməsi. Mühit və əmr sətri üstünlüyü qorunur.
- `backend/src/TodoApi/Properties/launchSettings.json`: http profilində DOTNET_ENVIRONMENT də Development təyin edilir.
- `backend/src/TodoApi/Composition/AuthenticationRegistration.cs`: çatışmayan Secret, Issuer/Audience və səhv müddət üçün ayrı xəta mesajları.
- README.md: Visual Studio profil seçimi və debug sessiyasını yenidən başlatma qeydi. Sirr repoya əlavə edilmədi; DB sxemi dəyişmədi.

## [2026-10-31] Giriş (Authentication) əlavə olundu

### Əlavə olundu

| Fayl | Məqsəd |
| --- | --- |
| `backend/src/TodoApi/Common/User.cs` | İstifadəçi modeli; hash JSON-dan gizlidir. |
| `backend/src/TodoApi/Common/PasswordService.cs` | PBKDF2 hash və sabit vaxtlı müqayisə. |
| `backend/src/TodoApi/Common/JwtSettings.cs` | JWT konfiqurasiya modeli. |
| `backend/src/TodoApi/Common/JwtTokenService.cs` | 60 dəqiqəlik HS256 token və açıq cavab. |
| `backend/src/TodoApi/Common/CurrentUser.cs` | sub claim-indən UserId oxumaq. |
| `backend/src/TodoApi/Composition/AuthenticationRegistration.cs` | JWT doğrulaması, auth DI və Swagger Bearer. |
| `backend/src/TodoApi/Features/Auth/Register/Register.cs` | Validation, unikal email və hesab yaratmaq. |
| `backend/src/TodoApi/Features/Auth/Login/Login.cs` | Parolu yoxlamaq və JWT qaytarmaq. |
| `backend/src/TodoApi/Features/Auth/Me/Me.cs` | Cari istifadəçinin yalnız açıq məlumatı. |
| `backend/src/TodoApi/Migrations/20261031141749_AddAuthentication.cs` | Users və Todo.UserId sxemini əlavə etmək; köhnə sətirlər silinmir. |
| `backend/src/TodoApi/Migrations/20261031141749_AddAuthentication.Designer.cs` | EF Core migration model təsviri. |
| `frontend/src/api/authApi.ts` | Register/login/me sorğuları və Azərbaycan dilində xətalar. |
| `frontend/src/auth/AuthContext.tsx` | Giriş vəziyyəti, sessiyanın bərpası, çıxış və müddət taymeri. |
| `frontend/src/auth/tokenStorage.ts` | localStorage, exp oxunması və 401 hadisəsi; XSS qeydi. |
| `frontend/src/pages/LoginPage.tsx` | Label-lı giriş forması, loading/error, parol göstər/gizlət. |
| `frontend/src/pages/RegisterPage.tsx` | Qeydiyyat forması və avtomatik login. |
| `frontend/src/styles/auth.css` | Yalnız yeni auth ekranları və hesab idarələrinin stilləri. |

### Dəyişdirildi

| Mövcud fayl | Qısa səbəb |
| --- | --- |
| `.gitignore` | Development ayar faylını gələcək secret sızmasından qorumaq. |
| `backend/src/TodoApi/TodoApi.csproj` | JWT Bearer paketi və UserSecretsId. |
| `backend/src/TodoApi/appsettings.json` | Boş Secret placeholder-i, Issuer/Audience/60 dəqiqə. |
| `backend/src/TodoApi/Common/AppDbContext.cs` | Users, unikal email, uzunluq qaydaları və FK. |
| `backend/src/TodoApi/Common/Todo.cs` | Nullable UserId; legacy məlumatı silmədən keçid. |
| `backend/src/TodoApi/Features/Todos/GetTodos/GetTodos.cs` | Token sahibinin todo-larını oxumaq və RequireAuthorization. |
| `backend/src/TodoApi/Features/Todos/CreateTodo/CreateTodo.cs` | Sahibi JWT-dən təyin etmək və RequireAuthorization. |
| `backend/src/TodoApi/Features/Todos/UpdateTodo/UpdateTodo.cs` | ID və sahibliklə yeniləmək; başqasına 404. |
| `backend/src/TodoApi/Features/Todos/ToggleTodo/ToggleTodo.cs` | ID və sahibliklə tamamlanmanı dəyişmək; başqasına 404. |
| `backend/src/TodoApi/Features/Todos/DeleteTodo/DeleteTodo.cs` | ID və sahibliklə silmək; başqasına 404. |
| `backend/src/TodoApi/Features/Jobs/CleanupCompletedTodos/CleanupCompletedTodos.cs` | Yalnız şərh: sistem job-u bütün istifadəçilər üçün işləyir. |
| `backend/src/TodoApi/Program.cs` | Auth qeydiyyatı, middleware sırası və üç endpoint xəritəsi. |
| `backend/src/TodoApi/Migrations/AppDbContextModelSnapshot.cs` | EF Core-un yeni sxem snapshot-u. |
| `backend/requests.http` | Auth sorğuları və boş parol/token placeholder-ləri; real sirr yoxdur. |
| `frontend/src/api/todoApi.ts` | Bearer başlığını bir yerdə əlavə etmək, 401-də sessiyanı silmək. |
| `frontend/src/main.tsx` | AuthProvider və ayrıca auth stillərini qoşmaq. |
| `frontend/src/App.tsx` | Şərtli giriş ekranları, ad/Çıxış; logout-da köhnə TODO vəziyyəti bağlanır. |

### DB təsiri

SQL Server-də Users və unikal Email indeksi yaranır. Todo.UserId nullable FK-dir: əvvəlki sahibsiz todo-lar silinmir, lakin heç bir istifadəçiyə görünmür. Yeni todo-nun sahibi həmişə tokendən gəlir. Burada todo.db yoxdur və bazanı silib yenidən yaratmaq tələb edilmir. Dağıdıcı alternativ seçilsə məlumat itə bilər; bu migration həmin alternativdən istifadə etmir.

### Yenilənən sənədlər və yoxlama

- README.md: quraşdırma, secret əmri, DB yenilənməsi, auth endpoint-ləri və məhdudiyyətlər.
- docs/01-layihe-icmali.md: yeni fayllar və qorunan sorğu axını.
- docs/02-qerarlar.md: JWT, PBKDF2, localStorage, secret və 404 qərarları.
- docs/03-sonra-arasdirilacaq-movzular.md: tamamlanmış giriş və növbəti təhlükəsizlik mövzuları.
- docs/04-yeni-feature-elave-etme-ve-lugət.md: qorunan slice qaydası və auth terminləri.
- docs/05-deyisiklik-jurnali.md: bu qeyd. docs/screenshot-login.png: yeni giriş ekranının görüntüsü.

Yoxlandı: backend/frontend build; iki hesabla register/login/me, 401, 409, sahiblik və başqasına 404; brauzerdə qeydiyyat, todo yaratma, yenilənmədə sessiya və çıxış. Test hesabları ayrıca təmizləndi, legacy todo-lar qorundu.
Yeni frontend paketi yoxdur. Mövcud Matchday CSS, komponent adları və Todo TypeScript tipi dəyişdirilməyib; yeni UI stilləri ayrıca fayldadır.
