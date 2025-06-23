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

const LectorPage = () => {
    const [isListening, setIsListening] = useState(false);
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

    return (
        <div className={commonStyles.appContainer}>
            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>Лектор</h1>
                <div className={commonStyles.quickAccess}>
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