# MedWise - Egemen Klinik Farmakoterapi, Doz Takip & BYOK Yapay Zeka Sistemi

Modern Bento Grid mimarisine sahip; Türkiye (TİTCK) ve Amerika (FDA) ilaçları, etken maddeleri, biyoeşdeğerlikleri, etkileşimli doz kokpiti, sıvı/PRN takip mekanizması, günlük motivasyon sistemi ve **BYOK (Bring Your Own Key)** yapay zeka farmakoterapi laboratuvarı barındıran klinik web uygulaması.

---

## 🌟 Temel Özellikler

- **🏛️ Egemen Klinik İlaç Ansiklopedisi**:
  - Türkiye (TİTCK) ve ABD (FDA/NDC) ruhsatlı ilaçlar (Atorvastatin, Metformin, Augmentin, İbuprofen, Parasetamol, Omeprazol, Sertralin, Levotiroksin, Aspirin, Amlodipin vb.).
  - Çift dilli / çift pazarlı biyoeşdeğerlikler (TR vs US ticari adları).
  - Vektörel moleküler iskelet (SVG) diyagramları ve kiralite bilgileri.
  - Fiziksel tablet geometrisi (renk, ebat, çentik ve baskı kodu).
  - Farmakokinetik ($T_{max}$, $t_{1/2}$), CYP metabolizma yolakları, hedef reseptörler ve eliminasyon klerensi.
  - Şiddetli kontrendikasyonlar ve besin etkileşimleri (Rabdomiyoliz, greyfurt suyu furanokumarin inhibisyonu, laktik asidoz vb.).

- **⏱️ Doz Kokpiti & Dinamik Uyum (Adherence) Takibi**:
  - Dinamik SVG Donut Uyum Halkası (Alınan / Planlanan oranına göre anlık hesaplanır).
  - Kronolojik zaman sıralı doz kartları (Alındı / Bekliyor geçişi, tek tıkla durum değiştirme, silme).
  - `+ Özel Doz Yapılandır` modal penceresi (ilaç adı, doz, saat ve not ile yeni protokol oluşturma).
  - "Doz Kokpitine Ekle" butonu ile monograftaki ilacı sirkadiyen saatiyle anında takibe ekleme.

- **💧 Günlük Diğer Alımlar & Sıvı Takibi**:
  - İnteraktif sıvı takip çubuğu (hedef 2.5L, +250ml butonu ile anlık artış, yüzde göstergesi).
  - Melatonin, elektrolit ve vitaminler için PRN (gerektiğinde) hızlı kayıt butonları.

- **⚡ Sağlık & Tedavi Motivasyon Sistemi**:
  - Ardışık gün (Streak) sayacı (örn. 14 Ardışık Gün).
  - Her gün otomatik değişen bilimsel ve klinik motivasyon aforizmaları.
  - Günlük hedef tamamlama rozeti.

- **🤖 BYOK (Bring Your Own Key) Yapay Zeka Laboratuvarı**:
  - Model seçici: Google Gemini (Gemini 1.5 Flash / 2.0), OpenAI (GPT-4o), Anthropic Claude (Claude 3.5 Sonnet).
  - Kullanıcı kendi API anahtarını girdiğinde doğrudan tarayıcıdan resmi uç noktalara güvenli istek atar.
  - API anahtarı girilmediğinde akıllı yerel farmakoloji sentez motoruyla anında klinik yanıt verir.
  - Tek tıkla analiz kopyalama butonu.

- **🔒 %100 İstemci Taraflı Veri & Güvenlik**:
  - Tüm kişisel ilaç ve doz geçmişinizi tek tıkla JSON olarak indirme ve yedekten geri yükleme imkanı.
  - Sıfır sunucu takibi, sıfır telemetri.

---

## 🛠️ Mimari ve Dosya Yapısı

Proje modüler ve temiz dosya yapısına sahiptir:
- `index.html`: Bento grid arayüzü, semantik HTML5 yapısı, modal diyalogları.
- `style.css`: Renk tokenları (`#bb000f`, `#291714`, `#fff8f7`), tipografi, animasyonlar ve yazdırma (`@media print`) stilleri.
- `drugs.json`: Türkiye ve ABD ilaçları veri tabanı.
- `app.js`: Reaktif doz takip motoru, arama ve filtreleme, sıvı takibi, BYOK API entegrasyonu ve simülasyon motoru.

---

## 🚀 Canlı Yayın & Kurulum

Uygulama statik web mimarisine sahip olduğundan Vercel, Netlify veya GitHub Pages üzerinde sıfır yapılandırma ile anında çalışır.

Yerel olarak çalıştırmak için:
```bash
python -m http.server 8000
```
Tarayıcınızda `http://localhost:8000` adresini açınız.

---

## 📄 Lisans & Klinik Sorumluluk Reddi

*Klinik Sorumluluk Reddi: MedWise tıbbi teşhis koymaz. Tüm ilaç ve dozaj değişiklikleri için mutlaka hekiminize veya eczacınıza danışınız.*
