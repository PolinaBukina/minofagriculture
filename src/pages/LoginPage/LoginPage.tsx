import React, { useState, useRef, KeyboardEvent } from 'react';
import styles from './styles.module.css';
import logo from '../../components/Header/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LogoIcon from '../../icons/LogoIcon';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const passwordRef = useRef<HTMLInputElement>(null);
    const submitRef = useRef<HTMLButtonElement>(null);

    const { login } = useAuthStore();

    const handleSubmit = async () => {
        setError('');

        // Проверка статических учетных данных
        if (username === 'admin' && password === 'admin123') {
            login(username, 'dummy-token', 'admin');
            navigate('/admin');
            return;
        } else if (username === 'student' && password === 'student123') {
            login(username, 'dummy-token', 'student');
            navigate('/listener');
            return;
        } else if (username === 'lector' && password === 'lector123') {
            login(username, 'dummy-token', 'lector');
            navigate('/lector');
            return;
        }

        // Если не статические учетные данные, пробуем обычную аутентификацию
        if (!username || !password) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка авторизации');
            }

            // Проверка роли пользователя согласно AuthStore
            if (!['admin', 'lector', 'student'].includes(data.role)) {
                throw new Error('Недостаточно прав для входа');
            }

            // Вызов метода login из store
            login(data.username, data.token, data.role);

            // Перенаправление после успешного входа
            navigate('/dashboard');

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Неверное имя пользователя или пароль';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Остальной код остается без изменений
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, field: 'username' | 'password') => {
        if (e.key === 'Enter') {
            if (field === 'username' && username.trim()) {
                passwordRef.current?.focus();
            } else if (field === 'password' && password.trim()) {
                submitRef.current?.click();
            }
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.left}>
                <div className={styles.logoWrapper}>
                    {/* <div className={styles.logoSvg}>
                        <img src={logo} alt="логотип" className={styles.logo} />
                    </div>
                    <div className={styles.logoSubtitle}>ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ</div>
                    <div className={styles.logoTitle}>РОССИЙСКИЙ ГОСУДАРСТВЕННЫЙ АГРАРНЫЙ УНИВЕРСИТЕТ - <br />МСХА ИМЕНИ К.А. ТИМИРЯЗЕВА</div> */}
                    <div className={styles.logoSvg}>
                        <LogoIcon />
                    </div>
                    <div className={styles.logoTitle}>KD-systems</div>
                    <div className={styles.logoSubtitle}>Translation of lectures</div>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.formContainer}>
                    <div className={styles.formTitle}>Войдите в свою учетную запись</div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}>Имя пользователя</label>
                        <div className={styles.inputWrapper}>
                            <div className={styles.icon}>
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, 'username')}
                                className={styles.input}
                                placeholder="username@company.com"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Пароль</label>
                        <div className={styles.inputWrapper}>
                            <div className={styles.icon}>
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                id="password"
                                ref={passwordRef}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, 'password')}
                                className={styles.input}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className={styles.options}>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Запомнить меня
                        </label>
                        <Link to='/forgotpassword' className={styles.link}>Забыли пароль?</Link>
                    </div>

                    <button
                        ref={submitRef}
                        onClick={handleSubmit}
                        className={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default LoginPage;