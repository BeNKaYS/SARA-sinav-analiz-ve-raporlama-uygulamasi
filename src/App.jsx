
import React, { useState, useEffect } from 'react';
import AttendanceTab from './components/Tabs/AttendanceTab';
import OpticalTab from './components/Tabs/OpticalTab';
import AnswerKeyTab from './components/Tabs/AnswerKeyTab';
import EvaluationTab from './components/Tabs/EvaluationTab';
import ReportsTab from './components/Tabs/ReportsTab';
import ExamsTab from './components/Tabs/ExamsTab';
import StatsTab from './components/Tabs/StatsTab';
import HelpModal from './components/HelpModal';
import CheatingReport from './components/CheatingReport';
import AboutTab from './components/Tabs/AboutTab';
import './App.css';
import LicenseModal from './components/LicenseModal';

// ANA UYGULAMA BİLEŞENİ
const MainApp = () => {
  // -------------------------------------------------------------------------
  //  1. TÜM HOOK'LAR EN ÜSTTE TANIMLANMALI
  // -------------------------------------------------------------------------

  // UI State
  const [activeTab, setActiveTab] = useState('exams');
  const [showHelp, setShowHelp] = useState(false);
  const [licenseValid, setLicenseValid] = useState(null);

  // Data States
  const [examInfo, setExamInfo] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [opticalData, setOpticalData] = useState(null);
  const [answerKeyData, setAnswerKeyData] = useState(null);
  const [results, setResults] = useState(null);

  // License Check Hook
  useEffect(() => {
    const checkLicense = async () => {
      if (window.api && window.api.checkLicenseStatus) {
        try {
          const res = await window.api.checkLicenseStatus();
          setLicenseValid(res.valid);
        } catch (e) {
          setLicenseValid(false);
        }
      } else {
        // Dev mode or web
        setLicenseValid(true);
      }
    };
    checkLicense();
  }, []);

  // Help Modal Logic (Startup & F1 Shortcut) Hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Menu Listener
    if (window.api && window.api.onMenuShowHelp) {
      window.api.onMenuShowHelp(() => {
        setShowHelp(true);
      });
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // -------------------------------------------------------------------------
  //  2. YARDIMCI FONSİYONLAR (HOOK DEĞİL, NORMAL FONKSİYONLAR)
  // -------------------------------------------------------------------------

  const handleStartExam = (examOrName) => {
    if (typeof examOrName === 'object' && examOrName.id) {
      setExamInfo({
        id: examOrName.id,
        name: examOrName.name,
        timestamp: examOrName.timestamp
      });
    } else {
      const name = typeof examOrName === 'object' ? examOrName.name : examOrName;
      const settings = typeof examOrName === 'object' ? examOrName.settings : {};

      setExamInfo({
        id: Date.now().toString(),
        name: name,
        timestamp: Date.now(),
        data: { settings }
      });
    }
    setAttendanceData(null);
    setOpticalData(null);
    setAnswerKeyData(null);
    setResults(null);

    // Yeni sınav başlarken localStorage'daki eski verileri temizle
    localStorage.removeItem('attendance_data');
    localStorage.removeItem('attendance_file_name');

    setActiveTab('attendance');
  };

  const handleUpdateSettings = (newSettings) => {
    if (!examInfo) return;
    setExamInfo(prev => ({
      ...prev,
      data: {
        ...prev.data,
        settings: newSettings
      }
    }));
    saveCurrentExam({ settings: newSettings });
  };

  const handleLoadExam = (exam) => {
    if (!exam || !exam.data) return;
    setExamInfo({
      id: exam.id,
      name: exam.name.split(' _')[0] || exam.name,
      timestamp: exam.timestamp
    });
    setAttendanceData(exam.data.attendanceData || null);
    setOpticalData(exam.data.opticalData || null);
    setAnswerKeyData(exam.data.answerKeyData || null);
    setResults(exam.data.results || null);
    setActiveTab('evaluation');
  };

  // Helper to ensure consistent saving with metadata
  const saveCurrentExam = async (overrideData = {}) => {
    if (!examInfo || !window.api?.saveExam) return;

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}_${String(today.getMonth() + 1).padStart(2, '0')}_${today.getFullYear()}`;
    let finalName = examInfo.name;
    if (!finalName.includes(dateStr)) {
      finalName = `${finalName} _${dateStr}`;
    }

    const currentData = {
      attendanceData,
      opticalData,
      answerKeyData,
      results,
      settings: examInfo?.data?.settings,
      ...overrideData
    };

    const examObj = {
      id: examInfo.id,
      name: finalName,
      timestamp: Date.now(),
      hasAttendance: !!currentData.attendanceData,
      hasOptical: !!currentData.opticalData,
      hasAnswerKey: !!currentData.answerKeyData,
      hasResults: !!currentData.results,
      data: currentData
    };

    try {
      await window.api.saveExam(examObj);
      console.log("Sınav kaydedildi:", finalName);
    } catch (e) {
      console.error("Kayıt hatası:", e);
    }
  };

  const handleAutoSave = async (calculatedResults) => {
    await saveCurrentExam({ results: calculatedResults || results });
  };

  const handleOpenCheating = (exam) => {
    if (exam) {
      handleLoadExam(exam);
    }
    setActiveTab('cheating');
  };

  const moduleItems = [
    { id: 'exams', icon: 'folder', colorClass: 'tone-red', panelClass: 'panel-red', label: 'Sınavlar', desc: 'Yeni sınav başlatma, kayıtlı sınavları güvenli şekilde yükleme/silme ve sınav ayarlarını merkezi olarak yönetme ekranı. Bu modülde yapılan ayarlar, sonraki tüm değerlendirme adımlarını doğrudan etkiler.' },
    { id: 'attendance', icon: 'list', colorClass: 'tone-yellow', panelClass: 'panel-yellow', label: 'Yoklama', desc: 'Aday listesini Excel dosyasından içeri alır, zorunlu alanları kontrol eder ve değerlendirme için referans veri setini hazırlar. TC Kimlik, Ad Soyad ve Belge Türü doğruluğu bu aşamada kritik önemdedir.' },
    { id: 'optical', icon: 'scan', colorClass: 'tone-green', panelClass: 'panel-green', label: 'Optik', desc: 'Optik okuyucudan gelen TXT/FMT verilerini parser kurallarıyla ayrıştırır. Alan başlangıç/uzunluk ayarlarını düzenleyerek TC, kitapçık ve cevap alanlarının doğru eşleşmesini sağlamanıza yardımcı olur.' },
    { id: 'answerKey', icon: 'key', colorClass: 'tone-blue', panelClass: 'panel-blue', label: 'Anahtar', desc: 'Cevap anahtarını kitapçık türü ve belge türüne göre sisteme tanımlar. Bu eşleştirme, doğru-yanlış ve net hesaplamalarının hatasız yapılabilmesi için temel kaynaktır.' },
    { id: 'evaluation', icon: 'calc', colorClass: 'tone-pink', panelClass: 'panel-pink', label: 'Değerlendirme', desc: 'Yoklama, optik veri ve cevap anahtarı birlikte işlenerek aday bazlı puan, net ve başarı durumu hesaplanır. Sonuçlar burada gözden geçirilir ve resmi çıktı öncesi son kontrol yapılır.' },
    { id: 'reports', icon: 'report', colorClass: 'tone-cyan', panelClass: 'panel-cyan', label: 'Raporlar', desc: 'Değerlendirme çıktılarının resmi formatta sunulduğu ve dışa aktarıldığı modüldür. Excel/PDF benzeri çıktılar için gerekli rapor düzeni, başlıklar ve içerik bu bölümden yönetilir.' },
    { id: 'stats', icon: 'chart', colorClass: 'tone-orange', panelClass: 'panel-orange', label: 'İstatistik', desc: 'Sınav performansını genel başarı oranı, ortalama ve dağılım metrikleriyle analiz eder. Geçmiş sınavlarla karşılaştırmalı görünüm sağlayarak karar destek sürecini güçlendirir.' },
    { id: 'about', icon: 'info', colorClass: 'tone-info', panelClass: 'panel-info', label: 'Hakkında', desc: 'Uygulamanın amacı, sürüm geçmişi, geliştirici bilgisi ve destek kanallarını içerir. Teknik kimlik ve kullanım bağlamı bu modülde özet şekilde sunulur.' }
  ];

  const MenuIcon = ({ name }) => {
    const svgProps = {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2.8,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className: 'tool-icon-svg'
    };

    switch (name) {
      case 'folder': return <svg {...svgProps}><path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>;
      case 'list': return <svg {...svgProps}><path d="M8 7h12" /><path d="M8 12h12" /><path d="M8 17h12" /><circle cx="4" cy="7" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="17" r="1" /></svg>;
      case 'scan': return <svg {...svgProps}><path d="M4 7V5h2" /><path d="M20 7V5h-2" /><path d="M4 17v2h2" /><path d="M20 17v2h-2" /><path d="M7 12h10" /></svg>;
      case 'key': return <svg {...svgProps}><circle cx="8" cy="12" r="3" /><path d="M11 12h9" /><path d="M16 12v2" /><path d="M19 12v2" /></svg>;
      case 'calc': return <svg {...svgProps}><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8 8h8" /><path d="M8 12h3" /><path d="M13 12h3" /><path d="M8 16h3" /><path d="M13 16h3" /></svg>;
      case 'report': return <svg {...svgProps}><path d="M7 4h8l4 4v12H7z" /><path d="M15 4v4h4" /><path d="M10 13h6" /><path d="M10 17h6" /></svg>;
      case 'chart': return <svg {...svgProps}><path d="M5 19V9" /><path d="M11 19V5" /><path d="M17 19v-7" /></svg>;
      case 'info': return <svg {...svgProps}><circle cx="12" cy="12" r="8" /><path d="M12 11v5" /><circle cx="12" cy="8" r="1" fill="currentColor" /></svg>;
      default: return <svg {...svgProps}><circle cx="12" cy="12" r="8" /></svg>;
    }
  };

  const activeModule = moduleItems.find((item) => item.id === activeTab) || moduleItems[0];
  const statusText = examInfo?.name ? `Aktif sınav: ${examInfo.name}` : 'Hazır';

  // -------------------------------------------------------------------------
  //  3. KOŞULLU RENDER (HOOK'LARDAN SONRA OLMALI)
  // -------------------------------------------------------------------------

  if (licenseValid === null) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#64748b',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Optik Değerlendirme</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Sistem Kontrol Ediliyor...</p>
        </div>
      </div>
    );
  }

  if (licenseValid === false) {
    return <LicenseModal onSuccess={() => setLicenseValid(true)} />;
  }

  return (
    <div className="app-container">
      <aside className="left-menu">
        <div className="menu-brand" title="SARA">
          <img src="/SARA_PNG.png" alt="SARA" className="menu-brand-logo" />
        </div>

        <div className="menu-tools">
          {moduleItems.filter((item) => item.id !== 'about').map((item) => (
            <button
              key={item.id}
              className={`tool-btn ${item.colorClass} ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <MenuIcon name={item.icon} />
            </button>
          ))}
        </div>

        <div className="menu-bottom-tools">
          <button
            className={`tool-btn tone-info info-round ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
            title="Hakkında"
          >
            <MenuIcon name="info" />
          </button>
        </div>
      </aside>

      <section className="main-zone">
        <header className={`module-description glass-panel ${activeModule.panelClass}`}>
          <div className="module-title-row">
            <h1>{activeModule.label}</h1>
          </div>
          <p className="module-desc-text">{activeModule.desc}</p>
        </header>

        <main className="module-workspace glass-panel">
          {activeTab === 'attendance' && <AttendanceTab data={attendanceData} setData={setAttendanceData} onNext={() => setActiveTab('optical')} />}
          {activeTab === 'optical' && <OpticalTab data={opticalData} setData={setOpticalData} attendanceData={attendanceData} onNext={() => setActiveTab('answerKey')} />}
          {activeTab === 'answerKey' && <AnswerKeyTab data={answerKeyData} setData={setAnswerKeyData} attendanceData={attendanceData} onNext={() => setActiveTab('evaluation')} onSave={(newData) => {
            setAnswerKeyData(newData);
            saveCurrentExam({ answerKeyData: newData });
          }} />}
          {activeTab === 'evaluation' && <EvaluationTab attendanceData={attendanceData} opticalData={opticalData} answerKeyData={answerKeyData} results={results} setResults={setResults} onSave={handleAutoSave} examSettings={examInfo?.data?.settings} />}
          {activeTab === 'reports' && <ReportsTab results={results} examName={examInfo?.name} answerKey={answerKeyData} examSettings={examInfo?.data?.settings} />}
          {activeTab === 'exams' && <ExamsTab currentData={{ attendanceData, opticalData, answerKeyData, results }} onLoadExam={handleLoadExam} onStartExam={handleStartExam} onUpdateSettings={handleUpdateSettings} />}
          {activeTab === 'stats' && <StatsTab onOpenCheating={handleOpenCheating} />}
          {activeTab === 'cheating' && <CheatingReport results={results} examName={examInfo?.name} answerKey={answerKeyData} />}
          {activeTab === 'about' && <AboutTab />}
        </main>

        <footer className="status-bar">
          <span>Durum: {statusText}</span>
          <span>Modül: {activeModule.label}</span>
        </footer>
      </section>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

// Hata Yakalayıcı (Error Boundary)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uygulama Hatası:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#dc2626' }}>
          <h2>😓 Bir şeyler ters gitti.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: 20, background: '#fef2f2', padding: 20, borderRadius: 8 }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer', borderRadius: 6, border: '1px solid #ccc' }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ROOT COMPONENT
export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
