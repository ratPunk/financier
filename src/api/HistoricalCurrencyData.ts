import axios from 'axios';

const API = axios.create({
    baseURL: `https://api.frankfurter.app/`,
});

export interface HistoricalCurrencyProps {
    period: '1W' | '1M' | '3M' | '6M' | '1Y';
    mainCurrency: string;
    secondaryCurrency: string;
}

export interface RateData {
    [date: string]: {
        [currency: string]: number;
    };
}

export interface ApiResponse {
    amount: number;
    base: string;
    start_date: string;
    end_date: string;
    rates: RateData;
}

export const HistoricalCurrencyData = async ({
                                                 period,
                                                 mainCurrency,
                                                 secondaryCurrency
                                             }: HistoricalCurrencyProps): Promise<RateData> => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const endDate = today.toISOString().split('T')[0];
    let startDate: string;

    switch(period) {
        case '1W':
            today.setDate(today.getDate() - 7);
            break;
        case '1M':
            today.setMonth(today.getMonth() - 1);
            break;
        case '3M':
            today.setMonth(today.getMonth() - 3);
            break;
        case '6M':
            today.setMonth(today.getMonth() - 6);
            break;
        case '1Y':
            today.setFullYear(today.getFullYear() - 1);
            break;
        default:
            throw new Error("Invalid period");
    }

    startDate = today.toISOString().split('T')[0];

    try {
        const response = await API.get<ApiResponse>(
            `${startDate}..${endDate}?from=${mainCurrency}&to=${secondaryCurrency}`
        );
        return response.data.rates;
    } catch (error) {
        console.error('Error fetching currency data:', error);
        throw new Error('Failed to fetch currency data');
    }
};