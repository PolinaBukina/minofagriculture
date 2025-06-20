export type AuthResponse = {
    token: string;
    role: 'admin' | 'lector' | 'student';
    username: string;
};

export type ApiError = {
    error: string;
};