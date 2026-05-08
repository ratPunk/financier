import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const ru = {
    translation: {
        nav: {
            currencies: 'Валюты',
            converter: 'Конвертер',
        },
        header: {
            login: 'Войти / Регистрация',
            logout: 'Выйти',
            theme_light: 'Светлая тема',
            theme_dark: 'Тёмная тема',
            language: 'Язык',
        },
        currencies: {
            title: 'Курсы валют',
            amount: 'Сумма',
            base: 'Из',
            quote: 'В',
            tracked: 'Отслеживаемые',
            search: 'Поиск...',
            noData: 'Нет данных',
            track: 'Отслеживать',
            untrack: 'Удалить',
            chartFilter: 'Только с графиком',
            loginToTrack: 'Войдите, чтобы отслеживать пары',
        },
        converter: {
            title: 'Конвертер валют',
            amount: 'Сумма',
            from: 'Из',
            to: 'В',
            convert: 'Конвертировать',
            result: 'Результат',
            history: 'История последних конвертаций',
            clearHistory: 'Очистить историю',
            empty: 'История пуста',
            rate: 'Курс',
            crossRate: '(кросс-курс через USD)',
            error: 'Не удалось получить курс',
        },
        auth: {
            login: 'Вход',
            register: 'Регистрация',
            username: 'Имя пользователя',
            email: 'Email',
            password: 'Пароль',
            loginBtn: 'Войти',
            registerBtn: 'Создать аккаунт',
            switchToRegister: 'Нет аккаунта? Зарегистрироваться',
            switchToLogin: 'Уже есть аккаунт? Войти',
            close: 'Закрыть',
        },
    },
};

const en = {
    translation: {
        nav: {
            currencies: 'Currencies',
            converter: 'Converter',
        },
        header: {
            login: 'Sign in / Register',
            logout: 'Sign out',
            theme_light: 'Light theme',
            theme_dark: 'Dark theme',
            language: 'Language',
        },
        currencies: {
            title: 'Exchange rates',
            amount: 'Amount',
            base: 'From',
            quote: 'To',
            tracked: 'Tracked',
            search: 'Search...',
            noData: 'No data',
            track: 'Track',
            untrack: 'Remove',
            chartFilter: 'Only with charts',
            loginToTrack: 'Sign in to track pairs',
        },
        converter: {
            title: 'Currency converter',
            amount: 'Amount',
            from: 'From',
            to: 'To',
            convert: 'Convert',
            result: 'Result',
            history: 'Recent conversions',
            clearHistory: 'Clear history',
            empty: 'History is empty',
            rate: 'Rate',
            crossRate: '(cross-rate via USD)',
            error: 'Failed to fetch rate',
        },
        auth: {
            login: 'Sign in',
            register: 'Register',
            username: 'Username',
            email: 'Email',
            password: 'Password',
            loginBtn: 'Sign in',
            registerBtn: 'Create account',
            switchToRegister: "Don't have an account? Register",
            switchToLogin: 'Already have an account? Sign in',
            close: 'Close',
        },
    },
};

const stored = (typeof window !== 'undefined' && localStorage.getItem('financier_lang')) || 'ru';

i18n.use(initReactI18next).init({
    resources: { ru, en },
    lng: stored,
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
});

export default i18n;
