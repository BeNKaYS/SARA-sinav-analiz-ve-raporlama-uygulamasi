/**
 * @file ExamsTab.jsx
 * @description Sınavların oluşturulduğu, listelendiği ve yüklendiği ana yönetim ekranı.
 * @author Sercan ÖZDEMİR
 * @date 2024
 */

import { useState, useEffect } from 'react';

// ==========================================
//  BİLEŞEN TANIMI
// ==========================================
export default function ExamsTab({
    currentData,
    onLoadExam,
    onStartExam,
    onDeleteExam,
    onUpdateSettings
}) {
    // -------------------------------------------------------------------------
    //  STATE YÖNETİMİ
    // -------------------------------------------------------------------------
    const [exams, setExams] = useState([]);
    const [examName, setExamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [showStartConfirm, setShowStartConfirm] = useState(false);
    const [loadConfirmExam, setLoadConfirmExam] = useState(null);

    // Sınav Ayarları State'leri (localStorage'dan başlat veya varsayılan)
    const [questionCount, setQuestionCount] = useState(() => localStorage.getItem('def_questionCount') || 100);
    const [scoringType, setScoringType] = useState(() => localStorage.getItem('def_scoringType') || 'correct'); // 'net' | 'correct'
    const [wrongRatio, setWrongRatio] = useState(() => localStorage.getItem('def_wrongRatio') || '4'); // '0', '3', '4'
    const [passGrade, setPassGrade] = useState(() => localStorage.getItem('def_passGrade') || '50');

    // Ayarlar değiştikçe kaydet
    useEffect(() => {
        localStorage.setItem('def_questionCount', questionCount);
        localStorage.setItem('def_scoringType', scoringType);
        localStorage.setItem('def_wrongRatio', wrongRatio);
        localStorage.setItem('def_passGrade', passGrade);
        localStorage.removeItem('def_roundScores');
    }, [questionCount, scoringType, wrongRatio, passGrade]);

    // -------------------------------------------------------------------------
    //  YARDIMCI ENDPOİNTS VEYA MANTIK
    // -------------------------------------------------------------------------

    /**
     * Sınav listesini backend'den (dosya sistemi) çeker.
     */
    const refreshExams = async () => {
        if (!window.api?.getExams) return;
        setLoading(true);
        try {
            const list = await window.api.getExams();
            // Tarihe göre tersten sırala (En yeni en üstte)
            list.sort((a, b) => b.timestamp - a.timestamp);
            setExams(list);
        } catch (e) {
            console.error(e);
            setMsg({ type: 'error', text: 'Sınav listesi alınamadı. Lütfen uygulamayı yeniden başlatın.' });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Ayarları aktif sınava uygular
     */
    const handleApplySettings = () => {
        if (onUpdateSettings) {
            onUpdateSettings({
                questionCount: Number(questionCount),
                scoringType,
                wrongRatio: Number(wrongRatio),
                passGrade: Number(passGrade)
            });
            setMsg({ type: 'success', text: 'Ayarlar güncellendi ve kaydedildi.' });

            // 3 saniye sonra mesajı temizle
            setTimeout(() => setMsg(null), 3000);
        }
    };

    // İlk açılışta listeyi çek
    useEffect(() => {
        refreshExams();
    }, []);

    useEffect(() => {
        if (scoringType === 'correct' && wrongRatio !== '0') {
            setWrongRatio('0');
        }
    }, [scoringType, wrongRatio]);

    // -------------------------------------------------------------------------
    //  İŞLEYİCİLER (HANDLERS)
    // -------------------------------------------------------------------------

    /**
     * Yeni sınav başlatma süreci.
     * 1. Boş bir sınav objesi oluşturur.
     * 2. Backend'e kaydeder.
     * 3. Uygulama state'ini günceller ve kullanıcıyı Yoklama sekmesine yönlendirir.
     */
    const handleStart = async () => {
        setShowStartConfirm(false);
        setLoading(true);
        try {
            // Tarih etiketi oluştur
            const today = new Date();
            const dateStr = `${String(today.getDate()).padStart(2, '0')}_${String(today.getMonth() + 1).padStart(2, '0')}_${today.getFullYear()}`;

            // Eğer kullanıcı isim girmediyse otomatik isim ver
            let finalName;
            if (!examName.trim()) {
                finalName = `SNV_${dateStr}`;
            } else {
                finalName = `${examName.trim()}_${dateStr}`;
            }

            // Boş sınav yapısı
            const newExam = {
                id: Date.now().toString(),
                name: finalName,
                timestamp: Date.now(),
                data: {
                    settings: {
                        questionCount: Number(questionCount),
                        scoringType,
                        wrongRatio: Number(wrongRatio),
                        passGrade: Number(passGrade)
                    }
                }
            };

            // Veritabanına kaydet
            if (window.api?.saveExam) {
                await window.api.saveExam(newExam);
            }

            // Global State'e bildir - tam objeyi gönder
            onStartExam(newExam);

            setMsg({ type: 'success', text: `"${finalName}" oluşturuldu. Başlıyor...` });
            setExamName('');
            await refreshExams();
        } catch (e) {
            setMsg({ type: 'error', text: 'Oluşturma hatası: ' + e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleStartClick = () => {
        if (loading) return;
        setShowStartConfirm(true);
    };

    const handleLoadClick = (exam) => {
        if (loading) return;
        setLoadConfirmExam(exam);
    };

    const handleConfirmLoad = async () => {
        if (!loadConfirmExam?.id) return;
        const examId = loadConfirmExam.id;
        setLoadConfirmExam(null);
        await handleLoadExam(examId);
    };

    /**
     * Sınav kaydını siler.
     */
    const handleDelete = async (id) => {
        if (!confirm('Bu sınav kaydını silmek istediğinize emin misiniz?')) return;
        try {
            await window.api.deleteExam(id);
            await refreshExams();
        } catch (e) {
            setMsg({ type: 'error', text: 'Silme işlemi başarısız.' });
        }
    };

    /**
     * Sınav verilerini yükler (tam veriyi çeker).
     */
    const handleLoadExam = async (examId) => {
        setLoading(true);
        try {
            const fullExam = await window.api.getExamById(examId);
            if (fullExam) {
                onLoadExam(fullExam);
            } else {
                setMsg({ type: 'error', text: 'Sınav verisi bulunamadı.' });
            }
        } catch (e) {
            setMsg({ type: 'error', text: 'Sınav yüklenemedi: ' + e.message });
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    //  RENDER
    // -------------------------------------------------------------------------
    return (
        <div className="tab-content glass-panel">
            <div className="tab-header">
                <h2>Sınav Yönetimi</h2>
                <p className="text-secondary">Yeni bir sınav başlatın veya kayıtlı sınavları yönetin.</p>
            </div>

            {/* Yeni Sınav Başlatma Alanı */}
            <div className="modern-exam-creator">
                <div className="creator-header">
                    <span className="creator-icon">🚀</span>
                    <div>
                        <h3 className="creator-title">Yeni Sınav Başlat</h3>
                        <p className="creator-subtitle">Sınav adı girebilir veya otomatik isim ile başlatabilirsiniz</p>
                    </div>
                </div>
                <div className="creator-content-layout">
                    {/* Sol Kolon: İsim ve Başlat */}
                    <div className="creator-left-col">
                        <div className="modern-input-wrapper">

                            <input
                                type="text"
                                placeholder="Sınav Adı (İsteğe Bağlı)"
                                value={examName}
                                onChange={(e) => setExamName(e.target.value)}
                                className="modern-exam-input"
                            />
                            <span className="helper-text">
                                {examName.trim()
                                    ? `* "${examName}_TARIH" olarak kaydedilecek`
                                    : `* Otomatik "SNV_TARIH" olarak kaydedilecek`
                                }
                            </span>
                        </div>
                        <button
                            className="modern-start-btn"
                            onClick={handleStartClick}
                            disabled={loading}
                        >
                            <span className="btn-icon">▶</span>
                            <span className="btn-text">{loading ? 'Oluşturuluyor...' : 'BAŞLA'}</span>
                        </button>
                    </div>

                    {/* Sağ Kolon: Ayarlar */}
                    <div className="creator-right-col">
                        <div className="settings-grid">
                            <div className="modern-input-wrapper">
                                <label>Soru Sayısı</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(e.target.value)}
                                    className="modern-exam-input small"
                                />
                            </div>
                            <div className="modern-input-wrapper">
                                <label>Puanlama</label>
                                <select
                                    value={scoringType}
                                    onChange={(e) => setScoringType(e.target.value)}
                                    className="modern-exam-input small"
                                >
                                    <option value="correct">Doğru Sayısı</option>
                                    <option value="net">Net Sayısı</option>
                                </select>
                            </div>
                            <div className="modern-input-wrapper">
                                <label>Yanlış Götürme</label>
                                <select
                                    value={wrongRatio}
                                    onChange={(e) => setWrongRatio(e.target.value)}
                                    className="modern-exam-input small"
                                    disabled={scoringType === 'correct'}
                                >
                                    <option value="0">Yok</option>
                                    <option value="3">3 Yanlış 1 Doğruyu</option>
                                    <option value="4">4 Yanlış 1 Doğruyu</option>
                                </select>
                            </div>
                            <div className="modern-input-wrapper">
                                <label>Geçer Not</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={passGrade}
                                    onChange={(e) => setPassGrade(e.target.value)}
                                    className="modern-exam-input small"
                                />
                            </div>
                            <button
                                className="apply-settings-btn"
                                onClick={handleApplySettings}
                                title="Ayarları Kaydet ve Uygula"
                            >
                                Sınava Uygula
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

            <div className="divider"></div>

            {/* Sınav Listesi */}
            <div className="list-section">
                <h3>Kayıtlı Sınavlar</h3>
                {exams.length === 0 ? (
                    <div className="empty-state">Henüz kayıtlı sınav bulunmuyor.</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sınav Adı</th>
                                    <th>Kayıt Tarihi</th>
                                    <th>Veri Durumu</th>
                                    <th style={{ textAlign: 'right' }}>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map(exam => {
                                    // Yeni yapı: meta bilgiler doğrudan exam objesinde
                                    const hasAtt = exam.hasAttendance;
                                    const hasOpt = exam.hasOptical;
                                    const hasKey = exam.hasAnswerKey;
                                    const hasRes = exam.hasResults;

                                    return (
                                        <tr key={exam.id}>
                                            <td className="font-bold">{exam.name}</td>
                                            <td className="text-secondary">
                                                {new Date(exam.timestamp).toLocaleString('tr-TR')}
                                            </td>
                                            <td>
                                                <div className="data-badges">
                                                    {/* Ayar Özeti Etiketi */}
                                                    {exam.settings && (
                                                        <span className="badge badge-settings" title="Soru Sayısı | Puanlama | Geçer Not">
                                                            {`${exam.settings.questionCount || 0}${exam.settings.scoringType === 'correct' ? 'D' : 'N'}${exam.settings.passGrade || 0}`}
                                                        </span>
                                                    )}
                                                    {hasAtt && <span className="badge badge-blue">Yoklama</span>}
                                                    {hasOpt && <span className="badge badge-green">Optik</span>}
                                                    {hasKey && <span className="badge badge-purple">Anahtar</span>}
                                                    {hasRes && <span className="badge badge-orange">Sonuç</span>}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className="action-btn load-btn"
                                                    onClick={() => handleLoadClick(exam)}
                                                    title="Yükle"
                                                >
                                                    📂 Yükle
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => handleDelete(exam.id)}
                                                    title="Sil"
                                                >
                                                    🗑️ Sil
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showStartConfirm && (
                <div className="start-confirm-overlay" onClick={() => setShowStartConfirm(false)}>
                    <div className="start-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Sınav Ayar Onayı</h3>
                        <p className="start-confirm-text">Bu ayarlar sınavın tamamını etkileyecektir. Başlatmadan önce kontrol edin.</p>
                        <div className="start-settings-list">
                            <div><strong>Soru Sayısı:</strong> {questionCount}</div>
                            <div><strong>Puanlama:</strong> {scoringType === 'correct' ? 'Doğru Sayısı' : 'Net Sayısı'}</div>
                            <div><strong>Yanlış Götürme:</strong> {scoringType === 'correct' ? 'Pasif (Doğru Sayısı seçili)' : (wrongRatio === '0' ? 'Yok' : `${wrongRatio} Yanlış 1 Doğruyu`)}</div>
                            <div><strong>Geçer Not:</strong> {passGrade}</div>
                            <div><strong>Puan Hassasiyeti:</strong> 1 ondalık basamak</div>
                        </div>
                        <div className="start-confirm-actions">
                            <button className="action-btn" onClick={() => setShowStartConfirm(false)}>
                                Vazgeç
                            </button>
                            <button className="modern-start-btn" onClick={handleStart} disabled={loading}>
                                {loading ? 'Oluşturuluyor...' : 'Onayla ve Başlat'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loadConfirmExam && (
                <div className="start-confirm-overlay" onClick={() => setLoadConfirmExam(null)}>
                    <div className="start-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Sınav Yükleme Onayı</h3>
                        <p className="start-confirm-text">
                            <strong>{loadConfirmExam.name}</strong> sınavını yüklemek üzeresiniz. Bu işlemle kayıtlı veriler ekrana getirilecektir.
                        </p>
                        <div className="start-settings-list">
                            <div><strong>Sınav Adı:</strong> {loadConfirmExam.name}</div>
                            <div><strong>Kayıt Tarihi:</strong> {new Date(loadConfirmExam.timestamp).toLocaleString('tr-TR')}</div>
                            <div><strong>Soru Sayısı:</strong> {loadConfirmExam.settings?.questionCount ?? '-'}</div>
                            <div><strong>Puanlama:</strong> {loadConfirmExam.settings?.scoringType === 'net' ? 'Net Sayısı' : 'Doğru Sayısı'}</div>
                            <div>
                                <strong>Yanlış Götürme:</strong>{' '}
                                {loadConfirmExam.settings?.scoringType === 'net'
                                    ? (loadConfirmExam.settings?.wrongRatio ? `${loadConfirmExam.settings.wrongRatio} Yanlış 1 Doğruyu` : 'Yok')
                                    : 'Pasif'}
                            </div>
                            <div><strong>Geçer Not:</strong> {loadConfirmExam.settings?.passGrade ?? '-'}</div>
                            <div>
                                <strong>Veri Durumu:</strong>{' '}
                                {[
                                    loadConfirmExam.hasAttendance ? 'Yoklama' : null,
                                    loadConfirmExam.hasOptical ? 'Optik' : null,
                                    loadConfirmExam.hasAnswerKey ? 'Anahtar' : null,
                                    loadConfirmExam.hasResults ? 'Sonuç' : null
                                ].filter(Boolean).join(', ') || 'Yüklü veri yok'}
                            </div>
                        </div>
                        <div className="start-confirm-actions">
                            <button className="action-btn" onClick={() => setLoadConfirmExam(null)}>
                                Vazgeç
                            </button>
                            <button className="modern-start-btn" onClick={handleConfirmLoad} disabled={loading}>
                                {loading ? 'Yükleniyor...' : 'Onayla ve Yükle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* ===== MODERN EXAM CREATOR ===== */
                .modern-exam-creator {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 28px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
                }

                .creator-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .creator-icon {
                    font-size: 2.5rem;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 12px;
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                }

                .creator-title {
                    margin: 0;
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .creator-subtitle {
                    margin: 4px 0 0 0;
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.9);
                }

                .creator-input-section {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                    align-items: stretch;
                }

                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 15px;
                    border-radius: 12px;
                }

                .creator-content-layout {
                    display: flex;
                    gap: 20px;
                    align-items: flex-start;
                }

                .creator-left-col {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    background: #7C76CF;
                    padding: 15px;
                    border-radius: 12px;
                }

                .creator-right-col {
                    flex: 2;
                }

                .apply-settings-btn {
                    grid-column: span 2;
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-top: 5px;
                    transition: all 0.2s;
                }
                
                .apply-settings-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .modern-input-wrapper {
                    position: relative;
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                }

                .helper-text {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.6);
                    margin-top: 4px;
                    margin-left: 2px;
                    font-style: italic;
                }

                .modern-input-wrapper label {
                    display: block;
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 2px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .modern-exam-input.small {
                    padding: 8px;
                    font-size: 0.9rem;
                }

                .input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.2rem;
                    pointer-events: none;
                    line-height: 1;
                    display: flex;
                    align-items: center;
                }

                .modern-exam-input {
                    width: 100%;
                    padding: 14px;
                    background: white;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    font-size: 1rem;
                    color: #1e293b;
                    font-weight: 500;
                    box-sizing: border-box;
                    transition: all 0.3s ease;
                }

                .modern-exam-input:focus {
                    outline: none;
                    border-color: #fbbf24;
                    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
                }

                .modern-exam-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background: rgba(255, 255, 255, 0.75);
                }

                .modern-exam-input::placeholder {
                    color: #94a3b8;
                }

                .modern-start-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #F39B0B;
                    color: white;
                    padding: 14px 32px;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(243, 155, 11, 0.3);
                    white-space: nowrap;
                }

                .modern-start-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(243, 155, 11, 0.4);
                }

                .modern-start-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-icon {
                    font-size: 1rem;
                }

                .btn-text {
                    font-weight: 700;
                }

                .creator-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 12px 16px;
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                }

                .info-icon {
                    font-size: 1.2rem;
                }

                .info-text {
                    color: white;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                /* ===== TABLE SECTION ===== */
                .list-section h3 {
                    margin-bottom: 16px;
                    font-size: 1.3rem;
                    color: #1e293b;
                    font-weight: 700;
                }

                .divider {
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 30px 0;
                }

                .table-wrapper {
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%);
                    padding: 16px;
                    text-align: left;
                    font-weight: 700;
                    color: #0f172a;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                td {
                    padding: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    color: #1e293b;
                    font-weight: 500;
                }

                tr:last-child td {
                    border-bottom: none;
                }

                tr:hover {
                    background: rgba(102, 126, 234, 0.1);
                }

                .data-badges {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .badge-blue {
                    background: rgba(59, 130, 246, 0.25);
                    color: #60a5fa;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                }

                .badge-green {
                    background: rgba(16, 185, 129, 0.25);
                    color: #34d399;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }

                .badge-purple {
                    background: rgba(139, 92, 246, 0.25);
                    color: #a78bfa;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                }

                .badge-orange {
                    background: rgba(245, 158, 11, 0.25);
                    color: #fbbf24;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }

                .badge-settings {
                    background: rgba(226, 232, 240, 0.8);
                    color: #000;
                    border: 1px solid rgba(148, 163, 184, 0.6);
                    font-family: 'Courier New', Courier, monospace;
                    font-weight: 700;
                }

                .action-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    padding: 8px 14px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    margin-left: 6px;
                    font-weight: 600;
                    color: #475569;
                }

                .load-btn {
                    color: #3b82f6;
                }

                .delete-btn {
                    color: #ef4444;
                }

                .load-btn:hover {
                    background: rgba(59, 130, 246, 0.15);
                    border-color: #3b82f6;
                    color: #2563eb;
                }

                .delete-btn:hover {
                    background: rgba(239, 68, 68, 0.15);
                    border-color: #ef4444;
                    color: #dc2626;
                }

                .alert {
                    padding: 14px 18px;
                    border-radius: 10px;
                    margin-top: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 500;
                }

                .alert.success {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
                    color: #34d399;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }

                .alert.error {
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
                    color: #f87171;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .text-secondary {
                    color: #64748b !important;
                }

                .font-bold {
                    font-weight: 700;
                    color: #0f172a !important;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #94a3b8;
                    font-size: 1.1rem;
                }

                /* ===== LIGHT MODE STYLES ===== */
                .light-mode .modern-exam-creator {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .light-mode .modern-exam-input {
                    background: white;
                    color: #1e293b;
                }

                .light-mode .list-section h3 {
                    color: #1e293b;
                }

                .light-mode .divider {
                    background: rgba(0, 0, 0, 0.1);
                }

                .light-mode .table-wrapper {
                    border-color: rgba(0, 0, 0, 0.1);
                }

                .light-mode th {
                    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                    color: #1e293b;
                }

                .light-mode td {
                    color: #334155;
                    border-bottom-color: rgba(0, 0, 0, 0.05);
                }

                .light-mode tr:hover {
                    background: rgba(102, 126, 234, 0.05);
                }

                .light-mode .action-btn {
                    background: rgba(0, 0, 0, 0.05);
                    border-color: rgba(0, 0, 0, 0.1);
                    color: #64748b;
                }

                .light-mode .load-btn:hover {
                    background: rgba(59, 130, 246, 0.15);
                    color: #3b82f6;
                }

                .light-mode .delete-btn:hover {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .light-mode .empty-state {
                    color: #94a3b8;
                }

                .start-confirm-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.55);
                    z-index: 1200;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 16px;
                }

                .start-confirm-modal {
                    width: 520px;
                    max-width: 100%;
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
                    color: #1e293b;
                }

                .start-confirm-modal h3 {
                    margin: 0 0 10px 0;
                    font-size: 1.3rem;
                }

                .start-confirm-text {
                    margin: 0 0 12px 0;
                    color: #475569;
                    font-size: 0.95rem;
                }

                .start-settings-list {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 12px;
                    display: grid;
                    gap: 8px;
                    margin-bottom: 14px;
                    font-size: 0.95rem;
                }

                .start-confirm-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
            `}</style>
        </div >
    );
}
