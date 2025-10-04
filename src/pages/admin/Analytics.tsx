//@ts-nocheck
import React from 'react';
import { FiTrendingUp, FiClock, FiTarget, FiZap } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {mockTechnologies} from "../../components/lib/data";


// Calculate real data from mockTechnologies
const totalTechnologies = mockTechnologies.length;

// Tech Categories distribution
const techCategoriesData = mockTechnologies.reduce(
    (acc, tech) => {
        const existing = acc.find((item) => item.name === tech.trendCluster);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: tech.trendCluster, value: 1 });
        }
        return acc;
    },
    [] as { name: string; value: number }[],
);

// Add colors to tech categories
const techCategoriesWithColors = techCategoriesData.map((item, index) => ({
    ...item,
    color: ['#005BBB', '#4A90E2', '#17A398', '#F15A22', '#62D4E8', '#A3F7FF', '#1D7A8C', '#FFA17F'][index % 8],
}));

// Timeline distribution
const timelineData = [
    {
        timeline: '0-2 years',
        count: mockTechnologies.filter((t) => t.timeline <= 2).length,
        impact:
            Math.round(
                mockTechnologies.filter((t) => t.timeline <= 2).reduce((sum, t) => sum + t.impact, 0) /
                mockTechnologies.filter((t) => t.timeline <= 2).length,
            ) || 0,
    },
    {
        timeline: '2-4 years',
        count: mockTechnologies.filter((t) => t.timeline > 2 && t.timeline <= 4).length,
        impact:
            Math.round(
                mockTechnologies.filter((t) => t.timeline > 2 && t.timeline <= 4).reduce((sum, t) => sum + t.impact, 0) /
                mockTechnologies.filter((t) => t.timeline > 2 && t.timeline <= 4).length,
            ) || 0,
    },
    {
        timeline: '4-6 years',
        count: mockTechnologies.filter((t) => t.timeline > 4 && t.timeline <= 6).length,
        impact:
            Math.round(
                mockTechnologies.filter((t) => t.timeline > 4 && t.timeline <= 6).reduce((sum, t) => sum + t.impact, 0) /
                mockTechnologies.filter((t) => t.timeline > 4 && t.timeline <= 6).length,
            ) || 0,
    },
    {
        timeline: '6-8 years',
        count: mockTechnologies.filter((t) => t.timeline > 6 && t.timeline <= 8).length,
        impact:
            Math.round(
                mockTechnologies.filter((t) => t.timeline > 6 && t.timeline <= 8).reduce((sum, t) => sum + t.impact, 0) /
                mockTechnologies.filter((t) => t.timeline > 6 && t.timeline <= 8).length,
            ) || 0,
    },
    {
        timeline: '8-10 years',
        count: mockTechnologies.filter((t) => t.timeline > 8).length,
        impact:
            Math.round(
                mockTechnologies.filter((t) => t.timeline > 8).reduce((sum, t) => sum + t.impact, 0) /
                mockTechnologies.filter((t) => t.timeline > 8).length,
            ) || 0,
    },
];

// Department distribution
const departmentData = mockTechnologies.reduce(
    (acc, tech) => {
        const existing = acc.find((item) => item.department === tech.department);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ department: tech.department, count: 1 });
        }
        return acc;
    },
    [] as { department: string; count: number }[],
);

// Calculate percentages for departments
const departmentWithPercentages = departmentData
    .map((item) => ({
        ...item,
        percentage: Math.round((item.count / totalTechnologies) * 100),
    }))
    .sort((a, b) => b.count - a.count);

// Impact categories
const highImpact = mockTechnologies.filter((t) => t.impact >= 80).length;
const mediumImpact = mockTechnologies.filter((t) => t.impact >= 50 && t.impact < 80).length;
const lowImpact = mockTechnologies.filter((t) => t.impact < 50).length;

// Timeline categories
const nearTerm = mockTechnologies.filter((t) => t.timeline <= 2).length;
const mediumTerm = mockTechnologies.filter((t) => t.timeline > 2 && t.timeline <= 5).length;
const longTerm = mockTechnologies.filter((t) => t.timeline > 5).length;

// Average calculations
const avgImpact = Math.round((mockTechnologies.reduce((sum, t) => sum + t.impact, 0) / totalTechnologies) * 10) / 10;
const avgTimeline = Math.round((mockTechnologies.reduce((sum, t) => sum + t.timeline, 0) / totalTechnologies) * 10) / 10;

// Supply Chain Stage distribution
const supplyChainData = mockTechnologies.reduce(
    (acc, tech) => {
        const existing = acc.find((item) => item.stage === tech.supplyChainStage);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ stage: tech.supplyChainStage, count: 1 });
        }
        return acc;
    },
    [] as { stage: string; count: number }[],
);

// Industry distribution
const industryData = mockTechnologies.reduce(
    (acc, tech) => {
        const existing = acc.find((item) => item.industry === tech.industry);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ industry: tech.industry, count: 1 });
        }
        return acc;
    },
    [] as { industry: string; count: number }[],
);

function AnalyticsDashboard() {
    return (
        <div className="space-y-6 p-4 max-w-7xl mx-auto">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 flex items-center justify-between border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Avg Impact Score</h3>
                        <FiTrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="p-4">
                        <div className="text-2xl font-bold text-gray-900">{avgImpact}%</div>
                        <p className="text-xs text-teal-600">Based on {totalTechnologies} technologies</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 flex items-center justify-between border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Avg Timeline</h3>
                        <FiClock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="p-4">
                        <div className="text-2xl font-bold text-gray-900">{avgTimeline} yrs</div>
                        <p className="text-xs text-blue-500">Average implementation time</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 flex items-center justify-between border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">High Impact</h3>
                        <FiTarget className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="p-4">
                        <div className="text-2xl font-bold text-gray-900">{highImpact}</div>
                        <p className="text-xs text-red-500">{Math.round((highImpact / totalTechnologies) * 100)}% of total</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 flex items-center justify-between border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total Technologies</h3>
                        <FiZap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="p-4">
                        <div className="text-2xl font-bold text-gray-900">{totalTechnologies}</div>
                        <p className="text-xs text-teal-600">Active in radar</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Technologies by Tech Categories</h3>
                    </div>
                    <div className="p-4">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={techCategoriesWithColors}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {techCategoriesWithColors.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Timeline Distribution</h3>
                    </div>
                    <div className="p-4">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timelineData}>
                                    <XAxis dataKey="timeline" />
                                    <YAxis />
                                    <tooltip />
                                    <Bar dataKey="count" fill="#005BBB" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm lg:col-span-2">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Supply Chain Stage Distribution</h3>
                    </div>
                    <div className="p-4">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={supplyChainData}>
                                    <XAxis dataKey="stage" />
                                    <YAxis />
                                    <tooltip />
                                    <Bar dataKey="count" fill="#17A398" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {departmentWithPercentages.map((dept, index) => (
                            <div key={dept.department}>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-900">{dept.department}</span>
                                    <span className="text-sm font-medium text-gray-900">{dept.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            index === 0
                                                ? 'bg-blue-500'
                                                : index === 1
                                                    ? 'bg-teal-600'
                                                    : index === 2
                                                        ? 'bg-red-500'
                                                        : 'bg-blue-600'
                                        }`}
                                        style={{ width: `${dept.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Impact Categories</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-teal-600">{highImpact}</div>
                            <div className="text-sm text-gray-500">High Impact (80-100%)</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-500">{mediumImpact}</div>
                            <div className="text-sm text-gray-500">Medium Impact (50-79%)</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-500">{lowImpact}</div>
                            <div className="text-sm text-gray-500">Low Impact (0-49%)</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Implementation Timeline</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-teal-600">{nearTerm}</div>
                            <div className="text-sm text-gray-500">Near Term (0-2 years)</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-500">{mediumTerm}</div>
                            <div className="text-sm text-gray-500">Medium Term (3-5 years)</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-500">{longTerm}</div>
                            <div className="text-sm text-gray-500">Long Term (6-10 years)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Industry Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Industry Distribution</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {industryData
                            .sort((a, b) => b.count - a.count)
                            .map((industry, index) => (
                                <div key={industry.industry} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-900 flex-1">{industry.industry}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    index === 0
                                                        ? 'bg-blue-600'
                                                        : index === 1
                                                            ? 'bg-blue-500'
                                                            : index === 2
                                                                ? 'bg-teal-600'
                                                                : index === 3
                                                                    ? 'bg-red-500'
                                                                    : 'bg-gray-400'
                                                }`}
                                                style={{ width: `${(industry.count / totalTechnologies) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 w-8">{industry.count}</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                            <div className="text-sm font-medium text-teal-700">Most Popular Category</div>
                            <div className="text-sm text-gray-900">
                                {techCategoriesWithColors.sort((a, b) => b.value - a.value)[0]?.name} (
                                {techCategoriesWithColors.sort((a, b) => b.value - a.value)[0]?.value} technologies)
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm font-medium text-blue-700">Primary Department</div>
                            <div className="text-sm text-gray-900">
                                {departmentWithPercentages[0]?.department} ({departmentWithPercentages[0]?.percentage}% of
                                technologies)
                            </div>
                        </div>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-sm font-medium text-red-700">Implementation Focus</div>
                            <div className="text-sm text-gray-900">
                                {nearTerm > mediumTerm ? 'Near-term focused' : 'Long-term strategic'} ({nearTerm} near-term vs{' '}
                                {longTerm} long-term)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsDashboard;