# 🎓 Optik Form Değerlendirme Uygulaması

<p align="center">
  <img src="https://img.shields.io/badge/version-1.6.0-blue.svg?style=for-the-badge" />
  <img src="https://img.shields.io/badge/platform-Windows-lightgrey.svg?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge" />
  <img src="https://img.shields.io/badge/status-active-success.svg?style=for-the-badge" />
</p>

Modern, kullanıcı dostu ve kapsamlı bir sınav değerlendirme, analiz ve raporlama yazılımı. Öğretmenler ve okul idarecileri için özel olarak geliştirilmiştir. **Electron** ve **React** teknolojileri ile masaüstü performansı sunar.

---

## 📋 İçindekiler

- [Öne Çıkan Özellikler](#-öne-çıkan-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Proje Yapısı](#-proje-yapısı)
- [Kullanım Akışı](#-kullanım-akışı)
- [Sürüm Geçmişi](#-sürüm-geçmişi)
- [Geliştirici](#-geliştirici-kartı)
- [Lisans](#-lisans)

---

## 🌟 Öne Çıkan Özellikler

### 📊 Değerlendirme ve Analiz
- **Akıllı Optik Okuma:** `.txt` ve `.fmt` formatındaki ham optik verileri otomatik işler.
- **Dinamik Parser:** Veri başlangıç ve uzunluk ayarları (Start/Length) kullanıcı arayüzünden sürükle-bırak hassasiyetinde ayarlanabilir.
- **Karakter Seti Filtreleme:** Kirli verileri (TR karakter sorunları vb.) otomatik temizler ve düzeltir.
- **Detaylı Sonuç:** Soru bazlı analiz, net hesaplama ve 100 üzerinden puanlama.

### 🕵️‍♂️ Kopya ve İhlal Analizi
- **Çapraz Kontrol:** Sınıf içindeki tüm öğrencilerin cevaplarını birbirleriyle karşılaştırır.
- **Benzerlik Skoru:** Şüpheli derecede benzer kağıtları (örn: %90+ eşleşme) tespit eder.
- **Görsel Rapor:** Kopya ihtimali olan kağıtları yan yana gösterir.

### 📈 Raporlama ve Çıktı
- **Excel Export:** Sonuçları resmi formatta, imzalı ve salonlara ayrılmış Excel dosyası olarak indirir.
- **PDF Desteği:** İstatistik sayfalarını ve grafiklerini tek tıkla PDF'e dönüştürür.
- **İstatistik Grafikleri:** Başarı trendleri, ortalama puanlar ve belge türü dağılımları.

### 🎨 Kullanıcı Deneyimi
- **Koyu/Açık Tema:** Göz yormayan koyu mod desteği.
- **Güvenli Depolama:** Sınav verileri kullanıcının `AppData` klasöründe güvenli şekilde saklanır.
- **Hızlı Erişim:** Klavye kısayolları (F1 Yardım, Ctrl+S Kaydet).

---

## 💻 Teknoloji Yığını

| Alan | Teknoloji | Açıklama |
|------|-----------|----------|
| **Core** | ![Electron](https://img.shields.io/badge/Electron-Latest-blue) | Masaüstü uygulama çatısı |
| **Frontend** | ![React](https://img.shields.io/badge/React-19-61DAFB) | Kullanıcı arayüzü kütüphanesi |
| **Build** | ![Vite](https://img.shields.io/badge/Vite-5.0-purple) | Hızlı geliştirme ve derleme aracı |
| **Data** | ![XLSX](https://img.shields.io/badge/SheetJS-XLSX-green) | Excel okuma/yazma işlemleri |
| **Styling** | ![CSS3](https://img.shields.io/badge/CSS3-Modern-blue) | CSS Grid/Flexbox ve Değişkenler |

---

## 🛠 Kurulum ve Çalıştırma

Geliştirme ortamını kurmak için aşağıdaki adımları izleyin.

### Gereksinimler
- **Node.js**: v18.0.0 veya üzeri önerilir.
- **Git**: Versiyon kontrolü için.

### Adım Adım Kurulum

1.  **Repoyu Klonlayın:**
    ```bash
    git clone https://github.com/BeNKaYS/optik-degerlendirme-app.git
    cd optik-degerlendirme-app
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Uygulamayı Başlatın (Dev Mode):**
    ```bash
    npm run dev
    ```
    *Bu komut hem Vite sunucusunu hem de Electron pencresini eş zamanlı başlatır.*

4.  **Uygulamayı Derleyin (Build):**
    ```bash
    npm run build
    ```
    *`dist` klasörüne setup dosyasını oluşturur.*

---

## 📁 Proje Yapısı

```
optik-degerlendirme-app/
├── electron/               # Electron ana süreç dosyaları
│   ├── main.cjs            # Main Process (Pencere, IO, IPC)
│   └── preload.cjs         # Preload Script (Güvenli Köprü)
├── src/                    # React Kaynak Kodları
│   ├── components/         # UI Bileşenleri (Tablar, Modallar)
│   ├── utils/              # Yardımcı Fonksiyonlar (Parser, Hesaplama)
│   ├── App.jsx             # Ana Uygulama Mantığı
│   └── main.jsx            # React Giriş Noktası
├── public/                 # Statik Dosyalar (İkonlar)
├── KULLANIM_KILAVUZU.md    # Detaylı Yardım Dokümanı
└── package.json            # Proje Konfigürasyonu
```

---

## 🚀 Kullanım Akışı

1.  **Sınav Oluşturma:** Yeni bir isim vererek sınava başlayın.
2.  **Yoklama Listesi:** Excel formatındaki öğrenci listesini yükleyin.
3.  **Optik Veri:** Okuyucudan gelen TXT dosyasını yükleyin ve parser ayarlarını yapın.
4.  **Cevap Anahtarı:** Doğru cevapları içeren Excel dosyasını sisteme tanıtın.
5.  **Değerlendirme:** Tek tıkla sınavı okuyun, analiz edin ve sonuçları görün.
6.  **Raporlama:** İster Excel olarak indirin, ister istatistik ekranından grafiklerin çıktısını alın.

---

## 📜 Sürüm Geçmişi

### v1.6.0 (Güncel)
- ✨ **Yeni:** FMT Düzenleyici entegrasyonu (Görsel editör ve ASCII önizleme).
- 🐛 **Düzeltme:** Başarı oranı hesaplama mantığı güncellendi (Sınava girenler -> Okunan veri).
- 🎨 **Geliştirme:** Ruler ve Grid hizalaması optimize edildi (130 karakter sabitleme).

### v1.5.0
- ✨ **Yeni:** Zengin içerikli Yardım Menüsü ve Kullanım Kılavuzu entegrasyonu.
- 🐛 **Düzeltme:** İstatistik tablosundaki veri eşleştirme hatası giderildi.
- 🎨 **Geliştirme:** Tablo görünümleri ve ikon setleri yenilendi.

### v1.4.0

### v1.3.0
- ✨ **Yeni:** Kopya analiz algoritması eklendi.
- ✨ **Yeni:** Koyu tema (Dark Mode) desteği.

---

# 👨‍💻 Geliştirici Kartı

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=24&pause=1000&color=25D366&center=true&vCenter=true&width=520&lines=Makine+%C3%96%C4%9Frenmesi+%26+C%2B%2B+Tutkunu;Bili%C5%9Fim+Teknolojileri+%C3%96%C4%9Fretmeni;Kod+Yazar%2C+Anlat%C4%B1r%2C+%C3%96%C4%9Fretirim" />
</p>

---

# 👨‍💻 Sercan ÖZDEMİR

### `BeNKaYS` | Bilişim Teknolojileri Öğretmeni

**Makine Öğrenmesi & C++ Tutkunu**

---

## 🧠 Profil Özeti

Eğitim ve yazılımı aynı potada eriten; özellikle **C++**, **algoritmalar** ve **Makine Öğrenmesi** odaklı projeler geliştiren bir geliştiriciyim. Amacım: karmaşık sistemleri **öğretilebilir, sade ve sürdürülebilir** hâle getirmek.

> _“Kod sadece çalışmamalı, anlaşılmalı.”_

---

## 🧩 Uzmanlık Alanları

- 🧠 Makine Öğrenmesi (Temel modeller, veri işleme, algoritmik yaklaşım)
- ⚙️ C++ (OOP, performans, sistem mantığı)
- 🖥️ Algoritma & Mantıksal Tasarım
- 📚 Eğitim Odaklı Yazılım Geliştirme
- 🔧 Sistem & Uygulama Geliştirme

---

## 🛠️ Teknoloji Yığını

<p align="left">
  <img src="https://skillicons.dev/icons?i=cpp,python,git,linux,opencv,vscode&theme=light" />
</p>

---

## 📲 İletişim

- 📧 **E-posta:** sercanozdemir@yandex.com
- 💬 **WhatsApp:** [Hızlı Mesaj Gönder](https://wa.me/905068858585?text=Merhaba%20bilgi%20almak%20istiyorum)

---

## 📌 Geliştirici Kartı QR

> Uygulamalar, dokümanlar ve sunumlar için

![WhatsApp QR](https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://wa.me/905068858585?text=Merhaba%20bilgi%20almak%20istiyorum)

---

## ✨ Motto

> **Üreten öğretir, öğreten kalıcı iz bırakır.**

---

## 📝 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Eğitim ve kişisel gelişim amaçlı kullanıma açıktır.

Copyright © 2026 - [Sercan ÖZDEMİR](https://github.com/BeNKaYS)
