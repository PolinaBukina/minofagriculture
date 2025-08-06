import { useState, useEffect, useCallback } from 'react';
import commonStyles from '../commonStyles.module.css';
import { MonitorIcon } from '../../icons/MonitorIcon';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
import { MonitoringWebSocket, apiService } from '../../services/api';
import { useTranslation } from 'react-i18next';

interface Lecture {
    id: string;
    title: string;
    lecturer: string;
    startTime: string;
    participants: number | string;
    status: 'live' | 'recording' | 'paused' | string;
    session_id: string;
    start_time: string;
}

interface SessionData {
    session_id: string;
    title?: string;
    lecturer?: string;
    start_time: string;
    participants?: number;
    status: string;
}

const ActiveLecturesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userRole = getRoleFromStorage();

    const [activeLectures, setActiveLectures] = useState<Lecture[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [wsStatus, setWsStatus] = useState<string>(t('active_lectures.ws_disconnected'));

    const [webSocket, setWebSocket] = useState<MonitoringWebSocket | null>(null);

    const formatTime = (timestamp?: string): string => {
        if (!timestamp) return 'Неизвестно';

        try {
            const date = new Date(timestamp);
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return timestamp?.slice(0, 8) || t('active_lectures.unknown_time');
        }
    };

    // const formatTime = (timestamp: string): string => {
    //     try {
    //         const dt = new Date(timestamp);
    //         return dt.toLocaleTimeString('ru-RU', {
    //             hour: '2-digit',
    //             minute: '2-digit',
    //             second: '2-digit'
    //         });
    //     } catch {
    //         return timestamp?.slice(0, 8) || t('active_lectures.unknown_time');
    //     }
    // };

    const loadActiveSessions = useCallback(async () => {
        try {
            setError('');
            const sessions = await apiService.getSessions();

            if (sessions && sessions.length > 0) {
                const active = sessions
                    .filter(s => s.status === 'active')
                    .map(session => ({
                        id: session.session_id,
                        title: session.title || t('active_lectures.default_title'),
                        lecturer: session.lecturer || t('active_lectures.unknown_lecturer'),
                        startTime: session.start_time,
                        participants: session.participants || 0,
                        status: 'live',
                        session_id: session.session_id,
                        start_time: session.start_time
                    }));

                setActiveLectures(active);
            } else {
                setActiveLectures([]);
            }
        } catch (err) {
            console.error('Error loading sessions:', err);
            setError(t('active_lectures.load_error'));
            setActiveLectures([]);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    const connectWebSocket = useCallback(async () => {
        try {
            if (webSocket) {
                webSocket.disconnect();
            }

            const ws = new MonitoringWebSocket();

            ws.onMessage('status', (data: { status?: string; message?: string }) => {
                setWsStatus(data.status || data.message || t('active_lectures.ws_connected'));
            });

            ws.onMessage('session_update', () => {
                loadActiveSessions();
            });

            ws.onMessage('error', (data: { message?: string }) => {
                setError(data.message || t('active_lectures.ws_error'));
            });

            await ws.connect();
            setWebSocket(ws);
            setIsConnected(true);
            setWsStatus(t('active_lectures.ws_connected'));

        } catch (err) {
            console.error('WebSocket connection error:', err);
            setError(t('active_lectures.ws_connection_error'));
            setIsConnected(false);
            setWsStatus(t('active_lectures.ws_error'));
        }
    }, [webSocket, loadActiveSessions, t]);

    const handleViewLecture = (id: string) => {
        navigate(`/active/lecture/${id}`);
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'live': return commonStyles.statusActive;
            case 'recording': return commonStyles.statusWarning;
            case 'paused': return commonStyles.statusInactive;
            default: return '';
        }
    };

    const getStatusText = (status: string): string => {
        switch (status) {
            case 'live': return t('active_lectures.status_live');
            case 'recording': return t('active_lectures.status_recording');
            case 'paused': return t('active_lectures.status_paused');
            default: return status;
        }
    };

    useEffect(() => {
        loadActiveSessions();
        connectWebSocket();

        const interval = setInterval(loadActiveSessions, 30000);

        return () => {
            clearInterval(interval);
            if (webSocket) {
                webSocket.disconnect();
            }
        };
    }, [loadActiveSessions, connectWebSocket, webSocket]);

    if (isLoading) {
        return (
            <div className={commonStyles.appContainer}>
                <div className={commonStyles.mainContent}>
                    <Header />
                    <Breadcrumbs
                        items={[
                            {
                                label: getHomeLabel(userRole),
                                path: getHomePath(userRole)
                            },
                            {
                                label: t('active_lectures.title'),
                                path: ''
                            }
                        ]}
                    />
                    <div className={commonStyles.infoCard} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '300px'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            border: '6px solid rgba(0, 0, 0, 0.1)',
                            borderTop: '6px solid #3498db',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{
                            color: '#555',
                            fontSize: '1.2rem',
                            fontWeight: '500',
                            marginTop: '20px'
                        }}>
                            {t('active_lectures.loading')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.mainContent}>
                <Header />
                <Breadcrumbs
                    items={[
                        {
                            label: getHomeLabel(userRole),
                            path: getHomePath(userRole)
                        },
                        {
                            label: t('active_lectures.title'),
                            path: ''
                        }
                    ]}
                />
                <h1 className={commonStyles.sectionHeader}>{t('active_lectures.title')}</h1>
                <p className={commonStyles.subHeader}>{t('active_lectures.subtitle')}</p>

                <div className={commonStyles.infoCard} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: isConnected ? '#10b981' : '#ef4444'
                            }}></div>
                            <span>{wsStatus}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            {t('active_lectures.active_count', { count: activeLectures.length })}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className={commonStyles.infoCard} style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        marginBottom: '20px'
                    }}>
                        <div style={{ color: '#dc2626' }}>❌ {error}</div>
                    </div>
                )}

                <div className={commonStyles.infoCard}>
                    {activeLectures.length === 0 ? (
                        <div className={commonStyles.noteText}>
                            <MonitorIcon />
                            <div className={commonStyles.noteText_text}>
                                <div>{t('active_lectures.no_lectures')}</div>
                                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                                    {t('active_lectures.no_lectures_hint')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        activeLectures.map(lecture => (
                            <div
                                key={lecture.id}
                                className={commonStyles.listItem}
                                onClick={() => handleViewLecture(lecture.id)}
                                style={{
                                    cursor: 'pointer',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    padding: '16px',
                                    transition: 'all 0.2s',
                                    backgroundColor: '#ffffff'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>
                                            {lecture.title}
                                        </h3>

                                        <div className={commonStyles.statusItem}>
                                            <span>{t('active_lectures.lecturer')}:</span>
                                            <span>{lecture.lecturer}</span>
                                        </div>

                                        <div className={commonStyles.statusItem}>
                                            <span>{t('active_lectures.start_time')}:</span>
                                            <span>{formatTime(lecture.startTime)}</span>
                                        </div>

                                        <div className={commonStyles.statusItem}>
                                            <span>{t('active_lectures.participants')}:</span>
                                            <span>{lecture.participants}</span>
                                        </div>

                                        <div className={commonStyles.statusItem}>
                                            <span>{t('active_lectures.session_id')}:</span>
                                            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                {lecture.session_id?.slice(0, 12)}...
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div className={`${getStatusColor(lecture.status)}`} style={{
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            marginBottom: '8px',
                                            display: 'inline-block'
                                        }}>
                                            🟢 {getStatusText(lecture.status)}
                                        </div>

                                        <div style={{
                                            fontSize: '12px',
                                            color: '#666',
                                            animation: 'pulse 2s infinite'
                                        }}>
                                            LIVE
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {!isLoading && (
                    <div className={commonStyles.infoCard} style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        marginTop: '20px'
                    }}>
                        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>💡 {t('active_lectures.info_title')}</h3>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                            <li>{t('active_lectures.info_point1')}</li>
                            <li>{t('active_lectures.info_point2')}</li>
                            <li>{t('active_lectures.info_point3')}</li>
                            <li>{t('active_lectures.info_point4')}</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveLecturesPage;