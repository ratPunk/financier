import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, Time, AreaSeries, AreaData } from 'lightweight-charts';
import { HistoricalCurrencyData, RateData } from '../api/HistoricalCurrencyData';
import '../css/cssComponents/сurrencyChartWithRange.css';

interface CurrencyChartProps {
    mainCurrency: string;
    secondaryCurrency: string;
}

const CurrencyChartWithRange: React.FC<CurrencyChartProps> = ({
                                                                  mainCurrency,
                                                                  secondaryCurrency
                                                              }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [selectedRange, setSelectedRange] = useState<string>('1W');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);

    const ranges = ['1W', '1M', '3M', '6M', '1Y'];
    const rangeLabels = ['1Н', '1M', '3M', '6M', '1Г'];

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
    const loadChartData = async (range: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const rates = await HistoricalCurrencyData({
                period: range as '1W' | '1M' | '3M' | '6M' | '1Y',
                mainCurrency,
                secondaryCurrency
            });

            const chartData = convertRatesToChartData(rates);

            if (seriesRef.current && chartRef.current) {
                seriesRef.current.setData(chartData);
                chartRef.current.timeScale().fitContent();
                setSelectedRange(range);
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

        // Очищаем предыдущий график
        if (chartRef.current) {
            chartRef.current.remove();
        }

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#f8f9fa' },
                textColor: '#131722',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
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
        loadChartData(selectedRange);

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, []);

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

            {/* Состояние загрузки/ошибки */}
            {isLoading && (
                <div className="loading-state">
                    Загрузка данных...
                </div>
            )}

            {error && (
                <div className="error-state">
                    {error}
                </div>
            )}

            {/* Chart Container */}
            <div
                ref={chartContainerRef}
                className="chart-container"
            />
        </div>
    );
};

export default CurrencyChartWithRange;