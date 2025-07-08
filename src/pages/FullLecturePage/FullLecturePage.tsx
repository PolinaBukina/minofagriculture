
// import { useLocation, useParams } from 'react-router-dom';
// import commonStyles from '../commonStyles.module.css';
// import Header from '../../components/Header/Header';
// import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
// import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';

// const FullLecturePage = () => {
//     const location = useLocation();
//     const { id } = useParams<{ id: string }>();
//     const { originalText, translatedText, language, lectureTitle, fromArchive, fromRecording } = location.state || {};

//     const userRole = getRoleFromStorage();

//     // Функция для формирования хлебных крошек
//     const getBreadcrumbs = () => {
//         const baseItems = [
//             {
//                 label: getHomeLabel(userRole),
//                 path: getHomePath(userRole)
//             }
//         ];
//         const endItem = [
//             {
//                 label: `Полный текст лекции ${id}`,
//                 path: ''
//             }
//         ]

//         if (fromArchive) {
//             return [
//                 ...baseItems,
//                 { label: 'Архив лекций', path: '/archive' },
//                 { label: `Лекция ${id}`, path: `/archive/lecture/${id}` },
//                 ...endItem
//             ];
//         }
//         else if (fromRecording) {
//             return [
//                 ...baseItems,
//                 {
//                     label: 'Запись лекции',
//                     path: '/lector/recorder',
//                     state: { lecture: location.state.lecture } // Передаем состояние обратно
//                 },
//                 {
//                     label: `Запись лекции ${id}`,
//                     path: '/lector/recorder/recording',
//                     state: { lecture: location.state.lecture } // Передаем состояние обратно
//                 },
//                 { label: `Лекция ${id}`, path: '' }
//             ];
//         } else {
//             return [
//                 ...baseItems,
//                 { label: 'Активные лекции', path: '/active' },
//                 { label: `Лекция ${id}`, path: `/active/lecture/${id}` },
//                 ...endItem
//             ];
//         }
//     };

//     return (
//         <div className={commonStyles.appContainer}>
//             <div className={commonStyles.mainContentLecture}>
//                 <Header />
//                 <Breadcrumbs
//                     items={getBreadcrumbs()}
//                 />

//                 <div className={commonStyles.infoCardLecture}>
//                     <div className={commonStyles.listItemLecture}>
//                         <h2>Полный текст лекции</h2>
//                         <div className={commonStyles.LectureFullText}>
//                             {originalText || 'Текст лекции недоступен'}
//                         </div>
//                     </div>

//                     <div className={commonStyles.listItemLecture}>
//                         <h2>
//                             {language === 'en' ? 'Полный перевод (английский)' :
//                                 language === 'fr' ? 'Полный перевод (французский)' :
//                                     'Полный перевод (китайский)'}
//                         </h2>
//                         <div className={commonStyles.LectureFullText}>
//                             {translatedText || 'Перевод недоступен'}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default FullLecturePage;


import { useLocation, useParams } from 'react-router-dom';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';
import { useTranslation } from 'react-i18next';

const FullLecturePage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const { originalText, translatedText, language, lectureTitle, fromArchive, fromRecording } = location.state || {};

    const userRole = getRoleFromStorage();

    const getBreadcrumbs = () => {
        const baseItems = [
            {
                label: getHomeLabel(userRole),
                path: getHomePath(userRole),
                translationKey: `roles.${userRole}.home`
            }
        ];

        const endItem = [
            {
                label: t('lecture.full_text_breadcrumb', { id }),
                path: '',
                translationKey: 'lecture.full_text_breadcrumb'
            }
        ];

        if (fromArchive) {
            return [
                ...baseItems,
                {
                    label: t('archive.title'),
                    path: '/archive',
                    translationKey: 'archive.title'
                },
                {
                    label: t('lecture.breadcrumb', { id }),
                    path: `/archive/lecture/${id}`,
                    translationKey: 'lecture.breadcrumb'
                },
                ...endItem
            ];
        } else if (fromRecording) {
            return [
                ...baseItems,
                {
                    label: t('recording.title'),
                    path: '/lector/recorder',
                    state: { lecture: location.state.lecture },
                    translationKey: 'recording.title'
                },
                {
                    label: t('recording.session_breadcrumb', { id }),
                    path: '/lector/recorder/recording',
                    state: { lecture: location.state.lecture },
                    translationKey: 'recording.session_breadcrumb'
                },
                {
                    label: t('lecture.breadcrumb', { id }),
                    path: '',
                    translationKey: 'lecture.breadcrumb'
                }
            ];
        } else {
            return [
                ...baseItems,
                {
                    label: t('active_lectures.title'),
                    path: '/active',
                    translationKey: 'active_lectures.title'
                },
                {
                    label: t('lecture.breadcrumb', { id }),
                    path: `/active/lecture/${id}`,
                    translationKey: 'lecture.breadcrumb'
                },
                ...endItem
            ];
        }
    };

    const getLanguageLabel = () => {
        switch (language) {
            case 'en': return t('languages.english');
            case 'fr': return t('languages.french');
            case 'zh': return t('languages.chinese');
            default: return t('languages.translation');
        }
    };

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.mainContentLecture}>
                <Header />
                <Breadcrumbs items={getBreadcrumbs()} />

                <div className={commonStyles.infoCardLecture}>
                    <div className={commonStyles.listItemLecture}>
                        <h2>{t('lecture.full_text')}</h2>
                        <div className={commonStyles.LectureFullText}>
                            {originalText || t('lecture.text_unavailable')}
                        </div>
                    </div>

                    {translatedText && (
                        <div className={commonStyles.listItemLecture}>
                            <h2>{t('lecture.full_translation')} ({getLanguageLabel()})</h2>
                            <div className={commonStyles.LectureFullText}>
                                {translatedText}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FullLecturePage;