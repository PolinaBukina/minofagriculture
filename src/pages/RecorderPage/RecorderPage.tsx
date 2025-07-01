// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import commonStyles from '../commonStyles.module.css';
// import Header from '../../components/Header/Header';
// import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
// import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';

// type LectureData = {
//     id: string;
//     title: string;
//     lecturer: string;
//     startTime: string;
//     duration: string;
//     location: string;
//     createdAt: string;
// };

// const RecorderPage = () => {
//     const [isRecording, setIsRecording] = useState(false);
//     const [isPaused, setIsPaused] = useState(false);
//     const [lectureData, setLectureData] = useState({
//         title: '',
//         lecturer: '',
//         startTime: '',
//         duration: '',
//         location: ''
//     });
//     const [currentLecture, setCurrentLecture] = useState<LectureData | null>(null);
//     const [originalText, setOriginalText] = useState('');
//     const [translatedText, setTranslatedText] = useState('');
//     const [language, setLanguage] = useState('en'); // 'en', 'fr', 'zh' и т.д.
//     const userRole = getRoleFromStorage();
//     const navigate = useNavigate();

//     const handleLectureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setLectureData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleStartLecture = (e: React.FormEvent) => {
//         e.preventDefault();

//         // Создаем и сразу начинаем новую лекцию
//         const newLecture: LectureData = {
//             ...lectureData,
//             id: `lecture-${Date.now()}`,
//             startTime: lectureData.startTime || new Date().toISOString(),
//             createdAt: new Date().toISOString()
//         };

//         setCurrentLecture(newLecture);
//         setIsRecording(true);
//         setIsPaused(false);

//         // Заглушка для демонстрации
//         setOriginalText('Это пример текста лекции. Здесь будет отображаться расшифровка речи лектора в реальном времени.');
//         setTranslatedText('This is an example lecture text. Here will be displayed the real-time translation of the lecturer\'s speech.');

//         console.log('Лекция начата:', newLecture);
//     };

//     const handleStopLecture = () => {
//         setIsRecording(false);
//         setIsPaused(false);
//         setCurrentLecture(null);
//         navigate('/archive');
//     };

//     const handleTogglePause = () => {
//         setIsPaused(prev => !prev);
//         console.log(`Лекция ${isPaused ? 'возобновлена' : 'приостановлена'}`);
//     };

//     return (
//         <div className={commonStyles.appContainer}>
//             <div className={commonStyles.mainContent}>
//                 <Header />
//                 <Breadcrumbs
//                     items={[
//                         { label: getHomeLabel(userRole), path: getHomePath(userRole) },
//                         { label: 'Запись лекции', path: '' }
//                     ]}
//                 />

//                 <h1 className={commonStyles.sectionHeader}>
//                     {currentLecture ? `Лекция: ${currentLecture.title}` : 'Новая лекция'}
//                 </h1>

//                 {!currentLecture ? (
//                     <div className={commonStyles.infoCard}>
//                         <h2 className={commonStyles.subHeader}>Параметры лекции</h2>
//                         <form onSubmit={handleStartLecture}>
// <div className={commonStyles.filterControl}>
//     <label>Название лекции</label>
//     <input
//         type="text"
//         name="title"
//         value={lectureData.title}
//         onChange={handleLectureInputChange}
//         className={commonStyles.filterSelect}
//         required
//     />
// </div>

// <div className={commonStyles.filterControl}>
//     <label>Имя лектора</label>
//     <input
//         type="text"
//         name="lecturer"
//         value={lectureData.lecturer}
//         onChange={handleLectureInputChange}
//         className={commonStyles.filterSelect}
//         required
//     />
// </div>

// <div className={commonStyles.filterControl}>
//     <label>Время начала</label>
//     <input
//         type="datetime-local"
//         name="startTime"
//         value={lectureData.startTime}
//         onChange={handleLectureInputChange}
//         className={commonStyles.filterSelect}
//     />
// </div>

// <div className={commonStyles.filterControl}>
//     <label>Продолжительность (мин)</label>
//     <input
//         type="number"
//         name="duration"
//         value={lectureData.duration}
//         onChange={handleLectureInputChange}
//         className={commonStyles.filterSelect}
//         required
//     />
// </div>

// <div className={commonStyles.filterControl}>
//     <label>Место проведения</label>
//     <input
//         type="text"
//         name="location"
//         value={lectureData.location}
//         onChange={handleLectureInputChange}
//         className={commonStyles.filterSelect}
//         required
//     />
// </div>

// <button
//     type="submit"
//     className={commonStyles.primaryButton}
//     disabled={!lectureData.title || !lectureData.lecturer || !lectureData.startTime || !lectureData.duration || !lectureData.location}
// >
//     Начать лекцию
// </button>
//                         </form>
//                     </div>
//                 ) : (
//                     <>
//                         <div className={commonStyles.infoCard}>
//                             <h2 className={commonStyles.subHeader}>
//                                 {isPaused ? 'Лекция приостановлена' : 'Идет запись лекции'}
//                             </h2>

// <div className={commonStyles.statusItem}>
//     <span>Название:</span>
//     <span>{currentLecture.title}</span>
// </div>
// <div className={commonStyles.statusItem}>
//     <span>Лектор:</span>
//     <span>{currentLecture.lecturer}</span>
// </div>
// <div className={commonStyles.statusItem}>
//     <span>Начало:</span>
//     <span>{new Date(currentLecture.startTime).toLocaleString()}</span>
// </div>
// <div className={commonStyles.statusItem}>
//     <span>Место:</span>
//     <span>{currentLecture.location}</span>
// </div>

// <div className={commonStyles.buttonGroup} style={{ marginTop: '20px' }}>
//     <button
//         onClick={handleTogglePause}
//         className={commonStyles.refreshButton}
//     >
//         {isPaused ? 'Продолжить лекцию' : 'Приостановить лекцию'}
//     </button>
//     <button
//         onClick={handleStopLecture}
//         className={commonStyles.secondaryButton}
//     >
//         Завершить лекцию
//     </button>
// </div>
//                         </div>

//                         <div className={commonStyles.infoCardLecture}>
// <div className={commonStyles.listItemLecture}>
//     <h2>Полный текст лекции</h2>
//     <div className={commonStyles.LectureFullText}>
//         {originalText || 'Текст лекции недоступен'}
//     </div>
// </div>

// <div className={commonStyles.listItemLecture}>
//     <h2>
//         {language === 'en' ? 'Полный перевод (английский)' :
//             language === 'fr' ? 'Полный перевод (французский)' :
//                 'Полный перевод (китайский)'}
//     </h2>
//     <div className={commonStyles.LectureFullText}>
//         {translatedText || 'Перевод недоступен'}
//     </div>
// </div>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default RecorderPage;


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';

type LectureData = {
    id: string;
    title: string;
    lecturer: string;
    startTime: string;
    duration: string;
    location: string;
    createdAt: string;
};

const RecorderPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [lectureData, setLectureData] = useState({
        title: '',
        lecturer: '',
        startTime: '',
        duration: '',
        location: ''
    });
    const [currentLecture, setCurrentLecture] = useState<LectureData | null>(null);
    const [originalText, setOriginalText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [language, setLanguage] = useState('en');
    const [showStopModal, setShowStopModal] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const userRole = getRoleFromStorage();
    const navigate = useNavigate();

    const handleLectureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLectureData(prev => ({ ...prev, [name]: value }));
    };

    const handleStartLecture = (e: React.FormEvent) => {
        e.preventDefault();

        const newLecture: LectureData = {
            ...lectureData,
            id: `lecture-${Date.now()}`,
            startTime: lectureData.startTime || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        setCurrentLecture(newLecture);
        setIsRecording(true);
        setIsPaused(false);
        setOriginalText('Это пример текста лекции. Здесь будет отображаться расшифровка речи лектора в реальном времени.');
        setTranslatedText('This is an example lecture text. Here will be displayed the real-time translation of the lecturer\'s speech.');
    };

    const confirmStopLecture = () => {
        setIsRecording(false);
        setIsPaused(false);
        setCurrentLecture(null);
        setShowStopModal(false);
        navigate('/archive');
    };

    const handleTogglePause = () => {
        if (isPaused) {
            setIsPaused(false);
            setShowPauseModal(false);
        } else {
            setShowPauseModal(true);
        }
    };

    const confirmPauseLecture = () => {
        setIsPaused(true);
        setShowPauseModal(false);
    };

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.mainContent}>
                <Header />
                <Breadcrumbs
                    items={[
                        { label: getHomeLabel(userRole), path: getHomePath(userRole) },
                        { label: 'Запись лекции', path: '' }
                    ]}
                />

                <h1 className={commonStyles.sectionHeader}>
                    {currentLecture ? `Лекция: ${currentLecture.title}` : 'Новая лекция'}
                </h1>

                {!currentLecture ? (
                    <div className={commonStyles.infoCard}>
                        <h2 className={commonStyles.subHeader}>Параметры лекции</h2>
                        <form onSubmit={handleStartLecture}>
                            {/* Форма ввода параметров лекции */}
                            <div className={commonStyles.filterControl}>
                                <label>Название лекции</label>
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
                                <label>Имя лектора</label>
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
                                <label>Время начала</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={lectureData.startTime}
                                    onChange={handleLectureInputChange}
                                    className={commonStyles.filterSelect}
                                />
                            </div>

                            <div className={commonStyles.filterControl}>
                                <label>Продолжительность (мин)</label>
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
                                <label>Место проведения</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={lectureData.location}
                                    onChange={handleLectureInputChange}
                                    className={commonStyles.filterSelect}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className={commonStyles.primaryButton}
                                disabled={!lectureData.title || !lectureData.lecturer || !lectureData.startTime || !lectureData.duration || !lectureData.location}
                            >
                                Начать лекцию
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className={commonStyles.infoCard}>
                            <h2 className={commonStyles.subHeader}>
                                {isPaused ? 'Лекция приостановлена' : 'Идет запись лекции'}
                            </h2>

                            {/* Информация о лекции */}
                            <div className={commonStyles.statusItem}>
                                <span>Название:</span>
                                <span>{currentLecture.title}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>Лектор:</span>
                                <span>{currentLecture.lecturer}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>Начало:</span>
                                <span>{new Date(currentLecture.startTime).toLocaleString()}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>Место:</span>
                                <span>{currentLecture.location}</span>
                            </div>

                            <div className={commonStyles.buttonGroup} style={{ marginTop: '20px' }}>
                                <button
                                    onClick={handleTogglePause}
                                    className={commonStyles.refreshButton}
                                >
                                    {isPaused ? 'Продолжить лекцию' : 'Приостановить лекцию'}
                                </button>
                                <button
                                    onClick={() => setShowStopModal(true)}
                                    className={commonStyles.secondaryButton}
                                >
                                    Завершить лекцию
                                </button>
                            </div>
                        </div>

                        <div className={commonStyles.infoCardLecture}>
                            {/* Блоки с текстом лекции и переводом */}
                            <div className={commonStyles.listItemLecture}>
                                <h2>Полный текст лекции</h2>
                                <div className={commonStyles.LectureFullText}>
                                    {originalText || 'Текст лекции недоступен'}
                                </div>
                            </div>

                            <div className={commonStyles.listItemLecture}>
                                <h2>
                                    {language === 'en' ? 'Полный перевод (английский)' :
                                        language === 'fr' ? 'Полный перевод (французский)' :
                                            'Полный перевод (китайский)'}
                                </h2>
                                <div className={commonStyles.LectureFullText}>
                                    {translatedText || 'Перевод недоступен'}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Модальное окно подтверждения остановки лекции */}
                {showStopModal && (
                    <div className={commonStyles.modalOverlay}>
                        <div className={commonStyles.modal}>
                            <h3>Подтверждение</h3>
                            <p>Вы уверены, что хотите завершить запись лекции?</p>
                            <div className={commonStyles.modalButtons}>
                                <button
                                    onClick={() => setShowStopModal(false)}
                                    className={commonStyles.cancelModalButton}
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={confirmStopLecture}
                                    className={commonStyles.okModalButton}
                                >
                                    Завершить
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модальное окно подтверждения приостановки лекции */}
                {showPauseModal && (
                    <div className={commonStyles.modalOverlay}>
                        <div className={commonStyles.modal}>
                            <h3>Подтверждение</h3>
                            <p>Вы уверены, что хотите приостановить запись лекции?</p>
                            <div className={commonStyles.modalButtons}>
                                <button
                                    onClick={() => setShowPauseModal(false)}
                                    className={commonStyles.cancelModalButton}
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={confirmPauseLecture}
                                    className={commonStyles.okModalButton}
                                >
                                    Приостановить
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecorderPage;