import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

const DiseaseResult = ({ result, onClarificationAnswer }) => {
    const { t, language } = useLanguage();
    const [answers, setAnswers] = useState({});

    if (!result) return null;

    const { crop, disease, confidence, is_healthy, clarification_questions, top_predictions } = result;

    const handleOptionSelect = (qId, optionVal) => {
        const updated = { ...answers, [qId]: optionVal };
        setAnswers(updated);
        if (onClarificationAnswer) {
            onClarificationAnswer(updated);
        }
    };

    const getConfidenceColor = (conf) => {
        if (conf >= 80) return '#2e7d32'; // High green
        if (conf >= 50) return '#e65100'; // Medium orange
        return '#c62828'; // Low red
    };

    return (
        <div className="result-display-card shadow-lg mt-4">
            <div className="result-card-header">
                <span className="result-header-eyebrow">
                    {language === 'ta' ? 'AI பகுப்பாய்வு முடிவுகள்' : 'AI DIAGNOSTIC RESULT'}
                </span>
                <div className="result-main-title-row">
                    <div>
                        <span className="crop-tag">🌱 {crop}</span>
                        <h2 className="disease-name-title">{disease}</h2>
                    </div>
                    <div className={`status-pill ${is_healthy ? 'healthy' : 'diseased'}`}>
                        {is_healthy ? '✅ HEALTHY CROP' : '⚠️ DISEASE DETECTED'}
                    </div>
                </div>
            </div>

            <div className="result-card-body">
                {/* Confidence Metric & Progress Bar */}
                <div className="confidence-section-box">
                    <div className="confidence-header-row">
                        <span className="confidence-label">🎯 {t.confidence || 'Detection Confidence'}</span>
                        <strong
                            className="confidence-number"
                            style={{ color: getConfidenceColor(confidence) }}
                        >
                            {confidence}%
                        </strong>
                    </div>

                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${Math.min(confidence, 100)}%`,
                                backgroundColor: getConfidenceColor(confidence)
                            }}
                        />
                    </div>
                    <div className="confidence-footer-note">
                        {confidence >= 85 ? (
                            <span>High confidence matching model patterns</span>
                        ) : confidence >= 50 ? (
                            <span>Moderate confidence match</span>
                        ) : (
                            <span>Low confidence prediction - verify symptoms</span>
                        )}
                    </div>
                </div>

                {/* Alternative Predictions List */}
                {top_predictions && top_predictions.length > 1 && (
                    <div className="alternative-matches-box mt-4">
                        <h4>📊 {language === 'ta' ? 'அடுத்தகட்ட சாத்தியமான கணிப்புகள்' : 'Alternative Disease Matches'}</h4>
                        <div className="matches-grid">
                            {top_predictions.slice(0, 3).map((pred, idx) => (
                                <div key={idx} className="match-item-card">
                                    <div className="match-name">{pred.crop} - {pred.disease}</div>
                                    <div className="match-conf">{pred.confidence}% match</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Clarification Questions Section */}
                {clarification_questions && clarification_questions.length > 0 && (
                    <div className="clarification-wrapper mt-4">
                        <div className="clarification-header">
                            <h4>❓ {t.clarificationQuestions || 'Farmer Follow-Up Questions'}</h4>
                            <span className="help-text-badge">
                                {language === 'ta' ? 'சிகிச்சையை மேம்படுத்த பதிலளிக்கவும்' : 'Answer to customize treatment'}
                            </span>
                        </div>

                        <div className="questions-container">
                            {clarification_questions.map((q) => {
                                const questionText = language === 'ta' ? q.question_ta : q.question_en;
                                const optionsList = language === 'ta' ? q.options_ta : q.options_en;

                                return (
                                    <div key={q.id} className="single-question-card">
                                        <p className="question-prompt">{questionText}</p>
                                        <div className="options-flex-group">
                                            {optionsList.map((opt, oIdx) => (
                                                <button
                                                    key={oIdx}
                                                    type="button"
                                                    className={`choice-chip ${answers[q.id] === opt ? 'selected' : ''}`}
                                                    onClick={() => handleOptionSelect(q.id, opt)}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseResult;
