
import { useLocation, useParams } from 'react-router-dom';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';

const FullLecturePage = () => {
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const { originalText, translatedText, language, lectureTitle, fromArchive } = location.state || {};

    const userRole = getRoleFromStorage();

    // Функция для формирования хлебных крошек
    const getBreadcrumbs = () => {
        const baseItems = [
            {
                label: getHomeLabel(userRole),
                path: getHomePath(userRole)
            }
        ];
        const endItem = [
            {
                label: `Полный текст лекции ${id}`,
                path: ''
            }
        ]

        if (fromArchive) {
            return [
                ...baseItems,
                { label: 'Архив лекций', path: '/archive' },
                { label: `Лекция ${id}`, path: `/archive/lecture/${id}` },
                ...endItem
            ];
        } else {
            return [
                ...baseItems,
                { label: 'Активные лекции', path: '/active' },
                { label: `Лекция ${id}`, path: `/active/lecture/${id}` },
                ...endItem
            ];
        }
    };

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.mainContentLecture}>
                <Header />
                <Breadcrumbs
                    items={getBreadcrumbs()}
                />

                <div className={commonStyles.infoCardLecture}>
                    <div className={commonStyles.listItemLecture}>
                        <h2>Полный текст лекции</h2>
                        <div className={commonStyles.LectureFullText}>
                            {originalText || 'Текст лекции недоступен'}
                        </div>
                    </div>

                    <div className={commonStyles.listItemLecture}>
                        <h2>
                            {language === 'en' ? 'Полный перевод (английский)' :
                                language === 'fr' ? 'Полный перевод (французский)' :
                                    'Полный перевод (китайский)'}
                        </h2>
                        <div className={commonStyles.LectureFullText}>
                            {translatedText || 'Перевод недоступен'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullLecturePage;