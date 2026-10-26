
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAgriGuardAlerts } from '../../services/diseaseApi';
import { useLanguage } from '../../i18n/LanguageContext';
import './AgriGuardAlerts.css';

const TEXT = {
  en: {
    eyebrow: 'AGRIGUARD / CROP PROTECTION',
    title: 'AgriGuard Alerts',
    subtitle: 'Stay informed about crop disease patterns and potential risks.',
    noticeTitle: 'Automated monitoring system',
    notice:
      'Alerts are generated from recorded disease observations. They are not official government advisories.',
    total: 'Total alerts',
    critical: 'Critical alerts',
    high: 'High priority',
    crops: 'Affected crops',
    monitoring: 'MONITORING CENTER',
    active: 'Active alerts',
    refresh: 'Refresh',
    refreshing: 'Checking...',
    retry: 'Try Again',
    loading: 'Checking crop health alerts',
    loadingText: 'Reviewing the latest recorded disease observations.',
    emptyTitle: 'All clear for now',
    emptyText:
      'No repeated disease patterns or severe observations were detected in the available records.',
    noResults: 'No alerts match your current filters.',
    search: 'Search crop, disease, or location...',
    all: 'All severity levels',
    moderate: 'Moderate',
    highLevel: 'High',
    criticalLevel: 'Critical',
    crop: 'Crop',
    disease: 'Disease',
    reports: 'Reports',
    location: 'Location',
    recommendation: 'Alert details',
    automated: 'AUTOMATED WARNING',
    detected: 'Detected',
    unknown: 'Not specified',
    errorFallback: 'Unable to load AgriGuard alerts.',
    allSeverity: 'All',
  },
  ta: {
    eyebrow: 'அக்ரிகார்டு / பயிர் பாதுகாப்பு',
    title: 'அக்ரிகார்டு எச்சரிக்கைகள்',
    subtitle: 'பயிர் நோய் நிலைகள் மற்றும் அபாயங்களை அறிந்துகொள்ளுங்கள்.',
    noticeTitle: 'தானியங்கி கண்காணிப்பு அமைப்பு',
    notice:
      'பதிவு செய்யப்பட்ட நோய் கண்காணிப்பு தரவுகளின் அடிப்படையில் எச்சரிக்கைகள் உருவாக்கப்படுகின்றன. இவை அரசு அதிகாரப்பூர்வ ஆலோசனைகள் அல்ல.',
    total: 'மொத்த எச்சரிக்கைகள்',
    critical: 'மிக அதிக அபாயம்',
    high: 'அதிக முன்னுரிமை',
    crops: 'பாதிக்கப்பட்ட பயிர்கள்',
    monitoring: 'கண்காணிப்பு மையம்',
    active: 'செயலில் உள்ள எச்சரிக்கைகள்',
    refresh: 'புதுப்பிக்கவும்',
    refreshing: 'சரிபார்க்கிறது...',
    retry: 'மீண்டும் முயற்சிக்கவும்',
    loading: 'பயிர் எச்சரிக்கைகள் சரிபார்க்கப்படுகின்றன',
    loadingText: 'சமீபத்திய நோய் பதிவுகள் ஆய்வு செய்யப்படுகின்றன.',
    emptyTitle: 'தற்போது எச்சரிக்கைகள் இல்லை',
    emptyText:
      'கிடைக்கும் பதிவுகளில் மீண்டும் நிகழும் நோய் நிலைகளோ தீவிரமான பதிவுகளோ கண்டறியப்படவில்லை.',
    noResults: 'தேர்ந்தெடுத்த வடிகட்டிகளுக்கு எச்சரிக்கைகள் இல்லை.',
    search: 'பயிர், நோய் அல்லது இடத்தைத் தேடவும்...',
    all: 'அனைத்து தீவிர நிலைகளும்',
    moderate: 'மிதமானது',
    highLevel: 'அதிகம்',
    criticalLevel: 'மிக அதிகம்',
    crop: 'பயிர்',
    disease: 'நோய்',
    reports: 'பதிவுகள்',
    location: 'இடம்',
    recommendation: 'எச்சரிக்கை விவரங்கள்',
    automated: 'தானியங்கி எச்சரிக்கை',
    detected: 'கண்டறியப்பட்டது',
    unknown: 'குறிப்பிடப்படவில்லை',
    errorFallback: 'அக்ரிகார்டு எச்சரிக்கைகளை ஏற்ற முடியவில்லை.',
    allSeverity: 'அனைத்தும்',
  },
};

function normalizeSeverity(severity) {
  const value = String(severity || '').toLowerCase();

  if (value === 'critical') return 'critical';
  if (value === 'high') return 'high';

  return 'moderate';
}

function getAlertIcon(type) {
  const value = String(type || '').toLowerCase();

  if (value.includes('repeated')) return '↻';
  if (value.includes('severe')) return '!';
  if (value.includes('critical')) return '!';
  return '⚠';
}

function getAlertId(alert, index) {
  return (
    alert?.id ||
    alert?._id ||
    `${alert?.crop || 'crop'}-${alert?.disease || 'disease'}-${index}`
  );
}

export default function AgriGuardAlerts() {
  const { language } = useLanguage();
  const isTamil = language === 'ta';
  const t = isTamil ? TEXT.ta : TEXT.en;

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const fetchAlerts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const response = await getAgriGuardAlerts();

      if (response?.success && Array.isArray(response.data)) {
        setAlerts(response.data);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error('Alert loading error:', err);
      setError(
        err?.response?.data?.message ||
          (language === 'ta'
            ? TEXT.ta.errorFallback
            : TEXT.en.errorFallback)
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [language]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const stats = useMemo(() => {
    const criticalCount = alerts.filter(
      (alert) => normalizeSeverity(alert.severity) === 'critical'
    ).length;

    const highCount = alerts.filter(
      (alert) => normalizeSeverity(alert.severity) === 'high'
    ).length;

    const affectedCrops = new Set(
      alerts.map((alert) => alert.crop).filter(Boolean)
    ).size;

    return {
      total: alerts.length,
      critical: criticalCount,
      high: highCount,
      crops: affectedCrops,
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesSearch = [
        alert.crop,
        alert.disease,
        alert.location,
        alert.type,
        alert.message,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      const matchesSeverity =
        severityFilter === 'all' ||
        normalizeSeverity(alert.severity) === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [alerts, search, severityFilter]);

  const severityLabel = (severity) => {
    const value = normalizeSeverity(severity);

    if (value === 'critical') return t.criticalLevel;
    if (value === 'high') return t.highLevel;
    return t.moderate;
  };

  return (
    <main className="aga-page">
      <header className="aga-hero">
        <div className="aga-hero-copy">
          <div className="aga-eyebrow">
            <span className="aga-live-dot" />
            {t.eyebrow}
          </div>

          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>

          <div className="aga-hero-status">
            <span className="aga-status-icon">✓</span>
            <span>
              {isTamil
                ? 'பயிர் ஆரோக்கிய கண்காணிப்பு'
                : 'Crop health monitoring'}
            </span>
          </div>
        </div>

        <div className="aga-hero-art" aria-hidden="true">
          <div className="aga-art-circle aga-art-circle-one" />
          <div className="aga-art-circle aga-art-circle-two" />
          <div className="aga-art-plant">🌱</div>
          <div className="aga-art-shield">✓</div>
        </div>
      </header>

      <section className="aga-notice" aria-label={t.noticeTitle}>
        <div className="aga-notice-icon">i</div>
        <div>
          <h2>{t.noticeTitle}</h2>
          <p>{t.notice}</p>
        </div>
      </section>

      <section className="aga-stats-grid" aria-label="Alert summary">
        <article className="aga-stat-card">
          <div className="aga-stat-top">
            <span className="aga-stat-icon aga-stat-green">↗</span>
            <span className="aga-stat-caption">{t.total}</span>
          </div>
          <strong>{stats.total}</strong>
          <span className="aga-stat-foot">{t.active}</span>
        </article>

        <article className="aga-stat-card">
          <div className="aga-stat-top">
            <span className="aga-stat-icon aga-stat-red">!</span>
            <span className="aga-stat-caption">{t.critical}</span>
          </div>
          <strong>{stats.critical}</strong>
          <span className="aga-stat-foot">
            {isTamil ? 'மிக உயர்ந்த தீவிரம்' : 'Highest severity'}
          </span>
        </article>

        <article className="aga-stat-card">
          <div className="aga-stat-top">
            <span className="aga-stat-icon aga-stat-orange">△</span>
            <span className="aga-stat-caption">{t.high}</span>
          </div>
          <strong>{stats.high}</strong>
          <span className="aga-stat-foot">
            {isTamil ? 'கூடுதல் கவனம் தேவை' : 'Needs attention'}
          </span>
        </article>

        <article className="aga-stat-card">
          <div className="aga-stat-top">
            <span className="aga-stat-icon aga-stat-blue">♧</span>
            <span className="aga-stat-caption">{t.crops}</span>
          </div>
          <strong>{stats.crops}</strong>
          <span className="aga-stat-foot">
            {isTamil ? 'தனித்துவமான பயிர்கள்' : 'Unique crops'}
          </span>
        </article>
      </section>

      <section className="aga-alerts-section">
        <div className="aga-section-header">
          <div>
            <div className="aga-section-kicker">{t.monitoring}</div>
            <h2>{t.active}</h2>
            <p>
              {isTamil
                ? 'உங்கள் பதிவுகளின் அடிப்படையில் உருவாக்கப்பட்ட எச்சரிக்கைகள்'
                : 'Warnings generated from your recorded observations'}
            </p>
          </div>

          <button
            type="button"
            className="aga-refresh-button"
            onClick={() => fetchAlerts(true)}
            disabled={loading || refreshing}
          >
            <span className={refreshing ? 'aga-refresh-spin' : ''}>↻</span>
            {refreshing ? t.refreshing : t.refresh}
          </button>
        </div>

        {!loading && !error && alerts.length > 0 && (
          <div className="aga-toolbar">
            <label className="aga-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search}
                aria-label={t.search}
              />
            </label>

            <select
              className="aga-severity-filter"
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              aria-label={t.all}
            >
              <option value="all">{t.all}</option>
              <option value="critical">{t.criticalLevel}</option>
              <option value="high">{t.highLevel}</option>
              <option value="moderate">{t.moderate}</option>
            </select>
          </div>
        )}

        {loading && (
          <div className="aga-state-card" role="status">
            <div className="aga-spinner" />
            <h3>{t.loading}</h3>
            <p>{t.loadingText}</p>
          </div>
        )}

        {!loading && error && (
          <div className="aga-state-card aga-error-state" role="alert">
            <div className="aga-state-symbol">!</div>
            <h3>{error}</h3>
            <p>
              {isTamil
                ? 'உங்கள் இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
                : 'Check your connection and try loading the alerts again.'}
            </p>
            <button
              type="button"
              className="aga-primary-button"
              onClick={() => fetchAlerts()}
            >
              {t.retry}
            </button>
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="aga-state-card aga-success-state">
            <div className="aga-state-symbol">✓</div>
            <h3>{t.emptyTitle}</h3>
            <p>{t.emptyText}</p>
            <button
              type="button"
              className="aga-primary-button"
              onClick={() => fetchAlerts(true)}
              disabled={refreshing}
            >
              {refreshing ? t.refreshing : t.refresh}
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          alerts.length > 0 &&
          filteredAlerts.length === 0 && (
            <div className="aga-state-card">
              <div className="aga-state-symbol">⌕</div>
              <h3>{t.noResults}</h3>
              <button
                type="button"
                className="aga-secondary-button"
                onClick={() => {
                  setSearch('');
                  setSeverityFilter('all');
                }}
              >
                {t.allSeverity}
              </button>
            </div>
          )}

        {!loading && !error && filteredAlerts.length > 0 && (
          <>
            <div className="aga-results-line">
              <span>
                <strong>{filteredAlerts.length}</strong>{' '}
                {isTamil ? 'எச்சரிக்கைகள் காண்பிக்கப்படுகின்றன' : 'alerts shown'}
              </span>
              <span className="aga-results-indicator">
                <span />
                {isTamil ? 'கண்காணிப்பு செயலில் உள்ளது' : 'Monitoring active'}
              </span>
            </div>

            <div className="aga-alert-grid">
              {filteredAlerts.map((alert, index) => {
                const severity = normalizeSeverity(alert.severity);

                return (
                  <article
                    className={`aga-alert-card aga-card-${severity}`}
                    key={getAlertId(alert, index)}
                  >
                    <div className="aga-card-accent" />

                    <div className="aga-card-heading">
                      <div className={`aga-type-icon aga-type-${severity}`}>
                        {getAlertIcon(alert.type)}
                      </div>

                      <div className="aga-card-title">
                        <span className="aga-card-eyebrow">{t.automated}</span>
                        <h3>{alert.type || t.title}</h3>
                      </div>

                      <span className={`aga-severity-badge aga-badge-${severity}`}>
                        <span className="aga-severity-dot" />
                        {severityLabel(alert.severity)}
                      </span>
                    </div>

                    <div className="aga-card-details">
                      <div className="aga-detail">
                        <span className="aga-detail-icon">🌱</span>
                        <div>
                          <span>{t.crop}</span>
                          <strong>{alert.crop || t.unknown}</strong>
                        </div>
                      </div>

                      <div className="aga-detail">
                        <span className="aga-detail-icon">✳</span>
                        <div>
                          <span>{t.disease}</span>
                          <strong>{alert.disease || t.unknown}</strong>
                        </div>
                      </div>

                      {Number(alert.report_count) > 1 && (
                        <div className="aga-detail">
                          <span className="aga-detail-icon">▤</span>
                          <div>
                            <span>{t.reports}</span>
                            <strong>{alert.report_count}</strong>
                          </div>
                        </div>
                      )}

                      {alert.location && (
                        <div className="aga-detail">
                          <span className="aga-detail-icon">⌖</span>
                          <div>
                            <span>{t.location}</span>
                            <strong>{alert.location}</strong>
                          </div>
                        </div>
                      )}
                    </div>

                    {alert.message && (
                      <div className="aga-message">
                        <span className="aga-message-icon">i</span>
                        <div>
                          <strong>{t.recommendation}</strong>
                          <p>{alert.message}</p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <footer className="aga-footer-note">
        <span>🌿</span>
        <p>
          {isTamil
            ? 'வழக்கமான பயிர் கண்காணிப்பைத் தொடரவும். முக்கியமான முடிவுகளுக்கு வேளாண் நிபுணரின் ஆலோசனையைப் பெறவும்.'
            : 'Continue monitoring your crops regularly. Consult an agricultural expert for important treatment decisions.'}
        </p>
      </footer>
    </main>
  );
}
