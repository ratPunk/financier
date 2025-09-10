import React, {useState} from 'react';
import {FaChartLine} from "react-icons/fa6";
import CurrenciesCode from "../ts/CurrenciesCode";

function СurrencyСolumn() {
    const [leftSearch, setLeftSearch] = useState('');
    const [mainCurrencies, setMainCurrencies] = useState<string>('USD');



    const filteredLeftCurrencies = CurrenciesCode.filter(code =>
        code.code.toLowerCase().includes(leftSearch.toLowerCase()) ||
        code.label.toLowerCase().includes(leftSearch.toLowerCase())
    );

    return (
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
                            {code.chart && React.createElement(FaChartLine as React.ComponentType<any>, {
                                size: 32,
                                color: "#4361ee",
                                className: "my-icon-class"
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default СurrencyСolumn;