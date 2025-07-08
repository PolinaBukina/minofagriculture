import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const AdminPage = () => {
    const { t } = useTranslation();
    const [isRecording, setIsRecording] = useState(false);
    const navigate = useNavigate();

    const toArchive = () => {
        navigate('/archive');
    }

    const toMonitor = () => {
        navigate('/monitor');
    }
    const toSessions = () => {
        navigate('/sessions');
    }

    const toListener = () => {
        navigate('/listener');
    }
    const toRecorder = () => {
        navigate('/lector/recorder');
    }

    return (
        <div className={commonStyles.appContainer}>
            {/* Левое меню */}
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <FolderIcon />
                        {t('admin.current_session.title')}
                    </h2>
                    <div className={commonStyles.statusItem}>
                        <span>{t('admin.status')}:</span>
                        <span className={isRecording ? commonStyles.statusActive : commonStyles.statusInactive}>
                            {isRecording ? (
                                <>
                                    <CheckCircleIcon /> {t('admin.recording_active')}
                                </>
                            ) : (
                                <>
                                    <NotCheckIcon /> {t('admin.no_active_recording')}
                                </>
                            )}
                        </span>
                    </div>
                    <div className={commonStyles.noteText}>
                        {t('admin.id_will_appear')}
                    </div>
                </div>

                {/* Меню задач из скриншота */}
                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>{t('admin.audio_recording.title')}</h3>

                    <ul className={commonStyles.taskList}>
                        <li className={commonStyles.taskItem}>
                            <input type="checkbox" id="task1" />
                            <label htmlFor="task1">{t('admin.audio_recording.tasks.capture_audio')}</label>
                        </li>
                        <li className={commonStyles.taskItem}>
                            <input type="checkbox" id="task2" checked readOnly />
                            <label htmlFor="task2">{t('admin.audio_recording.tasks.then_to_recording')}</label>
                        </li>
                        <li className={commonStyles.taskItem}>
                            <input type="checkbox" id="task3" />
                            <label htmlFor="task3">{t('admin.audio_recording.tasks.start_recording')}</label>
                        </li>
                        <li className={commonStyles.taskItem}>
                            <input type="checkbox" id="task4" />
                            <label htmlFor="task4">{t('admin.audio_recording.tasks.stop_recording')}</label>
                        </li>
                    </ul>

                    <div className={commonStyles.techInfo}>
                        <p>{t('admin.audio_recording.tech_info.line1')}</p>
                        <p>{t('admin.audio_recording.tech_info.line2')}</p>
                    </div>

                    <div className={commonStyles.logEntries}>
                        <p>{t('admin.audio_recording.logs.line1')}</p>
                        <p>{t('admin.audio_recording.logs.line2')}</p>
                        <p>{t('admin.audio_recording.logs.line3')}</p>
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />

                {/* Быстрый доступ */}
                <div className={commonStyles.quickAccess}>
                    <h2 className={commonStyles.sectionTitle}>{t('admin.quick_access.title')}:</h2>
                    <div className={commonStyles.quickLinks}>
                        <button className={commonStyles.quickLink} onClick={toArchive}>
                            <LectureIcon />
                            <span>{t('admin.quick_access.archive')}</span>
                        </button>
                        <button className={commonStyles.quickLink} onClick={toMonitor}>
                            <MonitorIcon />
                            <span>{t('admin.quick_access.monitoring')}</span>
                        </button>
                        <button className={commonStyles.quickLink} onClick={toSessions}>
                            <ControlIcon />
                            <span>{t('admin.quick_access.management')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;