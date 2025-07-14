// // import { useState, useEffect, useRef, useCallback } from 'react';
// // import { useTranslation } from 'react-i18next';
// // import { useLocation, useNavigate } from 'react-router-dom';
// // import commonStyles from '../commonStyles.module.css';
// // import Header from '../../components/Header/Header';
// // import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
// // import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
// // import { AudioWebSocket } from '../../services/api';

// // type LectureData = {
// //     id: string;
// //     title: string;
// //     lecturer: string;
// //     start_time: string;
// //     duration: string;
// //     location: string;
// //     createdAt: string;
// //     lecture_title?: string;
// //     lecturer_name?: string;
// //     exact_location?: string;
// // };

// // type WebSocketMessage = {
// //     type: 'transcription' | 'processed' | 'translated' | 'error' | 'status' |
// //     'translated_french' | 'translated_chinese' | 'translated_english';
// //     message?: string;
// //     status?: string;
// //     timestamp?: number;
// //     confidence?: number;
// //     text?: string;
// //     original_text?: string;
// //     processed_text?: string;
// //     translation?: string;
// // };

// // const RecordingLecturePage = () => {
// //     const { t } = useTranslation();
// //     const { state } = useLocation();
// //     const { lecture: initialLecture, isPreview = true } = state as {
// //         lecture: LectureData;
// //         isPreview?: boolean
// //     };

// //     const [lecture, setLecture] = useState<LectureData>({
// //         ...initialLecture,
// //         lecture_title: initialLecture.lecture_title || initialLecture.title,
// //         lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
// //         exact_location: initialLecture.exact_location || initialLecture.location,
// //         start_time: initialLecture.start_time
// //     });

// //     const [isRecording, setIsRecording] = useState(!isPreview);
// //     const [isPaused, setIsPaused] = useState(false);
// //     const [isFinished, setIsFinished] = useState(false);
// //     const [originalText, setOriginalText] = useState('');
// //     // const [translatedText, setTranslatedText] = useState('');
// //     type Translations = {
// //         en: string;
// //         fr: string;
// //         zh: string;
// //     };
// //     const [translatedTexts, setTranslatedTexts] = useState<Translations>({
// //         en: '',
// //         fr: '',
// //         zh: '',
// //     });
// //     const [translations, setTranslations] = useState<{ en: string; fr: string; zh: string }>({ en: '', fr: '', zh: '' });
// //     const lastMessageIdRef = useRef<Set<string>>(new Set());
// //     const [liveMessages, setLiveMessages] = useState<WebSocketMessage[]>([]);
// //     const [processedTexts, setProcessedTexts] = useState<string[]>([]);

// //     const [language, setLanguage] = useState('en');
// //     const [showStopModal, setShowStopModal] = useState(false);
// //     const [showPauseModal, setShowPauseModal] = useState(false);
// //     const [showFullText, setShowFullText] = useState(true);
// //     const userRole = getRoleFromStorage();
// //     const navigate = useNavigate();
// //     const [isPreviewMode, setIsPreviewMode] = useState(isPreview);
// //     const [showStartModal, setShowStartModal] = useState(false);

// //     // Audio recording states
// //     const [isConnected, setIsConnected] = useState(false);
// //     const [sessionId, setSessionId] = useState('');
// //     const [status, setStatus] = useState(t('recording.status.ready'));
// //     const [error, setError] = useState('');
// //     const [transcriptions, setTranscriptions] = useState<any[]>([]);

// //     // Refs for audio
// //     const audioContextRef = useRef<AudioContext | null>(null);
// //     const mediaStreamRef = useRef<MediaStream | null>(null);
// //     const processorRef = useRef<ScriptProcessorNode | null>(null);
// //     const audioBufferRef = useRef<Int16Array[]>([]);
// //     const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);
// //     const webSocketRef = useRef<AudioWebSocket | null>(null);
// //     const isRecordingRef = useRef(false);

// //     // для редактирования полей
// //     const [editingField, setEditingField] = useState<string | null>(null);
// //     const [editedValues, setEditedValues] = useState({
// //         lecture_title: initialLecture.lecture_title || initialLecture.title,
// //         lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
// //         exact_location: initialLecture.exact_location || initialLecture.location,
// //         start_time: initialLecture.start_time
// //     });

// //     const generateSessionId = useCallback((): string => {
// //         return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
// //     }, []);

// //     const float32ToPCM16 = useCallback((float32Array: Float32Array): Int16Array => {
// //         const pcm16 = new Int16Array(float32Array.length);
// //         for (let i = 0; i < float32Array.length; i++) {
// //             const sample = Math.max(-1, Math.min(1, float32Array[i]));
// //             pcm16[i] = Math.round(sample * 0x7FFF);
// //         }
// //         return pcm16;
// //     }, []);

// //     const sendPCMData = useCallback((pcmData: Int16Array) => {
// //         if (webSocketRef.current && webSocketRef.current.isConnected) {
// //             const arrayBuffer = pcmData.buffer.slice(pcmData.byteOffset, pcmData.byteOffset + pcmData.byteLength);
// //             const uint8Array = new Uint8Array(arrayBuffer);
// //             const base64Data = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
// //             webSocketRef.current.sendAudioChunk(base64Data);
// //         }
// //     }, []);

// //     const forceFlushBuffer = useCallback(() => {
// //         if (isRecordingRef.current && audioBufferRef.current.length > 0) {
// //             const totalLength = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
// //             const combinedPCM = new Int16Array(totalLength);

// //             let offset = 0;
// //             for (const chunk of audioBufferRef.current) {
// //                 combinedPCM.set(chunk, offset);
// //                 offset += chunk.length;
// //             }

// //             sendPCMData(combinedPCM);
// //             audioBufferRef.current = [];
// //         }
// //     }, [sendPCMData]);

// const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
//     console.log('📨 Обработка WebSocket сообщения:', data.type, data);

//     const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

//     if (lastMessageIdRef.current.has(messageKey)) {
//         console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
//         return;
//     }

//     lastMessageIdRef.current.add(messageKey);

//     if (lastMessageIdRef.current.size > 1000) {
//         const keysArray = Array.from(lastMessageIdRef.current);
//         lastMessageIdRef.current.clear();
//         keysArray.slice(-500).forEach(key => lastMessageIdRef.current.add(key));
//     }

//     setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

//     if (data.type === 'processed' && data.processed_text) {
//         const newText = data.processed_text.trim();
//         if (newText) {
//             setProcessedTexts(prev => {
//                 if (!prev.includes(newText)) {
//                     const updated = [...prev, newText];
//                     const fullText = updated.join(' ');
//                     setOriginalText(fullText);
//                     return updated;
//                 }
//                 return prev;
//             });
//         }
//     }

//     // Обработка переведенных сообщений
//     if (data.translation) {
//         const newTranslation = data.translation.trim();
//         if (newTranslation) {
//             setTranslations(prev => {
//                 // Определяем язык перевода
//                 let lang: keyof Translations = 'en'; // по умолчанию

//                 // Обрабатываем только определенные типы сообщений
//                 if (data.type === 'translated_french') {
//                     lang = 'fr';
//                 } else if (data.type === 'translated_chinese') {
//                     lang = 'zh';
//                 } else if (data.type === 'translated_english') {
//                     // Для общего типа 'translated' используем указанный язык
//                     // lang = data.language as keyof Translations;
//                     lang = 'en';
//                 } else {
//                     // Игнорируем другие типы сообщений с переводами
//                     return prev;
//                 }

//                 // Проверяем, не добавляли ли мы уже этот перевод
//                 if (!prev[lang].includes(newTranslation)) {
//                     return {
//                         ...prev,
//                         [lang]: (prev[lang] ? prev[lang] + ' ' : '') + newTranslation
//                     };
//                 }
//                 return prev;
//             });
//         }
//     }

//     if (data.type === 'error') {
//         console.error('❌ Ошибка от сервера:', data.message);
//         setError(`Ошибка сервера: ${data.message || 'Неизвестная ошибка'}`);
//     }
// }, []);

// //     const startRecording = useCallback(async () => {
// //         try {
// //             setError('');
// //             setStatus(t('recording.status.requesting_mic'));

// //             const newSessionId = generateSessionId();
// //             setSessionId(newSessionId);

// //             const stream = await navigator.mediaDevices.getUserMedia({
// //                 audio: {
// //                     sampleRate: 16000,
// //                     channelCount: 1,
// //                     echoCancellation: false,
// //                     noiseSuppression: false,
// //                     autoGainControl: false
// //                 }
// //             });

// //             mediaStreamRef.current = stream;
// //             setStatus(t('recording.status.connecting_ws'));

// //             const ws = new AudioWebSocket();
// //             webSocketRef.current = ws;

// //             ws.onMessage('transcription', handleWebSocketMessage);
// //             ws.onMessage('processed', handleWebSocketMessage);
// //             ws.onMessage('translated', handleWebSocketMessage);
// //             ws.onMessage('error', handleWebSocketMessage);
// //             ws.onMessage('status', handleWebSocketMessage);

// //             // В функции startRecording, после создания WebSocket:
// //             ws.onMessage('translated_english', (data) => {
// //                 setTranslations(prev => ({
// //                     ...prev,
// //                     en: prev.en + ' ' + (data.translation || '')
// //                 }));
// //             });

// //             ws.onMessage('translated_french', (data) => {
// //                 setTranslations(prev => ({
// //                     ...prev,
// //                     fr: prev.fr + ' ' + (data.translation || '')
// //                 }));
// //             });

// //             ws.onMessage('translated_chinese', (data) => {
// //                 setTranslations(prev => ({
// //                     ...prev,
// //                     zh: prev.zh + ' ' + (data.translation || '')
// //                 }));
// //             });

// //             // await ws.connect(newSessionId);
// //             await ws.connect(newSessionId, {
// //                 title: lecture.lecture_title || lecture.title,
// //                 lecturer: lecture.lecturer_name || lecture.lecturer,
// //                 location: lecture.exact_location || lecture.location,
// //                 start_time: lecture.start_time
// //             });
// //             setIsConnected(true);
// //             setStatus(t('recording.status.ws_connected'));

// //             const audioContext = new (window.AudioContext || window.webkitAudioContext)({
// //                 sampleRate: 16000
// //             });
// //             audioContextRef.current = audioContext;

// //             const source = audioContext.createMediaStreamSource(stream);
// //             const processor = audioContext.createScriptProcessor(4096, 1, 1);
// //             processorRef.current = processor;

// //             processor.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
// //                 if (!isRecordingRef.current) return;

// //                 const inputBuffer = audioProcessingEvent.inputBuffer;
// //                 const inputData = inputBuffer.getChannelData(0);
// //                 const pcmData = float32ToPCM16(inputData);
// //                 audioBufferRef.current.push(pcmData);

// //                 const totalSamples = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
// //                 const durationSeconds = totalSamples / 16000;

// //                 if (durationSeconds >= 0.2) {
// //                     const totalLength = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
// //                     const combinedPCM = new Int16Array(totalLength);

// //                     let offset = 0;
// //                     for (const chunk of audioBufferRef.current) {
// //                         combinedPCM.set(chunk, offset);
// //                         offset += chunk.length;
// //                     }

// //                     sendPCMData(combinedPCM);
// //                     audioBufferRef.current = [];
// //                 }
// //             };

// //             source.connect(processor);
// //             processor.connect(audioContext.destination);
// //             flushIntervalRef.current = setInterval(forceFlushBuffer, 10000);

// //             setIsRecording(true);
// //             isRecordingRef.current = true;
// //             setStatus(t('recording.status.recording'));
// //             setIsPreviewMode(false);

// //         } catch (err) {
// //             console.error('Recording error:', err);
// //             setError(t('recording.errors.mic_access', { error: err instanceof Error ? err.message : String(err) }));
// //             setStatus(t('recording.errors.recording_failed'));

// //             if (err instanceof Error) {
// //                 if (err.name === 'NotAllowedError') {
// //                     setError(t('recording.errors.mic_permission'));
// //                 } else if (err.name === 'NotFoundError') {
// //                     setError(t('recording.errors.mic_not_found'));
// //                 }
// //             }
// //         }
// //     }, [t, generateSessionId, handleWebSocketMessage, float32ToPCM16, sendPCMData, forceFlushBuffer]);

// //     const stopRecording = useCallback(() => {
// //         setIsRecording(false);
// //         isRecordingRef.current = false;

// //         if (flushIntervalRef.current) {
// //             clearInterval(flushIntervalRef.current);
// //             flushIntervalRef.current = null;
// //         }

// //         if (audioBufferRef.current.length > 0) {
// //             forceFlushBuffer();
// //         }

// //         if (processorRef.current) {
// //             processorRef.current.disconnect();
// //             processorRef.current = null;
// //         }

// //         if (audioContextRef.current) {
// //             audioContextRef.current.close();
// //             audioContextRef.current = null;
// //         }

// //         if (mediaStreamRef.current) {
// //             mediaStreamRef.current.getTracks().forEach(track => track.stop());
// //             mediaStreamRef.current = null;
// //         }

// //         if (webSocketRef.current) {
// //             webSocketRef.current.disconnect();
// //             webSocketRef.current = null;
// //         }

// //         setIsConnected(false);
// //         setStatus(t('recording.status.stopped'));
// //     }, [t, forceFlushBuffer]);

// //     const handleStartLecture = () => {
// //         // Применяем все редактируемые поля перед стартом
// //         setLecture(prev => ({
// //             ...prev,
// //             lecture_title: editedValues.lecture_title,
// //             lecturer_name: editedValues.lecturer_name,
// //             exact_location: editedValues.exact_location,
// //             start_time: editedValues.start_time,
// //             // Синхронизируем и основные поля на случай, если они используются где-то еще
// //             title: editedValues.lecture_title,
// //             lecturer: editedValues.lecturer_name,
// //             location: editedValues.exact_location
// //         }));

// //         setShowStartModal(true);
// //         setTimeout(() => {
// //             startRecording();
// //             setShowStartModal(false);
// //         }, 3000); // Перенаправление через 3 секунды
// //     };

// //     const confirmStopLecture = () => {
// //         stopRecording();
// //         setIsFinished(true);
// //         setIsRecording(false);
// //         setIsPaused(false);
// //         setShowStopModal(false);
// //     };

// //     const handleTogglePause = () => {
// //         if (isPaused) {
// //             setIsPaused(false);
// //             setShowPauseModal(false);
// //             isRecordingRef.current = true;
// //             setStatus(t('recording.status.recording'));
// //         } else {
// //             setShowPauseModal(true);
// //         }
// //     };

// //     const confirmPauseLecture = () => {
// //         setIsPaused(true);
// //         setShowPauseModal(false);
// //         isRecordingRef.current = false;
// //         setStatus(t('recording.status.paused'));
// //     };

// //     const speakText = (text: string, lang: string) => {
// //         if ('speechSynthesis' in window) {
// //             const utterance = new SpeechSynthesisUtterance(text);
// //             utterance.lang = {
// //                 'en': 'en-US',
// //                 'fr': 'fr-FR',
// //                 'zh': 'zh-CN',
// //                 'ru': 'ru-RU'
// //             }[lang] || 'en-US';

// //             window.speechSynthesis.speak(utterance);
// //         } else {
// //             alert(t('speech.not_supported'));
// //         }
// //     };

// //     const getStatusLabel = () => {
// //         if (isPreviewMode) return t('recording.status.preview');
// //         if (isFinished) return t('recording.status.finished');
// //         if (isPaused) return t('recording.status.paused');
// //         return t('recording.status.recording');
// //     };

// //     const getBreadcrumbs = () => [
// //         {
// //             label: getHomeLabel(userRole),
// //             path: getHomePath(userRole),
// //             translationKey: `roles.${userRole}.home`
// //         },
// //         {
// //             label: t('recording.breadcrumb'),
// //             path: '/lector/recorder',
// //             translationKey: 'recording.breadcrumb'
// //         },
// //         {
// //             label: getStatusLabel(),
// //             path: ''
// //         }
// //     ];

// //     const handleEditClick = (fieldName: string) => {
// //         setEditingField(fieldName);
// //     };

// //     const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //         const { name, value } = e.target;
// //         setEditedValues(prev => ({
// //             ...prev,
// //             [name]: value
// //         }));
// //     };

// //     const handleSaveField = (fieldName: string) => {
// //         setLecture(prev => ({
// //             ...prev,
// //             [fieldName]: editedValues[fieldName as keyof typeof editedValues],
// //             ...(fieldName === 'lecture_title' && { title: editedValues.lecture_title }),
// //             ...(fieldName === 'lecturer_name' && { lecturer: editedValues.lecturer_name }),
// //             ...(fieldName === 'exact_location' && { location: editedValues.exact_location })
// //         }));
// //         setEditingField(null);
// //     };

// //     const handleCancelEdit = () => {
// //         setEditedValues({
// //             lecture_title: lecture.lecture_title || lecture.title,
// //             lecturer_name: lecture.lecturer_name || lecture.lecturer,
// //             exact_location: lecture.exact_location || lecture.location,
// //             start_time: lecture.start_time
// //         });
// //         setEditingField(null);
// //     };

// //     const formatDateTimeForInput = (dateTimeString: string) => {
// //         if (!dateTimeString) return '';
// //         const date = new Date(dateTimeString);
// //         return date.toISOString().slice(0, 16);
// //     };

// //     useEffect(() => {
// //         return () => {
// //             if (isRecording) {
// //                 stopRecording();
// //             }
// //         };
// //     }, [isRecording, stopRecording]);

// //     if (!state?.lecture) {
// //         navigate('/recorder', { replace: true });
// //         return null;
// //     }

// //     return (
// //         <div className={commonStyles.appContainer}>
// //             <div className={commonStyles.mainContent}>
// //                 <Header />
// //                 <Breadcrumbs items={getBreadcrumbs()} />

// //                 <h1 className={commonStyles.sectionHeader}>
// //                     {t('recording.title', { title: lecture.lecture_title || lecture.title })}
// //                 </h1>


// //                 {/* {isPreviewMode ? (
// //                     <div className={commonStyles.infoCard}>
// //                         <h2 className={commonStyles.subHeader}>
// //                             {t('recording.preview.header')}
// //                         </h2>
// //                         <div className={commonStyles.statusItem}>
// //                             <span>{t('recording.lecture.title')}:</span>
// //                             <span>{lecture.lecture_title || lecture.title}</span>
// //                         </div>
// //                         <div className={commonStyles.statusItem}>
// //                             <span>{t('recording.lecture.lecturer')}:</span>
// //                             <span>{lecture.lecturer_name || lecture.lecturer}</span>
// //                         </div>
// //                         <div className={commonStyles.statusItem}>
// //                             <span>{t('recording.lecture.start')}:</span>
// //                             <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span>
// //                         </div>
// //                         <div className={commonStyles.statusItem}>
// //                             <span>{t('recording.lecture.location')}:</span>
// //                             <span>{lecture.exact_location || lecture.location}</span>
// //                         </div>

// //                         <div style={{ marginTop: '30px', textAlign: 'center' }}>
// //                             <button
// //                                 onClick={handleStartLecture}
// //                                 className={commonStyles.primaryButton}
// //                                 style={{ padding: '10px 30px', fontSize: '18px' }}
// //                             >
// //                                 {t('recording.start_button')}
// //                             </button>
// //                         </div>
// //                     </div>
// //                 )  */}

// //                 {isPreviewMode ? (
// //                     // <div className={commonStyles.infoCard}>
// //                     //     <h2 className={commonStyles.subHeader}>
// //                     //         {t('recording.preview.header')}
// //                     //     </h2>

// //                     //     {isEditing ? (
// //                     //         <>
// //                     //             <div className={commonStyles.statusItem}>
// //                     //                 <span>{t('recording.lecture.title')}:</span>
// //                     //                 <input
// //                     //                     type="text"
// //                     //                     name="lecture_title"
// //                     //                     value={editedLecture.lecture_title}
// //                     //                     onChange={handleEditChange}
// //                     //                     className={commonStyles.editInput}
// //                     //                 />
// //                     //             </div>
// //                     //             <div className={commonStyles.statusItem}>
// //                     //                 <span>{t('recording.lecture.lecturer')}:</span>
// //                     //                 <input
// //                     //                     type="text"
// //                     //                     name="lecturer_name"
// //                     //                     value={editedLecture.lecturer_name}
// //                     //                     onChange={handleEditChange}
// //                     //                     className={commonStyles.editInput}
// //                     //                 />
// //                     //             </div>
// //                     //             <div className={commonStyles.statusItem}>
// //                     //                 <span>{t('recording.lecture.location')}:</span>
// //                     //                 <input
// //                     //                     type="text"
// //                     //                     name="exact_location"
// //                     //                     value={editedLecture.exact_location}
// //                     //                     onChange={handleEditChange}
// //                     //                     className={commonStyles.editInput}
// //                     //                 />
// //                     //             </div>
// //                     //         </>
// //                     //     ) : (
// //                     //         <>
// //                     //             <div className={commonStyles.statusItem}>
// //                     //                 <span>{t('recording.lecture.title')}:</span>
// //                     //                 <span>{lecture.lecture_title || lecture.title}</span>
// //                     //             </div>
// //                     //             <div className={commonStyles.statusItem}>
// //                     //                 <span>{t('recording.lecture.lecturer')}:</span>
// //                     //                 <span>{lecture.lecturer_name || lecture.lecturer}</span>
// //                     //             </div>
// //                     //             <div className={commonStyles.statusItem}>
// //                     //                 <span>{t('recording.lecture.start')}:</span>
// //                     //                 <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span>
// //                     //             </div>
// //                     //             <div className={commonStyles.statusItem}>
// //                     //                 <span>{t('recording.lecture.location')}:</span>
// //                     //                 <span>{lecture.exact_location || lecture.location}</span>
// //                     //             </div>
// //                     //         </>
// //                     //     )}

// //                     //     <div style={{ marginTop: '30px', textAlign: 'center' }}>
// //                     //         {isEditing ? (
// //                     //             <div className={commonStyles.buttonGroup}>
// //                     //                 <button
// //                     //                     onClick={handleSave}
// //                     //                     className={commonStyles.primaryButton}
// //                     //                 >
// //                     //                     {t('common.save')}
// //                     //                 </button>
// //                     //                 <button
// //                     //                     onClick={handleCancelEdit}
// //                     //                     className={commonStyles.secondaryButton}
// //                     //                 >
// //                     //                     {t('common.cancel')}
// //                     //                 </button>
// //                     //             </div>
// //                     //         ) : (
// //                     //             <>
// //                     //                 <button
// //                     //                     onClick={() => setIsEditing(true)}
// //                     //                     className={commonStyles.secondaryButton}
// //                     //                     style={{ marginRight: '10px' }}
// //                     //                 >
// //                     //                     {t('common.edit')}
// //                     //                 </button>
// //                     //                 <button
// //                     //                     onClick={handleStartLecture}
// //                     //                     className={commonStyles.primaryButton}
// //                     //                     style={{ padding: '10px 30px', fontSize: '18px' }}
// //                     //                 >
// //                     //                     {t('recording.start_button')}
// //                     //                 </button>
// //                     //             </>
// //                     //         )}
// //                     //     </div>
// //                     // </div>

// //                     <div className={commonStyles.infoCard}>
// //                         <h2 className={commonStyles.subHeader}>
// //                             {t('recording.preview.header')}
// //                         </h2>

// //                         {/* Поле "Название лекции" */}
// //                         <div className={commonStyles.statusItem}>
// //                             <span>{t('recording.lecture.title')}:</span>
// //                             {editingField === 'lecture_title' ? (
// //                                 <div className={commonStyles.editFieldContainer}>
// //                                     <input
// //                                         type="text"
// //                                         name="lecture_title"
// //                                         value={editedValues.lecture_title}
// //                                         onChange={handleFieldChange}
// //                                         className={commonStyles.editInput}
// //                                         autoFocus
// //                                     />
// //                                     <div className={commonStyles.editButtons}>
// //                                         <button
// //                                             onClick={() => handleSaveField('lecture_title')}
// //                                             className={commonStyles.smallPrimaryButton}
// //                                         >
// //                                             {t('common.save')}
// //                                         </button>
// //                                         <button
// //                                             onClick={handleCancelEdit}
// //                                             className={commonStyles.smallSecondaryButton}
// //                                         >
// //                                             {t('common.cancel')}
// //                                         </button>
// //                                     </div>
// //                                 </div>
// //                             ) : (
// //                                 <div className={commonStyles.fieldWithEdit}>
// //                                     <span>{lecture.lecture_title || lecture.title}</span>
// //                                     <button
// //                                         onClick={() => handleEditClick('lecture_title')}
// //                                         className={commonStyles.editButton}
// //                                         title={t('common.edit')}
// //                                     >
// //                                         ✏️
// //                                     </button>
// //                                 </div>
// //                             )}
// //                         </div>

// //                         {/* Поле "Лектор" */}
// //                         <div className={commonStyles.statusItem}>
// //                             <span>{t('recording.lecture.lecturer')}:</span>
// //                             {editingField === 'lecturer_name' ? (
// //                                 <div className={commonStyles.editFieldContainer}>
// //                                     <input
// //                                         type="text"
// //                                         name="lecturer_name"
// //                                         value={editedValues.lecturer_name}
// //                                         onChange={handleFieldChange}
// //                                         className={commonStyles.editInput}
// //                                         autoFocus
// //                                     />
// //                                     <div className={commonStyles.editButtons}>
// //                                         <button
// //                                             onClick={() => handleSaveField('lecturer_name')}
// //                                             className={commonStyles.smallPrimaryButton}
// //                                         >
// //                                             {t('common.save')}
// //                                         </button>
// //                                         <button
// //                                             onClick={handleCancelEdit}
// //                                             className={commonStyles.smallSecondaryButton}
// //                                         >
// //                                             {t('common.cancel')}
// //                                         </button>
// //                                     </div>
// //                                 </div>
// //                             ) : (
// //                                 <div className={commonStyles.fieldWithEdit}>
// //                                     <span>{lecture.lecturer_name || lecture.lecturer}</span>
// //                                     <button
// //                                         onClick={() => handleEditClick('lecturer_name')}
// //                                         className={commonStyles.editButton}
// //                                         title={t('common.edit')}
// //                                     >
// //                                         ✏️
// //                                     </button>
// //                                 </div>
// //                             )}
// //                         </div>

// //                         {/* Поле "Время начала" */}
// //                         <div className={commonStyles.statusItem}>
// //                             <span>{t('recording.lecture.start')}:</span>
// //                             {editingField === 'start_time' ? (
// //                                 <div className={commonStyles.editFieldContainer}>
// //                                     <input
// //                                         type="datetime-local"
// //                                         name="start_time"
// //                                         value={formatDateTimeForInput(editedValues.start_time)}
// //                                         onChange={handleFieldChange}
// //                                         className={commonStyles.editInput}
// //                                         autoFocus
// //                                     />
// //                                     <div className={commonStyles.editButtons}>
// //                                         <button
// //                                             onClick={() => handleSaveField('start_time')}
// //                                             className={commonStyles.smallPrimaryButton}
// //                                         >
// //                                             {t('common.save')}
// //                                         </button>
// //                                         <button
// //                                             onClick={handleCancelEdit}
// //                                             className={commonStyles.smallSecondaryButton}
// //                                         >
// //                                             {t('common.cancel')}
// //                                         </button>
// //                                     </div>
// //                                 </div>
// //                             ) : (
// //                                 <div className={commonStyles.fieldWithEdit}>
// //                                     <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span>
// //                                     <button
// //                                         onClick={() => handleEditClick('start_time')}
// //                                         className={commonStyles.editButton}
// //                                         title={t('common.edit')}
// //                                     >
// //                                         ✏️
// //                                     </button>
// //                                 </div>
// //                             )}
// //                         </div>

// //                         {/* Поле "Местоположение" */}
// //                         <div className={commonStyles.statusItem}>
// //                             <span>{t('recording.lecture.location')}:</span>
// //                             {editingField === 'exact_location' ? (
// //                                 <div className={commonStyles.editFieldContainer}>
// //                                     <input
// //                                         type="text"
// //                                         name="exact_location"
// //                                         value={editedValues.exact_location}
// //                                         onChange={handleFieldChange}
// //                                         className={commonStyles.editInput}
// //                                         autoFocus
// //                                     />
// //                                     <div className={commonStyles.editButtons}>
// //                                         <button
// //                                             onClick={() => handleSaveField('exact_location')}
// //                                             className={commonStyles.smallPrimaryButton}
// //                                         >
// //                                             {t('common.save')}
// //                                         </button>
// //                                         <button
// //                                             onClick={handleCancelEdit}
// //                                             className={commonStyles.smallSecondaryButton}
// //                                         >
// //                                             {t('common.cancel')}
// //                                         </button>
// //                                     </div>
// //                                 </div>
// //                             ) : (
// //                                 <div className={commonStyles.fieldWithEdit}>
// //                                     <span>{lecture.exact_location || lecture.location}</span>
// //                                     <button
// //                                         onClick={() => handleEditClick('exact_location')}
// //                                         className={commonStyles.editButton}
// //                                         title={t('common.edit')}
// //                                     >
// //                                         ✏️
// //                                     </button>
// //                                 </div>
// //                             )}
// //                         </div>

// //                         <div style={{ marginTop: '30px', textAlign: 'center' }}>
// //                             <button
// //                                 onClick={handleStartLecture}
// //                                 className={commonStyles.primaryButton}
// //                                 style={{ padding: '10px 30px', fontSize: '18px' }}
// //                             >
// //                                 {t('recording.start_button')}
// //                             </button>
// //                         </div>
// //                     </div>

// //                 )

// //                     : (
// //                         <>
// //                             <div className={commonStyles.infoCard}>
// //                                 <h2 className={commonStyles.subHeader}>
// //                                     {getStatusLabel()}
// //                                 </h2>
// //                                 <div className={commonStyles.statusItem}>
// //                                     <span>{t('recording.lecture.title')}:</span>
// //                                     <span>{lecture.lecture_title || lecture.title}</span>
// //                                 </div>
// //                                 <div className={commonStyles.statusItem}>
// //                                     <span>{t('recording.lecture.lecturer')}:</span>
// //                                     <span>{lecture.lecturer_name || lecture.lecturer}</span>
// //                                 </div>
// //                                 <div className={commonStyles.statusItem}>
// //                                     <span>{t('recording.lecture.start')}:</span>
// //                                     <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span>
// //                                 </div>
// //                                 <div className={commonStyles.statusItem}>
// //                                     <span>{t('recording.lecture.location')}:</span>
// //                                     <span>{lecture.exact_location || lecture.location}</span>
// //                                 </div>
// //                                 <div className={commonStyles.buttonGroup} style={{ marginTop: '20px' }}>
// //                                     {!isFinished ? (
// //                                         <>
// //                                             <button
// //                                                 onClick={handleTogglePause}
// //                                                 className={commonStyles.refreshButton}
// //                                                 disabled={isFinished}
// //                                             >
// //                                                 {isPaused ? t('recording.resume_button') : t('recording.pause_button')}
// //                                             </button>
// //                                             <button
// //                                                 onClick={() => setShowStopModal(true)}
// //                                                 className={commonStyles.secondaryButton}
// //                                             >
// //                                                 {t('recording.stop_button')}
// //                                             </button>
// //                                         </>
// //                                     ) : (
// //                                         <button
// //                                             onClick={() => navigate('/archive')}
// //                                             className={commonStyles.primaryButton}
// //                                             style={{ width: '100%' }}
// //                                         >
// //                                             {t('recording.go_to_archive')}
// //                                         </button>
// //                                     )}
// //                                 </div>
// //                             </div>

// //                             <div className={commonStyles.infoCardLecture}>
// //                                 <div className={commonStyles.listItemLecture}>
// //                                     <div className={commonStyles.textHeaderContainer}>
// //                                         <h2>{t('recording.original_text')}</h2>
// //                                     </div>
// //                                     <div className={commonStyles.ItemLecture}>
// //                                         {/* <div className={commonStyles.ItemLectureButtons}>
// //                                         <button
// //                                             className={commonStyles.textButton}
// //                                             onClick={() => navigate(`/archive/lecture/${lecture.id}/full-lecture`, {
// //                                                 state: {
// //                                                     originalText,
// //                                                     translatedText,
// //                                                     language,
// //                                                     lecture,
// //                                                     fromRecording: true
// //                                                 }
// //                                             })}
// //                                         >
// //                                             {t('recording.show_full_text')}
// //                                         </button>
// //                                         {showFullText && (
// //                                             <button
// //                                                 className={commonStyles.textButton}
// //                                                 onClick={() => originalText && speakText(originalText, 'ru')}
// //                                                 title={t('speech.synthesize')}
// //                                             >
// //                                                 {t('speech.synthesize')}
// //                                             </button>
// //                                         )}
// //                                     </div> */}
// //                                         {showFullText && (
// //                                             <div className={commonStyles.LectureFullText}>
// //                                                 {originalText || t('recording.text_unavailable')}
// //                                             </div>
// //                                         )}
// //                                     </div>
// //                                 </div>
// //                                 <div className={commonStyles.listItemLecture}>
// //                                     <h2>{t('recording.translated_text', {
// //                                         language: t(`language.${language}`)
// //                                     })}</h2>

// //                                     <select
// //                                         className={commonStyles.filterSelect}
// //                                         value={language}
// //                                         onChange={(e) => setLanguage(e.target.value)}
// //                                         style={{ marginBottom: '15px' }}
// //                                     >
// //                                         <option value="en">{t('language.english')}</option>
// //                                         <option value="fr">{t('language.french')}</option>
// //                                         <option value="zh">{t('language.chinese')}</option>
// //                                     </select>

// //                                     {/* <div className={commonStyles.ItemLecture}>
// //                                     {showFullText && (
// //                                         <div className={commonStyles.LectureFullText}>
// //                                             {translatedText || t('recording.translation_unavailable')}
// //                                         </div>
// //                                     )}
// //                                     <div className={commonStyles.ItemLectureButtons}>
// //                                         <button
// //                                             className={commonStyles.textButton}
// //                                             onClick={() => navigate(`/archive/lecture/${lecture.id}/full-lecture`, {
// //                                                 state: {
// //                                                     originalText,
// //                                                     translatedText,
// //                                                     language,
// //                                                     lecture,
// //                                                     fromRecording: true
// //                                                 }
// //                                             })}
// //                                         >
// //                                             {t('recording.show_full_text')}
// //                                         </button>
// //                                         {showFullText && (
// //                                             <button
// //                                                 className={commonStyles.textButton}
// //                                                 onClick={() => translatedText && speakText(translatedText, language)}
// //                                                 title={t('speech.synthesize')}
// //                                             >
// //                                                 {t('speech.synthesize')}
// //                                             </button>
// //                                         )}
// //                                     </div>
// //                                 </div> */}

// //                                     <div className={commonStyles.ItemLecture}>
// //                                         {showFullText && (
// //                                             <div className={commonStyles.LectureFullText}>
// //                                                 {translations[language as keyof Translations] || t('recording.translation_unavailable')}
// //                                             </div>
// //                                         )}
// //                                         <div className={commonStyles.ItemLectureButtons}>
// //                                             {showFullText && (
// //                                                 <button
// //                                                     className={commonStyles.textButton}
// //                                                     onClick={() => translations[language as keyof Translations] &&
// //                                                         speakText(translations[language as keyof Translations], language)}
// //                                                     title={t('speech.synthesize')}
// //                                                 >
// //                                                     {t('speech.synthesize')}
// //                                                 </button>
// //                                             )}
// //                                         </div>
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         </>
// //                     )}

// //                 {showStopModal && (
// //                     <div className={commonStyles.modalOverlay}>
// //                         <div className={commonStyles.modal}>
// //                             <h3>{t('confirmation.title')}</h3>
// //                             <p>{t('recording.stop_confirmation')}</p>
// //                             <div className={commonStyles.modalButtons}>
// //                                 <button
// //                                     onClick={() => setShowStopModal(false)}
// //                                     className={commonStyles.cancelModalButton}
// //                                 >
// //                                     {t('common.cancel')}
// //                                 </button>
// //                                 <button
// //                                     onClick={confirmStopLecture}
// //                                     className={commonStyles.okModalButton}
// //                                 >
// //                                     {t('recording.confirm_stop')}
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 )}

// //                 {showPauseModal && (
// //                     <div className={commonStyles.modalOverlay}>
// //                         <div className={commonStyles.modal}>
// //                             <h3>{t('confirmation.title')}</h3>
// //                             <p>{t('recording.pause_confirmation')}</p>
// //                             <div className={commonStyles.modalButtons}>
// //                                 <button
// //                                     onClick={() => setShowPauseModal(false)}
// //                                     className={commonStyles.cancelModalButton}
// //                                 >
// //                                     {t('common.cancel')}
// //                                 </button>
// //                                 <button
// //                                     onClick={confirmPauseLecture}
// //                                     className={commonStyles.okModalButton}
// //                                 >
// //                                     {t('recording.confirm_pause')}
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 )}

// //                 {showStartModal && (
// //                     <div className={commonStyles.modalOverlay}>
// //                         <div className={commonStyles.modal}>
// //                             <h3>{t('recording.starting_lecture')}</h3>
// //                             <p>{t('recording.starting_message')}</p>
// //                             <div style={{
// //                                 display: 'flex',
// //                                 justifyContent: 'center',
// //                                 marginTop: '20px'
// //                             }}>
// //                                 <div className={commonStyles.loader}></div>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // };

// // export default RecordingLecturePage;


// import { useState, useEffect, useRef, useCallback } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useLocation, useNavigate } from 'react-router-dom';
// import commonStyles from '../commonStyles.module.css';
// import Header from '../../components/Header/Header';
// import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
// import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
// import { AudioWebSocket } from '../../services/api';

// type LectureData = {
//     id: string;
//     title: string;
//     lecturer: string;
//     start_time: string;
//     duration: string;
//     location: string;
//     createdAt: string;
//     lecture_title?: string;
//     lecturer_name?: string;
//     exact_location?: string;
// };

// type WebSocketMessage = {
//     type: 'transcription' | 'processed' | 'translated' | 'error' | 'status' |
//     'translated_french' | 'translated_chinese' | 'translated_english';
//     language: 'en' | 'fr' | 'ru' | 'zh';
//     message?: string;
//     status?: string;
//     timestamp?: number;
//     confidence?: number;
//     text?: string;
//     original_text?: string;
//     processed_text?: string;
//     translation?: string;
// };

// const RecordingLecturePage = () => {
//     const { t } = useTranslation();
//     const { state } = useLocation();
//     const { lecture: initialLecture, isPreview = true } = state as {
//         lecture: LectureData;
//         isPreview?: boolean
//     };

//     const [lecture, setLecture] = useState<LectureData>({
//         ...initialLecture,
//         lecture_title: initialLecture.lecture_title || initialLecture.title,
//         lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
//         exact_location: initialLecture.exact_location || initialLecture.location
//     });

//     const [isRecording, setIsRecording] = useState(!isPreview);
//     const [isPaused, setIsPaused] = useState(false);
//     const [isFinished, setIsFinished] = useState(false);
//     const [originalText, setOriginalText] = useState('');
//     // const [translatedTexts, setTranslatedTexts] = useState({
//     //     en: '',
//     //     fr: '',
//     //     zh: '',
//     // });
//     const [translations, setTranslations] = useState({ en: '', fr: '', zh: '' });
//     const lastMessageIdRef = useRef<Set<string>>(new Set());
//     const [liveMessages, setLiveMessages] = useState<WebSocketMessage[]>([]);
//     const [processedTexts, setProcessedTexts] = useState<string[]>([]);
//     const [language, setLanguage] = useState('en');
//     const [showStopModal, setShowStopModal] = useState(false);
//     const [showPauseModal, setShowPauseModal] = useState(false);
//     const [showFullText, setShowFullText] = useState(true);
//     const userRole = getRoleFromStorage();
//     const navigate = useNavigate();
//     const [isPreviewMode, setIsPreviewMode] = useState(isPreview);
//     const [showStartModal, setShowStartModal] = useState(false);
//     const [isConnected, setIsConnected] = useState(false);
//     const [sessionId, setSessionId] = useState('');
//     const [status, setStatus] = useState(t('recording.status.ready'));
//     const [error, setError] = useState('');
//     const [transcriptions, setTranscriptions] = useState<any[]>([]);

//     const audioContextRef = useRef<AudioContext | null>(null);
//     const mediaStreamRef = useRef<MediaStream | null>(null);
//     const processorRef = useRef<ScriptProcessorNode | null>(null);
//     const audioBufferRef = useRef<Int16Array[]>([]);
//     const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);
//     const webSocketRef = useRef<AudioWebSocket | null>(null);
//     const isRecordingRef = useRef(false);

//     const [editingField, setEditingField] = useState<string | null>(null);
//     const [editedValues, setEditedValues] = useState({
//         lecture_title: initialLecture.lecture_title || initialLecture.title,
//         lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
//         exact_location: initialLecture.exact_location || initialLecture.location,
//         start_time: initialLecture.start_time
//     });

//     const generateSessionId = useCallback((): string => {
//         return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
//     }, []);

//     const float32ToPCM16 = useCallback((float32Array: Float32Array): Int16Array => {
//         const pcm16 = new Int16Array(float32Array.length);
//         for (let i = 0; i < float32Array.length; i++) {
//             const sample = Math.max(-1, Math.min(1, float32Array[i]));
//             pcm16[i] = Math.round(sample * 0x7FFF);
//         }
//         return pcm16;
//     }, []);

//     const sendPCMData = useCallback((pcmData: Int16Array) => {
//         if (webSocketRef.current && webSocketRef.current.isConnected) {
//             const arrayBuffer = pcmData.buffer.slice(pcmData.byteOffset, pcmData.byteOffset + pcmData.byteLength);
//             const uint8Array = new Uint8Array(arrayBuffer);
//             const base64Data = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
//             webSocketRef.current.sendAudioChunk(base64Data);
//         }
//     }, []);

//     const forceFlushBuffer = useCallback(() => {
//         if (isRecordingRef.current && audioBufferRef.current.length > 0) {
//             const totalLength = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
//             const combinedPCM = new Int16Array(totalLength);

//             let offset = 0;
//             for (const chunk of audioBufferRef.current) {
//                 combinedPCM.set(chunk, offset);
//                 offset += chunk.length;
//             }

//             sendPCMData(combinedPCM);
//             audioBufferRef.current = [];
//         }
//     }, [sendPCMData]);

//     // const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
//     //     console.log('WebSocket message:', data.type, data);
//     //     const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

//     //     if (lastMessageIdRef.current.has(messageKey)) return;
//     //     lastMessageIdRef.current.add(messageKey);

//     //     setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

//     //     if (data.type === 'processed' && data.processed_text) {
//     //         const newText = data.processed_text.trim();
//     //         if (newText) {
//     //             setProcessedTexts(prev => {
//     //                 if (!prev.includes(newText)) {
//     //                     const updated = [...prev, newText];
//     //                     setOriginalText(updated.join(' '));
//     //                     return updated;
//     //                 }
//     //                 return prev;
//     //             });
//     //         }
//     //     }

//     //     if (data.translation) {
//     //         const newTranslation = data.translation.trim();
//     //         if (newTranslation) {
//     //             setTranslations(prev => {
//     //                 let lang: keyof typeof translations = 'en';
//     //                 if (data.type === 'translated_french') {
//     //                     lang = 'fr';
//     //                 } else if (data.type === 'translated_chinese') {
//     //                     lang = 'zh';
//     //                 } else if (data.type === 'translated_english') {
//     //                     lang = 'en';
//     //                 } else {
//     //                     return prev;
//     //                 }

//     //                 if (!prev[lang].includes(newTranslation)) {
//     //                     return {
//     //                         ...prev,
//     //                         [lang]: (prev[lang] ? prev[lang] + ' ' : '') + newTranslation
//     //                     };
//     //                 }
//     //                 return prev;
//     //             });
//     //         }
//     //     }
//     // }, []);


//     type Translations = {
//         en: string;
//         fr: string;
//         zh: string;
//     };

//     // const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
//     //     console.log('WebSocket message:', data.type, data);
//     //     const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

//     //     if (lastMessageIdRef.current.has(messageKey)) return;
//     //     lastMessageIdRef.current.add(messageKey);

//     //     setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

//     //     if (data.type === 'processed' && data.processed_text) {
//     //         const newText = data.processed_text.trim();
//     //         if (newText) {
//     //             setProcessedTexts(prev => {
//     //                 if (!prev.includes(newText)) {
//     //                     const updated = [...prev, newText];
//     //                     setOriginalText(updated.join(' '));
//     //                     return updated;
//     //                 }
//     //                 return prev;
//     //             });
//     //         }
//     //     }

//     //     if (data.translation) {
//     //         const newTranslation = data.translation.trim();
//     //         if (newTranslation) {
//     //             // Определяем язык перевода
//     //             let lang: keyof Translations = 'en';
//     //             if (data.type === 'translated_french') {
//     //                 lang = 'fr';
//     //             } else if (data.type === 'translated_chinese') {
//     //                 lang = 'zh';
//     //             } else if (data.type === 'translated_english') {
//     //                 lang = 'en';
//     //             } else {
//     //                 return;
//     //             }

//     //             // Обновляем translations
//     //             setTranslations(prev => ({
//     //                 ...prev,
//     //                 [lang]: prev[lang] ? `${prev[lang]} ${newTranslation}` : newTranslation
//     //             }));

//     //             // Обновляем translatedTexts
//     //             setTranslatedTexts(prev => ({
//     //                 ...prev,
//     //                 [lang]: prev[lang] ? `${prev[lang]} ${newTranslation}` : newTranslation
//     //             }));
//     //         }
//     //     }

//     //     if (data.type === 'error') {
//     //         setError(`Server error: ${data.message || 'Unknown error'}`);
//     //     }
//     // }, []);


//     // const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
//     //     console.log('📨 Обработка WebSocket сообщения:', data.type, data);

//     //     const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

//     //     if (lastMessageIdRef.current.has(messageKey)) {
//     //         console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
//     //         return;
//     //     }

//     //     lastMessageIdRef.current.add(messageKey);

//     //     if (lastMessageIdRef.current.size > 1000) {
//     //         const keysArray = Array.from(lastMessageIdRef.current);
//     //         lastMessageIdRef.current.clear();
//     //         keysArray.slice(-500).forEach(key => lastMessageIdRef.current.add(key));
//     //     }

//     //     setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

//     //     if (data.type === 'processed' && data.processed_text) {
//     //         const newText = data.processed_text.trim();
//     //         if (newText) {
//     //             setProcessedTexts(prev => {
//     //                 if (!prev.includes(newText)) {
//     //                     const updated = [...prev, newText];
//     //                     const fullText = updated.join(' ');
//     //                     setOriginalText(fullText);
//     //                     return updated;
//     //                 }
//     //                 return prev;
//     //             });
//     //         }
//     //     }

//     //     // Обработка переведенных сообщений
//     //     if (data.translation) {
//     //         const newTranslation = data.translation.trim();
//     //         if (newTranslation) {
//     //             setTranslations(prev => {
//     //                 // Определяем язык перевода
//     //                 let lang: keyof Translations = 'en'; // по умолчанию

//     //                 // Обрабатываем только определенные типы сообщений
//     //                 if (data.type === 'translated_french') {
//     //                     lang = 'fr';
//     //                 } else if (data.type === 'translated_chinese') {
//     //                     lang = 'zh';
//     //                 } else if (data.type === 'translated_english') {
//     //                     // Для общего типа 'translated' используем указанный язык
//     //                     // lang = data.language as keyof Translations;
//     //                     lang = 'en';
//     //                 } else {
//     //                     // Игнорируем другие типы сообщений с переводами
//     //                     return prev;
//     //                 }

//     //                 // Проверяем, не добавляли ли мы уже этот перевод
//     //                 if (!prev[lang].includes(newTranslation)) {
//     //                     return {
//     //                         ...prev,
//     //                         [lang]: (prev[lang] ? prev[lang] + ' ' : '') + newTranslation
//     //                     };
//     //                 }
//     //                 return prev;
//     //             });
//     //         }
//     //     }

//     //     if (data.type === 'error') {
//     //         console.error('❌ Ошибка от сервера:', data.message);
//     //         setError(`Ошибка сервера: ${data.message || 'Неизвестная ошибка'}`);
//     //     }
//     // }, []);

//     // const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
//     //     console.log('📨 Обработка WebSocket сообщения:', data.type, data);

//     //     const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

//     //     if (lastMessageIdRef.current.has(messageKey)) {
//     //         console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
//     //         return;
//     //     }

//     //     lastMessageIdRef.current.add(messageKey);

//     //     if (lastMessageIdRef.current.size > 1000) {
//     //         const keysArray = Array.from(lastMessageIdRef.current);
//     //         lastMessageIdRef.current.clear();
//     //         keysArray.slice(-500).forEach(key => lastMessageIdRef.current.add(key));
//     //     }

//     //     setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

//     //     if (data.type === 'processed' && data.processed_text) {
//     //         const newText = data.processed_text.trim();
//     //         if (newText) {
//     //             setProcessedTexts(prev => {
//     //                 if (!prev.includes(newText)) {
//     //                     const updated = [...prev, newText];
//     //                     const fullText = updated.join(' ');
//     //                     setOriginalText(fullText);
//     //                     return updated;
//     //                 }
//     //                 return prev;
//     //             });
//     //         }
//     //     }

//     //     // Обработка переведенных сообщений
//     //     if (data.translation) {
//     //         const newTranslation = data.translation.trim();
//     //         if (newTranslation) {
//     //             setTranslations(prev => {
//     //                 // Определяем язык перевода
//     //                 let lang: keyof Translations = 'en'; // по умолчанию

//     //                 if (data.type === 'translated_french') {
//     //                     lang = 'fr';
//     //                 } else if (data.type === 'translated_chinese') {
//     //                     lang = 'zh';
//     //                 } else if (data.type === 'translated' || data.type === 'translated_english') {
//     //                     lang = 'en';
//     //                 } else {
//     //                     // Игнорируем другие типы сообщений
//     //                     return prev;
//     //                 }

//     //                 // Проверяем, не добавляли ли мы уже этот перевод
//     //                 if (!prev[lang].includes(newTranslation)) {
//     //                     return {
//     //                         ...prev,
//     //                         [lang]: (prev[lang] ? prev[lang] + ' ' : '') + newTranslation
//     //                     };
//     //                 }
//     //                 return prev;
//     //             });
//     //         }
//     //     }

//     //     if (data.type === 'error') {
//     //         console.error('❌ Ошибка от сервера:', data.message);
//     //         setError(`Ошибка сервера: ${data.message || 'Неизвестная ошибка'}`);
//     //     }
//     // }, []);

//     const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
//         console.log('📨 Обработка WebSocket сообщения:', data.type, data);

//         const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

//         if (lastMessageIdRef.current.has(messageKey)) {
//             console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
//             return;
//         }

//         lastMessageIdRef.current.add(messageKey);

//         setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

//         // Обработка оригинального текста
//         if (data.type === 'processed' && data.processed_text) {
//             const newText = data.processed_text.trim();
//             if (newText) {
//                 setProcessedTexts(prev => {
//                     if (!prev.includes(newText)) {
//                         const updated = [...prev, newText];
//                         setOriginalText(updated.join(' '));
//                         return updated;
//                     }
//                     return prev;
//                 });
//             }
//         }

//         // Обработка переводов
//         if (data.translation) {
//             const newTranslation = data.translation.trim();
//             if (newTranslation) {
//                 setTranslations(prev => {
//                     const updated = { ...prev };
//                     let updatedFlag = false;

//                     // Обрабатываем разные типы сообщений с переводами
//                     if (data.type === 'translated') {
//                         // Общий тип перевода - предполагаем, что приходит все сразу
//                         if (data.language === 'en' || data.type.includes('english')) {
//                             if (!updated.en.includes(newTranslation)) {
//                                 updated.en += ' ' + newTranslation;
//                                 updatedFlag = true;
//                             }
//                         }
//                         if (data.language === 'fr' || data.type.includes('french')) {
//                             if (!updated.fr.includes(newTranslation)) {
//                                 updated.fr += ' ' + newTranslation;
//                                 updatedFlag = true;
//                             }
//                         }
//                         if (data.language === 'zh' || data.type.includes('chinese')) {
//                             if (!updated.zh.includes(newTranslation)) {
//                                 updated.zh += ' ' + newTranslation;
//                                 updatedFlag = true;
//                             }
//                         }
//                     }
//                     // Явные типы сообщений для каждого языка
//                     else if (data.type === 'translated_english') {
//                         if (!updated.en.includes(newTranslation)) {
//                             updated.en += ' ' + newTranslation;
//                             updatedFlag = true;
//                         }
//                     }
//                     else if (data.type === 'translated_french') {
//                         if (!updated.fr.includes(newTranslation)) {
//                             updated.fr += ' ' + newTranslation;
//                             updatedFlag = true;
//                         }
//                     }
//                     else if (data.type === 'translated_chinese') {
//                         if (!updated.zh.includes(newTranslation)) {
//                             updated.zh += ' ' + newTranslation;
//                             updatedFlag = true;
//                         }
//                     }

//                     return updatedFlag ? updated : prev;
//                 });
//             }
//         }

//         if (data.type === 'error') {
//             console.error('❌ Ошибка от сервера:', data.message);
//             setError(`Ошибка сервера: ${data.message || 'Неизвестная ошибка'}`);
//         }
//     }, []);

//     const startRecording = useCallback(async () => {

//         if (audioContextRef.current) {
//             audioContextRef.current.close().catch(console.error);
//             audioContextRef.current = null;
//         }

//         try {
//             setError('');
//             setStatus(t('recording.status.requesting_mic'));

//             const newSessionId = generateSessionId();
//             setSessionId(newSessionId);

//             const stream = await navigator.mediaDevices.getUserMedia({
//                 audio: {
//                     sampleRate: 16000,
//                     channelCount: 1,
//                     echoCancellation: false,
//                     noiseSuppression: false,
//                     autoGainControl: false
//                 }
//             });

//             mediaStreamRef.current = stream;
//             setStatus(t('recording.status.connecting_ws'));

//             const ws = new AudioWebSocket();
//             webSocketRef.current = ws;

//             ws.onMessage('transcription', handleWebSocketMessage);
//             ws.onMessage('processed', handleWebSocketMessage);
//             ws.onMessage('translated', handleWebSocketMessage);
//             ws.onMessage('error', handleWebSocketMessage);
//             ws.onMessage('status', handleWebSocketMessage);

//             await ws.connect(newSessionId, {
//                 title: lecture.lecture_title || lecture.title,
//                 lecturer: lecture.lecturer_name || lecture.lecturer,
//                 location: lecture.exact_location || lecture.location,
//                 start_time: lecture.start_time
//             });

//             setIsConnected(true);
//             setStatus(t('recording.status.ws_connected'));

//             const audioContext = new (window.AudioContext || window.webkitAudioContext)({
//                 sampleRate: 16000
//             });
//             audioContextRef.current = audioContext;

//             const source = audioContext.createMediaStreamSource(stream);
//             const processor = audioContext.createScriptProcessor(4096, 1, 1);
//             processorRef.current = processor;

//             processor.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
//                 if (!isRecordingRef.current) return;

//                 const inputBuffer = audioProcessingEvent.inputBuffer;
//                 const inputData = inputBuffer.getChannelData(0);
//                 const pcmData = float32ToPCM16(inputData);
//                 audioBufferRef.current.push(pcmData);

//                 const totalSamples = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
//                 const durationSeconds = totalSamples / 16000;

//                 if (durationSeconds >= 0.2) {
//                     forceFlushBuffer();
//                 }
//             };

//             source.connect(processor);
//             processor.connect(audioContext.destination);
//             flushIntervalRef.current = setInterval(forceFlushBuffer, 10000);

//             setIsRecording(true);
//             isRecordingRef.current = true;
//             setStatus(t('recording.status.recording'));
//             setIsPreviewMode(false);

//         } catch (err) {
//             console.error('Recording error:', err);
//             setError(t('recording.errors.mic_access', { error: err instanceof Error ? err.message : String(err) }));
//             setStatus(t('recording.errors.recording_failed'));
//         }
//     }, [t, generateSessionId, handleWebSocketMessage, float32ToPCM16, forceFlushBuffer, lecture]);

//     // const stopRecording = useCallback(() => {
//     //     setIsRecording(false);
//     //     isRecordingRef.current = false;

//     //     if (flushIntervalRef.current) {
//     //         clearInterval(flushIntervalRef.current);
//     //         flushIntervalRef.current = null;
//     //     }

//     //     forceFlushBuffer();

//     //     if (processorRef.current) processorRef.current.disconnect();
//     //     if (audioContextRef.current) audioContextRef.current.close();
//     //     if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
//     //     if (webSocketRef.current) webSocketRef.current.disconnect();

//     //     setIsConnected(false);
//     //     setStatus(t('recording.status.stopped'));
//     // }, [t, forceFlushBuffer]);

//     const stopRecording = useCallback(() => {
//         setIsRecording(false);
//         isRecordingRef.current = false;

//         if (flushIntervalRef.current) {
//             clearInterval(flushIntervalRef.current);
//             flushIntervalRef.current = null;
//         }

//         forceFlushBuffer();

//         // Добавляем проверку на состояние AudioContext
//         if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
//             audioContextRef.current.close().catch(e => {
//                 console.error('Error closing AudioContext:', e);
//             });
//         }

//         if (processorRef.current) processorRef.current.disconnect();

//         if (mediaStreamRef.current) {
//             mediaStreamRef.current.getTracks().forEach(track => track.stop());
//             mediaStreamRef.current = null;
//         }

//         if (webSocketRef.current) {
//             webSocketRef.current.disconnect();
//             webSocketRef.current = null;
//         }

//         setIsConnected(false);
//         setStatus(t('recording.status.stopped'));
//     }, [t, forceFlushBuffer]);

//     const handleStartLecture = () => {
//         // Сохраняем все изменения перед стартом
//         setLecture(prev => ({
//             ...prev,
//             lecture_title: editedValues.lecture_title,
//             lecturer_name: editedValues.lecturer_name,
//             exact_location: editedValues.exact_location,
//             start_time: editedValues.start_time,
//             title: editedValues.lecture_title,
//             lecturer: editedValues.lecturer_name,
//             location: editedValues.exact_location
//         }));

//         setShowStartModal(true);
//         setTimeout(() => {
//             startRecording();
//             setShowStartModal(false);
//         }, 3000);
//     };

//     const confirmStopLecture = () => {
//         stopRecording();
//         setIsFinished(true);
//         setIsRecording(false);
//         setIsPaused(false);
//         setShowStopModal(false);
//     };

//     const handleTogglePause = () => {
//         if (isPaused) {
//             setIsPaused(false);
//             setShowPauseModal(false);
//             isRecordingRef.current = true;
//             setStatus(t('recording.status.recording'));
//         } else {
//             setShowPauseModal(true);
//         }
//     };

//     const confirmPauseLecture = () => {
//         setIsPaused(true);
//         setShowPauseModal(false);
//         isRecordingRef.current = false;
//         setStatus(t('recording.status.paused'));
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

//     const handleEditClick = (fieldName: string) => {
//         setEditingField(fieldName);
//     };

//     const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setEditedValues(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleSaveField = (fieldName: string) => {
//         setLecture(prev => ({
//             ...prev,
//             [fieldName]: editedValues[fieldName as keyof typeof editedValues],
//             ...(fieldName === 'lecture_title' && { title: editedValues.lecture_title }),
//             ...(fieldName === 'lecturer_name' && { lecturer: editedValues.lecturer_name }),
//             ...(fieldName === 'exact_location' && { location: editedValues.exact_location })
//         }));
//         setEditingField(null);
//     };

//     const handleCancelEdit = () => {
//         setEditedValues({
//             lecture_title: lecture.lecture_title || lecture.title,
//             lecturer_name: lecture.lecturer_name || lecture.lecturer,
//             exact_location: lecture.exact_location || lecture.location,
//             start_time: lecture.start_time
//         });
//         setEditingField(null);
//     };

//     const formatDateTimeForInput = (dateTimeString: string) => {
//         if (!dateTimeString) return '';
//         const date = new Date(dateTimeString);
//         return date.toISOString().slice(0, 16);
//     };

//     useEffect(() => {
//         return () => {
//             if (isRecording) {
//                 stopRecording();
//             }
//         };
//     }, [isRecording, stopRecording]);

//     if (!state?.lecture) {
//         navigate('/recorder', { replace: true });
//         return null;
//     }

//     return (
//         <div className={commonStyles.appContainer}>
//             <div className={commonStyles.mainContent}>
//                 <Header />
//                 <Breadcrumbs items={getBreadcrumbs()} />

//                 <h1 className={commonStyles.sectionHeader}>
//                     {t('recording.title', { title: lecture.lecture_title || lecture.title })}
//                 </h1>

//                 {isPreviewMode ? (
//                     <div className={commonStyles.infoCard}>
//                         <h2 className={commonStyles.subHeader}>
//                             {t('recording.preview.header')}
//                         </h2>

//                         {/* Поле "Название лекции" */}
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.title')}:</span>
//                             {editingField === 'lecture_title' ? (
//                                 <div className={commonStyles.editFieldContainer}>
//                                     <input
//                                         type="text"
//                                         name="lecture_title"
//                                         value={editedValues.lecture_title}
//                                         onChange={handleFieldChange}
//                                         className={commonStyles.editInput}
//                                         autoFocus
//                                     />
//                                     <div className={commonStyles.editButtons}>
//                                         <button
//                                             onClick={() => handleSaveField('lecture_title')}
//                                             className={commonStyles.smallPrimaryButton}
//                                         >
//                                             {t('common.save')}
//                                         </button>
//                                         <button
//                                             onClick={handleCancelEdit}
//                                             className={commonStyles.smallSecondaryButton}
//                                         >
//                                             {t('common.cancel')}
//                                         </button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className={commonStyles.fieldWithEdit}>
//                                     <span>{lecture.lecture_title || lecture.title}</span>
//                                     <button
//                                         onClick={() => handleEditClick('lecture_title')}
//                                         className={commonStyles.editButton}
//                                         title={t('common.edit')}
//                                     >
//                                         ✏️
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Поле "Лектор" */}
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.lecturer')}:</span>
//                             {editingField === 'lecturer_name' ? (
//                                 <div className={commonStyles.editFieldContainer}>
//                                     <input
//                                         type="text"
//                                         name="lecturer_name"
//                                         value={editedValues.lecturer_name}
//                                         onChange={handleFieldChange}
//                                         className={commonStyles.editInput}
//                                         autoFocus
//                                     />
//                                     <div className={commonStyles.editButtons}>
//                                         <button
//                                             onClick={() => handleSaveField('lecturer_name')}
//                                             className={commonStyles.smallPrimaryButton}
//                                         >
//                                             {t('common.save')}
//                                         </button>
//                                         <button
//                                             onClick={handleCancelEdit}
//                                             className={commonStyles.smallSecondaryButton}
//                                         >
//                                             {t('common.cancel')}
//                                         </button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className={commonStyles.fieldWithEdit}>
//                                     <span>{lecture.lecturer_name || lecture.lecturer}</span>
//                                     <button
//                                         onClick={() => handleEditClick('lecturer_name')}
//                                         className={commonStyles.editButton}
//                                         title={t('common.edit')}
//                                     >
//                                         ✏️
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Поле "Время начала" */}
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.start')}:</span>
//                             {editingField === 'start_time' ? (
//                                 <div className={commonStyles.editFieldContainer}>
//                                     <input
//                                         type="datetime-local"
//                                         name="start_time"
//                                         value={formatDateTimeForInput(editedValues.start_time)}
//                                         onChange={handleFieldChange}
//                                         className={commonStyles.editInput}
//                                         autoFocus
//                                     />
//                                     <div className={commonStyles.editButtons}>
//                                         <button
//                                             onClick={() => handleSaveField('start_time')}
//                                             className={commonStyles.smallPrimaryButton}
//                                         >
//                                             {t('common.save')}
//                                         </button>
//                                         <button
//                                             onClick={handleCancelEdit}
//                                             className={commonStyles.smallSecondaryButton}
//                                         >
//                                             {t('common.cancel')}
//                                         </button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className={commonStyles.fieldWithEdit}>
//                                     <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span>
//                                     <button
//                                         onClick={() => handleEditClick('start_time')}
//                                         className={commonStyles.editButton}
//                                         title={t('common.edit')}
//                                     >
//                                         ✏️
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Поле "Местоположение" */}
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.location')}:</span>
//                             {editingField === 'exact_location' ? (
//                                 <div className={commonStyles.editFieldContainer}>
//                                     <input
//                                         type="text"
//                                         name="exact_location"
//                                         value={editedValues.exact_location}
//                                         onChange={handleFieldChange}
//                                         className={commonStyles.editInput}
//                                         autoFocus
//                                     />
//                                     <div className={commonStyles.editButtons}>
//                                         <button
//                                             onClick={() => handleSaveField('exact_location')}
//                                             className={commonStyles.smallPrimaryButton}
//                                         >
//                                             {t('common.save')}
//                                         </button>
//                                         <button
//                                             onClick={handleCancelEdit}
//                                             className={commonStyles.smallSecondaryButton}
//                                         >
//                                             {t('common.cancel')}
//                                         </button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className={commonStyles.fieldWithEdit}>
//                                     <span>{lecture.exact_location || lecture.location}</span>
//                                     <button
//                                         onClick={() => handleEditClick('exact_location')}
//                                         className={commonStyles.editButton}
//                                         title={t('common.edit')}
//                                     >
//                                         ✏️
//                                     </button>
//                                 </div>
//                             )}
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
//                                 <span>{lecture.lecture_title || lecture.title}</span>
//                             </div>
//                             <div className={commonStyles.statusItem}>
//                                 <span>{t('recording.lecture.lecturer')}:</span>
//                                 <span>{lecture.lecturer_name || lecture.lecturer}</span>
//                             </div>
//                             <div className={commonStyles.statusItem}>
//                                 <span>{t('recording.lecture.start')}:</span>
//                                 <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span>
//                             </div>
//                             <div className={commonStyles.statusItem}>
//                                 <span>{t('recording.lecture.location')}:</span>
//                                 <span>{lecture.exact_location || lecture.location}</span>
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
//                                     {showFullText && (
//                                         <div className={commonStyles.LectureFullText}>
//                                             {originalText || t('recording.text_unavailable')}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className={commonStyles.listItemLecture}>
//                                 <h2>{t('recording.translated_text', {
//                                     language: t(`language.${language}`)
//                                 })}</h2>

//                                 <select
//                                     className={commonStyles.filterSelect}
//                                     value={language}
//                                     onChange={(e) => setLanguage(e.target.value)}
//                                     style={{ marginBottom: '15px' }}
//                                 >
//                                     <option value="en">{t('language.english')}</option>
//                                     <option value="fr">{t('language.french')}</option>
//                                     <option value="zh">{t('language.chinese')}</option>
//                                 </select>

//                                 <div className={commonStyles.ItemLecture}>
//                                     {showFullText && (
//                                         // <div className={commonStyles.LectureFullText}>
//                                         //     {translations[language as keyof typeof translations] || t('recording.translation_unavailable')}
//                                         // </div>
//                                         <div className={commonStyles.LectureFullText}>
//                                             {translations[language as keyof Translations] || t('recording.translation_unavailable')}
//                                         </div>
//                                     )}
//                                     <div className={commonStyles.ItemLectureButtons}>
//                                         {showFullText && (
//                                             <button
//                                                 className={commonStyles.textButton}
//                                                 onClick={() => translations[language as keyof typeof translations] &&
//                                                     speakText(translations[language as keyof typeof translations], language)}
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

//                 {showStartModal && (
//                     <div className={commonStyles.modalOverlay}>
//                         <div className={commonStyles.modal}>
//                             <h3>{t('recording.starting_lecture')}</h3>
//                             <p>{t('recording.starting_message')}</p>
//                             <div style={{
//                                 display: 'flex',
//                                 justifyContent: 'center',
//                                 marginTop: '20px'
//                             }}>
//                                 <div className={commonStyles.loader}></div>
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
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
import { AudioWebSocket } from '../../services/api';

type LectureData = {
    id: string;
    title: string;
    lecturer: string;
    start_time: string;
    duration: string;
    location: string;
    createdAt: string;
    lecture_title?: string;
    lecturer_name?: string;
    exact_location?: string;
};

type WebSocketMessage = {
    type: 'transcription' | 'processed' | 'translated' | 'error' | 'status' |
    'translated_french' | 'translated_chinese' | 'translated_english';
    language?: 'en' | 'fr' | 'ru' | 'zh';
    message?: string;
    status?: string;
    timestamp?: number;
    confidence?: number;
    text?: string;
    original_text?: string;
    processed_text?: string;
    translation?: string;
    _server_id?: string;
    _timestamp?: string;
    session_id?: string;
};

const RecordingLecturePage = () => {
    const { t } = useTranslation();
    const { state } = useLocation();
    const { lecture: initialLecture, isPreview = true } = state as {
        lecture: LectureData;
        isPreview?: boolean
    };

    const [lecture, setLecture] = useState<LectureData>({
        ...initialLecture,
        lecture_title: initialLecture.lecture_title || initialLecture.title,
        lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
        exact_location: initialLecture.exact_location || initialLecture.location
    });

    const [isRecording, setIsRecording] = useState(!isPreview);
    const [isPaused, setIsPaused] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [originalText, setOriginalText] = useState('');
    const [translations, setTranslations] = useState({ en: '', fr: '', zh: '' });
    const lastMessageIdRef = useRef<Set<string>>(new Set());
    const [liveMessages, setLiveMessages] = useState<WebSocketMessage[]>([]);
    const [processedTexts, setProcessedTexts] = useState<string[]>([]);
    const [language, setLanguage] = useState<'en' | 'fr' | 'zh'>('en');
    const [showStopModal, setShowStopModal] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [showFullText, setShowFullText] = useState(true);
    const userRole = getRoleFromStorage();
    const navigate = useNavigate();
    const [isPreviewMode, setIsPreviewMode] = useState(isPreview);
    const [showStartModal, setShowStartModal] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [status, setStatus] = useState(t('recording.status.ready'));
    const [error, setError] = useState('');

    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const audioBufferRef = useRef<Int16Array[]>([]);
    const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const webSocketRef = useRef<AudioWebSocket | null>(null);
    const isRecordingRef = useRef(false);

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

    const [editingField, setEditingField] = useState<string | null>(null);
    const [editedValues, setEditedValues] = useState({
        lecture_title: initialLecture.lecture_title || initialLecture.title,
        lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
        exact_location: initialLecture.exact_location || initialLecture.location,
        start_time: initialLecture.start_time
    });

    const generateSessionId = useCallback((): string => {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }, []);

    const float32ToPCM16 = useCallback((float32Array: Float32Array): Int16Array => {
        const pcm16 = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const sample = Math.max(-1, Math.min(1, float32Array[i]));
            pcm16[i] = Math.round(sample * 0x7FFF);
        }
        return pcm16;
    }, []);

    const sendPCMData = useCallback((pcmData: Int16Array) => {
        if (webSocketRef.current && webSocketRef.current.isConnected) {
            const arrayBuffer = pcmData.buffer.slice(pcmData.byteOffset, pcmData.byteOffset + pcmData.byteLength);
            const uint8Array = new Uint8Array(arrayBuffer);
            const base64Data = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
            webSocketRef.current.sendAudioChunk(base64Data);
        }
    }, []);

    const forceFlushBuffer = useCallback(() => {
        if (isRecordingRef.current && audioBufferRef.current.length > 0) {
            const totalLength = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
            const combinedPCM = new Int16Array(totalLength);

            let offset = 0;
            for (const chunk of audioBufferRef.current) {
                combinedPCM.set(chunk, offset);
                offset += chunk.length;
            }

            sendPCMData(combinedPCM);
            audioBufferRef.current = [];
        }
    }, [sendPCMData]);

    // const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    //     console.log('📨 Обработка WebSocket сообщения:', data.type, data);

    //     const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

    //     if (lastMessageIdRef.current.has(messageKey)) {
    //         console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
    //         return;
    //     }

    //     lastMessageIdRef.current.add(messageKey);

    //     setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

    //     // Обработка оригинального текста
    //     if (data.type === 'processed' && data.processed_text) {
    //         const newText = data.processed_text.trim();
    //         if (newText) {
    //             setProcessedTexts(prev => {
    //                 if (!prev.includes(newText)) {
    //                     const updated = [...prev, newText];
    //                     setOriginalText(updated.join(' '));
    //                     return updated;
    //                 }
    //                 return prev;
    //             });
    //         }
    //     }

    //     // Обработка переводов
    //     if (data.translation) {
    //         const newTranslation = data.translation.trim();
    //         if (newTranslation) {
    //             setTranslations(prev => {
    //                 const updated = { ...prev };
    //                 let updatedFlag = false;

    //                 // Обрабатываем разные типы сообщений с переводами
    //                 if (data.type === 'translated') {
    //                     // Общий тип перевода - предполагаем, что приходит все сразу
    //                     if (data.language === 'en' || data.type.includes('english')) {
    //                         if (!updated.en.includes(newTranslation)) {
    //                             updated.en += ' ' + newTranslation;
    //                             updatedFlag = true;
    //                         }
    //                     }
    //                     if (data.language === 'fr' || data.type.includes('french')) {
    //                         if (!updated.fr.includes(newTranslation)) {
    //                             updated.fr += ' ' + newTranslation;
    //                             updatedFlag = true;
    //                         }
    //                     }
    //                     if (data.language === 'zh' || data.type.includes('chinese')) {
    //                         if (!updated.zh.includes(newTranslation)) {
    //                             updated.zh += ' ' + newTranslation;
    //                             updatedFlag = true;
    //                         }
    //                     }
    //                 }
    //                 // Явные типы сообщений для каждого языка
    //                 else if (data.type === 'translated_english') {
    //                     if (!updated.en.includes(newTranslation)) {
    //                         updated.en += ' ' + newTranslation;
    //                         updatedFlag = true;
    //                     }
    //                 }
    //                 else if (data.type === 'translated_french') {
    //                     if (!updated.fr.includes(newTranslation)) {
    //                         updated.fr += ' ' + newTranslation;
    //                         updatedFlag = true;
    //                     }
    //                 }
    //                 else if (data.type === 'translated_chinese') {
    //                     if (!updated.zh.includes(newTranslation)) {
    //                         updated.zh += ' ' + newTranslation;
    //                         updatedFlag = true;
    //                     }
    //                 }

    //                 return updatedFlag ? updated : prev;
    //             });
    //         }
    //     }

    //     if (data.type === 'error') {
    //         console.error('❌ Ошибка от сервера:', data.message);
    //         setError(`Ошибка сервера: ${data.message || 'Неизвестная ошибка'}`);
    //     }
    // }, []);

    // const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    //     console.log('📨 Обработка WebSocket сообщения:', data.type, data);

    //     const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

    //     if (lastMessageIdRef.current.has(messageKey)) {
    //         console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
    //         return;
    //     }

    //     lastMessageIdRef.current.add(messageKey);

    //     if (lastMessageIdRef.current.size > 1000) {
    //         const keysArray = Array.from(lastMessageIdRef.current);
    //         lastMessageIdRef.current.clear();
    //         keysArray.slice(-500).forEach(key => lastMessageIdRef.current.add(key));
    //     }

    //     setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

    //     if (data.type === 'processed' && data.processed_text) {
    //         const newText = data.processed_text.trim();
    //         if (newText) {
    //             setProcessedTexts(prev => {
    //                 if (!prev.includes(newText)) {
    //                     const updated = [...prev, newText];
    //                     const fullText = updated.join(' ');
    //                     setOriginalText(fullText);
    //                     return updated;
    //                 }
    //                 return prev;
    //             });
    //         }
    //     }

    //     // Обработка переведенных сообщений
    //     if (data.translation) {
    //         const newTranslation = data.translation.trim();
    //         if (newTranslation) {
    //             setTranslations(prev => {
    //                 // Определяем язык перевода
    //                 let lang: keyof Translations = 'en'; // по умолчанию

    //                 // Обрабатываем только определенные типы сообщений
    //                 if (data.type === 'translated_french') {
    //                     lang = 'fr';
    //                 } else if (data.type === 'translated_chinese') {
    //                     lang = 'zh';
    //                 } else if (data.type === 'translated_english') {
    //                     // Для общего типа 'translated' используем указанный язык
    //                     // lang = data.language as keyof Translations;
    //                     lang = 'en';
    //                 } else {
    //                     // Игнорируем другие типы сообщений с переводами
    //                     return prev;
    //                 }

    //                 // Проверяем, не добавляли ли мы уже этот перевод
    //                 if (!prev[lang].includes(newTranslation)) {
    //                     return {
    //                         ...prev,
    //                         [lang]: (prev[lang] ? prev[lang] + ' ' : '') + newTranslation
    //                     };
    //                 }
    //                 return prev;
    //             });
    //         }
    //     }

    //     if (data.type === 'error') {
    //         console.error('❌ Ошибка от сервера:', data.message);
    //         setError(`Ошибка сервера: ${data.message || 'Неизвестная ошибка'}`);
    //     }
    // }, []);

    const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
        console.log('📨 Обработка WebSocket сообщения:', data.type, data);

        const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

        if (lastMessageIdRef.current.has(messageKey)) {
            console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
            return;
        }

        lastMessageIdRef.current.add(messageKey);

        setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

        // Обработка оригинального текста
        if (data.type === 'processed' && data.processed_text) {
            const newText = data.processed_text.trim();
            if (newText) {
                setProcessedTexts(prev => {
                    if (!prev.includes(newText)) {
                        const updated = [...prev, newText];
                        setOriginalText(updated.join(' '));
                        return updated;
                    }
                    return prev;
                });
            }
        }

        // Обработка переводов
        if (data.translation) {
            const newTranslation = data.translation.trim();
            if (newTranslation) {
                setTranslations(prev => {
                    const updated = { ...prev };
                    let updatedFlag = false;

                    // Определяем язык перевода
                    let lang: keyof Translations = 'en';
                    if (data.type === 'translated_french') {
                        lang = 'fr';
                    } else if (data.type === 'translated_chinese') {
                        lang = 'zh';
                    } else if (data.type === 'translated_english' || data.type === 'translated') {
                        lang = 'en';
                    }

                    // Обновляем только если перевод для этого языка еще не содержит новый текст
                    if (!updated[lang].includes(newTranslation)) {
                        updated[lang] = (updated[lang] ? updated[lang] + ' ' : '') + newTranslation;
                        updatedFlag = true;
                    }

                    return updatedFlag ? updated : prev;
                });
            }
        }

        if (data.type === 'error') {
            console.error('❌ Ошибка от сервера:', data.message);
            setError(`Ошибка сервера: ${data.message || 'Неизвестная ошибка'}`);
        }
    }, []);


    const startRecording = useCallback(async () => {
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }

        try {
            setError('');
            setStatus(t('recording.status.requesting_mic'));

            const newSessionId = generateSessionId();
            setSessionId(newSessionId);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            mediaStreamRef.current = stream;
            setStatus(t('recording.status.connecting_ws'));

            const ws = new AudioWebSocket();
            webSocketRef.current = ws;

            ws.onMessage('transcription', handleWebSocketMessage);
            ws.onMessage('processed', handleWebSocketMessage);
            ws.onMessage('translated', handleWebSocketMessage);
            ws.onMessage('error', handleWebSocketMessage);
            ws.onMessage('status', handleWebSocketMessage);

            await ws.connect(newSessionId, {
                title: lecture.lecture_title || lecture.title,
                lecturer: lecture.lecturer_name || lecture.lecturer,
                location: lecture.exact_location || lecture.location,
                start_time: lecture.start_time
            });

            setIsConnected(true);
            setStatus(t('recording.status.ws_connected'));

            const audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
                if (!isRecordingRef.current) return;

                const inputBuffer = audioProcessingEvent.inputBuffer;
                const inputData = inputBuffer.getChannelData(0);
                const pcmData = float32ToPCM16(inputData);
                audioBufferRef.current.push(pcmData);

                const totalSamples = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
                const durationSeconds = totalSamples / 16000;

                if (durationSeconds >= 0.2) {
                    forceFlushBuffer();
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);
            flushIntervalRef.current = setInterval(forceFlushBuffer, 10000);

            setIsRecording(true);
            isRecordingRef.current = true;
            setStatus(t('recording.status.recording'));
            setIsPreviewMode(false);

        } catch (err) {
            console.error('Recording error:', err);
            setError(t('recording.errors.mic_access', { error: err instanceof Error ? err.message : String(err) }));
            setStatus(t('recording.errors.recording_failed'));
        }
    }, [t, generateSessionId, handleWebSocketMessage, float32ToPCM16, forceFlushBuffer, lecture]);

    const stopRecording = useCallback(() => {
        setIsRecording(false);
        isRecordingRef.current = false;

        if (flushIntervalRef.current) {
            clearInterval(flushIntervalRef.current);
            flushIntervalRef.current = null;
        }

        forceFlushBuffer();

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => {
                console.error('Error closing AudioContext:', e);
            });
        }

        if (processorRef.current) processorRef.current.disconnect();

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (webSocketRef.current) {
            webSocketRef.current.disconnect();
            webSocketRef.current = null;
        }

        setIsConnected(false);
        setStatus(t('recording.status.stopped'));
    }, [t, forceFlushBuffer]);

    const handleStartLecture = () => {
        setLecture(prev => ({
            ...prev,
            lecture_title: editedValues.lecture_title,
            lecturer_name: editedValues.lecturer_name,
            exact_location: editedValues.exact_location,
            start_time: editedValues.start_time,
            title: editedValues.lecture_title,
            lecturer: editedValues.lecturer_name,
            location: editedValues.exact_location
        }));

        setShowStartModal(true);
        setTimeout(() => {
            startRecording();
            setShowStartModal(false);
        }, 3000);
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
            setStatus(t('recording.status.recording'));
        } else {
            setShowPauseModal(true);
        }
    };

    const confirmPauseLecture = () => {
        setIsPaused(true);
        setShowPauseModal(false);
        isRecordingRef.current = false;
        setStatus(t('recording.status.paused'));
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

    const handleEditClick = (fieldName: string) => {
        setEditingField(fieldName);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveField = (fieldName: string) => {
        setLecture(prev => ({
            ...prev,
            [fieldName]: editedValues[fieldName as keyof typeof editedValues],
            ...(fieldName === 'lecture_title' && { title: editedValues.lecture_title }),
            ...(fieldName === 'lecturer_name' && { lecturer: editedValues.lecturer_name }),
            ...(fieldName === 'exact_location' && { location: editedValues.exact_location })
        }));
        setEditingField(null);
    };

    const handleCancelEdit = () => {
        setEditedValues({
            lecture_title: lecture.lecture_title || lecture.title,
            lecturer_name: lecture.lecturer_name || lecture.lecturer,
            exact_location: lecture.exact_location || lecture.location,
            start_time: lecture.start_time
        });
        setEditingField(null);
    };

    const formatDateTimeForInput = (dateTimeString: string) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toISOString().slice(0, 16);
    };

    useEffect(() => {
        return () => {
            if (isRecording) {
                stopRecording();
            }
        };
    }, [isRecording, stopRecording]);

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
                    {t('recording.title', { title: lecture.lecture_title || lecture.title })}
                </h1>

                {isPreviewMode ? (
                    <div className={commonStyles.infoCard}>
                        <h2 className={commonStyles.subHeader}>
                            {t('recording.preview.header')}
                        </h2>

                        {/* Поле "Название лекции" */}
                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.title')}:</span>
                            {editingField === 'lecture_title' ? (
                                <div className={commonStyles.editFieldContainer}>
                                    <input
                                        type="text"
                                        name="lecture_title"
                                        value={editedValues.lecture_title}
                                        onChange={handleFieldChange}
                                        className={commonStyles.editInput}
                                        autoFocus
                                    />
                                    <div className={commonStyles.editButtons}>
                                        <button
                                            onClick={() => handleSaveField('lecture_title')}
                                            className={commonStyles.smallPrimaryButton}
                                        >
                                            {t('common.save')}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={commonStyles.smallSecondaryButton}
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={commonStyles.fieldWithEdit}>
                                    <span>{lecture.lecture_title || lecture.title}</span>
                                    <button
                                        onClick={() => handleEditClick('lecture_title')}
                                        className={commonStyles.editButton}
                                        title={t('common.edit')}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Поле "Лектор" */}
                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.lecturer')}:</span>
                            {editingField === 'lecturer_name' ? (
                                <div className={commonStyles.editFieldContainer}>
                                    <input
                                        type="text"
                                        name="lecturer_name"
                                        value={editedValues.lecturer_name}
                                        onChange={handleFieldChange}
                                        className={commonStyles.editInput}
                                        autoFocus
                                    />
                                    <div className={commonStyles.editButtons}>
                                        <button
                                            onClick={() => handleSaveField('lecturer_name')}
                                            className={commonStyles.smallPrimaryButton}
                                        >
                                            {t('common.save')}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={commonStyles.smallSecondaryButton}
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={commonStyles.fieldWithEdit}>
                                    <span>{lecture.lecturer_name || lecture.lecturer}</span>
                                    <button
                                        onClick={() => handleEditClick('lecturer_name')}
                                        className={commonStyles.editButton}
                                        title={t('common.edit')}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Поле "Время начала" */}
                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.start')}:</span>
                            {editingField === 'start_time' ? (
                                <div className={commonStyles.editFieldContainer}>
                                    <input
                                        type="datetime-local"
                                        name="start_time"
                                        value={formatDateTimeForInput(editedValues.start_time)}
                                        onChange={handleFieldChange}
                                        className={commonStyles.editInput}
                                        autoFocus
                                    />
                                    <div className={commonStyles.editButtons}>
                                        <button
                                            onClick={() => handleSaveField('start_time')}
                                            className={commonStyles.smallPrimaryButton}
                                        >
                                            {t('common.save')}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={commonStyles.smallSecondaryButton}
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={commonStyles.fieldWithEdit}>
                                    <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span>
                                    <button
                                        onClick={() => handleEditClick('start_time')}
                                        className={commonStyles.editButton}
                                        title={t('common.edit')}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Поле "Местоположение" */}
                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.location')}:</span>
                            {editingField === 'exact_location' ? (
                                <div className={commonStyles.editFieldContainer}>
                                    <input
                                        type="text"
                                        name="exact_location"
                                        value={editedValues.exact_location}
                                        onChange={handleFieldChange}
                                        className={commonStyles.editInput}
                                        autoFocus
                                    />
                                    <div className={commonStyles.editButtons}>
                                        <button
                                            onClick={() => handleSaveField('exact_location')}
                                            className={commonStyles.smallPrimaryButton}
                                        >
                                            {t('common.save')}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={commonStyles.smallSecondaryButton}
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={commonStyles.fieldWithEdit}>
                                    <span>{lecture.exact_location || lecture.location}</span>
                                    <button
                                        onClick={() => handleEditClick('exact_location')}
                                        className={commonStyles.editButton}
                                        title={t('common.edit')}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}
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
                                <span>{lecture.lecture_title || lecture.title}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>{t('recording.lecture.lecturer')}:</span>
                                <span>{lecture.lecturer_name || lecture.lecturer}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>{t('recording.lecture.start')}:</span>
                                <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span>
                            </div>
                            <div className={commonStyles.statusItem}>
                                <span>{t('recording.lecture.location')}:</span>
                                <span>{lecture.exact_location || lecture.location}</span>
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
                                    {showFullText && (
                                        <div className={commonStyles.LectureFullText}>
                                            {originalText || t('recording.text_unavailable')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* <div className={commonStyles.listItemLecture}>
                                <h2>{t('recording.translated_text', {
                                    language: t(`language.${language}`)
                                })}</h2>

                                <select
                                    className={commonStyles.filterSelect}
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'zh')}
                                    style={{ marginBottom: '15px' }}
                                >
                                    <option value="en">{t('language.english')}</option>
                                    <option value="fr">{t('language.french')}</option>
                                    <option value="zh">{t('language.chinese')}</option>
                                </select>

                                <div className={commonStyles.ItemLecture}>
                                    {showFullText && (
                                        <div className={commonStyles.LectureFullText}>
                                            {translations[language] || t('recording.translation_unavailable')}
                                        </div>
                                    )}
                                    <div className={commonStyles.ItemLectureButtons}>
                                        {showFullText && (
                                            <button
                                                className={commonStyles.textButton}
                                                onClick={() => translations[language] &&
                                                    speakText(translations[language], language)}
                                                title={t('speech.synthesize')}
                                                disabled={!translations[language]}
                                            >
                                                {t('speech.synthesize')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div> */}

                            <div className={commonStyles.listItemLecture}>
                                <h2>{t('recording.translated_text', {
                                    language: t(`language.${language}`)
                                })}</h2>

                                <select
                                    className={commonStyles.filterSelect}
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'zh')}
                                    style={{ marginBottom: '15px' }}
                                >
                                    <option value="en">{t('language.english')}</option>
                                    <option value="fr">{t('language.french')}</option>
                                    <option value="zh">{t('language.chinese')}</option>
                                </select>

                                <div className={commonStyles.ItemLecture}>
                                    {showFullText && (
                                        <div className={commonStyles.LectureFullText}>
                                            {translations[language] || t('recording.translation_unavailable')}
                                        </div>
                                    )}
                                    <div className={commonStyles.ItemLectureButtons}>
                                        {showFullText && translations[language] && (
                                            <button
                                                className={commonStyles.textButton}
                                                onClick={() => speakText(translations[language], language)}
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

                {showStartModal && (
                    <div className={commonStyles.modalOverlay}>
                        <div className={commonStyles.modal}>
                            <h3>{t('recording.starting_lecture')}</h3>
                            <p>{t('recording.starting_message')}</p>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: '20px'
                            }}>
                                <div className={commonStyles.loader}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordingLecturePage;