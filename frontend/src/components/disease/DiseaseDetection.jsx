import React, { useState, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../../utils/speechRecognition';

const DiseaseDetection = ({ onAnalyze, loading }) => {
    const { t, language } = useLanguage();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const [notes, setNotes] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setFileInfo({
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
            });
        } else {
            alert(language === 'ta' ? 'தயவுசெய்து செல்லுபடியாகும் புகைப்படத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please select a valid image file.');
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const clearSelectedImage = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileInfo(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognizer = createSpeechRecognizer(
            language,
            (transcript) => {
                setNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
                setIsListening(false);
            },
            (error) => {
                alert(`Voice input notice: ${error}`);
                setIsListening(false);
            },
            () => setIsListening(false)
        );

        if (recognizer) {
            setIsListening(true);
            recognizer.start();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert(language === 'ta' ? 'தயவுசெய்து ஒரு படத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please select a crop leaf image first.');
            return;
        }
        onAnalyze(selectedFile, notes);
    };

    return (
        <div className="disease-upload-card shadow-lg">
            <div className="card-top-bar">
                <div className="header-badge">🌱 AI DIAGNOSTICS</div>
                <h2>📸 {t.diseaseDetection || 'AI Crop Disease Detection'}</h2>
                <p>{t.uploadImage || 'Upload a clear leaf photo for instant AI diagnosis'}</p>
            </div>

            <form onSubmit={handleSubmit} className="upload-card-body">
                {/* Image Upload Dropzone */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />

                {!previewUrl ? (
                    <div
                        className={`dropzone-large ${isDragging ? 'dragging' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                        <div className="dropzone-illustration">
                            <span className="icon-leaf">🌿</span>
                            <span className="icon-camera">📷</span>
                        </div>
                        <h3>{t.takePhoto || 'Click or Drag & Drop Crop Leaf Photo'}</h3>
                        <p className="dropzone-subtitle">
                            {language === 'ta'
                                ? 'தெளிவான இலை புகைப்படத்தை பதிவேற்றவும் (JPG, PNG)'
                                : 'Upload a clear, well-lit photo of the affected plant leaf'}
                        </p>
                        <span className="browse-button-badge">
                            📂 {language === 'ta' ? 'புகைப்படத்தைத் தேர்ந்தெடு' : 'Browse File'}
                        </span>
                    </div>
                ) : (
                    /* Image Preview Card */
                    <div className="image-preview-card">
                        <div className="preview-image-wrapper">
                            <img src={previewUrl} alt="Selected Crop Leaf Preview" className="preview-img" />
                            <button
                                type="button"
                                className="remove-image-btn"
                                onClick={clearSelectedImage}
                                title={language === 'ta' ? 'நீக்கு' : 'Remove Image'}
                            >
                                ✖
                            </button>
                        </div>
                        <div className="preview-details">
                            <div className="file-meta">
                                <span className="file-icon">🖼️</span>
                                <div>
                                    <strong className="file-name">{fileInfo?.name}</strong>
                                    <span className="file-size">{fileInfo?.size}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-change-image"
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            >
                                🔄 {language === 'ta' ? 'படத்தை மாற்று' : 'Change Photo'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Farmer Notes with Voice Input */}
                <div className="notes-form-group mt-4">
                    <div className="label-row">
                        <label htmlFor="farmer-notes">
                            📝 {t.farmerNotes || 'Additional Symptoms / Observations'}
                        </label>
                        {isSpeechRecognitionSupported() && (
                            <button
                                type="button"
                                className={`voice-input-btn ${isListening ? 'listening' : ''}`}
                                onClick={toggleVoiceInput}
                                title={t.voiceInput || 'Speak Voice Input'}
                            >
                                <span className="mic-icon">{isListening ? '🎙️' : '🎤'}</span>
                                <span>{isListening ? (t.listening || 'Listening...') : (t.voiceInput || 'Voice Input')}</span>
                            </button>
                        )}
                    </div>

                    <textarea
                        id="farmer-notes"
                        className="styled-textarea"
                        rows="3"
                        placeholder={
                            language === 'ta'
                                ? 'பாதிக்கப்பட்ட இலைகள், அறிகுறிகளை இங்கே பேசவும் அல்லது எழுதவும் (எ.கா: இலைகளில் பழுப்பு புள்ளிகள் உள்ளன)...'
                                : 'Describe symptoms or tap the microphone to speak (e.g., yellow spots on lower leaves, wilting stems)...'
                        }
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Prominent Detect Disease CTA Button */}
                <button
                    type="submit"
                    disabled={!selectedFile || loading}
                    className="btn-detect-prominent mt-4"
                >
                    {loading ? (
                        <div className="loading-spinner-row">
                            <span className="spinner-icon">🔄</span>
                            <span>{language === 'ta' ? 'AI மூலம் பகுப்பாய்வு செய்யப்படுகிறது...' : 'AI Analyzing Leaf Photo...'}</span>
                        </div>
                    ) : (
                        <div className="button-text-row">
                            <span className="search-icon">🔍</span>
                            <span>{language === 'ta' ? 'நோயைக் கண்டறியவும்' : 'Detect Disease Now'}</span>
                        </div>
                    )}
                </button>
            </form>
        </div>
    );
};

export default DiseaseDetection;
