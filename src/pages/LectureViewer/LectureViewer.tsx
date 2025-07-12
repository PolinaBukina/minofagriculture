import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import MusicIcon from '../../icons/MusicIcon';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
import { apiService } from '../../services/api';
import type { Session, SessionData } from '../../services/api';

interface Lecture {
    id: string;
    title: string;
    start: string;
    end: string;
    duration: string;
    lecturer: string;
    location: string;
    status: string;
    content: {
        original: string;
        translations: {
            en: string;
            fr: string;
            zh: string;
        };
    };
}

// interface SessionData {
//     session?: {
//         id?: string;
//         title?: string;
//         start_time: string;
//         end_time?: string;
//         lecturer?: string;
//         location?: string;
//         status?: string;
//     };
//     total_transcriptions?: number;
//     total_processed?: number;
//     processed_texts?: ProcessedText[];
// }

interface ProcessedText {
    processed_text?: string;
    text?: string;
    english_translation?: string;
    translation?: string;
}


// interface SessionInfo {
//     title?: string;
//     start_time?: string;
//     end_time?: string;
//     lecturer?: string;
//     location?: string;
//     status?: string;
// }

// interface SessionData {
//     session?: SessionInfo;
//     processed_texts?: ProcessedTextItem[];
//     total_transcriptions?: number;
//     total_processed?: number;
//     // добавьте другие необходимые свойства
// }

interface WebSocketMessage {
    type: string;
    timestamp?: string;
    text?: string;
    processed_text?: string;
    translation?: string;
    message?: string;
    id?: string;
}

const LectureViewer = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const userRole = getRoleFromStorage();
    const location = useLocation();
    const navigate = useNavigate();

    // Состояние компонента
    const [language, setLanguage] = useState<'en' | 'fr' | 'zh'>('en');
    const [lecture, setLecture] = useState<Lecture | null>(null);
    const [fromArchive, setFromArchive] = useState(false);

    // Состояние для реальных данных
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [originalText, setOriginalText] = useState('');
    type Translations = {
        en: string;
        fr: string;
        zh: string;
    };
    const [translatedTexts, setTranslatedTexts] = useState<Translations>({
        en: '',
        fr: '',
        zh: '',
    });

    // Состояние для реального времени
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [liveMessages, setLiveMessages] = useState<WebSocketMessage[]>([]);
    const [processedTexts, setProcessedTexts] = useState<string[]>([]);
    const [translations, setTranslations] = useState<{ en: string; fr: string; zh: string }>({ en: '', fr: '', zh: '' });

    // WebSocket для реального времени
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastMessageIdRef = useRef<Set<string>>(new Set());

    // Определяем, откуда пришел пользователь
    useEffect(() => {
        if (location.state?.fromArchive || location.pathname.includes('/archive')) {
            setFromArchive(true);
            setIsLiveMode(false);
        } else if (location.pathname.includes('/active')) {
            setFromArchive(false);
            setIsLiveMode(true);
        }
    }, [location]);

    // WebSocket подключение для реального времени
    // const connectWebSocket = useCallback(async () => {
    //     if (!isLiveMode || !id) return;

    //     try {
    //         console.log(`Подключение WebSocket для лекции: ${id}`);

    //         const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    //         const host = 'audio.minofagriculture.ru'; // или ваш правильный домен
    //         // const wsUrl = `${protocol}//${host}/ws/monitor`;
    //         const wsUrl = `wss://audio.minofagriculture.ru/ws/monitor`;

    //         console.log(`📡 WebSocket URL: ${wsUrl}`);

    //         const ws = new WebSocket(wsUrl);
    //         wsRef.current = ws;

    //         ws.onopen = () => {
    //             console.log('✅ WebSocket подключен для мониторинга');
    //             setWsConnected(true);
    //             setError('');

    //             const subscribeMessage = {
    //                 type: 'subscribe',
    //                 session_id: id,
    //                 listener_id: `viewer_${Date.now()}`,
    //                 role: 'viewer'
    //             };

    //             ws.send(JSON.stringify(subscribeMessage));
    //             console.log(`📡 Подписались на сессию: ${id}`);
    //         };

    //         ws.onmessage = (event) => {
    //             try {
    //                 const data = JSON.parse(event.data) as WebSocketMessage;
    //                 console.log('📨 Получено WebSocket сообщение:', data.type, data);
    //                 handleWebSocketMessage(data);
    //             } catch (error) {
    //                 console.error('❌ Ошибка парсинга WebSocket сообщения:', error);
    //             }
    //         };

    //         ws.onclose = (event) => {
    //             console.log(`🔌 WebSocket закрыт: код ${event.code}, причина: ${event.reason}`);
    //             setWsConnected(false);

    //             if (isLiveMode && !reconnectTimeoutRef.current) {
    //                 console.log(' Планирование переподключения через 3 секунды...');
    //                 reconnectTimeoutRef.current = setTimeout(() => {
    //                     reconnectTimeoutRef.current = null;
    //                     console.log(' Попытка переподключения...');
    //                     connectWebSocket();
    //                 }, 3000);
    //             }
    //         };

    //         ws.onerror = (error) => {
    //             console.error('❌ Ошибка WebSocket:', error);
    //             setWsConnected(false);
    //             setError('Ошибка WebSocket подключения');
    //         };

    //     } catch (error) {
    //         console.error('❌ Ошибка создания WebSocket:', error);
    //         setError(`Ошибка WebSocket: ${(error as Error).message}`);
    //     }
    // }, [id, isLiveMode]);

    const connectWebSocket = useCallback(async () => {
        if (!isLiveMode || !id) return;

        try {
            console.log(`Подключение WebSocket для лекции: ${id}`);

            // Используем фиксированный URL для WebSocket
            const wsUrl = `wss://audio.minofagriculture.ru/ws/monitor`;

            console.log(`📡 WebSocket URL: ${wsUrl}`);

            // Закрываем предыдущее соединение, если оно есть
            if (wsRef.current) {
                wsRef.current.close();
            }

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✅ WebSocket подключен для мониторинга');
                setWsConnected(true);
                setError('');

                const subscribeMessage = {
                    type: 'subscribe',
                    session_id: id,
                    listener_id: `viewer_${Date.now()}`,
                    role: 'viewer'
                };

                ws.send(JSON.stringify(subscribeMessage));
                console.log(`📡 Подписались на сессию: ${id}`);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as WebSocketMessage;
                    console.log('📨 Получено WebSocket сообщение:', data.type, data);
                    handleWebSocketMessage(data);
                } catch (error) {
                    console.error('❌ Ошибка парсинга WebSocket сообщения:', error);
                }
            };

            ws.onclose = (event) => {
                console.log(`🔌 WebSocket закрыт: код ${event.code}, причина: ${event.reason}`);
                setWsConnected(false);

                if (isLiveMode && !reconnectTimeoutRef.current) {
                    console.log(' Планирование переподключения через 3 секунды...');
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectTimeoutRef.current = null;
                        console.log(' Попытка переподключения...');
                        connectWebSocket();
                    }, 3000);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ Ошибка WebSocket:', error);
                setWsConnected(false);
                setError('Ошибка WebSocket подключения');

                // Попытка переподключения при ошибке
                if (isLiveMode && !reconnectTimeoutRef.current) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectTimeoutRef.current = null;
                        connectWebSocket();
                    }, 3000);
                }
            };

        } catch (error) {
            console.error('❌ Ошибка создания WebSocket:', error);
            setError(`Ошибка WebSocket: ${(error as Error).message}`);

            // Попытка переподключения при ошибке
            if (isLiveMode && !reconnectTimeoutRef.current) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectTimeoutRef.current = null;
                    connectWebSocket();
                }, 3000);
            }
        }
    }, [id, isLiveMode]);

    // Обработка WebSocket сообщений
    const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
        console.log('📨 Обработка WebSocket сообщения:', data.type, data);

        const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

        if (lastMessageIdRef.current.has(messageKey)) {
            console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
            return;
        }

        lastMessageIdRef.current.add(messageKey);

        if (lastMessageIdRef.current.size > 1000) {
            const keysArray = Array.from(lastMessageIdRef.current);
            lastMessageIdRef.current.clear();
            keysArray.slice(-500).forEach(key => lastMessageIdRef.current.add(key));
        }

        setLiveMessages(prev => {
            const updated = [...prev, { ...data, id: messageKey }];
            return updated.slice(-50);
        });

        if (data.type === 'processed' && data.processed_text) {
            const newText = data.processed_text.trim();
            if (newText) {
                console.log('✏️ Добавляем обработанный текст:', newText.slice(0, 50) + '...');

                setProcessedTexts(prev => {
                    if (!prev.includes(newText)) {
                        const updated = [...prev, newText];
                        const fullText = updated.join(' ');
                        setOriginalText(fullText);
                        console.log(`📝 Обновлен исходный текст: ${fullText.length} символов`);
                        return updated;
                    }
                    return prev;
                });
            }
        }

        if (data.type === 'translated' && data.translation) {
            const newTranslation = data.translation.trim();
            if (newTranslation) {
                console.log('🌍 Добавляем перевод:', newTranslation.slice(0, 50) + '...');

                setTranslations(prev => {
                    // if (!prev.includes(newTranslation)) {
                    //     const updated = [...prev, newTranslation];
                    //     const fullTranslation = updated.join(' ');
                    //     setTranslatedTexts(prevTranslated => ({
                    //         ...prevTranslated,
                    //         en: fullTranslation
                    //     }));
                    //     console.log(`🌐 Обновлен перевод: ${fullTranslation.length} символов`);
                    //     return updated;
                    // }
                    setTranslations(prev => {
                        const updated = {
                            ...prev,
                            en: prev.en + ' ' + newTranslation
                        };
                        setTranslatedTexts(updated);
                        return updated;
                    });

                    return prev;
                });
            }
        }

        if (data.type === 'error') {
            console.error('❌ Ошибка от сервера:', data.message);
            setError(`Ошибка сервера: ${data.message || 'Неизвестная ошибка'}`);
        }
    }, []);

    // Отключение WebSocket при размонтировании
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                console.log('🔌 Закрываем WebSocket при размонтировании');
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    // Подключение WebSocket для live режима
    useEffect(() => {
        if (isLiveMode) {
            console.log('🚀 Запуск WebSocket для live режима');
            connectWebSocket();
        }
    }, [isLiveMode, connectWebSocket]);

    const loadLectureData = async () => {
        if (!id) {
            setError('ID лекции не указан');
            setIsLoading(false);
            return;
        }

        try {
            setError('');
            setIsLoading(true);

            console.log(`📖 Загружаем данные лекции: ${id}`);
            const sessionInfo = await apiService.getSession(id);
            console.log('📊 Полученные данные:', sessionInfo);

            if (!sessionInfo) {
                setError('Сессия не найдена');
                setIsLoading(false);
                return;
            }

            // Обрабатываем оригинальный текст
            const originalText = sessionInfo.transcripts?.join(' ') || '';
            console.log('📝 Оригинальный текст:', originalText);

            // 🔧 ИСПРАВЛЕНО: Используем новые поля translations_multi
            const translations = {
                en: sessionInfo.translations_multi?.en?.join(' ') || sessionInfo.translations?.join(' ') || '',
                fr: sessionInfo.translations_multi?.fr?.join(' ') || '', // 🆕 Теперь будет получать данные!
                zh: sessionInfo.translations_multi?.zh?.join(' ') || ''  // 🆕 Теперь будет получать данные!
            };

            console.log('🌍 Все переводы загружены:', translations);
            console.log(`🇺🇸 Английский: ${translations.en.length} символов`);
            console.log(`🇫🇷 Французский: ${translations.fr.length} символов`);
            console.log(`🇨🇳 Китайский: ${translations.zh.length} символов`);

            // Формируем объект лекции
            const lectureData = {
                id: id,
                title: sessionInfo.title || `Лекция ${id.slice(0, 8)}`,
                start: sessionInfo.start_time,
                end: sessionInfo.end_time || 'Неизвестно',
                duration: calculateDuration(sessionInfo.start_time, sessionInfo.end_time),
                lecturer: sessionInfo.lecturer || 'Неизвестный лектор',
                location: sessionInfo.name || 'Не указано',
                status: sessionInfo.status || 'unknown',
                content: {
                    original: originalText,
                    translations: translations // 🆕 Теперь содержит все языки
                }
            };

            setLecture(lectureData);
            setOriginalText(originalText);
            setTranslatedTexts(translations); // 🆕 Устанавливаем все переводы
            setSessionData(sessionInfo);

            console.log('✅ Лекция успешно загружена:', lectureData);

        } catch (err) {
            console.error('❌ Ошибка загрузки лекции:', err);
            setError(`Ошибка загрузки`);
        } finally {
            setIsLoading(false);
        }
    };

    // Расчет длительности
    const calculateDuration = (startTime?: string, endTime?: string): string => {
        if (!startTime || !endTime) return 'Неизвестно';

        try {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const diffMs = end.getTime() - start.getTime();
            const diffMinutes = Math.floor(diffMs / 60000);
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            if (hours > 0) {
                return `${hours}ч ${minutes}м`;
            } else {
                return `${minutes}м`;
            }
        } catch {
            return 'Неизвестно';
        }
    };

    // Форматирование времени
    const formatTime = (timestamp?: string): string => {
        if (!timestamp) return 'Неизвестно';

        try {
            const date = new Date(timestamp);
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return timestamp;
        }
    };

    // Загрузка данных при монтировании
    useEffect(() => {
        loadLectureData();
    }, [id]);

    // Функция для формирования хлебных крошек
    const getBreadcrumbs = () => {
        const baseItems = [
            {
                label: getHomeLabel(userRole),
                path: getHomePath(userRole)
            }
        ];

        if (fromArchive) {
            return [
                ...baseItems,
                {
                    label: t('archive.title'),
                    path: '/archive',
                    translationKey: 'archive.title'
                },
                {
                    label: t('lecture_viewer.back_breadcrumb', { id: id?.slice(0, 8) }),
                    path: `/archive/lecture/${id}`,
                    translationKey: 'lecture_viewer.back_breadcrumb'
                }
            ];
        } else {
            return [
                ...baseItems,
                {
                    label: t('active_lectures.title'),
                    path: '/active',
                    translationKey: 'active_lectures.title'
                },
                {
                    label: t('lecture_viewer.back_breadcrumb', { id: id?.slice(0, 8) }),
                    path: `/active/lecture/${id}`,
                    translationKey: 'lecture_viewer.back_breadcrumb'
                }
            ];
        }
    };

    // Функция для синтеза речи
    const speakText = (text: string, lang: string) => {
        if (!text || !text.trim()) {
            alert('Нет текста для озвучивания');
            return;
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            switch (lang) {
                case 'en':
                    utterance.lang = 'en-US';
                    break;
                case 'fr':
                    utterance.lang = 'fr-FR';
                    break;
                case 'zh':
                    utterance.lang = 'zh-CN';
                    break;
                default:
                    utterance.lang = 'ru-RU';
            }

            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            window.speechSynthesis.speak(utterance);
            console.log(`🔊 Озвучивание начато (${lang}): ${text.slice(0, 50)}...`);
        } else {
            alert('Браузер не поддерживает синтез речи');
        }
    };

    // Копирование текста в буфер обмена
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Текст скопирован в буфер обмена');
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Текст скопирован в буфер обмена');
        }
    };

    // Экспорт лекции в файл
    const exportLecture = () => {
        if (!lecture) return;

        const exportText = `ЛЕКЦИЯ: ${lecture.title}
            Лектор: ${lecture.lecturer}
            Дата: ${lecture.start}
            Длительность: ${lecture.duration}

            ИСХОДНЫЙ ТЕКСТ:
            ${originalText}

            ПЕРЕВОД (${language.toUpperCase()}):
            ${translatedTexts[language] || 'Перевод недоступен'}

            ---
            Экспортировано из системы транскрипции лекций
            ID сессии: ${id}
        `;

        const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lecture_${id}_${language}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`📁 Лекция экспортирована: lecture_${id}_${language}.txt`);
    };

    if (isLoading) {
        return (
            <div className={commonStyles.appContainer}>
                <div className={commonStyles.mainContentLecture}>
                    <Header />
                    <Breadcrumbs items={getBreadcrumbs()} />
                    <h1 className={commonStyles.sectionHeader}>{t('lecture_viewer.loading')}</h1>
                    <div className={commonStyles.infoCardLecture}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '300px',
                            width: '100%',
                            gap: '20px'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                border: '6px solid rgba(0, 0, 0, 0.1)',
                                borderTop: '6px solid #3498db',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <p style={{
                                color: '#555',
                                fontSize: '1.2rem',
                                fontWeight: '500'
                            }}>
                                {t('lecture_viewer.loading_lecture')} {id?.slice(0, 8)}...
                            </p>
                            {isLiveMode && (
                                <div style={{
                                    marginTop: '12px',
                                    color: '#0369a1',
                                    textAlign: 'center'
                                }}>
                                    {t('lecture_viewer.preparing_live')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !lecture) {
        return (
            <div className={commonStyles.appContainer}>
                <div className={commonStyles.mainContentLecture}>
                    <Header />
                    <Breadcrumbs items={getBreadcrumbs()} />
                    <h1 className={commonStyles.sectionHeader}>❌ Ошибка загрузки</h1>
                    <div className={commonStyles.infoCardLecture} style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca'
                    }}>
                        <div style={{ color: '#dc2626' }}>{error}</div>
                        <button
                            className={commonStyles.textButton}
                            onClick={loadLectureData}
                            style={{ marginTop: '16px' }}
                        >
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!lecture) {
        return (
            <div className={commonStyles.appContainer}>
                <div className={commonStyles.mainContentLecture}>
                    <Header />
                    <h1 className={commonStyles.sectionHeader}>Лекция не найдена</h1>
                </div>
            </div>
        );
    }

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.mainContentLecture}>
                <Header />
                <Breadcrumbs items={getBreadcrumbs()} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 className={commonStyles.sectionHeader}>{lecture.title}</h1>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* 🆕 УЛУЧШЕНО: Индикатор реального времени */}
                        {isLiveMode && (
                            <div style={{
                                padding: '6px 12px',
                                backgroundColor: wsConnected ? '#dcfce7' : '#fef3cd',
                                border: `1px solid ${wsConnected ? '#bbf7d0' : '#fecf6a'}`,
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: wsConnected ? '#16a34a' : '#92400e',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontWeight: '500'
                            }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: wsConnected ? '#16a34a' : '#eab308',
                                    animation: wsConnected ? 'pulse 2s infinite' : 'none'
                                }}></span>
                                {wsConnected ? '🔴 LIVE' : ' Подключение...'}
                                {liveMessages.length > 0 && (
                                    <span style={{ fontSize: '12px', opacity: '0.8' }}>
                                        • {liveMessages.length} сообщений
                                    </span>
                                )}
                            </div>
                        )}
                        {error && (
                            <div style={{
                                padding: '8px 12px',
                                backgroundColor: '#fef3cd',
                                border: '1px solid #fecf6a',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#92400e'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* 🆕 УЛУЧШЕНО: Информация о реальном времени */}
                {/* {isLiveMode && (
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ fontSize: '14px', color: '#0369a1', lineHeight: '1.5' }}>
                            <strong>📡 Режим реального времени:</strong> Текст лекции обновляется автоматически при поступлении новых данных
                            <br />
                            <strong>Статус:</strong> {wsConnected ? '✅ Подключен к WebSocket' : ' Подключение к WebSocket...'}
                            {liveMessages.length > 0 && (
                                <>
                                    <br />
                                    <strong>Получено:</strong> {liveMessages.length} сообщений
                                    • Фрагментов текста: {processedTexts.length}
                                    • Переводов: {[translations.en, translations.fr, translations.zh].filter(t => t?.length > 0).length}
                                </>
                            )}
                        </div>
                    </div>
                )} */}

                <div className={commonStyles.infoCardLecture}>
                    <div className={commonStyles.listItemLecture}>
                        <h2>{t('lecture_viewer.details')}</h2>
                        <div className={commonStyles.statusItem}>
                            <span>ID сессии:</span>
                            <span>
                                {id}
                            </span>
                        </div>
                        {lecture.lecturer && (
                            <div className={commonStyles.statusItem}>
                                <span>{t('lecture_viewer.lecturer')}:</span>
                                <span>{lecture.lecturer}</span>
                            </div>
                        )}
                        <div className={commonStyles.statusItem}>
                            <span>{t('lecture_viewer.start')}:</span>
                            <span>{lecture.start}</span>
                        </div>
                        <div className={commonStyles.statusItem}>
                            <span>{t('lecture_viewer.end')}:</span>
                            <span>{lecture.end}</span>
                        </div>
                        <div className={commonStyles.statusItem}>
                            <span>{t('lecture_viewer.duration')}:</span>
                            <span>{lecture.duration}</span>
                        </div>
                        {lecture.location && (
                            <div className={commonStyles.statusItem}>
                                <span>{t('lecture_viewer.location')}:</span>
                                <span>{lecture.location}</span>
                            </div>
                        )}
                        <div className={commonStyles.statusItem}>
                            <span>{t('lecture_viewer.status')}:</span>
                            <span>
                                {fromArchive ? 'Архивная лекция' :
                                    isLiveMode ? (wsConnected ? '🔴 Активная лекция (LIVE подключен)' : ' Активная лекция (подключение...)') :
                                        '🔴 Активная лекция'}
                            </span>
                        </div>
                    </div>

                    <div className={commonStyles.listItemLecture}>
                        <h2>{t('language.select')}</h2>
                        <select
                            className={commonStyles.filterSelect}
                            value={language}
                            // onChange={(e) => setLanguage(e.target.value)}
                            onChange={(e) => {
                                const lang = e.target.value;
                                if (lang === 'en' || lang === 'fr' || lang === 'zh') {
                                    setLanguage(lang);
                                }
                            }}
                        >
                            <option value="en">{t('language.english')}</option>
                            <option value="fr">{t('language.french')}</option>
                            <option value="zh">{t('language.chinese')}</option>
                        </select>

                        <div style={{ marginTop: '16px' }}>
                            <button
                                className={commonStyles.textButton}
                                onClick={exportLecture}
                            >
                                {/* Экспорт лекции */}
                                {t('export')}
                            </button>
                            <button
                                className={commonStyles.textButton}
                                onClick={() => loadLectureData()}
                            >
                                {t('refresh')}
                            </button>
                            {isLiveMode && (
                                <button
                                    className={commonStyles.textButton}
                                    onClick={connectWebSocket}
                                    disabled={wsConnected}
                                >
                                    {wsConnected ? `${t('refresh_ws.ok')}` : `${t('refresh_ws.err')}`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={commonStyles.infoCardLecture}>
                    <div className={commonStyles.listItemLecture}>
                        <div className={commonStyles.textHeaderContainer}>
                            <h2>{t('lecture_viewer.original_text')} ({originalText.length} символов)</h2>
                            {isLiveMode && (
                                <div style={{
                                    fontSize: '12px',
                                    color: '#16a34a',
                                    marginTop: '4px',
                                    fontWeight: '500'
                                }}>
                                    {wsConnected ? 'Обновляется в реальном времени' : 'Ожидание подключения...'}
                                </div>
                            )}
                        </div>

                        <div className={commonStyles.ItemLecture}>
                            <div className={commonStyles.ItemLectureButtons}>
                                <button
                                    className={commonStyles.textButton}
                                    title={t('speech.synthesize')}
                                    onClick={() => speakText(originalText, 'ru')}
                                    disabled={!originalText}
                                >
                                    {t('speech.synthesize')}
                                </button>
                                <button
                                    className={commonStyles.textButton}
                                    onClick={() => navigate(`/archive/lecture/${id}/full-lecture`, {
                                        state: {
                                            originalText: lecture.content?.original,
                                            translatedText: lecture.content?.translations[language as keyof typeof lecture.content.translations],
                                            language,
                                            lecture,
                                            fromArchive
                                        }
                                    })}
                                >
                                    {t('lecture_viewer.show_full')}
                                </button>
                            </div>
                            <div className={commonStyles.LectureFullText}>
                                {/* {lecture.content?.original?.substring(0, 500) + '...' || t('lecture_viewer.text_unavailable')} */}
                                {originalText || 'Исходный текст не найден. Возможно, лекция ещё не была обработана или ID сессии неверен.'}
                                {isLiveMode && wsConnected && !originalText && (
                                    <div style={{
                                        color: '#16a34a',
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        padding: '20px'
                                    }}>
                                        🔴 LIVE режим активен<br />
                                        Ожидание текста лекции...
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    <div className={commonStyles.listItemLecture}>
                        <h2>{t('lecture_viewer.translated_text', { language: t(`language.${language}`) })}</h2>
                        {isLiveMode && (
                            <div style={{
                                fontSize: '12px',
                                color: '#16a34a',
                                marginTop: '4px',
                                fontWeight: '500'
                            }}>
                                {wsConnected ? 'Обновляется в реальном времени' : 'Ожидание подключения...'}
                            </div>
                        )}

                        <div className={commonStyles.ItemLecture}>
                            <div className={commonStyles.LectureFullText}>
                                {/* {lecture.content?.translations[language as keyof typeof lecture.content.translations]?.substring(0, 500) + '...' || t('lecture_viewer.translation_unavailable')} */}
                                {translatedTexts[language] ||
                                    (language === 'en' ? 'Translation not available. The lecture may not have been processed yet.' :
                                        language === 'fr' ? 'Traduction non disponible. La conférence n\'a peut-être pas encore été traitée.' :
                                            '翻译不可用。讲座可能尚未处理。')}
                                {isLiveMode && wsConnected && !translatedTexts[language] && (
                                    <div style={{
                                        color: '#16a34a',
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        padding: '20px'
                                    }}>
                                        🔴 LIVE режим активен<br />
                                        Ожидание переводов...
                                    </div>
                                )}
                            </div>
                            <div className={commonStyles.ItemLectureButtons}>
                                <button
                                    className={commonStyles.textButton}
                                    onClick={() => lecture.content?.translations[language as keyof typeof lecture.content.translations] &&
                                        speakText(lecture.content.translations[language as keyof typeof lecture.content.translations], language)}
                                    title={t('speech.synthesize')}
                                >
                                    {t('speech.synthesize')}
                                </button>
                                <button
                                    className={commonStyles.textButton}
                                    onClick={() => navigate(`/archive/lecture/${lecture.id}/full-lecture`, {
                                        state: {
                                            originalText: lecture.content?.original,
                                            translatedText: lecture.content?.translations[language as keyof typeof lecture.content.translations],
                                            language,
                                            lecture,
                                            fromArchive
                                        }
                                    })}
                                >
                                    {t('lecture_viewer.show_full')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🆕 ДОБАВЛЕНО: Live лента сообщений (как в listener.py) */}
                {/* {isLiveMode && liveMessages.length > 0 && (
                    <div className={commonStyles.infoCardLecture}>
                        <h2>📡 Live лента сообщений</h2>
                        <div style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            padding: '12px',
                            backgroundColor: '#f8fafc'
                        }}>
                            {liveMessages.slice(-15).reverse().map((msg, index) => {
                                const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ru-RU') : 'Неизвестно';
                                const typeIcon =
                                    msg.type === 'transcription' ? '🗣️' :
                                        msg.type === 'processed' ? '✏️' :
                                            msg.type === 'translated' ? '🌍' :
                                                msg.type === 'error' ? '❌' :
                                                    '📨';

                                const typeText =
                                    msg.type === 'transcription' ? 'Распознано' :
                                        msg.type === 'processed' ? 'Обработано' :
                                            msg.type === 'translated' ? 'Переведено' :
                                                msg.type === 'error' ? 'Ошибка' :
                                                    msg.type;

                                const content = msg.text || msg.processed_text || msg.translation || msg.message || 'Нет содержимого';

                                return (
                                    <div key={msg.id || index} style={{
                                        padding: '8px',
                                        borderBottom: index < liveMessages.slice(-15).length - 1 ? '1px solid #e2e8f0' : 'none',
                                        fontSize: '14px'
                                    }}>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#666',
                                            marginBottom: '4px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span>{typeIcon} {typeText}</span>
                                            <span>{timeStr}</span>
                                        </div>
                                        <div style={{
                                            color: msg.type === 'error' ? '#dc2626' : '#374151'
                                        }}>
                                            {content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#6b7280',
                            textAlign: 'center'
                        }}>
                            Показаны последние 15 сообщений из {liveMessages.length}
                        </div>
                    </div>
                )} */}

                {/* 🆕 ДОБАВЛЕНО: Подробная статистика */}
                {/* {sessionData && (
                    <div className={commonStyles.infoCardLecture} style={{
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bae6fd'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', color: '#0369a1' }}>📊 Статистика обработки</h3>
                        <div style={{ fontSize: '14px', color: '#0369a1' }}>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                                <div>• Транскрипций: {sessionData.total_transcriptions || 0}</div>
                                <div>• Обработанных текстов: {sessionData.total_processed || 0}</div>
                                <div>• Статус сессии: {sessionData.status || 'неизвестно'}</div>
                                <div>• Исходный текст: {originalText.length} символов</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                                <div>• Английский перевод: {translatedTexts.en?.length || 0} символов</div>
                                <div>• Французский перевод: {translatedTexts.fr?.length || 0} символов</div>
                                <div>• Китайский перевод: {translatedTexts.zh?.length || 0} символов</div>
                            </div>
                            {isLiveMode && (
                                <div style={{
                                    backgroundColor: '#ecfdf5',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    marginTop: '8px'
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#16a34a' }}>🔴 LIVE статистика:</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px' }}>
                                        <div>• WebSocket: {wsConnected ? '✅ Подключен' : '❌ Отключен'}</div>
                                        <div>• Live сообщений: {liveMessages.length}</div>
                                        <div>• Обработанных фрагментов: {processedTexts.length}</div>
                                        <div>• Переводов: {[translations.en, translations.fr, translations.zh].filter(t => t?.length > 0).length}</div>
                                    </div>
                                    {wsConnected && (
                                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#059669' }}>
                                            ✅ Текст обновляется автоматически при поступлении новых данных
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default LectureViewer;