//@ts-nocheck
import { Technology, MenuItem } from '../lib/data';

interface ApiResponse {
    results: any[];
    summary: {
        total_technologies: number;
        high_impact: number;
        near_term: number;
    };
    filter: Record<string, string[]>; // 🔥 Generic - هر فیلدی
}

const cleanValue = (val: string) => val.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();

const mapApiToTechnology = (apiData: any[]): Technology[] => {
    return apiData.map((item) => ({
        id: parseInt(cleanValue(item.sub_filters[0])),
        name: item.title,
        impact: item.impact,
        timeline: item.time_line,
        description: item.description || null,
        sector: '',
        focusArea: '',
        subFilters: item.sub_filters
            .filter(f => !f.match(/^\d+$/))
            .map(cleanValue),
    }));
};

const mapFilterToMenuItems = (filter: Record<string, string[]>): MenuItem[] => {
    return Object.entries(filter).map(([field, values]) => ({
        key: field,
        title: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
        children: values.map((value) => ({
            key: cleanValue(value), // 🔥 key = مقدار API
            title: cleanValue(value),
        })),
    }));
};

export const fetchTechnologies = async (selectedKeys: string[]) => {
    const subfilterValue = selectedKeys.join(',');
    const queryParams = subfilterValue ? `subfilters=${encodeURIComponent(subfilterValue)}&match=all` : '';

    const response = await fetch(
        `https://techlab.studionona.ir/api/project/technologies/?${queryParams}`
    );

    if (!response.ok) throw new Error('Failed to fetch');

    const data: ApiResponse = await response.json();

    return {
        technologies: mapApiToTechnology(data.results || []),
        menuItems: mapFilterToMenuItems(data.filter), // 🔥 100% دینامیک
        summary: data.summary,
    };
};