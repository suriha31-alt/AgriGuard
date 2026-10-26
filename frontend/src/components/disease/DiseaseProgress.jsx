
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  saveDiseaseProgress,
  getDiseaseProgressLogs,
} from '../../services/diseaseApi';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from '../../utils/speechRecognition';
import './DiseaseProgress.css';

const translations = {
  en: {
    title: 'Disease Progress Log',
    subtitle: 'Track crop diseases and monitor recovery over time.',
    addRecord: 'Add Progress Record',
    history: 'Progress History',
    crop: 'Crop Name',
    cropPlaceholder: 'Select crop',
    disease: 'Disease Name',
    diseasePlaceholder: 'Enter disease name',
    severity: 'Severity',
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    critical: 'Critical',
    date: 'Observation Date',
    location: 'Location',
    locationPlaceholder: 'Enter village or location',
    notes: 'Farmer Notes',
    notesPlaceholder: 'Describe symptoms, treatment, or changes...',
    photo: 'Upload Crop Photo',
    choosePhoto: 'Choose Photo',
    save: 'Save Progress',
    saving: 'Saving...',
    cancel: 'Clear Form',
    empty: 'No progress records found.',
    loading: 'Loading records...',
    success: 'Progress record saved successfully.',
    error: 'Unable to save progress record.',
    loadError: 'Unable to load progress records.',
    required: 'Please fill in the crop, disease, and notes.',
    all: 'All Crops',
    search: 'Search disease or crop...',
    voice: 'Speak Notes',
    listening: 'Listening...',
    stop: 'Stop Listening',
    noPhoto: 'No photo selected',
    deletePhoto: 'Remove Photo',
    unknown: 'Unknown',
    retry: 'Try Again',
  },
  ta: {
    title: 'பயிர் நோய் முன்னேற்றப் பதிவு',
    subtitle: 'பயிர் நோய்களைப் பதிவு செய்து குணமடைவதை கண்காணிக்கவும்.',
    addRecord: 'புதிய பதிவைச் சேர்க்கவும்',
    history: 'முன்னேற்ற வரலாறு',
    crop: 'பயிரின் பெயர்',
    cropPlaceholder: 'பயிரைத் தேர்ந்தெடுக்கவும்',
    disease: 'நோயின் பெயர்',
    diseasePlaceholder: 'நோயின் பெயரை உள்ளிடவும்',
    severity: 'நோயின் தீவிரம்',
    low: 'குறைவு',
    moderate: 'மிதமானது',
    high: 'அதிகம்',
    critical: 'மிக அதிகம்',
    date: 'கவனித்த தேதி',
    location: 'இடம்',
    locationPlaceholder: 'கிராமம் அல்லது இடத்தை உள்ளிடவும்',
    notes: 'விவசாயியின் குறிப்புகள்',
    notesPlaceholder: 'அறிகுறிகள் அல்லது சிகிச்சையை விவரிக்கவும்...',
    photo: 'பயிர் புகைப்படத்தைப் பதிவேற்றவும்',
    choosePhoto: 'புகைப்படத்தைத் தேர்ந்தெடுக்கவும்',
    save: 'பதிவைச் சேமிக்கவும்',
    saving: 'சேமிக்கப்படுகிறது...',
    cancel: 'படிவத்தை அழிக்கவும்',
    empty: 'முன்னேற்றப் பதிவுகள் இல்லை.',
    loading: 'பதிவுகள் ஏற்றப்படுகின்றன...',
    success: 'முன்னேற்றப் பதிவு வெற்றிகரமாகச் சேமிக்கப்பட்டது.',
    error: 'பதிவைச் சேமிக்க முடியவில்லை.',
    loadError: 'பதிவுகளை ஏற்ற முடியவில்லை.',
    required: 'பயிர், நோய் மற்றும் குறிப்புகளை நிரப்பவும்.',
    all: 'அனைத்து பயிர்களும்',
    search: 'பயிர் அல்லது நோயைத் தேடவும்...',
    voice: 'குரல் மூலம் குறிப்புகளைச் சேர்க்கவும்',
    listening: 'கேட்கிறது...',
    stop: 'கேட்பதை நிறுத்தவும்',
    noPhoto: 'புகைப்படம் தேர்ந்தெடுக்கப்படவில்லை',
    deletePhoto: 'புகைப்படத்தை நீக்கவும்',
    unknown: 'தெரியவில்லை',
    retry: 'மீண்டும் முயற்சிக்கவும்',
  },
};

const cropOptions = [
  'Rice',
  'Wheat',
  'Maize',
  'Cotton',
  'Tomato',
  'Potato',
  'Sugarcane',
  'Groundnut',
  'Banana',
  'Other',
];

const severityOptions = ['Low', 'Moderate', 'High', 'Critical'];

function formatDate(dateValue) {
  if (!dateValue) return '—';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString();
}

function getRecordId(record, index) {
  return (
    record?._id ||
    record?.id ||
    `${record?.crop || 'crop'}-${record?.disease || 'disease'}-${index}`
  );
}

export default function DiseaseProgress() {
  const languageContext = useLanguage();
  const language = languageContext?.language === 'ta' ? 'ta' : 'en';
  const t = translations[language];

  const [crop, setCrop] = useState('');
  const [disease, setDisease] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  const [recordDate, setRecordDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCrop, setFilterCrop] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [voiceActive, setVoiceActive] = useState(false);

  const fileInputRef = useRef(null);
  const recognizerRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      setLoading(true);
      setError('');

      try {
        const response = await getDiseaseProgressLogs();

        if (!active) return;

        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.logs)
              ? response.logs
              : Array.isArray(response?.data?.logs)
                ? response.data.logs
                : [];

        setRecords(data);
      } catch (err) {
        if (active) {
          setError(t.loadError);
          console.error('Disease progress load error:', err);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRecords();

    return () => {
      active = false;

      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          // Recognition may already have stopped.
        }
      }
    };
  }, [t.loadError]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(photo);
    setPhotoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [photo]);

  function clearForm() {
    setCrop('');
    setDisease('');
    setSeverity('Moderate');
    setRecordDate(new Date().toISOString().slice(0, 10));
    setLocation('');
    setNotes('');
    setPhoto(null);
    setError('');
    setMessage('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!crop || !disease.trim() || !notes.trim()) {
      setError(t.required);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        crop,
        disease: disease.trim(),
        severity,
        farmer_notes: notes.trim(),
        location: location.trim(),
      };

      await saveDiseaseProgress(payload);

      setMessage(t.success);
      clearForm();

      try {
        const response = await getDiseaseProgressLogs();

        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.logs)
              ? response.logs
              : Array.isArray(response?.data?.logs)
                ? response.data.logs
                : [];

        setRecords(data);
      } catch (refreshError) {
        console.error('Could not refresh disease progress logs:', refreshError);
      }
    } catch (err) {
      console.error('Disease progress save error:', err);
      setError(err?.response?.data?.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  function handlePhotoChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    setError('');
    setPhoto(selectedFile);
  }

  function startVoiceRecognition() {
    if (!isSpeechRecognitionSupported()) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }

    try {
      const recognizer = createSpeechRecognizer();
      recognizerRef.current = recognizer;

      recognizer.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      recognizer.interimResults = false;
      recognizer.continuous = false;

      recognizer.onstart = () => setVoiceActive(true);

      recognizer.onresult = (event) => {
        const spokenText = event.results?.[0]?.[0]?.transcript || '';

        if (spokenText) {
          setNotes((previous) =>
            previous ? `${previous} ${spokenText}` : spokenText
          );
        }
      };

      recognizer.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setVoiceActive(false);
      };

      recognizer.onend = () => setVoiceActive(false);
      recognizer.start();
    } catch (err) {
      console.error('Could not start speech recognition:', err);
      setVoiceActive(false);
      setError('Unable to start voice recognition.');
    }
  }

  function stopVoiceRecognition() {
    try {
      recognizerRef.current?.stop();
    } catch {
      // Recognition may already have stopped.
    }

    setVoiceActive(false);
  }

  const filteredRecords = records.filter((record) => {
    const recordCrop = record?.crop || '';
    const recordDisease = record?.disease || '';

    const matchesSearch =
      `${recordCrop} ${recordDisease} ${record?.farmer_notes || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCrop =
      filterCrop === 'All' || recordCrop.toLowerCase() === filterCrop.toLowerCase();

    return matchesSearch && matchesCrop;
  });

  return (
    <main className="dp-page">
      <header className="dp-hero">
        <div className="dp-hero-content">
          <span className="dp-eyebrow">AGRIGUARD • CROP HEALTH</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="dp-hero-icon" aria-hidden="true">
          <span>🌱</span>
        </div>
      </header>

      <section className="dp-stats" aria-label="Progress summary">
        <article className="dp-stat-card">
          <div className="dp-stat-icon dp-icon-green">🌿</div>
          <div>
            <span className="dp-stat-label">Total Records</span>
            <strong>{records.length}</strong>
          </div>
        </article>

        <article className="dp-stat-card">
          <div className="dp-stat-icon dp-icon-orange">🔎</div>
          <div>
            <span className="dp-stat-label">Diseases Tracked</span>
            <strong>
              {new Set(records.map((record) => record?.disease).filter(Boolean)).size}
            </strong>
          </div>
        </article>

        <article className="dp-stat-card">
          <div className="dp-stat-icon dp-icon-blue">📋</div>
          <div>
            <span className="dp-stat-label">Crops Monitored</span>
            <strong>
              {new Set(records.map((record) => record?.crop).filter(Boolean)).size}
            </strong>
          </div>
        </article>
      </section>

      <section className="dp-form-card">
        <div className="dp-section-heading">
          <div>
            <span className="dp-section-kicker">NEW ENTRY</span>
            <h2>{t.addRecord}</h2>
          </div>
          <span className="dp-heading-icon">✚</span>
        </div>

        <form onSubmit={handleSubmit} className="dp-form">
          <div className="dp-form-grid">
            <div className="dp-field">
              <label htmlFor="dp-crop">{t.crop} *</label>
              <select
                id="dp-crop"
                value={crop}
                onChange={(event) => setCrop(event.target.value)}
                required
              >
                <option value="">{t.cropPlaceholder}</option>
                {cropOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="dp-field">
              <label htmlFor="dp-disease">{t.disease} *</label>
              <input
                id="dp-disease"
                value={disease}
                onChange={(event) => setDisease(event.target.value)}
                placeholder={t.diseasePlaceholder}
                required
              />
            </div>

            <div className="dp-field">
              <label htmlFor="dp-severity">{t.severity}</label>
              <select
                id="dp-severity"
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {t[option.toLowerCase()]}
                  </option>
                ))}
              </select>
            </div>

            <div className="dp-field">
              <label htmlFor="dp-date">{t.date}</label>
              <input
                id="dp-date"
                type="date"
                value={recordDate}
                onChange={(event) => setRecordDate(event.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>

            <div className="dp-field dp-full-width">
              <label htmlFor="dp-location">{t.location}</label>
              <input
                id="dp-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder={t.locationPlaceholder}
              />
            </div>

            <div className="dp-field dp-full-width">
              <div className="dp-label-row">
                <label htmlFor="dp-notes">{t.notes} *</label>

                <button
                  className="dp-voice-button"
                  type="button"
                  onClick={voiceActive ? stopVoiceRecognition : startVoiceRecognition}
                >
                  {voiceActive ? '⏹ ' + t.stop : '🎙 ' + t.voice}
                </button>
              </div>

              <textarea
                id="dp-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t.notesPlaceholder}
                rows={4}
                required
              />

              {voiceActive && (
                <p className="dp-listening">{t.listening}</p>
              )}
            </div>

            <div className="dp-field dp-full-width">
              <label>{t.photo}</label>

              <div className="dp-upload-area">
                <input
                  ref={fileInputRef}
                  id="dp-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  hidden
                />

                {photoPreview ? (
                  <div className="dp-photo-preview">
                    <img src={photoPreview} alt="Selected crop preview" />
                    <div className="dp-photo-actions">
                      <span>{photo?.name}</span>
                      <button
                        type="button"
                        className="dp-remove-photo"
                        onClick={() => {
                          setPhoto(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        {t.deletePhoto}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="dp-upload-empty">
                    <span className="dp-upload-icon">📷</span>
                    <span>{t.noPhoto}</span>
                    <button
                      type="button"
                      className="dp-secondary-button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t.choosePhoto}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="dp-alert dp-alert-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          {message && (
            <div className="dp-alert dp-alert-success" role="status">
              <span>✓</span> {message}
            </div>
          )}

          <div className="dp-form-actions">
            <button
              type="button"
              className="dp-secondary-button"
              onClick={clearForm}
              disabled={saving}
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              className="dp-primary-button"
              disabled={saving}
            >
              {saving ? t.saving : t.save}
              {!saving && <span aria-hidden="true"> →</span>}
            </button>
          </div>
        </form>
      </section>

      <section className="dp-history-section">
        <div className="dp-section-heading dp-history-heading">
          <div>
            <span className="dp-section-kicker">YOUR ACTIVITY</span>
            <h2>{t.history}</h2>
          </div>
          <span className="dp-record-count">{filteredRecords.length} records</span>
        </div>

        <div className="dp-filter-bar">
          <div className="dp-search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
              aria-label={t.search}
            />
          </div>

          <select
            className="dp-filter-select"
            value={filterCrop}
            onChange={(event) => setFilterCrop(event.target.value)}
            aria-label={t.all}
          >
            <option value="All">{t.all}</option>
            {cropOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="dp-state-card">
            <div className="dp-spinner" />
            <p>{t.loading}</p>
          </div>
        ) : error && records.length === 0 ? (
          <div className="dp-state-card">
            <span className="dp-state-icon">⚠️</span>
            <p>{error}</p>
            <button
              className="dp-secondary-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              {t.retry}
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="dp-state-card">
            <span className="dp-state-icon">🌾</span>
            <h3>{t.empty}</h3>
            <p>Your saved disease observations will appear here.</p>
          </div>
        ) : (
          <div className="dp-record-grid">
            {filteredRecords.map((record, index) => (
              <article
                className="dp-record-card"
                key={getRecordId(record, index)}
              >
                <div className="dp-record-top">
                  <span className="dp-record-crop">
                    🌱 {record?.crop || t.unknown}
                  </span>

                  <span
                    className={`dp-severity dp-severity-${String(
                      record?.severity || 'moderate'
                    ).toLowerCase()}`}
                  >
                    {t[String(record?.severity || 'Moderate').toLowerCase()] ||
                      record?.severity ||
                      t.moderate}
                  </span>
                </div>

                <h3>{record?.disease || t.unknown}</h3>

                <div className="dp-record-meta">
                  <span>📅 {formatDate(record?.recordDate || record?.date || record?.createdAt)}</span>
                  {record?.location && <span>📍 {record.location}</span>}
                </div>

                <p className="dp-record-notes">
                  {record?.farmer_notes ||
                    record?.notes ||
                    'No additional notes.'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
