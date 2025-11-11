
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
import { AudioWebSocket } from '../../services/api';
import EditIcon from '../../icons/EditIcon';
import HeaderWithoutTranslate from '../../components/Header/HeaderWithoutTranslate';

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
    const tRef = useRef(t);

    const { state } = useLocation();
    const { lecture: initialLecture, isPreview = true } = state as {
        lecture: LectureData;
        isPreview?: boolean
    };

    const [lecture, setLecture] = useState<LectureData>({
        ...initialLecture,
        lecture_title: initialLecture.lecture_title || initialLecture.title,
        lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
        exact_location: initialLecture.exact_location || initialLecture.location,
        start_time: initialLecture.start_time
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
    const processorRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
    const audioBufferRef = useRef<Int16Array[]>([]);
    const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const webSocketRef = useRef<AudioWebSocket | null>(null);
    const isRecordingRef = useRef(false);

    // Автоматическая прокрутка добавляемого текста
    const originalTextContainerRef = useRef<HTMLDivElement>(null);
    const translatedTextContainerRef = useRef<HTMLDivElement>(null);
    // Состояние для отслеживания ручной прокрутки
    const [isUserScrolled, setIsUserScrolled] = useState(false);

    type Translations = {
        en: string;
        fr: string;
        zh: string;
    };

    const [editingField, setEditingField] = useState<string | null>(null);
    const [editedValues, setEditedValues] = useState({
        lecture_title: initialLecture.lecture_title || initialLecture.title,
        lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
        exact_location: initialLecture.exact_location || initialLecture.location,
        start_time: initialLecture.start_time
    });

    useEffect(() => {
        tRef.current = t;
    }, [t]);

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
            // const base64Data = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
            const base64Data = btoa(Array.from(uint8Array).reduce((data, byte) => data + String.fromCharCode(byte), ''));
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
        console.log('📨 Обработка WebSocket сообщения:', data.type, data);

        const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

        if (lastMessageIdRef.current.has(messageKey)) {
            console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
            return;
        }

        lastMessageIdRef.current.add(messageKey);

        setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

        if (data.type === 'processed' && data.processed_text) {
            let newText = data.processed_text.replace(/\[.*?\]/g, '');

            if (data.processed_text.startsWith("\n\n    ")) {
                newText = "\n\n    " + newText.trim();
            } else if (data.processed_text.startsWith("    ")) {
                newText = "    " + newText.trim();
            } else {
                newText = newText.trim();
            }

            if (newText) {
                setProcessedTexts(prev => {
                    const alreadyExists = prev.some(text => text.includes(newText) || newText.includes(text));
                    if (!alreadyExists) {
                        const updated = [...prev, newText];
                        setOriginalText(updated.join(' '));
                        return updated;
                    }
                    return prev;
                });
            }
        }

        if (data.translation) {
            let newTranslation = data.translation.replace(/\[.*?\]/g, '').trim();

            if (data.translation.includes("    ")) {
                newTranslation = "    " + newTranslation;
            }
            if (data.translation.includes("\n\n    ")) {
                newTranslation = "\n\n" + newTranslation;
            }

            if (newTranslation) {
                setTranslations(prev => {
                    const updated = { ...prev };
                    let updatedFlag = false;

                    let lang: keyof Translations = 'en';
                    if (data.type === 'translated_french') {
                        lang = 'fr';
                    } else if (data.type === 'translated_chinese') {
                        lang = 'zh';
                    } else if (data.type === 'translated_english' || data.type === 'translated') {
                        lang = 'en';
                    }

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

    // Fallback метод для браузеров без поддержки Audio Worklet
    const startRecordingWithScriptProcessor = useCallback((audioContext: AudioContext, stream: MediaStream) => {
        console.warn('Using deprecated ScriptProcessorNode as fallback');

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

            if (durationSeconds >= 15) {
                forceFlushBuffer();
            }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
    }, [float32ToPCM16, forceFlushBuffer]);

    // Основной метод с Audio Worklet
    const startRecording = useCallback(async () => {
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }

        try {
            setError('');
            setStatus(tRef.current('recording.status.requesting_mic'));

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
            setStatus(tRef.current('recording.status.connecting_ws'));

            const ws = new AudioWebSocket();
            webSocketRef.current = ws;

            ws.onMessage('transcription', handleWebSocketMessage);
            ws.onMessage('processed', handleWebSocketMessage);
            ws.onMessage('translated_english', handleWebSocketMessage);
            ws.onMessage('translated_french', handleWebSocketMessage);
            ws.onMessage('translated_chinese', handleWebSocketMessage);
            ws.onMessage('error', handleWebSocketMessage);
            ws.onMessage('status', handleWebSocketMessage);

            await ws.connect(newSessionId, {
                title: lecture.lecture_title || lecture.title,
                lecturer: lecture.lecturer_name || lecture.lecturer,
                location: lecture.exact_location || lecture.location,
                start_time: lecture.start_time
            });

            setIsConnected(true);
            setStatus(tRef.current('recording.status.ws_connected'));

            const audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);

            // Пытаемся использовать Audio Worklet
            try {
                // Создаем inline worklet processor
                const workletCode = `
class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputData = input[0];
      const pcmData = new Int16Array(inputData.length);
      
      for (let i = 0; i < inputData.length; i++) {
        const sample = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = Math.round(sample * 0x7FFF);
      }
      
      this.port.postMessage({
        type: 'audioData',
        data: pcmData
      });
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
`;

                const blob = new Blob([workletCode], { type: 'application/javascript' });
                const workletUrl = URL.createObjectURL(blob);

                await audioContext.audioWorklet.addModule(workletUrl);
                URL.revokeObjectURL(workletUrl);

                const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
                processorRef.current = workletNode;

                // Обработчик сообщений от worklet
                workletNode.port.onmessage = (event) => {
                    if (!isRecordingRef.current) return;

                    const { type, data } = event.data;
                    if (type === 'audioData') {
                        audioBufferRef.current.push(data);

                        const totalSamples = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
                        const durationSeconds = totalSamples / 16000;

                        if (durationSeconds >= 15) {
                            forceFlushBuffer();
                        }
                    }
                };

                source.connect(workletNode);
                workletNode.connect(audioContext.destination);

                console.log('✅ Audio Worklet successfully initialized');

            } catch (workletError) {
                console.warn('Audio Worklet not supported, falling back to ScriptProcessor:', workletError);
                startRecordingWithScriptProcessor(audioContext, stream);
            }

            flushIntervalRef.current = setInterval(forceFlushBuffer, 15000);

            setIsRecording(true);
            isRecordingRef.current = true;
            setStatus(tRef.current('recording.status.recording'));
            setIsPreviewMode(false);

        } catch (err) {
            console.error('Recording error:', err);
            setError(tRef.current('recording.errors.mic_access', { error: err instanceof Error ? err.message : String(err) }));
            setStatus(tRef.current('recording.errors.recording_failed'));
        }
    }, [generateSessionId, handleWebSocketMessage, forceFlushBuffer, lecture, startRecordingWithScriptProcessor]);

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

        if (processorRef.current) {
            processorRef.current.disconnect();
            // Если это AudioWorkletNode, отправляем сообщение о остановке
            if (processorRef.current instanceof AudioWorkletNode) {
                processorRef.current.port.postMessage({ type: 'stop' });
            }
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
        setStatus(tRef.current('recording.status.stopped'));
    }, [forceFlushBuffer]);

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
            setStatus(tRef.current('recording.status.recording'));
        } else {
            setShowPauseModal(true);
        }
    };

    const confirmPauseLecture = () => {
        setIsPaused(true);
        setShowPauseModal(false);
        isRecordingRef.current = false;
        setStatus(tRef.current('recording.status.paused'));
    };

    const getStatusLabel = () => {
        if (isPreviewMode) return tRef.current('recording.status.preview');
        if (isFinished) return tRef.current('recording.status.finished');
        if (isPaused) return tRef.current('recording.status.paused');
        return tRef.current('recording.status.recording');
    };

    const getBreadcrumbs = () => [
        {
            label: getHomeLabel(userRole),
            path: getHomePath(userRole),
            translationKey: `roles.${userRole}.home`
        },
        {
            label: tRef.current('recording.breadcrumb'),
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

    const formatDateTimeForInput = (dateString: string) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
            console.error('Date formatting error:', e);
            return '';
        }
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'start_time') {
            const isoDate = value ? new Date(value).toISOString() : '';
            setEditedValues(prev => ({
                ...prev,
                [name]: isoDate
            }));
        } else {
            setEditedValues(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return tRef.current('common.not_specified');

        try {
            const date = new Date(dateString);
            return isNaN(date.getTime())
                ? tRef.current('common.not_specified')
                : date.toLocaleString(navigator.language, {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
        } catch (e) {
            return tRef.current('common.not_specified');
        }
    };

    useEffect(() => {
        return () => {
            if (isRecording) {
                stopRecording();
            }
        };
    }, [isRecording, stopRecording]);

    useEffect(() => {
        const container = originalTextContainerRef.current;
        if (!container || isUserScrolled) return;

        if (originalText) {
            setTimeout(() => {
                if (!isUserScrolled) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 100);
        }
    }, [originalText, isUserScrolled]);

    useEffect(() => {
        const container = translatedTextContainerRef.current;
        if (!container || isUserScrolled) return;

        if (translations[language]) {
            setTimeout(() => {
                if (!isUserScrolled) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 100);
        }
    }, [translations, language, isUserScrolled]);

    useEffect(() => {
        const originalContainer = originalTextContainerRef.current;
        const translatedContainer = translatedTextContainerRef.current;

        const handleScroll = () => {
            if (originalContainer) {
                const isAtBottom = originalContainer.scrollHeight - originalContainer.scrollTop <= originalContainer.clientHeight + 10;
                setIsUserScrolled(!isAtBottom);
            }
        };

        originalContainer?.addEventListener('scroll', handleScroll);
        translatedContainer?.addEventListener('scroll', handleScroll);

        return () => {
            originalContainer?.removeEventListener('scroll', handleScroll);
            translatedContainer?.removeEventListener('scroll', handleScroll);
        };
    }, []);

    if (!state?.lecture) {
        navigate('/recorder', { replace: true });
        return null;
    }

    return (
        <div className={commonStyles.appContainer}>
            {isPreviewMode ? (
                <div className={commonStyles.mainContent}>
                    <Header />
                    <Breadcrumbs items={getBreadcrumbs()} />

                    <h1 className={commonStyles.sectionHeader}>
                        {t('recording.title', { title: lecture.lecture_title || lecture.title })}
                    </h1>
                    <div className={commonStyles.infoCard}>
                        <h2 className={commonStyles.subHeader}>
                            {t('recording.preview.header')}
                        </h2>

                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.title')}:</span>
                            {editingField === 'lecture_title' ? (
                                <div className={commonStyles.editFieldContainer}>
                                    <input
                                        type="text"
                                        name="lecture_title"
                                        value={editedValues.lecture_title}
                                        onChange={handleFieldChange}
                                        className={commonStyles.filterSelect}
                                        autoFocus
                                    />
                                    <div className={commonStyles.editButtons}>
                                        <button
                                            onClick={() => handleSaveField('lecture_title')}
                                            className={commonStyles.primaryButton}
                                        >
                                            {t('common.save')}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={commonStyles.secondaryButton}
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
                                        <EditIcon />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.lecturer')}:</span>
                            {editingField === 'lecturer_name' ? (
                                <div className={commonStyles.editFieldContainer}>
                                    <input
                                        type="text"
                                        name="lecturer_name"
                                        value={editedValues.lecturer_name}
                                        onChange={handleFieldChange}
                                        className={commonStyles.filterSelect}
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
                                        <EditIcon />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.start')}:</span>
                            {editingField === 'start_time' ? (
                                <div className={commonStyles.editFieldContainer}>
                                    <input
                                        type="datetime-local"
                                        name="start_time"
                                        value={formatDateTimeForInput(editedValues.start_time)}
                                        onChange={handleFieldChange}
                                        className={commonStyles.filterSelect}
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
                                    <span>{formatDisplayDate(lecture.start_time)}</span>
                                    <button
                                        onClick={() => handleEditClick('start_time')}
                                        className={commonStyles.editButton}
                                        title={t('common.edit')}
                                    >
                                        <EditIcon />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={commonStyles.statusItem}>
                            <span>{t('recording.lecture.location')}:</span>
                            {editingField === 'exact_location' ? (
                                <div className={commonStyles.editFieldContainer}>
                                    <input
                                        type="text"
                                        name="exact_location"
                                        value={editedValues.exact_location}
                                        onChange={handleFieldChange}
                                        className={commonStyles.filterSelect}
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
                                        <EditIcon />
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
                </div>
            ) : (
                <div className={commonStyles.mainContent}>
                    <HeaderWithoutTranslate setIsFinished={setIsFinished} />
                    <Breadcrumbs items={getBreadcrumbs()} />

                    <h1 className={commonStyles.sectionHeader}>
                        {t('recording.title', { title: lecture.lecture_title || lecture.title })}
                    </h1>
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
                                        className={`${isPaused ? commonStyles.primaryButton : commonStyles.refreshButton}`}
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
                                    <div
                                        ref={originalTextContainerRef}
                                        className={commonStyles.LectureFullText}
                                        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', marginTop: '60px' }}
                                    >
                                        {originalText || t('recording.text_unavailable')}
                                    </div>
                                )}
                            </div>
                        </div>

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
                                    <div
                                        ref={translatedTextContainerRef}
                                        className={commonStyles.LectureFullText}
                                        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                                    >
                                        {translations[language] || t('recording.translation_unavailable')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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
    );
};

export default RecordingLecturePage;





// // import { useState, useEffect, useRef, useCallback } from 'react';
// // import { useTranslation } from 'react-i18next';
// // import { useLocation, useNavigate } from 'react-router-dom';
// // import commonStyles from '../commonStyles.module.css';
// // import Header from '../../components/Header/Header';
// // import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
// // import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
// // import { AudioWebSocket } from '../../services/api';
// // import EditIcon from '../../icons/EditIcon';
// // import HeaderWithoutTranslate from '../../components/Header/HeaderWithoutTranslate';

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
// //     language?: 'en' | 'fr' | 'ru' | 'zh';
// //     message?: string;
// //     status?: string;
// //     timestamp?: number;
// //     confidence?: number;
// //     text?: string;
// //     original_text?: string;
// //     processed_text?: string;
// //     translation?: string;
// //     _server_id?: string;
// //     _timestamp?: string;
// //     session_id?: string;
// // };

// // const RecordingLecturePage = () => {
// //     const { t } = useTranslation();

// //     const tRef = useRef(t);

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
// //     const [translations, setTranslations] = useState({ en: '', fr: '', zh: '' });
// //     const lastMessageIdRef = useRef<Set<string>>(new Set());
// //     const [liveMessages, setLiveMessages] = useState<WebSocketMessage[]>([]);
// //     const [processedTexts, setProcessedTexts] = useState<string[]>([]);
// //     const [language, setLanguage] = useState<'en' | 'fr' | 'zh'>('en');
// //     const [showStopModal, setShowStopModal] = useState(false);
// //     const [showPauseModal, setShowPauseModal] = useState(false);
// //     const [showFullText, setShowFullText] = useState(true);
// //     const userRole = getRoleFromStorage();
// //     const navigate = useNavigate();
// //     const [isPreviewMode, setIsPreviewMode] = useState(isPreview);
// //     const [showStartModal, setShowStartModal] = useState(false);
// //     const [isConnected, setIsConnected] = useState(false);
// //     const [sessionId, setSessionId] = useState('');
// //     const [status, setStatus] = useState(t('recording.status.ready'));
// //     const [error, setError] = useState('');

// //     const audioContextRef = useRef<AudioContext | null>(null);
// //     const mediaStreamRef = useRef<MediaStream | null>(null);
// //     const processorRef = useRef<ScriptProcessorNode | null>(null);
// //     const audioBufferRef = useRef<Int16Array[]>([]);
// //     const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);
// //     const webSocketRef = useRef<AudioWebSocket | null>(null);
// //     const isRecordingRef = useRef(false);

// //     // Автоматическая прокрутка добавляемого текста
// //     const originalTextContainerRef = useRef<HTMLDivElement>(null);
// //     const translatedTextContainerRef = useRef<HTMLDivElement>(null);
// //     // Состояние для отслеживания ручной прокрутки
// //     const [isUserScrolled, setIsUserScrolled] = useState(false);

// //     type Translations = {
// //         en: string;
// //         fr: string;
// //         zh: string;
// //     };

// //     const [editingField, setEditingField] = useState<string | null>(null);
// //     const [editedValues, setEditedValues] = useState({
// //         lecture_title: initialLecture.lecture_title || initialLecture.title,
// //         lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
// //         exact_location: initialLecture.exact_location || initialLecture.location,
// //         start_time: initialLecture.start_time
// //     });

// //     useEffect(() => {
// //         tRef.current = t;
// //     }, [t]);

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

// //     const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
// //         console.log('📨 Обработка WebSocket сообщения:', data.type, data);

// //         const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

// //         if (lastMessageIdRef.current.has(messageKey)) {
// //             console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
// //             return;
// //         }

// //         lastMessageIdRef.current.add(messageKey);

// //         setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

// //         if (data.type === 'processed' && data.processed_text) {
// //             // Сохраняем оригинальное форматирование
// //             let newText = data.processed_text.replace(/\[.*?\]/g, '');

// //             // Определяем тип форматирования по префиксам
// //             if (data.processed_text.startsWith("\n\n    ")) {
// //                 newText = "\n\n    " + newText.trim();
// //             } else if (data.processed_text.startsWith("    ")) {
// //                 newText = "    " + newText.trim();
// //             } else {
// //                 newText = newText.trim();
// //             }

// //             if (newText) {
// //                 setProcessedTexts(prev => {
// //                     // Проверяем по содержанию, а не по полному совпадению
// //                     const alreadyExists = prev.some(text => text.includes(newText) || newText.includes(text));
// //                     if (!alreadyExists) {
// //                         const updated = [...prev, newText];
// //                         setOriginalText(updated.join(' '));
// //                         return updated;
// //                     }
// //                     return prev;
// //                 });
// //             }
// //         }

// //         // Обработка переводов
// //         if (data.translation) {
// //             let newTranslation = data.translation.replace(/\[.*?\]/g, '').trim();

// //             // Полная обработка форматирования как в оригинале
// //             if (data.translation.includes("    ")) {
// //                 newTranslation = "    " + newTranslation;
// //             }
// //             if (data.translation.includes("\n\n    ")) {
// //                 newTranslation = "\n\n" + newTranslation;
// //             }

// //             if (newTranslation) {
// //                 setTranslations(prev => {
// //                     const updated = { ...prev };
// //                     let updatedFlag = false;

// //                     // Определяем язык перевода
// //                     let lang: keyof Translations = 'en';
// //                     if (data.type === 'translated_french') {
// //                         lang = 'fr';
// //                     } else if (data.type === 'translated_chinese') {
// //                         lang = 'zh';
// //                     } else if (data.type === 'translated_english' || data.type === 'translated') {
// //                         lang = 'en';
// //                     }

// //                     // Обновляем только если перевод для этого языка еще не содержит новый текст
// //                     if (!updated[lang].includes(newTranslation)) {
// //                         updated[lang] = (updated[lang] ? updated[lang] + ' ' : '') + newTranslation;
// //                         updatedFlag = true;
// //                     }

// //                     return updatedFlag ? updated : prev;
// //                 });
// //             }
// //         }

// //         if (data.type === 'error') {
// //             console.error('❌ Ошибка от сервера:', data.message);
// //             setError(`Ошибка сервера: ${data.message || 'Неизвестная ошибка'}`);
// //         }
// //     }, []);


// //     const startRecording = useCallback(async () => {
// //         if (audioContextRef.current) {
// //             audioContextRef.current.close().catch(console.error);
// //             audioContextRef.current = null;
// //         }

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
// //             ws.onMessage('translated_english', handleWebSocketMessage);
// //             ws.onMessage('translated_french', handleWebSocketMessage);
// //             ws.onMessage('translated_chinese', handleWebSocketMessage);
// //             ws.onMessage('error', handleWebSocketMessage);
// //             ws.onMessage('status', handleWebSocketMessage);

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

// //                 if (durationSeconds >= 15) {
// //                     forceFlushBuffer();
// //                 }
// //             };

// //             source.connect(processor);
// //             processor.connect(audioContext.destination);
// //             flushIntervalRef.current = setInterval(forceFlushBuffer, 15000);

// //             setIsRecording(true);
// //             isRecordingRef.current = true;
// //             setStatus(t('recording.status.recording'));
// //             setIsPreviewMode(false);

// //         } catch (err) {
// //             console.error('Recording error:', err);
// //             setError(t('recording.errors.mic_access', { error: err instanceof Error ? err.message : String(err) }));
// //             setStatus(t('recording.errors.recording_failed'));
// //         }
// //     }, [generateSessionId, handleWebSocketMessage, float32ToPCM16, forceFlushBuffer, lecture]);

// //     const stopRecording = useCallback(() => {
// //         setIsRecording(false);
// //         isRecordingRef.current = false;

// //         if (flushIntervalRef.current) {
// //             clearInterval(flushIntervalRef.current);
// //             flushIntervalRef.current = null;
// //         }

// //         forceFlushBuffer();

// //         if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
// //             audioContextRef.current.close().catch(e => {
// //                 console.error('Error closing AudioContext:', e);
// //             });
// //         }

// //         if (processorRef.current) processorRef.current.disconnect();

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
// //     }, [forceFlushBuffer]);

// //     const handleStartLecture = () => {
// //         setLecture(prev => ({
// //             ...prev,
// //             lecture_title: editedValues.lecture_title,
// //             lecturer_name: editedValues.lecturer_name,
// //             exact_location: editedValues.exact_location,
// //             start_time: editedValues.start_time,
// //             title: editedValues.lecture_title,
// //             lecturer: editedValues.lecturer_name,
// //             location: editedValues.exact_location
// //         }));

// //         setShowStartModal(true);
// //         setTimeout(() => {
// //             startRecording();
// //             setShowStartModal(false);
// //         }, 3000);
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

// //     const formatDateTimeForInput = (dateString: string) => {
// //         if (!dateString) return '';

// //         try {
// //             const date = new Date(dateString);
// //             if (isNaN(date.getTime())) return '';

// //             const year = date.getFullYear();
// //             const month = String(date.getMonth() + 1).padStart(2, '0');
// //             const day = String(date.getDate()).padStart(2, '0');
// //             const hours = String(date.getHours()).padStart(2, '0');
// //             const minutes = String(date.getMinutes()).padStart(2, '0');

// //             return `${year}-${month}-${day}T${hours}:${minutes}`;
// //         } catch (e) {
// //             console.error('Date formatting error:', e);
// //             return '';
// //         }
// //     };

// //     const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //         const { name, value } = e.target;

// //         if (name === 'start_time') {
// //             // Преобразуем значение datetime-local в ISO строку
// //             const isoDate = value ? new Date(value).toISOString() : '';
// //             setEditedValues(prev => ({
// //                 ...prev,
// //                 [name]: isoDate
// //             }));
// //         } else {
// //             setEditedValues(prev => ({
// //                 ...prev,
// //                 [name]: value
// //             }));
// //         }
// //     };

// //     const formatDisplayDate = (dateString: string) => {
// //         if (!dateString) return t('common.not_specified');

// //         try {
// //             const date = new Date(dateString);
// //             return isNaN(date.getTime())
// //                 ? t('common.not_specified')
// //                 : date.toLocaleString(navigator.language, {
// //                     year: 'numeric',
// //                     month: 'numeric',
// //                     day: 'numeric',
// //                     hour: '2-digit',
// //                     minute: '2-digit'
// //                 });
// //         } catch (e) {
// //             return t('common.not_specified');
// //         }
// //     };

// //     useEffect(() => {
// //         return () => {
// //             if (isRecording) {
// //                 stopRecording();
// //             }
// //         };
// //     }, [isRecording, stopRecording]);

// //     useEffect(() => {
// //         const container = originalTextContainerRef.current;
// //         if (!container || isUserScrolled) return;

// //         if (originalText) {
// //             setTimeout(() => {
// //                 if (!isUserScrolled) {
// //                     container.scrollTop = container.scrollHeight;
// //                 }
// //             }, 100);
// //         }
// //     }, [originalText, isUserScrolled]);

// //     useEffect(() => {
// //         const container = translatedTextContainerRef.current;
// //         if (!container || isUserScrolled) return;

// //         if (translations[language]) {
// //             setTimeout(() => {
// //                 if (!isUserScrolled) {
// //                     container.scrollTop = container.scrollHeight;
// //                 }
// //             }, 100);
// //         }
// //     }, [translations, language, isUserScrolled]);

// //     // Обработчик события прокрутки
// //     useEffect(() => {
// //         const originalContainer = originalTextContainerRef.current;
// //         const translatedContainer = translatedTextContainerRef.current;

// //         const handleScroll = () => {
// //             if (originalContainer) {
// //                 const isAtBottom = originalContainer.scrollHeight - originalContainer.scrollTop <= originalContainer.clientHeight + 10;
// //                 setIsUserScrolled(!isAtBottom);
// //             }
// //         };

// //         originalContainer?.addEventListener('scroll', handleScroll);
// //         translatedContainer?.addEventListener('scroll', handleScroll);

// //         return () => {
// //             originalContainer?.removeEventListener('scroll', handleScroll);
// //             translatedContainer?.removeEventListener('scroll', handleScroll);
// //         };
// //     }, []);

// //     if (!state?.lecture) {
// //         navigate('/recorder', { replace: true });
// //         return null;
// //     }

// //     return (
// //         <div className={commonStyles.appContainer}>


// //             {isPreviewMode ? (
// //                 <div className={commonStyles.mainContent}>
// //                     <Header />
// //                     <Breadcrumbs items={getBreadcrumbs()} />

// //                     <h1 className={commonStyles.sectionHeader}>
// //                         {t('recording.title', { title: lecture.lecture_title || lecture.title })}
// //                     </h1>
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
// //                                         className={commonStyles.filterSelect}
// //                                         autoFocus
// //                                     />
// //                                     <div className={commonStyles.editButtons}>
// //                                         <button
// //                                             onClick={() => handleSaveField('lecture_title')}
// //                                             className={commonStyles.primaryButton}
// //                                         >
// //                                             {t('common.save')}
// //                                         </button>
// //                                         <button
// //                                             onClick={handleCancelEdit}
// //                                             className={commonStyles.secondaryButton}
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
// //                                         <EditIcon />
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
// //                                         className={commonStyles.filterSelect}
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
// //                                         <EditIcon />
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
// //                                         className={commonStyles.filterSelect}
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
// //                                     {/* <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span> */}
// //                                     {/* <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span> */}
// //                                     <span>{formatDisplayDate(lecture.start_time)}</span>
// //                                     <button
// //                                         onClick={() => handleEditClick('start_time')}
// //                                         className={commonStyles.editButton}
// //                                         title={t('common.edit')}
// //                                     >
// //                                         <EditIcon />
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
// //                                         className={commonStyles.filterSelect}
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
// //                                         <EditIcon />
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
// //                 </div>
// //             ) : (
// //                 <div className={commonStyles.mainContent}>
// //                     {/* <HeaderWithoutTranslate /> */}
// //                     <HeaderWithoutTranslate setIsFinished={setIsFinished} />
// //                     {/* <Recording isFinished={isFinished} /> */}

// //                     <Breadcrumbs items={getBreadcrumbs()} />

// //                     <h1 className={commonStyles.sectionHeader}>
// //                         {t('recording.title', { title: lecture.lecture_title || lecture.title })}
// //                     </h1>
// //                     <div className={commonStyles.infoCard}>
// //                         <h2 className={commonStyles.subHeader}>
// //                             {getStatusLabel()}
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

// //                         <div className={commonStyles.buttonGroup} style={{ marginTop: '20px' }}>
// //                             {!isFinished ? (
// //                                 <>
// //                                     <button
// //                                         onClick={handleTogglePause}
// //                                         className={`${isPaused ? commonStyles.primaryButton : commonStyles.refreshButton}`}
// //                                         disabled={isFinished}
// //                                     >
// //                                         {isPaused ? t('recording.resume_button') : t('recording.pause_button')}
// //                                     </button>
// //                                     <button
// //                                         onClick={() => setShowStopModal(true)}
// //                                         className={commonStyles.secondaryButton}
// //                                     >
// //                                         {t('recording.stop_button')}
// //                                     </button>
// //                                 </>
// //                             ) : (
// //                                 <button
// //                                     onClick={() => navigate('/archive')}
// //                                     className={commonStyles.primaryButton}
// //                                     style={{ width: '100%' }}
// //                                 >
// //                                     {t('recording.go_to_archive')}
// //                                 </button>
// //                             )}
// //                         </div>
// //                     </div>

// //                     <div className={commonStyles.infoCardLecture}>
// //                         <div className={commonStyles.listItemLecture}>
// //                             <div className={commonStyles.textHeaderContainer}>
// //                                 <h2>{t('recording.original_text')}</h2>
// //                             </div>
// //                             <div className={commonStyles.ItemLecture}>
// //                                 {showFullText && (
// //                                     <div
// //                                         ref={originalTextContainerRef}
// //                                         className={commonStyles.LectureFullText}
// //                                         style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', marginTop: '60px' }}
// //                                     >
// //                                         {originalText || t('recording.text_unavailable')}
// //                                     </div>
// //                                 )}
// //                             </div>
// //                         </div>

// //                         <div className={commonStyles.listItemLecture}>
// //                             <h2>{t('recording.translated_text', {
// //                                 language: t(`language.${language}`)
// //                             })}</h2>

// //                             <select
// //                                 className={commonStyles.filterSelect}
// //                                 value={language}
// //                                 onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'zh')}
// //                                 style={{ marginBottom: '15px' }}
// //                             >
// //                                 <option value="en">{t('language.english')}</option>
// //                                 <option value="fr">{t('language.french')}</option>
// //                                 <option value="zh">{t('language.chinese')}</option>
// //                             </select>

// //                             <div className={commonStyles.ItemLecture}>
// //                                 {showFullText && (
// //                                     <div
// //                                         ref={translatedTextContainerRef}
// //                                         className={commonStyles.LectureFullText}
// //                                         style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
// //                                     >
// //                                         {translations[language] || t('recording.translation_unavailable')}
// //                                     </div>
// //                                 )}

// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}

// //             {showStopModal && (
// //                 <div className={commonStyles.modalOverlay}>
// //                     <div className={commonStyles.modal}>
// //                         <h3>{t('confirmation.title')}</h3>
// //                         <p>{t('recording.stop_confirmation')}</p>
// //                         <div className={commonStyles.modalButtons}>
// //                             <button
// //                                 onClick={() => setShowStopModal(false)}
// //                                 className={commonStyles.cancelModalButton}
// //                             >
// //                                 {t('common.cancel')}
// //                             </button>
// //                             <button
// //                                 onClick={confirmStopLecture}
// //                                 className={commonStyles.okModalButton}
// //                             >
// //                                 {t('recording.confirm_stop')}
// //                             </button>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}

// //             {showPauseModal && (
// //                 <div className={commonStyles.modalOverlay}>
// //                     <div className={commonStyles.modal}>
// //                         <h3>{t('confirmation.title')}</h3>
// //                         <p>{t('recording.pause_confirmation')}</p>
// //                         <div className={commonStyles.modalButtons}>
// //                             <button
// //                                 onClick={() => setShowPauseModal(false)}
// //                                 className={commonStyles.cancelModalButton}
// //                             >
// //                                 {t('common.cancel')}
// //                             </button>
// //                             <button
// //                                 onClick={confirmPauseLecture}
// //                                 className={commonStyles.okModalButton}
// //                             >
// //                                 {t('recording.confirm_pause')}
// //                             </button>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}

// //             {showStartModal && (
// //                 <div className={commonStyles.modalOverlay}>
// //                     <div className={commonStyles.modal}>
// //                         <h3>{t('recording.starting_lecture')}</h3>
// //                         <p>{t('recording.starting_message')}</p>
// //                         <div style={{
// //                             display: 'flex',
// //                             justifyContent: 'center',
// //                             marginTop: '20px'
// //                         }}>
// //                             <div className={commonStyles.loader}></div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}
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
// import EditIcon from '../../icons/EditIcon';
// import HeaderWithoutTranslate from '../../components/Header/HeaderWithoutTranslate';

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
//     language?: 'en' | 'fr' | 'ru' | 'zh';
//     message?: string;
//     status?: string;
//     timestamp?: number;
//     confidence?: number;
//     text?: string;
//     original_text?: string;
//     processed_text?: string;
//     translation?: string;
//     _server_id?: string;
//     _timestamp?: string;
//     session_id?: string;
// };

// const RecordingLecturePage = () => {
//     const { t } = useTranslation();
//     const tRef = useRef(t);

//     const { state } = useLocation();
//     const { lecture: initialLecture, isPreview = true } = state as {
//         lecture: LectureData;
//         isPreview?: boolean
//     };

//     const [lecture, setLecture] = useState<LectureData>({
//         ...initialLecture,
//         lecture_title: initialLecture.lecture_title || initialLecture.title,
//         lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
//         exact_location: initialLecture.exact_location || initialLecture.location,
//         start_time: initialLecture.start_time
//     });

//     const [isRecording, setIsRecording] = useState(!isPreview);
//     const [isPaused, setIsPaused] = useState(false);
//     const [isFinished, setIsFinished] = useState(false);
//     const [originalText, setOriginalText] = useState('');
//     const [translations, setTranslations] = useState({ en: '', fr: '', zh: '' });
//     const lastMessageIdRef = useRef<Set<string>>(new Set());
//     const [liveMessages, setLiveMessages] = useState<WebSocketMessage[]>([]);
//     const [processedTexts, setProcessedTexts] = useState<string[]>([]);
//     const [language, setLanguage] = useState<'en' | 'fr' | 'zh'>('en');
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

//     const audioContextRef = useRef<AudioContext | null>(null);
//     const mediaStreamRef = useRef<MediaStream | null>(null);
//     const processorRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
//     const audioBufferRef = useRef<Int16Array[]>([]);
//     const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);
//     const webSocketRef = useRef<AudioWebSocket | null>(null);
//     const isRecordingRef = useRef(false);

//     // Автоматическая прокрутка добавляемого текста
//     const originalTextContainerRef = useRef<HTMLDivElement>(null);
//     const translatedTextContainerRef = useRef<HTMLDivElement>(null);
//     // Состояние для отслеживания ручной прокрутки
//     const [isUserScrolled, setIsUserScrolled] = useState(false);

//     type Translations = {
//         en: string;
//         fr: string;
//         zh: string;
//     };

//     const [editingField, setEditingField] = useState<string | null>(null);
//     const [editedValues, setEditedValues] = useState({
//         lecture_title: initialLecture.lecture_title || initialLecture.title,
//         lecturer_name: initialLecture.lecturer_name || initialLecture.lecturer,
//         exact_location: initialLecture.exact_location || initialLecture.location,
//         start_time: initialLecture.start_time
//     });

//     // useEffect(() => {
//     //     tRef.current = t;
//     // }, [t]);

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
//         console.log('📨 Обработка WebSocket сообщения:', data.type, data);

//         const messageKey = `${data.type}_${data.timestamp}_${(data.text || data.processed_text || data.translation || '').slice(0, 50)}`;

//         if (lastMessageIdRef.current.has(messageKey)) {
//             console.log('⚠️ Дубликат сообщения игнорирован:', messageKey);
//             return;
//         }

//         lastMessageIdRef.current.add(messageKey);

//         setLiveMessages(prev => [...prev, { ...data, id: messageKey }].slice(-50));

//         if (data.type === 'processed' && data.processed_text) {
//             let newText = data.processed_text.replace(/\[.*?\]/g, '');

//             if (data.processed_text.startsWith("\n\n    ")) {
//                 newText = "\n\n    " + newText.trim();
//             } else if (data.processed_text.startsWith("    ")) {
//                 newText = "    " + newText.trim();
//             } else {
//                 newText = newText.trim();
//             }

//             if (newText) {
//                 setProcessedTexts(prev => {
//                     const alreadyExists = prev.some(text => text.includes(newText) || newText.includes(text));
//                     if (!alreadyExists) {
//                         const updated = [...prev, newText];
//                         setOriginalText(updated.join(' '));
//                         return updated;
//                     }
//                     return prev;
//                 });
//             }
//         }

//         if (data.translation) {
//             let newTranslation = data.translation.replace(/\[.*?\]/g, '').trim();

//             if (data.translation.includes("    ")) {
//                 newTranslation = "    " + newTranslation;
//             }
//             if (data.translation.includes("\n\n    ")) {
//                 newTranslation = "\n\n" + newTranslation;
//             }

//             if (newTranslation) {
//                 setTranslations(prev => {
//                     const updated = { ...prev };
//                     let updatedFlag = false;

//                     let lang: keyof Translations = 'en';
//                     if (data.type === 'translated_french') {
//                         lang = 'fr';
//                     } else if (data.type === 'translated_chinese') {
//                         lang = 'zh';
//                     } else if (data.type === 'translated_english' || data.type === 'translated') {
//                         lang = 'en';
//                     }

//                     if (!updated[lang].includes(newTranslation)) {
//                         updated[lang] = (updated[lang] ? updated[lang] + ' ' : '') + newTranslation;
//                         updatedFlag = true;
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

//     // Fallback метод для браузеров без поддержки Audio Worklet
//     const startRecordingWithScriptProcessor = useCallback((audioContext: AudioContext, stream: MediaStream) => {
//         console.warn('Using deprecated ScriptProcessorNode as fallback');

//         const source = audioContext.createMediaStreamSource(stream);
//         const processor = audioContext.createScriptProcessor(4096, 1, 1);
//         processorRef.current = processor;

//         processor.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
//             if (!isRecordingRef.current) return;

//             const inputBuffer = audioProcessingEvent.inputBuffer;
//             const inputData = inputBuffer.getChannelData(0);
//             const pcmData = float32ToPCM16(inputData);
//             audioBufferRef.current.push(pcmData);

//             const totalSamples = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
//             const durationSeconds = totalSamples / 16000;

//             if (durationSeconds >= 15) {
//                 forceFlushBuffer();
//             }
//         };

//         source.connect(processor);
//         processor.connect(audioContext.destination);
//     }, [float32ToPCM16, forceFlushBuffer]);

//     // Основной метод с Audio Worklet
//     const startRecording = useCallback(async () => {
//         if (audioContextRef.current) {
//             audioContextRef.current.close().catch(console.error);
//             audioContextRef.current = null;
//         }

//         try {
//             setError('');
//             setStatus(tRef.current('recording.status.requesting_mic'));

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
//             setStatus(tRef.current('recording.status.connecting_ws'));

//             const ws = new AudioWebSocket();
//             webSocketRef.current = ws;

//             ws.onMessage('transcription', handleWebSocketMessage);
//             ws.onMessage('processed', handleWebSocketMessage);
//             ws.onMessage('translated_english', handleWebSocketMessage);
//             ws.onMessage('translated_french', handleWebSocketMessage);
//             ws.onMessage('translated_chinese', handleWebSocketMessage);
//             ws.onMessage('error', handleWebSocketMessage);
//             ws.onMessage('status', handleWebSocketMessage);

//             await ws.connect(newSessionId, {
//                 title: lecture.lecture_title || lecture.title,
//                 lecturer: lecture.lecturer_name || lecture.lecturer,
//                 location: lecture.exact_location || lecture.location,
//                 start_time: lecture.start_time
//             });

//             setIsConnected(true);
//             setStatus(tRef.current('recording.status.ws_connected'));

//             const audioContext = new (window.AudioContext || window.webkitAudioContext)({
//                 sampleRate: 16000
//             });
//             audioContextRef.current = audioContext;

//             const source = audioContext.createMediaStreamSource(stream);

//             // Пытаемся использовать Audio Worklet
//             try {
//                 // await audioContext.audioWorklet.addModule('../../audio-worklet/audio-processor.js');
//                 await audioContext.audioWorklet.addModule('/audio-worklet/audio-processor.js');

//                 // Создаем AudioWorkletNode вместо ScriptProcessorNode
//                 const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
//                 processorRef.current = workletNode;

//                 // Обработчик сообщений от worklet
//                 workletNode.port.onmessage = (event) => {
//                     if (!isRecordingRef.current) return;

//                     const { type, data } = event.data;
//                     if (type === 'audioData') {
//                         audioBufferRef.current.push(data);

//                         const totalSamples = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
//                         const durationSeconds = totalSamples / 16000;

//                         if (durationSeconds >= 15) {
//                             forceFlushBuffer();
//                         }
//                     }
//                 };

//                 source.connect(workletNode);
//                 workletNode.connect(audioContext.destination);

//                 console.log('✅ Audio Worklet successfully initialized');

//             } catch (workletError) {
//                 console.warn('Audio Worklet not supported, falling back to ScriptProcessor:', workletError);
//                 startRecordingWithScriptProcessor(audioContext, stream);
//             }

//             flushIntervalRef.current = setInterval(forceFlushBuffer, 15000);

//             setIsRecording(true);
//             isRecordingRef.current = true;
//             setStatus(tRef.current('recording.status.recording'));
//             setIsPreviewMode(false);

//         } catch (err) {
//             console.error('Recording error:', err);
//             setError(tRef.current('recording.errors.mic_access', { error: err instanceof Error ? err.message : String(err) }));
//             setStatus(tRef.current('recording.errors.recording_failed'));
//         }
//     }, [generateSessionId, handleWebSocketMessage, float32ToPCM16, forceFlushBuffer, lecture, startRecordingWithScriptProcessor]);

//     const stopRecording = useCallback(() => {
//         setIsRecording(false);
//         isRecordingRef.current = false;

//         if (flushIntervalRef.current) {
//             clearInterval(flushIntervalRef.current);
//             flushIntervalRef.current = null;
//         }

//         forceFlushBuffer();

//         if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
//             audioContextRef.current.close().catch(e => {
//                 console.error('Error closing AudioContext:', e);
//             });
//         }

//         if (processorRef.current) {
//             processorRef.current.disconnect();
//             // Если это AudioWorkletNode, отправляем сообщение о остановке
//             if (processorRef.current instanceof AudioWorkletNode) {
//                 processorRef.current.port.postMessage({ type: 'stop' });
//             }
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
//         setStatus(tRef.current('recording.status.stopped'));
//     }, [forceFlushBuffer]);

//     // Остальной код без изменений...
//     const handleStartLecture = () => {
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
//             setStatus(tRef.current('recording.status.recording'));
//         } else {
//             setShowPauseModal(true);
//         }
//     };

//     const confirmPauseLecture = () => {
//         setIsPaused(true);
//         setShowPauseModal(false);
//         isRecordingRef.current = false;
//         setStatus(tRef.current('recording.status.paused'));
//     };

//     const getStatusLabel = () => {
//         if (isPreviewMode) return tRef.current('recording.status.preview');
//         if (isFinished) return tRef.current('recording.status.finished');
//         if (isPaused) return tRef.current('recording.status.paused');
//         return tRef.current('recording.status.recording');
//     };

//     const getBreadcrumbs = () => [
//         {
//             label: getHomeLabel(userRole),
//             path: getHomePath(userRole),
//             translationKey: `roles.${userRole}.home`
//         },
//         {
//             label: tRef.current('recording.breadcrumb'),
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

//     const formatDateTimeForInput = (dateString: string) => {
//         if (!dateString) return '';

//         try {
//             const date = new Date(dateString);
//             if (isNaN(date.getTime())) return '';

//             const year = date.getFullYear();
//             const month = String(date.getMonth() + 1).padStart(2, '0');
//             const day = String(date.getDate()).padStart(2, '0');
//             const hours = String(date.getHours()).padStart(2, '0');
//             const minutes = String(date.getMinutes()).padStart(2, '0');

//             return `${year}-${month}-${day}T${hours}:${minutes}`;
//         } catch (e) {
//             console.error('Date formatting error:', e);
//             return '';
//         }
//     };

//     const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;

//         if (name === 'start_time') {
//             const isoDate = value ? new Date(value).toISOString() : '';
//             setEditedValues(prev => ({
//                 ...prev,
//                 [name]: isoDate
//             }));
//         } else {
//             setEditedValues(prev => ({
//                 ...prev,
//                 [name]: value
//             }));
//         }
//     };

//     const formatDisplayDate = (dateString: string) => {
//         if (!dateString) return tRef.current('common.not_specified');

//         try {
//             const date = new Date(dateString);
//             return isNaN(date.getTime())
//                 ? tRef.current('common.not_specified')
//                 : date.toLocaleString(navigator.language, {
//                     year: 'numeric',
//                     month: 'numeric',
//                     day: 'numeric',
//                     hour: '2-digit',
//                     minute: '2-digit'
//                 });
//         } catch (e) {
//             return tRef.current('common.not_specified');
//         }
//     };

//     useEffect(() => {
//         return () => {
//             if (isRecording) {
//                 stopRecording();
//             }
//         };
//     }, [isRecording, stopRecording]);

//     useEffect(() => {
//         const container = originalTextContainerRef.current;
//         if (!container || isUserScrolled) return;

//         if (originalText) {
//             setTimeout(() => {
//                 if (!isUserScrolled) {
//                     container.scrollTop = container.scrollHeight;
//                 }
//             }, 100);
//         }
//     }, [originalText, isUserScrolled]);

//     useEffect(() => {
//         const container = translatedTextContainerRef.current;
//         if (!container || isUserScrolled) return;

//         if (translations[language]) {
//             setTimeout(() => {
//                 if (!isUserScrolled) {
//                     container.scrollTop = container.scrollHeight;
//                 }
//             }, 100);
//         }
//     }, [translations, language, isUserScrolled]);

//     useEffect(() => {
//         const originalContainer = originalTextContainerRef.current;
//         const translatedContainer = translatedTextContainerRef.current;

//         const handleScroll = () => {
//             if (originalContainer) {
//                 const isAtBottom = originalContainer.scrollHeight - originalContainer.scrollTop <= originalContainer.clientHeight + 10;
//                 setIsUserScrolled(!isAtBottom);
//             }
//         };

//         originalContainer?.addEventListener('scroll', handleScroll);
//         translatedContainer?.addEventListener('scroll', handleScroll);

//         return () => {
//             originalContainer?.removeEventListener('scroll', handleScroll);
//             translatedContainer?.removeEventListener('scroll', handleScroll);
//         };
//     }, []);

//     if (!state?.lecture) {
//         navigate('/recorder', { replace: true });
//         return null;
//     }

//     return (
//         <div className={commonStyles.appContainer}>
//             {isPreviewMode ? (
//                 <div className={commonStyles.mainContent}>
//                     <Header />
//                     <Breadcrumbs items={getBreadcrumbs()} />

//                     <h1 className={commonStyles.sectionHeader}>
//                         {t('recording.title', { title: lecture.lecture_title || lecture.title })}
//                     </h1>
//                     <div className={commonStyles.infoCard}>
//                         <h2 className={commonStyles.subHeader}>
//                             {t('recording.preview.header')}
//                         </h2>

//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.title')}:</span>
//                             {editingField === 'lecture_title' ? (
//                                 <div className={commonStyles.editFieldContainer}>
//                                     <input
//                                         type="text"
//                                         name="lecture_title"
//                                         value={editedValues.lecture_title}
//                                         onChange={handleFieldChange}
//                                         className={commonStyles.filterSelect}
//                                         autoFocus
//                                     />
//                                     <div className={commonStyles.editButtons}>
//                                         <button
//                                             onClick={() => handleSaveField('lecture_title')}
//                                             className={commonStyles.primaryButton}
//                                         >
//                                             {t('common.save')}
//                                         </button>
//                                         <button
//                                             onClick={handleCancelEdit}
//                                             className={commonStyles.secondaryButton}
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
//                                         <EditIcon />
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.lecturer')}:</span>
//                             {editingField === 'lecturer_name' ? (
//                                 <div className={commonStyles.editFieldContainer}>
//                                     <input
//                                         type="text"
//                                         name="lecturer_name"
//                                         value={editedValues.lecturer_name}
//                                         onChange={handleFieldChange}
//                                         className={commonStyles.filterSelect}
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
//                                         <EditIcon />
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.start')}:</span>
//                             {editingField === 'start_time' ? (
//                                 <div className={commonStyles.editFieldContainer}>
//                                     <input
//                                         type="datetime-local"
//                                         name="start_time"
//                                         value={formatDateTimeForInput(editedValues.start_time)}
//                                         onChange={handleFieldChange}
//                                         className={commonStyles.filterSelect}
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
//                                     <span>{formatDisplayDate(lecture.start_time)}</span>
//                                     <button
//                                         onClick={() => handleEditClick('start_time')}
//                                         className={commonStyles.editButton}
//                                         title={t('common.edit')}
//                                     >
//                                         <EditIcon />
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.location')}:</span>
//                             {editingField === 'exact_location' ? (
//                                 <div className={commonStyles.editFieldContainer}>
//                                     <input
//                                         type="text"
//                                         name="exact_location"
//                                         value={editedValues.exact_location}
//                                         onChange={handleFieldChange}
//                                         className={commonStyles.filterSelect}
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
//                                         <EditIcon />
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
//                 </div>
//             ) : (
//                 <div className={commonStyles.mainContent}>
//                     <HeaderWithoutTranslate setIsFinished={setIsFinished} />
//                     <Breadcrumbs items={getBreadcrumbs()} />

//                     <h1 className={commonStyles.sectionHeader}>
//                         {t('recording.title', { title: lecture.lecture_title || lecture.title })}
//                     </h1>
//                     <div className={commonStyles.infoCard}>
//                         <h2 className={commonStyles.subHeader}>
//                             {getStatusLabel()}
//                         </h2>
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.title')}:</span>
//                             <span>{lecture.lecture_title || lecture.title}</span>
//                         </div>
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.lecturer')}:</span>
//                             <span>{lecture.lecturer_name || lecture.lecturer}</span>
//                         </div>
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.start')}:</span>
//                             <span>{lecture.start_time ? new Date(lecture.start_time).toLocaleString() : t('common.not_specified')}</span>
//                         </div>
//                         <div className={commonStyles.statusItem}>
//                             <span>{t('recording.lecture.location')}:</span>
//                             <span>{lecture.exact_location || lecture.location}</span>
//                         </div>

//                         <div className={commonStyles.buttonGroup} style={{ marginTop: '20px' }}>
//                             {!isFinished ? (
//                                 <>
//                                     <button
//                                         onClick={handleTogglePause}
//                                         className={`${isPaused ? commonStyles.primaryButton : commonStyles.refreshButton}`}
//                                         disabled={isFinished}
//                                     >
//                                         {isPaused ? t('recording.resume_button') : t('recording.pause_button')}
//                                     </button>
//                                     <button
//                                         onClick={() => setShowStopModal(true)}
//                                         className={commonStyles.secondaryButton}
//                                     >
//                                         {t('recording.stop_button')}
//                                     </button>
//                                 </>
//                             ) : (
//                                 <button
//                                     onClick={() => navigate('/archive')}
//                                     className={commonStyles.primaryButton}
//                                     style={{ width: '100%' }}
//                                 >
//                                     {t('recording.go_to_archive')}
//                                 </button>
//                             )}
//                         </div>
//                     </div>

//                     <div className={commonStyles.infoCardLecture}>
//                         <div className={commonStyles.listItemLecture}>
//                             <div className={commonStyles.textHeaderContainer}>
//                                 <h2>{t('recording.original_text')}</h2>
//                             </div>
//                             <div className={commonStyles.ItemLecture}>
//                                 {showFullText && (
//                                     <div
//                                         ref={originalTextContainerRef}
//                                         className={commonStyles.LectureFullText}
//                                         style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', marginTop: '60px' }}
//                                     >
//                                         {originalText || t('recording.text_unavailable')}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         <div className={commonStyles.listItemLecture}>
//                             <h2>{t('recording.translated_text', {
//                                 language: t(`language.${language}`)
//                             })}</h2>

//                             <select
//                                 className={commonStyles.filterSelect}
//                                 value={language}
//                                 onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'zh')}
//                                 style={{ marginBottom: '15px' }}
//                             >
//                                 <option value="en">{t('language.english')}</option>
//                                 <option value="fr">{t('language.french')}</option>
//                                 <option value="zh">{t('language.chinese')}</option>
//                             </select>

//                             <div className={commonStyles.ItemLecture}>
//                                 {showFullText && (
//                                     <div
//                                         ref={translatedTextContainerRef}
//                                         className={commonStyles.LectureFullText}
//                                         style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
//                                     >
//                                         {translations[language] || t('recording.translation_unavailable')}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showStopModal && (
//                 <div className={commonStyles.modalOverlay}>
//                     <div className={commonStyles.modal}>
//                         <h3>{t('confirmation.title')}</h3>
//                         <p>{t('recording.stop_confirmation')}</p>
//                         <div className={commonStyles.modalButtons}>
//                             <button
//                                 onClick={() => setShowStopModal(false)}
//                                 className={commonStyles.cancelModalButton}
//                             >
//                                 {t('common.cancel')}
//                             </button>
//                             <button
//                                 onClick={confirmStopLecture}
//                                 className={commonStyles.okModalButton}
//                             >
//                                 {t('recording.confirm_stop')}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showPauseModal && (
//                 <div className={commonStyles.modalOverlay}>
//                     <div className={commonStyles.modal}>
//                         <h3>{t('confirmation.title')}</h3>
//                         <p>{t('recording.pause_confirmation')}</p>
//                         <div className={commonStyles.modalButtons}>
//                             <button
//                                 onClick={() => setShowPauseModal(false)}
//                                 className={commonStyles.cancelModalButton}
//                             >
//                                 {t('common.cancel')}
//                             </button>
//                             <button
//                                 onClick={confirmPauseLecture}
//                                 className={commonStyles.okModalButton}
//                             >
//                                 {t('recording.confirm_pause')}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showStartModal && (
//                 <div className={commonStyles.modalOverlay}>
//                     <div className={commonStyles.modal}>
//                         <h3>{t('recording.starting_lecture')}</h3>
//                         <p>{t('recording.starting_message')}</p>
//                         <div style={{
//                             display: 'flex',
//                             justifyContent: 'center',
//                             marginTop: '20px'
//                         }}>
//                             <div className={commonStyles.loader}></div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default RecordingLecturePage;


