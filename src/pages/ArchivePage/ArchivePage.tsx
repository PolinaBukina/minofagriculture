import { useState, useMemo } from 'react';
import SearchIcon from '../../icons/SearchIcon';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
import { useTranslation } from 'react-i18next';

type Lecture = {
    id: string;
    title: string;
    start: string;
    end: string;
    duration: string;
    lecturer?: string;
    location?: string;
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

    // Моковые данные
    const [lectures] = useState<Lecture[]>([
        {
            id: '1',
            title: 'Лекция по математическому анализу',
            start: '2025-06-19 15:40:06',
            end: '2025-06-19 17:18:44',
            duration: '1ч 39м',
            lecturer: 'Иванов И.И.'
        },
        {
            id: '2',
            title: 'Лекция по физике',
            start: '2025-06-19 15:40:06',
            end: '2025-06-19 17:18:44',
            duration: '1ч 39м',
            lecturer: 'Петров И.И.'
        }
    ]);

    // Фильтрация лекций
    const filteredLectures = useMemo(() => {
        return lectures.filter(lecture => {
            const matchesDate = dateFilter
                ? lecture.start.split(' ')[0] === dateFilter
                : true;

            const matchesLecturer = lecturerFilter
                ? lecture.lecturer?.toLowerCase().includes(lecturerFilter.toLowerCase())
                : true;

            const matchesTitle = searchQuery
                ? lecture.title.toLowerCase().includes(searchQuery.toLowerCase())
                : true;

            const matchesKeywords = keywordFilter
                ? `${lecture.title} ${lecture.lecturer || ''}`
                    .toLowerCase()
                    .includes(keywordFilter.toLowerCase())
                : true;

            return matchesDate && matchesLecturer && matchesTitle && matchesKeywords;
        });
    }, [lectures, dateFilter, lecturerFilter, searchQuery, keywordFilter]);

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
                        {t('archive.filters.found', { count: filteredLectures.length })}
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

                    {filteredLectures.slice(0, recordsToShow).map(lecture => (
                        <div
                            key={lecture.id}
                            className={commonStyles.listItem}
                            onClick={(e) => {
                                if (!(e.target as HTMLElement).closest(`.${commonStyles.secondaryButton}`)) {
                                    navigate(`/archive/lecture/${lecture.id}`);
                                }
                            }}
                        >
                            <h3>{lecture.title}</h3>
                            {lecture.lecturer && (
                                <div className={commonStyles.statusItem}>
                                    <span>{t('archive.lecture.lecturer')}</span>
                                    <span>{lecture.lecturer}</span>
                                </div>
                            )}
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
                                <span>{lecture.duration}</span>
                            </div>

                            <div className={commonStyles.buttonGroup} style={{ marginTop: '10px' }}>
                                <button
                                    className={commonStyles.secondaryButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Логика для кнопки "Аналитика"
                                    }}
                                >
                                    {t('archive.lecture.analytics')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArchivePage;