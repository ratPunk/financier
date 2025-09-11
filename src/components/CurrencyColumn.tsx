import React from 'react';
import { FaChartLine } from "react-icons/fa6";
import "../css/cssComponents/currencyColumn.css";

interface CurrencyCode {
    code: string;
    label: string;
    chart?: boolean;
}

interface CurrencyColumnProps {
    title: string;
    currencies: CurrencyCode[];
    searchValue: string;
    onSearchChange: (value: string) => void;
    selectedCurrency: string;
    onCurrencySelect: (code: string) => void;
    chartVisible: boolean;
    onChartToggle: () => void;
}

const CurrencyColumn: React.FC<CurrencyColumnProps> = ({
                                                           title,
                                                           currencies,
                                                           searchValue,
                                                           onSearchChange,
                                                           selectedCurrency,
                                                           onCurrencySelect,
                                                           chartVisible,
                                                           onChartToggle
                                                       }) => {
    return (
        <div className={"currency-column"}>
            <p>{title}</p>
            <div className={"filters-currency-column"}>
                <input
                    type="text"
                    placeholder="Поиск валюты..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="currency-search"
                />
                <button
                    onClick={onChartToggle}
                    className={chartVisible ? 'chart-visible' : ''}
                >
                    {React.createElement(FaChartLine as React.ComponentType<any>, {
                        size: 28,
                        color: chartVisible ? "#4361ee" : "#6c757d",
                        className: "chart-icon"
                    })}
                </button>
            </div>
            <div className={"currency-code-select"}>
                {currencies.map((code) => (
                    <div
                        key={code.code}
                        onClick={() => onCurrencySelect(code.code)}
                        className={`currency-btn ${selectedCurrency === code.code ? 'active' : ''}`}
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
};

export default CurrencyColumn;