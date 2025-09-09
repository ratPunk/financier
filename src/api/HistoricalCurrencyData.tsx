import axios from 'axios';

const API = axios.create({
    baseURL: `https://api.frankfurter.app/`,
});

interface HistoricalCurrencyProps {
    period: 'weekly' | 'month' | 'quarter' | 'halfYear' | 'year';
    mainCurrency: string;
    secondaryCurrency: string;
}


export const HistoricalCurrencyData = async ({period, mainCurrency, secondaryCurrency}: HistoricalCurrencyProps) => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const endDate = today.toISOString().split('T')[0];
    let startDate: string;
    switch(period) {
        case 'weekly':
            today.setDate(today.getDate() - 7);
            break;
        case 'month':
            today.setMonth(today.getMonth() - 1);
            break;
        case 'quarter':
            today.setMonth(today.getMonth() - 3);
            break;
        case 'halfYear':
            today.setMonth(today.getMonth() - 6);
            break;
        case 'year':
            today.setFullYear(today.getFullYear() - 1);
            break;
        default:
            throw new Error("Period must be one of: 'weekly', 'month', 'quarter', 'halfYear', 'year'");
    }

    startDate = today.toISOString().split('T')[0];

    const response = await API.get(`${startDate}..${endDate}`);

    const rates = response.data.rates;

    return rates;
};