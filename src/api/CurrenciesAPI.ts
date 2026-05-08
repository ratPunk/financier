import axios from 'axios';

const API_KEY = 'fxr_live_fbdba870dbfcb4bc02e8bba0f286ecdd7e99';

const API = axios.create({
    baseURL: `https://api.fxratesapi.com`,
    headers: {
        Authorization: `Bearer ${API_KEY}`,
    },
});

export const getCurrency = async (baseCurrency: string) => {
    const response = await API.get(`/latest`, {
        params: {
            base: baseCurrency,
        },
    });

    return response.data.rates;
};

let supportedCurrenciesPromise: Promise<string[]> | null = null;

export const getSupportedCurrencies = (): Promise<string[]> => {
    if (supportedCurrenciesPromise) {
        return supportedCurrenciesPromise;
    }

    supportedCurrenciesPromise = API.get(`/currencies`)
        .then((response) => {
            const data = response.data;
            // API возвращает объект вида { USD: { code: 'USD', ... }, EUR: {...}, ... }
            if (data && typeof data === 'object') {
                return Object.keys(data);
            }
            return [];
        })
        .catch((error) => {
            console.error('Не удалось загрузить список поддерживаемых валют:', error);
            // сбрасываем кеш, чтобы можно было попробовать ещё раз позже
            supportedCurrenciesPromise = null;
            return [];
        });

    return supportedCurrenciesPromise;
};
