// src/utils/registerFont.ts
import jsPDF from 'jspdf';

export const registerFonts = async () => {
    try {
        // Загружаем шрифт с кириллицей (например, Roboto)
        const robotoResponse = await fetch('/fonts/Roboto-Regular.ttf');
        const robotoData = await robotoResponse.arrayBuffer();

        // Добавляем в jsPDF
        const pdf = new jsPDF();
        pdf.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(robotoData));
        pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

        // Устанавливаем как шрифт по умолчанию
        pdf.setFont('Roboto');

        return true;
    } catch (error) {
        console.error('Failed to register fonts:', error);
        return false;
    }
};

export function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}