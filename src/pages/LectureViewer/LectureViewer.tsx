import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
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

interface ProcessedText {
    processed_text?: string;
    text?: string;
    english_translation?: string;
    translation?: string;
}

// interface WebSocketMessage {
//     language?: string;
//     type: string;
//     timestamp?: string;
//     text?: string;
//     processed_text?: string;
//     translation?: string;
//     message?: string;
//     id?: string;
// }

interface WebSocketMessage {
    language?: string;
    type: string;
    timestamp?: string;
    text?: string;
    processed_text?: string;
    translation?: string;
    message?: string;
    id?: string;
    confidence?: number;
    original_text?: string;
    _server_id?: string;
    _timestamp?: string;
    session_id?: string;
}

const LectureViewer = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const userRole = getRoleFromStorage();
    const location1 = useLocation();
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

    const [translations, setTranslations] = useState<Translations>({
        en: '',
        fr: '',
        zh: '',
    });

    // Состояние для реального времени
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [liveMessages, setLiveMessages] = useState<WebSocketMessage[]>([]);
    const [processedTexts, setProcessedTexts] = useState<string[]>([]);

    // WebSocket для реального времени
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastMessageIdRef = useRef<Set<string>>(new Set());

    // Определяем, откуда пришел пользователь
    useEffect(() => {
        if (location1.state?.fromArchive || location1.pathname.includes('/archive')) {
            setFromArchive(true);
            setIsLiveMode(false);
        } else if (location1.pathname.includes('/active')) {
            setFromArchive(false);
            setIsLiveMode(true);
        }
    }, [location1]);

    const connectWebSocket = useCallback(async () => {
        if (!isLiveMode || !id) return;

        try {
            console.log(`Подключение WebSocket для лекции: ${id}`);

            const wsUrl = `wss://audio.minofagriculture.ru/ws/monitor`;
            console.log(`📡 WebSocket URL: ${wsUrl}`);

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
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectTimeoutRef.current = null;
                        connectWebSocket();
                    }, 3000);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ Ошибка WebSocket:', error);
                setWsConnected(false);
                setError('Ошибка WebSocket подключения');

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

            if (isLiveMode && !reconnectTimeoutRef.current) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectTimeoutRef.current = null;
                    connectWebSocket();
                }, 3000);
            }
        }
    }, [id, isLiveMode]);

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

        setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

        if (data.type === 'processed' && data.processed_text) {
            const newText = data.processed_text.trim();
            if (newText) {
                setProcessedTexts(prev => {
                    if (!prev.includes(newText)) {
                        const updated = [...prev, newText];
                        const fullText = updated.join(' ');
                        setOriginalText(fullText);
                        return updated;
                    }
                    return prev;
                });
            }
        }

        // Обработка переведенных сообщений
        if (data.translation) {
            const newTranslation = data.translation.trim();
            if (newTranslation) {
                setTranslations(prev => {
                    // Определяем язык перевода
                    let lang: keyof Translations = 'en'; // по умолчанию

                    // Обрабатываем только определенные типы сообщений
                    if (data.type === 'translated_french') {
                        lang = 'fr';
                    } else if (data.type === 'translated_chinese') {
                        lang = 'zh';
                    } else if (data.type === 'translated_english') {
                        // Для общего типа 'translated' используем указанный язык
                        // lang = data.language as keyof Translations;
                        lang = 'en';
                    } else {
                        // Игнорируем другие типы сообщений с переводами
                        return prev;
                    }

                    // Проверяем, не добавляли ли мы уже этот перевод
                    if (!prev[lang].includes(newTranslation)) {
                        return {
                            ...prev,
                            [lang]: (prev[lang] ? prev[lang] + ' ' : '') + newTranslation
                        };
                    }
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

            const sessionInfo = await apiService.getSession(id);
            if (!sessionInfo) {
                setError('Сессия не найдена');
                setIsLoading(false);
                return;
            }

            const originalText = sessionInfo.transcripts?.join(' ') || '';
            const translations = {
                en: sessionInfo.translations_multi?.en?.join(' ') || '',
                fr: sessionInfo.translations_multi?.fr?.join(' ') || '',
                zh: sessionInfo.translations_multi?.zh?.join(' ') || '',
            };

            const lectureData = {
                id: id,
                title: sessionInfo.title || `Лекция ${id.slice(0, 8)}`,
                start: formatTime(sessionInfo.start_time),
                end: formatTime(sessionInfo.end_time) || 'Неизвестно',
                duration: calculateDuration(sessionInfo.start_time, sessionInfo.end_time),
                lecturer: sessionInfo.lecturer || 'Неизвестный лектор',
                location: sessionInfo.location || 'Не указано',
                status: sessionInfo.status || '-',
                content: {
                    original: originalText,
                    translations: translations
                }
            };

            setLecture(lectureData);
            setOriginalText(originalText);
            setTranslations(translations);
            setSessionData(sessionInfo);

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

            return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;
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
                minute: '2-digit'
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
        if (!text?.trim()) {
            alert('Нет текста для озвучивания');
            return;
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = {
                'en': 'en-US',
                'fr': 'fr-FR',
                'zh': 'zh-CN',
                'ru': 'ru-RU'
            }[lang] || 'en-US';

            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            window.speechSynthesis.speak(utterance);
        } else {
            alert('Браузер не поддерживает синтез речи');
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
            ${translations[language] || 'Перевод недоступен'}

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
                            <div className={commonStyles.loader}></div>
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

                <div className={commonStyles.infoCardLecture}>
                    <div className={commonStyles.listItemLecture}>
                        <h2>{t('lecture_viewer.details')}</h2>
                        <div className={commonStyles.statusItem}>
                            <span>{t('lecture_viewer.id')}:</span>
                            <span>{id}</span>
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
                        <div className={commonStyles.statusItem}>
                            <span>{t('lecture_viewer.location')}:</span>
                            <span>{lecture.location}</span>
                        </div>
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
                                {t('export')}
                            </button>
                            {isLiveMode && (
                                <button
                                    className={commonStyles.textButton}
                                    onClick={() => loadLectureData()}
                                >
                                    {t('refresh')}
                                </button>
                            )}
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
                            <div className={commonStyles.LectureFullText}>
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
                                {translations[language] ||
                                    (language === 'en' ? 'Translation not available yet' :
                                        language === 'fr' ? 'Traduction non disponible' :
                                            '翻译不可用')}
                                {isLiveMode && wsConnected && !translations[language] && (
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
                                    onClick={() => translations[language] && speakText(translations[language], language)}
                                    title={t('speech.synthesize')}
                                    disabled={!translations[language]}
                                >
                                    {t('speech.synthesize')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectureViewer;