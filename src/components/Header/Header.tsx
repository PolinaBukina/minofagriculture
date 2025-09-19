import React, { useState } from 'react';
import commonStyles from '../../pages/commonStyles.module.css';
import logo from './KdLogo.jpg';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import SupportIcon from '../../icons/SupportIcon';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    onLogout?: () => void;
    onSupport?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onSupport }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const handleLogout = (): void => {
        localStorage.removeItem('user-role');
        localStorage.removeItem('auth-storage');
        navigate('/signin');
        onSupport?.();
    };

    const handleSupport = () => {
        window.open('https://t.me/lecture_translation_service_bot', '_blank');
        onSupport?.();
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value;
        i18n.changeLanguage(lang);
    };

    return (
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
    );
};

export default Header;