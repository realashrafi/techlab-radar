//@ts-nocheck

import { Technology, MenuItem } from '../lib/data';

// Define API response structure
interface ApiResponse {
    results: any[];
    summary: {
        total_technologies: number;
        high_impact: number;
        near_term: number;
    };
    filter: {
        departments: string[];
        fakherbusinesses: string[];
        id: string[];
        industry: string[];
        supplychainstage: string[];
        techcategories: string[];
        tradechanneltype: string[];
    };
}

// Updated keyToValueMap to include all filter keys
const keyToValueMap: Record<string, { field: keyof Technology; value: string }> = {
    tech_categories_1: { field: 'trendCluster', value: 'AI' },
    tech_categories_2: { field: 'trendCluster', value: 'Data & Analytics' },
    tech_categories_3: { field: 'trendCluster', value: 'IoT & Sensing' },
    tech_categories_4: { field: 'trendCluster', value: 'Next Generation Packaging' },
    tech_categories_5: { field: 'trendCluster', value: 'Automation & Robotics' },
    tech_categories_6: { field: 'trendCluster', value: 'Digital Infrastructure & Connectivity' },
    tech_categories_7: { field: 'trendCluster', value: 'IoT & Sensing' },
    tech_categories_8: { field: 'trendCluster', value: 'Blockchain & Security' },
    tech_categories_9: { field: 'trendCluster', value: 'Mixed Reality (AR/VR/MR)' },
    tech_categories_10: { field: 'trendCluster', value: 'Energy & Sustainability' },
    tech_categories_11: { field: 'trendCluster', value: 'Autonomous Transport & Delivery' },
    tech_categories_12: { field: 'trendCluster', value: 'IOT' }, // Added for IOT
    departments_1: { field: 'department', value: 'Customer Service' },
    departments_2: { field: 'department', value: 'Transportation' },
    departments_3: { field: 'department', value: 'ITSupport' },
    departments_4: { field: 'department', value: 'Warehouse Operations' },
    supply_chain_stage_1: { field: 'supplyChainStage', value: 'First-Mile Logistics' },
    supply_chain_stage_2: { field: 'supplyChainStage', value: 'Last-Mile Logistics' },
    supply_chain_stage_3: { field: 'supplyChainStage', value: 'Mid-Mile Logistics' },
    trade_channel_type_1: { field: 'tradeChannelType', value: 'Electronic Commerce (E-commerce)' },
    trade_channel_type_2: { field: 'tradeChannelType', value: 'Mobile Commerce (M-commerce)' },
    trade_channel_type_3: { field: 'tradeChannelType', value: 'Social Commerce' },
    trade_channel_type_4: { field: 'tradeChannelType', value: 'Fast Commerce' },
    trade_channel_type_5: { field: 'tradeChannelType', value: 'Marketplaces' },
    trade_channel_type_6: { field: 'tradeChannelType', value: 'Subscription / Service' },
    trade_channel_type_7: { field: 'tradeChannelType', value: 'Direct-to-Consumer (D2C) Model' },
    trade_channel_type_8: { field: 'tradeChannelType', value: 'Omni-channel Commerce' },
    trade_channel_type_9: { field: 'tradeChannelType', value: 'Traditional Commerce (Offline)' },
    industry_1: { field: 'industry', value: 'Retail - Online & Offline' },
    industry_2: { field: 'industry', value: 'Healthcare' },
    industry_3: { field: 'industry', value: 'Pharma & Care' },
    industry_4: { field: 'industry', value: 'Food & Beverage' },
    industry_5: { field: 'industry', value: 'Mobility' },
    industry_6: { field: 'industry', value: 'Smart City & Logistics Infra' },
    industry_7: { field: 'industry', value: 'Agriculture & Agro-Supply Chain' },
    industry_8: { field: 'industry', value: 'Energy & Infrastructure' },
    industry_9: { field: 'industry', value: 'Manufacturing & Industrial Goods' },
    fakher_business_1: { field: 'industry', value: 'Nona - Ariel' },
    fakher_business_2: { field: 'industry', value: 'Nona - halazoon' },
    fakher_business_3: { field: 'industry', value: 'Nona - Porsit' },
    fakher_business_4: { field: 'industry', value: 'Nona - Risheh' },
    fakher_business_5: { field: 'industry', value: 'Nona - Shahro' },
    fakher_business_6: { field: 'industry', value: 'Nona - Zboom' },
    fakher_business_7: { field: 'industry', value: 'Temco' },
};

// Clean values with extra quotes
const cleanValue = (val: string) => val.replace(/^"|"$/g, '').replace(/^'|'$/g, '');

// Map API data to Technology
const mapApiToTechnology = (apiData: any[]): Technology[] => {
    return apiData.map((item) => ({
        id: cleanValue(item.sub_filters[0]),
        name: item.title,
        trendCluster: cleanValue(item.sub_filters.find((f: string) => keyToValueMap[f]?.field === 'trendCluster') || ''),
        department: cleanValue(item.sub_filters.find((f: string) => keyToValueMap[f]?.field === 'department') || ''),
        supplyChainStage: cleanValue(item.sub_filters.find((f: string) => keyToValueMap[f]?.field === 'supplyChainStage') || ''),
        tradeChannelType: cleanValue(item.sub_filters.find((f: string) => keyToValueMap[f]?.field === 'tradeChannelType') || ''),
        industry: cleanValue(item.sub_filters.find((f: string) => keyToValueMap[f]?.field === 'industry') || ''),
        impact: item.impact,
        timeline: item.time_line,
        sector: '',
        focusArea: '',
        description: item.description || null,
    }));
};

// Map filter to MenuItem
const mapFilterToMenuItems = (filter: ApiResponse['filter']): MenuItem[] => {
    return [
        {
            key: 'techcategories',
            title: 'Technology Categories',
            children: filter.techcategories.map((value, index) => ({
                key: `tech_categories_${index + 1}`,
                title: cleanValue(value),
            })),
        },
        {
            key: 'departments',
            title: 'Departments',
            children: filter.departments.map((value, index) => ({
                key: `departments_${index + 1}`,
                title: cleanValue(value),
            })),
        },
        {
            key: 'supplychainstage',
            title: 'Supply Chain Stage',
            children: filter.supplychainstage.map((value, index) => ({
                key: `supply_chain_stage_${index + 1}`,
                title: cleanValue(value),
            })),
        },
        {
            key: 'tradechanneltype',
            title: 'Trade Channel Type',
            children: filter.tradechanneltype.map((value, index) => ({
                key: `trade_channel_type_${index + 1}`,
                title: cleanValue(value),
            })),
        },
        {
            key: 'industry',
            title: 'Industry',
            children: filter.industry.map((value, index) => ({
                key: `industry_${index + 1}`,
                title: cleanValue(value),
            })),
        },
        {
            key: 'fakherbusinesses',
            title: 'Fakher Businesses',
            children: filter.fakherbusinesses.map((value, index) => ({
                key: `fakher_business_${index + 1}`,
                title: cleanValue(value),
            })),
        },
    ];
};

// Main fetch function
export const fetchTechnologies = async (selectedKeys: string[]): Promise<{
    technologies: Technology[];
    menuItems: MenuItem[];
    summary: ApiResponse['summary'];
}> => {
    try {
        const queryParams = selectedKeys
            .map((key) => {
                const mapping = keyToValueMap[key];
                if (!mapping) return '';
                return `${mapping.field}=${encodeURIComponent(mapping.value)}`;
            })
            .filter(Boolean)
            .join('&');

        const response = await fetch(`http://45.149.76.129/api/project/technologies/?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add token if needed:
                // 'Authorization': `Bearer ${yourToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        return {
            technologies: mapApiToTechnology(data.results || []),
            menuItems: mapFilterToMenuItems(data.filter),
            summary: data.summary,
        };
    } catch (err) {
        throw new Error(`Error fetching technologies: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
};