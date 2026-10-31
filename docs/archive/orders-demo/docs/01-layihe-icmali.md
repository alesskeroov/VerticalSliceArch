# Layihə icmalı

## Bu sənəd nə üçündür?

Bu sənəd demonun nə etdiyini və hissələrinin necə əlaqələndiyini göstərir. Kodu oxumağa buradan başlaya bilərsiniz.

## Demo nə edir?

- `POST /orders` sifariş yaradır və saxta email işini növbəyə qoyur.
- `GET /orders` yaddaşdakı bütün sifarişləri qaytarır.
- Arxa plan işi (job) HTTP sorğusundan ayrı icra olunan tapşırıqdır. Email işi 2 saniyə gözləyir və nəticəni konsola yazır; real email göndərmir.
- `DailyReport` hər dəqiqə sifarişlərin sayını konsola yazır.
- `/hangfire` dashboard-u işlərin vəziyyətini göstərən idarəetmə səhifəsidir.

## Texnologiyalar

| Texnologiya | Rolu |
| --- | --- |
| C# və .NET 8 | Modelləri və məntiqi yazmaq, tətbiqi işlətmək üçündür. |
| ASP.NET Core Minimal API | Controller sinifləri yaratmadan HTTP ünvanlarını məntiqə bağlayır. |
| Hangfire.AspNetCore 1.8.25 | Arxa plan serverini və dashboard-u ASP.NET Core-a qoşur. |
| Hangfire.InMemory 1.0.0 | Job məlumatlarını ayrıca baza əvəzinə yaddaşda saxlayır. |
| `List<Order>` | Sifarişləri yaddaşda saxlayan sadə kolleksiyadır. |

Paketlər `VerticalSliceArch/VerticalSliceArch.csproj` faylındadır. MediatR, EF Core, AutoMapper və FluentValidation yoxdur.

## Qovluq quruluşu

Aşağıdakı yollar layihənin kökündən başlayır. Ağac əsas tədris fayllarını göstərir.

```text
README.md
docs/
VerticalSliceArch/
  VerticalSliceArch.csproj
  Program.cs
  requests.http
  Common/
    Order.cs
    FakeDatabase.cs
  Features/
    Orders/
      CreateOrder/
        CreateOrder.cs
      GetOrders/
        GetOrders.cs
    Reports/
      DailyReport/
        DailyReport.cs
      SendOrderConfirmation/
        SendOrderConfirmation.cs
```

`Features` funksiyalara görə bölünüb. Buna Vertical Slice deyilir: bir funksiyanın endpoint-i, daxil olan məlumatı və məntiqi eyni yerdədir. `Orders` HTTP sifariş əməliyyatlarını, `Reports` isə bu demoda iki job-u saxlayır. `Common` ortaq model və saxta bazadır; `docs` izahları saxlayır.

Hər feature statik qabıq sinif və onun içində adi `Handler` sinfi saxlayır. Handler işi yerinə yetirən sinifdir. Yalnız CreateOrder daxil olan məlumat üçün `Request` record saxlayır. Job feature-lərinin `MapEndpoint` metodları şablonu qorumaq üçün var, amma HTTP ünvanı yaratmır.

## POST /orders çağırılanda nə baş verir?

1. `VerticalSliceArch/Features/Orders/CreateOrder/CreateOrder.cs` daxilində `MapEndpoint` POST ünvanını qeyd edir. JSON gövdəsi `Request` modelinə çevrilir.
2. Dependency Injection (DI) lazım olan obyekti və asılılıqlarını avtomatik verir. Endpoint DI-dan aldığı `Handler` obyektinin `Handle` metodunu çağırır.
3. Handler boş email və məhsul adını yoxlayır. Boşdursa `400 Bad Request` qaytarır və job yaratmır.
4. Yeni `Order` yaradılır. `database.Add(order)` onu `VerticalSliceArch/Common/FakeDatabase.cs` daxilindəki siyahıya əlavə edir.
5. Handler `Enqueue` ilə email işini növbəyə qoyur. Real kod parçası:

```csharp
backgroundJobs.Enqueue<SendOrderConfirmation.Handler>(
    handler => handler.Handle(order.Id));
```

6. API `201 Created` və sifarişi qaytarır. Bu cavab email işinin bitdiyini bildirmir; job cavabdan əvvəl və ya sonra başlaya bilər.
7. `VerticalSliceArch/Program.cs` daxilində qoşulan Hangfire serveri işi götürür. `SendOrderConfirmation.Handler` ID ilə sifarişi bazadan tapır, `Task.Delay(2000)` ilə gözləyir və konsola email mətnini yazır.

Sifarişlər və Hangfire məlumatları ayrı yaddaş saxlayıcılarındadır. Tətbiq dayandıqda hər ikisi itir. `DailyReport` planını Program.cs-də `AddOrUpdate` yaradır və ya yeniləyir; `Cron.Minutely()` hər dəqiqəni ifadə edir.

## Tövsiyə edilən oxuma ardıcıllığı

Aşağıdakı yollar `VerticalSliceArch/` qovluğuna nəzərən verilib:

1. `Common/Order.cs` — saxlanan məlumat.
2. `Common/FakeDatabase.cs` — əlavə etmə, oxuma və kilidləmə.
3. `Features/Orders/GetOrders/GetOrders.cs` — ən sadə endpoint və handler.
4. `Features/Reports/SendOrderConfirmation/SendOrderConfirmation.cs` — email işi.
5. `Features/Orders/CreateOrder/CreateOrder.cs` — sorğu, sifariş və job əlaqəsi.
6. `Features/Reports/DailyReport/DailyReport.cs` — təkrarlanan işin məntiqi.
7. `Program.cs` — bütün hissələrin qoşulması.

İşə salma əmrləri kökdəki [README.md](../README.md), nümunə sorğular isə [requests.http](../VerticalSliceArch/requests.http) faylındadır.
