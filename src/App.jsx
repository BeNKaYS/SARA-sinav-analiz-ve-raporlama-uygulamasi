
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
      <header className="app-header glass-panel">
        <div className="header-top">
          <h1>Sınav Değerlendirme</h1>
          <span className="badge">v1.6.1</span>
        </div>
        <nav className="tabs">
          <button className={activeTab === 'exams' ? 'active' : ''} onClick={() => setActiveTab('exams')}>1. Sınavlar</button>
          <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
            2. Yoklama Listesi {attendanceData && <span className="status-dot success"></span>}
          </button>
          <button className={activeTab === 'optical' ? 'active' : ''} onClick={() => setActiveTab('optical')}>
            3. Optik Veriler {opticalData && <span className="status-dot success"></span>}
          </button>
          <button className={activeTab === 'answerKey' ? 'active' : ''} onClick={() => setActiveTab('answerKey')}>
            4. Cevap Anahtarı {answerKeyData && <span className="status-dot success"></span>}
          </button>
          <button className={activeTab === 'evaluation' ? 'active' : ''} onClick={() => setActiveTab('evaluation')}>
            5. Değerlendirme {results && <span className="status-dot success"></span>}
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            6. Raporlar {results && <span className="status-dot success"></span>}
          </button>
          <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
            7. İstatistikler
          </button>
          <button
            className={`about-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
            style={{ marginLeft: 'auto', border: '1px solid var(--accent)' }}
          >
            ℹ️ Hakkında
          </button>
        </nav>
      </header>
      <main className="app-content">
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
