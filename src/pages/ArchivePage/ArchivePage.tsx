import { useState } from 'react';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import SearchIcon from '../../icons/SearchIcon';
import { CogIcon } from '../../icons/CogIcon';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';

const ArchivePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [recordsToShow, setRecordsToShow] = useState(5);
    const [timePeriod, setTimePeriod] = useState('all');
    const [durationFilter, setDurationFilter] = useState('any');

    const lectures = [
        {
            id: '1',
            title: 'Лекция 1750335680648...',
            start: '2025-06-19 15:40:06',
            end: '2025-06-19 17:18:44',
            duration: '1ч 39м'
        },
        {
            id: '2',
            title: 'Лекция 175033568398...',
            start: '2025-06-19 15:21:24',
            end: '2025-06-19 15:22:26',
            duration: '1 мин'
        }
    ];

    const stats = {
        found: 10,
        total: 10,
        totalTime: '5.0ч',
        today: 10,
        last: '15:40:06'
    };

    return (
        <div className={commonStyles.appContainer}>
            {/* Боковая панель (меню) */}
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}><CogIcon /> Настройки</h2>

                    <div className={commonStyles.subHeader}> Сервер</div>
                    <div className={commonStyles.statusItem}>
                        <span>Адрес:</span>
                        <span>51.250.115.73:8000</span>
                    </div>
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
                <h1 className={commonStyles.sectionHeader}>Архив лекций</h1>
                <p className={commonStyles.subHeader}>Просмотр записей завершенных лекций</p>

                <div className={commonStyles.infoCard}>
                    <div className={commonStyles.statsGrid}>
                        <div className={commonStyles.statBox}>
                            <div className={commonStyles.statValue}>{stats.found}</div>
                            <div className={commonStyles.statLabel}>Найдено записей</div>
                        </div>
                        <div className={commonStyles.statBox}>
                            <div className={commonStyles.statValue}>{stats.total}</div>
                            <div className={commonStyles.statLabel}>Всего записей</div>
                        </div>
                        <div className={commonStyles.statBox}>
                            <div className={commonStyles.statValue}>{stats.totalTime}</div>
                            <div className={commonStyles.statLabel}>Общее время</div>
                        </div>
                        <div className={commonStyles.statBox}>
                            <div className={commonStyles.statValue}>{stats.today}</div>
                            <div className={commonStyles.statLabel}>Сегодня</div>
                        </div>
                        <div className={commonStyles.statBox}>
                            <div className={commonStyles.statValue}>{stats.last}</div>
                            <div className={commonStyles.statLabel}>Последняя</div>
                        </div>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>Архив лекций</h2>

                    {lectures.slice(0, recordsToShow).map(lecture => (
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
                                <button className={commonStyles.primaryButton}>
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