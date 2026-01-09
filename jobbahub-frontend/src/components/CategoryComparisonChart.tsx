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
            const type = topic ? topic.type : 'unknown'; // interest, value, goal

            return {
                key: catKey,
                label,
                type,
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

    const getUserBarConfig = (score: number) => {
        // Score is -1, 0, or 1
        switch (score) {
            case 1: // High interest
                return { width: '100%', color: '#22c55e', text: t('Hoge interesse') };
            case 0: // Neutral
                return { width: '50%', color: '#eab308', text: t('Gemiddelde interesse') };
            case -1: // Low/No interest
            default:
                return { width: '20%', color: '#94a3b8', text: t('Lage interesse') };
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'interest': return t('interests_label');
            case 'value': return t('values_label');
            case 'goal': return t('goals_label');
            default: return '';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'interest': return '#3b82f6'; // Blue
            case 'value': return '#10b981'; // Green
            case 'goal': return '#a855f7'; // Purple
            default: return '#64748b'; // Slate
        }
    };

    const [hoveredLabel, setHoveredLabel] = React.useState<string | null>(null);

    return (
        <div className="module-focus-container">
            <div className="module-focus-header">
                <h4>{t('Module Focus')}</h4>
                <p>
                    {t("Vergelijk de focus van de module met jouw eigen interesse-niveau.")}
                </p>
            </div>

            <table className="module-focus-table">
                <thead>
                    <tr>
                        <th className="module-focus-th module-focus-col-cat">{t('Categorie')}</th>
                        <th className="module-focus-th module-focus-col-pct">{t('Module Focus')}</th>
                        <th className="module-focus-th module-focus-col-pct">{t('Jouw Interesse')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {comparisonData.map((item) => {
                        const userConfig = getUserBarConfig(item.userRawScore);

                        return (
                            <tr key={item.key} className="module-focus-tr">
                                {/* Label with Custom Tooltip */}
                                <td
                                    className="module-focus-label"
                                    onMouseEnter={() => setHoveredLabel(item.label)}
                                    onMouseLeave={() => setHoveredLabel(null)}
                                >
                                    <div className="flex flex-col">
                                        <span className="module-focus-label-text">
                                            {item.label}
                                        </span>
                                        {/* Type Badge */}
                                        <span
                                            style={{
                                                backgroundColor: getTypeColor(item.type) + '20', // 20% opacity background
                                                color: getTypeColor(item.type),
                                                fontSize: '0.7rem',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                width: 'fit-content',
                                                fontWeight: 600,
                                                marginTop: '2px'
                                            }}
                                        >
                                            {getTypeLabel(item.type)}
                                        </span>
                                    </div>
                                    {hoveredLabel === item.label && (
                                        <div className="custom-tooltip">
                                            {item.label}
                                        </div>
                                    )}
                                </td>

                                {/* Module Focus Bar */}
                                <td className="module-focus-bar-cell">
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center w-full">
                                            <div
                                                className="module-focus-bar-track"
                                                title={`${(item.moduleScore * 100).toFixed(0)}% focus`}
                                            >
                                                <div
                                                    className="module-focus-bar-fill"
                                                    style={{
                                                        width: `${Math.max(item.moduleScore * 100, 5)}%`,
                                                        backgroundColor: getModuleBarColor(item.moduleScore)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500 mt-1">
                                            {(item.moduleScore * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </td>

                                {/* USER Interest Bar */}
                                <td className="module-focus-bar-cell">
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center w-full">
                                            <div
                                                className="module-focus-bar-track"
                                                title={userConfig.text}
                                            >
                                                <div
                                                    className="module-focus-bar-fill"
                                                    style={{
                                                        width: userConfig.width,
                                                        backgroundColor: userConfig.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500 mt-1">
                                            {userConfig.text}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryComparisonChart;
