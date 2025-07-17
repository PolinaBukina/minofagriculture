import React, { useState } from 'react';
import commonStyles from '../../pages/commonStyles.module.css';
import logo from './logo.png';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import SupportIcon from '../../icons/SupportIcon';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    onLogout?: () => void;
    onSupport?: () => void;
    isStreaming?: boolean;
    setIsFinished?: React.Dispatch<React.SetStateAction<boolean>>;
}

const HeaderWithoutTranslate: React.FC<HeaderProps> = ({
    onLogout,
    onSupport,
    isStreaming = false,
    setIsFinished
}) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [pendingLanguage, setPendingLanguage] = useState(i18n.language);

    const handleLogout = (): void => {
        localStorage.removeItem('user-role');
        localStorage.removeItem('auth-storage');
        navigate('/signin');
        onSupport?.();
    };

    const handleSupport = () => {
        window.open('https://t.me/test_mos_politech_bot', '_blank');
        onSupport?.();
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setShowLanguageModal(true);
    };

    const confirmLanguageChange = () => {
        i18n.changeLanguage(pendingLanguage);
        setIsFinished?.(true);
        setShowLanguageModal(false);
    };

    const cancelLanguageChange = () => {
        setShowLanguageModal(false);
    };

    return (
        <>
            <header className={commonStyles.appHeader}>
                <div className={commonStyles.headerContent}>
                    <img src={logo} alt="logo" className={commonStyles.logo} />

                    <div className={commonStyles.headerTitle}>
                        <p>{t('header.federal_institution')}</p>
                        <h1 dangerouslySetInnerHTML={{ __html: t('header.university_name') }} />
                    </div>
                </div>
                <div className={commonStyles.headerActions}>
                    <select
                        className={commonStyles.filterSelect}
                        value={i18n.language}
                        onChange={handleLanguageChange}
                    >
                        <option value="ru">Русский</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="zh">中文</option>
                    </select>
                    <button
                        className={commonStyles.actionButton}
                        onClick={handleSupport}
                        title={t('header.support')}
                        aria-label="Support"
                    >
                        <span className={commonStyles.buttonText}>{t('header.support')}</span>
                        <SupportIcon />
                    </button>

                    <button
                        className={commonStyles.actionButton}
                        onClick={handleLogout}
                        title={t('header.logout')}
                        aria-label="Logout"
                    >
                        <span className={commonStyles.buttonText}>{t('header.logout')}</span>
                        <LogOut className="h-3 w-3" />
                    </button>
                </div>
            </header>

            {showLanguageModal && (
                <div className={commonStyles.modalOverlay}>
                    <div className={commonStyles.modal}>
                        <h3>{t('language_change.title')}</h3>
                        <p>{t('language_change.message')}</p>
                        <div className={commonStyles.modalButtons}>
                            <button
                                onClick={cancelLanguageChange}
                                className={commonStyles.cancelModalButton}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={confirmLanguageChange}
                                className={commonStyles.okModalButton}
                            >
                                {t('language_change.continue')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HeaderWithoutTranslate;