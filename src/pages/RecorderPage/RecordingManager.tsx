import React, { useRef, useEffect, useCallback } from 'react';

type LectureData = {
    id: string;
    title: string;
    lecturer: string;
    start_time: string;
    location: string;
    lecture_title?: string;
    lecturer_name?: string;
    exact_location?: string;
};

type WebSocketMessage = {
    type: string;
    processed_text?: string;
};

type RecordingManagerProps = {
    lecture: LectureData;
    onMessage: (message: WebSocketMessage) => void;
    onStatusChange: (status: string) => void;
    onError: (error: Error) => void;
};

const RecordingManager: React.FC<RecordingManagerProps> = ({
    lecture,
    onMessage,
    onStatusChange,
    onError
}) => {
    interface RecordingState {
        isRecording: boolean;
        isPaused: boolean;
        webSocket: WebSocket | null;
        audioContext: AudioContext | null;
        mediaStream: MediaStream | null;
        processor: ScriptProcessorNode | null;
        buffer: Int16Array[];
        flushInterval: NodeJS.Timeout | null;
    }

    const recordingState = useRef<RecordingState>({
        isRecording: false,
        isPaused: false,
        webSocket: null,
        audioContext: null,
        mediaStream: null,
        processor: null,
        buffer: [],
        flushInterval: null
    });

    const float32ToPCM16 = (float32Array: Float32Array): Int16Array => {
        const pcm16 = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const sample = Math.max(-1, Math.min(1, float32Array[i]));
            pcm16[i] = Math.round(sample * 0x7FFF);
        }
        return pcm16;
    };

    const sendPCMData = useCallback((pcmData: Int16Array) => {
        const ws = recordingState.current.webSocket;
        if (ws && ws.readyState === ws.OPEN) {
            const arrayBuffer = pcmData.buffer.slice(pcmData.byteOffset, pcmData.byteOffset + pcmData.byteLength);
            ws.send(arrayBuffer);
        }
    }, []);

    const forceFlushBuffer = useCallback(() => {
        const state = recordingState.current;
        if (state.isRecording && state.buffer.length > 0) {
            const totalLength = state.buffer.reduce((sum, chunk) => sum + chunk.length, 0);
            const combinedPCM = new Int16Array(totalLength);

            let offset = 0;
            for (const chunk of state.buffer) {
                combinedPCM.set(chunk, offset);
                offset += chunk.length;
            }

            sendPCMData(combinedPCM);
            state.buffer = [];
        }
    }, [sendPCMData]);

    const startRecording = useCallback(async () => {
        const state = recordingState.current;

        try {
            if (state.audioContext) {
                await state.audioContext.close();
                state.audioContext = null;
            }

            onStatusChange('requesting_mic');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            state.mediaStream = stream;
            onStatusChange('connecting_ws');

            state.webSocket = new WebSocket('wss://audio.minofagriculture.ru/ws/audio');
            const ws = state.webSocket;

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as WebSocketMessage;
                    onMessage(message);
                } catch (err) {
                    onError(err as Error);
                }
            };

            ws.onopen = () => {
                onStatusChange('ws_connected');

                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                    sampleRate: 16000
                });
                state.audioContext = audioContext;

                const source = audioContext.createMediaStreamSource(stream);
                const processor = audioContext.createScriptProcessor(4096, 1, 1);
                state.processor = processor;

                processor.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
                    if (!state.isRecording) return;

                    const inputBuffer = audioProcessingEvent.inputBuffer;
                    const inputData = inputBuffer.getChannelData(0);
                    const pcmData = float32ToPCM16(inputData);
                    state.buffer.push(pcmData);

                    const totalSamples = state.buffer.reduce((sum, chunk) => sum + chunk.length, 0);
                    const durationSeconds = totalSamples / 16000;

                    if (durationSeconds >= 0.2) {
                        forceFlushBuffer();
                    }
                };

                source.connect(processor);
                processor.connect(audioContext.destination);
                state.flushInterval = setInterval(forceFlushBuffer, 10000);

                state.isRecording = true;
                onStatusChange('recording');
            };

            ws.onerror = (error) => {
                onError(new Error('WebSocket error'));
            };

        } catch (err) {
            onError(err as Error);
        }
    }, [lecture, onMessage, onStatusChange, onError, forceFlushBuffer]);

    const stopRecording = useCallback(() => {
        const state = recordingState.current;

        state.isRecording = false;
        onStatusChange('stopped');

        if (state.flushInterval) {
            clearInterval(state.flushInterval);
            state.flushInterval = null;
        }

        forceFlushBuffer();

        if (state.audioContext && state.audioContext.state !== 'closed') {
            state.audioContext.close().catch(e => {
                console.error('Error closing AudioContext:', e);
            });
            state.audioContext = null;
        }

        if (state.processor) {
            state.processor.disconnect();
            state.processor = null;
        }

        if (state.mediaStream) {
            state.mediaStream.getTracks().forEach(track => track.stop());
            state.mediaStream = null;
        }

        if (state.webSocket) {
            state.webSocket.close();
            state.webSocket = null;
        }
    }, [forceFlushBuffer, onStatusChange]);

    useEffect(() => {
        return () => {
            if (recordingState.current.isRecording) {
                stopRecording();
            }
        };
    }, [stopRecording]);

    return null;
};

export default RecordingManager;