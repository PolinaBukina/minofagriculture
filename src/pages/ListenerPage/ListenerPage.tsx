import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import commonStyles from '../commonStyles.module.css';
import { useNavigate } from 'react-router-dom';
import { LectureIcon } from '../../icons/LectureIcon';
import { MonitorIcon } from '../../icons/MonitorIcon';
import CloseIcon from '../../icons/CloseIcon';
import { CogIcon } from '../../icons/CogIcon';
import Header from '../../components/Header/Header';

const StudentPage = () => {
    const { t } = useTranslation();
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
                        <h2>{t('student.instructions.title')}</h2>
                        <ul className={commonStyles.instructionList}>
                            <li>{t('student.instructions.archive')}</li>
                            <li>{t('student.instructions.active')}</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>{t('student.title')}</h1>
                <div className={commonStyles.quickAccess}>
                    <div className={commonStyles.description}>
                        <p className={commonStyles.sectionParagraph}>
                            {t('student.description')}
                        </p>
                        <button
                            className={commonStyles.quickLink1}
                            onClick={toggleModal}
                        >
                            <CogIcon />
                            <span>{t('student.instructions.button')}</span>
                        </button>
                    </div>
                    <div className={commonStyles.quickLinks}>
                        <button className={commonStyles.quickLink} onClick={() => navigate(`/archive`)}>
                            <LectureIcon />
                            <span>{t('student.links.archive')}</span>
                        </button>
                        <button className={commonStyles.quickLink} onClick={() => navigate(`/active`)}>
                            <MonitorIcon />
                            <span>{t('student.links.active')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPage;