import { useState } from 'react';
import commonStyles from '../commonStyles.module.css';
import MusicIcon from '../../icons/MusicIcon';
import FolderIcon from '../../icons/FolderIcon';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import SearchIcon from '../../icons/SearchIcon';
import Header from '../../components/Header/Header';

const StudentPage = () => {
    const [isListening, setIsListening] = useState(false);

    const handleStartListening = () => {
        setIsListening(true);
    };

    const handleStopListening = () => {
        setIsListening(false);
    };

    const handleRefresh = () => {
        // Логика обновления
    };

    return (
        <div className={commonStyles.appContainer}>

            {/* Сайдбар */}
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <MusicIcon /> Настройки слушателя
                    </h2>
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>Сервер</h3>
                    <div className={commonStyles.statusItem}>
                        <span>Адрес:</span>
                        <span>51.250.115.73:8000</span>
                    </div>
                    <div className={commonStyles.statusItem}>
                        <span>Статус:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon /> Сервер доступен
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
                        <span>0</span>
                    </div>

                    <div className={commonStyles.statusItem}>
                        <span>WebSocket:</span>
                        <span>0</span>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>
                        <FolderIcon /> Выбор лекции
                    </h3>
                    <div className={commonStyles.noteText}>
                        <SearchIcon /> Сейчас нет активных лекций
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>Слушатель лекции</h1>
                <h2 className={commonStyles.subHeader}>
                    {isListening
                        ? 'Идет прослушивание текущей лекции...'
                        : 'Готово к прослушиванию текущей лекции'}
                </h2>

                <div className={commonStyles.infoCard}>
                    <div className={commonStyles.buttonGroup}>
                        <button
                            onClick={handleStartListening}
                            disabled={isListening}
                            className={`${commonStyles.primaryButton} ${isListening ? commonStyles.disabledButton : ''}`}
                        >
                            Начать прослушивание
                        </button>
                        <button
                            onClick={handleStopListening}
                            disabled={!isListening}
                            className={`${commonStyles.secondaryButton} ${!isListening ? commonStyles.disabledButton : ''}`}
                        >
                            Остановить прослушивание
                        </button>
                        <button
                            onClick={handleRefresh}
                            className={commonStyles.refreshButton}
                        >
                            Обновить
                        </button>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>Как использовать:</h3>
                    <ul className={commonStyles.instructionList}>
                        <li className={commonStyles.instructionItem}>
                            <strong>Нажмите "Начать прослушивание"</strong>
                        </li>
                        <li className={commonStyles.instructionItem}>
                            Следите за текстом в реальном времени
                        </li>
                        <li className={commonStyles.instructionItem}>
                            Остановите когда захотите
                        </li>
                    </ul>
                </div>

                <div className={commonStyles.infoCard}>
                    <h3 className={commonStyles.subHeader}>Преимущества режима слушателя:</h3>
                    <ul className={commonStyles.featureList}>
                        <li className={commonStyles.featureItem}>
                            <span className={commonStyles.featureCheckbox}></span>
                            Только получение текста (экономия ресурсов)
                        </li>
                        <li className={commonStyles.featureItem}>
                            <span className={commonStyles.featureCheckbox}></span>
                            Быстрое подключение
                        </li>
                        <li className={commonStyles.featureItem}>
                            <span className={commonStyles.featureCheckbox}></span>
                            Автоматическая очистка старых сообщений
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StudentPage;