# Yeni feature və lüğət

## Bu sənəd nə üçündür?

Bu sənəd artıq mövcud DeleteTodo feature-i üzərindən quruluşu izah edir. Yeni slice əlavə edəndə eyni addımları təkrarlaya bilərsiniz.

## DeleteTodo necə qurulub?

1. `backend/src/TodoApi/Features/Todos/DeleteTodo/DeleteTodo.cs` faylında statik qabıq var. Yeni funksiya üçün eyni adlı qovluq və fayl yaradın.
2. İçində Request record, Handler və MapEndpoint saxlayın. DeleteTodo.Request ID-ni daşıyır; sorğu gövdəsi tələb etmir.
3. Handler konstruktorunda AppDbContext qəbul edir. Handle əvvəl FindAsync ilə axtarır; yoxdursa 404 verir.
4. Tapılan obyekti Remove ilə qeyd edir, SaveChangesAsync ilə bazada silir və 204 qaytarır.
5. MapEndpoint DELETE `/api/todos/{id:guid}` ünvanını handler-ə bağlayır.
6. `backend/src/TodoApi/Composition/ServiceRegistration.cs` daxilində AddScoped<DeleteTodo.Handler> qeydiyyatı var. `backend/src/TodoApi/Program.cs` isə AddTodoFeatures() və DeleteTodo.MapEndpoint(app) çağırır. Yeni feature üçün handler-i ServiceRegistration.cs-də, endpoint-i Program.cs-də əlavə edin. Lazım olan using sətrlərini unutmayın.
7. `backend/requests.http` ilə əvvəl POST yaradın, ID-ni götürün, DELETE edin, sonra GET ilə yoxlayın. İkinci DELETE 404 qaytarmalıdır.

Yeni feature modelə sahə əlavə edirsə, təkcə endpoint kifayət deyil: backend qovluğunda yeni migration yaradın. Həmçinin `frontend/src/types/todo.ts` tipini, `frontend/src/api/todoApi.ts` sorğusunu və uyğun komponenti dəyişin.

**Tez unudulanlar:** Handler DI qeydiyyatı, MapEndpoint çağırışı, SaveChangesAsync, boş və uzun başlıq yoxlaması, frontend xəta/yüklənmə vəziyyəti və yeni model üçün migration.

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

Bütün backend qısa fayl adları `backend/src/TodoApi/` altındadır. Tam xəritə üçün [icmala](01-layihe-icmali.md) baxın.
