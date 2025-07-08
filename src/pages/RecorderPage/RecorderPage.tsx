import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import commonStyles from '../commonStyles.module.css';
import Header from '../../components/Header/Header';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { getHomeLabel, getHomePath, getRoleFromStorage } from '../../helpers/roleHelpers';

type LectureData = {
    id: string;
    title: string;
    lecturer: string;
    startTime: string;
    duration: string;
    location: string;
    createdAt: string;
};

const RecorderPage = () => {
    const { t } = useTranslation();
    const [lectureData, setLectureData] = useState({
        title: '',
        lecturer: '',
        startTime: '',
        duration: '',
        location: ''
    });
    const userRole = getRoleFromStorage();
    const navigate = useNavigate();

    const handleLectureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLectureData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();
        const newLecture: LectureData = {
            ...lectureData,
            id: `lecture-${Date.now()}`,
            startTime: lectureData.startTime || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        navigate('recording', { state: { lecture: newLecture } });
    };

    const isFormValid = lectureData.title && lectureData.lecturer &&
        lectureData.startTime && lectureData.duration && lectureData.location;

    return (
        <div className={commonStyles.appContainer}>
            <div className={commonStyles.mainContent}>
                <Header />
                <Breadcrumbs
                    items={[
                        {
                            label: getHomeLabel(userRole),
                            path: getHomePath(userRole)
                        },
                        {
                            label: t('recorder.breadcrumb'),
                            path: ''
                        }
                    ]}
                />

                <h1 className={commonStyles.sectionHeader}>
                    {t('recorder.title')}
                </h1>

                <div className={commonStyles.infoCard}>
                    <h2 className={commonStyles.subHeader}>
                        {t('recorder.description')}
                    </h2>

                    <form onSubmit={handleSubmitForm}>
                        <div className={commonStyles.filterControl}>
                            <label>{t('recorder.form.title')}</label>
                            <input
                                type="text"
                                name="title"
                                value={lectureData.title}
                                onChange={handleLectureInputChange}
                                className={commonStyles.filterSelect}
                                required
                                placeholder={t('recorder.form.title_placeholder')}
                            />
                        </div>

                        <div className={commonStyles.filterControl}>
                            <label>{t('recorder.form.lecturer')}</label>
                            <input
                                type="text"
                                name="lecturer"
                                value={lectureData.lecturer}
                                onChange={handleLectureInputChange}
                                className={commonStyles.filterSelect}
                                required
                                placeholder={t('recorder.form.lecturer_placeholder')}
                            />
                        </div>

                        <div className={commonStyles.filterControl}>
                            <label>{t('recorder.form.start_time')}</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={lectureData.startTime}
                                onChange={handleLectureInputChange}
                                className={commonStyles.filterSelect}
                                required
                            />
                        </div>

                        <div className={commonStyles.filterControl}>
                            <label>{t('recorder.form.duration')}</label>
                            <input
                                type="number"
                                name="duration"
                                min="1"
                                value={lectureData.duration}
                                onChange={handleLectureInputChange}
                                className={commonStyles.filterSelect}
                                required
                                placeholder={t('recorder.form.duration_placeholder')}
                            />
                        </div>

                        <div className={commonStyles.filterControl}>
                            <label>{t('recorder.form.location')}</label>
                            <input
                                type="text"
                                name="location"
                                value={lectureData.location}
                                onChange={handleLectureInputChange}
                                className={commonStyles.filterSelect}
                                required
                                placeholder={t('recorder.form.location_placeholder')}
                            />
                        </div>

                        <button
                            type="submit"
                            className={commonStyles.primaryButton}
                            disabled={!isFormValid}
                        >
                            {t('recorder.form.submit')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RecorderPage;