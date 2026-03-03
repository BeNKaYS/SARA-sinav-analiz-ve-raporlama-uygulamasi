/**
 * @file main.cjs
 * @description Electron Ana Süreci (Main Process).
 * Uygulamanın yaşam döngüsünü, pencere yönetimini ve dosya sistemi işlemlerini yönetir.
 * @author Sercan ÖZDEMİR
 * @date 2024
 */

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Development veya Production modunu belirle
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

// İkon yolunu moda göre belirle
const getIconPath = () => {
    if (isDev) {
        return path.join(__dirname, '../public/icon.ico');
    } else {
        return path.join(__dirname, '../dist/icon.ico');
    }
};

// Uygulama bilgileri
const APP_NAME = 'Optik Değerlendirme';
const APP_VERSION = '1.6.0';
const APP_AUTHOR = 'Sercan ÖZDEMİR';

// Türkçe Menü Şablonu
const createMenu = () => {
    const template = [
        {
            label: 'Dosya',
            submenu: [
                { label: 'Yeni Sınav', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu-new-exam') },
                { type: 'separator' },
                { label: 'Çıkış', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
            ]
        },
        {
            label: 'Düzen',
            submenu: [
                { label: 'Geri Al', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Yinele', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
                { type: 'separator' },
                { label: 'Kes', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Kopyala', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Yapıştır', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Tümünü Seç', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        },
        {
            label: 'Görünüm',
            submenu: [
                { label: 'Yenile', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: 'Zorla Yenile', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                { type: 'separator' },
                { label: 'Yakınlaştır', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: 'Uzaklaştır', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { label: 'Varsayılan Boyut', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { type: 'separator' },
                { label: 'Tam Ekran', accelerator: 'F11', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Pencere',
            submenu: [
                { label: 'Küçült', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
                { label: 'Büyüt/Küçült', click: () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize() },
                { type: 'separator' },
                { label: 'Kapat', accelerator: 'CmdOrCtrl+W', role: 'close' }
            ]
        },
        {
            label: 'Yardım',
            submenu: [
                {
                    label: 'Kullanım Kılavuzu',
                    accelerator: 'F1',
                    click: () => mainWindow?.webContents.send('menu-show-help')
                },
                { type: 'separator' },
                {
                    label: 'Hakkında',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: `${APP_NAME} Hakkında`,
                            message: APP_NAME,
                            detail: `Sürüm: ${APP_VERSION}\n\nGeliştirici: ${APP_AUTHOR}\nE-posta: sercanozdemir@yandex.com\n\nBu uygulama, optik form okuyucudan alınan verileri işleyerek sınav değerlendirmesi yapmanızı sağlar.\n\n© 2024-2026 Tüm hakları saklıdır.`,
                            icon: getIconPath(),
                            buttons: ['Tamam']
                        });
                    }
                }
            ]
        }
    ];

    // Development modunda ek menü


    return Menu.buildFromTemplate(template);
};

// -----------------------------------------------------------------------------
//  PENCERE YÖNETİMİ & IPC
// -----------------------------------------------------------------------------

let mainWindow;
let cheatingWindow;
let cheatingData = null; // Veriyi geçici olarak saklamak için

/**
 * Ana uygulama penceresini oluşturur.
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: APP_NAME, // Pencere başlığı
        icon: getIconPath(), // Uygulama ikonu
        autoHideMenuBar: true,
        show: false, // Hazır olana kadar gizle
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'), // Preload scripti
            contextIsolation: true, // Güvenlik için izole bağlam
            nodeIntegration: false  // Node.js entegrasyonu kapalı (Güvenlik)
        }
    });

    mainWindow.setMenuBarVisibility(false);

    // Pencere hazır olduğunda tam ekran göster
    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
    });

    cheatingWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, // Başlangıçta gizli
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    // isDev zaten üstte tanımlı

    // Geliştirme modundaysa localhost, değilse build dosyasını yükle
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // mainWindow.webContents.openDevTools(); // İsteğe bağlı konsol açma
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// Uygulama hazır olduğunda pencereyi aç
app.whenReady().then(() => {
    // Üst menü çubuğunu tamamen kaldır
    Menu.setApplicationMenu(null);

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Tüm pencereler kapandığında uygulamayı kapat (Mac hariç)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// ==========================================
//  IPC HANDLERS (Renderer -> Main İletişimi)
// ==========================================

// IPC: Kopya Penceresini Aç
ipcMain.on('open-cheating-window', (event, data) => {
    cheatingData = data;

    if (cheatingWindow) {
        if (cheatingWindow.isMinimized()) cheatingWindow.restore();
        cheatingWindow.focus();
        cheatingWindow.reload();
        return;
    }

    cheatingWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        title: "Sınav İhlali Analiz Raporu",
        icon: getIconPath(),
        autoHideMenuBar: true,
        show: true, // Force show immediately
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // isDev zaten üstte tanımlı

    if (isDev) {
        cheatingWindow.loadURL('http://localhost:5173/#cheating');
    } else {
        cheatingWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'cheating' });
    }

    // cheatingWindow.once('ready-to-show', () => {
    //     cheatingWindow.show();
    // });

    cheatingWindow.on('closed', () => {
        cheatingWindow = null;
        cheatingData = null;
    });
});


/**
 * Dosya seçme diyaloğunu açar.
 */
ipcMain.handle('select-file', async (event, filters) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: filters
    });
    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }
    return result.filePaths[0];
});

/**
 * Dosyayı Binary Buffer olarak okur (Excel vb. için).
 */
ipcMain.handle('read-file-buffer', async (event, filePath) => {
    try {
        const buffer = fs.readFileSync(filePath);
        return buffer;
    } catch (e) {
        throw new Error('Dosya okunamadı: ' + e.message);
    }
});

/**
 * Dosyayı Metin olarak okur (TXT/FMT vb. için).
 * Türkçe karakter desteği: Windows-1254, ISO-8859-9, UTF-8 dener.
 */
ipcMain.handle('read-file-text', async (event, filePath) => {
    try {
        const buffer = fs.readFileSync(filePath);

        // UTF-8 BOM kontrolü
        if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
            return buffer.toString('utf-8');
        }

        // UTF-8 olarak dene
        let text = buffer.toString('utf-8');

        // Türkçe karakterler bozuk mu kontrol et (replacement character)
        if (text.includes('\uFFFD') || /[^\x00-\x7F]/.test(text) === false) {
            // Windows-1254 (Türkçe ANSI) olarak decode et
            // Manuel decode: Windows-1254 karakter tablosu
            const win1254Map = {
                0x80: '\u20AC', // €
                0x82: '\u201A', // ‚
                0x83: '\u0192', // ƒ
                0x84: '\u201E', // „
                0x85: '\u2026', // …
                0x86: '\u2020', // †
                0x87: '\u2021', // ‡
                0x88: '\u02C6', // ˆ
                0x89: '\u2030', // ‰
                0x8A: '\u0160', // Š
                0x8B: '\u2039', // ‹
                0x8C: '\u0152', // Œ
                0x91: '\u2018', // '
                0x92: '\u2019', // '
                0x93: '\u201C', // "
                0x94: '\u201D', // "
                0x95: '\u2022', // •
                0x96: '\u2013', // –
                0x97: '\u2014', // —
                0x98: '\u02DC', // ˜
                0x99: '\u2122', // ™
                0x9A: '\u0161', // š
                0x9B: '\u203A', // ›
                0x9C: '\u0153', // œ
                0x9F: '\u0178', // Ÿ
                // Türkçe karakterler (ISO-8859-9 / Windows-1254)
                0xC7: '\u00C7', // Ç
                0xD0: '\u011E', // Ğ
                0xDD: '\u0130', // İ
                0xDE: '\u015E', // Ş
                0xDC: '\u00DC', // Ü
                0xD6: '\u00D6', // Ö
                0xE7: '\u00E7', // ç
                0xF0: '\u011F', // ğ
                0xFD: '\u0131', // ı
                0xFE: '\u015F', // ş
                0xFC: '\u00FC', // ü
                0xF6: '\u00F6', // ö
            };

            let decoded = '';
            for (let i = 0; i < buffer.length; i++) {
                const byte = buffer[i];
                if (byte < 0x80) {
                    decoded += String.fromCharCode(byte);
                } else if (win1254Map[byte]) {
                    decoded += win1254Map[byte];
                } else if (byte >= 0xA0 && byte <= 0xFF) {
                    // Latin-1 supplement olarak dene
                    decoded += String.fromCharCode(byte);
                } else {
                    decoded += String.fromCharCode(byte);
                }
            }
            return decoded;
        }

        return text;
    } catch (e) {
        throw new Error('Dosya okunamadı: ' + e.message);
    }
});

/**
 * Dosya kaydetme diyaloğunu açar ve içeriği yazar.
 */
ipcMain.handle('save-file', async (event, contentBuffer, defaultName) => {
    try {
        const { filePath } = await dialog.showSaveDialog({
            defaultPath: defaultName,
            filters: [
                { name: 'Tüm Dosyalar', extensions: ['*'] }
            ]
        });

        if (filePath) {
            fs.writeFileSync(filePath, Buffer.from(contentBuffer));
            return filePath;
        }
        return null;
    } catch (e) {
        throw new Error('Dosya kaydedilemedi: ' + e.message);
    }
});

/**
 * HTML içeriğini PDF'e dönüştür ve kaydet
 */
ipcMain.handle('print-to-pdf', async (event, html, filename) => {
    let pdfWindow = null;
    let tempFilePath = null;

    try {
        // Geçici HTML dosyası oluştur
        const tempDir = app.getPath('temp');
        tempFilePath = path.join(tempDir, `print_${Date.now()}.html`);

        // Tam HTML dokümanı oluştur
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapor</title>
</head>
<body>
${html}
</body>
</html>`;

        fs.writeFileSync(tempFilePath, fullHtml, 'utf-8');

        // Geçici bir BrowserWindow oluştur
        pdfWindow = new BrowserWindow({
            width: 1024,
            height: 768,
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        // HTML dosyasını yükle
        await pdfWindow.loadFile(tempFilePath);

        // Sayfa tam yüklenene kadar bekle
        await new Promise(resolve => setTimeout(resolve, 2000));

        // PDF ayarları
        const pdfData = await pdfWindow.webContents.printToPDF({
            marginsType: 0,
            pageSize: 'A4',
            printBackground: true,
            printSelectionOnly: false,
            landscape: false
        });

        // Kaydetme dialogu
        const { filePath } = await dialog.showSaveDialog({
            defaultPath: `${filename}.pdf`,
            filters: [
                { name: 'PDF Dosyası', extensions: ['pdf'] }
            ]
        });

        // Pencereyi kapat
        if (pdfWindow && !pdfWindow.isDestroyed()) {
            pdfWindow.close();
        }

        // Geçici dosyayı sil
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        if (filePath) {
            fs.writeFileSync(filePath, pdfData);
            return filePath;
        }

        return null;
    } catch (e) {
        // Temizlik
        if (pdfWindow && !pdfWindow.isDestroyed()) {
            pdfWindow.close();
        }
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (err) { }
        }
        console.error('PDF oluşturma hatası:', e);
        throw new Error('PDF oluşturulamadı: ' + e.message);
    }
});

// ==========================================
//  VERİTABANI MANTIĞI (Her Sınav Ayrı Dosya)
// ==========================================

/**
 * Sınav klasörü yolunu belirler.
 * Her zaman kullanıcının AppData klasöründe saklanır (gizli ve güvenli).
 * Windows: C:\Users\<user>\AppData\Roaming\optik-degerlendirme-app\exams
 */
const getExamsDir = () => {
    // Her zaman userData altında sakla - kullanıcının kolayca erişemeyeceği güvenli konum
    const dir = path.join(app.getPath('userData'), 'exams');

    // Klasör yoksa oluştur
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
            console.error("Klasör oluşturulamadı:", e);
        }
    }
    return dir;
};

/**
 * Sınav dosya adını oluşturur (güvenli dosya adı).
 * @param {string} id - Sınav ID'si
 * @param {string} name - Sınav adı
 */
const getExamFileName = (id, name) => {
    // Dosya adından geçersiz karakterleri temizle
    const safeName = name.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
    return `${safeName}_${id}.json`;
};

/**
 * Tüm kayıtlı sınavların meta bilgilerini okur.
 * Her dosyayı tam okumak yerine sadece ana bilgileri döndürür.
 */
const getExams = () => {
    try {
        const dir = getExamsDir();
        if (!fs.existsSync(dir)) return [];

        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'exams.json');
        const exams = [];

        for (const file of files) {
            try {
                const filePath = path.join(dir, file);
                const data = fs.readFileSync(filePath, 'utf8');
                const exam = JSON.parse(data);

                // Sadece meta bilgileri döndür (performans için)
                // Eğer dosyada üst düzey metadata varsa onu kullan, yoksa veri içinden hesapla
                exams.push({
                    id: exam.id,
                    name: exam.name,
                    timestamp: exam.timestamp,
                    hasAttendance: exam.hasAttendance ?? !!(exam.data?.attendanceData?.length > 0),
                    hasOptical: exam.hasOptical ?? !!(exam.data?.opticalData?.length > 0),
                    hasAnswerKey: exam.hasAnswerKey ?? !!(exam.data?.answerKeyData && Object.keys(exam.data.answerKeyData).length > 0),
                    hasResults: exam.hasResults ?? !!(exam.data?.results?.length > 0),
                    settings: exam.data?.settings || {},
                    fileName: file
                });
            } catch (e) {
                console.error(`Dosya okunamadı: ${file}`, e);
            }
        }

        return exams;
    } catch (e) {
        console.error("Veritabanı okuma hatası:", e);
        return [];
    }
};

/**
 * Tek bir sınavın tam verisini okur.
 */
const getExamById = (examId) => {
    try {
        const dir = getExamsDir();
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'exams.json');

        for (const file of files) {
            const filePath = path.join(dir, file);
            const data = fs.readFileSync(filePath, 'utf8');
            const exam = JSON.parse(data);
            if (exam.id === examId) {
                return exam;
            }
        }
        return null;
    } catch (e) {
        console.error("Sınav okuma hatası:", e);
        return null;
    }
};

/**
 * Sınavı dosyaya kaydeder (yeni veya güncelleme).
 */
const saveExam = (examData) => {
    try {
        const dir = getExamsDir();
        const fileName = getExamFileName(examData.id, examData.name);
        const filePath = path.join(dir, fileName);

        // Eski dosyayı bul ve sil (isim değişmiş olabilir)
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'exams.json');
        for (const file of files) {
            const existingPath = path.join(dir, file);
            try {
                const data = fs.readFileSync(existingPath, 'utf8');
                const exam = JSON.parse(data);
                if (exam.id === examData.id && file !== fileName) {
                    fs.unlinkSync(existingPath); // Eski dosyayı sil
                    break;
                }
            } catch (e) {
                // Dosya okunamazsa atla
            }
        }

        // Yeni/güncellenmiş dosyayı yaz
        fs.writeFileSync(filePath, JSON.stringify(examData, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Veritabanı yazma hatası:", e);
        return false;
    }
};

/**
 * Sınavı siler.
 */
const deleteExam = (examId) => {
    try {
        const dir = getExamsDir();
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'exams.json');

        for (const file of files) {
            const filePath = path.join(dir, file);
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                const exam = JSON.parse(data);
                if (exam.id === examId) {
                    fs.unlinkSync(filePath);
                    return true;
                }
            } catch (e) {
                // Dosya okunamazsa atla
            }
        }
        return false;
    } catch (e) {
        console.error("Silme hatası:", e);
        return false;
    }
};

// ==========================================
//  LİSANS YÖNETİMİ
// ==========================================

const LICENSE_ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto
    .createHash('sha256')
    .update('OPTIK_FORM_APP_2025_SERCAN_KEY')
    .digest('base64')
    .substr(0, 32);

/**
 * Lisans dosyasının yolu.
 * AppData altında güvenli bir yerde saklanır.
 */
const getLicensePath = () => {
    return path.join(app.getPath('userData'), 'license.key');
};

/**
 * Lisans anahtarını doğrular ve detaylarını döner.
 */
const verifyLicense = (licenseKey) => {
    try {
        // Format: IV:EncryptedData (Base64)
        const buff = Buffer.from(licenseKey, 'base64');
        const str = buff.toString('utf-8');
        const parts = str.split(':');

        if (parts.length !== 2) return { valid: false, error: 'Geçersiz format' };

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];

        const decipher = crypto.createDecipheriv(LICENSE_ALGORITHM, SECRET_KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        const data = JSON.parse(decrypted);

        // Tarih kontrolü
        const now = Date.now();
        if (now > data.expiry) {
            return { valid: false, error: 'Süresi dolmuş', owner: data.owner, expiry: data.expiry };
        }

        return { valid: true, owner: data.owner, expiry: data.expiry };

    } catch (e) {
        console.error("Lisans doğrulama hatası:", e);
        return { valid: false, error: 'Geçersiz anahtar' };
    }
};

// --- Lisans IPC Handlerlar ---

ipcMain.handle('check-license-status', async () => {
    try {
        const licensePath = getLicensePath();
        if (!fs.existsSync(licensePath)) {
            return { valid: false, reason: 'Lütfen lisans anahtarınızı giriniz.' };
        }

        const licenseKey = fs.readFileSync(licensePath, 'utf8').trim();
        const result = verifyLicense(licenseKey);

        if (!result.valid) {
            return { valid: false, reason: result.error || 'Lisans geçersiz.' };
        }

        return { valid: true, owner: result.owner, expiry: result.expiry };
    } catch (e) {
        return { valid: false, reason: 'Sistem hatası: ' + e.message };
    }
});

ipcMain.handle('submit-license-key', async (event, key) => {
    const result = verifyLicense(key);
    if (result.valid) {
        try {
            fs.writeFileSync(getLicensePath(), key, 'utf8');
            return { success: true, owner: result.owner, expiry: result.expiry };
        } catch (e) {
            return { success: false, message: 'Lisans dosyası yazılamadı.' };
        }
    } else {
        return { success: false, message: result.error || 'Geçersiz Lisans Anahtarı' };
    }
});

// --- Veritabanı API'leri ---

ipcMain.handle('get-exams', async () => {
    return getExams();
});

ipcMain.handle('get-exam-by-id', async (event, examId) => {
    return getExamById(examId);
});

ipcMain.handle('save-exam', async (event, examData) => {
    return saveExam(examData);
});

ipcMain.handle('delete-exam', async (event, examId) => {
    return deleteExam(examId);
});
