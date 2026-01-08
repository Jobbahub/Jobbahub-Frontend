import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TOPICS } from '../data/constants';

interface CategoryComparisonChartProps {
    moduleScores: Record<string, number>;
    userAnswers: any; // Using any for VragenlijstData to avoid circular imports or strict coupling
    limit?: number;
}

const CategoryComparisonChart: React.FC<CategoryComparisonChartProps> = ({
    moduleScores,
    userAnswers,
    limit = 3
}) => {
    const { t } = useLanguage();

    const comparisonData = useMemo(() => {
        if (!userAnswers || !userAnswers.knoppen_input) return [];

        const relevantCategories = Object.entries(moduleScores)
            .filter(([, val]) => val > 0.1)
            .sort(([, valA], [, valB]) => valB - valA)
            .slice(0, limit);

        return relevantCategories.map(([catKey, moduleScore]) => {
            const userCategoryData = userAnswers.knoppen_input[catKey];
            const userRawScore = userCategoryData ? userCategoryData.score : 0; // -1, 0, 1

            const topic = TOPICS.find(t => t.id === catKey);
            const label = topic ? t(topic.label) : catKey;

            return {
                key: catKey,
                label,
                moduleScore, // 0-1 float
                userRawScore // -1, 0, 1 integer
            };
        });
    }, [moduleScores, userAnswers, t, limit]);

    if (comparisonData.length === 0) return null;

    const getModuleBarColor = (score: number) => {
        const percentage = score * 100;
        if (percentage >= 70) return '#22c55e'; // Green-500
        if (percentage >= 40) return '#eab308'; // Yellow-500
        return '#ef4444'; // Red-500
    };

    const [hoveredLabel, setHoveredLabel] = React.useState<string | null>(null);

    return (
        <div className="module-focus-container">
            <div className="module-focus-header">
                <h4>{t('Module Focus')}</h4>
                <p>
                    {t("Bekijk hoeveel aandacht deze module besteedt aan de verschillende onderwerpen.")}
                </p>
            </div>

            <table className="module-focus-table">
                <thead>
                    <tr>
                        <th className="module-focus-th module-focus-col-cat">{t('Categorie')}</th>
                        <th className="module-focus-th module-focus-col-pct">{t('Percentage')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {comparisonData.map((item) => (
                        <tr key={item.key} className="module-focus-tr">
                            {/* Label with Custom Tooltip */}
                            <td
                                className="module-focus-label"
                                onMouseEnter={() => setHoveredLabel(item.label)}
                                onMouseLeave={() => setHoveredLabel(null)}
                            >
                                <span className="module-focus-label-text">
                                    {item.label}
                                </span>
                                {hoveredLabel === item.label && (
                                    <div className="custom-tooltip">
                                        {item.label}
                                    </div>
                                )}
                            </td>

                            {/* Module Bar with Dynamic Color */}
                            <td className="module-focus-bar-cell">
                                <div className="flex items-center w-full">
                                    {/* Bar Container */}
                                    <div
                                        className="module-focus-bar-track"
                                        title={`${(item.moduleScore * 100).toFixed(0)}% focus`}
                                    >
                                        {/* Filled Bar */}
                                        <div
                                            className="module-focus-bar-fill"
                                            style={{
                                                width: `${Math.max(item.moduleScore * 100, 5)}%`,
                                                backgroundColor: getModuleBarColor(item.moduleScore)
                                            }}
                                        />
                                    </div>
                                    <span className="module-focus-text">
                                        {(item.moduleScore * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryComparisonChart;
