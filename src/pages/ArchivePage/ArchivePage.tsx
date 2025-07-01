// import { useState, useEffect } from 'react';
// import SearchIcon from '../../icons/SearchIcon';
// import commonStyles from '../commonStyles.module.css';
// import Header from '../../components/Header/Header';
// import { useNavigate, Link, useLocation } from 'react-router-dom';
// import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';

// type Lecture = {
//     id: string;
//     title: string;
//     start: string;
//     end: string;
//     duration: string;
//     lecturer?: string;
//     location?: string;
// };

// type Stats = {
//     found: number;
//     total: number;
//     totalTime: string;
//     today: number;
//     last: string;
// };

// const ArchivePage = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const fromPath = location.state?.from || '/';
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [recordsToShow, setRecordsToShow] = useState<number>(5);
//     const [dateFilter, setDateFilter] = useState<string>('');
//     const [lecturerFilter, setLecturerFilter] = useState<string>('all');
//     const [lectures, setLectures] = useState<Lecture[]>([
//         {
//             id: '1',
//             title: 'Лекция 1750335680648...',
//             start: '2025-06-19 15:40:06',
//             end: '2025-06-19 17:18:44',
//             duration: '1ч 39м',
//             lecturer: 'Иванов И.И.'
//         },
//         {
//             id: '2',
//             title: 'Математический анализ',
//             start: '2025-06-20 10:00:00',
//             end: '2025-06-20 11:30:00',
//             duration: '1ч 30м',
//             lecturer: 'Петров П.П.'
//         }
//     ]);
//     const [stats, setStats] = useState<Stats>({
//         found: 2,
//         total: 2,
//         totalTime: '3ч 09м',
//         today: 1,
//         last: '15:40:06'
//     });

//     const uniqueLecturers = Array.from(new Set(lectures.map(lecture => lecture.lecturer).filter(Boolean)));

//     const filteredLectures = lectures.filter(lecture => {
//         const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase());

//         let matchesDate = true;
//         if (dateFilter) {
//             const selectedDate = new Date(dateFilter).toISOString().split('T')[0];
//             const lectureDate = lecture.start.split(' ')[0];
//             matchesDate = lectureDate === selectedDate;
//         }

//         const matchesLecturer = lecturerFilter === 'all' || lecture.lecturer === lecturerFilter;

//         return matchesSearch && matchesDate && matchesLecturer;
//     });

//     return (
//         <div className={commonStyles.appContainer}>
//             {/* Боковая панель (меню) */}
//             <div className={commonStyles.sidePanel}>
//                 <div className={commonStyles.infoCard}>
//                     <h2 className={commonStyles.subHeader}><SearchIcon /> Фильтры</h2>

//                     <div className={commonStyles.filterControl}>
//                         <label className={commonStyles.filterLabel}>Дата лекции</label>
//                         <input
//                             type="date"
//                             className={commonStyles.filterSelect}
//                             value={dateFilter}
//                             onChange={(e) => setDateFilter(e.target.value)}
//                         />
//                     </div>

//                     <div className={commonStyles.filterControl}>
//                         <label className={commonStyles.filterLabel}>Лектор</label>
//                         <select
//                             className={commonStyles.filterSelect}
//                             value={lecturerFilter}
//                             onChange={(e) => setLecturerFilter(e.target.value)}
//                         >
//                             <option value="all">Все лекторы</option>
//                             {uniqueLecturers.map(lecturer => (
//                                 <option key={lecturer} value={lecturer}>{lecturer}</option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className={commonStyles.filterControl}>
//                         <label className={commonStyles.filterLabel}>Поиск по названию</label>
//                         <input
//                             type="text"
//                             className={commonStyles.filterSelect}
//                             placeholder="Введите название лекции..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Основное содержимое */}
//             <div className={commonStyles.mainContent}>
//                 <Header />
//                 <Breadcrumbs
//                     items={[
//                         { label: 'Главная', path: fromPath },
//                         { label: 'Архив лекций', path: '' }
//                     ]}
//                 />
//                 <h1 className={commonStyles.sectionHeader}>Архив лекций</h1>

//                 <div className={commonStyles.infoCard}>
//                     <h2 className={commonStyles.subHeader}>Архив лекций</h2>

//                     {filteredLectures.slice(0, recordsToShow).map(lecture => (
//                         <div key={lecture.id} className={commonStyles.listItem}>
//                             <h3>{lecture.title}</h3>
//                             {lecture.lecturer && (
//                                 <div className={commonStyles.statusItem}>
//                                     <span>Лектор:</span>
//                                     <span>{lecture.lecturer}</span>
//                                 </div>
//                             )}
//                             <div className={commonStyles.statusItem}>
//                                 <span>Начало:</span>
//                                 <span>{lecture.start}</span>
//                             </div>
//                             <div className={commonStyles.statusItem}>
//                                 <span>Окончание:</span>
//                                 <span>{lecture.end}</span>
//                             </div>
//                             <div className={commonStyles.statusItem}>
//                                 <span>Длительность:</span>
//                                 <span>{lecture.duration}</span>
//                             </div>

//                             <div className={commonStyles.buttonGroup} style={{ marginTop: '10px' }}>
//                                 <button className={commonStyles.primaryButton} onClick={() => navigate(`/archive/lecture/${lecture.id}`)}>
//                                     Просмотреть
//                                 </button>
//                                 <button className={commonStyles.secondaryButton}>
//                                     Аналитика
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ArchivePage;

import { useState } from 'react';
import SearchIcon from '../../icons/SearchIcon';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';

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
    const userRole = getRoleFromStorage();

    const navigate = useNavigate();
    const location = useLocation();
    const fromPath = location.state?.from || '/';
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [recordsToShow, setRecordsToShow] = useState<number>(5);
    const [dateFilter, setDateFilter] = useState<string>('');
    const [lecturerFilter, setLecturerFilter] = useState<string>('all');
    const [lectures, setLectures] = useState<Lecture[]>([
        {
            id: '1',
            title: 'Лекция 1750335680648...',
            start: '2025-06-19 15:40:06',
            end: '2025-06-19 17:18:44',
            duration: '1ч 39м',
            lecturer: 'Иванов И.И.'
        },
        {
            id: '2',
            title: 'Математический анализ',
            start: '2025-06-20 10:00:00',
            end: '2025-06-20 11:30:00',
            duration: '1ч 30м',
            lecturer: 'Петров П.П.'
        }
    ]);
    const [stats, setStats] = useState<Stats>({
        found: 2,
        total: 2,
        totalTime: '3ч 09м',
        today: 1,
        last: '15:40:06'
    });

    const uniqueLecturers = Array.from(new Set(lectures.map(lecture => lecture.lecturer).filter(Boolean)));

    const filteredLectures = lectures.filter(lecture => {
        const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesDate = true;
        if (dateFilter) {
            const selectedDate = new Date(dateFilter).toISOString().split('T')[0];
            const lectureDate = lecture.start.split(' ')[0];
            matchesDate = lectureDate === selectedDate;
        }

        const matchesLecturer = lecturerFilter === 'all' || lecture.lecturer === lecturerFilter;

        return matchesSearch && matchesDate && matchesLecturer;
    });

    return (
        <div className={commonStyles.appContainer}>
            {/* Боковая панель (меню) */}
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}><SearchIcon /> Фильтры</h2>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Дата лекции</label>
                        <input
                            type="date"
                            className={commonStyles.filterSelect}
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Лектор</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={lecturerFilter}
                            onChange={(e) => setLecturerFilter(e.target.value)}
                        >
                            <option value="all">Все лекторы</option>
                            {uniqueLecturers.map(lecturer => (
                                <option key={lecturer} value={lecturer}>{lecturer}</option>
                            ))}
                        </select>
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Поиск по названию</label>
                        <input
                            type="text"
                            className={commonStyles.filterSelect}
                            placeholder="Введите название лекции..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <Breadcrumbs
                    items={[
                        {
                            label: getHomeLabel(userRole),
                            path: getHomePath(userRole)
                        },
                        {
                            label: 'Архив лекций',
                            path: ''
                        }
                    ]}
                />
                <h1 className={commonStyles.sectionHeader}>Архив лекций</h1>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>Архив лекций</h2>

                    {filteredLectures.slice(0, recordsToShow).map(lecture => (
                        <div
                            key={lecture.id}
                            className={commonStyles.listItem}
                            // style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                                if (!(e.target as HTMLElement).closest(`.${commonStyles.secondaryButton}`)) {
                                    navigate(`/archive/lecture/${lecture.id}`);
                                }
                            }}
                        >
                            <h3>{lecture.title}</h3>
                            {lecture.lecturer && (
                                <div className={commonStyles.statusItem}>
                                    <span>Лектор:</span>
                                    <span>{lecture.lecturer}</span>
                                </div>
                            )}
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
                                <button
                                    className={commonStyles.secondaryButton}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Останавливаем всплытие события
                                        // Здесь логика для кнопки "Аналитика"
                                    }}
                                >
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