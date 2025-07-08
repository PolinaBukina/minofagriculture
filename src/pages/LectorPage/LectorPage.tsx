import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import MusicIcon from '../../icons/MusicIcon';
import FolderIcon from '../../icons/FolderIcon';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import SearchIcon from '../../icons/SearchIcon';
import { LectureIcon } from '../../icons/LectureIcon';
import { MonitorIcon } from '../../icons/MonitorIcon';
import MusicIcon100 from '../../icons/MusicIcon100';
import { CogIcon } from '../../icons/CogIcon';
import CloseIcon from '../../icons/CloseIcon';

const LectorPage = () => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    return (
        <div className={commonStyles.appContainer}>
            {/* Модальное окно */}
            {isModalOpen && (
                <div className={commonStyles.modalOverlay}>
                    <div className={commonStyles.modal}>
                        <button
                            className={commonStyles.closeButton}
                            onClick={toggleModal}
                            aria-label={t('common.close')}
                        >
                            <CloseIcon />
                        </button>
                        <h2>{t('lector.instructions.title')}</h2>
                        <ul className={commonStyles.instructionList}>
                            <li>{t('lector.instructions.step1')}</li>
                            <li>{t('lector.instructions.step2')}</li>
                            <li>{t('lector.instructions.step3')}</li>
                            <li>{t('lector.instructions.step4')}</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>
                    {t('lector.title')}
                </h1>

                <div className={commonStyles.quickAccess}>
                    <div className={commonStyles.description}>
                        <p className={commonStyles.sectionParagraph}>
                            {t('lector.description')}
                        </p>
                        <button
                            className={commonStyles.quickLink1}
                            onClick={toggleModal}
                        >
                            <CogIcon />
                            <span>{t('lector.instructions.button')}</span>
                        </button>
                    </div>

                    <div className={commonStyles.quickLinks}>
                        <button
                            className={commonStyles.quickLink}
                            onClick={() => navigate('/lector/recorder')}
                        >
                            <MusicIcon100 />
                            <span>{t('lector.actions.record')}</span>
                        </button>
                        <button
                            className={commonStyles.quickLink}
                            onClick={() => navigate('/archive')}
                        >
                            <LectureIcon />
                            <span>{t('lector.actions.archive')}</span>
                        </button>
                        <button
                            className={commonStyles.quickLink}
                            onClick={() => navigate('/active')}
                        >
                            <MonitorIcon />
                            <span>{t('lector.actions.active')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectorPage;