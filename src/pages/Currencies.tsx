import React, {useEffect, useMemo, useState} from 'react';
import { useTranslation } from 'react-i18next';
import {getCurrency, getSupportedCurrencies} from '../api/CurrenciesAPI';
import CurrenciesCode from "../ts/CurrenciesCode";
import "../css/cssPages/currencies.css";
import {LiaExchangeAltSolid} from "react-icons/lia";
import CurrencyChartWithRange from '../components/CurrencyChartWithRange';
import CurrencyColumn from '../components/CurrencyColumn';
import CurrencyRecord from '../components/CurrencyRecord';
import { useAuth } from '../auth/AuthContext';
import { TrackedAPI } from '../api/AuthAPI';

interface trackedCurrenciesObject {
    id: number;
    mainCurrencies: string;
    secondCurrencies: string;
}

function Currencies() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [mainCurrencies, setMainCurrencies] = useState<string>('USD');
    const [secondCurrencies, setSecondCurrencies] = useState<string>('EUR');
    const [rates, setRates] = useState<any>();
    const [leftSearch, setLeftSearch] = useState('');
    const [rightSearch, setRightSearch] = useState('');
    const [mainCurrenciesQuantity, setMainCurrenciesQuantity] = useState<any>();
    const [trackedCurrencies, setTrackedCurrencies] = useState<trackedCurrenciesObject[]>([]);
    const [chartVisibleLeft, setChartVisibleLeft] = useState<boolean>(false);
    const [chartVisibleRight, setChartVisibleRight] = useState<boolean>(false);
    const [chartSupportedCodes, setChartSupportedCodes] = useState<Set<string>>(new Set());
    const [trackError, setTrackError] = useState<string | null>(null);

    // Load tracked pairs from server when user logs in; clear on logout
    useEffect(() => {
        let cancelled = false;
        if (!user) {
            setTrackedCurrencies([]);
            return;
        }
        (async () => {
            try {
                const items = await TrackedAPI.list();
                if (!cancelled) setTrackedCurrencies(items);
            } catch (e) {
                console.error('Failed to load tracked currencies', e);
            }
        })();
        return () => { cancelled = true; };
    }, [user]);

    useEffect(() => {
        let cancelled = false;
        getSupportedCurrencies().then((codes) => {
            if (cancelled) return;
            setChartSupportedCodes(new Set(codes));
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const currenciesWithChartFlag = useMemo(() => {
        if (chartSupportedCodes.size === 0) {
            return CurrenciesCode;
        }
        return CurrenciesCode.map((c) => ({
            ...c,
            chart: chartSupportedCodes.has(c.code),
        }));
    }, [chartSupportedCodes]);

    useEffect(() => {
        const loadRates = async () => {
            try {
                const data = await getCurrency(mainCurrencies);
                setRates(data);
                if (data && data[mainCurrencies] !== undefined) {
                    setMainCurrenciesQuantity((prev: any) =>
                        prev === undefined || prev === '' ? data[mainCurrencies] : prev
                    );
                }
            } catch (error) {
                console.error('Не удалось загрузить курсы:', error);
                setRates(null);
            }
        };

        loadRates();
    }, [mainCurrencies]);

    const filteredLeftCurrencies = useMemo(() => {
        const search = leftSearch.toLowerCase();
        return currenciesWithChartFlag.filter(code => {
            const matchesSearch =
                code.code.toLowerCase().includes(search) ||
                code.label.toLowerCase().includes(search);

            if (chartVisibleLeft) {
                return code.chart && matchesSearch;
            }
            return matchesSearch;
        });
    }, [currenciesWithChartFlag, leftSearch, chartVisibleLeft]);

    const filteredRightCurrencies = useMemo(() => {
        const search = rightSearch.toLowerCase();
        return currenciesWithChartFlag.filter(code => {
            const matchesSearch =
                code.code.toLowerCase().includes(search) ||
                code.label.toLowerCase().includes(search);

            if (chartVisibleRight) {
                return code.chart && matchesSearch;
            }
            return matchesSearch;
        });
    }, [currenciesWithChartFlag, rightSearch, chartVisibleRight]);

    const handleChange = (e: any) => {
        const value = e.target.value;
        if (value === '') {
            setMainCurrenciesQuantity('');
        } else {
            const num = Number(value);
            if (!isNaN(num)) {
                setMainCurrenciesQuantity(num);
            }
        }
    };

    const handleClickExchange = () => {
        const temp = mainCurrencies;
        setMainCurrencies(secondCurrencies);
        setSecondCurrencies(temp);
    };

    const handleClick = async (e: any) => {
        e.preventDefault();
        setTrackError(null);

        if (!user) {
            setTrackError(t('currencies.loginToTrack'));
            return;
        }
        if (mainCurrencies === secondCurrencies) {
            setTrackError(t('currencies.loginToTrack'));
            return;
        }

        const exists = trackedCurrencies.some(
            item =>
                item.mainCurrencies === mainCurrencies &&
                item.secondCurrencies === secondCurrencies
        );
        if (exists) return;

        try {
            const item = await TrackedAPI.add(mainCurrencies, secondCurrencies);
            setTrackedCurrencies(prev => [
                ...prev.filter(p => !(p.mainCurrencies === item.mainCurrencies && p.secondCurrencies === item.secondCurrencies)),
                item,
            ]);
        } catch (err: any) {
            setTrackError(err?.message || 'Не удалось сохранить пару');
        }
    };

    const handleRemoveTracked = async (id: number) => {
        const prev = trackedCurrencies;
        setTrackedCurrencies(prev.filter(item => item.id !== id));
        if (user) {
            try {
                await TrackedAPI.remove(id);
            } catch (err) {
                console.error('Failed to remove tracked', err);
                setTrackedCurrencies(prev); // rollback
            }
        }
    };

    const handleSelectTracked = (main: string, second: string) => {
        setMainCurrencies(main);
        setSecondCurrencies(second);
    };


    return (
        <div id={"Currencies"}>
            <div className={"main-container"}>
                <div className={"currencies-main"}>

                    <CurrencyColumn
                        title={t('currencies.base')}
                        currencies={filteredLeftCurrencies}
                        searchValue={leftSearch}
                        onSearchChange={setLeftSearch}
                        selectedCurrency={mainCurrencies}
                        onCurrencySelect={setMainCurrencies}
                        chartVisible={chartVisibleLeft}
                        onChartToggle={() => setChartVisibleLeft(!chartVisibleLeft)}
                        propsClassName={"main-currency-column"}
                    />

                    <div className={"currency-info"}>
                        <div className={"main-currency-info"}>
                            {rates ?
                                <div>
                                    <p>{mainCurrencies}</p>
                                    <input
                                        type="text"
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                        onChange={handleChange}
                                        value={mainCurrenciesQuantity}
                                        aria-label={t('currencies.amount')}
                                    />
                                </div>
                                : <p>{t('currencies.noData')}</p>}
                            <div className={"exchange"} onClick={handleClickExchange}>
                                {React.createElement(LiaExchangeAltSolid as React.ComponentType<any>, {
                                    size: 32,
                                    color: "#4361ee",
                                    className: "my-icon-class"
                                })}
                            </div>
                            {rates ?
                                <div>
                                    <p>{secondCurrencies}</p>
                                    <input
                                        type="text"
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                        disabled
                                        value={mainCurrenciesQuantity ? (mainCurrenciesQuantity * rates?.[secondCurrencies]).toFixed(2) : ""}
                                        aria-label={t('currencies.amount')}
                                    />
                                </div>
                                : <p>{t('currencies.noData')}</p>}
                        </div>
                        <div className={"currency-chart-historical-data"}>
                            <CurrencyChartWithRange
                                mainCurrency={mainCurrencies}
                                secondaryCurrency={secondCurrencies}
                            />
                        </div>
                        <div className={"currency-button"}>
                            <button
                                className={"action-btn"}
                                onClick={handleClick}
                                disabled={!user}
                                title={!user ? t('currencies.loginToTrack') : ''}
                            >
                                {user ? t('currencies.track') : t('currencies.loginToTrack')}
                            </button>
                            {trackError && <div style={{ color: '#b91c1c', marginTop: 8, fontSize: 13 }}>{trackError}</div>}
                        </div>
                    </div>

                    <CurrencyColumn
                        title={t('currencies.quote')}
                        currencies={filteredRightCurrencies}
                        searchValue={rightSearch}
                        onSearchChange={setRightSearch}
                        selectedCurrency={secondCurrencies}
                        onCurrencySelect={setSecondCurrencies}
                        chartVisible={chartVisibleRight}
                        onChartToggle={() => setChartVisibleRight(!chartVisibleRight)}
                        propsClassName={"second-currency-column"}
                    />

                </div>

                <div className={"currency-tracked-column"}>
                    {trackedCurrencies
                        .filter((tracked, index, self) =>
                                index === self.findIndex(t =>
                                    t.mainCurrencies === tracked.mainCurrencies &&
                                    t.secondCurrencies === tracked.secondCurrencies
                                )
                        )
                        .sort((a, b) => b.id - a.id)
                        .map((tracked) => (
                            <CurrencyRecord
                                key={tracked.id}
                                tracked={tracked}
                                onRemove={handleRemoveTracked}
                                onSelect={handleSelectTracked}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}

export default Currencies;