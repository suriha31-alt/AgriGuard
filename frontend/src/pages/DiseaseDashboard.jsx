import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

import DiseaseDetection from '../components/disease/DiseaseDetection';
import DiseaseResult from '../components/disease/DiseaseResult';
import PesticideRecommendation from '../components/disease/PesticideRecommendation';
import DiseaseProgress from '../components/disease/DiseaseProgress';
import AgriGuardAlerts from '../components/disease/AgriGuardAlerts';

import { predictCropDisease } from '../services/diseaseApi';
import './DiseaseDashboard.css';

const DiseaseDashboard = () => {
    const { t, language } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('detect');

    const tabs = [
        {
            id: 'detect',
            label: t.diseaseDetection || 'Disease Detection',
            icon: '🔬',
        },
        {
            id: 'progress',
            label: t.diseaseProgress || 'Disease Progress Log',
            icon: '📈',
        },
        {
            id: 'alerts',
            label: t.agriguardAlerts || 'AgriGuard Alerts',
            icon: '🚨',
        },
    ];

    const handleAnalyze = async (imageFile, farmerNotes) => {
        if (!imageFile) {
            setError(
                language === 'ta'
                    ? 'முதலில் பயிர் இலையின் படத்தைப் பதிவேற்றவும்.'
                    : 'Please upload a crop leaf image first.'
            );
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const data = await predictCropDisease(imageFile, farmerNotes);

            if (!data || !data.success) {
                throw new Error(
                    data?.message || 'Disease detection analysis failed.'
                );
            }

            setResult(data);
        } catch (err) {
            console.error('Crop disease detection error:', err);

            setError(
                err?.message ||
                    (language === 'ta'
                        ? 'பயிர் நோய் கண்டறிதலில் பிழை ஏற்பட்டது.'
                        : 'An error occurred during crop disease analysis.')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setError(null);
    };

    return (
        <div className="disease-dashboard-wrapper">
            <header className="disease-compact-header">
                <div className="header-text-block">
                    <span className="disease-eyebrow">
                        🌱 AGRIGUARD AI DIAGNOSTICS
                    </span>

                    <h1>
                        🔬 {t.diseaseDetection || 'Disease Detection'}
                    </h1>

                    <p>
                        {language === 'ta'
                            ? 'பயிர் நோய்களைக் கண்டறிந்து சிகிச்சை வழிகாட்டலைப் பெற தெளிவான இலையின் புகைப்படத்தைப் பதிவேற்றவும்.'
                            : 'Upload a clear plant leaf image to identify crop diseases and receive treatment guidance.'}
                    </p>
                </div>

                <nav
                    className="compact-tabs-bar"
                    aria-label="Disease dashboard navigation"
                    role="tablist"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`disease-tab-${tab.id}`}
                            aria-selected={activeTab === tab.id}
                            aria-controls={`disease-panel-${tab.id}`}
                            className={`tab-btn ${
                                activeTab === tab.id ? 'active' : ''
                            }`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            <span aria-hidden="true">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </header>

            <main className="disease-main-content">
                {activeTab === 'detect' && (
                    <section
                        id="disease-panel-detect"
                        role="tabpanel"
                        aria-labelledby="disease-tab-detect"
                        className="detection-flow-layout"
                    >
                        <DiseaseDetection
                            onAnalyze={handleAnalyze}
                            loading={loading}
                        />

                        {error && (
                            <div
                                className="error-alert-card"
                                role="alert"
                            >
                                <span
                                    className="alert-icon"
                                    aria-hidden="true"
                                >
                                    ⚠️
                                </span>

                                <div>
                                    <strong>
                                        {language === 'ta'
                                            ? 'கண்டறிதலில் பிழை'
                                            : 'Diagnosis Error'}
                                    </strong>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="results-and-treatment-flow">
                                <DiseaseResult result={result} />

                                {result.pesticide_recommendation && (
                                    <PesticideRecommendation
                                        recommendation={
                                            result.pesticide_recommendation
                                        }
                                    />
                                )}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'progress' && (
                    <section
                        id="disease-panel-progress"
                        role="tabpanel"
                        aria-labelledby="disease-tab-progress"
                    >
                        <DiseaseProgress
                            currentCrop={result?.crop}
                            currentDisease={result?.disease}
                            onProgressSaved={() =>
                                setActiveTab('progress')
                            }
                        />
                    </section>
                )}

                {activeTab === 'alerts' && (
                    <section
                        id="disease-panel-alerts"
                        role="tabpanel"
                        aria-labelledby="disease-tab-alerts"
                    >
                        <AgriGuardAlerts />
                    </section>
                )}
            </main>
        </div>
    );
};

export default DiseaseDashboard;
