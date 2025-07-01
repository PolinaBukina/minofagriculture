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


import React, { useState } from 'react';
import commonStyles from '../../pages/commonStyles.module.css';
import logo from './logo.png';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import SupportIcon from '../../icons/SupportIcon';

// Импортируем иконки (замените на свои компоненты иконок)
// import { LogoutIcon, SupportIcon } from '../../icons';

// Типы для пропсов (если нужно передавать обработчики извне)
interface HeaderProps {
    onLogout?: () => void;
    onSupport?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onSupport }) => {
    const [language, setLanguage] = useState<string>('ru');
    const navigate = useNavigate();

    const handleLogout = (): void => {
        console.log('Выход из системы');
        navigate('/');
    };

    const handleSupport = () => {
        // Логика открытия поддержки
        console.log('Поддержка');
        onSupport?.();
    };

    return (
        <header className={commonStyles.appHeader}>
            <div className={commonStyles.headerContent}>
                <img src={logo} alt="логотип" className={commonStyles.logo} />

                <div className={commonStyles.headerTitle}>
                    <p>ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ</p>
                    <h1>РОССИЙСКИЙ ГОСУДАРСТВЕННЫЙ АГРАРНЫЙ УНИВЕРСИТЕТ - <br />МСХА ИМЕНИ К.А. ТИМИРЯЗЕВА</h1>
                </div>
            </div>
            {/* Блок дополнительных кнопок */}
            <div className={commonStyles.headerActions}>
                <select
                    className={commonStyles.filterSelect}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="ru">Русский</option>
                    <option value="en">Английский</option>
                    <option value="fr">Французский</option>
                    <option value="zh">Китайский</option>
                </select>
                <button
                    className={commonStyles.actionButton}
                    onClick={handleSupport}
                    title="Поддержка"
                    aria-label="Support"
                >
                    <span className={commonStyles.buttonText}>Поддержка</span>
                    <SupportIcon />
                </button>

                <button
                    className={commonStyles.actionButton}
                    onClick={handleLogout}
                    title="Выйти из аккаунта"
                    aria-label="Logout"
                >
                    {/* <LogoutIcon /> */}
                    <span className={commonStyles.buttonText}>Выйти</span>
                    <LogOut className="h-3 w-3" />
                </button>
            </div>
        </header>
    );
};

export default Header;