// src/types/Lecture.ts
type Lecture = {
    id: string;
    title: string;
    start: string;
    end: string;
    duration: string;
    lecturer?: string;
    location?: string;
    content?: {
        original: string;
        translations: {
            [key: string]: string;
        };
    };
};

export default Lecture;