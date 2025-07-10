// src/audio-worklet/audio-processor.ts

// Объявляем глобальные типы для AudioWorklet
declare global {
    class AudioWorkletProcessor {
        readonly port: MessagePort;
        process(
            inputs: Float32Array[][],
            outputs: Float32Array[][],
            parameters: Record<string, Float32Array>
        ): boolean;
    }

    var registerProcessor: (
        name: string,
        processorCtor: new (options?: AudioWorkletNodeOptions) => AudioWorkletProcessor
    ) => void;
}

// Наш класс процессора
class AudioProcessor extends AudioWorkletProcessor {
    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean {
        const input = inputs[0];

        if (input && input.length > 0) {
            const inputChannel = input[0];
            // Отправляем данные в основной поток
            this.port.postMessage(inputChannel);
        }

        // Возвращаем true, чтобы процессор продолжал работать
        return true;
    }
}

// Регистрируем наш процессор
registerProcessor('audio-processor', AudioProcessor);

// Экспорт для TypeScript (хотя для worklet это не обязательно)
export { };