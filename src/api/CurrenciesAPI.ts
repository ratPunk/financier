import axios from 'axios';

const API_KEY = process.env.REACT_APP_EXCHANGERATE_API_KEY;

const API = axios.create({
    baseURL: `https://v6.exchangerate-api.com/v6/${API_KEY}`,
});


export const getCurrency = async (baseCurrency: string) => {
    const response = await API.get(`/latest/${baseCurrency}`);

    const rates = response.data.conversion_rates;

    return rates;
};