import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { saveDiseaseProgress, getDiseaseProgressLogs } from '../../services/diseaseApi';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../../utils/speechRecognition';

const DiseaseProgress = ({ currentCrop, currentDisease, onProgressSaved }) => {
    const { t, language } = useLanguage();
    const [crop, setCrop] = useState(currentCrop || 'Tomato');
    const [disease, setDisease] = useState(currentDisease || 'Early Blight');
    const [severity, setSeverity] = useState('Moderate');
    const [farmerNotes, setFarmerNotes] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [logs, setLogs] = useState([]);
    const [saving, setSaving] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const fileInputRef = useRef(null);

    const todayDate = new Date().toISOString().split('T')[0];
    const cropsList = ['Tomato', 'Potato', 'Rice', 'Banana', 'Cotton', 'Eggplant/Brinjal', 'Bell Pepper'];

    const fetchLogs = async () => {
        const res = await getDiseaseProgressLogs();
        if (res && res.data) {
            setLogs(res.data);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        if (currentCrop) setCrop(currentCrop);
        if (currentDisease) setDisease(currentDisease);
    }, [currentCrop, currentDisease]);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const toggleVoiceNotes = () => {
        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognizer = createSpeechRecognizer(
            language,
            (transcript) => {
                setFarmerNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
                setIsListening(false);
            },
            (error) => {
                alert(`Voice input error: ${error}`);
                setIsListening(false);
            },
            () => setIsListening(false)
        );

        if (recognizer) {
            setIsListening(true);
            recognizer.start();
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setSuccessMsg(null);

            const payload = {
                crop,
                disease,
                severity,
                farmer_notes: farmerNotes,
                location: 'Farm Block 1'
            };

            const res = await saveDiseaseProgress(payload);
            if (res && res.success) {
                setSuccessMsg(t.recordSaved || 'Progress record saved successfully!');
                setFarmerNotes('');
                setSelectedImage(null);
                setImagePreview(null);
                await fetchLogs();
                if (onProgressSaved) onProgressSaved();
            }
        } catch (err) {
            alert(err.message || 'Failed to save progress update.');
        } finally {
            setSaving(false);
        }
    };

    const getSeverityBadge = (sev) => {
        const sevLower = str(sev).toLowerCase();
        if (sevLower === 'mild') return <span className="severity-chip mild">🟢 Mild</span>;
        if (sevLower === 'severe') return <span className="severity-chip severe">🔴 Severe</span>;
        return <span className="severity-chip moderate">🟡 Moderate</span>;
    };

    function str(val) {
        return String(val || '');
    }

    return (
        <div className="disease-progress-dashboard">
            {/* Header & Subtitle */}
            <div className="progress-page-title">
                <h2>📈 {language === 'ta' ? 'நோய் கண்காணிப்புப் பதிவு' : 'Disease Progress Tracking'}</h2>
                <p>
                    {language === 'ta'
                        ? 'கண்டறியப்பட்ட நோயின் வளர்ச்சியை நேரலையாகக் கண்காணிக்கவும்.'
                        : 'Track how a detected disease changes over time.'}
                </p>
            </div>

            {/* Log Observation Form Card */}
            <div className="progress-form-card shadow-lg">
                <div className="form-card-header">
                    <h3>📝 {language === 'ta' ? 'புதிய அவதானிப்பைப் பதிவு செய்க' : 'Log New Disease Observation'}</h3>
                </div>

                <form onSubmit={handleSave} className="form-card-body">
                    {successMsg && (
                        <div className="success-banner">
                            ✅ {successMsg}
                        </div>
                    )}

                    <div className="form-inputs-grid">
                        {/* Crop Select */}
                        <div className="input-group">
                            <label>🌱 {language === 'ta' ? 'பயிர்' : 'Crop'}</label>
                            <select className="styled-select" value={crop} onChange={(e) => setCrop(e.target.value)}>
                                {cropsList.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Disease Input */}
                        <div className="input-group">
                            <label>🦠 {language === 'ta' ? 'நோய்' : 'Disease'}</label>
                            <input
                                type="text"
                                className="styled-input"
                                value={disease}
                                onChange={(e) => setDisease(e.target.value)}
                                required
                            />
                        </div>

                        {/* Date Input */}
                        <div className="input-group">
                            <label>📅 {language === 'ta' ? 'தேதி' : 'Date'}</label>
                            <input
                                type="date"
                                className="styled-input"
                                defaultValue={todayDate}
                            />
                        </div>

                        {/* Severity Dropdown */}
                        <div className="input-group">
                            <label>⚠️ {t.severity || 'Disease Severity'}</label>
                            <select className="styled-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                                <option value="Mild">🟢 Mild (Low &lt;10%)</option>
                                <option value="Moderate">🟡 Moderate (10% - 30%)</option>
                                <option value="Severe">🔴 Severe (High &gt;30%)</option>
                            </select>
                        </div>
                    </div>

                    {/* Farmer Observations with Voice Input */}
                    <div className="input-group full-width mt-3">
                        <div className="label-with-voice">
                            <label>📝 {t.farmerNotes || 'Farmer Observations / Notes'}</label>
                            {isSpeechRecognitionSupported() && (
                                <button
                                    type="button"
                                    className={`voice-btn-sm ${isListening ? 'listening' : ''}`}
                                    onClick={toggleVoiceNotes}
                                >
                                    {isListening ? '🎙️ ' + (t.listening || 'Listening...') : '🎤 ' + (t.voiceInput || 'Voice Input')}
                                </button>
                            )}
                        </div>
                        <textarea
                            className="styled-textarea"
                            rows="3"
                            placeholder={
                                language === 'ta'
                                    ? 'நோயின் அறிகுறிகள் மற்றும் பரவலைப் பற்றி பேசவும் அல்லது எழுதவும்...'
                                    : 'Describe changes in spot size, spread to adjacent leaves, or recent sprays...'
                            }
                            value={farmerNotes}
                            onChange={(e) => setFarmerNotes(e.target.value)}
                        />
                    </div>

                    {/* Optional Progress Image */}
                    <div className="input-group full-width mt-3">
                        <label>🖼️ {language === 'ta' ? 'புகைப்படம் (விருப்பமானது)' : 'Optional Leaf Photo'}</label>
                        <div className="optional-file-picker">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                className="btn-file-select"
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            >
                                📂 {selectedImage ? selectedImage.name : (language === 'ta' ? 'புகைப்படத்தைத் தேர்ந்தெடு' : 'Attach Photo')}
                            </button>
                            {imagePreview && (
                                <img src={imagePreview} alt="Progress Thumbnail" className="mini-progress-thumb" />
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={saving} className="btn-save-progress mt-4">
                        {saving ? (
                            <span>⏳ Saving Update...</span>
                        ) : (
                            <span>💾 {language === 'ta' ? 'வளர்ச்சியைச் சேமிக்கவும்' : 'Save Progress Record'}</span>
                        )}
                    </button>
                </form>
            </div>

            {/* History Timeline Section */}
            <div className="progress-history-section mt-5">
                <h3>📋 {language === 'ta' ? 'முந்தைய வளர்ச்சிப் பதிவுகள்' : 'Observation History Timeline'}</h3>

                {logs.length === 0 ? (
                    <div className="empty-history-card">
                        <span className="empty-icon">📋</span>
                        <h4>{language === 'ta' ? 'பதிவுகள் எதுவும் இல்லை.' : 'No disease progress records yet.'}</h4>
                        <p>{language === 'ta' ? 'கண்டறிந்த பின் உங்கள் முதல் பதிவைச் சேமிக்கவும்.' : 'Save your first progress update after diagnosis.'}</p>
                    </div>
                ) : (
                    <div className="timeline-cards-list">
                        {logs.map((log) => (
                            <div key={log.id} className="timeline-record-card shadow-sm">
                                <div className="card-record-header">
                                    <div className="crop-disease-title">
                                        <strong className="crop-name">{log.crop}</strong>
                                        <span className="bullet">•</span>
                                        <span className="disease-name">{log.disease}</span>
                                    </div>
                                    <div className="record-meta">
                                        {getSeverityBadge(log.severity)}
                                        <span className="record-date">📅 {log.created_at}</span>
                                    </div>
                                </div>
                                {log.farmer_notes && (
                                    <p className="record-notes">
                                        📝 {log.farmer_notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseProgress;
