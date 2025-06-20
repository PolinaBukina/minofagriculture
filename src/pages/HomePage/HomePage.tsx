import React, { useState } from 'react';
import commonStyles from '../commonStyles.module.css';
import { CogIcon } from '../../icons/CogIcon';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import NotCheckIcon from '../../icons/NotCheckIcon';
import { LectureIcon } from '../../icons/LectureIcon';
import { MonitorIcon } from '../../icons/MonitorIcon';
import FolderIcon from '../../icons/FolderIcon';
import ControlIcon from '../../icons/ControlIcon';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const navigate = useNavigate();

    const toArchive = () => {
        navigate('archive_viewer');
    }

    const toMonitor = () => {
        navigate('monitor');
    }
    const toSessions = () => {
        navigate('sessions');
    }

    const toListener = () => {
        navigate('listener');
    }
    const toRecorder = () => {
        navigate('recorder');
    }

    return (
        <div className={commonStyles.appContainer}>
            {/* Левое меню */}
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <CogIcon />
                        Настройки
                    </h2>

                    <div className={commonStyles.subHeader}>
                        Сервер
                    </div>
                    <div className={commonStyles.statusItem}>
                        <span>Адрес:</span>
                        <span>51.250.115.73:8000</span>
                    </div>
                    <div className={commonStyles.statusItem}>
                        <span>Статус:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon />
                            Сервер доступен
                        </span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>MongoDB:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon />
                        </span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>API ключи:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon />
                        </span>
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
                    <h2 className={commonStyles.subHeader}>
                        <FolderIcon />
                        Текущая сессия
                    </h2>
                    <div className={commonStyles.statusItem}>
                        <span>Статус:</span>
                        <span className={isRecording ? commonStyles.statusActive : commonStyles.statusInactive}>
                            {isRecording ? (
                                <>
                                    <CheckCircleIcon /> Идет запись
                                </>
                            ) : (
                                <>
                                    <NotCheckIcon /> Нет активной записи
                                </>
                            )}
                        </span>
                    </div>
                    <div className={commonStyles.noteText}>
                        ID появится после начала записи
                    </div>
                </div>

                {/* Меню задач из скриншота */}
                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>Запись аудио</h3>

                    <ul className={commonStyles.taskList}>
                        <li className={commonStyles.taskItem}>
                            <input type="checkbox" id="task1" />
                            <label htmlFor="task1">Возьмись аудио (БЕЗ ЗАДЕРЖЕК)</label>
                        </li>
                        <li className={commonStyles.taskItem}>
                            <input type="checkbox" id="task2" checked readOnly />
                            <label htmlFor="task2">Тогда к записи</label>
                        </li>
                        <li className={commonStyles.taskItem}>
                            <input type="checkbox" id="task3" />
                            <label htmlFor="task3">Начать запись</label>
                        </li>
                        <li className={commonStyles.taskItem}>
                            <input type="checkbox" id="task4" />
                            <label htmlFor="task4">Остановить запись</label>
                        </li>
                    </ul>

                    <div className={commonStyles.techInfo}>
                        <p>AudioContext + защита от задержек</p>
                        <p>(отправка каждые 0,2с + принудительная очистка каждые 10с)</p>
                    </div>

                    <div className={commonStyles.logEntries}>
                        <p>16:28:14. Улучшенная инновационная БЕЗ ЗАДЕРЖЕК завершена</p>
                        <p>16:28:14. Отправка каждые 0,2с + принудительная очистка каждые 10с</p>
                        <p>16:28:14. Целевая частота: 16000Hz, формат: PCM10</p>
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />

                {/* Выбор роли */}
                <div className={commonStyles.roleSelection}>
                    <h2 className={commonStyles.sectionTitle}>Выберите вашу роль:</h2>
                    <div className={commonStyles.roleButtons}>
                        <button className={`${commonStyles.roleButton} ${commonStyles.primaryRoleButton}`} onClick={toRecorder}>
                            Я ЛЕКТОР
                        </button>
                        <button className={`${commonStyles.roleButton} ${commonStyles.secondaryRoleButton}`} onClick={toListener}>
                            Я СЛУШАТЕЛЬ
                        </button>
                    </div>
                </div>

                {/* Быстрый доступ */}
                <div className={commonStyles.quickAccess}>
                    <h2 className={commonStyles.sectionTitle}>Быстрый доступ:</h2>
                    <div className={commonStyles.quickLinks}>
                        <button className={commonStyles.quickLink} onClick={toArchive}>
                            <LectureIcon />
                            <span>Архив лекций</span>
                        </button>
                        <button className={commonStyles.quickLink} onClick={toMonitor}>
                            <MonitorIcon />
                            <span>Мониторинг</span>
                        </button>
                        <button className={commonStyles.quickLink} onClick={toSessions}>
                            <ControlIcon />
                            <span>Управление</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;