
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
    createSpeechRecognizer,
    isSpeechRecognitionSupported
} from '../../utils/speechRecognition';

import './DiseaseDetection.css';

const DiseaseDetection = ({ onAnalyze, loading }) => {
    const { t, language } = useLanguage();

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const [notes, setNotes] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);
    const recognizerRef = useRef(null);

    const isTamil = language === 'ta';

    // Release the previous preview URL to avoid memory leaks.
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFile = (file) => {
        if (!file) return;

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                isTamil
                    ? 'JPG, PNG அல்லது WEBP படத்தைத் தேர்ந்தெடுக்கவும்.'
                    : 'Please select a JPG, PNG, or WEBP image.'
            );
            return;
        }

        // Prevent unexpectedly large uploads.
        if (file.size > 10 * 1024 * 1024) {
            setError(
                isTamil
                    ? 'படத்தின் அளவு 10 MB-க்கு குறைவாக இருக்க வேண்டும்.'
                    : 'Image size must be 10 MB or less.'
            );
            return;
        }

        setError('');
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setFileInfo({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        });
    };

    const handleFileChange = (event) => {
        handleFile(event.target.files?.[0]);
        // Allow selecting the same file again.
        event.target.value = '';
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragging(false);
        }
    };

    const clearSelectedImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileInfo(null);
        setError('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            recognizerRef.current?.stop?.();
            recognizerRef.current?.abort?.();
            recognizerRef.current = null;
            setIsListening(false);
            return;
        }

        const recognizer = createSpeechRecognizer(
            language,
            (transcript) => {
                setNotes((previous) =>
                    previous ? `${previous} ${transcript}` : transcript
                );
                setIsListening(false);
                recognizerRef.current = null;
            },
            (recognitionError) => {
                setError(
                    `${isTamil ? 'குரல் உள்ளீட்டுப் பிழை' : 'Voice input error'}: ${recognitionError}`
                );
                setIsListening(false);
                recognizerRef.current = null;
            },
            () => {
                setIsListening(false);
                recognizerRef.current = null;
            }
        );

        if (!recognizer) {
            setError(
                isTamil
                    ? 'குரல் உள்ளீடு தற்போது கிடைக்கவில்லை.'
                    : 'Voice input is currently unavailable.'
            );
            return;
        }

        try {
            recognizerRef.current = recognizer;
            setError('');
            setIsListening(true);
            recognizer.start();
        } catch {
            recognizerRef.current = null;
            setIsListening(false);
            setError(
                isTamil
                    ? 'குரல் உள்ளீட்டைத் தொடங்க முடியவில்லை.'
                    : 'Could not start voice input.'
            );
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!selectedFile || loading) return;

        setError('');
        onAnalyze(selectedFile, notes);
    };

    return (
        <section className="disease-upload-card">
            <header className="card-top-bar">
                <span className="header-badge">
                    <span aria-hidden="true">✦</span> AI-POWERED DIAGNOSTICS
                </span>

                <h2>
                    <span aria-hidden="true">🌿</span>{' '}
                    {t.diseaseDetection || 'Crop Disease Detection'}
                </h2>

                <p>
                    {t.uploadImage ||
                        'Upload a clear photo of an affected leaf to analyze possible diseases.'}
                </p>

                <div className="diagnostic-features">
                    <span>✓ {isTamil ? 'படப் பகுப்பாய்வு' : 'Image analysis'}</span>
                    <span>✓ {isTamil ? 'அறிகுறிகள்' : 'Symptom notes'}</span>
                    <span>✓ {isTamil ? 'பரிந்துரைகள்' : 'Care guidance'}</span>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="upload-card-body">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    aria-label={isTamil ? 'பயிர் புகைப்படத்தைத் தேர்ந்தெடு' : 'Select crop image'}
                />

                <div className="section-heading">
                    <span className="step-number">01</span>
                    <div>
                        <h3>{isTamil ? 'பயிரின் புகைப்படம்' : 'Upload crop image'}</h3>
                        <p>
                            {isTamil
                                ? 'பாதிக்கப்பட்ட இலையின் தெளிவான புகைப்படத்தைத் தேர்ந்தெடுக்கவும்.'
                                : 'Choose a clear, well-lit photo of the affected leaf.'}
                        </p>
                    </div>
                </div>

                {!previewUrl ? (
                    <div
                        className={`dropzone-large ${isDragging ? 'dragging' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-label={isTamil ? 'புகைப்படத்தைப் பதிவேற்றவும்' : 'Upload a crop leaf photo'}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="dropzone-illustration" aria-hidden="true">
                            <span className="icon-leaf">🌿</span>
                            <span className="icon-camera">📷</span>
                        </div>

                        <h3>
                            {isDragging
                                ? (isTamil ? 'படத்தை இங்கே விடவும்' : 'Drop your image here')
                                : (isTamil ? 'படத்தைத் தேர்ந்தெடுக்கவும்' : 'Drag & drop your leaf photo')}
                        </h3>

                        <p className="dropzone-subtitle">
                            {isTamil
                                ? 'அல்லது உங்கள் சாதனத்திலிருந்து ஒரு படத்தைத் தேர்ந்தெடுக்கவும்'
                                : 'Or browse your device to choose an image'}
                        </p>

                        <span className="browse-button-badge">
                            📂 {isTamil ? 'புகைப்படத்தைத் தேர்ந்தெடு' : 'Choose image'}
                        </span>

                        <span className="file-requirements">
                            JPG, PNG or WEBP · Max 10 MB
                        </span>
                    </div>
                ) : (
                    <div className="image-preview-card">
                        <div className="preview-image-wrapper">
                            <img
                                src={previewUrl}
                                alt="Preview of selected crop leaf"
                                className="preview-img"
                            />

                            <span className="image-ready-badge">
                                ✓ {isTamil ? 'படம் தயார்' : 'Image ready'}
                            </span>

                            <button
                                type="button"
                                className="remove-image-btn"
                                onClick={clearSelectedImage}
                                aria-label={isTamil ? 'படத்தை நீக்கு' : 'Remove selected image'}
                                title={isTamil ? 'படத்தை நீக்கு' : 'Remove image'}
                            >
                                ×
                            </button>
                        </div>

                        <div className="preview-details">
                            <div className="file-meta">
                                <span className="file-icon" aria-hidden="true">🖼️</span>
                                <div className="file-description">
                                    <strong className="file-name">
                                        {fileInfo?.name}
                                    </strong>
                                    <span className="file-size">
                                        {fileInfo?.size}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-change-image"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                ↻ {isTamil ? 'படத்தை மாற்று' : 'Change image'}
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="disease-upload-error" role="alert">
                        <span aria-hidden="true">⚠️</span> {error}
                    </div>
                )}

                <div className="notes-form-group">
                    <div className="section-heading">
                        <span className="step-number">02</span>
                        <div>
                            <h3>
                                {t.farmerNotes ||
                                    (isTamil ? 'கூடுதல் அறிகுறிகள்' : 'Describe the symptoms')}
                            </h3>
                            <p>
                                {isTamil
                                    ? 'இலைகளில் காணப்படும் மாற்றங்களை எழுதவும் அல்லது பேசவும்.'
                                    : 'Add any changes you have noticed on the plant.'}
                            </p>
                        </div>
                    </div>

                    <div className="label-row">
                        <label htmlFor="farmer-notes">
                            {isTamil ? 'விவசாயியின் குறிப்புகள்' : 'Observations (optional)'}
                        </label>

                        {isSpeechRecognitionSupported() && (
                            <button
                                type="button"
                                className={`voice-input-btn ${isListening ? 'listening' : ''}`}
                                onClick={toggleVoiceInput}
                                aria-pressed={isListening}
                            >
                                <span aria-hidden="true">
                                    {isListening ? '🔴' : '🎤'}
                                </span>
                                {isListening
                                    ? (t.listening || (isTamil ? 'கேட்கிறது...' : 'Listening...'))
                                    : (t.voiceInput || (isTamil ? 'குரல் உள்ளீடு' : 'Use microphone'))}
                            </button>
                        )}
                    </div>

                    <textarea
                        id="farmer-notes"
                        className="styled-textarea"
                        rows={4}
                        maxLength={1000}
                        placeholder={
                            isTamil
                                ? 'உதாரணம்: இலைகளில் மஞ்சள் புள்ளிகள் உள்ளன; இலைகள் வாடுகின்றன...'
                                : 'Example: Yellow spots on leaves, curling edges, wilting, or unusual growth...'
                        }
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                    />

                    <div className="notes-footer">
                        <span>
                            {isTamil ? 'அறிகுறிகளைச் சேர்ப்பது விருப்பமானது' : 'Adding symptoms is optional'}
                        </span>
                        <span>{notes.length}/1000</span>
                    </div>
                </div>

                <div className="analysis-info">
                    <span aria-hidden="true">🔎</span>
                    <p>
                        {isTamil
                            ? 'சிறந்த முடிவுகளுக்கு, பாதிக்கப்பட்ட இலையின் தெளிவான புகைப்படத்தைப் பயன்படுத்தவும்.'
                            : 'For better results, use a sharp photo with the affected leaf clearly visible.'}
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={!selectedFile || loading}
                    className="btn-detect-prominent"
                >
                    {loading ? (
                        <span className="button-text-row">
                            <span className="spinner-icon" aria-hidden="true" />
                            {isTamil ? 'படம் பகுப்பாய்வு செய்யப்படுகிறது...' : 'Analyzing crop image...'}
                        </span>
                    ) : (
                        <span className="button-text-row">
                            <span aria-hidden="true">✦</span>
                            {isTamil ? 'பயிர் நோயைக் கண்டறி' : 'Analyze crop for disease'}
                            <span aria-hidden="true">→</span>
                        </span>
                    )}
                </button>

                <p className="diagnosis-disclaimer">
                    {isTamil
                        ? 'AI முடிவு ஒரு ஆரம்ப வழிகாட்டுதல் மட்டுமே. உறுதியான நோயறிதலுக்கு வேளாண் நிபுணரை அணுகவும்.'
                        : 'AI results are preliminary guidance, not a definitive diagnosis. Consult an agricultural expert when needed.'}
                </p>
            </form>
        </section>
    );
};

export default DiseaseDetection;
