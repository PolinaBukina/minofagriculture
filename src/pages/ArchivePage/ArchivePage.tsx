
import { useState, useEffect } from 'react';
import SearchIcon from '../../icons/SearchIcon';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';

type Lecture = {
    id: string;
    title: string;
    start: string;
    end: string;
    duration: string;
    lecturer?: string;
    location?: string;
};

type Stats = {
    found: number;
    total: number;
    totalTime: string;
    today: number;
    last: string;
};

const ArchivePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fromPath = location.state?.from || '/';
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [recordsToShow, setRecordsToShow] = useState<number>(5);
    const [timePeriod, setTimePeriod] = useState<string>('all');
    const [durationFilter, setDurationFilter] = useState<string>('any');
    const [lectures, setLectures] = useState<Lecture[]>([
        {
            id: '1',
            title: 'Лекция 1750335680648...',
            start: '2025-06-19 15:40:06',
            end: '2025-06-19 17:18:44',
            duration: '1ч 39м'
        }
    ]);
    const [stats, setStats] = useState<Stats>({
        found: 1,
        total: 1,
        totalTime: '1ч 39м',
        today: 1,
        last: '15:40:06'
    });

    // Фильтрация лекций по параметрам
    const filteredLectures = lectures.filter(lecture => {
        // Фильтр по поисковому запросу
        const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lecture.lecturer && lecture.lecturer.toLowerCase().includes(searchQuery.toLowerCase()));

        // Фильтр по периоду времени
        const now = new Date();
        const lectureDate = new Date(lecture.start);
        let matchesTimePeriod = true;

        if (timePeriod === 'today') {
            const today = new Date().toISOString().split('T')[0];
            matchesTimePeriod = lecture.start.startsWith(today);
        } else if (timePeriod === 'week') {
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            matchesTimePeriod = lectureDate >= weekAgo;
        } else if (timePeriod === 'month') {
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            matchesTimePeriod = lectureDate >= monthAgo;
        }

        // Фильтр по длительности
        let matchesDuration = true;
        if (durationFilter !== 'any') {
            const durationMinutes = lecture.duration.includes('ч') ?
                parseInt(lecture.duration.split('ч')[0]) * 60 :
                parseInt(lecture.duration.split('м')[0]);

            if (durationFilter === 'short') {
                matchesDuration = durationMinutes <= 10;
            } else if (durationFilter === 'medium') {
                matchesDuration = durationMinutes > 10 && durationMinutes <= 30;
            } else if (durationFilter === 'long') {
                matchesDuration = durationMinutes > 30;
            }
        }

        return matchesSearch && matchesTimePeriod && matchesDuration;
    });

    return (
        <div className={commonStyles.appContainer}>
            {/* Боковая панель (меню) */}
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}><SearchIcon /> Фильтры</h2>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Период</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                        >
                            <option value="all">Все время</option>
                            <option value="today">Сегодня</option>
                            <option value="week">Неделя</option>
                            <option value="month">Месяц</option>
                        </select>
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Длительность</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={durationFilter}
                            onChange={(e) => setDurationFilter(e.target.value)}
                        >
                            <option value="any">Любая</option>
                            <option value="short">До 10 мин</option>
                            <option value="medium">10-30 мин</option>
                            <option value="long">30+ мин</option>
                        </select>
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Поиск в тексте</label>
                        <input
                            type="text"
                            className={commonStyles.filterSelect}
                            placeholder="Введите ключевые слова..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Показать записей</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={recordsToShow}
                            onChange={(e) => setRecordsToShow(Number(e.target.value))}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <Breadcrumbs
                    items={[
                        { label: 'Главная', path: fromPath },
                        { label: 'Архив лекций', path: '' }
                    ]}
                />
                <h1 className={commonStyles.sectionHeader}>Архив лекций</h1>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>Архив лекций</h2>

                    {filteredLectures.slice(0, recordsToShow).map(lecture => (
                        <div key={lecture.id} className={commonStyles.listItem}>
                            <h3>{lecture.title}</h3>
                            <div className={commonStyles.statusItem}>
                                <span>Начало:</span>
                                <span>{lecture.start}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>Окончание:</span>
                                <span>{lecture.end}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>Длительность:</span>
                                <span>{lecture.duration}</span>
                            </div>

                            <div className={commonStyles.buttonGroup} style={{ marginTop: '10px' }}>
                                <button className={commonStyles.primaryButton} onClick={() => navigate(`/archive/lecture/${lecture.id}`)}>
                                    Просмотреть
                                </button>
                                <button className={commonStyles.secondaryButton}>
                                    Аналитика
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