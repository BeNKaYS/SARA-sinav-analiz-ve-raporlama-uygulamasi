import React, { useState, useEffect } from 'react';

export default function HelpModal({ onClose }) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('hideHelpOnStartup');
        if (stored === 'true') setDontShowAgain(true);
    }, []);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('hideHelpOnStartup', 'true');
        } else {
            localStorage.removeItem('hideHelpOnStartup');
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📖 Kullanım Kılavuzu</h2>
                    <button className="close-btn" onClick={handleClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <section>
                        <h3>🚀 1. Başlangıç (Sınav Yönetimi)</h3>
                        <p>Uygulamayı açtığınızda <strong>Sınav Yönetimi</strong> ekranı sizi karşılar.</p>
                        <div className="subsection">
                            <h4>Yeni Sınav Başlatma</h4>
                            <ol>
                                <li><strong>Sınav Adı</strong> kutusuna ismi yazın (Örn: <code>SRC Sınavı</code>).</li>
                                <li><code>BAŞLA</code> butonuna tıklayın.</li>
                                <li>Tarih otomatik eklenir ve veri girişine yönlendirilirsiniz.</li>
                            </ol>
                        </div>
                        <div className="subsection">
                            <h4>Kayıtlı Sınavlar</h4>
                            <ul>
                                <li><code>📂 Yükle</code>: Yarım kalan sınava devam edin.</li>
                                <li><code>🗑️ Sil</code>: Sınavı kalıcı olarak silin.</li>
                                <li><strong>Durum Rozetleri:</strong> Hangi verilerin yüklü olduğunu gösterir (Yeşil/Kırmızı).</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h3>📋 2. Yoklama Listesi</h3>
                        <p>Sınava girecek adayların listesini yükleyin (.xlsx / .xls).</p>
                        <div className="info-box">
                            <strong>Gerekli Sütunlar:</strong> <code>TC Kimlik</code>, <code>Ad Soyad</code>, <code>Belge Türü</code>
                        </div>
                    </section>

                    <section>
                        <h3>👁️ 3. Optik Veri Yükleme</h3>
                        <p>Optik okuyucudan alınan .txt veya .fmt dosyasını işleyin.</p>
                        <ul>
                            <li><strong>Parser Ayarları:</strong> Sağ panelden verilerin başlangıç ve uzunluklarını ayarlayın.</li>
                            <li><code>Uygula</code> butonu ile anlık önizleme yapın.</li>
                            <li>TC No, Ad Soyad, Kitapçık vb. alanların doğru ayrıştığından emin olun.</li>
                        </ul>
                    </section>

                    <section>
                        <h3>🔑 4. Cevap Anahtarı</h3>
                        <p>Doğru/Yanlış hesaplaması için cevap anahtarı excel dosyasını yükleyin.</p>
                        <ul>
                            <li>Excel <strong>Sayfa İsimleri (Sheet)</strong> kitapçık türü olmalıdır (A, B).</li>
                            <li>Sütun başlıkları belge türü olmalıdır (SRC1, ÜDY3).</li>
                        </ul>
                    </section>

                    <section>
                        <h3>⚖️ 5. Değerlendirme</h3>
                        <p>Tüm veriler hazır olduğunda <code>DEĞERLENDİR</code> butonuna basın.</p>
                        <ul>
                            <li>Sistem puanları ve başarı durumunu hesaplar.</li>
                            <li><code>📥 Excel Olarak İndir</code> ile resmi rapor alın.</li>
                        </ul>
                    </section>

                    <section>
                        <h3>📊 6. İstatistikler</h3>
                        <p>Başarı oranları, ortalamalar ve geçmiş sınav karşılaştırmalarını inceleyin. <code>🖨️ Yazdır</code> ile PDF alın.</p>
                    </section>

                    <div className="version-info">
                        <strong>Versiyon:</strong> 1.6.0 | <strong>Güncelleme:</strong> 19 Ocak 2026
                    </div>

                    <div className="developer-info">
                        <div><strong>Geliştirici:</strong> Sercan ÖZDEMİR (BeNKaYS)</div>
                        <div style={{ margin: '5px 0' }}><em>sercanozdemir@yandex.com</em></div>
                        <div style={{ marginTop: '15px' }}>
                            <a href="https://wa.me/905068858585?text=Merhaba%20bilgi%20almak%20istiyorum"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="whatsapp-btn">
                                💬 WhatsApp Destek Hattı
                            </a>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                        />
                        Başlangıçta bir daha gösterme
                    </label>
                    <button className="primary-btn" onClick={handleClose}>Anladım</button>
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    animation: fadeIn 0.2s;
                }
                .modal-content {
                    width: 800px;
                    max-width: 90%;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.98);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 12px;
                    backdrop-filter: blur(20px);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                }
                .modal-header h2 { 
                    margin: 0; 
                    font-size: 1.5rem; 
                    color: var(--accent); 
                }
                .close-btn {
                    background: none; 
                    border: none; 
                    font-size: 2rem; 
                    color: rgba(0,0,0,0.4); 
                    cursor: pointer;
                    transition: color 0.2s;
                    line-height: 1;
                }
                .close-btn:hover { color: #000; }
                
                .modal-body {
                    overflow-y: auto;
                    padding: 20px;
                    flex: 1;
                }
                .modal-footer {
                    padding: 15px 20px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #475569;
                    font-size: 0.9rem;
                    cursor: pointer;
                    user-select: none;
                }
                section { margin-bottom: 25px; }
                section h3 { 
                    color: #1e293b; 
                    margin-bottom: 10px; 
                    font-size: 1.1rem; 
                    border-left: 3px solid var(--accent); 
                    padding-left: 10px; 
                }
                section p { 
                    font-size: 0.95rem; 
                    color: #334155; 
                    margin-bottom: 5px; 
                }
                section ul { 
                    margin: 5px 0 0 20px; 
                    color: #475569; 
                    font-size: 0.9rem; 
                }
                section li { margin-bottom: 5px; }
                
                code {
                    background: rgba(79, 70, 229, 0.1);
                    color: #4f46e5;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 0.9em;
                }

                .developer-info {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                    text-align: center;
                    font-size: 0.9rem;
                    color: #64748b;
                }

                .subsection {
                    margin-left: 20px;
                    margin-bottom: 15px;
                    border-left: 2px solid #e2e8f0;
                    padding-left: 15px;
                }
                .subsection h4 {
                    margin: 0 0 8px 0;
                    color: var(--accent);
                    font-size: 1rem;
                }
                .info-box {
                    background: rgba(59, 130, 246, 0.1);
                    border-left: 4px solid #3b82f6;
                    padding: 10px 15px;
                    border-radius: 4px;
                    color: #1e3a8a;
                    font-size: 0.9rem;
                    margin-top: 10px;
                }

                .whatsapp-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background-color: #25D366;
                    color: white;
                    text-decoration: none;
                    padding: 8px 20px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3);
                }
                .whatsapp-btn:hover {
                    background-color: #22c55e;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(37, 211, 102, 0.4);
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}
