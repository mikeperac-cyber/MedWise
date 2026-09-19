# MedWise

İlacını anlamakta zorlanan insanlar için yazılmış bir ilaç rehberi ve doz takip
uygulaması. Türkçe arayüz, altı bağımsız sayfa, tamamen tarayıcıda çalışır.

**Bu proje ne yapmaya çalışıyor:** Dünya Sağlık Örgütü, gelişmiş ülkelerde kronik
hastalığı olan hastaların uzun süreli tedaviye uyumunun ortalama %50 civarında
olduğunu bildiriyor (WHO, _Adherence to Long-Term Therapies_, 2003). Bu
uyumsuzluğun bir bölümü unutkanlık değil, **anlamamaktır**. Hastaya verilen metin
çoğu zaman hastanın okuyabileceği bir metin değildir. MedWise o boşluğu önce
**ölçer**, sonra kapatmayı dener.

---

## Ölçülen sonuç

Her sayı canlı veri kümesinden hesaplanır (`npm run measure:readability`), koda
gömülü değildir. Okunabilirlik için iki yayımlanmış Türkçe formülü kullanılıyor:
**Ateşman (1997)** (0-100, yüksek = kolay) ve **Bezirci-Yılmaz (2010)** (gereken
eğitim yılı). Türkçede her hece tam olarak bir sesli harf içerdiği için hece
sayımı tahmin değil, kesin bir işlemdir.

| Metin katmanı                             | Kayıt | Ateşman ortancası | Bandlar                      |
| ----------------------------------------- | ----- | ----------------- | ---------------------------- |
| Teknik açıklamalar (tümü)                 | 593   | **1.65**          | 558 çok zor, 31 zor, 4 orta  |
| Teknik açıklamalar (doğrulanmış alt küme) | 56    | **33.86**         | çoğunluk zor                 |
| **Sade dil katmanı**                      | 56    | **77.15**         | 44 kolay, 7 çok kolay, 0 zor |

Uygulama: [`src/utils/readability.ts`](src/utils/readability.ts).

**Bu ölçümün söylemediği şey:** metnin okunabilir olduğunu gösterir, hastanın onu
_anladığını_ göstermez. Bunu iddia edebilmek için gerçek kullanıcılarla anlama
testi gerekir. Proje henüz o aşamada değil.

---

## Veri kaynağı uyarısı (önemli)

`public/drugs.json` içindeki **593 kaydın 537'sinin ATC, NDC ve TİTCK numaraları
gerçek değildir.** Bu tanımlayıcılar, veri kümesini 10 kayıttan 593 kayda çıkaran
[`scripts/generate_drugs.mjs`](scripts/generate_drugs.mjs) betiği tarafından bir
döngü sayacından üretilmiştir. İlaç **adları** gerçektir; sınıf kodları değildir.

Örnek: lisinopril gerçek bir ACE inhibitörüdür ve gerçek ATC kodu `C09AA03`'tür.
Veri kümesi ise `N02A11` diyor — bu geçerli bir ATC kodu bile değil.

Uygulama bu kayıtları gizlemiyor. Bunun yerine:

- Her monografın başında kaydın doğrulanıp doğrulanmadığını yazan bir bant var.
- Doğrulanamayan kayıtlarda üç tanımlayıcı da üstü çizili ve "(üretilmiş değer)"
  etiketli gösteriliyor.
- Doğrulanamayan kayıtlar için **sade dil özeti üretilmiyor.** Uydurma bir sınıf
  kodundan hastaya "bu ilaç şuna yarar" demek, hiçbir şey dememekten kötüdür.
- Doğrulanmış kayıtlarda WHO ATC, FDA NDC ve TİTCK KÜB arama bağlantıları var.
  Bunlar birer **kontrol noktası**, birer kaynak gösterimi değil: kimse tek tek
  doğrulamadı.

Mantık: [`src/utils/provenance.ts`](src/utils/provenance.ts).

---

## Sayfalar

Altı ayrı HTML belgesi. Tek sayfalık hash yönlendirmesi kaldırıldı; her sayfanın
kendi URL'si, kendi `<title>`'ı ve kendi JavaScript paketi var.

| Sayfa              | Yol              | Ne yapar                                                              |
| ------------------ | ---------------- | --------------------------------------------------------------------- |
| Doz Kokpiti        | `/`              | Bugünkü dozlar, uyum halkası, su takibi, gerektiğinde alınanlar       |
| İlaç Ansiklopedisi | `/ansiklopedi`   | Önce tabletin görünüşü, sonra sade dil özeti, en altta teknik ayrıntı |
| Çapraz Etkileşim   | `/etkilesim`     | İki veya daha fazla ilacın birbirini etkileyip etkilemediği           |
| Kronobiyoloji      | `/kronobiyoloji` | Hangi ilacın günün hangi saatinde alındığında daha iyi çalıştığı      |
| BYOK AI Lab        | `/yapay-zeka`    | Kendi API anahtarınızla çalışan isteğe bağlı çalışma alanı            |
| Akademik Portföy   | `/portfolyo`     | Yöntem, ölçümler, veri denetimi, klinik vakalar                       |

### Sayfa mimarisi

Ortak başlık, altbilgi ve pencereler tek kopya hâlinde `partials/` altında durur
ve derleme sırasında `<!--@include ... -->` yönergesiyle her sayfaya gömülür
([`vite.config.ts`](vite.config.ts) içindeki küçük eklenti). Yani ortak arayüz
sunulan HTML'in içindedir; tarayıcı onu sonradan çizmez.

```
partials/               ortak başlık, altbilgi, pencereler
src/pages/*.page.html   her sayfanın kendi içeriği
src/pages/*.ts          her sayfanın giriş noktası (ince)
src/features/           sayfa davranışları
src/shell/              gezinme, pencereler, bildirimler, BYOK, yedekleme
src/utils/              okunabilirlik, kaynak denetimi, sade dil, klinik hesap
```

---

## Yapay zeka paneli hakkında

Önceki sürümde anahtar girilmediğinde devreye giren bir "yerel klinik sentez
motoru" vardı. Gerçekte bu, anahtar kelimelere bakan beş dallı bir `if/else`
bloğuydu ve kullanıcıya hazır metni üretilmiş klinik analiz gibi sunuyordu —
saat vererek doz talimatı dâhil.

**Kaldırıldı.** Artık anahtar yoksa panel kapalıdır ve bunu açıkça söyler. Yedek
motor yoktur. Anahtar girildiğinde istek doğrudan sizin seçtiğiniz sağlayıcıya
gider; anahtar yalnızca tarayıcınızda saklanır, hiçbir MedWise sunucusuna
gönderilmez (MedWise'ın sunucusu yoktur). Sorunuz ise sağlayıcıya gider — bu
paneli kullanmak, o şirkete metin göndermek demektir.

---

## Gizlilik

Sunucu yok, hesap yok, telemetri yok. Doz listeniz ve ayarlarınız yalnızca
tarayıcınızın `localStorage`'ında durur. Verinizi JSON olarak indirip geri
yükleyebilirsiniz. Tek istisna yukarıda anlatılan BYOK panelidir.

---

## Kurulum

Node.js 20+ ve npm 9+ gerekir.

```bash
npm install
npm run dev
```

`http://localhost:5173` adresini açın.

### Komutlar

| Komut                         | Açıklama                                                 |
| ----------------------------- | -------------------------------------------------------- |
| `npm run dev`                 | Geliştirme sunucusu                                      |
| `npm run build`               | Tip denetimi + altı sayfayı `dist/` içine derler         |
| `npm run preview`             | Derlenmiş çıktıyı yerelde önizler                        |
| `npm test`                    | Testleri izleme modunda çalıştırır                       |
| `npm run test:run`            | Testleri bir kez çalıştırır                              |
| `npm run typecheck`           | `tsc --noEmit`                                           |
| `npm run lint`                | ESLint                                                   |
| `npm run format`              | Prettier                                                 |
| `npm run measure:readability` | Okunabilirlik ve kaynak raporunu `analysis/` içine yazar |
| `npm run build:analyze`       | Paket boyutu görselleştirmesi                            |

---

## Testler

96 test, 7 dosya. İki tanesi sıradan birim testinden fazlası:

- [`tests/dom.test.ts`](tests/dom.test.ts) — **sayfa başına DOM sözleşmesi.** Her
  sayfanın `@include`'larını çözer, o sayfanın içe aktarma grafiğini yürür ve
  kodun eriştiği her elementin o sayfanın işaretlemesinde gerçekten bulunduğunu
  doğrular. Çok sayfalı yapının getirdiği "kokpitte çalışıyor, kronobiyolojide
  sessizce ölü" hatasını yakalayan test budur; bu yeniden yapılandırma sırasında
  altı gerçek hata yakaladı.
- [`tests/dataQuality.test.ts`](tests/dataQuality.test.ts) — okunabilirlik
  formüllerini, kaynak sınıflandırmasını ve sade dil katmanının doğrulanamayan
  kayıtları tarif etmeyi **reddettiğini** doğrular.

---

## Bilinen sınırlar

- 537 kaydın tanımlayıcıları uydurma (yukarıya bakın). Doğru çözüm, bunları TİTCK
  KÜB ve FDA etiketlerinden tek tek doğrulamaktır; yapılmadı.
- Sade dil özetleri yalnızca 56 doğrulanmış kaydı kapsıyor.
- Hiçbir gerçek kullanıcıyla anlama testi yapılmadı.
- Erişilebilirlik iyileştirildi (atlama bağlantısı, odak tuzağı, `aria` etiketleri,
  görünür odak halkası) ama ekran okuyucuyla uçtan uca test edilmedi.

---

## Klinik sorumluluk reddi

MedWise teşhis koymaz ve tedavi önermez. Bir çalışma ve hatırlatma aracıdır.
İlaç veya doz değişikliği için hekiminize ya da eczacınıza danışın.
Acil zehirlenme: **114**.
