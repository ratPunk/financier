import React from 'react';
import { LiaExchangeAltSolid } from "react-icons/lia";
import { IoClose } from "react-icons/io5";
import { FaEye } from "react-icons/fa6";
import "../css/cssComponents/currencyRecord.css";

interface TrackedCurrency {
    id: number;
    mainCurrencies: string;
    secondCurrencies: string;
}

interface CurrencyRecordProps {
    tracked: TrackedCurrency;
    onRemove: (id: number) => void;
    onSelect: (main: string, second: string) => void;
}

const CurrencyRecord: React.FC<CurrencyRecordProps> = ({
                                                           tracked,
                                                           onRemove,
                                                           onSelect
                                                       }) => {
    return (
        <div className={"currency-record"}>
            <div className={`currency-tracked-btn`}>
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
                    onClick={() => onRemove(tracked.id)}
                >
                    {React.createElement(IoClose as React.ComponentType<any>, {
                        size: 34,
                        color: "#ee4343",
                        className: "my-icon-class"
                    })}
                </button>
                <button
                    className={"eye-btn"}
                    onClick={() => onSelect(tracked.mainCurrencies, tracked.secondCurrencies)}
                >
                    {React.createElement(FaEye as React.ComponentType<any>, {
                        size: 34,
                        color: "#4361ee",
                        className: "my-icon-class"
                    })}
                </button>
            </div>
        </div>
    );
};

export default CurrencyRecord;