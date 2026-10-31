# Texniki qərarlar

## Bu sənəd nə üçündür?

Bu sənəd mövcud kodun niyə sadə qurulduğunu izah edir. ADR texniki seçimi, səbəbini və nəticəsini qeyd edən qısa qərar sənədidir.

Bütün qərarlar hazırkı demoya aiddir. Alternativlər layihədə tətbiq olunmayıb.

## 1. Vertical Slice arxitekturası

- **Qərar:** Kod funksiyalara görə bölünüb: `VerticalSliceArch/Features/Orders` və `VerticalSliceArch/Features/Reports`.
- **Səbəb:** Bir funksiyanı anlamaq üçün çoxlu texniki qat arasında gəzməmək.
- **Alternativlər:** Controller, Service və Repository qovluqlarına görə qatlı quruluş.
- **Nəticə:** Funksiya bir yerdə oxunur. Layihə böyüdükcə təkrarlanan kodu nə vaxt paylaşmaq barədə ayrıca qərar lazım ola bilər.

## 2. MediatR istifadə edilmir

- **Qərar:** Endpoint birbaşa `Handler.Handle` çağırır. Nümunə: `VerticalSliceArch/Features/Orders/GetOrders/GetOrders.cs`.
- **Səbəb:** Əlavə yönləndirmə mexanizmi olmadan sorğunun yolunu görmək.
- **Alternativlər:** MediatR — sorğunu uyğun handler-ə yönləndirən kitabxana.
- **Nəticə:** Daha az kitabxana və dolayı çağırış var. Bütün handler-lər üçün ortaq yoxlama və ölçmə mexanizmi hazır deyil.

## 3. EF Core əvəzinə FakeDatabase

- **Qərar:** `VerticalSliceArch/Common/FakeDatabase.cs` daxilində gizli `List<Order>` var. `VerticalSliceArch/Program.cs` onu singleton qeyd edir: tətbiq boyu bir obyekt paylaşılır.
- **Səbəb:** Baza qurulması və bağlantı ayarları olmadan öyrənmək.
- **Alternativlər:** EF Core vasitəsilə SQL Server və ya PostgreSQL-də saxlamaq. EF Core C# obyektləri ilə verilənlər bazası arasında işləyən kitabxanadır.
- **Nəticə:** Dərhal işləyir, amma məlumat dayanıqlı deyil və ayrı tətbiq nüsxələri arasında paylaşılmır. Paralel müraciətlər `lock` ilə qorunur; bu, real bazanı əvəz etmir.

## 4. Hangfire.InMemory saxlayıcısı

- **Qərar:** Program.cs-də real qoşulma:

```csharp
builder.Services.AddHangfire(configuration => configuration.UseInMemoryStorage());
```

- **Səbəb:** Job-ları öyrənərkən ayrıca storage, yəni iş məlumatlarının saxlandığı xidmət qurmamaq.
- **Alternativlər:** Hangfire üçün SQL Server və ya PostgreSQL saxlayıcısı və uyğun paketlər.
- **Nəticə:** Quraşdırma sadədir. Tətbiq bağlananda növbə və tarixçə itir; bu məlumatlar sifariş siyahısından ayrıca saxlanır.

## 5. Hər feature bir fayldadır

- **Qərar:** Məsələn, `VerticalSliceArch/Features/Orders/CreateOrder/CreateOrder.cs` statik `CreateOrder`, `Request`, `Handler` və `MapEndpoint` saxlayır.
- **Səbəb:** Başlanğıc səviyyədə təkrarlanan quruluşu aydın görmək.
- **Alternativlər:** Request, handler və endpoint-i eyni feature qovluğunda ayrı fayllara bölmək.
- **Nəticə:** Kiçik funksiya rahat oxunur. Böyük feature üçün fayl uzana bilər. Job-larda HTTP ünvanı olmadığı üçün `MapEndpoint` boşdur; yalnız şablonun eyniliyini qoruyur.

## 6. Job-a yalnız orderId ötürülür

- **Qərar:** CreateOrder `Guid` tipli `order.Id` ötürür. `VerticalSliceArch/Features/Reports/SendOrderConfirmation/SendOrderConfirmation.cs` sifarişi `database.Find(orderId)` ilə oxuyur.
- **Səbəb:** Serializasiya məlumatın saxlanacaq formata çevrilməsidir; kiçik ID-ni saxlamaq bütöv obyektə bağlılığı azaldır.
- **Alternativlər:** Email və ID-ni ayrıca ötürmək və ya bütöv sifariş obyektini saxlamaq.
- **Nəticə:** Parametr sadədir və məlumat icra zamanı oxunur. Sifariş tapılmasa handler səssiz qayıdır; real sistemdə bu hal ayrıca qiymətləndirilməlidir.

## 7. Dashboard üçün xüsusi authorization yoxdur

- **Qərar:** Program.cs yalnız `app.UseHangfireDashboard("/hangfire");` çağırır. Authorization giriş icazəsinin yoxlanmasıdır; layihədə xüsusi istifadəçi və rol yoxlaması yazılmayıb.
- **Səbəb:** Yerli demoda job-ları əlavə giriş qurulması olmadan görmək.
- **Alternativlər:** İstifadəçi girişi və rol əsasında dashboard-a icazə vermək.
- **Nəticə:** Yerli öyrənmə rahatdır. Bu, dashboard-un bütün internetə açıq olması demək deyil: Hangfire-in standart yerli sorğu məhdudiyyəti qalır. Real yayımdan əvvəl ayrıca giriş nəzarəti qurulmalıdır.
