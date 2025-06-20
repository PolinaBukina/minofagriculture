import { useState } from 'react';
import commonStyles from '../commonStyles.module.css';
import { CogIcon } from '../../icons/CogIcon';
import { CheckCircleIcon } from '../../icons/CheckIcon';
import MusicIcon from '../../icons/MusicIcon';
import FolderIcon from '../../icons/FolderIcon';
import NotCheckIcon from '../../icons/NotCheckIcon';
import Header from '../../components/Header/Header';


const RecorderPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [sampleRate, setSampleRate] = useState(16000);
    const [channels, setChannels] = useState(1);
    const [chunkSize, setChunkSize] = useState(1024);

    const handleStartRecording = () => {
        setIsRecording(true);
        // Логика начала записи
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        // Логика остановки записи
    };

    return (
        <div className={commonStyles.appContainer}>
            {/* Боковая панель (меню) */}
            <div className={commonStyles.sidePanel}>
                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <CogIcon />
                        Настройки
                    </h2>

                    <div className={commonStyles.subHeader}>
                        Сервер
                    </div>
                    <div className={commonStyles.statusItem}>
                        <span>Адрес:</span>
                        <span>51.250.115.73:8000</span>
                    </div>
                    <div className={commonStyles.statusItem}>
                        <span>Статус:</span>
                        <span className={commonStyles.statusActive}>
                            <CheckCircleIcon />
                            Сервер доступен
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
                    <h2 className={commonStyles.subHeader}>
                        <FolderIcon />
                        Текущая сессия
                    </h2>
                    <div className={commonStyles.statusItem}>
                        <span>Статус:</span>
                        <span className={isRecording ? commonStyles.statusActive : commonStyles.statusInactive}>
                            {isRecording ? (
                                <>
                                    <CheckCircleIcon /> Идет запись
                                </>
                            ) : (
                                <>
                                    <NotCheckIcon /> Нет активной записи
                                </>
                            )}
                        </span>
                    </div>
                    <div className={commonStyles.noteText}>
                        ID появится после начала записи
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        <MusicIcon />
                        Настройки аудио</h2>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Частота дискретизации</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={sampleRate}
                            onChange={(e) => setSampleRate(Number(e.target.value))}
                        >
                            <option value="8000">8000</option>
                            <option value="16000">16000</option>
                            <option value="44100">44100</option>
                        </select>
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Количество каналов</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={channels}
                            onChange={(e) => setChannels(Number(e.target.value))}
                        >
                            <option value="1">1 (моно)</option>
                            <option value="2">2 (стерео)</option>
                        </select>
                    </div>

                    <div className={commonStyles.filterControl}>
                        <label className={commonStyles.filterLabel}>Размер чанка</label>
                        <select
                            className={commonStyles.filterSelect}
                            value={chunkSize}
                            onChange={(e) => setChunkSize(Number(e.target.value))}
                        >
                            <option value="512">512</option>
                            <option value="1024">1024</option>
                            <option value="2048">2048</option>
                        </select>
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>Диагностика</h2>
                    <div className={commonStyles.noteText}>
                        Для работы WebSocket на HTTPS сайтах нужен WSS протокол. Рекомендуется открыть сайт по HTTP для тестирования.
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className={commonStyles.mainContent}>
                <Header />
                <h1 className={commonStyles.sectionHeader}>Запись аудио</h1>

                <div className={commonStyles.infoCard}>
                    <div className={commonStyles.buttonGroup}>
                        <button
                            onClick={handleStartRecording}
                            disabled={isRecording}
                            className={`${commonStyles.primaryButton} ${isRecording ? commonStyles.disabledButton : ''}`}
                        >
                            Начать запись
                        </button>
                        <button
                            onClick={handleStopRecording}
                            disabled={!isRecording}
                            className={`${commonStyles.secondaryButton} ${!isRecording ? commonStyles.disabledButton : ''}`}
                        >
                            Остановить запись
                        </button>
                    </div>

                    <div className={commonStyles.noteText}>
                        Используется AudioContext для лучшего качества записи
                    </div>
                </div>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>Результаты обработки</h2>
                    {isRecording ? (
                        <div className={commonStyles.statusItem}>
                            <span>18:55:31:</span>
                            <span>Улучшенная направленная завершена - используется AudioContext + PCM16</span>
                        </div>
                    ) : (
                        <div className={commonStyles.noteText}>
                            Начните запись для просмотра результатов
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default RecorderPage;