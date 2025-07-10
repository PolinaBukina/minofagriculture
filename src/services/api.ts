import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig
} from 'axios'

// ИСПРАВЛЕНО: Правильный базовый URL
// const API_BASE_URL = process.env.VITE_API_URL || 'https://audio.minofagriculture.ru'

const API_BASE_URL = 'https://audio.minofagriculture.ru'


// Создаем экземпляр axios с базовой конфигурацией
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Интерцептор для логирования запросов
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
        return config
    },
    (error: AxiosError) => {
        console.error('❌ API Request Error:', error)
        return Promise.reject(error)
    }
)

// Интерцептор для обработки ответов
api.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        return response
    },
    (error: AxiosError) => {
        console.log('Full URL:', API_BASE_URL + '/sessions')

        console.error('❌ API Response Error:', error.response?.status, error.response?.data)
        return Promise.reject(error)
    }
)

// Типы для API
type HealthCheckResponse = {
    status: string
    timestamp: string
}

type ServerInfo = {
    version: string
    uptime: number
    services: string[]
}

export type Session = {
    id: string;
    session_id: string;
    name: string;
    title?: string;
    lecturer?: string;
    start_time: string;
    end_time?: string;
    status: 'active' | 'completed' | 'failed' | string;
    participants?: number;
};

export type SessionData = Session & {
    participants: number,
    processed_texts?: string[]
    audio_duration?: number
    transcripts?: string[]
    translations?: string[]

    total_transcriptions?: number
    total_processed?: number
}

type SessionResults = {
    transcripts: string[]
    translations: string[]
    summary?: string
}

type Stats = {
    sessions_count: number
    active_sessions: number
    avg_session_duration: number
    users_online: number
}

type WebSocketDiagnostics = {
    status: string
    active_connections: number
    messages_sent: number
    messages_received: number
}

// WebSocket типы
type WebSocketOptions = {
    onOpen?: (event: Event) => void
    onClose?: (event: CloseEvent) => void
    onError?: (error: Event) => void
    onMessage?: (data: any) => void
}

type WebSocketMessage = {
    type: string
    [key: string]: any
}

// API методы
export const apiService = {
    // Проверка здоровья сервера
    async healthCheck(): Promise<HealthCheckResponse> {
        try {
            const response = await api.get('/health')
            return response.data
        } catch (error) {
            throw new Error(`Health check failed: ${(error as Error).message}`)
        }
    },

    // Получение информации о сервере
    async getServerInfo(): Promise<ServerInfo> {
        try {
            const response = await api.get('/')
            return response.data
        } catch (error) {
            throw new Error(`Server info failed: ${(error as Error).message}`)
        }
    },

    // ИСПРАВЛЕНО: Получение списка сессий
    async getSessions(): Promise<Session[]> {
        try {
            const response = await api.get('/sessions')
            // ИСПРАВЛЕНО: Правильный путь к данным
            const sessions = response.data.sessions || response.data

            // Преобразуем данные из MongoDB формата в нужный формат
            return sessions.map((session: any) => ({
                id: session._id || session.id,
                session_id: session.session_id,
                name: session.session_id, // Используем session_id как name
                title: `Лекция ${session.session_id.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
                lecturer: `Сервер ${session.server_id || 'Unknown'}`,
                start_time: session.start_time,
                end_time: session.end_time,
                status: session.status,
                participants: 1 // По умолчанию 1 участник
            }))
        } catch (error) {
            console.error('❌ getSessions error:', error)
            throw new Error(`Get sessions failed: ${(error as Error).message}`)
        }
    },

    // Получение данных конкретной сессии
    async getSessionData(sessionId: string): Promise<SessionData> {
        try {
            const response = await api.get(`/sessions/${sessionId}`)
            const data = response.data

            // Преобразуем данные из API формата
            return {
                id: data.session?._id || sessionId,
                session_id: data.session?.session_id || sessionId,
                name: data.session?.session_id || sessionId,
                title: `Лекция ${sessionId.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
                lecturer: data.session?.server_id || 'Unknown',
                start_time: data.session?.start_time || new Date().toISOString(),
                end_time: data.session?.end_time,
                status: data.session?.status || 'unknown',
                participants: 1,
                audio_duration: data.session?.duration,
                transcripts: data.transcriptions?.map((t: any) => t.text) || [],
                translations: data.processed_texts?.map((p: any) => p.english_translation) || []
            }
        } catch (error) {
            console.error('❌ getSessionData error:', error)
            throw new Error(`Get session data failed: ${(error as Error).message}`)
        }
    },

    // Получение информации о конкретной сессии (для LectureViewer)
    async getSession(sessionId: string): Promise<SessionData | null> {
        try {
            return await this.getSessionData(sessionId)
        } catch (error) {
            console.warn(`⚠️ Session not available for ${sessionId}:`, (error as Error).message)
            return null
        }
    },

    // Получение результатов обработки сессии (тексты, переводы)
    async getSessionResults(sessionId: string): Promise<SessionResults> {
        try {
            const sessionData = await this.getSessionData(sessionId)
            return {
                transcripts: sessionData.transcripts || [],
                translations: sessionData.translations || []
            }
        } catch (error) {
            console.warn(`⚠️ Session results not available for ${sessionId}:`, (error as Error).message)
            return { transcripts: [], translations: [] }
        }
    },

    // Получение текстов транскрипции сессии
    async getSessionTranscripts(sessionId: string): Promise<string[]> {
        try {
            const sessionData = await this.getSessionData(sessionId)
            return sessionData.transcripts || []
        } catch (error) {
            console.warn(`⚠️ Session transcripts not available for ${sessionId}:`, (error as Error).message)
            return []
        }
    },

    // Получение переводов сессии
    async getSessionTranslations(sessionId: string): Promise<string[]> {
        try {
            const sessionData = await this.getSessionData(sessionId)
            return sessionData.translations || []
        } catch (error) {
            console.warn(`⚠️ Session translations not available for ${sessionId}:`, (error as Error).message)
            return []
        }
    },

    // Получение статистики
    async getStats(): Promise<Stats> {
        try {
            const response = await api.get('/stats')
            return response.data
        } catch (error) {
            // Fallback - генерируем статистику на основе сессий
            try {
                const sessions = await this.getSessions()
                return {
                    sessions_count: sessions.length,
                    active_sessions: sessions.filter(s => s.status === 'active').length,
                    avg_session_duration: 0,
                    users_online: 0
                }
            } catch {
                throw new Error(`Get stats failed: ${(error as Error).message}`)
            }
        }
    },

    // Диагностика WebSocket
    async getWebSocketDiagnostics(): Promise<WebSocketDiagnostics> {
        try {
            const response = await api.get('/diagnostics/websocket')
            return response.data
        } catch (error) {
            // Fallback
            return {
                status: 'unknown',
                active_connections: 0,
                messages_sent: 0,
                messages_received: 0
            }
        }
    }
}

// WebSocket утилиты - ИСПРАВЛЕНО: используем правильный хост
export const createWebSocketConnection = (endpoint: string, options: WebSocketOptions = {}): WebSocket => {
    const wsProtocol = 'wss:' // Всегда используем безопасное соединение
    const wsHost = 'audio.minofagriculture.ru'
    const wsUrl = `${wsProtocol}//${wsHost}${endpoint}`

    console.log(`🔌 Creating WebSocket connection: ${wsUrl}`)

    const ws = new WebSocket(wsUrl)

    // Базовые обработчики событий
    ws.onopen = (event: Event) => {
        console.log('✅ WebSocket connected:', wsUrl)
        if (options.onOpen) options.onOpen(event)
    }

    ws.onclose = (event: CloseEvent) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason)
        if (options.onClose) options.onClose(event)
    }

    ws.onerror = (error: Event) => {
        console.error('❌ WebSocket error:', error)
        if (options.onError) options.onError(error)
    }

    ws.onmessage = (event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data)
            console.log('📨 WebSocket message:', data.type || 'unknown')
            if (options.onMessage) options.onMessage(data)
        } catch (error) {
            console.error('❌ WebSocket message parse error:', error)
        }
    }

    return ws
}

// WebSocket класс для записи аудио (лектор)
export class AudioWebSocket {
    private ws: WebSocket | null = null
    private sessionId: string | null = null
    public isConnected: boolean = false
    private messageHandlers: Map<string, (data: any) => void> = new Map()

    connect(sessionId: string | null = null): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                this.sessionId = sessionId || this.generateSessionId()

                this.ws = createWebSocketConnection('/ws/audio', {
                    onOpen: () => {
                        this.isConnected = true
                        this.sendSessionStart()
                        resolve(this.sessionId!)
                    },
                    onClose: () => {
                        this.isConnected = false
                    },
                    onError: (error) => {
                        reject(error)
                    },
                    onMessage: (data) => {
                        this.handleMessage(data)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    disconnect(): void {
        if (this.ws && this.isConnected) {
            this.sendSessionEnd()
            this.ws.close()
            this.isConnected = false
        }
    }

    private sendSessionStart(): void {
        const message = {
            type: 'session_start',
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            audio_config: {
                sample_rate: 16000,
                channels: 1,
                format: 'pcm16'
            }
        }
        this.send(message)
    }

    private sendSessionEnd(): void {
        const message = {
            type: 'session_end',
            session_id: this.sessionId,
            timestamp: new Date().toISOString()
        }
        this.send(message)
    }

    sendAudioChunk(audioData: string): void {
        const message = {
            type: 'audio_chunk',
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            audio_data: audioData,
            format: 'pcm16'
        }
        this.send(message)
    }

    private send(message: WebSocketMessage): void {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(message))
        } else {
            console.warn('⚠️ WebSocket not connected, cannot send message')
        }
    }

    onMessage(type: string, handler: (data: any) => void): void {
        this.messageHandlers.set(type, handler)
    }

    private handleMessage(data: WebSocketMessage): void {
        const handler = this.messageHandlers.get(data.type)
        if (handler) {
            handler(data)
        }
    }

    private generateSessionId(): string {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }
    
}

// WebSocket класс для мониторинга лекций (Cлушатель)
export class MonitoringWebSocket {
    private ws: WebSocket | null = null
    private sessionId: string | null = null
    private listenerId: string | null = null
    private isConnected: boolean = false
    private messageHandlers: Map<string, (data: any) => void> = new Map()

    private generateListenerId(): string {
        return 'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }

    connect(sessionId: string | null = null): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                this.sessionId = sessionId
                this.listenerId = this.generateListenerId()

                this.ws = createWebSocketConnection('/ws/monitor', {
                    onOpen: () => {
                        this.isConnected = true

                        // Подписываемся на сессию если указана
                        if (sessionId) {
                            this.sendSubscription(sessionId)
                        }

                        resolve(this.listenerId!)
                    },
                    onClose: () => {
                        this.isConnected = false
                    },
                    onError: (error) => {
                        reject(error)
                    },
                    onMessage: (data) => {
                        this.handleMessage(data)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    disconnect(): void {
        if (this.ws && this.isConnected) {
            this.ws.close()
            this.isConnected = false
        }
    }

    private sendSubscription(sessionId: string): void {
        const message = {
            type: 'subscribe',
            session_id: sessionId,
            listener_id: this.listenerId,
            role: 'listener',
            timestamp: new Date().toISOString()
        }
        this.send(message)
    }

    private send(message: WebSocketMessage): void {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(message))
        } else {
            console.warn('⚠️ MonitoringWebSocket not connected, cannot send message')
        }
    }

    onMessage(type: string, handler: (data: any) => void): void {
        this.messageHandlers.set(type, handler)
    }

    private handleMessage(data: WebSocketMessage): void {
        const handler = this.messageHandlers.get(data.type)
        if (handler) {
            handler(data)
        }

        // Также вызываем общий обработчик если есть
        const generalHandler = this.messageHandlers.get('*')
        if (generalHandler) {
            generalHandler(data)
        }
    }
}

export default api