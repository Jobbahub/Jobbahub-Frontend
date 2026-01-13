import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export interface ChartDataPoint {
    label: string;
    score: number; // -1, 0, 1 (1=Ja)
    id: string;
    color?: string; // Optional override
    isWeighted?: boolean; // New: indicates 2x weighting
}

interface SliceData extends ChartDataPoint {
    effectiveScore: number;
    path: string;
    color: string;
    percent: number;
}

interface ResultChartProps {
    title: string;
    data: ChartDataPoint[];
    colorTheme?: 'blue' | 'green' | 'purple' | 'orange';
}

const ResultChart: React.FC<ResultChartProps> = ({ title, data }) => {
    const { t } = useLanguage();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const activeData = useMemo(() => {
        return data
            .filter(d => d.score >= 0)
            .map(d => ({
                ...d,
                effectiveScore: d.score === 0 ? 0.5 : d.score * (d.isWeighted ? 2 : 1)
            }));
    }, [data]);

    const totalScore = useMemo(() => {
        return activeData.reduce((acc, curr) => acc + curr.effectiveScore, 0);
    }, [activeData]);

    const getThemeColors = (index: number, total: number) => {
        const hue = (index * (360 / total)) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    };

    const getCoordinatesForPercent = (percent: number): [number, number] => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    // Using reduce to avoid mutable variable during render
    const slices = useMemo(() => {
        const result = activeData.reduce<{ slices: SliceData[]; cumulative: number }>(
            (acc, slice, index) => {
                const percent = totalScore > 0 ? slice.effectiveScore / totalScore : 0;
                const [startX, startY] = getCoordinatesForPercent(acc.cumulative);
                const newCumulative = acc.cumulative + percent;
                const [endX, endY] = getCoordinatesForPercent(newCumulative);
                const largeArcFlag = percent > 0.5 ? 1 : 0;

                const pathData = activeData.length === 1
                    ? `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0`
                    : `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;

                const newSlice: SliceData = {
                    ...slice,
                    path: pathData,
                    color: slice.color || getThemeColors(index, activeData.length),
                    percent
                };

                return {
                    slices: [...acc.slices, newSlice],
                    cumulative: newCumulative
                };
            },
            { slices: [], cumulative: 0 }
        );
        return result.slices;
    }, [activeData, totalScore]);

    const renderScoreBadge = (score: number) => {
        let label = '';
        let badgeClassName = 'chart-score-badge ';

        switch (score) {
            case -1:
                label = t('Nee');
                badgeClassName += 'chart-score-negative';
                break;
            case 0:
                label = t('Neutraal');
                badgeClassName += 'chart-score-neutral';
                break;
            case 1:
                label = t('Ja');
                badgeClassName += 'chart-score-positive';
                break;
            default:
                if (score > 2) {
                    label = t('Ja');
                    badgeClassName += 'chart-score-positive';
                } else {
                    return null;
                }
        }

        return (
            <span className={badgeClassName}>
                {label}
            </span>
        );
    };

    return (
        <>
            <h3 className="result-chart-title">{title}</h3>

            <div className="chart-content">
                <div className="chart-pie-wrapper">
                    {activeData.length === 0 ? (
                        <div className="chart-no-data">
                            {data.length > 0 && data.every(d => d.score < 0)
                                ? t('alles_nee_beantwoord')
                                : t('Geen data')}
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
                                        {activeData[hoveredIndex].isWeighted && (
                                            <span className="badge badge-weighted ml-1" style={{ fontSize: '0.7rem' }}>2x</span>
                                        )}
                                        <span className="chart-tooltip-percent">
                                            {(slices[hoveredIndex].percent * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

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
                                        <span className="legend-text">{t(slice.label)}</span>
                                        {renderScoreBadge(slice.score)}
                                        {slice.isWeighted && (
                                            <span className="badge badge-weighted" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                                2x
                                            </span>
                                        )}
                                    </span>
                                    <span className="legend-percent">{(slice.percent * 100).toFixed(0)}%</span>
                                </li>
                            );
                        })}
                        {data.filter(d => d.score < 0).map(d => (
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
        </>
    );
};

export default ResultChart;
