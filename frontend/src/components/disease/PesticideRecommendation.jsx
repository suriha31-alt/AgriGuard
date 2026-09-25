import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

const PesticideRecommendation = ({ recommendation }) => {
    const { t, language } = useLanguage();

    if (!recommendation) return null;

    const {
        crop,
        disease,
        treatment_category,
        active_ingredient,
        dosage_guidelines,
        safety_precautions,
        organic_alternatives,
        disclaimer,
        reference_sources
    } = recommendation;

    return (
        <div className="treatment-advisory-card shadow-lg mt-4">
            <div className="advisory-card-header">
                <div className="header-icon-circle">🧪</div>
                <div>
                    <h3>{t.pesticideRecommendation || 'Pesticide & Treatment Recommendation'}</h3>
                    <p className="header-subtitle">
                        {language === 'ta'
                            ? `${crop} (${disease}) க்கான அறிவியல் அடிப்படையிலான சிகிச்சை`
                            : `Verified agricultural extension treatment for ${crop} (${disease})`}
                    </p>
                </div>
            </div>

            <div className="advisory-grid">
                {/* 1. Treatment Category */}
                <div className="advisory-box category">
                    <div className="box-header">
                        <span className="box-icon">🏷️</span>
                        <label>{t.treatmentCategory || 'Treatment Category'}</label>
                    </div>
                    <strong className="box-value">{treatment_category}</strong>
                </div>

                {/* 2. Active Ingredient */}
                <div className="advisory-box ingredient">
                    <div className="box-header">
                        <span className="box-icon">💊</span>
                        <label>{t.activeIngredient || 'Active Ingredient (Reliably Known)'}</label>
                    </div>
                    <strong className="box-value">{active_ingredient}</strong>
                </div>

                {/* 3. Application & Dosage Guidelines */}
                {dosage_guidelines && (
                    <div className="advisory-box full-width dosage">
                        <div className="box-header">
                            <span className="box-icon">📏</span>
                            <label>{t.dosage || 'Application & Dosage Guidelines'}</label>
                        </div>
                        <p className="box-description">{dosage_guidelines}</p>
                    </div>
                )}

                {/* 4. Safety Precautions */}
                <div className="advisory-box full-width safety">
                    <div className="box-header">
                        <span className="box-icon">⚠️</span>
                        <label>{t.safetyPrecautions || 'Safety Precautions'}</label>
                    </div>
                    <p className="box-description safety-alert-text">{safety_precautions}</p>
                </div>

                {/* 5. Sustainable / Biological Alternatives */}
                {organic_alternatives && (
                    <div className="advisory-box full-width organic">
                        <div className="box-header">
                            <span className="box-icon">🌱</span>
                            <label>{t.organicAlternative || 'Sustainable & Biological Alternatives'}</label>
                        </div>
                        <p className="box-description organic-text">{organic_alternatives}</p>
                    </div>
                )}

                {/* 6. Product Label & Advisory Notice */}
                <div className="advisory-box full-width disclaimer">
                    <div className="box-header">
                        <span className="box-icon">📜</span>
                        <label>{t.disclaimerLabel || 'Product Label & Advisory Notice'}</label>
                    </div>
                    <p className="box-description disclaimer-notice-text">
                        {disclaimer || 'Always follow product label instructions and local agricultural authority guidance.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PesticideRecommendation;
