# Yeni feature və lüğət

## Bu sənəd nə üçündür?

Bu sənəd artıq mövcud DeleteTodo feature-i üzərindən quruluşu izah edir. Yeni slice əlavə edəndə eyni addımları təkrarlaya bilərsiniz.

## DeleteTodo necə qurulub?

1. `backend/src/TodoApi/Features/Todos/DeleteTodo/DeleteTodo.cs` faylında statik qabıq var. Yeni funksiya üçün eyni adlı qovluq və fayl yaradın.
2. İçində Request record, Handler və MapEndpoint saxlayın. DeleteTodo.Request ID-ni daşıyır; sorğu gövdəsi tələb etmir.
3. Handler konstruktorunda AppDbContext qəbul edir. Handle SingleOrDefaultAsync ilə həm ID, həm cari UserId üzrə axtarır; uyğun qeyd yoxdursa 404 verir.
4. Tapılan obyekti Remove ilə qeyd edir, SaveChangesAsync ilə bazada silir və 204 qaytarır.
5. MapEndpoint DELETE `/api/todos/{id:guid}` ünvanını handler-ə bağlayır və RequireAuthorization() əlavə edir. ClaimsPrincipal-dan CurrentUser.GetUserId() ilə alınan ID handler-ə ötürülür; request-dəki sahib ID-sinə etibar edilmir.
6. `backend/src/TodoApi/Composition/ServiceRegistration.cs` daxilində AddScoped<DeleteTodo.Handler> qeydiyyatı var. `backend/src/TodoApi/Program.cs` isə AddTodoFeatures() və DeleteTodo.MapEndpoint(app) çağırır. Yeni feature üçün handler-i ServiceRegistration.cs-də, endpoint-i Program.cs-də əlavə edin. Lazım olan using sətrlərini unutmayın.
7. `backend/requests.http` ilə əvvəl qeydiyyat və giriş edin, tokeni Authorization başlığına qoyun. Sonra POST yaradın, ID-ni götürün, DELETE edin, sonra GET ilə yoxlayın. İkinci DELETE 404 qaytarmalıdır.

Yeni feature modelə sahə əlavə edirsə, təkcə endpoint kifayət deyil: backend qovluğunda yeni migration yaradın. Həmçinin `frontend/src/types/todo.ts` tipini, `frontend/src/api/todoApi.ts` sorğusunu və uyğun komponenti dəyişin.

**Tez unudulanlar:** Handler DI qeydiyyatı, MapEndpoint çağırışı, SaveChangesAsync, boş və uzun başlıq yoxlaması, frontend xəta/yüklənmə vəziyyəti və yeni model üçün migration.

Yeni Auth feature-i əlavə edilirsə, handler qeydiyyatı `backend/src/TodoApi/Composition/AuthenticationRegistration.cs` faylındadır. Parol və hash cavaba çıxarılmamalıdır.

## Lüğət

| Termin | Mənası | Harada görünür? |
| --- | --- | --- |
| Slice | Bir funksiyanın bir yerdə saxlanan kodu | backend/src/TodoApi/Features |
| Request | Giriş məlumat modeli | Hər feature-in içindəki record |
| Handler | Əməliyyat məntiqini icra edən sinif | Feature-lərin içində |
| Minimal API | Controller olmadan HTTP endpoint yazmaq | MapEndpoint metodları |
| DI | Obyektə asılılıqlarını avtomatik vermək | Program.cs və konstruktorlar |
| Scoped | Eyni xidmət sahəsində bir obyekt | AddDbContext və AddScoped |
| Singleton | Tətbiq boyu bir obyekt | Todo context üçün istifadə edilmir |
| Code First | Əvvəl C# modeli, sonra baza sxemi | Todo.cs və AppDbContext.cs |
| Migration | Baza quruluşu dəyişikliyinin qeydi | backend/src/TodoApi/Migrations |
| DbContext | EF Core-un baza sessiyası | AppDbContext.cs |
| Enqueue | İşi növbəyə qoymaq | CreateTodo.cs |
| Fire-and-forget | Çağıranın bitməsini gözləmədiyi iş | TodoCreatedNotification |
| Recurring job | Planla təkrarlanan iş | CleanupCompletedTodos |
| Cron | İcra vaxtının cədvəli | Program.cs: Cron.Hourly |
| Dashboard | Job idarəetmə səhifəsi | /hangfire, Development-də |
| Serializasiya | Məlumatın saxlanacaq formata çevrilməsi | Hangfire-in todoId saxlaması |
| Idempotent | Təkrar icrada əlavə nəticə yaratmayan iş | Bildiriş üçün ayrıca qoruma yoxdur |
| CORS | Brauzerdə fərqli origin-dən sorğu icazəsi | Program.cs və FrontendOrigin ayarı |
| State | İnterfeysin yadda saxladığı cari vəziyyət | App.tsx daxilində useState |
| UTC | Saat qurşağından asılı olmayan ortaq vaxt əsası | CreatedAt, CompletedAt və cleanup |
| JWT | İmzalanmış giriş tokeni | Common/JwtTokenService.cs |
| Claim | Token daxilində istifadəçi məlumatı | sub, email, name |
| Bearer token | Əlində olanın sorğuya əlavə etdiyi giriş tokeni | todoApi.ts: Authorization başlığı |
| Hash | Paroldan biristiqamətli hesablanan yoxlama dəyəri | Common/PasswordService.cs |
| Salt | Eyni parolları fərqləndirən təsadüfi baytlar | PasswordService.Hash |
| Authentication | Kimliyin yoxlanması | JWT Bearer middleware |
| Authorization | Giriş icazəsinin yoxlanması | RequireAuthorization və handler sahiblik filtri |
| Middleware | Sorğu yolunda işləyən addım | Program.cs: UseAuthentication, UseAuthorization |
| 401 | Giriş məlumatı yoxdur və ya keçərli deyil | Tokensiz /api/todos və yanlış login |
| 403 | Kimlik məlumdur, amma icazə çatmır | Hazırda ayrıca rol/policy 403 ssenarisi yoxdur |
| 409 | Məlumat konflikti | Artıq qeydiyyatdan keçmiş email |

Bütün backend qısa fayl adları `backend/src/TodoApi/` altındadır. Tam xəritə üçün [icmala](01-layihe-icmali.md) baxın.
