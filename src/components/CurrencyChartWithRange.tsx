import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createChart, ColorType, Time, AreaSeries, AreaData } from 'lightweight-charts';
import { HistoricalCurrencyData, RateData } from '../api/HistoricalCurrencyData';
import { useTheme } from '../theme/ThemeContext';
import '../css/cssComponents/сurrencyChartWithRange.css';

interface CurrencyChartProps {
    mainCurrency: string;
    secondaryCurrency: string;
}

const CurrencyChartWithRange: React.FC<CurrencyChartProps> = ({
                                                                  mainCurrency,
                                                                  secondaryCurrency
                                                              }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [selectedRange, setSelectedRange] = useState<string>('1W');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);

    const ranges = ['1W', '1M', '3M', '6M'];
    const rangeLabels = ['1Н', '1M', '3M', '6M'];

    // Преобразование данных из API в формат для графика
    const convertRatesToChartData = (rates: RateData): AreaData<Time>[] => {
        return Object.entries(rates)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, currencies]) => ({
                time: (new Date(date).getTime() / 1000) as Time,
                value: currencies[secondaryCurrency]
            }));
    };

    // Загрузка данных для выбранного периода
    const loadChartData = async (range: string, chart?: any, series?: any) => {
        const targetChart = chart || chartRef.current;
        const targetSeries = series || seriesRef.current;
        setIsLoading(true);
        setError(null);

        try {
            const rates = await HistoricalCurrencyData({
                period: range as '1W' | '1M' | '3M' | '6M',
                mainCurrency,
                secondaryCurrency
            });

            const chartData = convertRatesToChartData(rates);

            // Проверяем, что график всё ещё актуален (не был пересоздан/уничтожен)
            if (targetSeries && targetChart && targetChart === chartRef.current) {
                try {
                    targetSeries.setData(chartData);
                    targetChart.timeScale().fitContent();
                    setSelectedRange(range);
                } catch (e) {
                    // график был уничтожен между проверкой и вызовом — игнорируем
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
        } finally {
            setIsLoading(false);
        }
    };

    // Эффект для инициализации графика
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const isDark = theme === 'dark';
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: isDark ? '#243049' : '#f8f9fa' },
                textColor: isDark ? '#e2e8f0' : '#131722',
            },
            grid: {
                vertLines: { color: isDark ? 'rgba(226,232,240,0.08)' : 'rgba(42, 46, 57, 0.2)' },
                horzLines: { color: isDark ? 'rgba(226,232,240,0.08)' : 'rgba(42, 46, 57, 0.2)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            autoSize: true,
            width: chartContainerRef.current.clientWidth,
            height: 400,
        });

        const series = chart.addSeries(AreaSeries, {
            lineColor: '#2962FF',
            topColor: '#2962FF',
            bottomColor: 'rgba(41, 98, 255, 0.28)',
            lineWidth: 2,
        });

        chartRef.current = chart;
        seriesRef.current = series;

        // Загружаем начальные данные
        loadChartData(selectedRange, chart, series);

        const resizeObserver = new ResizeObserver(entries => {
            if (!chartContainerRef.current || chartRef.current !== chart) return;
            const { width } = entries[0].contentRect;
            try {
                chart.applyOptions({ width });
            } catch (e) {
                // chart disposed
            }
        });
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            try {
                chart.remove();
            } catch (e) {
                // already disposed
            }
            if (chartRef.current === chart) {
                chartRef.current = null;
                seriesRef.current = null;
            }
        };
    }, [theme]);

    // Эффект для обновления данных при изменении валют
    useEffect(() => {
        if (mainCurrency && secondaryCurrency && seriesRef.current) {
            loadChartData(selectedRange);
        }
    }, [mainCurrency, secondaryCurrency]);

    const handleRangeChange = (range: string) => {
        loadChartData(range);
    };

    return (
        <div className="currency-chart-container">
            {/* Заголовок */}
            <div className="currency-chart-title">
                <h3>
                    {mainCurrency}/{secondaryCurrency}
                </h3>
            </div>

            {/* Range Switcher */}
            <div className="range-switcher">
                {ranges.map((range, index) => (
                    <button
                        key={range}
                        onClick={() => handleRangeChange(range)}
                        disabled={isLoading}
                        className={`range-button ${selectedRange === range ? 'active' : ''}`}
                    >
                        {rangeLabels[index]}
                    </button>
                ))}
            </div>

            {error && (
                <div className="error-state">
                    {error}
                </div>
            )}

            {/* Chart Container */}
            <div className="chart-wrapper">
                <div
                    ref={chartContainerRef}
                    className="chart-container"
                />
                {isLoading && (
                    <div className="chart-loading-overlay">
                        <div className="loader"></div>
                        <span>{t('currencies.noData')}...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrencyChartWithRange;