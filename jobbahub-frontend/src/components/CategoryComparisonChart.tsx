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

    return (
        <div className="category-comparison-chart mt-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-700 mb-0 uppercase tracking-wide">{t('Module Focus')}</h4>
                <p className="text-[10px] text-slate-500 mt-1">
                    {t("Bekijk hoeveel aandacht deze module besteedt aan de verschillende onderwerpen.")}
                </p>
            </div>

            <table className="w-full text-xs border-collapse table-fixed">
                <thead>
                    <tr className="text-[10px] text-slate-500 font-semibold text-left border-b border-slate-200">
                        <th className="pb-2 font-semibold text-left" style={{ width: '50%' }}>{t('Categorie')}</th>
                        <th className="pb-2 font-semibold text-left" style={{ width: '50%', paddingLeft: '12px' }}>{t('Percentage')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {comparisonData.map((item) => (
                        <tr key={item.key} className="hover:bg-slate-100 transition-colors">
                            {/* Label */}
                            <td className="py-2.5 pr-2 align-middle text-slate-700 font-medium truncate" title={item.label}>
                                {item.label}
                            </td>

                            {/* Module Bar with Dynamic Color */}
                            <td className="py-2.5 align-middle" style={{ paddingLeft: '12px' }}>
                                <div className="flex items-center w-full">
                                    {/* Bar Container */}
                                    <div
                                        className="flex-grow rounded-full overflow-hidden relative mr-3 bg-white shadow-inner"
                                        style={{
                                            height: '12px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #cbd5e1'
                                        }}
                                        title={`${(item.moduleScore * 100).toFixed(0)}% focus`}
                                    >
                                        {/* Filled Bar */}
                                        <div
                                            style={{
                                                width: `${Math.max(item.moduleScore * 100, 5)}%`,
                                                height: '100%',
                                                backgroundColor: getModuleBarColor(item.moduleScore),
                                                borderRadius: '9999px',
                                                display: 'block',
                                                transition: 'width 0.5s ease-out, background-color 0.3s ease'
                                            }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 w-8 text-right">
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
