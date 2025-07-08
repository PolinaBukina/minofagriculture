// import React from 'react'
// import commonStyles from '../../pages/commonStyles.module.css';
// import logo from './logo.png'

// const Header = () => {
//     return (
//         <header className={commonStyles.appHeader}>
//             <div className={commonStyles.headerContent}>

//                 <img src={logo} alt="логотип" className={commonStyles.logo} />

//                 <div className={commonStyles.headerTitle}>
//                     <p>ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ</p>
//                     <h1>РОССИЙСКИЙ ГОСУДАРСТВЕННЫЙ АГРАРНЫЙ УНИВЕРСИТЕТ - <br />МСХА ИМЕНИ К.А. ТИМИРЯЗЕВА</h1>
//                 </div>
//             </div>
//         </header>
//     )
// }

// export default Header


// import React, { useState } from 'react';
// import commonStyles from '../../pages/commonStyles.module.css';
// import logo from './logo.png';
// import { useNavigate } from 'react-router-dom';
// import { LogOut } from 'lucide-react';
// import SupportIcon from '../../icons/SupportIcon';

// // Импортируем иконки (замените на свои компоненты иконок)
// // import { LogoutIcon, SupportIcon } from '../../icons';

// // Типы для пропсов (если нужно передавать обработчики извне)
// interface HeaderProps {
//     onLogout?: () => void;
//     onSupport?: () => void;
// }

// const Header: React.FC<HeaderProps> = ({ onLogout, onSupport }) => {
//     const [language, setLanguage] = useState<string>('ru');
//     const navigate = useNavigate();

//     const handleLogout = (): void => {
//         navigate('/');
//     };

//     const handleSupport = () => {
//         // Логика открытия поддержки
//         console.log('Поддержка');
//         window.open('https://t.me/test_mos_politech_bot', '_blank');
//         onSupport?.();
//     };

//     return (
//         <header className={commonStyles.appHeader}>
//             <div className={commonStyles.headerContent}>
//                 <img src={logo} alt="логотип" className={commonStyles.logo} />

//                 <div className={commonStyles.headerTitle}>
//                     <p>ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ</p>
//                     <h1>РОССИЙСКИЙ ГОСУДАРСТВЕННЫЙ АГРАРНЫЙ УНИВЕРСИТЕТ - <br />МСХА ИМЕНИ К.А. ТИМИРЯЗЕВА</h1>
//                 </div>
//             </div>
//             {/* Блок дополнительных кнопок */}
//             <div className={commonStyles.headerActions}>
//                 <select
//                     className={commonStyles.filterSelect}
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                 >
//                     <option value="ru">Русский</option>
//                     <option value="en">Английский</option>
//                     <option value="fr">Французский</option>
//                     <option value="zh">Китайский</option>
//                 </select>
//                 <button
//                     className={commonStyles.actionButton}
//                     onClick={handleSupport}
//                     title="Поддержка"
//                     aria-label="Support"
//                 >
//                     <span className={commonStyles.buttonText}>Поддержка</span>
//                     <SupportIcon />
//                 </button>

//                 <button
//                     className={commonStyles.actionButton}
//                     onClick={handleLogout}
//                     title="Выйти из аккаунта"
//                     aria-label="Logout"
//                 >
//                     {/* <LogoutIcon /> */}
//                     <span className={commonStyles.buttonText}>Выйти</span>
//                     <LogOut className="h-3 w-3" />
//                 </button>
//             </div>
//         </header>
//     );
// };

// export default Header;


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
}

const Header: React.FC<HeaderProps> = ({ onLogout, onSupport }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const handleLogout = (): void => {
        navigate('/');
    };

    const handleSupport = () => {
        window.open('https://t.me/test_mos_politech_bot', '_blank');
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