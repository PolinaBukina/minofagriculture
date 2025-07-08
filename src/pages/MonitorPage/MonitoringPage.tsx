import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import commonStyles from '../commonStyles.module.css';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import { CogIcon } from '../../icons/CogIcon';
import Header from '../../components/Header/Header';

const MonitoringPage = () => {
    const { t } = useTranslation();
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [activeMode, setActiveMode] = useState<'lite' | 'full'>('lite');
    const [messageCount, setMessageCount] = useState(0);

    const activeSessions = [
        { id: 's1', name: t('monitoring.sessions.biology_lecture') },
        { id: 's2', name: t('monitoring.sessions.chemistry_seminar') }
    ];

    const recentSessions = [
        { id: 's3', name: t('monitoring.sessions.intro_lecture') },
        { id: 's4', name: t('monitoring.sessions.physics_practice') }
    ];

    const handleStartMonitoring = () => {
        setIsMonitoring(true);
    };

    const handleStopMonitoring = () => {
        setIsMonitoring(false);
    };

    const handleClearHistory = () => {
        setMessageCount(0);
    };

    const featureItemsLite = [
        t('monitoring.features.lite.update_interval'),
        t('monitoring.features.lite.message_limit'),
        t('monitoring.features.lite.clear_history'),
        t('monitoring.features.lite.simple_interface'),
        t('monitoring.features.lite.remove_duplicates')
    ];

    const usageItems = [
        t('monitoring.usage.select_session'),
        t('monitoring.usage.start_monitoring'),
        t('monitoring.usage.clear_history_periodically'),
        t('monitoring.usage.monitor_performance')
    ];

    return (
        <div className={commonStyles.appContainer}>
            {/* Боковая панель */}
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <CogIcon className={commonStyles.icon} /> {t('monitoring.settings.title')}
                    </h2>
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>{t('monitoring.server.title')}</h3>
                    <div className={commonStyles.statusItem}>
                        <span>{t('monitoring.server.address')}:</span>
                        <span>51.250.115.73:8000</span>
                    </div>
                    <div className={commonStyles.statusItem}>
                        <span>{t('monitoring.status')}:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon className={commonStyles.icon} /> {t('monitoring.server.available')}
                        </span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>MongoDB:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon className={commonStyles.icon} />
                        </span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>{t('monitoring.server.api_keys')}:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon className={commonStyles.icon} />
                        </span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>{t('monitoring.server.active_sessions')}:</span>
                        <span>0</span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>WebSocket:</span>
                        <span>4</span>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>{t('monitoring.performance.title')}</h3>
                    <div className={commonStyles.statusItem}>
                        <span>{t('monitoring.performance.messages')}:</span>
                        <span className={commonStyles.statusActive}>{messageCount}</span>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>{t('monitoring.session_selection.title')}</h3>
                    <h4 className={commonStyles.subHeader}>{t('monitoring.session_selection.active_sessions')}:</h4>
                    {activeSessions.length > 0 ? (
                        <ul className={commonStyles.itemList}>
                            {activeSessions.map(session => (
                                <li key={session.id} className={commonStyles.listItem}>
                                    {session.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={commonStyles.noteText}>{t('monitoring.session_selection.no_active')}</div>
                    )}

                    <h4 className={commonStyles.subHeader}>{t('monitoring.session_selection.recent_completed')}:</h4>
                    {recentSessions.length > 0 ? (
                        <ul className={commonStyles.itemList}>
                            {recentSessions.map(session => (
                                <li key={session.id} className={commonStyles.listItem}>
                                    {session.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={commonStyles.noteText}>{t('monitoring.session_selection.no_completed')}</div>
                    )}
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>{t('monitoring.mode.title')}</h3>
                    <div
                        className={`${commonStyles.listItem} ${activeMode === 'lite' ? commonStyles.activeItem : ''}`}
                        onClick={() => setActiveMode('lite')}
                    >
                        <div>
                            <div>Lite (20+ {t('monitoring.mode.minutes')})</div>
                            <div className={commonStyles.statusActive}>
                                <CheckCircleIcon className={commonStyles.icon} /> {t('monitoring.mode.optimized')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>{t('monitoring.title')}</h1>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>{t('monitoring.audio_processing.title')}</h2>
                    <div className={commonStyles.buttonGroup}>
                        <button
                            onClick={handleStartMonitoring}
                            disabled={isMonitoring}
                            className={`${commonStyles.primaryButton} ${isMonitoring ? commonStyles.disabledButton : ''}`}
                        >
                            {t('monitoring.buttons.start')}
                        </button>
                        <button
                            onClick={handleStopMonitoring}
                            disabled={!isMonitoring}
                            className={`${commonStyles.secondaryButton} ${!isMonitoring ? commonStyles.disabledButton : ''}`}
                        >
                            {t('monitoring.buttons.stop')}
                        </button>
                    </div>
                    <p className={commonStyles.noteText}>
                        {isMonitoring
                            ? t('monitoring.status_monitoring')
                            : t('monitoring.status_not_monitoring')}
                    </p>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>{t('monitoring.optimized_monitoring.title')}</h2>

                    <h3 className={commonStyles.subHeader}>{t('monitoring.optimized_monitoring.lite_mode')}:</h3>
                    <ul className={commonStyles.featureList}>
                        {featureItemsLite.map((item, index) => (
                            <li key={index} className={commonStyles.featureItem}>
                                <span className={commonStyles.featureCheckbox}></span>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <h3 className={commonStyles.subHeader}>{t('monitoring.usage.title')}:</h3>
                    <ul className={commonStyles.featureList}>
                        {usageItems.map((item, index) => (
                            <li key={index} className={commonStyles.featureItem}>
                                <span className={commonStyles.featureCheckbox}></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MonitoringPage;