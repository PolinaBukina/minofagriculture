import { useState } from 'react';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import { CogIcon } from '../../icons/CogIcon';
import SearchIcon from '../../icons/SearchIcon';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';

const SessionsPage = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [sessionCount, setSessionCount] = useState(10);
    const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

    const sessions = [
        {
            id: '1750336806489_hynr98a8v',
            name: 'Сессия 1:1750336806489_hy...',
            start: '2025-06-19 15:40:06',
            end: '2025-06-19 17:18:44',
            status: 'completed',
            audio: '16000Hz, 1 канал(ов)',
            monitoringId: '1750336806489_hynr98a8v',
            details: {
                duration: '1 час 38 минут',
                participants: 2,
                recordingQuality: 'Высокое',
                issues: 'Нет'
            }
        },
        {
            id: '175033683986_x4',
            name: 'Сессия 2:175033683986_x4...',
            start: '2025-06-19 14:30:00',
            end: '2025-06-19 15:15:30',
            status: 'completed',
            audio: '16000Hz, 1 канал(ов)',
            monitoringId: '175033683986_x4',
            details: {
                duration: '45 минут',
                participants: 3,
                recordingQuality: 'Среднее',
                issues: 'Незначительные помехи'
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
        // Логика обновления данных
        console.log('Обновление данных...');
    };

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    {/* <h2 className={commonStyles.sectionHeader}><CogIcon /> Настройки</h2> */}

                    <h2 className={commonStyles.subHeader}>
                        <CogIcon />
                        Настройки
                    </h2>
                    <div className={commonStyles.subHeader}> Сервер</div>
                    <div className={commonStyles.serverAddress}>51.250.115.73:8000</div>
                    <div className={commonStyles.statusItem}>
                        <span>Статус:</span>
                        <span className={commonStyles.statusActive}><CheckCircleIcon /> Сервер доступен</span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>MongoDB:</span>
                        <span className={commonStyles.statusActive}><CheckCircleIcon /></span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>API ключи:</span>
                        <span className={commonStyles.statusActive}><CheckCircleIcon /></span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>Активные сессии:</span>
                        <span>0</span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>WebSocket:</span>
                        <span>0</span>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}><SearchIcon /> Фильтры</h2>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Статус сессий</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                        >
                            <option value="all">Все</option>
                            <option value="active">Активные</option>
                            <option value="completed">Завершенные</option>
                        </select>
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Количество сессий</label>
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
                        Обновить данные
                    </button>
                </div>
            </div>

            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>Управление сессиями</h1>

                <div className={commonStyles.infoCard}>
                    <div className={commonStyles.statsGrid}>
                        <div className={commonStyles.statBox}>
                            <div className={commonStyles.statValue}>{sessions.length}</div>
                            <div className={commonStyles.statLabel}>Найдено сессии</div>
                        </div>
                        <div className={commonStyles.statBox}>
                            <div className={commonStyles.statValue}>
                                {sessions.filter(s => s.status === 'active').length}
                            </div>
                            <div className={commonStyles.statLabel}>Активные</div>
                        </div>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>Список всех сессий</h2>

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
                                            <span className={commonStyles.detailLabel}>ID:</span>
                                            <span className={commonStyles.detailValue}>{session.id}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>Начало:</span>
                                            <span className={commonStyles.detailValue}>{session.start}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>Конец:</span>
                                            <span className={commonStyles.detailValue}>{session.end}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>Статус:</span>
                                            <span className={`${session.status === 'completed' ? commonStyles.statusCompleted : commonStyles.statusActive}`}>
                                                {session.status}
                                            </span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>Аудио:</span>
                                            <span className={commonStyles.detailValue}>{session.audio}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>Длительность:</span>
                                            <span className={commonStyles.detailValue}>{session.details.duration}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>Участники:</span>
                                            <span className={commonStyles.detailValue}>{session.details.participants}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>Качество записи:</span>
                                            <span className={commonStyles.detailValue}>{session.details.recordingQuality}</span>
                                        </div>
                                        <div className={commonStyles.detailRow}>
                                            <span className={commonStyles.detailLabel}>Проблемы:</span>
                                            <span className={commonStyles.detailValue}>{session.details.issues}</span>
                                        </div>
                                    </div>

                                    <div className={commonStyles.sessionActions}>
                                        <button className={commonStyles.secondaryButton}>
                                            Подробности
                                        </button>
                                        <button className={commonStyles.secondaryButton}>
                                            Мониторинг
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