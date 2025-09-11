import React, {useEffect, useState} from 'react';
import {getCurrency} from '../api/CurrenciesAPI';
import CurrenciesCode from "../ts/CurrenciesCode";
import "../css/cssPages/currencies.css";
import {LiaExchangeAltSolid} from "react-icons/lia";
import {FaChartLine, FaEye} from "react-icons/fa6";
import {IoClose} from "react-icons/io5";
import CurrencyChartWithRange from '../components/CurrencyChartWithRange';
import CurrencyColumn from '../components/CurrencyColumn';
import CurrencyRecord from '../components/CurrencyRecord';

interface trackedCurrenciesObject {
    id: number;
    mainCurrencies: string;
    secondCurrencies: string;
}

function Currencies() {
    const [mainCurrencies, setMainCurrencies] = useState<string>('USD');
    const [secondCurrencies, setSecondCurrencies] = useState<string>('EUR');
    const [rates, setRates] = useState<any>();
    const [leftSearch, setLeftSearch] = useState('');
    const [rightSearch, setRightSearch] = useState('');
    const [mainCurrenciesQuantity, setMainCurrenciesQuantity] = useState<any>();
    const [trackedCurrencies, setTrackedCurrencies] = useState<trackedCurrenciesObject[]>([]);
    const [chartVisibleLeft, setChartVisibleLeft] = useState<boolean>(false);
    const [chartVisibleRight, setChartVisibleRight] = useState<boolean>(false);

    useEffect(() => {
        const loadRates = async () => {
            try {
                const data = await getCurrency(mainCurrencies);
                setRates(data);
                console.log(rates);
                rates && setMainCurrenciesQuantity(rates[mainCurrencies]);
            } catch (error) {
                console.error('Не удалось загрузить курсы:', error);
                setRates(null);
            }
        };

        loadRates();
    }, [mainCurrencies]);

    const filteredLeftCurrencies = CurrenciesCode.filter(code => {
        const matchesSearch =
            code.code.toLowerCase().includes(leftSearch.toLowerCase()) ||
            code.label.toLowerCase().includes(leftSearch.toLowerCase());

        const hasChart = code.chart;

        if (chartVisibleLeft) {
            return hasChart && matchesSearch;
        }

        return matchesSearch;
    });

    const filteredRightCurrencies = CurrenciesCode.filter(code => {
        const matchesSearch =
            code.code.toLowerCase().includes(rightSearch.toLowerCase()) ||
            code.label.toLowerCase().includes(rightSearch.toLowerCase());

        const hasChart = code.chart;

        if (chartVisibleRight) {
            return hasChart && matchesSearch;
        }

        return matchesSearch;
    });

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

    const handleClick = (e: any) => {
        e.preventDefault();

        setTrackedCurrencies((prev) => {
            const exists = prev.some(
                item =>
                    item.mainCurrencies === mainCurrencies &&
                    item.secondCurrencies === secondCurrencies
            );

            if (exists) {
                console.log('Такая пара уже отслеживается');
                return prev;
            }

            return [
                ...prev,
                {
                    id: Date.now(),
                    mainCurrencies,
                    secondCurrencies,
                },
            ];
        });
    };

    const handleRemoveTracked = (id: number) => {
        setTrackedCurrencies(trackedCurrencies.filter(item => item.id !== id));
    };

    const handleSelectTracked = (main: string, second: string) => {
        setMainCurrencies(main);
        setSecondCurrencies(second);
    };

    useEffect(() => {
        if (trackedCurrencies.length > 6) {
            setTrackedCurrencies(prev => prev.slice(1))
        }
    }, [trackedCurrencies]);

    return (
        <div id={"Currencies"}>
            <div className={"main-container"}>
                <div className={"currencies-main"}>

                    <CurrencyColumn
                        title="Основная валюта"
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
                                    />
                                </div>
                                : <p>Выберете основную валюту</p>}
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
                                    />
                                </div>
                                : <p>Выберете сравнительную валюту</p>}
                        </div>
                        <div className={"currency-chart-historical-data"}>
                            <CurrencyChartWithRange
                                mainCurrency={mainCurrencies}
                                secondaryCurrency={secondCurrencies}
                            />
                        </div>
                        <div className={"currency-button"}>
                            <button className={"action-btn"} onClick={handleClick}>Отслеживать</button>
                        </div>
                    </div>

                    <CurrencyColumn
                        title="Сравнительная валюта"
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