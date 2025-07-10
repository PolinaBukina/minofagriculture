import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import commonStyles from '../commonStyles.module.css';
import { MonitorIcon } from '../../icons/MonitorIcon';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';

type Lecture = {
    id: string;
    title: string;
    lecturer: string;
    startTime: string;
    participants: number;
    status: 'recording' | 'paused' | 'live';
};

const ActiveLecturesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userRole = getRoleFromStorage();

    const [activeLectures] = useState<Lecture[]>([
        {
            id: 'live-1',
            title: 'Введение в React',
            lecturer: 'Иванов И.А.',
            startTime: '2025-06-20 10:00:00',
            participants: 24,
            status: 'live'
        },
        {
            id: 'live-2',
            title: 'Продвинутый TypeScript',
            lecturer: 'Петров М.Р.',
            startTime: '2025-06-20 11:30:00',
            participants: 18,
            status: 'recording'
        }
    ]);

    const handleViewLecture = (id: string) => {
        navigate(`/active/lecture/${id}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return commonStyles.statusActive;
            case 'recording': return commonStyles.statusWarning;
            case 'paused': return commonStyles.statusInactive;
            default: return '';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'live': return t('lecture.status.live');
            case 'recording': return t('lecture.status.recording');
            case 'paused': return t('lecture.status.paused');
            default: return status;
        }
    };

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
                <h1 className={commonStyles.sectionHeader}>
                    {t('active_lectures.title')}
                </h1>
                <p className={commonStyles.subHeader}>
                    {t('active_lectures.subtitle')}
                </p>

                <div className={commonStyles.infoCard}>
                    {activeLectures.length === 0 ? (
                        <div className={commonStyles.noteText}>
                            {t('active_lectures.empty')}
                        </div>
                    ) : (
                        activeLectures.map(lecture => (
                            <div
                                key={lecture.id}
                                className={commonStyles.listItem}
                                onClick={() => handleViewLecture(lecture.id)}
                                role="button"
                                tabIndex={0}
                                aria-label={t('lecture.view_aria', { title: lecture.title })}
                            >
                                <h3>{lecture.title}</h3>
                                <div className={commonStyles.statusItem}>
                                    <span>{t('lecture.lecturer')}:</span>
                                    <span>{lecture.lecturer}</span>
                                </div>
                                <div className={commonStyles.statusItem}>
                                    <span>{t('lecture.start_time')}:</span>
                                    <span>{lecture.startTime}</span>
                                </div>
                                <div className={commonStyles.statusItem}>
                                    <span>{t('lecture.participants')}:</span>
                                    <span>
                                        {t('lecture.participants_count', { count: lecture.participants })}
                                    </span>
                                </div>
                                <div className={commonStyles.statusItem}>
                                    <span>{t('lecture.status.label')}:</span>
                                    <span className={`${getStatusColor(lecture.status)}`}>
                                        {getStatusText(lecture.status)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveLecturesPage;