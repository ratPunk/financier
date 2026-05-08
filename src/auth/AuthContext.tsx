import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import i18nInstance from '../i18n';
import { AuthAPI, User, tokenStore } from '../api/AuthAPI';

const i18n: any = i18nInstance;

function applyUserPrefs(u: User | null) {
    if (!u) return;
    if (u.theme === 'light' || u.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', u.theme);
        localStorage.setItem('financier_theme', u.theme);
    }
    if (u.language && typeof u.language === 'string') {
        const lng = u.language;
        localStorage.setItem('financier_lang', lng);
        if (i18n.language !== lng) i18n.changeLanguage(lng);
    }
}

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (login: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (tokenStore.get()) {
                    const u = await AuthAPI.me();
                    if (!cancelled) {
                        setUser(u);
                        applyUserPrefs(u);
                    }
                }
            } catch {
                tokenStore.clear();
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const login = useCallback(async (lg: string, pw: string) => {
        const r = await AuthAPI.login(lg, pw);
        // refresh full profile (with prefs)
        const full = await AuthAPI.me();
        const u = full || r.user;
        setUser(u);
        applyUserPrefs(u);
    }, []);

    const register = useCallback(async (username: string, email: string, password: string) => {
        const r = await AuthAPI.register(username, email, password);
        setUser(r.user);
    }, []);

    const logout = useCallback(async () => {
        await AuthAPI.logout();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
