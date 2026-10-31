# Texniki qərarlar

## Bu sənəd nə üçündür?

Bu qısa ADR-lər seçilən həlləri və onların məhdudiyyətlərini qeyd edir. ADR texniki qərarın səbəb və nəticəsinin yazılı qeydidir.

| Qərar | Səbəb | Alternativ | Nəticə |
| --- | --- | --- | --- |
| Vertical Slice və hər feature üçün tək fayl | Bir funksiyanı bir yerdə oxumaq | Controller / Service / Repository qatları | Kiçik funksiya aydındır; böyüyən fayl sonradan bölünə bilər. |
| Birbaşa Handler çağırışı | Əlavə yönləndirmə kitabxanası olmasın | MediatR | İcra yolu aydındır; ortaq pipeline hazır deyil. |
| EF Core + SQL Server | İstifadəçinin yerli Revan serveri və daimi məlumat tələbi | SQLite və ya yaddaşdakı siyahı | Məlumat restartdan sonra qalır; server və Windows giriş icazəsi lazımdır. |
| Code First və migration | Model və sxem dəyişiklikləri mənbə kodunda izlənir | EnsureCreated və ya Database First | Təkrarlana bilən sxem var; migration-lar nəzərdən keçirilməlidir. |
| Açılışda MigrateAsync | Yeni başlayan üçün ayrıca baza yaratma addımı olmasın | Yayımlama zamanı ayrıca migration | Yerli işə salma rahatdır; real sistem üçün ayrıca yerləşdirmə addımı daha idarəolunandır. |
| Hangfire.InMemory | Job infrastrukturu sadə qalsın | SQL əsaslı Hangfire storage | SQL todo-ları qalır, amma job növbəsi restartda itir. |
| Job-a yalnız Guid ID | Kiçik serializasiya və modeldən az asılılıq | Bütöv Todo və ya başlıq parametr kimi | İş cari bazanı oxuyur; arada silinmiş todo üçün bildiriş verilmir. |
| Dashboard yalnız Development-də | Yerli müşahidə rahat olsun | İstifadəçi və rol əsaslı giriş | Xüsusi giriş nəzarəti yoxdur; real yayım üçün ayrıca təhlükəsizlik lazımdır. |
| React useState/useEffect və fetch | Az kitabxana ilə öyrənmək | State və sorğu kitabxanaları | Sadə idarəetmə; avtomatik cache və server dəyişiklikləri ilə sinxronlaşma yoxdur. |

## Kodda harada görünür?

`backend/src/TodoApi/Program.cs` DI qeydiyyatlarını, SQL Server qoşulmasını, migration tətbiqini və Development şərtini saxlayır.
`backend/src/TodoApi/Common/AppDbContext.cs` model qaydasını, `Migrations` qovluğu sxem tarixçəsini saxlayır.
`backend/src/TodoApi/Features/Todos/CreateTodo/CreateTodo.cs` əvvəl bazaya yazır, sonra Enqueue edir.
`frontend/src/App.tsx` bütün todo-ları saxlayıb görünən siyahını filtrdən hesablayır.

## Bilinən sərhədlər

- SQL yazılması və job-un növbəyə qoyulması vahid əməliyyat deyil. Enqueue alınmasa todo artıq bazada ola bilər.
- Toggle təkrar çağırılanda vəziyyəti yenidən dəyişir. Şəbəkə xətasında onu kor-koranə təkrar göndərmək düzgün deyil.
- Cleanup job-u serverdə işləyir; açıq brauzerdə avtomatik yeniləmə yoxdur. Səhifəni yeniləmək cari siyahını gətirir.
- DbContext singleton deyil. Bir context-i paralel sorğular və job-lar arasında paylaşmaq olmaz.
- Yerli qoşulmada TrustServerCertificate seçilib. Real sertifikat və yerləşdirmə ayarları bu demonun mövzusu deyil.

## Futbol temalı dizayn

- **Qərar:** Matchday konsepti, tək yaşıl vurğu, lokal Barlow Condensed başlıqları və öz inline SVG ikonlarımız seçildi.
- **Səbəb:** Yaşıl rəng meydanı xatırladır. Dar şrift hesab tablosunu vurğulayır, amma yalnız başlıq və rəqəmlərdə işlənir ki, tapşırıq mətnləri rahat oxunsun.
- **Alternativ:** Əvvəlki neytral sistem dizaynı və ya tam oyun üslubu saxlanıla bilərdi.
- **Nəticə:** Enerjili görünüşlə sadə siyahı quruluşu birlikdə qalır. Klub/liqaya aid loqo yoxdur: tətbiq müstəqildir və real futbol brendi kimi təqdim edilmir.
- **Sərhəd:** Həftəlik hədəf frontend-də, yerli bazar ertəsi sərhədi və completedAt əsasında hesablanır. Silinmiş tapşırıqlar üçün ayrıca tarixçə və yeni endpoint yaradılmır.
