# MedWise - Klinik Farmakoterapi & Doz Takip Sistemi

Kullanıcının ilettiği referans Bento Grid görseli, tasarım ilkeleri ve tüm gereksinimler doğrultusunda geliştirilen **MedWise**; Türkiye ve ABD ilaç veri tabanı, etkileşimli doz kokpiti, sıvı ve PRN takibi, günlük sağlık motivasyonu ve BYOK (Kendi Anahtarını Getir) Yapay Zeka laboratuvarını 4 bağımsız dosyada (`index.html`, `style.css`, `drugs.json`, `app.js`) sunmaktadır.

---

## 1. Mimari ve Dosya Yapısı

| Dosya | Boyut | Açıklama |
|---|---|---|
| [index.html](file:///c:/Users/mike/OneDrive/Desktop/Portfolio/MedWise/index.html) | ~48 KB | Bento Grid düzeni, header, sol kokpit, orta monograf alanı, sağ yapay zeka & motivasyon paneli, modal diyalogları. |
| [style.css](file:///c:/Users/mike/OneDrive/Desktop/Portfolio/MedWise/style.css) | ~4 KB | Özel renk paleti (#bb000f, #291714, #fff8f7), tipografi ayarları, animasyonlar, parıltı efektleri ve yazdırma (print) stilleri. |
| [drugs.json](file:///c:/Users/mike/OneDrive/Desktop/Portfolio/MedWise/drugs.json) | ~26 KB | Türkiye (TİTCK) ve ABD (FDA) ilaçları, etken maddeler, ticari eşdeğerler, moleküler SVG yapıları, farmakokinetik ve kontrendikasyonlar. |
| [app.js](file:///c:/Users/mike/OneDrive/Desktop/Portfolio/MedWise/app.js) | ~48 KB | Reaktif doz takip motoru, adherence çemberi, arama ve filtreleme, sıvı takibi, BYOK Gemini & OpenAI API entegrasyonu ve akıllı yerel simülasyon. |

---

## 2. Hayata Geçirilen Temel Özellikler

1. **Görseldeki Özellikler & Bento Grid Arayüzü**:
   - **Header**: Egemen v2.4 rozeti, `%100 İstemci Taraflı Veri` telemetri çubuğu, Acil Zehir Danışma (114 TR / 1-800-222-1222 US) hızlı arama, BYOK modal butonu, JSON kasa yedekleme/yükleme.
   - **Sol Sütun (Doz Kokpiti)**:
     - Dinamik SVG Donut Uyum (Adherence) Halkası (Alınan / Planlanan oranına göre anlık yeniden hesaplanır).
     - Zaman sıralı doz yuvaları (Alındı / Bekliyor geçişi, tek tıkla durum değiştirme, silme).
     - Gerektiğinde (PRN) Hızlı Kayıt butonları: Sıvı Alımı (+250ml), Melatonin 1mg, Elektrolit Solüsyonu, D3 Vitamini.
     - `+ Özel Doz Yapılandır` modal penceresi (ilaç adı, doz, saat ve not ile kokpite yeni doz ekleme).
     - Sirkadiyen Kronobiyoloji Kartı (seçili ilaca göre ideal biyolojik alım saati tavsiyesi).
     - Zehirlenme & Doz Aşımı acil destek kartı.
2. **Türkiye & Amerika İlaçları & Etken Madde Ansiklopedisi**:
   - Atorvastatin + Ezetimib, Metformin XR, Amoksisilin + Klavulanat (Augmentin), İbuprofen (Advil/Dolven), Parasetamol (Tylenol/Parol), Omeprazol (Prilosec/Losec), Sertralin (Zoloft/Lustral), Levotiroksin (Synthroid/Euthyrox), Aspirin (Coraspin/Bayer), Amlodipin (Norvasc).
   - Anlık arama çubuğu ve otomatik tamamlama (marka adı, etken madde veya ATC kodu ile arama).
   - Türkiye TİTCK ve ABD FDA/NDC ruhsatlı müstahzar eşdeğerlerinin yan yana gösterimi.
   - Vektörel Moleküler İskelet (SVG bağ diyagramları) ve kiralite bilgileri.
   - Fiziksel tablet geometrisi (çift renk, çentik, boyutlar ve baskı kodu).
   - Farmakokinetik panel: $T_{max}$, yarı ömür ($t_{1/2}$), CYP metabolizma yolağı, hedef reseptör ve eliminasyon klerensi.
   - Kontrendikasyonlar ve gıda etkileşimleri (Rabdomiyoliz uyarısı, greyfurt suyu furanokumarin inhibisyonu, laktik asidoz vb.).
   - "Doz Kokpitine Ekle" butonu ile monograftaki ilacı sirkadiyen saatiyle birlikte anında günlük takip listesine ekleme.
3. **Günlük Diğer Alımlar & Sıvı Takibi**:
   - İnteraktif sıvı takip çubuğu (hedef 2.5L, +250ml butonu ile anlık artış, yüzde göstergesi).
   - Melatonin, elektrolit ve vitaminler için PRN hızlı kayıt mekanizması.
4. **Sağlık & Tedavi Motivasyon Sistemi**:
   - Ardışık gün (Streak) sayacı (örn. 14 Ardışık Gün).
   - Günlük değişen bilimsel ve klinik motivasyon aforizmaları.
   - Günlük hedef tamamlama rozeti.
5. **BYOK Yapay Zeka Laboratuvarı**:
   - Sağlayıcı seçici: Gemini 1.5, GPT-4o, Claude 3.5.
   - API anahtarı girildiğinde: Tarayıcıdan doğrudan Google Gemini API veya OpenAI API uç noktalarına bağlanarak gerçek zamanlı klinik analiz üretir.
   - API anahtarı girilmediğinde: Kural tabanlı zengin yerel farmakoloji sentez motoruyla beklemeden, kesintisiz çalışır.
   - Hızlı soru çipleri (CoQ10 + Atorvastatin, sirkadiyen zamanlama, aspirin + ibuprofen yarışması vb.).
6. **Lokal Veri Kasası (JSON Export / Import)**:
   - Kullanıcının tüm aktif doz planını, sıvı tüketimini ve geçmişini tek tıkla JSON olarak indirme ve yedekten geri yükleme.
