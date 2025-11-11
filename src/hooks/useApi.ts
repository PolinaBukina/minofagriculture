// import { useState, useEffect, useCallback } from 'react'
// import { apiService } from '../services/api'

// // Типы для хуков
// type ApiCallFunction<T extends any[], R> = (...args: T) => Promise<R>

// interface UseApiReturn<T> {
//     data: T | null
//     loading: boolean
//     error: string | null
//     execute: ApiCallFunction<any, T>
//     setData: React.Dispatch<React.SetStateAction<T | null>>
// }

// interface ServerHealthStatus {
//     healthy: boolean
//     checking: boolean
//     lastCheck: Date | null
//     error: string | null
//     data: {
//         health: Awaited<ReturnType<typeof apiService.healthCheck>> | null
//         info: Awaited<ReturnType<typeof apiService.getServerInfo>> | null
//     } | null
// }

// interface Session {
//     id: string
//     session_id: string
//     name: string
//     title?: string
//     lecturer?: string
//     start_time: string
//     end_time?: string
//     status: 'active' | 'completed' | 'failed' | string
//     participants?: number
// }

// interface UseSessionsReturn {
//     sessions: Session[]
//     activeSessions: Session[]
//     completedSessions: Session[]
//     loading: boolean
//     error: string | null
//     loadSessions: () => Promise<Session[]>
//     getSessionData: (sessionId: string) => Promise<Awaited<ReturnType<typeof apiService.getSessionData>>>
// }

// interface UseStatsReturn {
//     stats: Awaited<ReturnType<typeof apiService.getStats>> | null
//     loading: boolean
//     error: string | null
//     loadStats: () => Promise<Awaited<ReturnType<typeof apiService.getStats>>>
// }

// interface UseWebSocketOptions {
//     onOpen?: () => void
//     onClose?: () => void
//     onError?: (error: Event) => void
//     onMessage?: (data: any) => void
// }

// interface UseWebSocketReturn {
//     connected: boolean
//     error: string | null
//     messages: any[]
//     connect: () => WebSocket | null
//     disconnect: () => void
//     send: (message: any) => void
//     clearMessages: () => void
// }

// interface UseAudioRecorderReturn {
//     recording: boolean
//     error: string | null
//     startRecording: () => Promise<{
//         stream: MediaStream
//         audioContext: AudioContext
//         processor: ScriptProcessorNode
//     }>
//     stopRecording: () => void
//     audioContext: AudioContext | null
//     processor: ScriptProcessorNode | null
// }

// // Универсальный хук для API запросов
// export const useApi = <T, Args extends any[] = any[]>(
//     apiCall: ApiCallFunction<Args, T>,
//     dependencies: any[] = []
// ): UseApiReturn<T> => {
//     const [data, setData] = useState<T | null>(null)
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState<string | null>(null)

//     const execute = useCallback(async (...args: Args) => {
//         try {
//             setLoading(true)
//             setError(null)
//             const result = await apiCall(...args)
//             setData(result)
//             return result
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Unknown error')
//             throw err
//         } finally {
//             setLoading(false)
//         }
//     }, dependencies)

//     return { data, loading, error, execute, setData }
// }

// // Хук для проверки здоровья сервера
// export const useServerHealth = () => {
//     const [status, setStatus] = useState<ServerHealthStatus>({
//         healthy: false,
//         checking: false,
//         lastCheck: null,
//         error: null,
//         data: null
//     })

//     const checkHealth = useCallback(async () => {
//         setStatus(prev => ({ ...prev, checking: true, error: null }))

//         try {
//             const healthData = await apiService.healthCheck()
//             const serverInfo = await apiService.getServerInfo()

//             setStatus({
//                 healthy: true,
//                 checking: false,
//                 lastCheck: new Date(),
//                 error: null,
//                 data: { health: healthData, info: serverInfo }
//             })

//             return true
//         } catch (error) {
//             setStatus({
//                 healthy: false,
//                 checking: false,
//                 lastCheck: new Date(),
//                 error: error instanceof Error ? error.message : 'Unknown error',
//                 data: null
//             })

//             return false
//         }
//     }, [])

//     // Автоматическая проверка при монтировании
//     useEffect(() => {
//         checkHealth()
//     }, [checkHealth])

//     return { ...status, checkHealth }
// }

// // Хук для работы с сессиями
// export const useSessions = (): UseSessionsReturn => {
//     const [sessions, setSessions] = useState<Session[]>([])
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState<string | null>(null)

//     const loadSessions = useCallback(async () => {
//         try {
//             setLoading(true)
//             setError(null)
//             const result = await apiService.getSessions()
//             setSessions(result)
//             return result
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Unknown error')
//             setSessions([])
//             throw err
//         } finally {
//             setLoading(false)
//         }
//     }, [])

//     const getSessionData = useCallback(async (sessionId: string) => {
//         try {
//             const result = await apiService.getSessionData(sessionId)
//             return result
//         } catch (err) {
//             throw err
//         }
//     }, [])

//     // Фильтры для сессий
//     const activeSessions = sessions.filter(s => s.status === 'active')
//     const completedSessions = sessions.filter(s => s.status === 'completed')

//     useEffect(() => {
//         loadSessions()
//     }, [loadSessions])

//     return {
//         sessions,
//         activeSessions,
//         completedSessions,
//         loading,
//         error,
//         loadSessions,
//         getSessionData
//     }
// }

// // Хук для статистики системы
// export const useStats = (interval: number = 30000): UseStatsReturn => {
//     const [stats, setStats] = useState<Awaited<ReturnType<typeof apiService.getStats>> | null>(null)
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState<string | null>(null)

//     const loadStats = useCallback(async () => {
//         try {
//             setLoading(true)
//             setError(null)
//             const result = await apiService.getStats()
//             setStats(result)
//             return result
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Unknown error')
//             throw err
//         } finally {
//             setLoading(false)
//         }
//     }, [])

//     // Автоматическое обновление статистики
//     useEffect(() => {
//         loadStats()

//         const intervalId = setInterval(loadStats, interval)

//         return () => clearInterval(intervalId)
//     }, [loadStats, interval])

//     return { stats, loading, error, loadStats }
// }

// // Хук для WebSocket подключений
// export const useWebSocket = (
//     endpoint: string,
//     options: UseWebSocketOptions = {}
// ): UseWebSocketReturn => {
//     const [ws, setWs] = useState<WebSocket | null>(null)
//     const [connected, setConnected] = useState(false)
//     const [error, setError] = useState<string | null>(null)
//     const [messages, setMessages] = useState<any[]>([])

//     const connect = useCallback(() => {
//         try {
//             const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
//             const wsHost = window.location.host
//             const wsUrl = `${wsProtocol}//${wsHost}${endpoint}`

//             const websocket = new WebSocket(wsUrl)

//             websocket.onopen = () => {
//                 setConnected(true)
//                 setError(null)
//                 if (options.onOpen) options.onOpen()
//             }

//             websocket.onclose = () => {
//                 setConnected(false)
//                 if (options.onClose) options.onClose()
//             }

//             // websocket.onerror = (err) => {
//             //     setError(err.message || 'WebSocket error')
//             //     if (options.onError) options.onError(err)
//             // }

//             websocket.onerror = (event: Event) => {
//                 const errorMessage = 'message' in event ? (event as ErrorEvent).message : 'WebSocket error';
//                 setError(errorMessage);
//                 if (options.onError) options.onError(event);
//             };

//             websocket.onmessage = (event) => {
//                 try {
//                     const data = JSON.parse(event.data)
//                     setMessages(prev => [...prev.slice(-99), data]) // Храним последние 100 сообщений
//                     if (options.onMessage) options.onMessage(data)
//                 } catch (err) {
//                     console.error('WebSocket message parse error:', err)
//                 }
//             }

//             setWs(websocket)
//             return websocket
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Unknown error')
//             return null
//         }
//     }, [endpoint, options])

//     const disconnect = useCallback(() => {
//         if (ws) {
//             ws.close()
//             setWs(null)
//             setConnected(false)
//         }
//     }, [ws])

//     const send = useCallback((message: any) => {
//         if (ws && connected) {
//             ws.send(JSON.stringify(message))
//         } else {
//             console.warn('WebSocket not connected')
//         }
//     }, [ws, connected])

//     const clearMessages = useCallback(() => {
//         setMessages([])
//     }, [])

//     // Автоматическое отключение при размонтировании
//     useEffect(() => {
//         return () => {
//             if (ws) {
//                 ws.close()
//             }
//         }
//     }, [ws])

//     return {
//         connected,
//         error,
//         messages,
//         connect,
//         disconnect,
//         send,
//         clearMessages
//     }
// }

// // Хук для записи аудио
// export const useAudioRecorder = (): UseAudioRecorderReturn => {
//     const [recording, setRecording] = useState(false)
//     const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
//     const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
//     const [processor, setProcessor] = useState<ScriptProcessorNode | null>(null)
//     const [error, setError] = useState<string | null>(null)

//     const startRecording = useCallback(async () => {
//         try {
//             setError(null)

//             // Запрашиваем доступ к микрофону
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 audio: {
//                     sampleRate: 16000,
//                     channelCount: 1,
//                     echoCancellation: false,
//                     noiseSuppression: false,
//                     autoGainControl: false
//                 }
//             })

//             setMediaStream(stream)

//             // Создаем AudioContext
//             const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
//                 sampleRate: 16000
//             })

//             setAudioContext(audioCtx)

//             const source = audioCtx.createMediaStreamSource(stream)
//             const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1)

//             setProcessor(scriptProcessor)

//             source.connect(scriptProcessor)
//             scriptProcessor.connect(audioCtx.destination)

//             setRecording(true)

//             return { stream, audioContext: audioCtx, processor: scriptProcessor }
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Unknown error')
//             throw err
//         }
//     }, [])

//     const stopRecording = useCallback(() => {
//         if (mediaStream) {
//             mediaStream.getTracks().forEach(track => track.stop())
//             setMediaStream(null)
//         }

//         if (processor) {
//             processor.disconnect()
//             setProcessor(null)
//         }

//         if (audioContext) {
//             audioContext.close()
//             setAudioContext(null)
//         }

//         setRecording(false)
//     }, [mediaStream, processor, audioContext])

//     // Автоматическая очистка при размонтировании
//     useEffect(() => {
//         return () => {
//             if (recording) {
//                 stopRecording()
//             }
//         }
//     }, [recording, stopRecording])

//     return {
//         recording,
//         error,
//         startRecording,
//         stopRecording,
//         audioContext,
//         processor
//     }
// }


import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../services/api'

// Типы для хуков
type ApiCallFunction<T extends any[], R> = (...args: T) => Promise<R>

interface UseApiReturn<T> {
    data: T | null
    loading: boolean
    error: string | null
    execute: ApiCallFunction<any, T>
    setData: React.Dispatch<React.SetStateAction<T | null>>
}

interface ServerHealthStatus {
    healthy: boolean
    checking: boolean
    lastCheck: Date | null
    error: string | null
    data: {
        health: Awaited<ReturnType<typeof apiService.healthCheck>> | null
        info: Awaited<ReturnType<typeof apiService.getServerInfo>> | null
    } | null
}

interface Session {
    id: string
    session_id: string
    name: string
    title?: string
    lecturer?: string
    start_time: string
    end_time?: string
    status: 'active' | 'completed' | 'failed' | string
    participants?: number
}

interface UseSessionsReturn {
    sessions: Session[]
    activeSessions: Session[]
    completedSessions: Session[]
    loading: boolean
    error: string | null
    loadSessions: () => Promise<Session[]>
    getSessionData: (sessionId: string) => Promise<Awaited<ReturnType<typeof apiService.getSessionData>>>
}

interface UseStatsReturn {
    stats: Awaited<ReturnType<typeof apiService.getStats>> | null
    loading: boolean
    error: string | null
    loadStats: () => Promise<Awaited<ReturnType<typeof apiService.getStats>>>
}

interface UseWebSocketOptions {
    onOpen?: () => void
    onClose?: () => void
    onError?: (error: Event) => void
    onMessage?: (data: any) => void
}

interface UseWebSocketReturn {
    connected: boolean
    error: string | null
    messages: any[]
    connect: () => WebSocket | null
    disconnect: () => void
    send: (message: any) => void
    clearMessages: () => void
}

interface UseAudioRecorderReturn {
    recording: boolean
    error: string | null
    startRecording: () => Promise<{
        stream: MediaStream
        audioContext: AudioContext
        workletNode: AudioWorkletNode
    }>
    stopRecording: () => void
    audioContext: AudioContext | null
    workletNode: AudioWorkletNode | null
}

// Универсальный хук для API запросов
export const useApi = <T, Args extends any[] = any[]>(
    apiCall: ApiCallFunction<Args, T>,
    dependencies: any[] = []
): UseApiReturn<T> => {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const execute = useCallback(async (...args: Args) => {
        try {
            setLoading(true)
            setError(null)
            const result = await apiCall(...args)
            setData(result)
            return result
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            throw err
        } finally {
            setLoading(false)
        }
    }, dependencies)

    return { data, loading, error, execute, setData }
}

// Хук для проверки здоровья сервера
export const useServerHealth = () => {
    const [status, setStatus] = useState<ServerHealthStatus>({
        healthy: false,
        checking: false,
        lastCheck: null,
        error: null,
        data: null
    })

    const checkHealth = useCallback(async () => {
        setStatus(prev => ({ ...prev, checking: true, error: null }))

        try {
            const healthData = await apiService.healthCheck()
            const serverInfo = await apiService.getServerInfo()

            setStatus({
                healthy: true,
                checking: false,
                lastCheck: new Date(),
                error: null,
                data: { health: healthData, info: serverInfo }
            })

            return true
        } catch (error) {
            setStatus({
                healthy: false,
                checking: false,
                lastCheck: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error',
                data: null
            })

            return false
        }
    }, [])

    // Автоматическая проверка при монтировании
    useEffect(() => {
        checkHealth()
    }, [checkHealth])

    return { ...status, checkHealth }
}

// Хук для работы с сессиями
export const useSessions = (): UseSessionsReturn => {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadSessions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const result = await apiService.getSessions()
            setSessions(result)
            return result
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            setSessions([])
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const getSessionData = useCallback(async (sessionId: string) => {
        try {
            const result = await apiService.getSessionData(sessionId)
            return result
        } catch (err) {
            throw err
        }
    }, [])

    // Фильтры для сессий
    const activeSessions = sessions.filter(s => s.status === 'active')
    const completedSessions = sessions.filter(s => s.status === 'completed')

    useEffect(() => {
        loadSessions()
    }, [loadSessions])

    return {
        sessions,
        activeSessions,
        completedSessions,
        loading,
        error,
        loadSessions,
        getSessionData
    }
}

// Хук для статистики системы
export const useStats = (interval: number = 30000): UseStatsReturn => {
    const [stats, setStats] = useState<Awaited<ReturnType<typeof apiService.getStats>> | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadStats = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const result = await apiService.getStats()
            setStats(result)
            return result
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Автоматическое обновление статистики
    useEffect(() => {
        loadStats()

        const intervalId = setInterval(loadStats, interval)

        return () => clearInterval(intervalId)
    }, [loadStats, interval])

    return { stats, loading, error, loadStats }
}

// Хук для WebSocket подключений
export const useWebSocket = (
    endpoint: string,
    options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [connected, setConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [messages, setMessages] = useState<any[]>([])

    const connect = useCallback(() => {
        try {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const wsHost = window.location.host
            const wsUrl = `${wsProtocol}//${wsHost}${endpoint}`

            const websocket = new WebSocket(wsUrl)

            websocket.onopen = () => {
                setConnected(true)
                setError(null)
                if (options.onOpen) options.onOpen()
            }

            websocket.onclose = () => {
                setConnected(false)
                if (options.onClose) options.onClose()
            }

            websocket.onerror = (event: Event) => {
                const errorMessage = 'message' in event ? (event as ErrorEvent).message : 'WebSocket error';
                setError(errorMessage);
                if (options.onError) options.onError(event);
            };

            websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    setMessages(prev => [...prev.slice(-99), data]) // Храним последние 100 сообщений
                    if (options.onMessage) options.onMessage(data)
                } catch (err) {
                    console.error('WebSocket message parse error:', err)
                }
            }

            setWs(websocket)
            return websocket
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            return null
        }
    }, [endpoint, options])

    const disconnect = useCallback(() => {
        if (ws) {
            ws.close()
            setWs(null)
            setConnected(false)
        }
    }, [ws])

    const send = useCallback((message: any) => {
        if (ws && connected) {
            ws.send(JSON.stringify(message))
        } else {
            console.warn('WebSocket not connected')
        }
    }, [ws, connected])

    const clearMessages = useCallback(() => {
        setMessages([])
    }, [])

    // Автоматическое отключение при размонтировании
    useEffect(() => {
        return () => {
            if (ws) {
                ws.close()
            }
        }
    }, [ws])

    return {
        connected,
        error,
        messages,
        connect,
        disconnect,
        send,
        clearMessages
    }
}

// Функция для создания Audio Worklet
const createAudioWorklet = async (audioContext: AudioContext): Promise<void> => {
    try {
        // Сначала пробуем загрузить из файла
        // const workletPath = process.env.PUBLIC_URL + '/audio-worklet/audio-processor.js';
        const workletPath = process.env.PUBLIC_URL + '../audio-worklet/audio-processor.js';
        await audioContext.audioWorklet.addModule(workletPath);
    } catch (error) {
        console.warn('Failed to load worklet from file, creating inline worklet:', error);

        // Fallback: создаем worklet inline
        const workletCode = `
            class AudioProcessor extends AudioWorkletProcessor {
                constructor() {
                    super();
                }

                process(inputs, outputs, parameters) {
                    const input = inputs[0];
                    if (input && input.length > 0) {
                        const inputData = input[0];
                        const pcmData = this.float32ToPCM16(inputData);
                        
                        this.port.postMessage({
                            type: 'audioData',
                            data: pcmData
                        });
                    }
                    return true;
                }

                float32ToPCM16(float32Array) {
                    const pcm16 = new Int16Array(float32Array.length);
                    for (let i = 0; i < float32Array.length; i++) {
                        const sample = Math.max(-1, Math.min(1, float32Array[i]));
                        pcm16[i] = Math.round(sample * 0x7FFF);
                    }
                    return pcm16;
                }
            }

            registerProcessor('audio-processor', AudioProcessor);
        `;

        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const workletUrl = URL.createObjectURL(blob);
        await audioContext.audioWorklet.addModule(workletUrl);
        URL.revokeObjectURL(workletUrl);
    }
}

// Хук для записи аудио с AudioWorkletNode
export const useAudioRecorder = (): UseAudioRecorderReturn => {
    const [recording, setRecording] = useState(false)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
    const [workletNode, setWorkletNode] = useState<AudioWorkletNode | null>(null)
    const [error, setError] = useState<string | null>(null)

    const startRecording = useCallback(async () => {
        try {
            setError(null)

            // Запрашиваем доступ к микрофону
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            })

            setMediaStream(stream)

            // Создаем AudioContext
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000
            })

            setAudioContext(audioCtx)

            const source = audioCtx.createMediaStreamSource(stream)

            // Загружаем и создаем Audio Worklet
            await createAudioWorklet(audioCtx)

            // Создаем AudioWorkletNode
            const worklet = new AudioWorkletNode(audioCtx, 'audio-processor')
            setWorkletNode(worklet)

            // Подключаем обработчик сообщений от worklet
            worklet.port.onmessage = (event) => {
                // Здесь можно обрабатывать аудио данные из worklet
                const { type, data } = event.data
                if (type === 'audioData') {
                    // Обработка аудио данных
                    console.log('Audio data received from worklet:', data.length)
                }
            }

            // Подключаем ноды
            source.connect(worklet)
            worklet.connect(audioCtx.destination)

            setRecording(true)

            return { stream, audioContext: audioCtx, workletNode: worklet }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            throw err
        }
    }, [])

    const stopRecording = useCallback(() => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop())
            setMediaStream(null)
        }

        if (workletNode) {
            workletNode.disconnect()
            setWorkletNode(null)
        }

        if (audioContext) {
            audioContext.close()
            setAudioContext(null)
        }

        setRecording(false)
    }, [mediaStream, workletNode, audioContext])

    // Автоматическая очистка при размонтировании
    useEffect(() => {
        return () => {
            if (recording) {
                stopRecording()
            }
        }
    }, [recording, stopRecording])

    return {
        recording,
        error,
        startRecording,
        stopRecording,
        audioContext,
        workletNode
    }
}

// Дополнительный хук для расширенной записи аудио с обработкой данных
export const useAdvancedAudioRecorder = (onAudioData?: (data: Int16Array) => void) => {
    const [recording, setRecording] = useState(false)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
    const [workletNode, setWorkletNode] = useState<AudioWorkletNode | null>(null)
    const [error, setError] = useState<string | null>(null)

    const startRecording = useCallback(async () => {
        try {
            setError(null)

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            })

            setMediaStream(stream)

            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000
            })

            setAudioContext(audioCtx)

            const source = audioCtx.createMediaStreamSource(stream)

            await createAudioWorklet(audioCtx)

            const worklet = new AudioWorkletNode(audioCtx, 'audio-processor')
            setWorkletNode(worklet)

            // Обработчик для получения аудио данных
            worklet.port.onmessage = (event) => {
                const { type, data } = event.data
                if (type === 'audioData' && onAudioData) {
                    onAudioData(data)
                }
            }

            source.connect(worklet)
            worklet.connect(audioCtx.destination)

            setRecording(true)

            return { stream, audioContext: audioCtx, workletNode: worklet }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            throw err
        }
    }, [onAudioData])

    const stopRecording = useCallback(() => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop())
            setMediaStream(null)
        }

        if (workletNode) {
            workletNode.disconnect()
            setWorkletNode(null)
        }

        if (audioContext) {
            audioContext.close()
            setAudioContext(null)
        }

        setRecording(false)
    }, [mediaStream, workletNode, audioContext])

    useEffect(() => {
        return () => {
            if (recording) {
                stopRecording()
            }
        }
    }, [recording, stopRecording])

    return {
        recording,
        error,
        startRecording,
        stopRecording,
        audioContext,
        workletNode
    }
}