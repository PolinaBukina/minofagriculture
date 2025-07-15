import { addFont } from 'jspdf-customfonts';

import font from './NotoSans-Regular.ttf';

export const loadCustomFonts = () => {
    addFont({
        fontName: 'NotoSans',
        fontStyle: 'normal',
        fontData: font,
    });
};
