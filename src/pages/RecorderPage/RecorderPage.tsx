// import { useState } from 'react';
// import commonStyles from '../commonStyles.module.css';
// import { CogIcon } from '../../icons/CogIcon';
// import { CheckCircleIcon } from '../../icons/CheckIcon';
// import MusicIcon from '../../icons/MusicIcon';
// import FolderIcon from '../../icons/FolderIcon';
// import NotCheckIcon from '../../icons/NotCheckIcon';
// import Header from '../../components/Header/Header';


// const RecorderPage = () => {
//     const [isRecording, setIsRecording] = useState(false);
//     const [sampleRate, setSampleRate] = useState(16000);
//     const [channels, setChannels] = useState(1);
//     const [chunkSize, setChunkSize] = useState(1024);

//     const handleStartRecording = () => {
//         setIsRecording(true);
//         // Логика начала записи
//     };

//     const handleStopRecording = () => {
//         setIsRecording(false);
//         // Логика остановки записи
//     };

//     return (
//         <div className={commonStyles.appContainer}>
//             {/* Боковая панель (меню) */}
//             <div className={commonStyles.sidePanel}>
//                 <div className={commonStyles.infoCard}>
//                     <h2 className={commonStyles.subHeader}>
//                         <CogIcon />
//                         Настройки
//                     </h2>

//                     <div className={commonStyles.subHeader}>
//                         Сервер
//                     </div>
//                     <div className={commonStyles.statusItem}>
//                         <span>Адрес:</span>
//                         <span>51.250.115.73:8000</span>
//                     </div>
//                     <div className={commonStyles.statusItem}>
//                         <span>Статус:</span>
//                         <span className={commonStyles.statusActive}>
//                             <CheckCircleIcon />
//                             Сервер доступен
//                         </span>
//                     </div>

//                     <div className={commonStyles.statusItem}>
//                         <span>MongoDB:</span>
//                         <span className={commonStyles.statusActive}>
//                             <CheckCircleIcon />
//                         </span>
//                     </div>

//                     <div className={commonStyles.statusItem}>
//                         <span>API ключи:</span>
//                         <span className={commonStyles.statusActive}>
//                             <CheckCircleIcon />
//                         </span>
//                     </div>

//                     <div className={commonStyles.statusItem}>
//                         <span>Активные сессии:</span>
//                         <span>0</span>
//                     </div>

//                     <div className={commonStyles.statusItem}>
//                         <span>WebSocket:</span>
//                         <span>0</span>
//                     </div>
//                 </div>

//                 <div className={commonStyles.infoCard}>
//                     <h2 className={commonStyles.subHeader}>
//                         <FolderIcon />
//                         Текущая сессия
//                     </h2>
//                     <div className={commonStyles.statusItem}>
//                         <span>Статус:</span>
//                         <span className={isRecording ? commonStyles.statusActive : commonStyles.statusInactive}>
//                             {isRecording ? (
//                                 <>
//                                     <CheckCircleIcon /> Идет запись
//                                 </>
//                             ) : (
//                                 <>
//                                     <NotCheckIcon /> Нет активной записи
//                                 </>
//                             )}
//                         </span>
//                     </div>
//                     <div className={commonStyles.noteText}>
//                         ID появится после начала записи
//                     </div>
//                 </div>

//                 <div className={commonStyles.infoCard}>
//                     <h2 className={commonStyles.subHeader}>
//                         <MusicIcon />
//                         Настройки аудио</h2>

//                     <div className={commonStyles.filterControl}>
//                         <label className={commonStyles.filterLabel}>Частота дискретизации</label>
//                         <select
//                             className={commonStyles.filterSelect}
//                             value={sampleRate}
//                             onChange={(e) => setSampleRate(Number(e.target.value))}
//                         >
//                             <option value="8000">8000</option>
//                             <option value="16000">16000</option>
//                             <option value="44100">44100</option>
//                         </select>
//                     </div>

//                     <div className={commonStyles.filterControl}>
//                         <label className={commonStyles.filterLabel}>Количество каналов</label>
//                         <select
//                             className={commonStyles.filterSelect}
//                             value={channels}
//                             onChange={(e) => setChannels(Number(e.target.value))}
//                         >
//                             <option value="1">1 (моно)</option>
//                             <option value="2">2 (стерео)</option>
//                         </select>
//                     </div>

//                     <div className={commonStyles.filterControl}>
//                         <label className={commonStyles.filterLabel}>Размер чанка</label>
//                         <select
//                             className={commonStyles.filterSelect}
//                             value={chunkSize}
//                             onChange={(e) => setChunkSize(Number(e.target.value))}
//                         >
//                             <option value="512">512</option>
//                             <option value="1024">1024</option>
//                             <option value="2048">2048</option>
//                         </select>
//                     </div>
//                 </div>

//                 <div className={commonStyles.infoCard}>
//                     <h2 className={commonStyles.subHeader}>Диагностика</h2>
//                     <div className={commonStyles.noteText}>
//                         Для работы WebSocket на HTTPS сайтах нужен WSS протокол. Рекомендуется открыть сайт по HTTP для тестирования.
//                     </div>
//                 </div>
//             </div>

//             {/* Основное содержимое */}
//             <div className={commonStyles.mainContent}>
//                 <Header />
//                 <h1 className={commonStyles.sectionHeader}>Запись аудио</h1>

//                 <div className={commonStyles.infoCard}>
//                     <div className={commonStyles.buttonGroup}>
//                         <button
//                             onClick={handleStartRecording}
//                             disabled={isRecording}
//                             className={`${commonStyles.primaryButton} ${isRecording ? commonStyles.disabledButton : ''}`}
//                         >
//                             Начать запись
//                         </button>
//                         <button
//                             onClick={handleStopRecording}
//                             disabled={!isRecording}
//                             className={`${commonStyles.secondaryButton} ${!isRecording ? commonStyles.disabledButton : ''}`}
//                         >
//                             Остановить запись
//                         </button>
//                     </div>

//                     <div className={commonStyles.noteText}>
//                         Используется AudioContext для лучшего качества записи
//                     </div>
//                 </div>

//                 <div className={commonStyles.infoCard}>
//                     <h2 className={commonStyles.subHeader}>Результаты обработки</h2>
//                     {isRecording ? (
//                         <div className={commonStyles.statusItem}>
//                             <span>18:55:31:</span>
//                             <span>Улучшенная направленная завершена - используется AudioContext + PCM16</span>
//                         </div>
//                     ) : (
//                         <div className={commonStyles.noteText}>
//                             Начните запись для просмотра результатов
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div >
//     );
// };

// export default RecorderPage;


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import commonStyles from '../commonStyles.module.css';
import { CogIcon } from '../../icons/CogIcon';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import MusicIcon from '../../icons/MusicIcon';
import FolderIcon from '../../icons/FolderIcon';
import NotCheckIcon from '../../icons/NotCheckIcon';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';

type LectureData = {
    id: string;
    title: string;
    lecturer: string;
    startTime: string;
    duration: string;
    location: string;
    createdAt: string;
};

type LectureStatus = 'not_started' | 'in_progress' | 'paused' | 'ended';

const RecorderPage = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [sampleRate, setSampleRate] = useState<number>(16000);
    const [channels, setChannels] = useState<number>(1);
    const [chunkSize, setChunkSize] = useState<number>(1024);
    const [showLectureForm, setShowLectureForm] = useState<boolean>(false);
    const [lectureData, setLectureData] = useState<Omit<LectureData, 'id' | 'createdAt'>>({
        title: '',
        lecturer: '',
        startTime: '',
        duration: '',
        location: ''
    });
    const [currentLecture, setCurrentLecture] = useState<LectureData | null>(null);
    const [lectureStatus, setLectureStatus] = useState<LectureStatus>('not_started');
    const navigate = useNavigate();

    const handleStartRecording = () => {
        setIsRecording(true);
        // Логика начала записи
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        // Логика остановки записи
    };

    const handleNewLectureClick = () => {
        setShowLectureForm(true);
    };

    const handleLectureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLectureData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateLecture = (e: React.FormEvent) => {
        e.preventDefault();
        const lectureId = `lecture-${Date.now()}`;

        const newLecture: LectureData = {
            ...lectureData,
            id: lectureId,
            createdAt: new Date().toISOString()
        };

        setCurrentLecture(newLecture);
        setShowLectureForm(false);
        setLectureStatus('not_started');
        // Здесь можно добавить отправку данных на сервер
    };

    const handleStartLecture = () => {
        setLectureStatus('in_progress');
        // Дополнительная логика для начала лекции
    };

    const handlePauseLecture = () => {
        setLectureStatus('paused');
        // Дополнительная логика для паузы лекции
    };

    const handleEndLecture = () => {
        setLectureStatus('ended');
        // Дополнительная логика для завершения лекции
        // Можно добавить навигацию в архив или сообщение о завершении
    };

    return (
        <div className={commonStyles.appContainer}>
            {/* Боковая панель (меню) */}
            <div className={commonStyles.sidePanel}>
                {/* <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <CogIcon />
                        Настройки
                    </h2>

                    <div className={commonStyles.subHeader}>Сервер</div>
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
                        <span>{currentLecture ? 1 : 0}</span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>WebSocket:</span>
                        <span>0</span>
                    </div>
                </div> */}

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <FolderIcon />
                        {currentLecture ? 'Текущая лекция' : 'Текущая сессия'}
                    </h2>
                    {currentLecture ? (
                        <>
                            <div className={commonStyles.statusItem}>
                                <span>Название:</span>
                                <span>{currentLecture.title}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>Лектор:</span>
                                <span>{currentLecture.lecturer}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>Статус:</span>
                                <span className={
                                    lectureStatus === 'in_progress' ? commonStyles.statusActive :
                                        lectureStatus === 'paused' ? commonStyles.statusWarning :
                                            lectureStatus === 'ended' ? commonStyles.statusInactive :
                                                commonStyles.statusNeutral
                                }>
                                    {lectureStatus === 'in_progress' ? 'В процессе' :
                                        lectureStatus === 'paused' ? 'Приостановлена' :
                                            lectureStatus === 'ended' ? 'Завершена' : 'Готова к началу'}
                                </span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>ID:</span>
                                <span>{currentLecture.id}</span>
                            </div>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <MusicIcon />
                        Настройки аудио
                    </h2>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Частота дискретизации</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={sampleRate}
                            onChange={(e) => setSampleRate(Number(e.target.value))}
                        >
                            <option value="8000">8000</option>
                            <option value="16000">16000</option>
                            <option value="44100">44100</option>
                        </select>
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Количество каналов</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={channels}
                            onChange={(e) => setChannels(Number(e.target.value))}
                        >
                            <option value="1">1 (моно)</option>
                            <option value="2">2 (стерео)</option>
                        </select>
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Размер чанка</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={chunkSize}
                            onChange={(e) => setChunkSize(Number(e.target.value))}
                        >
                            <option value="512">512</option>
                            <option value="1024">1024</option>
                            <option value="2048">2048</option>
                        </select>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>Диагностика</h2>
                    <div className={commonStyles.noteText}>
                        Для работы WebSocket на HTTPS сайтах нужен WSS протокол. Рекомендуется открыть сайт по HTTP для тестирования.
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <Breadcrumbs
                    items={[
                        { label: 'Главная', path: '/lector' },
                        { label: 'Запись лекции', path: '/recorder' }
                    ]}
                />
                <h1 className={commonStyles.sectionHeader}>
                    {currentLecture ? `Лекция: ${currentLecture.title}` : 'Запись аудио'}
                </h1>

                {!currentLecture && !showLectureForm && (
                    <div className={commonStyles.infoCard}>
                        <div className={commonStyles.buttonGroup}>
                            <button
                                onClick={handleNewLectureClick}
                                className={commonStyles.primaryButton}
                            >
                                Запустить новую лекцию
                            </button>
                            <button
                                onClick={handleStartRecording}
                                disabled={isRecording}
                                className={`${commonStyles.primaryButton} ${!isRecording ? commonStyles.disabledButton : ''}`}
                            >
                                Начать запись
                            </button>
                            <button
                                onClick={handleStopRecording}
                                disabled={!isRecording}
                                className={`${commonStyles.secondaryButton} ${!isRecording ? commonStyles.disabledButton : ''}`}
                            >
                                Остановить запись
                            </button>
                        </div>

                        <div className={commonStyles.noteText}>
                            Используется AudioContext для лучшего качества записи
                        </div>
                    </div>
                )}

                {showLectureForm && (
                    <div className={commonStyles.infoCard}>
                        <h2 className={commonStyles.subHeader}>Создание новой лекции</h2>
                        <form onSubmit={handleCreateLecture}>
                            <div className={commonStyles.filterControl}>
                                <label className={commonStyles.filterLabel}>Название лекции</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={lectureData.title}
                                    onChange={handleLectureInputChange}
                                    className={commonStyles.filterSelect}
                                    required
                                />
                            </div>

                            <div className={commonStyles.filterControl}>
                                <label className={commonStyles.filterLabel}>Имя лектора</label>
                                <input
                                    type="text"
                                    name="lecturer"
                                    value={lectureData.lecturer}
                                    onChange={handleLectureInputChange}
                                    className={commonStyles.filterSelect}
                                    required
                                />
                            </div>

                            <div className={commonStyles.filterControl}>
                                <label className={commonStyles.filterLabel}>Время начала лекции</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={lectureData.startTime}
                                    onChange={handleLectureInputChange}
                                    className={commonStyles.filterSelect}
                                    required
                                />
                            </div>

                            <div className={commonStyles.filterControl}>
                                <label className={commonStyles.filterLabel}>Продолжительность (мин)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={lectureData.duration}
                                    onChange={handleLectureInputChange}
                                    className={commonStyles.filterSelect}
                                    required
                                />
                            </div>

                            <div className={commonStyles.filterControl}>
                                <label className={commonStyles.filterLabel}>Место проведения</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={lectureData.location}
                                    onChange={handleLectureInputChange}
                                    className={commonStyles.filterSelect}
                                    required
                                />
                            </div>

                            <div className={commonStyles.buttonGroup}>
                                <button
                                    type="submit"
                                    className={commonStyles.primaryButton}
                                >
                                    Создать новую лекцию
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowLectureForm(false)}
                                    className={commonStyles.secondaryButton}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {currentLecture && (
                    <div className={commonStyles.infoCard}>
                        <h2 className={commonStyles.subHeader}>Управление лекцией</h2>
                        <div className={commonStyles.buttonGroup}>
                            <button
                                onClick={handleStartLecture}
                                disabled={lectureStatus !== 'not_started' && lectureStatus !== 'paused'}
                                className={`${commonStyles.primaryButton} ${(lectureStatus !== 'not_started' && lectureStatus !== 'paused') ? commonStyles.disabledButton : ''
                                    }`}
                            >
                                Начать лекцию
                            </button>
                            <button
                                onClick={handlePauseLecture}
                                disabled={lectureStatus !== 'in_progress'}
                                className={`${commonStyles.refreshButton} ${lectureStatus !== 'in_progress' ? commonStyles.disabledButton : ''
                                    }`}
                            >
                                Приостановить лекцию
                            </button>
                            <button
                                onClick={handleEndLecture}
                                disabled={lectureStatus === 'ended'}
                                className={`${commonStyles.secondaryButton} ${lectureStatus === 'ended' ? commonStyles.disabledButton : ''
                                    }`}
                            >
                                Закончить лекцию
                            </button>
                        </div>

                        <div className={commonStyles.statusItem}>
                            <span>Статус лекции:</span>
                            <span className={
                                lectureStatus === 'in_progress' ? commonStyles.statusActive :
                                    lectureStatus === 'paused' ? commonStyles.statusWarning :
                                        lectureStatus === 'ended' ? commonStyles.statusInactive :
                                            commonStyles.statusNeutral
                            }>
                                {lectureStatus === 'in_progress' ? 'Лекция идет' :
                                    lectureStatus === 'paused' ? 'Лекция приостановлена' :
                                        lectureStatus === 'ended' ? 'Лекция завершена' : 'Лекция не начата'}
                            </span>
                        </div>
                    </div>
                )}

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>Результаты обработки</h2>
                    {isRecording ? (
                        <div className={commonStyles.statusItem}>
                            <span>18:55:31:</span>
                            <span>Улучшенная направленная завершена - используется AudioContext + PCM16</span>
                        </div>
                    ) : (
                        <div className={commonStyles.noteText}>
                            {currentLecture ? 'Управление лекцией' : 'Начните запись для просмотра результатов'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecorderPage;