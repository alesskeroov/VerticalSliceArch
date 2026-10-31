# Yeni feature əlavə etmək və lüğət

## Bu sənəd nə üçündür?

Bu sənəd mövcud şablonla yeni funksiyanı necə əlavə edəcəyinizi göstərir. Sondakı lüğət kodda və təlimatda keçən terminləri qısa izah edir.

## A. DeleteOrder əlavə etmək

**Bu, gələcək dəyişiklik üçün reseptdir.** Hazırkı layihədə DeleteOrder faylı, DELETE endpoint-i və FakeDatabase.Remove metodu yoxdur. Aşağıdakı addımlar tamamlandıqda yaranacaqlar. Yeni kod nümunəsi əvəzinə mövcud fayllar istinad kimi göstərilir.

### 1. Mövcud nümunəni oxuyun

`VerticalSliceArch/Features/Orders/GetOrders/GetOrders.cs` faylından başlayın. Slice bir funksiyanın kodunun birlikdə saxlanmasıdır. Bu real kod endpoint ilə handler arasındakı əlaqəni göstərir:

```csharp
app.MapGet("/orders", (Handler handler) => handler.Handle());
```

### 2. Yeni qovluq və fayl yaradın

`VerticalSliceArch/Features/Orders/DeleteOrder/DeleteOrder.cs` yolunu yaradın. Bu yol hazırda mövcud deyil, sizin əlavə edəcəyiniz fayldır. Namespace qovluğa uyğun olaraq `VerticalSliceArch.Features.Orders.DeleteOrder` olsun.

### 3. Eyni şablonu qurun

- Statik `DeleteOrder` qabıq sinfi yaradın.
- İçində adi `Handler` sinfi və `MapEndpoint(WebApplication app)` metodu saxlayın.
- Handler konstruktorunda `FakeDatabase` qəbul edin və sahədə saxlayın.
- `Handle(Guid id)` metodu `IResult`, yəni HTTP cavabını ifadə edən nəticə qaytarsın.
- ID URL-dən gələcək; ayrıca Request record lazım deyil.

**Tez unudulur:** `VerticalSliceArch.Common` ad məkanını əlavə etmək və Handler-i statik etməmək. DI konstruktor vasitəsilə asılılıqları adi Handler obyektinə verir.

### 4. Saxta bazaya silmə əməliyyatı əlavə edin

`VerticalSliceArch/Common/FakeDatabase.cs` daxilində `bool Remove(Guid id)` metodu əlavə edin. Mövcud `Add` və `Find` kimi eyni `syncRoot` üzərində `lock` istifadə edin. ID-yə uyğun sifarişi tapıb silin; silinibsə true, tapılmayıbsa false qaytarın.

**Tez unudulur:** Axtarış və silmə eyni kilid blokunda olmalıdır. Siyahını public edib endpoint-dən birbaşa dəyişməyin.

### 5. Handler və endpoint-i bağlayın

Handler yeni Remove metodunu çağırsın. Uğurlu silmədə `Results.NoContent()` ilə `204`, tapılmayanda `Results.NotFound()` ilə `404` qaytarsın. MapEndpoint daxilində `MapDelete` ilə `/orders/{id:guid}` yolunu qeyd edin və URL-dən gələn ID-ni handler-ə ötürün. `guid` məhdudiyyəti URL hissəsinin Guid formatında olmasını tələb edir.

### 6. Program.cs-də iki qeydiyyatı unutmayın

`VerticalSliceArch/Program.cs` daxilində yeni namespace üçün using əlavə edin. Mövcud handler-lərin yanında `DeleteOrder.Handler` üçün AddTransient qeydiyyatı, endpoint çağırışlarının yanında isə `DeleteOrder.MapEndpoint(app)` çağırışı əlavə edin.

**Tez unudulur:** Təkcə MapEndpoint çağırmaq kifayət etmir; Handler də DI-da qeyd edilməlidir. Yeni silmə funksiyası üçün əlavə Hangfire planı lazım deyil.

### 7. Build və davranışı yoxlayın

1. Kök qovluqda `dotnet build` işlədin.
2. `dotnet run --project VerticalSliceArch --launch-profile http` ilə başladın.
3. `VerticalSliceArch/requests.http` vasitəsilə POST göndərin və cavabdakı ID-ni götürün.
4. Həmin fayla DELETE sorğusu əlavə edin: `http://localhost:5000/orders/` ünvanına ID-ni artırın. `204` gözləyin.
5. GET ilə sifarişin siyahıda olmadığını yoxlayın. Eyni ID-ni yenidən siləndə `404` gözləyin.

Email job-u sifarişi artıq oxuyubsa, silmə onu dayandırmır. Job hələ oxumayıbsa, mövcud SendOrderConfirmation handler-i sifarişi tapmayanda nəticə yazmadan qayıdır.

## B. Lüğət

Cədvəldəki qısa fayl adları yuxarıdakı dəqiq yolları və [icmalın](01-layihe-icmali.md) ağacını nəzərdə tutur. Mövcud olmayan anlayışlar ayrıca göstərilib.

| Termin | Mənası | Layihədə harada görünür? |
| --- | --- | --- |
| Slice / Feature | Bir funksiyanın bir yerdə saxlanan kodu. | Features altındakı dörd feature faylı. |
| Handler | Funksiyanın əsas işini yerinə yetirən sinif. | Hər feature-in içindəki Handler. |
| Request | Müştəridən alınan məlumat modeli. | CreateOrder.cs: Request(string Email, string ProductName). |
| Endpoint | HTTP metodu və URL ilə çağırılan giriş nöqtəsi. | CreateOrder.cs və GetOrders.cs: MapEndpoint. |
| Minimal API | Endpoint-ləri controller olmadan yazmaq üsulu. | MapPost və MapGet çağırışları. |
| Dependency Injection | Asılılıqları obyektə avtomatik vermək üsulu. | Program.cs qeydiyyatları və handler konstruktorları. |
| Singleton | Tətbiq boyu bir obyektin paylaşılması. | Program.cs: AddSingleton<FakeDatabase>(). |
| Transient | DI-dan hər alınmada yeni obyekt yaradılması. | Program.cs: AddTransient qeydiyyatları. |
| Scoped | Eyni xidmət sahəsində bir obyektin paylaşılması; HTTP-də adətən bir sorğu üçündür. | Demoda AddScoped qeydiyyatı yoxdur. |
| Enqueue | İşi icra üçün növbəyə qoymaq. | CreateOrder.cs: backgroundJobs.Enqueue. |
| Fire-and-forget | Çağıranın bitməsini gözləmədiyi arxa plan işi. | SendOrderConfirmation işi; retry edilməyəcəyi demək deyil. |
| Recurring job | Planla təkrarlanan iş. | DailyReport və Program.cs-də daily-report planı. |
| Cron | Vaxt cədvəlini ifadə edən yazılış. | Program.cs: Cron.Minutely(). |
| Dashboard | Job vəziyyətlərini göstərən idarəetmə səhifəsi. | Program.cs: /hangfire. |
| Storage | Job məlumatlarını saxlayan yer. | Program.cs: UseInMemoryStorage(). |
| Serializasiya | Məlumatı saxlanacaq formata çevirmək. | Enqueue zamanı Hangfire order.Id parametrini saxlayır. |
| Idempotent | Təkrar icrada əlavə zərərli nəticə yaratmayan əməliyyat. | Email job-unda təkrar göndərişə qarşı qoruma yoxdur. |
| Thread-safety | Paralel müraciətlərdə məlumatın qorunması. | FakeDatabase.cs: lock (syncRoot). |
| async / await | Tamamlanmanı gözləyən işi axını bloklamadan yazmaq üsulu. | SendOrderConfirmation.cs: await Task.Delay(2000). |
