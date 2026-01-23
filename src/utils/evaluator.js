/**
 * @file evaluator.js
 * @description Sınav değerlendirme işlemlerini yürüten temel mantık modülü.
 * @author Sercan ÖZDEMİR
 * @date 2024
 */

/**
 * Optik verileri, cevap anahtarı ve yoklama listesi ile eşleştirerek sınavı değerlendirir.
 * 
 * @param {Array} attendanceList - Excel'den okunan yoklama listesi (JSON array)
 * @param {Array} opticalList - TXT'den okunan ve parse edilen optik veri listesi
 * @param {Object} answerKeyData - Kitapçık ve Belge türüne göre cevap anahtarları
 * @param {Object} settings - Sınav ayarları (questionCount, scoringType, wrongRatio, roundScores)
 * 
 * @returns {Array} - Değerlendirilmiş öğrenci sonuç listesi
 * @throws {Error} - Kritik veri eksikse hata fırlatır
 */
export const evaluateExam = (attendanceList, opticalList, answerKeyData, settings = {}) => {
    // Varsayılan ayarlar (Eski usül: 40 soru, her soru 2.5 puan)
    const {
        questionCount = 40,
        scoringType = 'correct',
        wrongRatio = 0,
        roundScores = false,
        passGrade = 50
    } = settings || {};
    // answerKeyData Yapısı: { "A": { "ÜDY3": { 1: "A"... } }, "B": ... }

    if (!answerKeyData || Object.keys(answerKeyData).length === 0) {
        throw new Error("Cevap anahtarı verisi boş.");
    }

    const aHeaders = Object.keys(attendanceList[0]);

    // -------------------------------------------------------------------------
    //  YARDIMCI: SÜTUN TESPİTİ
    // -------------------------------------------------------------------------
    // Türkçe karakter duyarlı başlık eşleştirme (Örn: 'İsim' -> 'ISIM')
    const findHeader = (keywords) => {
        return aHeaders.find(h => {
            const hLower = h.toLocaleLowerCase('tr-TR');
            return keywords.some(k => hLower.includes(k.toLocaleLowerCase('tr-TR')));
        });
    };

    // 1. TC Kimlik Sütunu
    const attTcCol = findHeader(['TC', 'KİMLİK', 'TCNO']) || aHeaders.find(h => String(attendanceList[0][h]).length === 11);
    if (!attTcCol) throw new Error("Yoklama listesinde TC Kimlik sütunu bulunamadı.");

    // 2. Ad Soyad Sütunu
    const attNameCol = findHeader(['ADI SOYADI', 'AD SOYAD', 'AD', 'ISIM', 'İSİM']);

    // 3. Belge Türü Sütunu (Puanlama anahtarını seçmek için kritik)
    const attDocTypeCol = findHeader(['BELGE', 'TÜR', 'SERTİFİKA', 'BELGE TÜRÜ']);

    // 4. Salon No Sütunu (Raporlama için)
    const attSalonCol = findHeader(['SALON', 'SINIF', 'DERSLİK']);

    // -------------------------------------------------------------------------
    //  DEĞERLENDİRME DÖNGÜSÜ
    // -------------------------------------------------------------------------
    return attendanceList.map(student => {
        const studTc = String(student[attTcCol]).trim();
        // Optik veride bu öğrenciyi bul (TC eşleşmesi)
        const opticalRecord = opticalList.find(o => String(o.tcNo).trim() === studTc);

        // Temel Öğrenci Bilgileri
        const studentName = attNameCol ? student[attNameCol] : 'İsimsiz';
        const docTypeRaw = attDocTypeCol ? String(student[attDocTypeCol]).trim() : '';
        const docType = docTypeRaw.toUpperCase();
        const salonNo = attSalonCol ? String(student[attSalonCol]).trim() : 'Genel';

        let result = {
            ...student,
            'TC Kimlik': studTc,
            'Ad Soyad': studentName,
            'Belge Türü': docType,
            'Salon No': salonNo,
            'Durum': 'MUAF / OKUNMADI', // Varsayılan
            'Kitapçık': '',
            'Doğru': 0,
            'Yanlış': 0,
            'Boş': 0,
            'Puan': 0,
            'Sonuç': 'Başarısız',
            'Cevaplar': '' // Kopya analizi için eklendi
        };

        if (opticalRecord) {
            result['Kitapçık'] = opticalRecord.kitapcikTuru;
            result['Cevaplar'] = opticalRecord.ogrenciCevaplari;

            if (opticalRecord.girmediDurumu === 'G') {
                result['Durum'] = 'Girmedi';
                result['Sonuç'] = 'Girmedi';
            } else {
                result['Durum'] = 'Girdi';

                // Kitapçık Anahtarını Bul
                const bookletKey = answerKeyData[opticalRecord.kitapcikTuru];
                if (bookletKey) {
                    // Belge Türü Anahtarını Bul (Tam eşleşme veya içerme)
                    let correctKey = bookletKey[docType];

                    if (!correctKey) {
                        const keyName = Object.keys(bookletKey).find(k => k.includes(docType) || docType.includes(k));
                        if (keyName) correctKey = bookletKey[keyName];
                    }

                    if (correctKey) {
                        // PUANLAMA
                        const answers = opticalRecord.ogrenciCevaplari;
                        let d = 0, y = 0, b = 0;
                        const qNos = Object.keys(correctKey).map(Number).sort((a, b) => a - b);

                        qNos.forEach(q => {
                            const correctChar = correctKey[q];
                            const givenChar = answers[q - 1]; // Cevap string indexi 0-based

                            if (!givenChar || givenChar === ' ' || givenChar === '') {
                                b++;
                            } else if (givenChar === correctChar) {
                                d++;
                            } else {
                                y++;
                            }
                        });


                        // NET VE PUAN HESABI
                        const wrongPenalty = wrongRatio > 0 ? (y / wrongRatio) : 0;
                        const net = Math.max(0, d - wrongPenalty);

                        let score = 0;
                        if (scoringType === 'net') {
                            score = (net / questionCount) * 100;
                        } else {
                            // Default: Doğru sayısı üzerinden
                            score = (d / questionCount) * 100;
                        }

                        // Yuvarlama
                        if (roundScores) {
                            score = Math.round(score);
                        }

                        // Sonuçları ata
                        result['Doğru'] = d;
                        result['Yanlış'] = y;
                        result['Boş'] = b;
                        result['Puan'] = roundScores ? score : score.toFixed(2);
                        result['Net'] = net.toFixed(2); // Net bilgisini de arka planda tutalım
                        result['Sonuç'] = score >= passGrade ? 'Başarılı' : 'Başarısız';
                        // Cevapları array olarak kaydet (string ise split et)
                        result['Cevaplar'] = typeof answers === 'string' ? answers.split('') : answers;

                    } else {
                        result['Durum'] = `Anahtar Yok (${docType})`;
                    }
                } else {
                    result['Durum'] = `Kitapçık Yok (${opticalRecord.kitapcikTuru})`;
                }
            }
        }

        return result;
    });
};
