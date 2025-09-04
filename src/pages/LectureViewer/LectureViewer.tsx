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
    // При добовлении нового текста прокрутка вниз
    const originalTextContainerRef = useRef<HTMLDivElement>(null);
    const translatedTextContainerRef = useRef<HTMLDivElement>(null);
    // В начале компонента добавьте новое состояние
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [isUserScrolled, setIsUserScrolled] = useState(false);

    const [originalText, setOriginalText] = useState('');
    const [historyText, setHistoryText] = useState(''); // Отдельное состояние для истории

    type Translations = {
        en: string;
        fr: string;
        zh: string;
    };

    const [translations, setTranslations] = useState<Translations>({
        en: '',
        fr: '',
        zh: ''
    });

    const [historyTranslations, setHistoryTranslations] = useState<Translations>({
        en: '',
        fr: '',
        zh: ''
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

    const removeDuplicateParts = (prevText: string, newText: string) => {
        if (!prevText) return newText;

        const prevWords = prevText.split(/\s+/);
        const newWords = newText.split(/\s+/);

        // Ищем максимальное совпадение в конце предыдущего текста
        let overlap = 0;
        for (let i = 1; i <= Math.min(prevWords.length, newWords.length); i++) {
            const prevEnd = prevWords.slice(-i).join(' ');
            const newStart = newWords.slice(0, i).join(' ');
            if (prevEnd === newStart) {
                overlap = i;
            }
        }

        return overlap > 0
            ? prevText + ' ' + newWords.slice(overlap).join(' ')
            : prevText + ' ' + newText;
    };

    const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
        console.log('📨 Обработка WebSocket сообщения:', data.type, data);

        // const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;
        const messageKey = `${data.type}_${data.timestamp}_${(data.processed_text || data.translation || '').slice(0, 50)}`;

        if (lastMessageIdRef.current.has(messageKey)) {
            console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
            return;
        }

        lastMessageIdRef.current.add(messageKey);
        setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

        // Обработка текста
        // if ((data.type === 'processed' && data.processed_text) ||
        //     (data.type === 'transcription' && data.text)) {
        if (data.type === 'processed' && data.processed_text) {

            // const newText = (data.processed_text || data.text || '')
            let newText = (data.processed_text || '')
                .replace(/\[.*?\]/g, '')
                .trim();

            if (data.processed_text.includes("    ")) {
                newText = "    " + newText;
            }

            if (data.processed_text.includes("\n\n    ")) {
                newText = "\n\n" + newText;
            }

            if (newText) {
                setOriginalText(prev => {
                    if (!prev) return newText;

                    const prevWords = prev.split(/\s+/);
                    const newWords = newText.split(/\s+/);

                    // Ищем совпадение в конце предыдущего текста
                    let overlap = 0;
                    for (let i = 1; i <= Math.min(prevWords.length, newWords.length); i++) {
                        const prevEnd = prevWords.slice(-i).join(' ');
                        const newStart = newWords.slice(0, i).join(' ');
                        if (prevEnd === newStart) overlap = i;
                    }

                    return overlap > 0
                        ? `${prev} ${newWords.slice(overlap).join(' ')}`
                        : `${prev} ${newText}`;
                });
            }
        }

        // Обработка переводов
        if (data.translation) {
            const lang = data.type === 'translated_french' ? 'fr' :
                data.type === 'translated_chinese' ? 'zh' : 'en';

            let cleanTranslation = data.translation.replace(/\[.*?\]/g, '').trim();

            // Полная обработка форматирования как в оригинале
            if (data.translation.includes("    ")) {
                cleanTranslation = "    " + cleanTranslation;
            }
            if (data.translation.includes("\n\n    ")) {
                cleanTranslation = "\n\n" + cleanTranslation;
            }

            setTranslations(prev => ({
                ...prev,
                [lang]: removeDuplicateParts(prev[lang], cleanTranslation)
            }));
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

    const loadLectureData = useCallback(async () => {
        if (!id) {
            setError('ID лекции не указан');
            setIsLoading(false);
            return;
        }

        try {
            setError('');
            setIsLoading(true);

            const combineTexts = (texts: string[] | undefined) => {
                if (!texts) return '';
                return texts
                    .filter(t => t && t.trim() !== '' && t.trim() !== '[ ]')
                    // .map(t => t.trim().replace(/\[.*?\]/g, ''))  // Добавляем замену скобок
                    .map(t => {
                        let cleanedText = t.trim().replace(/\[.*?\]/g, '');

                        // Добавляем обработку форматирования как в WebSocket
                        if (t.includes("    ")) {
                            cleanedText = "    " + cleanedText;
                        }
                        if (t.includes("\n\n    ")) {
                            cleanedText = "\n\n" + cleanedText;
                        }

                        return cleanedText;
                    })
                    .join(' ');
            };

            // 1. Загружаем историю (даже если она пустая)
            let historyData: SessionData | null = null;
            try {
                historyData = await apiService.getSessionHistory(id);
                console.log('История загружена:', historyData);

                // Обрабатываем историю отдельно
                const historyText = combineTexts(historyData?.transcripts);
                setHistoryText(historyText);
                setOriginalText(historyText); // Инициализируем originalText историей

                // перевод
                // setHistoryTranslations({
                //     en: combineTexts(historyData?.translations_multi?.en),
                //     fr: combineTexts(historyData?.translations_multi?.fr),
                //     zh: combineTexts(historyData?.translations_multi?.zh)
                // });

                setHistoryTranslations({
                    en: combineTexts(historyData?.translations_multi?.en?.map(t => {
                        let formatted = t.trim().replace(/\[.*?\]/g, '');
                        if (t.includes("    ")) formatted = "    " + formatted;
                        if (t.includes("\n\n    ")) formatted = "\n\n" + formatted;
                        return formatted;
                    })),
                    fr: combineTexts(historyData?.translations_multi?.fr?.map(t => {
                        let formatted = t.trim().replace(/\[.*?\]/g, '');
                        if (t.includes("    ")) formatted = "    " + formatted;
                        if (t.includes("\n\n    ")) formatted = "\n\n" + formatted;
                        return formatted;
                    })),
                    zh: combineTexts(historyData?.translations_multi?.zh?.map(t => {
                        let formatted = t.trim().replace(/\[.*?\]/g, '');
                        if (t.includes("    ")) formatted = "    " + formatted;
                        if (t.includes("\n\n    ")) formatted = "\n\n" + formatted;
                        return formatted;
                    }))
                });

                // Инициализируем текущие переводы историей
                setTranslations({
                    en: combineTexts(historyData?.translations_multi?.en),
                    fr: combineTexts(historyData?.translations_multi?.fr),
                    zh: combineTexts(historyData?.translations_multi?.zh)
                });

                setHistoryLoaded(true);

            } catch (historyError) {
                console.warn('Не удалось загрузить историю:', historyError);
                setHistoryText(''); // Явно устанавливаем пустую историю
                setHistoryLoaded(true);
            }

            // 2. Загружаем текущее состояние сессии
            const sessionInfo = await apiService.getSession(id);
            if (!sessionInfo) {
                setError('Сессия не найдена');
                setIsLoading(false);
                return;
            }
            if (sessionInfo?.translations_multi) {
                setTranslations(prev => ({
                    en: prev.en + ' ' + combineTexts(sessionInfo.translations_multi?.en),
                    fr: prev.fr + ' ' + combineTexts(sessionInfo.translations_multi?.fr),
                    zh: prev.zh + ' ' + combineTexts(sessionInfo.translations_multi?.zh)
                }));
            }

            // Добавляем текущие данные к истории (если есть)
            const currentText = combineTexts(sessionInfo.transcripts);
            if (currentText) {
                setOriginalText(prev =>
                    prev ? `${prev} ${currentText}` : currentText
                );
            }

            // Обновляем остальные данные лекции
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
            setSessionData(sessionInfo);

        } catch (err) {
            console.error('Ошибка загрузки:', err);
            setError(`Ошибка загрузки`);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

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

    useEffect(() => {
        loadLectureData();
    }, [loadLectureData]); // Теперь loadLectureData мемоизирована и стабильна

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

    // // Экспорт лекции в pdf, поддерживаются все языки
    const exportLectureAsPDF = async (
        lecture: { title: string; lecturer: string; start: string; duration: string },
        originalText: string,
        translations: Record<string, string>,
        language: string,
        id: string
    ) => {
        try {
            const { jsPDF } = await import('jspdf');

            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            // Упрощенная регистрация шрифтов
            const registerFont = async (fontName: string, fontPath: string) => {
                try {
                    const response = await fetch(fontPath);
                    if (!response.ok) throw new Error(`Font load failed: ${response.status}`);
                    const fontData = await response.arrayBuffer();
                    const fontString = Array.from(new Uint8Array(fontData))
                        .map(byte => String.fromCharCode(byte))
                        .join('');
                    const vfsName = `${fontName}-regular.ttf`;
                    doc.addFileToVFS(vfsName, fontString);
                    doc.addFont(vfsName, fontName, 'normal');
                    return true;
                } catch (e) {
                    console.error(`Error loading font ${fontName}:`, e);
                    return false;
                }
            };

            const robotoLoaded = await registerFont('Roboto', '/fonts/Roboto-Regular.ttf');
            if (robotoLoaded) doc.setFont('Roboto', 'normal');

            let notoSansLoaded = false;
            if (language === 'zh') {
                notoSansLoaded = await registerFont('NotoSansSC', '/fonts/NotoSansSC-Regular.ttf');
            }

            // Основные параметры
            const margin = 15;
            const pageWidth = 210;
            const pageHeight = 297;
            const maxWidth = pageWidth - 2 * margin;
            let y = 20;
            const lineHeight = 5;

            // Упрощенная функция для добавления текста с переносами страниц
            const addTextWithPageBreak = (text: string, fontSize: number, isBold = false) => {
                doc.setFontSize(fontSize);
                if (isBold) doc.setFont(robotoLoaded ? 'Roboto' : 'helvetica', 'bold');

                const lines = doc.splitTextToSize(text, maxWidth);

                for (let i = 0; i < lines.length; i++) {
                    // Проверяем, нужно ли добавить новую страницу
                    if (y + lineHeight > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }

                    // Добавляем строку текста
                    doc.text(lines[i], margin, y);
                    y += lineHeight;
                }

                // Добавляем небольшой отступ после блока текста
                y += 2;
            };

            // Заголовок и метаданные
            doc.setFontSize(16);
            doc.text(`Лекция: ${lecture.title}`, margin, y);
            y += 12;

            doc.setFontSize(13);
            doc.text(`Лектор: ${lecture.lecturer}`, margin, y);
            y += 6;
            doc.text(`Дата: ${lecture.start}`, margin, y);
            y += 6;
            doc.text(`Длительность: ${lecture.duration}`, margin, y);
            y += 12;

            // Исходный текст
            doc.setFontSize(13);
            doc.text('Исходный текст:', margin, y);
            y += 8;

            addTextWithPageBreak(originalText, 10);
            y += 8;

            // Перевод
            doc.setFontSize(13);
            // Проверяем, нужно ли добавить новую страницу для заголовка перевода
            if (y + 10 > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(`Перевод (${language.toUpperCase()}):`, margin, y);
            y += 8;

            const translatedText = translations[language] || 'Перевод недоступен';

            // Устанавливаем специальный шрифт для китайского если нужно
            if (language === 'zh' && notoSansLoaded) {
                doc.setFont('NotoSansSC', 'normal');
            }

            addTextWithPageBreak(translatedText, 10);

            // Возвращаем основной шрифт
            if (robotoLoaded) doc.setFont('Roboto', 'normal');

            // Футер на последней странице
            doc.setFontSize(9);
            doc.text(`ID сессии: ${id}`, margin, pageHeight - 10);

            // Генерация имени файла
            const filename = `lecture_${lecture.lecturer.replace(/\s+/g, '_')}_${id.slice(-8)}.pdf`;

            doc.save(filename);

        } catch (error) {
            console.error('Export failed:', error);
            alert(`Ошибка при экспорте PDF: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
    };

    // Эффект для автоматической прокрутки оригинального текста
    useEffect(() => {
        const container = originalTextContainerRef.current;
        if (!container || isUserScrolled) return; // Не прокручиваем, если пользователь уже сделал это

        if (originalText !== historyText || !historyLoaded) {
            setTimeout(() => {
                // Проверяем еще раз, не прокрутил ли пользователь за время таймаута
                if (!isUserScrolled) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 100);
        }
    }, [originalText, historyText, historyLoaded, isUserScrolled]); // Добавили isUserScrolled в зависимости

    // Эффект для автоматической прокрутки переведенного текста
    useEffect(() => {
        const container = translatedTextContainerRef.current;
        if (!container || isUserScrolled || !historyLoaded) return; // Добавили проверку !historyLoaded

        if (translations[language]) {
            setTimeout(() => {
                if (!isUserScrolled) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 100);
        }
    }, [translations, language, isUserScrolled, historyLoaded]); // Добавили historyLoaded в зависимости

    // Обработчик события прокрутки пользователя
    useEffect(() => {
        const originalContainer = originalTextContainerRef.current;
        const translatedContainer = translatedTextContainerRef.current;

        const handleScroll = () => {
            // Если пользователь прокручивает вручную, устанавливаем флаг
            // Можно добавить небольшую погрешность (e.g., 10px), чтобы не считать за пользовательское действие небольшие расхождения
            if (originalContainer) {
                const isAtBottom = originalContainer.scrollHeight - originalContainer.scrollTop <= originalContainer.clientHeight + 10;
                setIsUserScrolled(!isAtBottom);
            }
        };

        originalContainer?.addEventListener('scroll', handleScroll);
        translatedContainer?.addEventListener('scroll', handleScroll); // Следим за прокруткой в обоих контейнерах

        return () => {
            originalContainer?.removeEventListener('scroll', handleScroll);
            translatedContainer?.removeEventListener('scroll', handleScroll);
        };
    }, []);





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
                                {wsConnected ? '🟢 LIVE' : ' Подключение...'}
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
                    <div
                        className={commonStyles.listItemLecture}
                        style={{ width: '100%' }}
                    >
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
                                {fromArchive ? `${t('lecture_viewer.status_title.archive_lecture')}` :
                                    isLiveMode ? (wsConnected ? `${t('lecture_viewer.status_title.active_lecture')}` : `${t('lecture_viewer.status_title.active_connect')}`) :
                                        `${t('lecture_viewer.status_title.active')}`}
                            </span>
                        </div>
                    </div>

                    {/* <div className={commonStyles.listItemLecture}>
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
                                onClick={() =>
                                    exportLectureAsPDF(lecture, originalText, translations, language, lecture.id)
                                }
                            >
                                {t('export')}
                            </button>
                        </div>
                    </div> */}
                </div>

                <div className={commonStyles.infoCardLecture}>
                    <div className={commonStyles.listItemLecture}>
                        <div className={commonStyles.textHeaderContainer}>
                            <h2>{t('lecture_viewer.original_text')}</h2>
                            {isLiveMode && (
                                <div style={{
                                    fontSize: '12px',
                                    color: '#16a34a',
                                    marginTop: '59px',
                                    fontWeight: '500'
                                }}>
                                    {wsConnected ? `${t('lecture_viewer.ws_connected.ok')}` : `${t('lecture_viewer.ws_connected.err')}`}
                                </div>
                            )}
                        </div>

                        <div className={commonStyles.ItemLecture}>
                            <div
                                ref={originalTextContainerRef}
                                className={commonStyles.LectureFullText}
                                style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                            >
                                {/* Показываем историю (даже если пустую) */}
                                {historyText !== undefined && (
                                    <div className="history-text">
                                        {/* {historyText || 'История трансляции отсутствует'} */}
                                        {historyText}
                                    </div>
                                )}

                                {/* Показываем живой текст (если есть) */}
                                {originalText !== historyText && (
                                    <div className="live-text">
                                        {originalText.replace(historyText, '').trim()}
                                    </div>
                                )}

                                {/* Сообщение если вообще нет текста */}
                                {!historyText && !originalText && (
                                    <div className="no-text-message">
                                        Текст пока недоступен
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={commonStyles.listItemLecture}>
                        {/* <h2>{t('lecture_viewer.translated_text', { language: t(`language.${language}`) })}</h2> */}
                        <h2>
                            {language === 'zh' ? '翻译文本' :
                                language === 'fr' ? 'Texte traduit' :
                                    'Translated Text'} {t(`language.${language}`)}
                        </h2>

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

                        {isLiveMode && (
                            <div style={{
                                fontSize: '12px',
                                color: '#16a34a',
                                marginTop: '4px',
                                fontWeight: '500'
                            }}>
                                {/* {wsConnected ? `${t('lecture_viewer.ws_connected.ok')}` : `${t('lecture_viewer.ws_connected.err')}`} */}
                                {wsConnected ?
                                    (language === 'fr' ? 'Mise à jour en temps réel' :
                                        language === 'zh' ? '正在实时更新' :
                                            'Updating in real time') :
                                    (language === 'fr' ? 'En attente de connexion' :
                                        language === 'zh' ? '正在等待连接' :
                                            'Waiting for connection')
                                }
                            </div>
                        )}

                        <div className={commonStyles.ItemLecture}>
                            <div
                                ref={translatedTextContainerRef}
                                className={commonStyles.LectureFullText}
                                style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                            >
                                {/* История перевода */}
                                {historyTranslations[language] && (
                                    <div className="history-translation">
                                        {historyTranslations[language]}
                                    </div>
                                )}

                                {/* Live перевод */}
                                {translations[language] !== historyTranslations[language] && (
                                    <div className="live-translation">
                                        {translations[language].replace(historyTranslations[language], '').trim()}
                                    </div>
                                )}

                                {/* Нет перевода */}
                                {!historyTranslations[language] && !translations[language] && (
                                    <div className="no-translation">
                                        {language === 'en' ? 'Translation not available yet' :
                                            language === 'fr' ? 'Traduction non disponible' :
                                                '翻译不可用'}
                                    </div>
                                )}
                            </div>

                            {/* <div className={commonStyles.ItemLectureButtons}>
                                <button
                                    className={`${commonStyles.textButton} ${commonStyles.synthesizeButton}`}
                                    onClick={() => translations[language] && speakText(translations[language], language)}
                                    title={t('speech.synthesize')}
                                    disabled={!translations[language]}
                                >
                                    {t('speech.synthesize')}
                                </button>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectureViewer;