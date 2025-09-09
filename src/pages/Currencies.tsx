import React, {useEffect, useState} from 'react';
import {getCurrency} from '../api/CurrenciesAPI';
import CurrenciesCode from "../ts/CurrenciesCode";
import "../css/cssPages/currencies.css";
import {LiaExchangeAltSolid} from "react-icons/lia";
import {FaChartLine, FaEye} from "react-icons/fa6";
import {IoClose} from "react-icons/io5";

interface trackedCurrenciesObject {
    id: number;
    mainCurrencies: string;
    secondCurrencies: string;
}

function Currencies() {
    const [mainCurrencies, setMainCurrencies] = useState('USD');
    const [secondCurrencies, setSecondCurrencies] = useState('USD');
    const [rates, setRates] = useState<any>();
    const [leftSearch, setLeftSearch] = useState('');
    const [rightSearch, setRightSearch] = useState('');
    const [mainCurrenciesQuantity, setMainCurrenciesQuantity] = useState<any>();
    const [trackedCurrencies, setTrackedCurrencies] = useState<trackedCurrenciesObject[]>([]);

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

    const filteredLeftCurrencies = CurrenciesCode.filter(code =>
        code.code.toLowerCase().includes(leftSearch.toLowerCase()) ||
        code.label.toLowerCase().includes(leftSearch.toLowerCase())
    );

    const filteredRightCurrencies = CurrenciesCode.filter(code =>
        code.code.toLowerCase().includes(rightSearch.toLowerCase()) ||
        code.label.toLowerCase().includes(rightSearch.toLowerCase())
    );

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
            // Проверяем, есть ли уже такая пара
            const exists = prev.some(
                item =>
                    item.mainCurrencies === mainCurrencies &&
                    item.secondCurrencies === secondCurrencies
            );

            if (exists) {
                console.log('Такая пара уже отслеживается');
                return prev; // Не добавляем
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

    useEffect(() => {
        if (trackedCurrencies.length > 6) {
            setTrackedCurrencies(prev => prev.slice(1))
        }
    }, [trackedCurrencies]);

    return (
        <div id={"Currencies"}>
            <div className={"main-container"}>
            <div className={"currencies-main"}>
                <div className={"currency-column main-currency-column"}>
                    <p>Основная валюта</p>
                    <input
                        type="text"
                        placeholder="Поиск валюты..."
                        value={leftSearch}
                        onChange={(e) => setLeftSearch(e.target.value)}
                        className="currency-search"
                    />
                    <div className={"currency-code-select"}>
                        {filteredLeftCurrencies.map((code) => (
                            <div
                                key={code.code}
                                onClick={() => {
                                    setMainCurrencies(code.code);
                                    console.log(mainCurrencies);
                                }}
                                className={`currency-btn ${mainCurrencies === code.code ? 'active' : ''}`}
                            >
                                <span className={"currency-code-and-name"}>
                                <span>{code.code}</span>
                                <span>{code.label}</span>
                                    </span>
                                <div>
                                {React.createElement(FaChartLine as React.ComponentType<any>, {
                                    size: 34,
                                    color: "black",
                                    className: "my-icon-class"
                                })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={"currency-info"}>
                    <div className={"main-currency"}>
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
                    <div className={"currency-button"}>
                        <button className={"action-btn"} onClick={handleClick}>Отслеживать</button>
                    </div>
                </div>

                <div className={"currency-column second-currency-column"}>
                    <p>Сравнительная валюта валюта</p>
                    <input
                        type="text"
                        placeholder="Поиск валюты..."
                        value={rightSearch}
                        onChange={(e) => setRightSearch(e.target.value)}
                        className="currency-search"
                    />
                    <div className={"currency-code-select"}>
                        {filteredRightCurrencies.map((code) => (
                            <div
                                key={code.code}
                                onClick={() => {
                                    setSecondCurrencies(code.code);
                                    console.log(secondCurrencies);
                                }}
                                className={`currency-btn ${secondCurrencies === code.code ? 'active' : ''}`}
                            >
                               <span className={"currency-code-and-name"}>
                                <span>{code.code}</span>
                                <span>{code.label}</span>
                                    </span>
                                <div>
                                    {React.createElement(FaChartLine as React.ComponentType<any>, {
                                        size: 34,
                                        color: "black",
                                        className: "my-icon-class"
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
                        <div className={"currency-record"}>
                            <div
                                key={tracked.mainCurrencies}
                                onClick={() => {

                                }}
                                className={`currency-tracked-btn`}
                            >
                                <span>{tracked.mainCurrencies}</span>
                                {React.createElement(LiaExchangeAltSolid as React.ComponentType<any>, {
                                    size: 34,
                                    color: "black",
                                    className: "my-icon-class"
                                })}
                                <span>{tracked.secondCurrencies}</span>
                            </div>
                            <div className={`currency-tracked-btn-actions`}>
                                <button
                                    className={"close-btn"}
                                    onClick={() => {
                                        setTrackedCurrencies(
                                            trackedCurrencies.filter(item => item.id !== tracked.id)
                                        );
                                    }}
                                >
                                    {React.createElement(IoClose as React.ComponentType<any>, {
                                        size: 34,
                                        color: "#ee4343",
                                        className: "my-icon-class"
                                    })}
                                </button>
                                <button
                                    className={"eye-btn"}
                                    onClick={() => {
                                        setMainCurrencies(tracked.mainCurrencies);
                                        setSecondCurrencies(tracked.secondCurrencies);
                                    }}>
                                    {React.createElement(FaEye as React.ComponentType<any>, {
                                        size: 34,
                                        color: "#4361ee",
                                        className: "my-icon-class"
                                    })}
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
            </div>
        </div>
    );
}

export default Currencies;