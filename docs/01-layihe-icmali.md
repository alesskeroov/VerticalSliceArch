# TODO layihəsinin icmalı

## Bu sənəd nə üçündür?

Bu sənəd hazırkı SQL Server və React tətbiqinin xəritəsidir. Əvvəlki sifariş demosu `docs/archive/orders-demo` qovluğunda qorunur.

## Texnologiya və quruluş

- .NET 8 Minimal API HTTP endpoint-lərini controller olmadan yazır.
- EF Core C# obyektlərini SQL Server cədvəllərinə bağlayır.
- Code First modeldən başlayaraq migration, yəni baza quruluşu dəyişikliyi yaradır.
- Hangfire işləri HTTP sorğusundan ayrı icra edir; InMemory job məlumatlarını yaddaşda saxlayır.
- React komponentlərlə interfeys qurur; TypeScript məlumat tiplərini yoxlayır; Vite inkişaf serveri və build verir.

```text
backend/src/TodoApi/
  Common/          Todo.cs, AppDbContext.cs, User.cs
                   PasswordService.cs, JwtTokenService.cs, JwtSettings.cs, CurrentUser.cs
  Composition/     ServiceRegistration.cs və AuthenticationRegistration.cs
  Features/Auth/   Register/Register.cs, Login/Login.cs, Me/Me.cs
  Features/Todos/  GetTodos, CreateTodo, UpdateTodo, ToggleTodo, DeleteTodo
  Features/Jobs/   TodoCreatedNotification, CleanupCompletedTodos
  Migrations/      EF Core tərəfindən yaradılan sxem tarixçəsi
  Program.cs       DI, CORS, migration, endpoint və plan
frontend/src/
  types/           Todo və filtr tipi
  api/             todoApi.ts və authApi.ts
  auth/            AuthContext.tsx, tokenStorage.ts
  pages/           LoginPage.tsx, RegisterPage.tsx
  styles/auth.css  Yalnız yeni giriş səhifələri və hesab idarələri
  components/      Forma, filtr, siyahı və tək element
  App.tsx          Vəziyyət və komponentlərin əlaqəsi
```

Yollar kökdən başlayır. Hər feature öz adlı alt qovluqda eyni adlı `.cs` faylındadır. DI asılılıqları obyektə avtomatik vermək üsuludur. AppDbContext və handler-lər scoped qeyd edilir: eyni xidmət sahəsində paylaşılır, ayrı HTTP sorğuları və job-lar eyni context-i paylaşmır.

## Bir yaratma sorğusunun yolu

1. `frontend/src/components/TodoForm.tsx` başlığı App-a verir.
2. `frontend/src/api/todoApi.ts` tokeni bir yerdə Authorization başlığına əlavə edib POST `/api/todos` göndərir.
3. JWT middleware imza, issuer, audience, müddət və sub ID-ni yoxlayır. Endpoint-də RequireAuthorization var; userId CurrentUser.GetUserId ilə tokendən alınır, request-dən alınmır. `backend/src/TodoApi/Features/Todos/CreateTodo/CreateTodo.cs` handler-i bu ID ilə çağırır.
4. Handler boş və 200 simvoldan uzun başlığı rədd edir. Yeni Todo üçün UTC yaradılma tarixi verir.
5. AppDbContext SaveChangesAsync ilə SQL Server-də saxlayır.
6. Enqueue yalnız todo.Id parametrini Hangfire növbəsinə yazır.
7. API 201 və yeni obyekti qaytarır; frontend siyahını yeniləyir. Cavab job-un tamamlanmasını gözləmir.
8. TodoCreatedNotification handler-i ID ilə bazanı oxuyur və başlığı konsola yazır.

Job parametri bütöv Todo deyil. Hangfire parametri serializasiya edir, yəni saxlanacaq formata çevirir; kiçik ID modeli job məlumatından ayırır.

## Digər əməliyyatlar

Bütün TODO handler-ləri UserId ilə məhdudlaşır; başqasının ID-si 404 verir. GET all/active/completed filtrini qəbul edir. Frontend bütün siyahını bir dəfə alır və göstərilən alt siyahını yerli filtrdən çıxarır; qalan işlərin sayı həmişə bütün aktiv işlərdən hesablanır.
PUT yalnız başlığı dəyişir. PATCH tamamlanmanı tərsinə çevirir və CompletedAt tarixini yazır və ya silir. DELETE tapşırığı silir.
Sistem job-u CleanupCompletedTodos bütün istifadəçilər üçün işləyir və tamamlanması 7 gündən köhnə işləri saatlıq planda silir. Yeni HTTP endpoint-i açmır.

## Giriş yolu

`frontend/src/auth/AuthContext.tsx` register → login edir və tokeni localStorage-də saxlayır.
`frontend/src/api/authApi.ts` üç auth endpoint-ini çağırır. Yenilənmədə me yoxlanır; todoApi 401 alanda tokenStorage sessiyanı silib Context-ə xəbər verir.
`frontend/src/App.tsx` girişsiz istifadəçiyə yalnız LoginPage/RegisterPage göstərir; çıxışda əvvəlki TODO vəziyyəti unmount edilir.
User və Todo əlaqəsini AddAuthentication migration-ı yaradır. Köhnə UserId=null qeydlər saxlanır, amma heç bir hesaba açılmır.

## Oxuma ardıcıllığı

Əvvəl giriş üçün `backend/src/TodoApi/Common/User.cs`, `PasswordService.cs`, `JwtTokenService.cs`; sonra `Features/Auth/Register/Register.cs`, `Login/Login.cs`, `Me/Me.cs` oxuyun. Bu qısa yolların əsası `backend/src/TodoApi/`-dir. Ardınca:

1. `backend/src/TodoApi/Common/Todo.cs`
2. `backend/src/TodoApi/Common/AppDbContext.cs`
3. `backend/src/TodoApi/Features/Todos/GetTodos/GetTodos.cs`
4. `backend/src/TodoApi/Features/Todos/CreateTodo/CreateTodo.cs`
5. Digər Todos feature-ləri, sonra Jobs feature-ləri.
6. `backend/src/TodoApi/Program.cs` və Migrations qovluğu.
7. `frontend/src/auth/AuthContext.tsx`, `frontend/src/api/authApi.ts`, sonra `frontend/src/types/todo.ts`, `frontend/src/api/todoApi.ts`, komponentlər və App.tsx.

İşə salmaq üçün [kök README](../README.md) və [HTTP nümunələri](../backend/requests.http) istifadə edin.
