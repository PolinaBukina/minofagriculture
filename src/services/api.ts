// // import axios, {
// //     AxiosInstance,
// //     AxiosRequestConfig,
// //     AxiosResponse,
// //     AxiosError,
// //     InternalAxiosRequestConfig
// // } from 'axios'

// // // ИСПРАВЛЕНО: Правильный базовый URL
// // // const API_BASE_URL = process.env.VITE_API_URL || 'https://audio.minofagriculture.ru'

// // const API_BASE_URL = 'https://audio.minofagriculture.ru'


// // // Создаем экземпляр axios с базовой конфигурацией
// // const api: AxiosInstance = axios.create({
// //     baseURL: API_BASE_URL,
// //     timeout: 10000,
// //     headers: {
// //         'Content-Type': 'application/json',
// //     },
// // })

// // // Интерцептор для логирования запросов
// // api.interceptors.request.use(
// //     (config: InternalAxiosRequestConfig) => {
// //         console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
// //         return config
// //     },
// //     (error: AxiosError) => {
// //         console.error('❌ API Request Error:', error)
// //         return Promise.reject(error)
// //     }
// // )

// // // Интерцептор для обработки ответов
// // api.interceptors.response.use(
// //     (response: AxiosResponse) => {
// //         console.log(`✅ API Response: ${response.status} ${response.config.url}`)
// //         return response
// //     },
// //     (error: AxiosError) => {
// //         console.log('Full URL:', API_BASE_URL + '/sessions')

// //         console.error('❌ API Response Error:', error.response?.status, error.response?.data)
// //         return Promise.reject(error)
// //     }
// // )

// // // Типы для API
// // type HealthCheckResponse = {
// //     status: string
// //     timestamp: string
// // }

// // type ServerInfo = {
// //     version: string
// //     uptime: number
// //     services: string[]
// // }

// // export type Session = {
// //     id: string;
// //     session_id: string;
// //     name: string;
// //     title?: string;
// //     lecturer?: string;
// //     start_time: string;
// //     end_time?: string;
// //     status: 'active' | 'completed' | 'failed' | string;
// //     participants?: number;
// // };

// // export type SessionData = Session & {
// //     participants: number,
// //     processed_texts?: string[]
// //     audio_duration?: number
// //     transcripts?: string[]
// //     translations?: string[]

// //     total_transcriptions?: number
// //     total_processed?: number
// // }

// // type SessionResults = {
// //     transcripts: string[]
// //     translations: string[]
// //     summary?: string
// // }

// // type Stats = {
// //     sessions_count: number
// //     active_sessions: number
// //     avg_session_duration: number
// //     users_online: number
// // }

// // type WebSocketDiagnostics = {
// //     status: string
// //     active_connections: number
// //     messages_sent: number
// //     messages_received: number
// // }

// // // WebSocket типы
// // type WebSocketOptions = {
// //     onOpen?: (event: Event) => void
// //     onClose?: (event: CloseEvent) => void
// //     onError?: (error: Event) => void
// //     onMessage?: (data: any) => void
// // }

// // type WebSocketMessage = {
// //     type: string
// //     [key: string]: any
// // }

// // // API методы
// // export const apiService = {
// //     // Проверка здоровья сервера
// //     async healthCheck(): Promise<HealthCheckResponse> {
// //         try {
// //             const response = await api.get('/health')
// //             return response.data
// //         } catch (error) {
// //             throw new Error(`Health check failed: ${(error as Error).message}`)
// //         }
// //     },

// //     // Получение информации о сервере
// //     async getServerInfo(): Promise<ServerInfo> {
// //         try {
// //             const response = await api.get('/')
// //             return response.data
// //         } catch (error) {
// //             throw new Error(`Server info failed: ${(error as Error).message}`)
// //         }
// //     },

// //     // ИСПРАВЛЕНО: Получение списка сессий
// //     async getSessions(): Promise<Session[]> {
// //         try {
// //             const response = await api.get('/sessions')
// //             // ИСПРАВЛЕНО: Правильный путь к данным
// //             const sessions = response.data.sessions || response.data

// //             // Преобразуем данные из MongoDB формата в нужный формат
// //             return sessions.map((session: any) => ({
// //                 id: session._id || session.id,
// //                 session_id: session.session_id,
// //                 name: session.session_id, // Используем session_id как name
// //                 title: `Лекция ${session.session_id.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
// //                 lecturer: `Сервер ${session.server_id || 'Unknown'}`,
// //                 start_time: session.start_time,
// //                 end_time: session.end_time,
// //                 status: session.status,
// //                 participants: 1 // По умолчанию 1 участник
// //             }))
// //         } catch (error) {
// //             console.error('❌ getSessions error:', error)
// //             throw new Error(`Get sessions failed: ${(error as Error).message}`)
// //         }
// //     },

// //     // Получение данных конкретной сессии
// //     async getSessionData(sessionId: string): Promise<SessionData> {
// //         try {
// //             const response = await api.get(`/sessions/${sessionId}`)
// //             const data = response.data

// //             // Преобразуем данные из API формата
// //             return {
// //                 id: data.session?._id || sessionId,
// //                 session_id: data.session?.session_id || sessionId,
// //                 name: data.session?.session_id || sessionId,
// //                 title: `Лекция ${sessionId.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
// //                 lecturer: data.session?.server_id || 'Unknown',
// //                 start_time: data.session?.start_time || new Date().toISOString(),
// //                 end_time: data.session?.end_time,
// //                 status: data.session?.status || 'unknown',
// //                 participants: 1,
// //                 audio_duration: data.session?.duration,
// //                 transcripts: data.transcriptions?.map((t: any) => t.text) || [],
// //                 translations: data.processed_texts?.map((p: any) => p.english_translation) || []
// //             }
// //         } catch (error) {
// //             console.error('❌ getSessionData error:', error)
// //             throw new Error(`Get session data failed: ${(error as Error).message}`)
// //         }
// //     },

// //     // Получение информации о конкретной сессии (для LectureViewer)
// //     async getSession(sessionId: string): Promise<SessionData | null> {
// //         try {
// //             return await this.getSessionData(sessionId)
// //         } catch (error) {
// //             console.warn(`⚠️ Session not available for ${sessionId}:`, (error as Error).message)
// //             return null
// //         }
// //     },

// //     // Получение результатов обработки сессии (тексты, переводы)
// //     async getSessionResults(sessionId: string): Promise<SessionResults> {
// //         try {
// //             const sessionData = await this.getSessionData(sessionId)
// //             return {
// //                 transcripts: sessionData.transcripts || [],
// //                 translations: sessionData.translations || []
// //             }
// //         } catch (error) {
// //             console.warn(`⚠️ Session results not available for ${sessionId}:`, (error as Error).message)
// //             return { transcripts: [], translations: [] }
// //         }
// //     },

// //     // Получение текстов транскрипции сессии
// //     async getSessionTranscripts(sessionId: string): Promise<string[]> {
// //         try {
// //             const sessionData = await this.getSessionData(sessionId)
// //             return sessionData.transcripts || []
// //         } catch (error) {
// //             console.warn(`⚠️ Session transcripts not available for ${sessionId}:`, (error as Error).message)
// //             return []
// //         }
// //     },

// //     // Получение переводов сессии
// //     async getSessionTranslations(sessionId: string): Promise<string[]> {
// //         try {
// //             const sessionData = await this.getSessionData(sessionId)
// //             return sessionData.translations || []
// //         } catch (error) {
// //             console.warn(`⚠️ Session translations not available for ${sessionId}:`, (error as Error).message)
// //             return []
// //         }
// //     },

// //     // Получение статистики
// //     async getStats(): Promise<Stats> {
// //         try {
// //             const response = await api.get('/stats')
// //             return response.data
// //         } catch (error) {
// //             // Fallback - генерируем статистику на основе сессий
// //             try {
// //                 const sessions = await this.getSessions()
// //                 return {
// //                     sessions_count: sessions.length,
// //                     active_sessions: sessions.filter(s => s.status === 'active').length,
// //                     avg_session_duration: 0,
// //                     users_online: 0
// //                 }
// //             } catch {
// //                 throw new Error(`Get stats failed: ${(error as Error).message}`)
// //             }
// //         }
// //     },

// //     // Диагностика WebSocket
// //     async getWebSocketDiagnostics(): Promise<WebSocketDiagnostics> {
// //         try {
// //             const response = await api.get('/diagnostics/websocket')
// //             return response.data
// //         } catch (error) {
// //             // Fallback
// //             return {
// //                 status: 'unknown',
// //                 active_connections: 0,
// //                 messages_sent: 0,
// //                 messages_received: 0
// //             }
// //         }
// //     }
// // }

// // // WebSocket утилиты - ИСПРАВЛЕНО: используем правильный хост
// // export const createWebSocketConnection = (endpoint: string, options: WebSocketOptions = {}): WebSocket => {
// //     const wsProtocol = 'wss:' // Всегда используем безопасное соединение
// //     const wsHost = 'audio.minofagriculture.ru'
// //     const wsUrl = `${wsProtocol}//${wsHost}${endpoint}`

// //     console.log(`🔌 Creating WebSocket connection: ${wsUrl}`)

// //     const ws = new WebSocket(wsUrl)

// //     // Базовые обработчики событий
// //     ws.onopen = (event: Event) => {
// //         console.log('✅ WebSocket connected:', wsUrl)
// //         if (options.onOpen) options.onOpen(event)
// //     }

// //     ws.onclose = (event: CloseEvent) => {
// //         console.log('🔌 WebSocket disconnected:', event.code, event.reason)
// //         if (options.onClose) options.onClose(event)
// //     }

// //     ws.onerror = (error: Event) => {
// //         console.error('❌ WebSocket error:', error)
// //         if (options.onError) options.onError(error)
// //     }

// //     ws.onmessage = (event: MessageEvent) => {
// //         try {
// //             const data = JSON.parse(event.data)
// //             console.log('📨 WebSocket message:', data.type || 'unknown')
// //             if (options.onMessage) options.onMessage(data)
// //         } catch (error) {
// //             console.error('❌ WebSocket message parse error:', error)
// //         }
// //     }

// //     return ws
// // }

// // // WebSocket класс для записи аудио (лектор)
// // export class AudioWebSocket {
// //     private ws: WebSocket | null = null
// //     private sessionId: string | null = null
// //     public isConnected: boolean = false
// //     private messageHandlers: Map<string, (data: any) => void> = new Map()

// //     connect(sessionId: string | null = null): Promise<string> {
// //         return new Promise((resolve, reject) => {
// //             try {
// //                 this.sessionId = sessionId || this.generateSessionId()

// //                 this.ws = createWebSocketConnection('/ws/audio', {
// //                     onOpen: () => {
// //                         this.isConnected = true
// //                         this.sendSessionStart()
// //                         resolve(this.sessionId!)
// //                     },
// //                     onClose: () => {
// //                         this.isConnected = false
// //                     },
// //                     onError: (error) => {
// //                         reject(error)
// //                     },
// //                     onMessage: (data) => {
// //                         this.handleMessage(data)
// //                     }
// //                 })
// //             } catch (error) {
// //                 reject(error)
// //             }
// //         })
// //     }

// //     disconnect(): void {
// //         if (this.ws && this.isConnected) {
// //             this.sendSessionEnd()
// //             this.ws.close()
// //             this.isConnected = false
// //         }
// //     }

// //     // private sendSessionStart(): void {
// //     //     const message = {
// //     //         type: 'session_start',
// //     //         session_id: this.sessionId,
// //     //         timestamp: new Date().toISOString(),
// //     //         audio_config: {
// //     //             sample_rate: 16000,
// //     //             channels: 1,
// //     //             format: 'pcm16'
// //     //         }
// //     //     }
// //     //     this.send(message)
// //     // }
// //     // private sendSessionStart(): void {
// //     //     const message = {
// //     //         type: 'session_start',
// //     //         session_id: this.sessionId,
// //     //         timestamp: new Date().toISOString(),
// //     //         audio_config: {
// //     //             sample_rate: 16000,
// //     //             channels: 1,
// //     //             format: 'pcm16'
// //     //         }
// //     //     }
// //     //     this.send(message)
// //     // }

// //     // private sendSessionStart(): void {
// //     //     const message = {
// //     //         type: 'session_start',
// //     //         session_id: this.sessionId,
// //     //         timestamp: new Date().toISOString(),
// //     //         audio_config: {
// //     //             sample_rate: 16000,
// //     //             channels: 1,
// //     //             format: 'pcm16'
// //     //         }
// //     //     }
// //     //     this.send(message)
// //     // }

// //     private sendSessionStart(
// //         lectureTitle: string,
// //         lecturerName: string,
// //         location: string
// //     ): void {
// //         const message = {
// //             type: 'session_start',
// //             session_id: this.sessionId,
// //             timestamp: new Date().toISOString(),
// //             audio_config: {
// //                 sample_rate: 16000,
// //                 channels: 1,
// //                 format: 'pcm16'
// //             },
// //             lecture_info: {
// //                 lecture_title: lectureTitle,
// //                 lecturer_name: lecturerName,
// //                 location: location
// //             }
// //         }
// //         this.send(message)
// //     }

// //     private sendSessionEnd(): void {
// //         const message = {
// //             type: 'session_end',
// //             session_id: this.sessionId,
// //             timestamp: new Date().toISOString()
// //         }
// //         this.send(message)
// //     }

// //     sendAudioChunk(audioData: string): void {
// //         const message = {
// //             type: 'audio_chunk',
// //             session_id: this.sessionId,
// //             timestamp: new Date().toISOString(),
// //             audio_data: audioData,
// //             format: 'pcm16'
// //         }
// //         this.send(message)
// //     }

// //     private send(message: WebSocketMessage): void {
// //         if (this.ws && this.isConnected) {
// //             this.ws.send(JSON.stringify(message))
// //         } else {
// //             console.warn('⚠️ WebSocket not connected, cannot send message')
// //         }
// //     }

// //     onMessage(type: string, handler: (data: any) => void): void {
// //         this.messageHandlers.set(type, handler)
// //     }

// //     private handleMessage(data: WebSocketMessage): void {
// //         const handler = this.messageHandlers.get(data.type)
// //         if (handler) {
// //             handler(data)
// //         }
// //     }

// //     private generateSessionId(): string {
// //         return Date.now() + '_' + Math.random().toString(36).substr(2, 9)
// //     }

// // }

// // // WebSocket класс для мониторинга лекций (Cлушатель)
// // export class MonitoringWebSocket {
// //     private ws: WebSocket | null = null
// //     private sessionId: string | null = null
// //     private listenerId: string | null = null
// //     private isConnected: boolean = false
// //     private messageHandlers: Map<string, (data: any) => void> = new Map()

// //     private generateListenerId(): string {
// //         return 'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
// //     }

// //     connect(sessionId: string | null = null): Promise<string> {
// //         return new Promise((resolve, reject) => {
// //             try {
// //                 this.sessionId = sessionId
// //                 this.listenerId = this.generateListenerId()

// //                 this.ws = createWebSocketConnection('/ws/monitor', {
// //                     onOpen: () => {
// //                         this.isConnected = true

// //                         // Подписываемся на сессию если указана
// //                         if (sessionId) {
// //                             this.sendSubscription(sessionId)
// //                         }

// //                         resolve(this.listenerId!)
// //                     },
// //                     onClose: () => {
// //                         this.isConnected = false
// //                     },
// //                     onError: (error) => {
// //                         reject(error)
// //                     },
// //                     onMessage: (data) => {
// //                         this.handleMessage(data)
// //                     }
// //                 })
// //             } catch (error) {
// //                 reject(error)
// //             }
// //         })
// //     }

// //     disconnect(): void {
// //         if (this.ws && this.isConnected) {
// //             this.ws.close()
// //             this.isConnected = false
// //         }
// //     }

// //     private sendSubscription(sessionId: string): void {
// //         const message = {
// //             type: 'subscribe',
// //             session_id: sessionId,
// //             listener_id: this.listenerId,
// //             role: 'listener',
// //             timestamp: new Date().toISOString()
// //         }
// //         this.send(message)
// //     }

// //     private send(message: WebSocketMessage): void {
// //         if (this.ws && this.isConnected) {
// //             this.ws.send(JSON.stringify(message))
// //         } else {
// //             console.warn('⚠️ MonitoringWebSocket not connected, cannot send message')
// //         }
// //     }

// //     onMessage(type: string, handler: (data: any) => void): void {
// //         this.messageHandlers.set(type, handler)
// //     }

// //     private handleMessage(data: WebSocketMessage): void {
// //         const handler = this.messageHandlers.get(data.type)
// //         if (handler) {
// //             handler(data)
// //         }

// //         // Также вызываем общий обработчик если есть
// //         const generalHandler = this.messageHandlers.get('*')
// //         if (generalHandler) {
// //             generalHandler(data)
// //         }
// //     }
// // }

// // export default api


// import axios, {
//     AxiosInstance,
//     AxiosRequestConfig,
//     AxiosResponse,
//     AxiosError,
//     InternalAxiosRequestConfig
// } from 'axios'

// const API_BASE_URL = 'https://audio.minofagriculture.ru'

// const api: AxiosInstance = axios.create({
//     baseURL: API_BASE_URL,
//     timeout: 10000,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// })

// api.interceptors.request.use(
//     (config: InternalAxiosRequestConfig) => {
//         console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
//         return config
//     },
//     (error: AxiosError) => {
//         console.error('❌ API Request Error:', error)
//         return Promise.reject(error)
//     }
// )

// api.interceptors.response.use(
//     (response: AxiosResponse) => {
//         console.log(`✅ API Response: ${response.status} ${response.config.url}`)
//         return response
//     },
//     (error: AxiosError) => {
//         console.log('Full URL:', API_BASE_URL + '/sessions')
//         console.error('❌ API Response Error:', error.response?.status, error.response?.data)
//         return Promise.reject(error)
//     }
// )

// type HealthCheckResponse = {
//     status: string
//     timestamp: string
// }

// type ServerInfo = {
//     version: string
//     uptime: number
//     services: string[]
// }

// export type Session = {
//     id: string;
//     session_id: string;
//     name: string;
//     title?: string;
//     lecturer?: string;
//     start_time: string;
//     end_time?: string;
//     status: 'active' | 'completed' | 'failed' | string;
//     participants?: number;
// };

// export type SessionData = Session & {
//     participants: number,
//     processed_texts?: string[]
//     audio_duration?: number
//     transcripts?: string[]
//     translations?: string[]
//     total_transcriptions?: number
//     total_processed?: number
// }

// type SessionResults = {
//     transcripts: string[]
//     translations: string[]
//     summary?: string
// }

// type Stats = {
//     sessions_count: number
//     active_sessions: number
//     avg_session_duration: number
//     users_online: number
// }

// type WebSocketDiagnostics = {
//     status: string
//     active_connections: number
//     messages_sent: number
//     messages_received: number
// }

// type WebSocketOptions = {
//     onOpen?: (event: Event) => void
//     onClose?: (event: CloseEvent) => void
//     onError?: (error: Event) => void
//     onMessage?: (data: any) => void
// }

// type WebSocketMessage = {
//     type: string
//     [key: string]: any
// }

// export const apiService = {
//     async healthCheck(): Promise<HealthCheckResponse> {
//         try {
//             const response = await api.get('/health')
//             return response.data
//         } catch (error) {
//             throw new Error(`Health check failed: ${(error as Error).message}`)
//         }
//     },

//     async getServerInfo(): Promise<ServerInfo> {
//         try {
//             const response = await api.get('/')
//             return response.data
//         } catch (error) {
//             throw new Error(`Server info failed: ${(error as Error).message}`)
//         }
//     },

//     // async getSessions(): Promise<Session[]> {
//     //     try {
//     //         const response = await api.get('/sessions')
//     //         const sessions = response.data.sessions || response.data

//     //         return sessions.map((session: any) => ({
//     //             id: session._id || session.id,
//     //             session_id: session.session_id,
//     //             name: session.session_id,
//     //             title: `Лекция ${session.session_id.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
//     //             lecturer: `Сервер ${session.server_id || 'Unknown'}`,
//     //             start_time: session.start_time,
//     //             end_time: session.end_time,
//     //             status: session.status,
//     //             participants: 1
//     //         }))
//     //     } catch (error) {
//     //         console.error('❌ getSessions error:', error)
//     //         throw new Error(`Get sessions failed: ${(error as Error).message}`)
//     //     }
//     // },

//     // async getSessionData(sessionId: string): Promise<SessionData> {
//     //     try {
//     //         const response = await api.get(`/sessions/${sessionId}`)
//     //         const data = response.data

//     //         return {
//     //             id: data.session?._id || sessionId,
//     //             session_id: data.session?.session_id || sessionId,
//     //             name: data.session?.session_id || sessionId,
//     //             title: `Лекция ${sessionId.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
//     //             lecturer: data.session?.server_id || 'Unknown',
//     //             start_time: data.session?.start_time || new Date().toISOString(),
//     //             end_time: data.session?.end_time,
//     //             status: data.session?.status || 'unknown',
//     //             participants: 1,
//     //             audio_duration: data.session?.duration,
//     //             transcripts: data.transcriptions?.map((t: any) => t.text) || [],
//     //             translations: data.processed_texts?.map((p: any) => p.english_translation) || []
//     //         }
//     //     } catch (error) {
//     //         console.error('❌ getSessionData error:', error)
//     //         throw new Error(`Get session data failed: ${(error as Error).message}`)
//     //     }
//     // },

//     async getSessions(): Promise<Session[]> {
//         try {
//             const response = await api.get('/sessions')
//             const sessions = response.data.sessions || response.data

//             return sessions.map((session: any) => ({
//                 id: session._id || session.id,
//                 session_id: session.session_id,
//                 name: session.session_id,
//                 title: session.lecture_title || `Лекция ${session.session_id.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
//                 lecturer: session.lecturer_name || 'Неизвестный лектор', // Исправлено здесь
//                 start_time: session.start_time,
//                 end_time: session.end_time,
//                 status: session.status,
//                 participants: 1
//             }))
//         } catch (error) {
//             console.error('❌ getSessions error:', error)
//             throw new Error(`Get sessions failed: ${(error as Error).message}`)
//         }
//     },

//     async getSessionData(sessionId: string): Promise<SessionData> {
//         try {
//             const response = await api.get(`/sessions/${sessionId}`)
//             const data = response.data

//             return {
//                 id: data.session?._id || sessionId,
//                 session_id: data.session?.session_id || sessionId,
//                 name: data.session?.session_id || sessionId,
//                 title: data.session?.lecture_title || `Лекция ${sessionId.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
//                 lecturer: data.session?.lecturer_name || 'Неизвестный лектор', // Исправлено здесь
//                 start_time: data.session?.start_time || new Date().toISOString(),
//                 end_time: data.session?.end_time,
//                 status: data.session?.status || 'unknown',
//                 participants: 1,
//                 audio_duration: data.session?.duration_minutes, // Исправлено здесь
//                 transcripts: data.transcriptions?.map((t: any) => t.text) || [],
//                 translations: data.processed_texts?.map((p: any) => p.english_translation) || []
//             }
//         } catch (error) {
//             console.error('❌ getSessionData error:', error)
//             throw new Error(`Get session data failed: ${(error as Error).message}`)
//         }
//     },

//     async getSession(sessionId: string): Promise<SessionData | null> {
//         try {
//             return await this.getSessionData(sessionId)
//         } catch (error) {
//             console.warn(`⚠️ Session not available for ${sessionId}:`, (error as Error).message)
//             return null
//         }
//     },

//     async getSessionResults(sessionId: string): Promise<SessionResults> {
//         try {
//             const sessionData = await this.getSessionData(sessionId)
//             return {
//                 transcripts: sessionData.transcripts || [],
//                 translations: sessionData.translations || []
//             }
//         } catch (error) {
//             console.warn(`⚠️ Session results not available for ${sessionId}:`, (error as Error).message)
//             return { transcripts: [], translations: [] }
//         }
//     },

//     async getSessionTranscripts(sessionId: string): Promise<string[]> {
//         try {
//             const sessionData = await this.getSessionData(sessionId)
//             return sessionData.transcripts || []
//         } catch (error) {
//             console.warn(`⚠️ Session transcripts not available for ${sessionId}:`, (error as Error).message)
//             return []
//         }
//     },

//     async getSessionTranslations(sessionId: string): Promise<string[]> {
//         try {
//             const sessionData = await this.getSessionData(sessionId)
//             return sessionData.translations || []
//         } catch (error) {
//             console.warn(`⚠️ Session translations not available for ${sessionId}:`, (error as Error).message)
//             return []
//         }
//     },

//     async getStats(): Promise<Stats> {
//         try {
//             const response = await api.get('/stats')
//             return response.data
//         } catch (error) {
//             try {
//                 const sessions = await this.getSessions()
//                 return {
//                     sessions_count: sessions.length,
//                     active_sessions: sessions.filter(s => s.status === 'active').length,
//                     avg_session_duration: 0,
//                     users_online: 0
//                 }
//             } catch {
//                 throw new Error(`Get stats failed: ${(error as Error).message}`)
//             }
//         }
//     },

//     async getWebSocketDiagnostics(): Promise<WebSocketDiagnostics> {
//         try {
//             const response = await api.get('/diagnostics/websocket')
//             return response.data
//         } catch (error) {
//             return {
//                 status: 'unknown',
//                 active_connections: 0,
//                 messages_sent: 0,
//                 messages_received: 0
//             }
//         }
//     }
// }

// export const createWebSocketConnection = (endpoint: string, options: WebSocketOptions = {}): WebSocket => {
//     const wsProtocol = 'wss:'
//     const wsHost = 'audio.minofagriculture.ru'
//     const wsUrl = `${wsProtocol}//${wsHost}${endpoint}`

//     console.log(`🔌 Creating WebSocket connection: ${wsUrl}`)

//     const ws = new WebSocket(wsUrl)

//     ws.onopen = (event: Event) => {
//         console.log('✅ WebSocket connected:', wsUrl)
//         if (options.onOpen) options.onOpen(event)
//     }

//     ws.onclose = (event: CloseEvent) => {
//         console.log('🔌 WebSocket disconnected:', event.code, event.reason)
//         if (options.onClose) options.onClose(event)
//     }

//     ws.onerror = (error: Event) => {
//         console.error('❌ WebSocket error:', error)
//         if (options.onError) options.onError(error)
//     }

//     ws.onmessage = (event: MessageEvent) => {
//         try {
//             const data = JSON.parse(event.data)
//             console.log('📨 WebSocket message:', data.type || 'unknown')
//             if (options.onMessage) options.onMessage(data)
//         } catch (error) {
//             console.error('❌ WebSocket message parse error:', error)
//         }
//     }

//     return ws
// }

// export class AudioWebSocket {
//     private ws: WebSocket | null = null
//     private sessionId: string | null = null
//     public isConnected: boolean = false
//     private messageHandlers: Map<string, (data: any) => void> = new Map()
//     private translations: Record<string, string> = {};

//     private lectureInfo = {
//         title: "",
//         lecturer: "",
//         location: ""
//     }

//     setLectureInfo(title: string, lecturer: string, location: string): void {
//         this.lectureInfo = {
//             title: title || this.lectureInfo.title,
//             lecturer: lecturer || this.lectureInfo.lecturer,
//             location: location || this.lectureInfo.location
//         }

//         // Если уже подключены, обновляем информацию на сервере
//         if (this.isConnected) {
//             this.sendSessionUpdate()
//         }
//     }

//     connect(
//         sessionId: string | null = null,
//         lectureInfo: {
//             title: string;
//             lecturer: string;
//             location: string;
//         }
//     ): Promise<string> {
//         return new Promise((resolve, reject) => {
//             try {
//                 this.sessionId = sessionId || this.generateSessionId()

//                 // Устанавливаем информацию о лекции если передана
//                 // if (lectureInfo) {
//                 // this.setLectureInfo(
//                 //     lectureInfo.title || this.lectureInfo.title,
//                 //     lectureInfo.lecturer || this.lectureInfo.lecturer,
//                 //     lectureInfo.location || this.lectureInfo.location
//                 // )
//                 // }

//                 this.lectureInfo = {
//                     title: lectureInfo.title,
//                     lecturer: lectureInfo.lecturer,
//                     location: lectureInfo.location
//                 };

//                 this.ws = createWebSocketConnection('/ws/audio', {
//                     onOpen: () => {
//                         this.isConnected = true
//                         this.sendSessionStart()
//                         resolve(this.sessionId!)
//                     },
//                     onClose: () => {
//                         this.isConnected = false
//                     },
//                     onError: (error) => {
//                         reject(error)
//                     },
//                     onMessage: (data) => {
//                         this.handleMessage(data)
//                     }
//                 })
//             } catch (error) {
//                 reject(error)
//             }
//         })
//     }

//     disconnect(): void {
//         if (this.ws && this.isConnected) {
//             this.sendSessionEnd()
//             this.ws.close()
//             this.isConnected = false
//         }
//     }

//     // private sendSessionStart(): void {
//     //     const message = {
//     //         type: 'session_start',
//     //         session_id: this.sessionId,
//     //         timestamp: new Date().toISOString(),
//     //         audio_config: {
//     //             sample_rate: 16000,
//     //             channels: 1,
//     //             format: 'pcm16'
//     //         },
//     //         lecture_info: {
//     //             lecture_title: this.lectureInfo.title,
//     //             lecturer_name: this.lectureInfo.lecturer,
//     //             location: this.lectureInfo.location
//     //         }
//     //     }
//     //     this.send(message)
//     // }

//     private sendSessionStart(): void {
//         const message = {
//             type: 'session_start',
//             session_id: this.sessionId,
//             timestamp: new Date().toISOString(),
//             audio_config: {
//                 sample_rate: 16000,
//                 channels: 1,
//                 format: 'pcm16'
//             },
//             lecture_info: {
//                 lecture_title: this.lectureInfo.title,
//                 lecturer_name: this.lectureInfo.lecturer,
//                 location: this.lectureInfo.location
//             }
//         };
//         this.send(message);
//     }

//     private sendSessionUpdate(): void {
//         const message = {
//             type: 'session_update',
//             session_id: this.sessionId,
//             timestamp: new Date().toISOString(),
//             lecture_info: {
//                 lecture_title: this.lectureInfo.title,
//                 lecturer_name: this.lectureInfo.lecturer,
//                 location: this.lectureInfo.location
//             }
//         }
//         this.send(message)
//     }

//     private sendSessionEnd(): void {
//         const message = {
//             type: 'session_end',
//             session_id: this.sessionId,
//             timestamp: new Date().toISOString()
//         }
//         this.send(message)
//     }

//     sendAudioChunk(audioData: string): void {
//         const message = {
//             type: 'audio_chunk',
//             session_id: this.sessionId,
//             timestamp: new Date().toISOString(),
//             audio_data: audioData,
//             format: 'pcm16'
//         }
//         this.send(message)
//     }

//     private send(message: WebSocketMessage): void {
//         if (this.ws && this.isConnected) {
//             this.ws.send(JSON.stringify(message))
//         } else {
//             console.warn('⚠️ WebSocket not connected, cannot send message')
//         }
//     }

//     onMessage(type: string, handler: (data: any) => void): void {
//         this.messageHandlers.set(type, handler)
//     }

//     // private handleMessage(data: WebSocketMessage): void {
//     //     const handler = this.messageHandlers.get(data.type)
//     //     if (handler) {
//     //         handler(data)
//     //     }
//     // }

//     private handleMessage(data: WebSocketMessage): void {
//         console.log('📨 WebSocket message:', data.type)

//         // Обработка переведенных сообщений
//         if (data.type.startsWith('translated_')) {
//             const language = data.type.split('_')[1]; // извлекаем язык (english, chinese и т.д.)
//             this.translations[language] = data.translation;

//             // Создаем объединенное сообщение со всеми переводами
//             const combinedMessage = {
//                 type: 'translation_update',
//                 session_id: this.sessionId,
//                 timestamp: new Date().toISOString(),
//                 translations: { ...this.translations },
//                 original: data.original_text || '' // если сервер отправляет оригинальный текст
//             };

//             // Вызываем обработчик для обновленных переводов
//             const handler = this.messageHandlers.get('translation_update');
//             if (handler) {
//                 handler(combinedMessage);
//             }
//         }

//         // Вызываем обработчик для конкретного типа сообщения
//         const specificHandler = this.messageHandlers.get(data.type);
//         if (specificHandler) {
//             specificHandler(data);
//         }
//     }

//     getTranslations(): Record<string, string> {
//         return { ...this.translations };
//     }

//     private generateSessionId(): string {
//         return Date.now() + '_' + Math.random().toString(36).substr(2, 9)
//     }
// }

// export class MonitoringWebSocket {
//     private ws: WebSocket | null = null
//     private sessionId: string | null = null
//     private listenerId: string | null = null
//     private isConnected: boolean = false
//     private messageHandlers: Map<string, (data: any) => void> = new Map()

//     private generateListenerId(): string {
//         return 'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
//     }

//     connect(sessionId: string | null = null): Promise<string> {
//         return new Promise((resolve, reject) => {
//             try {
//                 this.sessionId = sessionId
//                 this.listenerId = this.generateListenerId()

//                 this.ws = createWebSocketConnection('/ws/monitor', {
//                     onOpen: () => {
//                         this.isConnected = true

//                         if (sessionId) {
//                             this.sendSubscription(sessionId)
//                         }

//                         resolve(this.listenerId!)
//                     },
//                     onClose: () => {
//                         this.isConnected = false
//                     },
//                     onError: (error) => {
//                         reject(error)
//                     },
//                     onMessage: (data) => {
//                         this.handleMessage(data)
//                     }
//                 })
//             } catch (error) {
//                 reject(error)
//             }
//         })
//     }

//     disconnect(): void {
//         if (this.ws && this.isConnected) {
//             this.ws.close()
//             this.isConnected = false
//         }
//     }

//     private sendSubscription(sessionId: string): void {
//         const message = {
//             type: 'subscribe',
//             session_id: sessionId,
//             listener_id: this.listenerId,
//             role: 'listener',
//             timestamp: new Date().toISOString()
//         }
//         this.send(message)
//     }

//     private send(message: WebSocketMessage): void {
//         if (this.ws && this.isConnected) {
//             this.ws.send(JSON.stringify(message))
//         } else {
//             console.warn('⚠️ MonitoringWebSocket not connected, cannot send message')
//         }
//     }

//     onMessage(type: string, handler: (data: any) => void): void {
//         this.messageHandlers.set(type, handler)
//     }

//     private handleMessage(data: WebSocketMessage): void {
//         const handler = this.messageHandlers.get(data.type)
//         if (handler) {
//             handler(data)
//         }

//         const generalHandler = this.messageHandlers.get('*')
//         if (generalHandler) {
//             generalHandler(data)
//         }
//     }
// }

// export default api




import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig
} from 'axios'

const API_BASE_URL = 'https://audio.minofagriculture.ru'

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

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
    location?: string;
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
    translations?: string[]  // Старое поле для обратной совместимости (английский)

    // 🆕 НОВЫЕ ПОЛЯ ДЛЯ ПЕРЕВОДОВ
    translations_multi?: {
        en: string[]
        fr: string[]
        zh: string[]
    }

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

export const apiService = {
    async healthCheck(): Promise<HealthCheckResponse> {
        try {
            const response = await api.get('/health')
            return response.data
        } catch (error) {
            throw new Error(`Health check failed: ${(error as Error).message}`)
        }
    },

    async getServerInfo(): Promise<ServerInfo> {
        try {
            const response = await api.get('/')
            return response.data
        } catch (error) {
            throw new Error(`Server info failed: ${(error as Error).message}`)
        }
    },

    async getSessions(): Promise<Session[]> {
        try {
            const response = await api.get('/sessions')
            const sessions = response.data.sessions || response.data

            return sessions.map((session: any) => ({
                id: session._id || session.id,
                session_id: session.session_id,
                name: session.session_id,
                title: session.lecture_title || `Лекция ${session.session_id.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
                lecturer: session.lecturer_name || 'Неизвестный лектор',
                location: session.location || 'Не указано',
                start_time: session.start_time,
                end_time: session.end_time,
                status: session.status,
                participants: 1
            }))
        } catch (error) {
            console.error('❌ getSessions error:', error)
            throw new Error(`Get sessions failed: ${(error as Error).message}`)
        }
    },

    async getSessionData(sessionId: string): Promise<SessionData> {
        try {
            const response = await api.get(`/sessions/${sessionId}`)
            const data = response.data

            // 🆕 ИЗВЛЕКАЕМ ВСЕ ПЕРЕВОДЫ ИЗ processed_texts
            const processedTexts = data.processed_texts || []

            const englishTranslations: string[] = []
            const chineseTranslations: string[] = []
            const frenchTranslations: string[] = []

            processedTexts.forEach((item: any) => {
                if (item.english_translation) {
                    englishTranslations.push(item.english_translation)
                }
                if (item.chinese_translation) {
                    chineseTranslations.push(item.chinese_translation)
                }
                if (item.french_translation) {
                    frenchTranslations.push(item.french_translation)
                }
            })

            console.log('🌍 Извлеченные переводы:')
            console.log(`  🇺🇸 Английский: ${englishTranslations.length} фраз`)
            console.log(`  🇨🇳 Китайский: ${chineseTranslations.length} фраз`)
            console.log(`  🇫🇷 Французский: ${frenchTranslations.length} фраз`)

            return {
                id: data.session?._id || sessionId,
                session_id: data.session?.session_id || sessionId,
                name: data.session?.session_id || sessionId,
                title: data.session?.lecture_title || `Лекция ${sessionId.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
                lecturer: data.session?.lecturer_name || 'Неизвестный лектор',
                start_time: data.session?.start_time || new Date().toISOString(),
                end_time: data.session?.end_time,
                location: data.session?.location || 'Не указано',
                status: data.session?.status || 'unknown',
                participants: 1,
                audio_duration: data.session?.duration_minutes,

                // Транскрипции
                // transcripts: data.transcriptions?.map((t: any) => t.text) || [],
                transcripts: data.processed_texts?.map((t: any) => t.processed_text) || [],

                // 🆕 ВСЕ ПЕРЕВОДЫ
                translations: englishTranslations, // Старое поле для обратной совместимости
                translations_multi: {
                    en: englishTranslations,
                    fr: frenchTranslations,
                    zh: chineseTranslations
                },

                total_transcriptions: data.total_transcriptions || 0,
                total_processed: data.total_processed || 0
            }
        } catch (error) {
            console.error('❌ getSessionData error:', error)
            throw new Error(`Get session data failed: ${(error as Error).message}`)
        }
    },

    // В apiService добавьте этот метод
    // async getSessionHistory(sessionId: string): Promise<SessionData> {
    //     try {
    //         const response = await api.get(`/sessions/${sessionId}/history`);
    //         const data = response.data;

    //         console.log('ответ', response)

    //         const processedTexts = data.processed_texts || [];
    //         const transcriptions = data.transcriptions || [];

    //         return {
    //             id: data.session?._id || sessionId,
    //             session_id: data.session?.session_id || sessionId,
    //             name: data.session?.session_id || sessionId,
    //             title: data.session?.lecture_title || `Лекция ${sessionId.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
    //             lecturer: data.session?.lecturer_name || 'Неизвестный лектор',
    //             start_time: data.session?.start_time || new Date().toISOString(),
    //             end_time: data.session?.end_time,
    //             location: data.session?.location || 'Не указано',
    //             status: data.session?.status || 'unknown',
    //             participants: 1,
    //             audio_duration: data.session?.duration_minutes,
    //             transcripts: processedTexts.map((t: any) => t.processed_text || t.text) || [],
    //             translations: processedTexts.map((p: any) => p.english_translation) || [],
    //             translations_multi: {
    //                 en: processedTexts.map((p: any) => p.english_translation).filter(Boolean) || [],
    //                 fr: processedTexts.map((p: any) => p.french_translation).filter(Boolean) || [],
    //                 zh: processedTexts.map((p: any) => p.chinese_translation).filter(Boolean) || []
    //             },
    //             total_transcriptions: data.total_transcriptions || 0,
    //             total_processed: data.total_processed || 0
    //         };
    //     } catch (error) {
    //         console.error('❌ getSessionHistory error:', error);
    //         throw new Error(`Get session history failed: ${(error as Error).message}`);
    //     }
    // },

    // async getSessionHistory(sessionId: string): Promise<SessionData> {
    //     try {
    //         const response = await api.get(`/sessions/${sessionId}/history`);
    //         const data = response.data;

    //         console.log('История лекции:', data); // Логируем полный ответ

    //         return {
    //             id: data.id || data.session_id || sessionId,
    //             session_id: data.session_id || sessionId,
    //             name: data.name || data.session_id || sessionId,
    //             title: data.title || data.session?.lecture_title || `Лекция ${sessionId.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
    //             lecturer: data.lecturer || data.session?.lecturer_name || 'Неизвестный лектор',
    //             start_time: data.start_time || data.session?.start_time || new Date().toISOString(),
    //             end_time: data.end_time || data.session?.end_time,
    //             location: data.location || data.session?.location || 'Не указано',
    //             status: data.status || data.session?.status || 'unknown',
    //             participants: data.participants || 1,
    //             audio_duration: data.audio_duration || data.session?.duration_minutes,
    //             transcripts: data.transcripts || [],
    //             translations: data.translations || [],
    //             translations_multi: data.translations_multi || {
    //                 en: [],
    //                 fr: [],
    //                 zh: []
    //             },
    //             total_transcriptions: data.total_transcriptions || 0,
    //             total_processed: data.total_processed || 0
    //         };
    //     } catch (error) {
    //         console.error('❌ Ошибка получения истории лекции:', error);
    //         throw new Error(`Не удалось загрузить историю лекции: ${(error as Error).message}`);
    //     }
    // },


    async getSessionHistory(sessionId: string): Promise<SessionData> {
        try {
            const response = await api.get(`/sessions/${sessionId}/history`);
            const data = response.data;

            console.log('Полный ответ истории:', data); // Для отладки

            // Извлекаем данные из структуры ответа
            const session = data.session || {};
            const transcriptions = data.transcriptions || [];
            const processedTexts = data.processed_texts || [];

            return {
                id: session.session_id || sessionId,
                session_id: session.session_id || sessionId,
                name: session.session_id || sessionId,
                title: session.lecture_title || `Лекция ${sessionId.split('_')[1]?.substring(0, 8) || 'Unknown'}`,
                lecturer: session.lecturer_name || 'Неизвестный лектор',
                start_time: session.start_time || new Date().toISOString(),
                end_time: session.end_time,
                location: session.location || 'Не указано',
                status: session.status || 'unknown',
                participants: 1,
                audio_duration: session.duration_minutes,
                transcripts: processedTexts.map((t: any) => t.processed_text || t.text).filter(Boolean) || [],
                translations: processedTexts.map((p: any) => p.english_translation).filter(Boolean) || [],
                translations_multi: {
                    en: processedTexts.map((p: any) => p.english_translation).filter(Boolean) || [],
                    fr: processedTexts.map((p: any) => p.french_translation).filter(Boolean) || [],
                    zh: processedTexts.map((p: any) => p.chinese_translation).filter(Boolean) || []
                },
                total_transcriptions: data.total_transcriptions || 0,
                total_processed: data.total_processed || 0
            };
        } catch (error) {
            console.error('❌ Ошибка получения истории лекции:', error);
            throw new Error(`Не удалось загрузить историю лекции: ${(error as Error).message}`);
        }
    },

    // 🆕 НОВЫЕ МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ КОНКРЕТНЫХ ПЕРЕВОДОВ
    async getSessionTranslationsMulti(sessionId: string): Promise<{ en: string[], fr: string[], zh: string[] }> {
        try {
            const sessionData = await this.getSessionData(sessionId)
            return sessionData.translations_multi || { en: [], fr: [], zh: [] }
        } catch (error) {
            console.warn(`⚠️ Multi translations not available for ${sessionId}:`, (error as Error).message)
            return { en: [], fr: [], zh: [] }
        }
    },

    async getSessionEnglishTranslations(sessionId: string): Promise<string[]> {
        try {
            const sessionData = await this.getSessionData(sessionId)
            return sessionData.translations_multi?.en || []
        } catch (error) {
            console.warn(`⚠️ English translations not available for ${sessionId}:`, (error as Error).message)
            return []
        }
    },

    async getSessionChineseTranslations(sessionId: string): Promise<string[]> {
        try {
            const sessionData = await this.getSessionData(sessionId)
            return sessionData.translations_multi?.zh || []
        } catch (error) {
            console.warn(`⚠️ Chinese translations not available for ${sessionId}:`, (error as Error).message)
            return []
        }
    },

    async getSessionFrenchTranslations(sessionId: string): Promise<string[]> {
        try {
            const sessionData = await this.getSessionData(sessionId)
            return sessionData.translations_multi?.fr || []
        } catch (error) {
            console.warn(`⚠️ French translations not available for ${sessionId}:`, (error as Error).message)
            return []
        }
    },

    async getSession(sessionId: string): Promise<SessionData | null> {
        try {
            return await this.getSessionData(sessionId)
        } catch (error) {
            console.warn(`⚠️ Session not available for ${sessionId}:`, (error as Error).message)
            return null
        }
    },

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

    async getSessionTranscripts(sessionId: string): Promise<string[]> {
        try {
            const sessionData = await this.getSessionData(sessionId)
            return sessionData.transcripts || []
        } catch (error) {
            console.warn(`⚠️ Session transcripts not available for ${sessionId}:`, (error as Error).message)
            return []
        }
    },

    async getSessionTranslations(sessionId: string): Promise<string[]> {
        try {
            const sessionData = await this.getSessionData(sessionId)
            return sessionData.translations || []
        } catch (error) {
            console.warn(`⚠️ Session translations not available for ${sessionId}:`, (error as Error).message)
            return []
        }
    },

    async getStats(): Promise<Stats> {
        try {
            const response = await api.get('/stats')
            return response.data
        } catch (error) {
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

    async getWebSocketDiagnostics(): Promise<WebSocketDiagnostics> {
        try {
            const response = await api.get('/diagnostics/websocket')
            return response.data
        } catch (error) {
            return {
                status: 'unknown',
                active_connections: 0,
                messages_sent: 0,
                messages_received: 0
            }
        }
    }
}

export const createWebSocketConnection = (endpoint: string, options: WebSocketOptions = {}): WebSocket => {
    const wsProtocol = 'wss:'
    const wsHost = 'audio.minofagriculture.ru'
    const wsUrl = `${wsProtocol}//${wsHost}${endpoint}`

    console.log(`🔌 Creating WebSocket connection: ${wsUrl}`)

    const ws = new WebSocket(wsUrl)

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

export class AudioWebSocket {
    private ws: WebSocket | null = null
    private sessionId: string | null = null
    public isConnected: boolean = false
    private messageHandlers: Map<string, (data: any) => void> = new Map()
    private translations: Record<string, string> = {};

    private lectureInfo = {
        title: "",
        lecturer: "",
        location: ""
    }

    setLectureInfo(title: string, lecturer: string, location: string): void {
        this.lectureInfo = {
            title: title || this.lectureInfo.title,
            lecturer: lecturer || this.lectureInfo.lecturer,
            location: location || this.lectureInfo.location
        }

        // Если уже подключены, обновляем информацию на сервере
        if (this.isConnected) {
            this.sendSessionUpdate()
        }
    }

    connect(
        sessionId: string | null = null,
        lectureInfo: {
            title: string;
            lecturer: string;
            location: string;
            start_time: string;
        }
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                this.sessionId = sessionId || this.generateSessionId()

                // Устанавливаем информацию о лекции если передана
                // if (lectureInfo) {
                // this.setLectureInfo(
                //     lectureInfo.title || this.lectureInfo.title,
                //     lectureInfo.lecturer || this.lectureInfo.lecturer,
                //     lectureInfo.location || this.lectureInfo.location
                // )
                // }

                this.lectureInfo = {
                    title: lectureInfo.title,
                    lecturer: lectureInfo.lecturer,
                    location: lectureInfo.location
                };

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

    // private sendSessionStart(): void {
    //     const message = {
    //         type: 'session_start',
    //         session_id: this.sessionId,
    //         timestamp: new Date().toISOString(),
    //         audio_config: {
    //             sample_rate: 16000,
    //             channels: 1,
    //             format: 'pcm16'
    //         },
    //         lecture_info: {
    //             lecture_title: this.lectureInfo.title,
    //             lecturer_name: this.lectureInfo.lecturer,
    //             location: this.lectureInfo.location
    //         }
    //     }
    //     this.send(message)
    // }

    private sendSessionStart(): void {
        const message = {
            type: 'session_start',
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            audio_config: {
                sample_rate: 16000,
                channels: 1,
                format: 'pcm16'
            },
            lecture_info: {
                lecture_title: this.lectureInfo.title,
                lecturer_name: this.lectureInfo.lecturer,
                location: this.lectureInfo.location
            }
        };
        this.send(message);
    }

    private sendSessionUpdate(): void {
        const message = {
            type: 'session_update',
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            lecture_info: {
                lecture_title: this.lectureInfo.title,
                lecturer_name: this.lectureInfo.lecturer,
                location: this.lectureInfo.location
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

    // private handleMessage(data: WebSocketMessage): void {
    //     const handler = this.messageHandlers.get(data.type)
    //     if (handler) {
    //         handler(data)
    //     }
    // }

    private handleMessage(data: WebSocketMessage): void {
        console.log('📨 WebSocket message:', data.type)

        // Обработка переведенных сообщений
        if (data.type.startsWith('translated_')) {
            const language = data.type.split('_')[1]; // извлекаем язык (english, chinese и т.д.)
            this.translations[language] = data.translation;

            // Создаем объединенное сообщение со всеми переводами
            const combinedMessage = {
                type: 'translation_update',
                session_id: this.sessionId,
                timestamp: new Date().toISOString(),
                translations: { ...this.translations },
                original: data.original_text || '' // если сервер отправляет оригинальный текст
            };

            // Вызываем обработчик для обновленных переводов
            const handler = this.messageHandlers.get('translation_update');
            if (handler) {
                handler(combinedMessage);
            }
        }

        // Вызываем обработчик для конкретного типа сообщения
        const specificHandler = this.messageHandlers.get(data.type);
        if (specificHandler) {
            specificHandler(data);
        }
    }

    getTranslations(): Record<string, string> {
        return { ...this.translations };
    }

    private generateSessionId(): string {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }
}

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

        const generalHandler = this.messageHandlers.get('*')
        if (generalHandler) {
            generalHandler(data)
        }
    }
}

export default api