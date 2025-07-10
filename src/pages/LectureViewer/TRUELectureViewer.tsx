import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import Lecture from '../../types/Lecture';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';

const LectureViewer = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const userRole = getRoleFromStorage();
    const location = useLocation();
    const navigate = useNavigate();

    const [language, setLanguage] = useState<string>('en');
    const [lecture, setLecture] = useState<Lecture | null>(null);
    const [fromArchive, setFromArchive] = useState<boolean>(false);

    // Load lecture data
    useEffect(() => {
        const mockLecture: Lecture = {
            id: id || '1',
            title: `Лекция ${id}`,
            start: '2025-06-19 15:40:06',
            end: '2025-06-19 17:18:44',
            duration: t('time.duration', { hours: 1, minutes: 39 }),
            lecturer: t('lecture_viewer.mock_lecturer'),
            location: t('lecture_viewer.mock_location'),
            content: {
                original: t('lecture_viewer.mock_content.original', { id }),
                translations: {
                    en: t('lecture_viewer.mock_content.en', { id }),
                    fr: t('lecture_viewer.mock_content.fr', { id }),
                    zh: t('lecture_viewer.mock_content.zh', { id })
                }
            },
            startTime: undefined
        };
        setLecture(mockLecture);
    }, [id, t]);

    // Determine navigation source
    useEffect(() => {
        if (location.state?.fromArchive || location.pathname.includes('/archive')) {
            setFromArchive(true);
        }
    }, [location]);

    const getBreadcrumbs = () => {
        const baseItems = [{
            label: getHomeLabel(userRole),
            path: getHomePath(userRole),
            translationKey: `roles.${userRole}.home`
        }];

        if (fromArchive) {
            return [
                ...baseItems,
                {
                    label: t('archive.title'),
                    path: '/archive',
                    translationKey: 'archive.title'
                },
                {
                    label: t('lecture_viewer.breadcrumb', { id }),
                    path: `/archive/lecture/${id}`,
                    translationKey: 'lecture_viewer.breadcrumb'
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
                    label: t('lecture_viewer.breadcrumb', { id }),
                    path: `/active/lecture/${id}`,
                    translationKey: 'lecture_viewer.breadcrumb'
                }
            ];
        }
    };

    const speakText = (text: string, lang: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = {
                'en': 'en-US',
                'fr': 'fr-FR',
                'zh': 'zh-CN',
                'ru': 'ru-RU'
            }[lang] || 'en-US';

            window.speechSynthesis.speak(utterance);
        } else {
            alert(t('speech.not_supported'));
        }
    };

    if (!lecture) {
        return (
            <div className={commonStyles.appContainer}>
                <div className={commonStyles.mainContentLecture}>
                    <Header />
                    <h1 className={commonStyles.sectionHeader}>{t('loading')}</h1>
                </div>
            </div>
        );
    }

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.mainContentLecture}>
                <Header />
                <Breadcrumbs items={getBreadcrumbs()} />
                <h1 className={commonStyles.sectionHeader}>{lecture.title}</h1>

                <div className={commonStyles.infoCardLecture}>
                    <div className={commonStyles.listItemLecture}>
                        <h2>{t('lecture_viewer.details')}</h2>
                        {lecture.lecturer && (
                            <div className={commonStyles.statusItem}>
                                <span>{t('lecture_viewer.lecturer')}:</span>
                                <span>{lecture.lecturer}</span>
                            </div>
                        )}
                        <div className={commonStyles.statusItem}>
                            <span>{t('lecture_viewer.start')}:</span>
                            <span>{lecture.start}</span>
                        </div>
                        <div className={commonStyles.statusItem}>
                            <span>{t('lecture_viewer.end')}:</span>
                            <span>{lecture.end}</span>
                        </div>
                        <div className={commonStyles.statusItem}>
                            <span>{t('lecture_viewer.duration')}:</span>
                            <span>{lecture.duration}</span>
                        </div>
                        {lecture.location && (
                            <div className={commonStyles.statusItem}>
                                <span>{t('lecture_viewer.location')}:</span>
                                <span>{lecture.location}</span>
                            </div>
                        )}
                    </div>

                    <div className={commonStyles.listItemLecture}>
                        <h2>{t('language.select')}</h2>
                        <select
                            className={commonStyles.filterSelect}
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="en">{t('language.english')}</option>
                            <option value="fr">{t('language.french')}</option>
                            <option value="zh">{t('language.chinese')}</option>
                        </select>
                    </div>
                </div>

                <div className={commonStyles.infoCardLecture}>
                    <div className={commonStyles.listItemLecture}>
                        <div className={commonStyles.textHeaderContainer}>
                            <h2>{t('lecture_viewer.original_text')}</h2>
                        </div>
                        <div className={commonStyles.ItemLecture}>
                            <div className={commonStyles.ItemLectureButtons}>
                                <button
                                    className={commonStyles.textButton}
                                    onClick={() => lecture.content?.original && speakText(lecture.content.original, 'ru')}
                                    title={t('speech.synthesize')}
                                >
                                    {t('speech.synthesize')}
                                </button>
                                <button
                                    className={commonStyles.textButton}
                                    onClick={() => navigate(`/archive/lecture/${id}/full-lecture`, {
                                        state: {
                                            originalText: lecture.content?.original,
                                            translatedText: lecture.content?.translations[language as keyof typeof lecture.content.translations],
                                            language,
                                            lecture,
                                            fromArchive
                                        }
                                    })}
                                >
                                    {t('lecture_viewer.show_full')}
                                </button>
                            </div>
                            <div className={commonStyles.LectureFullText}>
                                {lecture.content?.original?.substring(0, 500) + '...' || t('lecture_viewer.text_unavailable')}
                            </div>
                        </div>
                    </div>

                    <div className={commonStyles.listItemLecture}>
                        <h2>{t('lecture_viewer.translated_text', { language: t(`language.${language}`) })}</h2>
                        <div className={commonStyles.ItemLecture}>
                            <div className={commonStyles.LectureFullText}>
                                {lecture.content?.translations[language as keyof typeof lecture.content.translations]?.substring(0, 500) + '...' || t('lecture_viewer.translation_unavailable')}
                            </div>
                            <div className={commonStyles.ItemLectureButtons}>
                                <button
                                    className={commonStyles.textButton}
                                    onClick={() => navigate(`/archive/lecture/${lecture.id}/full-lecture`, {
                                        state: {
                                            originalText: lecture.content?.original,
                                            translatedText: lecture.content?.translations[language as keyof typeof lecture.content.translations],
                                            language,
                                            lecture,
                                            fromArchive
                                        }
                                    })}
                                >
                                    {t('lecture_viewer.show_full')}
                                </button>
                                <button
                                    className={commonStyles.textButton}
                                    onClick={() => lecture.content?.translations[language as keyof typeof lecture.content.translations] &&
                                        speakText(lecture.content.translations[language as keyof typeof lecture.content.translations], language)}
                                    title={t('speech.synthesize')}
                                >
                                    {t('speech.synthesize')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectureViewer;