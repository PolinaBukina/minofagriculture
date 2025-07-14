export type Translations = 'en' | 'fr' | 'ru' | 'zh';
export type UserRole = 'student' | 'lector' | 'admin';

// Словарь переводов для каждой роли
const ROLE_LABELS: Record<UserRole, Record<Translations, string>> = {
  student: {
    en: 'Student Dashboard',
    fr: 'Tableau de bord étudiant',
    ru: 'Панель студента',
    zh: '学生面板'
  },
  lector: {
    en: 'Lecturer Panel',
    fr: 'Panneau du conférencier',
    ru: 'Панель преподавателя',
    zh: '讲师面板'
  },
  admin: {
    en: 'Admin Panel',
    fr: 'Panneau administrateur',
    ru: 'Панель администратора',
    zh: '管理面板'
  }
};

export const getCurrentLanguage = (): Translations => {
  const lang = localStorage.getItem('i18nextLng') as Translations | null;
  return lang && ['en', 'fr', 'ru', 'zh'].includes(lang)
    ? lang
    : 'en'; // Язык по умолчанию
};

export const getRoleFromStorage = (): UserRole => {
  try {
    const role = localStorage.getItem('user-role');
    return ['student', 'lector', 'admin'].includes(role as UserRole)
      ? role as UserRole
      : 'student';
  } catch (e) {
    console.error('Error getting role from storage', e);
    return 'student';
  }
};

export const getHomePath = (role: UserRole): string => {
  switch (role) {
    case 'lector': return '/lector';
    case 'admin': return '/admin';
    default: return '/listener';
  }
};

export const getHomeLabel = (role: UserRole): string => {
  const language = getCurrentLanguage();
  return ROLE_LABELS[role]?.[language] || ROLE_LABELS[role]?.en || 'Dashboard';
};