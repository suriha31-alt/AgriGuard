import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import DiseaseDetection from '../components/disease/DiseaseDetection';
import DiseaseResult from '../components/disease/DiseaseResult';
import PesticideRecommendation from '../components/disease/PesticideRecommendation';
import DiseaseProgress from '../components/disease/DiseaseProgress';
import AgriGuardAlerts from '../components/disease/AgriGuardAlerts';
import { predictCropDisease } from '../services/diseaseApi';

const DiseaseDashboard = () => {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('detect'); // 'detect' | 'progress' | 'alerts'

    const handleAnalyze = async (imageFile, farmerNotes) => {
        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const data = await predictCropDisease(imageFile, farmerNotes);
            if (!data || !data.success) {
                throw new Error(data?.message || 'Disease detection analysis failed.');
            }

            setResult(data);
        } catch (err) {
            setError(err.message || 'Error running AI crop disease analysis.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="disease-dashboard-wrapper">
            {/* Compact Header Section */}
            <header className="disease-compact-header">
                <div className="header-text-block">
                    <h1>🔬 {t.diseaseDetection || 'Disease Detection'}</h1>
                    <p>
                        {language === 'ta'
                            ? 'பயிர் நோய்களைக் கண்டறிந்து சிகிச்சை வழிகாட்டலைப் பெற தெளிவான இலையின் புகைப்படத்தைப் பதிவேற்றவும்.'
                            : 'Upload a clear plant leaf image to identify crop diseases and receive treatment guidance.'}
                    </p>
                </div>

                {/* Clean, Compact Sub-Tabs Bar */}
                <div className="compact-tabs-bar">
                    <button
                        className={`tab-btn ${activeTab === 'detect' ? 'active' : ''}`}
                        onClick={() => setActiveTab('detect')}
                    >
                        🔬 {t.diseaseDetection || 'Disease Detection'}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
                        onClick={() => setActiveTab('progress')}
                    >
                        📈 {t.diseaseProgress || 'Disease Progress Log'}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('alerts')}
                    >
                        🚨 {t.agriguardAlerts || 'AgriGuard Alerts'}
                    </button>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="disease-main-content">
                {activeTab === 'detect' && (
                    <div className="detection-flow-layout">
                        {/* 1. Upload Card */}
                        <DiseaseDetection onAnalyze={handleAnalyze} loading={loading} />

                        {/* Error Alert Box */}
                        {error && (
                            <div className="error-alert-card mt-3">
                                <span className="alert-icon">⚠️</span>
                                <div>
                                    <strong>{language === 'ta' ? 'கண்டறிவதில் பிழை ocorreu:' : 'Diagnosis Error'}</strong>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        {/* 2. Results & Treatment Section */}
                        {result && (
                            <div className="results-and-treatment-flow">
                                <DiseaseResult result={result} />
                                <PesticideRecommendation recommendation={result.pesticide_recommendation} />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'progress' && (
                    <DiseaseProgress
                        currentCrop={result?.crop}
                        currentDisease={result?.disease}
                        onProgressSaved={() => setActiveTab('progress')}
                    />
                )}

                {activeTab === 'alerts' && (
                    <AgriGuardAlerts />
                )}
            </main>
        </div>
    );
};

export default DiseaseDashboard;
