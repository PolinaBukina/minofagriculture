import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import MusicIcon from '../../icons/MusicIcon';
import Lecture from '../../types/Lecture';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';

const LectureViewer = () => {
    const { id } = useParams<{ id: string }>();
    const userRole = getRoleFromStorage();
    const location = useLocation();
    const navigate = useNavigate();
    const [language, setLanguage] = useState<string>('en');
    const [showFullText, setShowFullText] = useState<boolean>(true);
    const [lecture, setLecture] = useState<Lecture | null>(null);
    const [fromArchive, setFromArchive] = useState<boolean>(false);

    // Определяем, откуда пришел пользователь
    useEffect(() => {
        // Проверяем state навигации
        if (location.state?.fromArchive) {
            setFromArchive(true);
        }
        // Или анализируем текущий путь
        else if (location.pathname.includes('/archive')) {
            setFromArchive(true);
        }
    }, [location]);

    // Загрузка данных лекции
    useEffect(() => {
        // Mock данные
        const mockLecture: Lecture = {
            id: id || '1',
            title: `Лекция ${id}`,
            start: '2025-06-19 15:40:06',
            end: '2025-06-19 17:18:44',
            duration: '1ч 39м',
            lecturer: 'Иванов И.И.',
            location: 'Аудитория 101',
            content: {
                original: `Это полный текст лекции на русском языке. Здесь содержится основная информация, которую представил лектор ${id}.
        Вторая часть лекции включает в себя дополнительные материалы и примеры использования рассматриваемых технологий.
        Заключительная часть содержит выводы и рекомендации для дальнейшего изучения темы.`,
                translations: {
                    en: `This is the full lecture text in English. It contains the main information presented by lecturer ${id}.
        The second part of the lecture includes additional materials and use cases of the discussed technologies.
        The final part contains conclusions and recommendations for further study of the topic.`,
                    fr: `Ceci est le texte complet de la conférence en français. Il contient les principales informations présentées par le conférencier ${id}.
        La deuxième partie de la conférence comprend des documents supplémentaires et des cas d'utilisation des technologies discutées.
        La partie finale contient des conclusions et des recommandations pour une étude plus approfondie du sujet.`,
                    zh: `这是中文的完整讲座文本。它包含讲师${id}介绍的主要信息。
        讲座的第二部分包括所讨论技术的其他材料和用例。
        最后部分包含结论和对该主题进一步研究的建议。`
                }
            }
        };
        setLecture(mockLecture);
    }, [id]);

    // Определяем, откуда пришел пользователь
    useEffect(() => {
        if (location.state?.fromArchive || location.pathname.includes('/archive')) {
            setFromArchive(true);
        }
    }, [location]);

    // Функция для формирования хлебных крошек
    const getBreadcrumbs = () => {
        const baseItems = [
            {
                label: getHomeLabel(userRole),
                path: getHomePath(userRole)
            }
        ];

        if (fromArchive) {
            return [
                ...baseItems,
                { label: 'Архив лекций', path: '/archive' },
                { label: `Лекция ${id}`, path: `/archive/lecture/${id}` }
            ];
        } else {
            return [
                ...baseItems,
                { label: 'Активные лекции', path: '/active' },
                { label: `Лекция ${id}`, path: `/active/lecture/${id}` }
            ];
        }
    };

    if (!lecture) {
        return (
            <div className={commonStyles.appContainer}>
                <div className={commonStyles.mainContentLecture}>
                    <Header />
                    <h1 className={commonStyles.sectionHeader}>Загрузка лекции...</h1>
                </div>
            </div>
        );
    }

    // Функция для синтеза речи
    const speakText = (text: string, lang: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);

            // Устанавливаем язык в зависимости от выбранного
            switch (lang) {
                case 'en':
                    utterance.lang = 'en-US';
                    break;
                case 'fr':
                    utterance.lang = 'fr-FR';
                    break;
                case 'zh':
                    utterance.lang = 'zh-CN';
                    break;
                default:
                    utterance.lang = 'ru-RU';
            }

            window.speechSynthesis.speak(utterance);
        } else {
            alert('Браузер не поддерживает синтез речи');
        }
    }

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.mainContentLecture}>
                <Header />
                <Breadcrumbs items={getBreadcrumbs()} />
                <h1 className={commonStyles.sectionHeader}>{lecture.title}</h1>

                <div className={commonStyles.infoCardLecture}>
                    <div className={commonStyles.listItemLecture}>
                        <h2>Детали лекции</h2>
                        {lecture.lecturer && (
                            <div className={commonStyles.statusItem}>
                                <span>Лектор:</span>
                                <span>{lecture.lecturer}</span>
                            </div>
                        )}
                        <div className={commonStyles.statusItem}>
                            <span>Начало:</span>
                            <span>{lecture.start}</span>
                        </div>
                        <div className={commonStyles.statusItem}>
                            <span>Окончание:</span>
                            <span>{lecture.end}</span>
                        </div>
                        <div className={commonStyles.statusItem}>
                            <span>Длительность:</span>
                            <span>{lecture.duration}</span>
                        </div>
                        {lecture.location && (
                            <div className={commonStyles.statusItem}>
                                <span>Место:</span>
                                <span>{lecture.location}</span>
                            </div>
                        )}
                    </div>
                    <div className={commonStyles.listItemLecture}>
                        <h2>Выбор языка</h2>
                        <select
                            className={commonStyles.filterSelect}
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="en">Английский</option>
                            <option value="fr">Французский</option>
                            <option value="zh">Китайский</option>
                        </select>
                    </div>
                </div>
                <div className={commonStyles.infoCardLecture}>
                    <div className={commonStyles.listItemLecture}>
                        <div className={commonStyles.textHeaderContainer}>
                            <h2>Исходный текст</h2>
                        </div>
                        <div className={commonStyles.ItemLecture}>
                            <div className={commonStyles.ItemLectureButtons}>
                                <button
                                    className={commonStyles.textButton}
                                    onClick={() => navigate(`/archive/lecture/${id}/full-lecture`, {
                                        state: {
                                            originalText: lecture.content?.original,
                                            translatedText: lecture.content?.translations[language],
                                            language: language
                                        }
                                    })}
                                >
                                    Показать полный текст
                                </button>
                                {showFullText && (
                                    <button
                                        className={commonStyles.textButton}
                                        onClick={() => lecture.content?.original && speakText(lecture.content.original, 'ru')}
                                        title="Озвучить текст"
                                    >
                                        Озвучить
                                    </button>
                                )}
                            </div>
                            {showFullText && (
                                <div className={commonStyles.LectureFullText}>
                                    {lecture.content?.original?.substring(0, 500) + '...' || 'Текст лекции недоступен'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={commonStyles.listItemLecture}>
                        <h2>{language === 'en' ? 'Translated text (ENG)' :
                            language === 'fr' ? 'Texte traduit (français)' :
                                '翻译文本（中文）'}</h2>
                        <div className={commonStyles.ItemLecture}>
                            {showFullText && (
                                <div className={commonStyles.LectureFullText}>
                                    {lecture.content?.translations[language] || 'Перевод недоступен'}
                                </div>
                            )}
                            <div className={commonStyles.ItemLectureButtons}>
                                <button
                                    className={commonStyles.textButton}
                                    onClick={() => navigate(`/archive/lecture/${id}/full-lecture`, {
                                        state: {
                                            originalText: lecture.content?.original,
                                            translatedText: lecture.content?.translations[language],
                                            language: language
                                        }
                                    })}
                                >
                                    {language === 'en' ? 'Show full text' :
                                        language === 'fr' ? 'Afficher le texte complet' :
                                            '显示全文'}
                                </button>
                                {showFullText && (
                                    <button
                                        className={commonStyles.textButton}
                                        onClick={() => lecture.content?.translations[language] &&
                                            speakText(lecture.content.translations[language], language)}
                                        title="Озвучить перевод"
                                    >
                                        {/* Озвучить */}
                                        {language === 'en' ? 'Listen' :
                                            language === 'fr' ? 'Écouter' :
                                                '朗读'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectureViewer;