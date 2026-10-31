# 0001: Frontend dizayn sistemi və animasiya dili

- **Status:** Əvəz olunub — [0002 təklifi ilə](0002-matchday-football-design-system.md); bu təklif heç vaxt qəbul edilməyib
- **Tarix:** 2026-10-31
- **Əlaqəli tapşırıq:** TASK-UI-001
- **Təklif edən:** Jane (Frontend), Soprano (Team Lead)
- **Sənədləşdirən:** Watson (Docs)
- **Təsdiq:** Qəbul edilməyib. İstifadəçinin yeni istiqaməti futbol konseptinin saxlanmasını tələb edir; bu slate/mavi təklif qüvvədə deyil. Tətbiqə başlanmayıb.

## Kontekst

Hazırkı Matchday interfeysi custom CSS və futbol vizualları üzərində qurulub. İstifadəçi mövcud görünüşü dəyişmək, peşəkar, sadə, responsive və əlçatan interfeys istəyir. UI kitabxanası yoxdur. Mövcud To-Do və authentication funksiyalarının saxlanması, backend və API-nin dəyişdirilməməsi tələbdir.

## Qərar təklifi

Bu sənəd qəbul edilmiş qərar deyil. Soprano və Jane aşağıdakı istiqaməti istifadəçiyə təsdiq üçün təqdim edir.

### Texniki baza

Tailwind CSS + Vite inteqrasiyası, yalnız lazım olan shadcn/ui komponentləri və `motion` paketi (`motion/react` importu). Mövcud React 19, TypeScript strict, Vite və API/state qatları saxlanır. Səhifə/route keçidləri mövcud state əsaslı görünüşlərə tətbiq edilir; yeni router, form/state kitabxanası və dekorativ animasiya paketləri əlavə edilmir. Asılılıq dəyişiklikləri yalnız dizayn təsdiqindən və Team Lead review-dan sonra edilir.

### Vizual istiqamət

Matchday adı saxlanır; futbol meydanı zolaqları, dominant hesab tablosu və konfetti əvəzinə sakit slate səthlər, mavi vurğu və tapşırıq yönümlü workspace təklif edilir. Mövcud tamamlanmış/aktiv saylar və həftəlik məqsəd kompakt xülasəyə çevrilir, hesablamalar dəyişmir. Saxta layihə, komanda, naviqasiya və əlavə funksiyalar yaradılmır.

| Token | Açıq rejim | Tünd rejim |
|---|---|---|
| Fon | `#F8FAFC` | `#0B1220` |
| Səth | `#FFFFFF` | `#111827` |
| Əsas mətn | `#0F172A` | `#E5E7EB` |
| İkinci dərəcəli mətn | `#475569` | `#94A3B8` |
| Vurğu / focus | `#2563EB` | `#60A5FA` |
| Vurğu üzərində mətn | `#FFFFFF` | `#0B1220` |
| Dekorativ sərhəd | `#E2E8F0` | `#334155` |
| Input sərhədi | `#64748B` | `#64748B` |

Jane-in hesablama nəticələri: əsas mətn/səth 17.06:1 və 14.33:1, ikinci mətn/səth 7.58:1 və 6.92:1, əsas düymə mətni/vurğu 5.17:1 və 7.36:1, input sərhədi/səth 4.76:1 və 3.73:1. Bu, yalnız göstərilən cütlərin hesablamasıdır; hazır interfeys üçün WCAG uyğunluq sertifikatı deyil. Error/success/disabled/hover kimi bütün vəziyyətlər tətbiqdə ayrıca ölçüləcək. Dekorativ sərhəd input və focus göstəricisi kimi istifadə edilməyəcək.

- **Tipoqrafiya:** lokal Inter latin-ext təklifi, `system-ui` fallback; 14/16/20/28/36px şkala, body line-height 1.5, başlıq 1.15, 400/500/600 çəkilər. `ƏəİıĞğÖöŞşÜüÇç` işarələrinin render-i qəbuldan əvvəl yoxlanacaq.
- **Boşluq:** 4/8/12/16/20/24/32/48/64px.
- **Yuvarlaqlıq:** control 8px, card 12px, auth/əsas panel 16px. Pill yalnız etiket və uyğun filtr üçün.
- **Kölgə:** səth `0 1px 2px rgb(15 23 42 / .04)`, overlay `0 16px 48px rgb(15 23 42 / .12)`; tünd rejimdə ağır kölgə əvəzinə səth və sərhəd fərqi.
- **Ölçülər:** touch target 44–48px; görünən focus 2px, 2px offset. 1040–1120px desktop konteynerdə əsas siyahı və kompakt həftəlik xülasə, mobil ekranda bir sütun.
- **Tema:** ilkin seçim sistem; açıq/tünd/sistem nəzarəti. Yalnız tema seçimi ayrıca saxlanır, auth storage dəyişmir.

### Animasiya dili

| Hadisə | Təklif |
|---|---|
| Səhifə/görünüş keçidi | 180–240ms, opacity və translateY 8px-dən 0-a |
| Siyahının ilkin görünməsi | 180ms, 30ms stagger, ən çox ilk 4 element; toplam maksimum 270ms, sonrakı sətirlərdə əlavə gecikmə yoxdur |
| Hover / press | 150ms, translateY maksimum -1px və scale maksimum 1.01; press scale .98 |
| Scroll ilə görünmə | 200ms, bir dəfə; yalnız ikinci dərəcəli xülasə, əsas idarələr heç vaxt gizlədilmir |
| Loading / empty / error | 180–250ms opacity; skeleton statik bloklar, shimmer gradient animasiyası yoxdur |
| Proqres göstəricisi | `scaleX`; width və layout ölçüləri animasiya edilmir |

Bütün animasiyalar 150–300ms intervalında, `cubic-bezier(.16,1,.3,1)` ease-out ilə yalnız transform və opacity dəyişir. Ölçü, rəng, kölgə, blur və font-size animasiyaları istifadə olunmur. `MotionConfig reducedMotion="user"`, `useReducedMotion` və CSS media fallback ilə travel/stagger söndürülür; skeleton statik qalır. Focus göstəricisi klaviatura istifadəçisinə dərhal görünür.

## Alternativlər

| Alternativ | Qiymətləndirmə |
|---|---|
| Mövcud custom CSS-i yalnız təmizləmək | Az dependency; komponent və animasiya vahidliyini komanda özü saxlamalıdır |
| Tailwind + shadcn/ui + Motion | İstifadəçinin xüsusi tələbinə uyğundur, token/primitiv/keçid sistemi verir; setup və dependency review tələb edir |
| Magic UI / Aceternity / React Bits paketlərini birlikdə əlavə etmək | Bu kiçik tətbiq üçün əlavə asılılıq və fərqli animasiya dilləri yaradar; yalnız ilham kimi nəzərdə tutulur |
| Tam başqa framework və ya tətbiq scaffold-u | Mövcud arxitektura və scope ilə uyğun deyil |

## Nəticələr

Təsdiqlənərsə əvvəl tokenlər və təkrar istifadə olunan primitivlər, sonra To-Do/auth səhifələri, sonda keçidlər və yoxlamalar hazırlanacaq. Risklər: Tailwind Preflight ilə hazır CSS toqquşması, React 19 peer dependency uyğunluğu, həddindən artıq motion və auth baseline-ının itməsi. Bunlar kiçik mərhələlərlə, paket/lockfile review və regression testləri ilə yoxlanacaq. İndiki mərhələdə heç bir paket və kod dəyişdirilməyib.

Əlaqəli sənədlər: [araşdırma](../research/frontend-redesign.md), [tapşırıq və qəbul meyarları](../tasks/TASK-UI-001-frontend-redesign.md).

İmza: **Watson**
