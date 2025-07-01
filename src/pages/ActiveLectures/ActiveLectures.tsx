// src/pages/ActiveLectures.tsx
import { useState } from 'react';
import commonStyles from '../commonStyles.module.css';
import { MonitorIcon } from '../../icons/MonitorIcon';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const userRole = getRoleFromStorage();
    const [activeLectures, setActiveLectures] = useState<Lecture[]>([
        {
            id: 'live-1',
            title: 'Введение в React',
            lecturer: 'Иванов И.И.',
            startTime: '2025-06-20 10:00:00',
            participants: 24,
            status: 'live'
        },
        {
            id: 'live-2',
            title: 'Продвинутый TypeScript',
            lecturer: 'Петров П.П.',
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
                            label: 'Активные лекции',
                            path: ''
                        }
                    ]}
                />
                <h1 className={commonStyles.sectionHeader}>Активные лекции</h1>
                <p className={commonStyles.subHeader}>Текущие трансляции</p>

                {/* <div className={commonStyles.infoCard}>
                    <div className={commonStyles.quickAccess}>
                        <h2 className={commonStyles.sectionTitle}>Быстрый доступ:</h2>
                        <div className={commonStyles.quickLinks}>
                            <button
                                className={commonStyles.quickLink}
                                onClick={() => navigate('/archive')}
                            >
                                <MonitorIcon />
                                <span>Архив лекций</span>
                            </button>
                            <button
                                className={`${commonStyles.quickLink} ${commonStyles.activeLink}`}
                            >
                                <MonitorIcon />
                                <span>Активные лекции</span>
                            </button>
                        </div>
                    </div>
                </div> */}

                <div className={commonStyles.infoCard}>
                    {/* <h2 className={commonStyles.subHeader}>Текущие трансляции</h2> */}

                    {activeLectures.length === 0 ? (
                        <div className={commonStyles.noteText}>Нет активных лекций</div>
                    ) : (
                        activeLectures.map(lecture => (
                            <div key={lecture.id} className={commonStyles.listItem}
                                onClick={() => handleViewLecture(lecture.id)}
                            >
                                <h3>{lecture.title}</h3>
                                <div className={commonStyles.statusItem}>
                                    <span>Лектор:</span>
                                    <span>{lecture.lecturer}</span>
                                </div>
                                <div className={commonStyles.statusItem}>
                                    <span>Начало:</span>
                                    <span>{lecture.startTime}</span>
                                </div>
                                <div className={commonStyles.statusItem}>
                                    <span>Участников:</span>
                                    <span>{lecture.participants}</span>
                                </div>
                                <div className={commonStyles.statusItem}>
                                    <span>Статус:</span>
                                    <span className={`${getStatusColor(lecture.status)}`}>
                                        {lecture.status === 'live' ? 'В прямом эфире' :
                                            lecture.status === 'recording' ? 'Идет запись' : 'Приостановлено'}
                                    </span>
                                </div>

                                {/* <div className={commonStyles.buttonGroup} style={{ marginTop: '10px' }}>
                                    <button
                                        className={commonStyles.primaryButton}
                                        onClick={() => handleViewLecture(lecture.id)}
                                    >
                                        Перейти к лекции
                                    </button>
                                </div> */}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveLecturesPage;