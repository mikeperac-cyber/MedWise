# MedWise — mimari turu

Bu belge kodun nasıl düzenlendiğini ve neden öyle düzenlendiğini anlatır.
Projenin ne yapmaya çalıştığı ve ölçülen sonuçlar için [README.md](README.md).

---

## 1. Sayfa başına bağımsız belge

Uygulama tek sayfalık bir hash yönlendiricisiydi (`#/kokpit`, `#/ansiklopedi`
…): altı görünüm tek bir `index.html` içinde duruyor, `router.ts` hangisinin
görüneceğini `hidden` sınıfıyla ayarlıyordu. Artık altı ayrı HTML belgesi var.

| Belge                | Yol              | Giriş noktası                |
| -------------------- | ---------------- | ---------------------------- |
| `index.html`         | `/`              | `src/pages/cockpit.ts`       |
| `ansiklopedi.html`   | `/ansiklopedi`   | `src/pages/encyclopedia.ts`  |
| `etkilesim.html`     | `/etkilesim`     | `src/pages/interactions.ts`  |
| `kronobiyoloji.html` | `/kronobiyoloji` | `src/pages/chronobiology.ts` |
| `yapay-zeka.html`    | `/yapay-zeka`    | `src/pages/ailab.ts`         |
| `portfolyo.html`     | `/portfolyo`     | `src/pages/portfolio.ts`     |

Kazanç: her sayfanın kendi URL'si, kendi `<title>`'ı ve kendi JavaScript paketi
var. Kronobiyoloji sayfası kendi kodundan 1.6 kB indirir; ansiklopedinin 23.9 kB
monograf oluşturucusunu indirmez.

### Ortak arayüz nasıl paylaşılıyor

Başlık, altbilgi ve pencereler tek kopya hâlinde `partials/` altında durur.
`vite.config.ts` içindeki yaklaşık 40 satırlık `htmlIncludes` eklentisi,
derleme sırasında `<!--@include partials/header.html -->` yönergelerini çözer.

Sonuç **statik** HTML'dir: ortak arayüz sunucudan gelen belgenin içindedir,
tarayıcı onu sonradan çizmez. İstemci tarafında şablon motoru yoktur.

Etkin sekme `<body data-route="...">` özniteliğinden okunur; kabuk bunu okuyup
ilgili bağlantıya `aria-current="page"` ve vurgu sınıflarını uygular.

---

## 2. Dizin düzeni

```
partials/                 ortak başlık, altbilgi, pencereler (tek kopya)
  header.html             üst çubuk + mobil sekme şeridi
  footer.html             altbilgi
  overlays.html           BYOK penceresi, sorumluluk reddi, bildirim yığını
  cockpit-overlays.html   yalnızca kokpitte kullanılan "özel doz" penceresi

src/pages/
  *.page.html             her sayfanın kendi içeriği (main içine gömülür)
  *.ts                    her sayfanın giriş noktası — ince, yalnızca bağlar

src/shell/shell.ts        gezinme vurgusu, pencereler + odak tuzağı,
                          bildirimler, BYOK anahtarı, JSON yedekleme

src/features/
  drugData.ts             veri kümesini yükler (her sayfa bunu kullanabilir)
  encyclopedia.ts         arama + monograf oluşturucu
  cockpit.ts              dozlar, uyum halkası, su, PRN
  interactionLab.ts       ilaç seçim listesi ve etkileşim sonuçları
  chronoBoard.ts          zamanlama kartı ve ilaç seçici
  portfolioReport.ts      canlı ölçüm raporu + klinik vakalar
  aiLab.ts                BYOK paneli

src/utils/
  readability.ts          Ateşman + Bezirci-Yılmaz okunabilirlik ölçümü
  provenance.ts           kayıt başına kaynak doğrulaması
  plainLanguage.ts        ATC sınıfından sade Türkçe özet
  clinical.ts             uyum hesabı, Türkçe arama normalizasyonu

src/services/
  ai.ts                   sağlayıcı çağrıları (yerel yedek motor YOK)
  interactions.ts         etkileşim çözümleme motoru
  storage.ts              localStorage okuma/yazma, seri hesabı
```

`drugData.ts` neden `encyclopedia.ts`'ten ayrı: etkileşim, kronobiyoloji ve
portföy sayfaları yalnızca veri kümesine ihtiyaç duyuyor. Yükleyici
ansiklopedinin içinde kaldığında bu üç sayfa monograf oluşturucusunu da paketine
çekiyordu — sayfa başına DOM sözleşmesi testi bunu yakaladı.

---

## 3. Veri katmanı ve dürüstlük kuralları

Veri kümesindeki 593 kaydın 537'sinin ATC, NDC ve TİTCK numaraları
`scripts/generate_drugs.mjs` tarafından bir döngü sayacından üretilmiştir
(ayrıntı: [README.md](README.md)). Kod bu gerçeği üç yerde uygular:

1. `provenance.ts` her kaydı ATC kodunun biçimine bakarak `verified` veya
   `unverified` diye sınıflar.
2. Monograf, doğrulanamayan kayıtlarda kırmızı bir uyarı bandı çizer ve üç
   tanımlayıcıyı da üstü çizili, "(üretilmiş değer)" etiketli gösterir.
3. `plainLanguage.ts`, doğrulanamayan bir kayıt için özet üretmeyi **reddeder**
   ve `null` döner. Uydurma bir sınıf kodundan hastaya "bu ilaç şuna yarar"
   demek, hiçbir şey dememekten kötüdür.

---

## 4. Arayüz katmanlaması

Monograf ve etkileşim sonuçları iki katmanlıdır:

- **Üstte** sade Türkçe: "Bu ilaç kolesterolü iki ayrı yoldan düşürür."
- **Altta**, `<details>` içinde: "Neden? Teknik açıklamayı göster" — HMG-CoA
  redüktaz ve CYP3A4 metni olduğu gibi durur.

Hiçbir teknik metin silinmedi. Hasta okuyabildiğini okur, isteyen mekanizmayı
açar. Ansiklopedi ayrıca tabletin fiziksel görünüşünü (renk, ebat, baskı kodu)
molekül diyagramının üstüne taşır: ilacını tanıyamayan biri onu isminden değil,
görünüşünden tanır.

---

## 5. Kaldırılanlar

| Ne                                          | Neden                                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------------- |
| `app.js`, `style.css` (kök dizin)           | Vite + TypeScript + Tailwind boru hattına taşındı                                 |
| `src/main.ts` (1443 satır), `src/router.ts` | Kabuk + özellik modülleri + altı sayfa girişi ile değiştirildi                    |
| Yerel "klinik sentez motoru"                | Anahtar kelimeye bakan beş dallı `if/else` idi; hazır metni analiz gibi sunuyordu |
| Başlangıç verisi (`streak: 14`, 2100 ml)    | Yeni kullanıcıya hak etmediği iki haftalık uyum gösteriyordu                      |
| "917.964 indekslenmiş formülasyon" rozeti   | Kayıt sayısı 1548 ile çarpılıyordu; artık gerçek sayı yazıyor                     |

---

## 6. Testler

`tests/dom.test.ts` — sayfa başına DOM sözleşmesi. Her sayfanın
`@include`'larını Vite eklentisiyle aynı şekilde çözer, o sayfanın içe aktarma
grafiğini yürür ve kodun `byId(...)` ile eriştiği her elementin o sayfanın
işaretlemesinde bulunduğunu doğrular. Ayrıca işaretlemedeki her satır içi
`onclick` işleyicisinin o sayfa tarafından `window`'a bağlandığını kontrol eder.
Çok sayfalı mimarinin tipik hatası budur: bir sayfada çalışan kod, açmadığınız
başka bir sayfada sessizce ölüdür.

`tests/dataQuality.test.ts` — okunabilirlik formülleri, kaynak sınıflandırması
ve sade dil katmanının kapsama/reddetme davranışı.
