import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import { CogIcon } from '../../icons/CogIcon';
import SearchIcon from '../../icons/SearchIcon';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';

const SessionsPage = () => {
    const { t } = useTranslation();
    const [activeFilter, setActiveFilter] = useState('all');
    const [sessionCount, setSessionCount] = useState(10);
    const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

    const sessions = [
        {
            id: '1750336806489_hynr98a8v',
            name: t('sessions.session1.name'),
            start: '2025-06-19 15:40:06',
            end: '2025-06-19 17:18:44',
            status: 'completed',
            audio: t('sessions.audio_format'),
            monitoringId: '1750336806489_hynr98a8v',
            details: {
                duration: t('sessions.duration_1h38m'),
                participants: 2,
                recordingQuality: t('sessions.quality.high'),
                issues: t('sessions.issues.none')
            }
        },
        {
            id: '175033683986_x4',
            name: t('sessions.session2.name'),
            start: '2025-06-19 14:30:00',
            end: '2025-06-19 15:15:30',
            status: 'completed',
            audio: t('sessions.audio_format'),
            monitoringId: '175033683986_x4',
            details: {
                duration: t('sessions.duration_45m'),
                participants: 3,
                recordingQuality: t('sessions.quality.medium'),
                issues: t('sessions.issues.minor')
            }
        }
    ];

    const toggleSession = (sessionId: string) => {
        setExpandedSessions(prev => ({
            ...prev,
            [sessionId]: !prev[sessionId]
        }));
    };

    const handleRefreshData = () => {
        console.log(t('sessions.refreshing_data'));
    };

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <CogIcon />
                        {t('sessions.settings.title')}
                    </h2>
                    <div className={commonStyles.subHeader}>{t('sessions.server.title')}</div>
                    <div className={commonStyles.serverAddress}>51.250.115.73:8000</div>
                    <div className={commonStyles.statusItem}>
                        <span>{t('sessions.status')}:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon /> {t('sessions.server.available')}
                        </span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>MongoDB:</span>
                        <span className={commonStyles.statusActive}><CheckCircleIcon /></span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>{t('sessions.server.api_keys')}:</span>
                        <span className={commonStyles.statusActive}><CheckCircleIcon /></span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>{t('sessions.server.active_sessions')}:</span>
                        <span>0</span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>WebSocket:</span>
                        <span>0</span>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <SearchIcon /> {t('sessions.filters.title')}
                    </h2>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>{t('sessions.filters.session_status')}</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                        >
                            <option value="all">{t('sessions.filters.all')}</option>
                            <option value="active">{t('sessions.filters.active')}</option>
                            <option value="completed">{t('sessions.filters.completed')}</option>
                        </select>
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>{t('sessions.filters.session_count')}</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={sessionCount}
                            onChange={(e) => setSessionCount(Number(e.target.value))}
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>

                    <button
                        className={commonStyles.primaryButton}
                        onClick={handleRefreshData}
                        style={{ width: '100%', marginTop: '15px' }}
                    >
                        {t('sessions.buttons.refresh')}
                    </button>
                </div>
            </div>

            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>{t('sessions.title')}</h1>

                <div className={commonStyles.infoCard}>
                    <div className={commonStyles.statsGrid}>
                        <div className={commonStyles.statBox}>
                            <div className={commonStyles.statValue}>{sessions.length}</div>
                            <div className={commonStyles.statLabel}>{t('sessions.stats.found')}</div>
                        </div>
                        <div className={commonStyles.statBox}>
                            <div className={commonStyles.statValue}>
                                {sessions.filter(s => s.status === 'active').length}
                            </div>
                            <div className={commonStyles.statLabel}>{t('sessions.stats.active')}</div>
                        </div>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>{t('sessions.session_list.title')}</h2>

                    {sessions.map(session => (
                        <div key={session.id} className={commonStyles.sessionCard}>
                            <div
                                className={commonStyles.sessionHeader}
                                onClick={() => toggleSession(session.id)}
                            >
                                <h3 className={commonStyles.sessionTitle}>{session.name}</h3>
                                <div className={commonStyles.sessionStatus}>
                                    {expandedSessions[session.id] ? '▲' : '▼'}
                                </div>
                            </div>

                            {expandedSessions[session.id] && (
                                <>
                                    <div className={commonStyles.sessionBasicInfo}>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>{t('sessions.details.id')}:</span>
                                            <span className={commonStyles.detailValue}>{session.id}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>{t('sessions.details.start')}:</span>
                                            <span className={commonStyles.detailValue}>{session.start}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>{t('sessions.details.end')}:</span>
                                            <span className={commonStyles.detailValue}>{session.end}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>{t('sessions.details.status')}:</span>
                                            <span className={`${session.status === 'completed' ? commonStyles.statusCompleted : commonStyles.statusActive}`}>
                                                {t(`sessions.statuses.${session.status}`)}
                                            </span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>{t('sessions.details.audio')}:</span>
                                            <span className={commonStyles.detailValue}>{session.audio}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>{t('sessions.details.duration')}:</span>
                                            <span className={commonStyles.detailValue}>{session.details.duration}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>{t('sessions.details.participants')}:</span>
                                            <span className={commonStyles.detailValue}>{session.details.participants}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>{t('sessions.details.quality')}:</span>
                                            <span className={commonStyles.detailValue}>{session.details.recordingQuality}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>{t('sessions.details.issues')}:</span>
                                            <span className={commonStyles.detailValue}>{session.details.issues}</span>
                                        </div>
                                    </div>

                                    <div className={commonStyles.sessionActions}>
                                        <button className={commonStyles.secondaryButton}>
                                            {t('sessions.buttons.details')}
                                        </button>
                                        <button className={commonStyles.secondaryButton}>
                                            {t('sessions.buttons.monitoring')}
                                        </button>
                                        <div className={commonStyles.monitoringId}>
                                            {session.monitoringId}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className={commonStyles.sessionDivider}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SessionsPage;