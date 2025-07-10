// import { useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useLocation, useNavigate } from 'react-router-dom';
// import commonStyles from '../commonStyles.module.css';
// import Header from '../../components/Header/Header';
// import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
// import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
// import LectureData from '../../types/Lecture';

// const RecordingLecturePage = () => {
//     const { t } = useTranslation();
//     const { state } = useLocation();
//     const { lecture: initialLecture, isPreview = true } = state as { lecture: LectureData; isPreview?: boolean };

//     const [lecture, setLecture] = useState<LectureData>(initialLecture);
//     const [isRecording, setIsRecording] = useState(!isPreview);
//     const [isPaused, setIsPaused] = useState(false);
//     const [isFinished, setIsFinished] = useState(false);
//     const [originalText, setOriginalText] = useState('');
//     const [translatedText, setTranslatedText] = useState('');
//     const [language, setLanguage] = useState('en');
//     const [showStopModal, setShowStopModal] = useState(false);
//     const [showPauseModal, setShowPauseModal] = useState(false);
//     const [showFullText, setShowFullText] = useState(true);
//     const userRole = getRoleFromStorage();
//     const navigate = useNavigate();
//     const [isPreviewMode, setIsPreviewMode] = useState(isPreview);

//     if (!state?.lecture) {
//         navigate('/recorder', { replace: true });
//         return null;
//     }

//     const handleStartLecture = () => {
//         setIsPreviewMode(false);
//         setIsRecording(true);
//         setOriginalText(t('recording.example_text.original'));
//         setTranslatedText(t('recording.example_text.translated'));
//     };

//     const confirmStopLecture = () => {
//         setIsFinished(true);
//         setIsRecording(false);
//         setIsPaused(false);
//         setShowStopModal(false);
//     };

//     const handleTogglePause = () => {
//         if (isPaused) {
//             setIsPaused(false);
//             setShowPauseModal(false);
//         } else {
//             setShowPauseModal(true);
//         }
//     };

//     const confirmPauseLecture = () => {
//         setIsPaused(true);
//         setShowPauseModal(false);
//     };

//     const speakText = (text: string, lang: string) => {
//         if ('speechSynthesis' in window) {
//             const utterance = new SpeechSynthesisUtterance(text);
//             utterance.lang = {
//                 'en': 'en-US',
//                 'fr': 'fr-FR',
//                 'zh': 'zh-CN',
//                 'ru': 'ru-RU'
//             }[lang] || 'en-US';

//             window.speechSynthesis.speak(utterance);
//         } else {
//             alert(t('speech.not_supported'));
//         }
//     };

//     const getStatusLabel = () => {
//         if (isPreviewMode) return t('recording.status.preview');
//         if (isFinished) return t('recording.status.finished');
//         if (isPaused) return t('recording.status.paused');
//         return t('recording.status.recording');
//     };

//     const getBreadcrumbs = () => [
//         {
//             label: getHomeLabel(userRole),
//             path: getHomePath(userRole),
//             translationKey: `roles.${userRole}.home`
//         },
//         {
//             label: t('recording.breadcrumb'),
//             path: '/lector/recorder',
//             translationKey: 'recording.breadcrumb'
//         },
//         {
//             label: getStatusLabel(),
//             path: ''
//         }
//     ];

//     return (
//         <div className={commonStyles.appContainer}>
//             <div className={commonStyles.mainContent}>
//                 <Header />
//                 <Breadcrumbs items={getBreadcrumbs()} />

//                 <h1 className={commonStyles.sectionHeader}>
//                     {t('recording.title', { title: lecture.title })}
//                 </h1>

//                 {isPreviewMode ? (
//                     <div className={commonStyles.infoCard}>
//                         <h2 className={commonStyles.subHeader}>
//                             {t('recording.preview.header')}
//                         </h2>
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.title')}:</span>
//                             <span>{lecture.title}</span>
//                         </div>
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.lecturer')}:</span>
//                             <span>{lecture.lecturer}</span>
//                         </div>
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.start')}:</span>
//                             <span>{lecture.startTime ? new Date(lecture.startTime).toLocaleString() : t('common.not_specified')}</span>
//                         </div>
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.location')}:</span>
//                             <span>{lecture.location}</span>
//                         </div>

//                         <div style={{ marginTop: '30px', textAlign: 'center' }}>
//                             <button
//                                 onClick={handleStartLecture}
//                                 className={commonStyles.primaryButton}
//                                 style={{ padding: '10px 30px', fontSize: '18px' }}
//                             >
//                                 {t('recording.start_button')}
//                             </button>
//                         </div>
//                     </div>
//                 ) : (
//                     <>
//                         <div className={commonStyles.infoCard}>
//                             <h2 className={commonStyles.subHeader}>
//                                 {getStatusLabel()}
//                             </h2>
//                             <div className={commonStyles.statusItem}>
//                                 <span>{t('recording.lecture.title')}:</span>
//                                 <span>{lecture.title}</span>
//                             </div>
//                             <div className={commonStyles.statusItem}>
//                                 <span>{t('recording.lecture.lecturer')}:</span>
//                                 <span>{lecture.lecturer}</span>
//                             </div>
//                             <div className={commonStyles.statusItem}>
//                                 <span>{t('recording.lecture.start')}:</span>
//                                 <span>{lecture.startTime ? new Date(lecture.startTime).toLocaleString() : t('common.not_specified')}</span>
//                             </div>
//                             <div className={commonStyles.statusItem}>
//                                 <span>{t('recording.lecture.location')}:</span>
//                                 <span>{lecture.location}</span>
//                             </div>
//                             <div className={commonStyles.buttonGroup} style={{ marginTop: '20px' }}>
//                                 {!isFinished ? (
//                                     <>
//                                         <button
//                                             onClick={handleTogglePause}
//                                             className={commonStyles.refreshButton}
//                                             disabled={isFinished}
//                                         >
//                                             {isPaused ? t('recording.resume_button') : t('recording.pause_button')}
//                                         </button>
//                                         <button
//                                             onClick={() => setShowStopModal(true)}
//                                             className={commonStyles.secondaryButton}
//                                         >
//                                             {t('recording.stop_button')}
//                                         </button>
//                                     </>
//                                 ) : (
//                                     <button
//                                         onClick={() => navigate('/archive')}
//                                         className={commonStyles.primaryButton}
//                                         style={{ width: '100%' }}
//                                     >
//                                         {t('recording.go_to_archive')}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>

//                         <div className={commonStyles.infoCardLecture}>
//                             <div className={commonStyles.listItemLecture}>
//                                 <div className={commonStyles.textHeaderContainer}>
//                                     <h2>{t('recording.original_text')}</h2>
//                                 </div>
//                                 <div className={commonStyles.ItemLecture}>
//                                     <div className={commonStyles.ItemLectureButtons}>
//                                         <button
//                                             className={commonStyles.textButton}
//                                             onClick={() => navigate(`/archive/lecture/${lecture.id}/full-lecture`, {
//                                                 state: {
//                                                     originalText,
//                                                     translatedText,
//                                                     language,
//                                                     lecture,
//                                                     fromRecording: true
//                                                 }
//                                             })}
//                                         >
//                                             {t('recording.show_full_text')}
//                                         </button>
//                                         {showFullText && (
//                                             <button
//                                                 className={commonStyles.textButton}
//                                                 onClick={() => originalText && speakText(originalText, 'ru')}
//                                                 title={t('speech.synthesize')}
//                                             >
//                                                 {t('speech.synthesize')}
//                                             </button>
//                                         )}
//                                     </div>
//                                     {showFullText && (
//                                         <div className={commonStyles.LectureFullText}>
//                                             {originalText?.substring(0, 500) + '...' || t('recording.text_unavailable')}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className={commonStyles.listItemLecture}>
//                                 <h2>{t('recording.translated_text', {
//                                     language: t(`language.${language}`)
//                                 })}</h2>
//                                 <div className={commonStyles.ItemLecture}>
//                                     {showFullText && (
//                                         <div className={commonStyles.LectureFullText}>
//                                             {translatedText || t('recording.translation_unavailable')}
//                                         </div>
//                                     )}
//                                     <div className={commonStyles.ItemLectureButtons}>
//                                         <button
//                                             className={commonStyles.textButton}
//                                             onClick={() => navigate(`/archive/lecture/${lecture.id}/full-lecture`, {
//                                                 state: {
//                                                     originalText,
//                                                     translatedText,
//                                                     language,
//                                                     lecture,
//                                                     fromRecording: true
//                                                 }
//                                             })}
//                                         >
//                                             {t('recording.show_full_text')}
//                                         </button>
//                                         {showFullText && (
//                                             <button
//                                                 className={commonStyles.textButton}
//                                                 onClick={() => translatedText && speakText(translatedText, language)}
//                                                 title={t('speech.synthesize')}
//                                             >
//                                                 {t('speech.synthesize')}
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </>
//                 )}

//                 {showStopModal && (
//                     <div className={commonStyles.modalOverlay}>
//                         <div className={commonStyles.modal}>
//                             <h3>{t('confirmation.title')}</h3>
//                             <p>{t('recording.stop_confirmation')}</p>
//                             <div className={commonStyles.modalButtons}>
//                                 <button
//                                     onClick={() => setShowStopModal(false)}
//                                     className={commonStyles.cancelModalButton}
//                                 >
//                                     {t('common.cancel')}
//                                 </button>
//                                 <button
//                                     onClick={confirmStopLecture}
//                                     className={commonStyles.okModalButton}
//                                 >
//                                     {t('recording.confirm_stop')}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {showPauseModal && (
//                     <div className={commonStyles.modalOverlay}>
//                         <div className={commonStyles.modal}>
//                             <h3>{t('confirmation.title')}</h3>
//                             <p>{t('recording.pause_confirmation')}</p>
//                             <div className={commonStyles.modalButtons}>
//                                 <button
//                                     onClick={() => setShowPauseModal(false)}
//                                     className={commonStyles.cancelModalButton}
//                                 >
//                                     {t('common.cancel')}
//                                 </button>
//                                 <button
//                                     onClick={confirmPauseLecture}
//                                     className={commonStyles.okModalButton}
//                                 >
//                                     {t('recording.confirm_pause')}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default RecordingLecturePage;


import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, Square, Settings } from 'lucide-react';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
import LectureData from '../../types/Lecture';

interface SessionStats {
    chunksRecorded: number;
    dataTransmitted: number;
    transcriptionReceived: number;
    processingReceived: number;
    translationReceived: number;
}

interface ResultItem {
    text?: string;
    processed_text?: string;
    translated_text?: string;
    timestamp?: string;
    _timestamp?: string;
}

interface Results {
    transcription: ResultItem[];
    processing: ResultItem[];
    translation: ResultItem[];
}

interface RecordingSettings {
    sampleRate: number;
    bufferSize: number;
    channels: number;
    format: string;
}

class AudioWebSocket {
    onOpen(callback: () => void) { }
    onClose(callback: () => void) { }
    onError(callback: (error: Error) => void) { }
    onMessage(type: string, callback: (data: any) => void) { }
    sendAudioChunk(chunk: number[]) { }
    sendSessionStart() { }
    sendSessionEnd() { }
    async connect() { }
    disconnect() { }
}

const RecordingLecturePage = () => {
    const { t } = useTranslation();
    const { state } = useLocation();
    const { lecture: initialLecture, isPreview = true } = state as { lecture: LectureData; isPreview?: boolean };
    const navigate = useNavigate();
    const userRole = getRoleFromStorage();

    // Состояние компонента
    const [lecture, setLecture] = useState<LectureData>(initialLecture);
    const [isRecording, setIsRecording] = useState(!isPreview);
    const [isPaused, setIsPaused] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [showStopModal, setShowStopModal] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [showFullText, setShowFullText] = useState(true);
    const [isPreviewMode, setIsPreviewMode] = useState(isPreview);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [originalText, setOriginalText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [language, setLanguage] = useState('en');

    // Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const webSocketRef = useRef<AudioWebSocket | null>(null);
    const audioBufferRef = useRef<number[][]>([]);
    const isRecordingRef = useRef<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Настройки записи
    const [recordingSettings] = useState<RecordingSettings>({
        sampleRate: 16000,
        bufferSize: 4096,
        channels: 1,
        format: 'pcm16'
    });

    // if (!state?.lecture) {
    //     navigate('/recorder', { replace: true });
    //     return null;
    // }

    // Генерация ID сессии
    const generateSessionId = (): string => {
        return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    };

    // Конвертация Float32 в PCM16
    const float32ToPCM16 = (float32Array: Float32Array): number[] => {
        const pcm16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const sample = Math.max(-1, Math.min(1, float32Array[i]));
            pcm16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        }
        return Array.from(pcm16Array);
    };

    // Отправка PCM данных (вынесен на верхний уровень)
    const sendPCMData = useCallback(() => {
        if (audioBufferRef.current.length === 0 || !webSocketRef.current) return;

        const currentBuffer = [...audioBufferRef.current];
        audioBufferRef.current = [];

        currentBuffer.forEach((pcmChunk) => {
            webSocketRef.current?.sendAudioChunk(pcmChunk);
        });
    }, []);

    // Подключение WebSocket
    const connectWebSocket = async (): Promise<AudioWebSocket> => {
        try {
            setError(null);
            const ws = new AudioWebSocket();
            webSocketRef.current = ws;

            ws.onOpen(() => {
                console.log('✅ Audio WebSocket connected');
                ws.sendSessionStart();
            });

            ws.onClose(() => {
                console.log('❌ Audio WebSocket disconnected');
            });

            ws.onError((error: Error) => {
                console.error('WebSocket error:', error);
                setError(t('recorder.ws_error'));
            });

            ws.onMessage('transcription', (data: ResultItem) => {
                if (data.text) {
                    setOriginalText(prev => prev + ' ' + data.text);
                }
            });

            ws.onMessage('translation', (data: ResultItem) => {
                if (data.translated_text) {
                    setTranslatedText(prev => prev + ' ' + data.translated_text);
                }
            });

            await ws.connect();
            return ws;
        } catch (error: any) {
            console.error('Ошибка подключения WebSocket:', error);
            setError(t('recorder.ws_connect_error'));
            throw error;
        }
    };

    // Начало записи
    const startRecording = async (): Promise<void> => {
        try {
            setError(null);
            await connectWebSocket();

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: recordingSettings.sampleRate,
                    channelCount: recordingSettings.channels,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            streamRef.current = stream;

            const audioContext = new AudioContext({
                sampleRate: recordingSettings.sampleRate
            });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(recordingSettings.bufferSize, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
                if (!isRecordingRef.current || isPaused) return;
                const inputBuffer = audioProcessingEvent.inputBuffer;
                const inputData = inputBuffer.getChannelData(0);
                const pcmData = float32ToPCM16(inputData);
                audioBufferRef.current.push(pcmData);
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsRecording(true);
            isRecordingRef.current = true;

            // Запуск таймера
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
                sendPCMData();
            }, 1000);

        } catch (error: any) {
            console.error('Ошибка начала записи:', error);
            setError(t('recorder.start_error', { error: error.message }));
        }
    };

    // Остановка записи
    const stopRecording = async (): Promise<void> => {
        try {
            setIsRecording(false);
            isRecordingRef.current = false;

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            sendPCMData();

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            if (audioContextRef.current) {
                await audioContextRef.current.close();
                audioContextRef.current = null;
            }

            if (processorRef.current) {
                processorRef.current.disconnect();
                processorRef.current = null;
            }

            if (webSocketRef.current) {
                webSocketRef.current.sendSessionEnd();
                webSocketRef.current.disconnect();
                webSocketRef.current = null;
            }

        } catch (error: any) {
            console.error('Ошибка остановки записи:', error);
            setError(t('recorder.stop_error', { error: error.message }));
        }
    };

    const handleStartLecture = () => {
        setIsPreviewMode(false);
        setIsRecording(true);
        startRecording();
        setOriginalText(t('recording.example_text.original'));
        setTranslatedText(t('recording.example_text.translated'));
    };

    const confirmStopLecture = () => {
        stopRecording();
        setIsFinished(true);
        setIsRecording(false);
        setIsPaused(false);
        setShowStopModal(false);
    };

    const handleTogglePause = () => {
        if (isPaused) {
            setIsPaused(false);
            setShowPauseModal(false);
            isRecordingRef.current = true;
        } else {
            setShowPauseModal(true);
        }
    };

    const confirmPauseLecture = () => {
        setIsPaused(true);
        isRecordingRef.current = false;
        setShowPauseModal(false);
    };

    const speakText = (text: string, lang: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = {
                'en': 'en-US',
                'fr': 'fr-FR',
                'zh': 'zh-CN',
                'ru': 'ru-RU'
            }[lang] || 'en-US';

            window.speechSynthesis.speak(utterance);
        } else {
            alert(t('speech.not_supported'));
        }
    };

    const getStatusLabel = () => {
        if (isPreviewMode) return t('recording.status.preview');
        if (isFinished) return t('recording.status.finished');
        if (isPaused) return t('recording.status.paused');
        return t('recording.status.recording');
    };

    const getBreadcrumbs = () => [
        {
            label: getHomeLabel(userRole),
            path: getHomePath(userRole),
            translationKey: `roles.${userRole}.home`
        },
        {
            label: t('recording.breadcrumb'),
            path: '/lector/recorder',
            translationKey: 'recording.breadcrumb'
        },
        {
            label: getStatusLabel(),
            path: ''
        }
    ];

    // Форматирование времени
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Эффект для очистки (вынесен на верхний уровень)
    useEffect(() => {
        return () => {
            if (isRecordingRef.current) {
                stopRecording();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [stopRecording]);

    // Проверка наличия лекции в состоянии
    if (!state?.lecture) {
        navigate('/recorder', { replace: true });
        return null;
    }

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.mainContent}>
                <Header />
                <Breadcrumbs items={getBreadcrumbs()} />

                <h1 className={commonStyles.sectionHeader}>
                    {t('recording.title', { title: lecture.title })}
                </h1>

                {isPreviewMode ? (
                    <div className={commonStyles.infoCard}>
                        <h2 className={commonStyles.subHeader}>
                            {t('recording.preview.header')}
                        </h2>
                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.title')}:</span>
                            <span>{lecture.title}</span>
                        </div>
                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.lecturer')}:</span>
                            <span>{lecture.lecturer}</span>
                        </div>
                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.start')}:</span>
                            <span>{lecture.startTime ? new Date(lecture.startTime).toLocaleString() : t('common.not_specified')}</span>
                        </div>
                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.location')}:</span>
                            <span>{lecture.location}</span>
                        </div>

                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <button
                                onClick={handleStartLecture}
                                className={commonStyles.primaryButton}
                                style={{ padding: '10px 30px', fontSize: '18px' }}
                            >
                                {t('recording.start_button')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={commonStyles.infoCard}>
                            <h2 className={commonStyles.subHeader}>
                                {getStatusLabel()}
                            </h2>
                            <div className={commonStyles.statusItem}>
                                <span>{t('recording.lecture.title')}:</span>
                                <span>{lecture.title}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>{t('recording.lecture.lecturer')}:</span>
                                <span>{lecture.lecturer}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>{t('recording.lecture.start')}:</span>
                                <span>{lecture.startTime ? new Date(lecture.startTime).toLocaleString() : t('common.not_specified')}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>{t('recording.lecture.location')}:</span>
                                <span>{lecture.location}</span>
                            </div>
                            <div className={commonStyles.buttonGroup} style={{ marginTop: '20px' }}>
                                {!isFinished ? (
                                    <>
                                        <button
                                            onClick={handleTogglePause}
                                            className={commonStyles.refreshButton}
                                            disabled={isFinished}
                                        >
                                            {isPaused ? t('recording.resume_button') : t('recording.pause_button')}
                                        </button>
                                        <button
                                            onClick={() => setShowStopModal(true)}
                                            className={commonStyles.secondaryButton}
                                        >
                                            {t('recording.stop_button')}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => navigate('/archive')}
                                        className={commonStyles.primaryButton}
                                        style={{ width: '100%' }}
                                    >
                                        {t('recording.go_to_archive')}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={commonStyles.infoCardLecture}>
                            <div className={commonStyles.listItemLecture}>
                                <div className={commonStyles.textHeaderContainer}>
                                    <h2>{t('recording.original_text')}</h2>
                                </div>
                                <div className={commonStyles.ItemLecture}>
                                    <div className={commonStyles.ItemLectureButtons}>
                                        <button
                                            className={commonStyles.textButton}
                                            onClick={() => navigate(`/archive/lecture/${lecture.id}/full-lecture`, {
                                                state: {
                                                    originalText,
                                                    translatedText,
                                                    language,
                                                    lecture,
                                                    fromRecording: true
                                                }
                                            })}
                                        >
                                            {t('recording.show_full_text')}
                                        </button>
                                        {showFullText && (
                                            <button
                                                className={commonStyles.textButton}
                                                onClick={() => originalText && speakText(originalText, 'ru')}
                                                title={t('speech.synthesize')}
                                            >
                                                {t('speech.synthesize')}
                                            </button>
                                        )}
                                    </div>
                                    {showFullText && (
                                        <div className={commonStyles.LectureFullText}>
                                            {originalText?.substring(0, 500) + '...' || t('recording.text_unavailable')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={commonStyles.listItemLecture}>
                                <h2>{t('recording.translated_text', {
                                    language: t(`language.${language}`)
                                })}</h2>
                                <div className={commonStyles.ItemLecture}>
                                    {showFullText && (
                                        <div className={commonStyles.LectureFullText}>
                                            {translatedText || t('recording.translation_unavailable')}
                                        </div>
                                    )}
                                    <div className={commonStyles.ItemLectureButtons}>
                                        <button
                                            className={commonStyles.textButton}
                                            onClick={() => navigate(`/archive/lecture/${lecture.id}/full-lecture`, {
                                                state: {
                                                    originalText,
                                                    translatedText,
                                                    language,
                                                    lecture,
                                                    fromRecording: true
                                                }
                                            })}
                                        >
                                            {t('recording.show_full_text')}
                                        </button>
                                        {showFullText && (
                                            <button
                                                className={commonStyles.textButton}
                                                onClick={() => translatedText && speakText(translatedText, language)}
                                                title={t('speech.synthesize')}
                                            >
                                                {t('speech.synthesize')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {showStopModal && (
                    <div className={commonStyles.modalOverlay}>
                        <div className={commonStyles.modal}>
                            <h3>{t('confirmation.title')}</h3>
                            <p>{t('recording.stop_confirmation')}</p>
                            <div className={commonStyles.modalButtons}>
                                <button
                                    onClick={() => setShowStopModal(false)}
                                    className={commonStyles.cancelModalButton}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={confirmStopLecture}
                                    className={commonStyles.okModalButton}
                                >
                                    {t('recording.confirm_stop')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showPauseModal && (
                    <div className={commonStyles.modalOverlay}>
                        <div className={commonStyles.modal}>
                            <h3>{t('confirmation.title')}</h3>
                            <p>{t('recording.pause_confirmation')}</p>
                            <div className={commonStyles.modalButtons}>
                                <button
                                    onClick={() => setShowPauseModal(false)}
                                    className={commonStyles.cancelModalButton}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={confirmPauseLecture}
                                    className={commonStyles.okModalButton}
                                >
                                    {t('recording.confirm_pause')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className={commonStyles.errorMessage}>
                        ⚠️ {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordingLecturePage;