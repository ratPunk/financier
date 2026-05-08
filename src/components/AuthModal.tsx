import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import '../css/cssComponents/authModal.css';

interface Props {
    onClose: () => void;
}

type Mode = 'login' | 'register';

const AuthModal: React.FC<Props> = ({ onClose }) => {
    const { t } = useTranslation();
    const { login, register } = useAuth();
    const [mode, setMode] = useState<Mode>('login');
    const [loginValue, setLoginValue] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            if (mode === 'login') {
                await login(loginValue.trim(), password);
            } else {
                await register(username.trim(), email.trim(), password);
            }
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Ошибка');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-modal-backdrop" onClick={onClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <div className="auth-modal-header">
                    <h2>{mode === 'login' ? t('auth.login') : t('auth.register')}</h2>
                    <button className="auth-modal-close" onClick={onClose}>×</button>
                </div>

                <div className="auth-tabs">
                    <button
                        className={mode === 'login' ? 'active' : ''}
                        onClick={() => { setMode('login'); setError(null); }}
                        type="button"
                    >{t('auth.login')}</button>
                    <button
                        className={mode === 'register' ? 'active' : ''}
                        onClick={() => { setMode('register'); setError(null); }}
                        type="button"
                    >{t('auth.register')}</button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {mode === 'register' && (
                        <>
                            <label>
                                {t('auth.username')}
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    minLength={3}
                                    maxLength={50}
                                    required
                                    autoComplete="username"
                                />
                            </label>
                            <label>
                                {t('auth.email')}
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </label>
                        </>
                    )}

                    {mode === 'login' && (
                        <label>
                            {t('auth.email')} / {t('auth.username')}
                            <input
                                value={loginValue}
                                onChange={(e) => setLoginValue(e.target.value)}
                                required
                                autoComplete="username"
                            />
                        </label>
                    )}

                    <label>
                        {t('auth.password')}
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            required
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                    </label>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-submit" disabled={busy}>
                        {busy ? '...' : (mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn'))}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
