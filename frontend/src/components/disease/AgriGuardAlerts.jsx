import React, { useEffect, useState } from 'react';
import { getAgriGuardAlerts } from '../../services/diseaseApi';
import { useLanguage } from '../../i18n/LanguageContext';

const AgriGuardAlerts = () => {
    const { language } = useLanguage();

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getAgriGuardAlerts();

            if (response?.success && Array.isArray(response.data)) {
                setAlerts(response.data);
            } else {
                setAlerts([]);
            }
        } catch (err) {
            console.error('Alert loading error:', err);
            setError(
                language === 'ta'
                    ? 'எச்சரிக்கைகளை ஏற்ற முடியவில்லை.'
                    : 'Unable to load AgriGuard alerts.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const getSeverityClass = (severity) => {
        const value = String(severity || '').toLowerCase();

        if (value === 'critical') {
            return 'alert-severity critical';
        }

        if (value === 'high') {
            return 'alert-severity high';
        }

        return 'alert-severity moderate';
    };

    const getSeverityIcon = (severity) => {
        const value = String(severity || '').toLowerCase();

        if (value === 'critical') return '🔴';
        if (value === 'high') return '🟠';

        return '🟡';
    };

    const getAlertIcon = (type) => {
        if (String(type).toLowerCase().includes('repeated')) {
            return '🔁';
        }

        if (String(type).toLowerCase().includes('severe')) {
            return '🚨';
        }

        return '⚠️';
    };

    return (
        <div className="agriguard-alerts-page">

            {/* Header */}
            <div className="alerts-intro">
                <div className="alerts-intro-icon">🚨</div>

                <div>
                    <h2>
                        {language === 'ta'
                            ? 'அக்ரிகார்டு எச்சரிக்கைகள்'
                            : 'AgriGuard Alerts'}
                    </h2>

                    <p>
                        {language === 'ta'
                            ? 'பதிவு செய்யப்பட்ட நோய் கண்காணிப்பு தரவுகளின் அடிப்படையில் தானியங்கி எச்சரிக்கைகள்.'
                            : 'Automated warnings generated from recorded disease observations.'}
                    </p>
                </div>
            </div>


            {/* Automated Alert Notice */}
            <div className="alerts-system-notice">
                <span className="notice-icon">ℹ️</span>

                <div>
                    <strong>
                        {language === 'ta'
                            ? 'AgriGuard System Alert'
                            : 'AgriGuard System Alert'}
                    </strong>

                    <p>
                        {language === 'ta'
                            ? 'இந்த எச்சரிக்கைகள் பதிவு செய்யப்பட்ட தரவுகளின் அடிப்படையிலான தானியங்கி முறை எச்சரிக்கைகள். இவை அரசு அதிகாரப்பூர்வ ஆலோசனைகள் அல்ல.'
                            : 'These are automated pattern warnings based on recorded observations. They are not official government advisories.'}
                    </p>
                </div>
            </div>


            {/* Loading */}
            {loading && (
                <div className="alerts-empty-card">
                    <div className="alerts-loading-icon">⏳</div>

                    <h3>
                        {language === 'ta'
                            ? 'எச்சரிக்கைகள் சரிபார்க்கப்படுகின்றன...'
                            : 'Checking for alerts...'}
                    </h3>

                    <p>
                        {language === 'ta'
                            ? 'சமீபத்திய நோய் பதிவுகளை பகுப்பாய்வு செய்கிறது.'
                            : 'Analyzing the latest disease observations.'}
                    </p>
                </div>
            )}


            {/* Error */}
            {!loading && error && (
                <div className="alerts-error-card">
                    <div>⚠️</div>
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={fetchAlerts}
                        className="alerts-refresh-btn"
                    >
                        🔄 {language === 'ta' ? 'மீண்டும் முயற்சி' : 'Try Again'}
                    </button>
                </div>
            )}


            {/* No Alerts */}
            {!loading && !error && alerts.length === 0 && (
                <div className="alerts-empty-card">

                    <div className="alerts-empty-icon">
                        ✅
                    </div>

                    <h3>
                        {language === 'ta'
                            ? 'தற்போது எச்சரிக்கைகள் இல்லை'
                            : 'No Active Alerts'}
                    </h3>

                    <p>
                        {language === 'ta'
                            ? 'பதிவு செய்யப்பட்ட நோய் கண்காணிப்புகளில் குறிப்பிடத்தக்க முறை எதுவும் கண்டறியப்படவில்லை.'
                            : 'No repeated disease patterns or severe observations have been detected in the recorded data.'}
                    </p>

                    <button
                        type="button"
                        onClick={fetchAlerts}
                        className="alerts-refresh-btn"
                    >
                        🔄 {language === 'ta' ? 'புதுப்பிக்கவும்' : 'Refresh Alerts'}
                    </button>
                </div>
            )}


            {/* Alerts */}
            {!loading && !error && alerts.length > 0 && (
                <div className="alerts-content">

                    <div className="alerts-summary">
                        <div>
                            <span className="alerts-label">
                                🚨 ACTIVE MONITORING
                            </span>

                            <h3>
                                {language === 'ta'
                                    ? `${alerts.length} எச்சரிக்கைகள்`
                                    : `${alerts.length} Alert${alerts.length !== 1 ? 's' : ''} Detected`}
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={fetchAlerts}
                            className="alerts-refresh-btn"
                        >
                            🔄 {language === 'ta' ? 'புதுப்பி' : 'Refresh'}
                        </button>
                    </div>


                    <div className="alerts-list">

                        {alerts.map((alert) => (
                            <div
                                className={`agriguard-alert-card ${String(alert.severity || '').toLowerCase()}`}
                                key={alert.id}
                            >

                                <div className="alert-card-top">

                                    <div className="alert-type">
                                        <span className="alert-type-icon">
                                            {getAlertIcon(alert.type)}
                                        </span>

                                        <div>
                                            <span className="alerts-label">
                                                AUTOMATED WARNING
                                            </span>

                                            <h3>
                                                {alert.type}
                                            </h3>
                                        </div>
                                    </div>

                                    <span className={getSeverityClass(alert.severity)}>
                                        {getSeverityIcon(alert.severity)} {alert.severity}
                                    </span>

                                </div>


                                <div className="alert-details">

                                    <div className="alert-detail-item">
                                        <span>🌱</span>
                                        <div>
                                            <small>Crop</small>
                                            <strong>{alert.crop || '—'}</strong>
                                        </div>
                                    </div>

                                    <div className="alert-detail-item">
                                        <span>🦠</span>
                                        <div>
                                            <small>Disease</small>
                                            <strong>{alert.disease || '—'}</strong>
                                        </div>
                                    </div>

                                    {alert.report_count > 1 && (
                                        <div className="alert-detail-item">
                                            <span>📊</span>
                                            <div>
                                                <small>Reports</small>
                                                <strong>
                                                    {alert.report_count}
                                                </strong>
                                            </div>
                                        </div>
                                    )}

                                    {alert.location && (
                                        <div className="alert-detail-item">
                                            <span>📍</span>
                                            <div>
                                                <small>Location</small>
                                                <strong>
                                                    {alert.location}
                                                </strong>
                                            </div>
                                        </div>
                                    )}

                                </div>


                                <div className="alert-message">
                                    <span>💡</span>
                                    <p>{alert.message}</p>
                                </div>

                            </div>
                        ))}

                    </div>

                </div>
            )}

        </div>
    );
};

export default AgriGuardAlerts;