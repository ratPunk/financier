import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrency, getSupportedCurrencies } from '../api/CurrenciesAPI';
import CurrenciesCode from '../ts/CurrenciesCode';
import { LiaExchangeAltSolid } from 'react-icons/lia';
import '../css/cssPages/converter.css';

interface HistoryEntry {
    id: string;
    from: string;
    to: string;
    amount: number;
    result: number;
    rate: number;
    cross: boolean;
    at: string;
}

const HISTORY_KEY = 'financier_converter_history';
const MAX_HISTORY = 15;

function loadHistory(): HistoryEntry[] {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveHistory(items: HistoryEntry[]) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
}

const Converter: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [from, setFrom] = useState('USD');
    const [to, setTo] = useState('EUR');
    const [amount, setAmount] = useState<string>('100');
    const [result, setResult] = useState<number | null>(null);
    const [rate, setRate] = useState<number | null>(null);
    const [usedCross, setUsedCross] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
    const [supported, setSupported] = useState<Set<string>>(new Set());

    useEffect(() => {
        getSupportedCurrencies().then((codes) => setSupported(new Set(codes)));
    }, []);

    const options = useMemo(() => {
        const list = supported.size > 0
            ? CurrenciesCode.filter((c) => supported.has(c.code))
            : CurrenciesCode;
        return list;
    }, [supported]);

    const computeRate = useCallback(async (a: string, b: string): Promise<{ rate: number; cross: boolean }> => {
        // Try direct
        try {
            const rates = await getCurrency(a);
            if (rates && typeof rates[b] === 'number') {
                return { rate: rates[b], cross: false };
            }
        } catch { /* ignore, try cross */ }
        // Cross via USD
        const usdRates = await getCurrency('USD');
        if (!usdRates || typeof usdRates[a] !== 'number' || typeof usdRates[b] !== 'number') {
            throw new Error('No rates');
        }
        const r = usdRates[b] / usdRates[a];
        return { rate: r, cross: true };
    }, []);

    const onConvert = useCallback(async () => {
        const amt = parseFloat(amount.replace(',', '.'));
        if (!isFinite(amt) || amt < 0) {
            setError(t('converter.error'));
            return;
        }
        if (from === to) {
            setRate(1);
            setUsedCross(false);
            setResult(amt);
            setError(null);
            const entry: HistoryEntry = {
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                from, to, amount: amt, result: amt, rate: 1, cross: false,
                at: new Date().toISOString(),
            };
            const next = [entry, ...history].slice(0, MAX_HISTORY);
            setHistory(next);
            saveHistory(next);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { rate: r, cross } = await computeRate(from, to);
            const res = amt * r;
            setRate(r);
            setUsedCross(cross);
            setResult(res);
            const entry: HistoryEntry = {
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                from, to, amount: amt, result: res, rate: r, cross,
                at: new Date().toISOString(),
            };
            const next = [entry, ...history].slice(0, MAX_HISTORY);
            setHistory(next);
            saveHistory(next);
        } catch (e) {
            setError(t('converter.error'));
        } finally {
            setLoading(false);
        }
    }, [amount, from, to, computeRate, history, t]);

    const swap = () => {
        setFrom(to);
        setTo(from);
    };

    const clearHistory = () => {
        setHistory([]);
        saveHistory([]);
    };

    const formatNumber = (n: number) => new Intl.NumberFormat(i18n.language, {
        maximumFractionDigits: 6,
    }).format(n);

    return (
        <div id="Converter">
            <div className="converter-card">
                <h1>{t('converter.title')}</h1>

                <div className="converter-form">
                    <div className="field">
                        <label>{t('converter.amount')}</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="0"
                            step="any"
                            aria-label={t('converter.amount')}
                        />
                    </div>

                    <div className="pair-row">
                        <div className="field">
                            <label>{t('converter.from')}</label>
                            <select value={from} onChange={(e) => setFrom(e.target.value)} aria-label={t('converter.from')}>
                                {options.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.code} — {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="button" className="swap" onClick={swap} aria-label="swap">
                            {React.createElement(LiaExchangeAltSolid as React.ComponentType<any>, { size: 26 })}
                        </button>
                        <div className="field">
                            <label>{t('converter.to')}</label>
                            <select value={to} onChange={(e) => setTo(e.target.value)} aria-label={t('converter.to')}>
                                {options.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.code} — {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button className="action-btn" onClick={onConvert} disabled={loading}>
                        {loading ? '...' : t('converter.convert')}
                    </button>

                    {error && <div className="conv-error">{error}</div>}

                    {result !== null && rate !== null && !error && (
                        <div className="conv-result">
                            <div className="result-main">
                                {formatNumber(parseFloat(amount.replace(',', '.')) || 0)} {from} ={' '}
                                <strong>{formatNumber(result)}</strong> {to}
                            </div>
                            <div className="result-rate">
                                {t('converter.rate')}: 1 {from} = {formatNumber(rate)} {to}{' '}
                                {usedCross && <span className="cross-note">{t('converter.crossRate')}</span>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="converter-card">
                <div className="history-head">
                    <h2>{t('converter.history')}</h2>
                    {history.length > 0 && (
                        <button className="ghost-btn" onClick={clearHistory}>
                            {t('converter.clearHistory')}
                        </button>
                    )}
                </div>
                {history.length === 0 ? (
                    <p className="empty">{t('converter.empty')}</p>
                ) : (
                    <ul className="history-list">
                        {history.map((h) => (
                            <li key={h.id} className="history-item">
                                <span className="hist-pair">
                                    {formatNumber(h.amount)} {h.from} → {formatNumber(h.result)} {h.to}
                                </span>
                                <span className="hist-meta">
                                    {new Date(h.at).toLocaleString(i18n.language)}{' '}
                                    {h.cross && <em>·×</em>}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Converter;
