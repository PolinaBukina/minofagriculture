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
import CloseIcon from '../../icons/CloseIcon';
import { CogIcon } from '../../icons/CogIcon';

const StudentPage = () => {
    const [isListening, setIsListening] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
                        <h2>💡 Инструкция по использованию</h2>
                        <ul className={commonStyles.instructionList}>
                            <li>🎤 При нажатии на кнопку "архив лекций" вы попадаете на страницу со всеми доступными лекциями</li>
                            <li>✅ При нажатии на кнопку "активные лекции" вы попадаете на страницу со всеми идущими сейчас лекциями</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>Сервис по переводу лекций (роль: СТУДЕНТ)</h1>
                <div className={commonStyles.quickAccess}>
                    <div className={commonStyles.description}>
                        <p className={commonStyles.sectionParagraph}>
                            Интеллектуальная платформа для синхронного перевода лекций на иностранные языки с использованием технологии GPT. <br /><br />
                            Сохраняем доступными переведенные лекции в течение 1 месяца. <br />
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

export default StudentPage;