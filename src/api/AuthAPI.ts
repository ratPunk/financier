import axios from 'axios';

// MAMP serves PHP from htdocs root, so /financier/api/index.php
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost/financier/api/index.php';

const TOKEN_KEY = 'financier_token';

export const tokenStore = {
    get(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },
    set(token: string) {
        localStorage.setItem(TOKEN_KEY, token);
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
    },
};

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
});

api.interceptors.request.use((cfg) => {
    const t = tokenStore.get();
    if (t) {
        cfg.headers = cfg.headers || {};
        (cfg.headers as any)['X-Auth-Token'] = t;
    }
    return cfg;
});

export interface User {
    id: number;
    username: string;
    email: string;
    theme?: 'light' | 'dark' | null;
    language?: string | null;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface TrackedItem {
    id: number;
    mainCurrencies: string;
    secondCurrencies: string;
}

function unwrapError(e: any): never {
    const msg = e?.response?.data?.error || e?.message || 'Network error';
    throw new Error(msg);
}

export const AuthAPI = {
    async register(username: string, email: string, password: string): Promise<AuthResponse> {
        try {
            const r = await api.post('?action=register', { username, email, password });
            tokenStore.set(r.data.token);
            return r.data;
        } catch (e) { unwrapError(e); }
    },

    async login(login: string, password: string): Promise<AuthResponse> {
        try {
            const r = await api.post('?action=login', { login, password });
            tokenStore.set(r.data.token);
            return r.data;
        } catch (e) { unwrapError(e); }
    },

    async logout(): Promise<void> {
        try {
            await api.post('?action=logout');
        } catch { /* ignore */ }
        tokenStore.clear();
    },

    async me(): Promise<User | null> {
        if (!tokenStore.get()) return null;
        try {
            const r = await api.get('?action=me');
            return r.data.user as User;
        } catch (e: any) {
            if (e?.response?.status === 401) {
                tokenStore.clear();
                return null;
            }
            unwrapError(e);
        }
    },
};

export const PreferencesAPI = {
    async get(): Promise<{ theme: 'light' | 'dark' | null; language: string | null }> {
        try {
            const r = await api.get('?action=preferences');
            return r.data.preferences;
        } catch (e) { unwrapError(e); }
    },
    async set(prefs: { theme?: 'light' | 'dark'; language?: string }): Promise<void> {
        try {
            await api.post('?action=preferences', prefs);
        } catch (e) { unwrapError(e); }
    },
};

export const TrackedAPI = {
    async list(): Promise<TrackedItem[]> {
        try {
            const r = await api.get('?action=tracked');
            return r.data.items as TrackedItem[];
        } catch (e) { unwrapError(e); }
    },

    async add(base: string, quote: string): Promise<TrackedItem> {
        try {
            const r = await api.post('?action=tracked', { base, quote });
            return {
                id: r.data.id,
                mainCurrencies: r.data.mainCurrencies ?? base,
                secondCurrencies: r.data.secondCurrencies ?? quote,
            };
        } catch (e) { unwrapError(e); }
    },

    async remove(id: number): Promise<void> {
        try {
            await api.delete(`?action=tracked&id=${id}`);
        } catch (e) { unwrapError(e); }
    },
};
