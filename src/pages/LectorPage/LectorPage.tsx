// import { useState } from 'react';
// import commonStyles from '../commonStyles.module.css';
// import MusicIcon from '../../icons/MusicIcon';
// import FolderIcon from '../../icons/FolderIcon';
// import { CheckCircleIcon } from '../../icons/CheckIcon';
// import SearchIcon from '../../icons/SearchIcon';
// import Header from '../../components/Header/Header';
// import { LectureIcon } from '../../icons/LectureIcon';
// import { useNavigate } from 'react-router-dom';
// import { MonitorIcon } from '../../icons/MonitorIcon';
// import MusicIcon100 from '../../icons/MusicIcon100';
// import { CogIcon } from '../../icons/CogIcon';

// const LectorPage = () => {
//     const [isListening, setIsListening] = useState(false);
//     const navigate = useNavigate();

//     const handleStartListening = () => {
//         setIsListening(true);
//     };

//     const handleStopListening = () => {
//         setIsListening(false);
//     };

//     const handleRefresh = () => {
//         // Логика обновления
//     };

//     return (
//         <div className={commonStyles.appContainer}>
//             {/* Основное содержимое */}
//             <div className={commonStyles.mainContent}>
//                 <Header />
//                 <h1 className={commonStyles.sectionHeader}>Лектор</h1>
//                 <div className={commonStyles.quickAccess}>
//                     <div className={commonStyles.description}>
//                         <p className={commonStyles.sectionParagraph}>
//                             Сервис по переведу лекций в режиме реального времени <br />
//                             Система обработает: <br />
//                             🗣️ Распознает русскую речь <br />
//                             ✏️ Уберет слова-паразиты <br />
//                             🌍 Переведет на английский <br />
//                         </p>
//                         <button className={commonStyles.quickLink1} onClick={() => navigate(`/active`)}>
//                             <CogIcon />
//                             <span>Инструкция по использованию</span>
//                         </button>
//                     </div>

//                     <div className={commonStyles.quickLinks}>
//                         <button className={commonStyles.quickLink} onClick={() => navigate(`/recorder`)}>
//                             <MusicIcon100 />
//                             <span>Записать лекцию</span>
//                         </button>
//                         <button className={commonStyles.quickLink} onClick={() => navigate(`/archive`)}>
//                             <LectureIcon />
//                             <span>Архив лекций</span>
//                         </button>
//                         <button className={commonStyles.quickLink} onClick={() => navigate(`/active`)}>
//                             <MonitorIcon />
//                             <span>Активные лекции</span>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LectorPage;



import { useState } from 'react';
import commonStyles from '../commonStyles.module.css';
import MusicIcon from '../../icons/MusicIcon';
import FolderIcon from '../../icons/FolderIcon';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import SearchIcon from '../../icons/SearchIcon';
import Header from '../../components/Header/Header';
import { LectureIcon } from '../../icons/LectureIcon';
import { useNavigate } from 'react-router-dom';
import { MonitorIcon } from '../../icons/MonitorIcon';
import MusicIcon100 from '../../icons/MusicIcon100';
import { CogIcon } from '../../icons/CogIcon';
import CloseIcon from '../../icons/CloseIcon';

const LectorPage = () => {
    const [isListening, setIsListening] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
    const navigate = useNavigate();

    const handleStartListening = () => {
        setIsListening(true);
    };

    const handleStopListening = () => {
        setIsListening(false);
    };

    const handleRefresh = () => {
        // Логика обновления
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <div className={commonStyles.appContainer}>
            {/* Модальное окно */}
            {isModalOpen && (
                <div className={commonStyles.modalOverlay}>
                    <div className={commonStyles.modal}>
                        <button className={commonStyles.closeButton} onClick={toggleModal}>
                            <CloseIcon />
                        </button>
                        <h2>💡 Как использовать (Режим лектора):</h2>
                        <ul className={commonStyles.instructionList}>
                            <li>🎤 Нажмите "Начать запись" слева</li>
                            <li>✅ Разрешите доступ к микрофону в браузере</li>
                            <li>🗣️ Говорите - результаты появятся здесь</li>
                            <li>⏹️ Нажмите "Остановить" для завершения</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>Лектор</h1>
                <div className={commonStyles.quickAccess}>
                    <div className={commonStyles.description}>
                        <p className={commonStyles.sectionParagraph}>
                            Сервис по переводу лекций в режиме реального времени <br />
                            Система обработает: <br />
                            🗣️ Распознает русскую речь <br />
                            ✏️ Уберет слова-паразиты <br />
                            🌍 Переведет на английский <br />
                        </p>
                        <button
                            className={commonStyles.quickLink1}
                            onClick={toggleModal} // Изменено на toggleModal
                        >
                            <CogIcon />
                            <span>Инструкция по использованию</span>
                        </button>
                    </div>

                    <div className={commonStyles.quickLinks}>
                        <button className={commonStyles.quickLink} onClick={() => navigate(`/recorder`)}>
                            <MusicIcon100 />
                            <span>Записать лекцию</span>
                        </button>
                        <button className={commonStyles.quickLink} onClick={() => navigate(`/archive`)}>
                            <LectureIcon />
                            <span>Архив лекций</span>
                        </button>
                        <button className={commonStyles.quickLink} onClick={() => navigate(`/active`)}>
                            <MonitorIcon />
                            <span>Активные лекции</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectorPage;