// import { useState, useEffect, useRef, useCallback } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useLocation, useNavigate } from 'react-router-dom';
// import commonStyles from '../commonStyles.module.css';
// import Header from '../../components/Header/Header';
// import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
// import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
// import LectureData from '../../types/Lecture';
// import { AudioWebSocket } from '../../services/api';
// import { Mic, MicOff, Copy, Play, Square } from 'lucide-react';

// type WebSocketMessage = {
//     type: 'transcription' | 'processed' | 'translated' | 'error' | 'status';
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

//     // Audio recording states
//     const [isConnected, setIsConnected] = useState(false);
//     const [sessionId, setSessionId] = useState('');
//     const [status, setStatus] = useState(t('recording.status.ready'));
//     const [error, setError] = useState('');
//     const [transcriptions, setTranscriptions] = useState<any[]>([]);

//     // Refs for audio
//     const audioContextRef = useRef<AudioContext | null>(null);
//     const mediaStreamRef = useRef<MediaStream | null>(null);
//     const processorRef = useRef<ScriptProcessorNode | null>(null);
//     const audioBufferRef = useRef<Int16Array[]>([]);
//     const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);
//     const webSocketRef = useRef<AudioWebSocket | null>(null);
//     const isRecordingRef = useRef(false);

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

//     const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
//         console.log('WebSocket message:', data);

//         if (data.type === 'transcription' && data.text && data.timestamp) {
//             setTranscriptions(prev => [...prev.slice(-9), {
//                 text: data.text as string,
//                 confidence: data.confidence || 0,
//                 timestamp: data.timestamp as number
//             }]);
//             setOriginalText(prev => prev + ' ' + data.text);
//         } else if (data.type === 'processed' && data.processed_text) {
//             setOriginalText(prev => prev + ' ' + data.processed_text);
//         } else if (data.type === 'translated' && data.translation) {
//             setTranslatedText(prev => prev + ' ' + data.translation);
//         } else if (data.type === 'error' && data.message) {
//             setError(data.message);
//         } else if (data.type === 'status' && (data.status || data.message)) {
//             setStatus(data.status || data.message || '');
//         }
//     }, []);

//     const startRecording = useCallback(async () => {
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

//             await ws.connect(newSessionId);
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
//                     const totalLength = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
//                     const combinedPCM = new Int16Array(totalLength);

//                     let offset = 0;
//                     for (const chunk of audioBufferRef.current) {
//                         combinedPCM.set(chunk, offset);
//                         offset += chunk.length;
//                     }

//                     sendPCMData(combinedPCM);
//                     audioBufferRef.current = [];
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

//             if (err instanceof Error) {
//                 if (err.name === 'NotAllowedError') {
//                     setError(t('recording.errors.mic_permission'));
//                 } else if (err.name === 'NotFoundError') {
//                     setError(t('recording.errors.mic_not_found'));
//                 }
//             }
//         }
//     }, [t, generateSessionId, handleWebSocketMessage, float32ToPCM16, sendPCMData, forceFlushBuffer]);

//     const stopRecording = useCallback(() => {
//         setIsRecording(false);
//         isRecordingRef.current = false;

//         if (flushIntervalRef.current) {
//             clearInterval(flushIntervalRef.current);
//             flushIntervalRef.current = null;
//         }

//         if (audioBufferRef.current.length > 0) {
//             forceFlushBuffer();
//         }

//         if (processorRef.current) {
//             processorRef.current.disconnect();
//             processorRef.current = null;
//         }

//         if (audioContextRef.current) {
//             audioContextRef.current.close();
//             audioContextRef.current = null;
//         }

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

//     const handleStartLecture = () => {
//         startRecording();
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
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
import { AudioWebSocket } from '../../services/api';

type LectureData = {
    id: string;
    title: string;
    lecturer: string;
    startTime: string;
    duration: string;
    location: string;
    createdAt: string;
    lecture_title?: string;
    lecturer_name?: string;
    exact_location?: string;
};

type WebSocketMessage = {
    type: 'transcription' | 'processed' | 'translated' | 'error' | 'status';
    message?: string;
    status?: string;
    timestamp?: number;
    confidence?: number;
    text?: string;
    original_text?: string;
    processed_text?: string;
    translation?: string;
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
    const [translatedText, setTranslatedText] = useState('');
    const [language, setLanguage] = useState('en');
    const [showStopModal, setShowStopModal] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [showFullText, setShowFullText] = useState(true);
    const userRole = getRoleFromStorage();
    const navigate = useNavigate();
    const [isPreviewMode, setIsPreviewMode] = useState(isPreview);

    // Audio recording states
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [status, setStatus] = useState(t('recording.status.ready'));
    const [error, setError] = useState('');
    const [transcriptions, setTranscriptions] = useState<any[]>([]);

    // Refs for audio
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const audioBufferRef = useRef<Int16Array[]>([]);
    const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const webSocketRef = useRef<AudioWebSocket | null>(null);
    const isRecordingRef = useRef(false);

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

    const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
        console.log('WebSocket message:', data);

        if (data.type === 'transcription' && data.text && data.timestamp) {
            setTranscriptions(prev => [...prev.slice(-9), {
                text: data.text as string,
                confidence: data.confidence || 0,
                timestamp: data.timestamp as number
            }]);
            setOriginalText(prev => prev + ' ' + data.text);
        } else if (data.type === 'processed' && data.processed_text) {
            setOriginalText(prev => prev + ' ' + data.processed_text);
        } else if (data.type === 'translated' && data.translation) {
            setTranslatedText(prev => prev + ' ' + data.translation);
        } else if (data.type === 'error' && data.message) {
            setError(data.message);
        } else if (data.type === 'status' && (data.status || data.message)) {
            setStatus(data.status || data.message || '');
        }
    }, []);

    const startRecording = useCallback(async () => {
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

            // Добавляем обработчики для переводов на разные языки
            ws.onMessage('translated_english', (data) => {
                setTranslatedText(prev => prev + ' ' + (data.translation || ''));
            });

            ws.onMessage('translated_chinese', (data) => {
                // Можно сохранять в отдельное состояние или комбинировать
                console.log('Chinese translation:', data.translation);
            });

            ws.onMessage('translated_french', (data) => {
                // Можно сохранять в отдельное состояние или комбинировать
                console.log('French translation:', data.translation);
            });

            // await ws.connect(newSessionId);
            await ws.connect(newSessionId, {
                title: lecture.title,
                lecturer: lecture.lecturer_name || lecture.lecturer,
                location: lecture.exact_location || lecture.location
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

            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    setError(t('recording.errors.mic_permission'));
                } else if (err.name === 'NotFoundError') {
                    setError(t('recording.errors.mic_not_found'));
                }
            }
        }
    }, [t, generateSessionId, handleWebSocketMessage, float32ToPCM16, sendPCMData, forceFlushBuffer]);

    const stopRecording = useCallback(() => {
        setIsRecording(false);
        isRecordingRef.current = false;

        if (flushIntervalRef.current) {
            clearInterval(flushIntervalRef.current);
            flushIntervalRef.current = null;
        }

        if (audioBufferRef.current.length > 0) {
            forceFlushBuffer();
        }

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

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
        startRecording();
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
                            <span>{lecture.startTime ? new Date(lecture.startTime).toLocaleString() : t('common.not_specified')}</span>
                        </div>
                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.location')}:</span>
                            <span>{lecture.exact_location || lecture.location}</span>
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
                                <span>{lecture.startTime ? new Date(lecture.startTime).toLocaleString() : t('common.not_specified')}</span>
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
            </div>
        </div>
    );
};

export default RecordingLecturePage;