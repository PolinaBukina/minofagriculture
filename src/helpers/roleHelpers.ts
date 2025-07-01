export type UserRole = 'student' | 'lector' | 'admin';

export const authStorage = localStorage.getItem('auth-storage');

export const getRoleFromStorage = (): UserRole => {
  try {
    if (!authStorage) return 'student';

    const parsed = JSON.parse(authStorage);
    const role = parsed?.state?.user?.role;

    return ['student', 'lector', 'admin'].includes(role)
      ? role as UserRole
      : 'student';

  } catch (e) {
    console.error('Error parsing auth storage', e);
    return 'student';
  }
};

export const getHomePath = (role: UserRole): string => {
  switch (role) {
    case 'lector':
      return '/lector';
    case 'admin':
      return '/admin';
    case 'student':
      return '/listener';
    default:
      return '/listener';
  }
};

export const getHomeLabel = (role: UserRole): string => {
  switch (role) {
    case 'lector':
      return 'Панель преподавателя';
    case 'admin':
      return 'Панель администратора';
    case 'student':
      return 'Панель студента';
    default:
      return 'Главная';
  }
};