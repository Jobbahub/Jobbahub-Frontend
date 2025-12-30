import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export interface ChartDataPoint {
    label: string;
    score: number; // 0, 1, 2
    id: string;
    color?: string; // Optional override
}

interface ResultChartProps {
    title: string;
    data: ChartDataPoint[];
    colorTheme?: 'blue' | 'green' | 'purple' | 'orange';
    className?: string;
}

const ResultChart: React.FC<ResultChartProps> = ({ title, data, className = '' }) => {
    const { t } = useLanguage();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Filter out items with 0 score for the pie chart
    const activeData = useMemo(() => {
        return data.filter(d => d.score > 0);
    }, [data]);

    const totalScore = useMemo(() => {
        return activeData.reduce((acc, curr) => acc + curr.score, 0);
    }, [activeData]);

    // Fallback internal colors if no specific color provided (Legacy support)
    const getThemeColors = (index: number, total: number) => {
        const hue = (index * (360 / total)) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    };

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    let cumulativePercent = 0;

    const slices = activeData.map((slice, index) => {
        const percent = slice.score / totalScore;

        // Starting coordinates
        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);

        // Ending coordinates
        cumulativePercent += percent;
        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

        // If the slice is more than 50%, take the large arc (the long way around)
        const largeArcFlag = percent > 0.5 ? 1 : 0;

        const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;

        return {
            ...slice,
            path: pathData,
            color: slice.color || getThemeColors(index, activeData.length),
            percent
        };
    });

    const renderScoreBadge = (score: number) => {
        let label = '';
        let className = 'chart-score-badge ';

        switch (score) {
            case 0:
                label = t('Nee');
                className += 'chart-score-negative';
                break;
            case 1:
                label = t('Neutraal');
                className += 'chart-score-neutral';
                break;
            case 2:
                label = t('Ja');
                className += 'chart-score-positive';
                break;
            default:
                return null;
        }

        return (
            <span className={className}>
                {label}
            </span>
        );
    };

    return (
        <div className={`result-chart-container ${className}`}>
            <h3 className="result-chart-title">{title}</h3>

            <div className="chart-content">

                {/* Pie SVG */}
                <div className="chart-pie-wrapper">
                    {activeData.length === 0 ? (
                        <div className="chart-no-data">
                            {t('Geen data')}
                        </div>
                    ) : (
                        <>
                            <svg viewBox="-1.2 -1.2 2.4 2.4" className="chart-svg">
                                {slices.map((slice, i) => {
                                    const isActive = hoveredIndex === i;
                                    const isDimmed = hoveredIndex !== null && !isActive;

                                    return (
                                        <path
                                            key={slice.id}
                                            d={slice.path}
                                            fill={slice.color}
                                            stroke="white"
                                            strokeWidth="0.05"
                                            onMouseEnter={() => setHoveredIndex(i)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                            className={`chart-slice ${isActive ? 'is-active' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
                                        />
                                    );
                                })}
                            </svg>

                            {/* Hover Tooltip Overlay - Centered */}
                            {hoveredIndex !== null && activeData[hoveredIndex] && (
                                <div
                                    className="chart-tooltip"
                                    style={{ border: `2px solid ${activeData[hoveredIndex].color}` }}
                                >
                                    <div className="chart-tooltip-title">
                                        {activeData[hoveredIndex].label}
                                    </div>
                                    <div className="chart-tooltip-meta">
                                        {renderScoreBadge(activeData[hoveredIndex].score)}
                                        <span className="chart-tooltip-percent">
                                            {(slices[hoveredIndex].percent * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Legend */}
                <div className="chart-legend-wrapper">
                    <ul className="chart-legend-list">
                        {slices.map((slice, i) => {
                            const isActive = hoveredIndex === i;
                            return (
                                <li
                                    key={slice.id}
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className={`chart-legend-item ${isActive ? 'is-active' : ''}`}
                                >
                                    <span
                                        className="legend-color-dot"
                                        style={{ backgroundColor: slice.color }}
                                    />
                                    <span className="legend-label-wrapper">
                                        {t(slice.label)}
                                        {renderScoreBadge(slice.score)}
                                    </span>
                                    <span className="legend-percent">{(slice.percent * 100).toFixed(0)}%</span>
                                </li>
                            );
                        })}
                        {/* Show 0 score items but grayed out */}
                        {data.filter(d => d.score === 0).map(d => (
                            <li key={d.id} className="chart-legend-item is-muted">
                                <span
                                    className="legend-color-dot"
                                    style={{ backgroundColor: '#e2e8f0' }}
                                />
                                <span className="legend-label-wrapper">
                                    {t(d.label)}
                                    {renderScoreBadge(d.score)}
                                </span>
                                <span>-</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default ResultChart;
