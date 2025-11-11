// // public/audio-worklet/audio-processor.js
// class AudioProcessor extends AudioWorkletProcessor {
//     constructor() {
//         super();
//         this.buffer = [];
//         this.bufferSize = 4096;
//     }

//     process(inputs, outputs, parameters) {
//         const input = inputs[0];
//         if (input && input.length > 0) {
//             const inputData = input[0];

//             // Конвертируем Float32 в Int16
//             const pcmData = this.float32ToPCM16(inputData);

//             // Отправляем данные в основной поток
//             this.port.postMessage({
//                 type: 'audioData',
//                 data: pcmData
//             });
//         }

//         return true;
//     }

//     float32ToPCM16(float32Array) {
//         const pcm16 = new Int16Array(float32Array.length);
//         for (let i = 0; i < float32Array.length; i++) {
//             const sample = Math.max(-1, Math.min(1, float32Array[i]));
//             pcm16[i] = Math.round(sample * 0x7FFF);
//         }
//         return pcm16;
//     }
// }

// registerProcessor('audio-processor', AudioProcessor);



// public/audio-worklet/audio-processor.js
class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.port.onmessage = (event) => {
            // Обработка сообщений из основного потока
            if (event.data.type === 'stop') {
                // Логика остановки если нужна
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input && input.length > 0) {
            const inputData = input[0];
            
            // Конвертируем Float32 в Int16
            const pcmData = this.float32ToPCM16(inputData);
            
            // Отправляем данные в основной поток
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