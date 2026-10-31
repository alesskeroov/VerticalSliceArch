# Vertical Slice və Hangfire demosu

Vertical Slice kodu texniki qatlara deyil, funksionallığa görə bölür.
Məsələn, sifariş yaratmaq üçün request, handler və endpoint eyni fayldadır.
Beləliklə bir funksiyanı anlamaq üçün müxtəlif qatlar arasında gəzmək lazım deyil.
Common yalnız feature-lərin paylaşdığı model və saxta bazanı saxlayır.

## Qovluqlar və oxuma ardıcıllığı

Bütün C# faylları `VerticalSliceArch/` qovluğundadır:

1. `Common/Order.cs`: sadə sifariş modeli.
2. `Common/FakeDatabase.cs`: singleton `List<Order>`; paralel müraciətlər üçün `lock`.
3. `Features/Orders/GetOrders/GetOrders.cs`: GET /orders və oxuma məntiqi.
4. `Features/Reports/SendOrderConfirmation/SendOrderConfirmation.cs`: saxta email job-u.
5. `Features/Orders/CreateOrder/CreateOrder.cs`: POST /orders və Enqueue.
6. `Features/Reports/DailyReport/DailyReport.cs`: sifarişlərin sayını yazan job.
7. `Program.cs`: DI, Hangfire, endpoint-lər və təkrarlanan plan.

Statik feature sinfi sadəcə hissələri bir yerdə saxlayan qabıqdır.
İçindəki adi Handler sinfini DI (asılılıqların avtomatik verilməsi) yaradır.
Request record yalnız daxil olan məlumat lazım olduqda var.
Job feature-lərində MapEndpoint qəsdən boşdur: eyni şablonu göstərir,
amma HTTP ünvanı yaratmır; handler-i Hangfire çağırır.

## İşə salmaq

.NET 8 və ya daha yeni SDK, ilk build zamanı paketlər üçün internet lazımdır.
Layihə .NET 8-i hədəfləyir; işlətmək üçün .NET 8 ASP.NET Core runtime da olmalıdır.
Repo kökündə terminal açın:

```sh
dotnet build
dotnet run --project VerticalSliceArch --launch-profile http
```

API: http://localhost:5000/orders
Dashboard: http://localhost:5000/hangfire
Dayandırmaq üçün Ctrl+C basın. Sifarişlər və job tarixçəsi yenidən başlayanda silinir.
Əlavə retry, queue, filter və authorization tənzimləməsi yoxdur.
Hangfire-in standart retry davranışı qalır; dashboard standart olaraq yerli sorğuları qəbul edir.

## Sorğuları yoxlamaq

Başqa terminalda (PowerShell-də `curl` əvəzinə `curl.exe` yazın):

```sh
curl -i -X POST http://localhost:5000/orders -H "Content-Type: application/json" -d '{"email":"leyla@example.com","productName":"Kitab"}'
curl -i http://localhost:5000/orders
```

PowerShell üçün JSON-u standart girişlə ötürmək rahatdır:

```powershell
'{"email":"leyla@example.com","productName":"Kitab"}' | curl.exe -i http://localhost:5000/orders -H "Content-Type: application/json" --data-binary '@-'
curl.exe -i http://localhost:5000/orders
```

POST `201 Created` və yaradılmış sifarişi, GET `200 OK` və siyahını qaytarır.
İlk GET boş siyahı (`[]`) qaytarır. Boş email və ya məhsul adı `400` qaytarır;
bu demo tam email formatı yoxlaması etmir.
`VerticalSliceArch/requests.http` faylını dəstəkləyən redaktorda da sorğuları göndərə bilərsiniz.

## Konsol və dashboard

POST işi növbəyə qoyur və emaili gözləmədən cavab verir. Worker job-u götürdükdən
sonra job 2 saniyə gözləyib `Email göndərildi: leyla@example.com, sifariş: ...` yazır.
Bu saxta emaildir: real email xidməti yoxdur.
Job-a yalnız ID ötürülür, çünki Hangfire parametrləri serializasiya edib saxlayır;
handler sifarişin məlumatını ortaq bazadan oxuyur.

DailyReport adı gündəlik hesabatı təmsil edir, amma demo üçün `Cron.Minutely()`
ilə hər dəqiqə işləyir: `Hesabat: hazırda 1 sifariş var.`
İlk hesabat üçün növbəti dəqiqəni və worker-in işi götürməsini gözləyin.
Tətbiq açıq qalmalıdır ki, server job-ları icra edə bilsin.

Dashboard-da **Jobs / Succeeded** bölməsində email və hesabat işlərini,
**Recurring Jobs** bölməsində `daily-report` və `* * * * *` planını görəcəksiniz.
**Servers** bölməsində işləyən server görünür. `AddOrUpdate` eyni ID-li planı
hər başlanğıcda yeniləyir, yeni dublikat plan yaratmır.

## Yeni feature necə əlavə etməli

Məsələn, DeleteOrder əlavə etmək üçün:

1. `Features/Orders/DeleteOrder/DeleteOrder.cs` yaradın.
2. İçində `public static class DeleteOrder` və adi `Handler` sinfi yaradın.
3. Handler konstruktorunda FakeDatabase qəbul edin; Handle(Guid id) metodu yazın.
   ID URL-dən gəldiyi üçün ayrıca Request record lazım deyil.
4. FakeDatabase-ə kilid daxilində ID ilə silən `bool Remove(Guid id)` metodu əlavə edin.
5. Handle daxilində silinibsə `Results.NoContent()`, tapılmayıbsa `Results.NotFound()` qaytarın.
6. MapEndpoint daxilində `app.MapDelete("/orders/{id:guid}",
   (Guid id, Handler handler) => handler.Handle(id));` yazın.
7. Program.cs-də namespace-i əlavə edin, `AddTransient<DeleteOrder.Handler>()`
   qeydiyyatını və `DeleteOrder.MapEndpoint(app)` çağırışını əlavə edin.
8. requests.http-ə DELETE sorğusu əlavə edin; POST ilə yaradılan ID-ni istifadə edin,
   sonra GET ilə sifarişin silindiyini yoxlayın. Email job-u artıq başlayıbsa,
   silmək onun göndərişini ləğv etmir; bu demo sadə saxlanıb.

## İstinadlar

- [Hangfire: təkrarlanan işlər](https://docs.hangfire.io/en/latest/background-methods/performing-recurrent-tasks.html)
- [Hangfire: parametrlərin ötürülməsi](https://docs.hangfire.io/en/latest/background-methods/passing-arguments.html)

## Əlavə sənədlər

- [01 — Layihə icmalı](docs/01-layihe-icmali.md)
- [02 — Texniki qərarlar](docs/02-qerarlar.md)
- [03 — Sonra araşdırılacaq mövzular](docs/03-sonra-arasdirilacaq-movzular.md)
- [04 — Yeni feature əlavə etmək və lüğət](docs/04-yeni-feature-elave-etme-ve-lugət.md)
