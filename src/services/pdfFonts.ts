import { jsPDF } from 'jspdf';
import 'jspdf-customfonts';

// Предварительно закодированные base64 шрифты (замените на реальные)
const FONTS = {
    NotoSansSC: {
        normal: 'AAEAAAAQAQAABABARkZUTW...', // сокращённый пример, замените полным base64
        bold: 'AAEAAAAQAQAABABARkZUTW...'
    },
    ArialUnicode: {
        normal: 'AAEAAAASAQAABAAgRkZUTW...',
        bold: 'AAEAAAASAQAABAAgRkZUTW...'
    }
};

// Регистрация шрифтов
const registerFonts = (doc: jsPDF) => {
    // Китайский шрифт
    doc.addFont(FONTS.NotoSansSC.normal, 'NotoSansSC', 'normal');
    doc.addFont(FONTS.NotoSansSC.bold, 'NotoSansSC', 'bold');

    // Универсальный шрифт (русский, английский, французский)
    doc.addFont(FONTS.ArialUnicode.normal, 'ArialUnicode', 'normal');
    doc.addFont(FONTS.ArialUnicode.bold, 'ArialUnicode', 'bold');
};

// Определение подходящего шрифта для языка
const getFontForLanguage = (lang: string) => {
    lang = lang.toLowerCase();
    if (lang.startsWith('zh')) return 'NotoSansSC'; // Китайский
    if (lang.startsWith('ru')) return 'ArialUnicode'; // Русский
    return 'ArialUnicode'; // Для английского, французского и других
};

// Основная функция экспорта
export const exportLecture = async (
    lecture: {
        title: string;
        lecturer: string;
        start: string;
        duration: string;
    },
    originalText: string,
    translations: Record<string, string>,
    language: string,
    id: string
) => {
    if (!lecture) return;

    const lecturerLastName = lecture.lecturer.split(' ').pop() || 'lecturer';

    try {
        const doc = new jsPDF();
        registerFonts(doc);

        // Установка шрифта по умолчанию
        const defaultFont = getFontForLanguage(language);
        doc.setFont(defaultFont);

        // Настройки документа
        const titleSize = 16;
        const headerSize = 12;
        const textSize = 10;
        const margin = 15;
        let yPosition = margin;

        // Заголовок
        doc.setFontSize(titleSize);
        doc.text(lecture.title, margin, yPosition);
        yPosition += 10;

        // Метаданные лекции
        doc.setFontSize(headerSize);
        doc.text(`Лектор: ${lecture.lecturer}`, margin, yPosition);
        yPosition += 7;
        doc.text(`Дата: ${lecture.start}`, margin, yPosition);
        yPosition += 7;
        doc.text(`Длительность: ${lecture.duration}`, margin, yPosition);
        yPosition += 15;

        // Исходный текст
        doc.setFontSize(headerSize);
        doc.text('ИСХОДНЫЙ ТЕКСТ:', margin, yPosition);
        yPosition += 7;

        doc.setFontSize(textSize);
        const originalTextLines = doc.splitTextToSize(originalText, 180);
        originalTextLines.forEach((line: string) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += 7;
        });
        yPosition += 10;

        // Перевод
        doc.setFontSize(headerSize);
        doc.text(`ПЕРЕВОД (${language.toUpperCase()}):`, margin, yPosition);
        yPosition += 7;

        doc.setFontSize(textSize);
        const translatedText = translations[language] || 'Перевод недоступен';
        const translatedTextLines = doc.splitTextToSize(translatedText, 180);
        translatedTextLines.forEach((line: string) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += 7;
        });

        // Футер
        if (yPosition > 250) doc.addPage();
        doc.setFontSize(8);
        doc.text(`Экспортировано из системы транскрипции лекций | ID сессии: ${id}`, margin, 290);

        // Сохранение PDF
        const filename = `lecture_${lecturerLastName}_${id}.pdf`;
        doc.save(filename);

    } catch (error) {
        console.error('Ошибка при генерации PDF:', error);

        // Fallback: текстовый экспорт
        const exportText = `ЛЕКЦИЯ: ${lecture.title}
Лектор: ${lecture.lecturer}
Дата: ${lecture.start}
Длительность: ${lecture.duration}

ИСХОДНЫЙ ТЕКСТ:
${originalText}

ПЕРЕВОД (${language.toUpperCase()}):
${translations[language] || 'Перевод недоступен'}

---
Экспортировано из системы транскрибации лекций
ID сессии: ${id}`;

        const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lecture_${lecturerLastName}_${id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};