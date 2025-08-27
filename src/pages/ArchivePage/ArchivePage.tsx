import { useState, useMemo, useEffect } from 'react';
import SearchIcon from '../../icons/SearchIcon';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

type Lecture = {
    id: string;
    title: string;
    start: string;
    end: string;
    duration: string;
    lecturer: string; // Убедитесь, что это поле обязательное
    location: string;
    server_id: string;
    duration_minutes: number;
    status: string;
    originalStart: Date;
    originalEnd: Date | null;
};

type ApiSession = {
    lecturer_name: any;
    _id: string;
    session_id: string;
    start_time: string;
    end_time?: string;
    status: string;
    audio_config: {
        sample_rate: number;
        channels: number;
        format: string;
    };
    server_id: string;
    lecture_title: string;
    lecturer: string;
    location: string;
    duration_minutes: number;
};

const ArchivePage = () => {
    const { t } = useTranslation();
    const userRole = getRoleFromStorage();
    const navigate = useNavigate();

    // Состояния фильтров
    const [searchQuery, setSearchQuery] = useState('');
    const [recordsToShow, setRecordsToShow] = useState(5);
    const [dateFilter, setDateFilter] = useState('');
    const [lecturerFilter, setLecturerFilter] = useState('');
    const [keywordFilter, setKeywordFilter] = useState('');
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await axios.get('https://audio.minofagriculture.ru/sessions');
                const sessions: ApiSession[] = response.data.sessions;

                const transformedLectures = sessions.map(session => {
                    const startDate = new Date(session.start_time);
                    const endDate = session.end_time ? new Date(session.end_time) : null;

                    let duration = '';
                    if (endDate) {
                        const diffMs = endDate.getTime() - startDate.getTime();
                        const diffMins = Math.round(diffMs / 60000);
                        const hours = Math.floor(diffMins / 60);
                        const mins = diffMins % 60;
                        duration = `${hours}ч ${mins}м`;
                    } else if (session.duration_minutes > 0) {
                        // Use duration_minutes if available and no end time
                        const hours = Math.floor(session.duration_minutes / 60);
                        const mins = Math.round(session.duration_minutes % 60);
                        duration = `${hours}ч ${mins}м`;
                    }

                    return {
                        id: session.session_id,
                        title: session.lecture_title,
                        start: startDate.toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        end: endDate ? endDate.toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : t('archive.lecture.not_finished'),
                        duration,
                        lecturer: session.lecturer_name,
                        location: session.location,
                        server_id: session.server_id,
                        duration_minutes: session.duration_minutes,
                        status: session.status,
                        originalStart: startDate,
                        originalEnd: endDate
                    };
                });

                transformedLectures.sort((a, b) => b.originalStart.getTime() - a.originalStart.getTime());
                console.log('✅ Лекция успешно загружена:', transformedLectures);

                setLectures(transformedLectures);
                setIsLoading(false);
            } catch (err) {
                setError(t('archive.error_fetching'));
                setIsLoading(false);
                console.error('Error fetching sessions:', err);
            }
        };

        fetchSessions();

    }, [t]);

    const filteredLectures = useMemo(() => {
        return lectures.filter(lecture => {
            const matchesStatus = lecture.status === 'completed';

            const matchesDate = dateFilter
                ? lecture.originalStart.toISOString().split('T')[0] === dateFilter
                : true;

            const matchesLecturer = lecturerFilter
                ? (lecture.lecturer || '').toLowerCase().includes(lecturerFilter.toLowerCase())
                : true;

            const matchesTitle = searchQuery
                ? lecture.title.toLowerCase().includes(searchQuery.toLowerCase())
                : true;

            const matchesKeywords = keywordFilter
                ? `${lecture.title} ${lecture.lecturer || ''} ${lecture.location || ''}`
                    .toLowerCase()
                    .includes(keywordFilter.toLowerCase())
                : true;

            return matchesStatus && matchesDate && matchesLecturer && matchesTitle && matchesKeywords;
            // return matchesDate && matchesLecturer && matchesTitle && matchesKeywords;
        });
    }, [lectures, dateFilter, lecturerFilter, searchQuery, keywordFilter]);

    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <SearchIcon /> {t('archive.filters.title')}
                    </h2>

                    {/* Фильтр по дате */}
                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>
                            {t('archive.filters.date')}
                        </label>
                        <input
                            type="date"
                            className={commonStyles.filterSelect}
                            value={dateFilter}
                            max={formatDateForInput(new Date())}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>

                    {/* Поле ввода имени лектора */}
                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>
                            {t('archive.filters.lecturer')}
                        </label>
                        <input
                            type="text"
                            className={commonStyles.filterSelect}
                            placeholder={t('archive.filters.placeholder.lecturer')}
                            value={lecturerFilter}
                            onChange={(e) => setLecturerFilter(e.target.value)}
                        />
                    </div>

                    {/* Поиск по названию */}
                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>
                            {t('archive.filters.search')}
                        </label>
                        <input
                            type="text"
                            className={commonStyles.filterSelect}
                            placeholder={t('archive.filters.placeholder.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={commonStyles.filterStats}>
                        {isLoading ? t('archive.loading_lectures') :
                            error ? error :
                                t('archive.filters.found', { count: filteredLectures.length })}
                    </div>
                </div>
            </div>

            <div className={commonStyles.mainContent}>
                <Header />
                <Breadcrumbs
                    items={[
                        {
                            label: getHomeLabel(userRole),
                            path: getHomePath(userRole)
                        },
                        {
                            label: t('archive.breadcrumbs.archive'),
                            path: ''
                        }
                    ]}
                />
                <h1 className={commonStyles.sectionHeader}>
                    {t('archive.title')}
                </h1>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        {t('archive.title')}
                    </h2>

                    {isLoading ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '300px',
                            width: '100%',
                            gap: '20px'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                border: '6px solid rgba(0, 0, 0, 0.1)',
                                borderTop: '6px solid #34db85',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <p style={{
                                color: '#555',
                                fontSize: '1.2rem',
                                fontWeight: '500'
                            }}>{t('archive.loading_lectures')}</p>
                        </div>
                    ) : error ? (
                        <div className={commonStyles.errorState}>
                            <p>{error}</p>
                            <button
                                className={commonStyles.primaryButton}
                                onClick={() => window.location.reload()}
                            >
                                {t('archive.retry')}
                            </button>
                        </div>
                    ) : filteredLectures.length > 0 ? (
                        <>
                            {filteredLectures.slice(0, recordsToShow).map(lecture => (
                                <div
                                    key={lecture.id}
                                    className={commonStyles.listItem}
                                    onClick={() => navigate(`/archive/lecture/${lecture.id}`)}
                                >
                                    <h3>{lecture.title}</h3>
                                    <div className={commonStyles.statusItem}>
                                        <span>{t('archive.lecture.status')}</span>
                                        <span style={{
                                            color: lecture.status === 'completed' ? 'green' :
                                                lecture.status === 'active' ? 'orange' : 'gray'
                                        }}>
                                            {lecture.status === 'completed' ? t('archive.lecture.completed') :
                                                lecture.status === 'active' ? t('archive.lecture.active') :
                                                    t('archive.lecture.unknown')}
                                        </span>
                                    </div>
                                    <div className={commonStyles.statusItem}>
                                        <span>{t('archive.lecture.lecturer')}</span>
                                        <span>{lecture.lecturer}</span>
                                    </div>
                                    <div className={commonStyles.statusItem}>
                                        <span>{t('archive.lecture.location')}</span>
                                        <span>{lecture.location}</span>
                                    </div>
                                    <div className={commonStyles.statusItem}>
                                        <span>{t('archive.lecture.start')}</span>
                                        <span>{lecture.start}</span>
                                    </div>
                                    <div className={commonStyles.statusItem}>
                                        <span>{t('archive.lecture.end')}</span>
                                        <span>{lecture.end}</span>
                                    </div>
                                    <div className={commonStyles.statusItem}>
                                        <span>{t('archive.lecture.duration')}</span>
                                        <span>{lecture.duration || t('archive.lecture.not_available')}</span>
                                    </div>
                                </div>
                            ))}

                            {filteredLectures.length > recordsToShow && (
                                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                    <button
                                        className={commonStyles.primaryButton}
                                        onClick={() => setRecordsToShow(prev => prev + 5)}
                                    >
                                        {t('archive.show_more')}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={commonStyles.emptyState}>
                            <p>{t('archive.no_lectures_found')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArchivePage;