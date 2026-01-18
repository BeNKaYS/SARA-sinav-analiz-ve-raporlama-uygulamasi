/**
 * @file AboutTab.jsx
 * @description Uygulama hakkında bilgiler, geliştirici kartı ve tema ayarları.
 * @author Sercan ÖZDEMİR
 * @date 2024
 */

export default function AboutTab() {



    return (
        <div className="tab-content glass-panel" style={{ animation: 'fadeIn 0.4s ease' }}>
            <div className="about-container">

                {/* Header Section */}
                <div className="about-header text-center">
                    <div className="logo-placeholder">👁️</div>
                    <h1>Optik Değerlendirme</h1>
                    <p className="version">v1.6.0 (Stable)</p>
                    <p className="description">
                        Eğitim kurumları için geliştirilmiş, hızlı, güvenli ve çevrimdışı çalışabilen
                        gelişmiş optik form okuma ve değerlendirme sistemi.
                    </p>
                </div>

                <div className="divider"></div>

                {/* Developer Card */}
                <div className="dev-card-wrapper">
                    <h3>👨‍💻 Geliştirici Kartı</h3>
                    <div className="dev-card glass-panel-inner">
                        <div className="dev-avatar">SÖ</div>
                        <div className="dev-info">
                            <h2 className="dev-name">Sercan ÖZDEMİR</h2>
                            <p className="dev-title">Bilişim Teknolojileri Öğretmeni</p>
                            <p className="dev-alias">@BeNKaYS</p>
                            <p className="dev-tagline">Makine Öğrenmesi & C++ Tutkunu</p>

                            <div className="dev-bio">
                                <p><em>"Kod sadece çalışmamalı, anlaşılmalı."</em></p>
                                <p className="bio-text">
                                    Eğitim ve yazılımı aynı potada eriten; özellikle C++, algoritmalar ve
                                    Makine Öğrenmesi odaklı projeler geliştiren bir geliştiriciyim.
                                </p>
                            </div>

                            <div className="dev-expertise">
                                <h4>🧩 Uzmanlık Alanları</h4>
                                <div className="expertise-tags">
                                    <span>🧠 Makine Öğrenmesi</span>
                                    <span>⚙️ C++ (OOP, Performans)</span>
                                    <span>🖥️ Algoritma & Mantıksal Tasarım</span>
                                    <span>📚 Eğitim Odaklı Yazılım</span>
                                    <span>🔧 Sistem & Uygulama Geliştirme</span>
                                </div>
                            </div>

                            <div className="dev-links">
                                <a href="mailto:sercanozdemir@yandex.com" className="dev-link">
                                    📧 E-posta
                                </a>
                                <a href="https://wa.me/905068858585?text=Merhaba%20bilgi%20almak%20istiyorum"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="dev-link whatsapp">
                                    💬 WhatsApp
                                </a>
                            </div>

                            <div className="dev-motto">
                                <strong>✨ Motto:</strong> <em>"Üreten öğretir, öğreten kalıcı iz bırakır."</em>
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* Settings / Appearance */}




                    {/* Tech Stack */}
                    <div className="tech-stack">
                        <h4>🛠️ Teknoloji Yığını</h4>
                        <div className="tags">
                            <span>C++</span>
                            <span>Python</span>
                            <span>Git</span>
                            <span>Linux</span>
                            <span>OpenCV</span>
                            <span>VS Code</span>
                        </div>
                        <h4 style={{ marginTop: '30px' }}>Bu Projede Kullanılanlar</h4>
                        <div className="tags">
                            <span>Electron.js</span>
                            <span>React</span>
                            <span>Node.js</span>
                            <span>XLSX</span>
                        </div>
                    </div>

                    <footer className="about-footer">
                        <p>&copy; 2024 Tüm Hakları Saklıdır.</p>
                    </footer>
                </div>
            </div>

            <style>{`
                .about-container {
                    max-width: 800px;
                    margin: 0 auto;
                    color: var(--text-primary);
                }
                .text-center { text-align: center; }
                
                .logo-placeholder { font-size: 4rem; margin-bottom: 10px; }
                .about-header h1 { font-size: 2.5rem; margin: 10px 0; background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .version { color: var(--text-secondary); font-family: monospace; background: rgba(0,0,0,0.2); display: inline-block; padding: 4px 10px; border-radius: 20px; }
                .description { margin-top: 20px; font-size: 1.1rem; line-height: 1.6; color: var(--text-secondary); max-width: 600px; margin-left: auto; margin-right: auto; }

                .divider { height: 1px; background: rgba(255,255,255,0.1); margin: 40px 0; }
                .light-mode .divider { background: rgba(0,0,0,0.1); }

                .dev-card-wrapper h3 { margin-bottom: 20px; color: var(--accent); }
                .dev-card {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                    padding: 30px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    transition: transform 0.3s ease;
                }
                .light-mode .dev-card { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.1); }
                .dev-card:hover { transform: translateY(-5px); border-color: var(--accent); }

                .dev-avatar {
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: white;
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
                }

                .dev-info { flex: 1; }
                .dev-name { margin: 0; font-size: 1.8rem; }
                .dev-title { color: var(--success); margin: 5px 0; font-weight: 500; }
                .dev-alias { color: var(--text-secondary); font-family: monospace; margin-bottom: 5px; }
                .dev-tagline { 
                    color: var(--accent); 
                    font-weight: 600; 
                    margin: 5px 0 15px 0;
                    font-size: 1.1rem;
                }

                .dev-bio {
                    margin: 20px 0;
                    padding: 15px;
                    background: rgba(255,255,255,0.02);
                    border-left: 3px solid var(--accent);
                    border-radius: 6px;
                }
                .light-mode .dev-bio { background: rgba(0,0,0,0.02); }
                .dev-bio p:first-child {
                    color: var(--accent);
                    font-size: 1rem;
                    margin-bottom: 10px;
                }
                .bio-text {
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin: 0;
                }

                .dev-expertise {
                    margin: 20px 0;
                }
                .dev-expertise h4 {
                    font-size: 1rem;
                    margin-bottom: 12px;
                    color: var(--accent);
                }
                .expertise-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .expertise-tags span {
                    padding: 8px 14px;
                    background: rgba(99, 102, 241, 0.1);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 20px;
                    font-size: 0.85rem;
                    color: var(--text-primary);
                    transition: all 0.2s;
                }
                .expertise-tags span:hover {
                    background: rgba(99, 102, 241, 0.2);
                    transform: translateY(-2px);
                }

                .dev-links {
                    display: flex;
                    gap: 15px;
                    margin: 20px 0;
                }
                .dev-link { 
                    color: var(--accent); 
                    text-decoration: none; 
                    font-weight: 500; 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 8px;
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    transition: all 0.2s;
                }
                .dev-link:hover { 
                    background: rgba(99, 102, 241, 0.2);
                    transform: translateY(-2px);
                }
                .dev-link.whatsapp {
                    background: rgba(37, 211, 102, 0.1);
                    border-color: rgba(37, 211, 102, 0.2);
                    color: #25d366;
                }
                .dev-link.whatsapp:hover {
                    background: rgba(37, 211, 102, 0.2);
                }

                .dev-motto {
                    margin-top: 20px;
                    padding: 12px;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(99, 102, 241, 0.1));
                    border-radius: 8px;
                    text-align: center;
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                }
                .dev-motto strong {
                    color: var(--accent);
                }
                .dev-motto em {
                    color: var(--text-primary);
                }

                .settings-section h3 { margin-bottom: 20px; }
                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 12px;
                }
                .light-mode .setting-item { background: rgba(0,0,0,0.03); }

                .setting-label { display: flex; flex-direction: column; gap: 5px; }
                .setting-label span { font-weight: 600; font-size: 1.1rem; }
                .setting-label small { color: var(--text-secondary); }

                .theme-toggle-btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: none;
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                .theme-toggle-btn:hover { border-color: var(--accent); transform: scale(1.05); }
                .theme-toggle-btn.light { background: #e0f2fe; color: #0284c7; }
                .theme-toggle-btn.dark { background: #1e293b; color: #fcd34d; }

                .tech-stack { text-align: center; margin-top: 50px; }
                .tech-stack h4 { color: var(--text-secondary); margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem; }
                .tags { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
                .tags span { 
                    padding: 6px 14px; 
                    background: rgba(255,255,255,0.05); 
                    border-radius: 20px; 
                    font-size: 0.9rem; 
                    color: var(--text-secondary);
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .light-mode .tags span { background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.1); }

                .about-footer { text-align: center; margin-top: 60px; color: var(--text-secondary); font-size: 0.8rem; opacity: 0.6; }
            `}</style>
        </div>
    );
}
