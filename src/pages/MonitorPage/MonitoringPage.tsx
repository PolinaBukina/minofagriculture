import { useState } from 'react';
import commonStyles from '../commonStyles.module.css';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import { CogIcon } from '../../icons/CogIcon';
import Header from '../../components/Header/Header';

const MonitoringPage = () => {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [activeMode, setActiveMode] = useState<'lite' | 'full'>('lite');
    const [messageCount, setMessageCount] = useState(0);

    const activeSessions = [
        { id: 's1', name: 'Лекция по биологии' },
        { id: 's2', name: 'Семинар по химии' }
    ];

    const recentSessions = [
        { id: 's3', name: 'Вводная лекция' },
        { id: 's4', name: 'Практика по физике' }
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

    return (
        <div className={commonStyles.appContainer}>
            {/* Боковая панель */}
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <CogIcon className={commonStyles.icon} /> Настройки мониторинга
                    </h2>
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>Сервер</h3>
                    <div className={commonStyles.statusItem}>
                        <span>Адрес:</span>
                        <span>51.250.115.73:8000</span>
                    </div>
                    <div className={commonStyles.statusItem}>
                        <span>Статус:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon className={commonStyles.icon} /> Сервер доступен
                        </span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>MongoDB:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon className={commonStyles.icon} />
                        </span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>API ключи:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon className={commonStyles.icon} />
                        </span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>Активные сессии:</span>
                        <span>0</span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>WebSocket:</span>
                        <span>4</span>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>Производительность</h3>
                    <div className={commonStyles.statusItem}>
                        <span>Сообщений:</span>
                        <span className={commonStyles.statusActive}>{messageCount}</span>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>Выбор сессии</h3>
                    <h4 className={commonStyles.subHeader}>Активные сессии:</h4>
                    {activeSessions.length > 0 ? (
                        <ul className={commonStyles.itemList}>
                            {activeSessions.map(session => (
                                <li key={session.id} className={commonStyles.listItem}>
                                    {session.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={commonStyles.noteText}>Нет активных сессий</div>
                    )}

                    <h4 className={commonStyles.subHeader}>Последние завершенные:</h4>
                    {recentSessions.length > 0 ? (
                        <ul className={commonStyles.itemList}>
                            {recentSessions.map(session => (
                                <li key={session.id} className={commonStyles.listItem}>
                                    {session.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={commonStyles.noteText}>Нет завершенных сессий</div>
                    )}
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>Режим</h3>
                    <div
                        className={`${commonStyles.listItem} ${activeMode === 'lite' ? commonStyles.activeItem : ''}`}
                        onClick={() => setActiveMode('lite')}
                    >
                        <div>
                            <div>Lite (20+ мин)</div>
                            <div className={commonStyles.statusActive}>
                                <CheckCircleIcon className={commonStyles.icon} /> Оптимизировано для долгих сессий
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>Мониторинг в реальном времени</h1>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>Отслеживание событий обработки аудио</h2>
                    <div className={commonStyles.buttonGroup}>
                        <button
                            onClick={handleStartMonitoring}
                            disabled={isMonitoring}
                            className={`${commonStyles.primaryButton} ${isMonitoring ? commonStyles.disabledButton : ''}`}
                        >
                            Начать мониторинг
                        </button>
                        <button
                            onClick={handleStopMonitoring}
                            disabled={!isMonitoring}
                            className={`${commonStyles.secondaryButton} ${!isMonitoring ? commonStyles.disabledButton : ''}`}
                        >
                            Остановить мониторинг
                        </button>
                    </div>
                    <p className={commonStyles.noteText}>
                        {isMonitoring
                            ? 'Идет мониторинг событий...'
                            : 'Начните мониторинг для просмотра событий в реальном времени'}
                    </p>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>Оптимизированный мониторинг:</h2>

                    <h3 className={commonStyles.subHeader}>Lite-режим для долгих лекций:</h3>
                    <ul className={commonStyles.featureList}>
                        {[
                            'Обновление каждые 3 секунды (экономия ресурсов)',
                            'Максимум 30 сообщений в памяти',
                            'Кнопка быстрой очистки истории',
                            'Упрощенный интерфейс',
                            'Удаление дубликатов сообщений'
                        ].map((item, index) => (
                            <li key={index} className={commonStyles.featureItem}>
                                <span className={commonStyles.featureCheckbox}></span>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <h3 className={commonStyles.subHeader}>Как использовать:</h3>
                    <ul className={commonStyles.featureList}>
                        {[
                            'Выберите сессию в боковой панели',
                            'Нажмите "Начать мониторинг"',
                            'При долгих лекциях периодически очищайте историю',
                            'Следите за производительностью'
                        ].map((item, index) => (
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