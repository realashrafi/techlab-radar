// تعریف تایپ برای Technology
interface Technology {
    id: string;
    name: string;
    trendCluster: string;
    department: string;
    supplyChainStage: string;
    tradeChannelType: string;
    industry: string;
    impact: number;
    timeline: number;
    sector: string;
    focusArea: string;
    description: string | null;
}

// مپ فیلترها
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
    departments_1: { field: 'department', value: 'Customer Service' },
    departments_2: { field: 'department', value: 'Transportation' },
    departments_3: { field: 'department', value: 'ITSupport' },
    departments_4: { field: 'department', value: 'Warehouse Operations' },
    supply_chain_stage_1: { field: 'supplyChainStage', value: 'First‑Mile Logistics' },
    supply_chain_stage_2: { field: 'supplyChainStage', value: 'Last‑Mile Logistics' },
    supply_chain_stage_3: { field: 'supplyChainStage', value: 'Mid‑Mile Logistics' },
    trade_channel_type_1: { field: 'tradeChannelType', value: 'Electronic Commerce (E‑commerce)' },
    trade_channel_type_2: { field: 'tradeChannelType', value: 'Mobile Commerce (M‑commerce)' },
    trade_channel_type_3: { field: 'tradeChannelType', value: 'Social Commerce' },
    trade_channel_type_4: { field: 'tradeChannelType', value: 'Fast Commerce' },
    trade_channel_type_5: { field: 'tradeChannelType', value: 'Marketplaces' },
    trade_channel_type_6: { field: 'tradeChannelType', value: 'Subscription / Service' },
    trade_channel_type_7: { field: 'tradeChannelType', value: 'Direct‑to‑Consumer (D2C) Model' },
    trade_channel_type_8: { field: 'tradeChannelType', value: 'Omni‑channel Commerce' },
    trade_channel_type_9: { field: 'tradeChannelType', value: 'Traditional Commerce (Offline)' },
    industry_1: { field: 'industry', value: 'Retail – Online & Offline' },
    industry_2: { field: 'industry', value: 'Healthcare' },
    industry_3: { field: 'industry', value: 'Pharma & Care' },
    industry_4: { field: 'industry', value: 'Food & Beverage' },
    industry_5: { field: 'industry', value: 'Mobility' },
    industry_6: { field: 'industry', value: 'Smart City & Logistics Infra' },
    industry_7: { field: 'industry', value: 'Agriculture & Agro-Supply Chain' },
    industry_8: { field: 'industry', value: 'Energy & Infrastructure' },
    industry_9: { field: 'industry', value: 'Manufacturing & Industrial Goods' },
};

// تابع برای تمیز کردن مقادیر با نقل‌قول اضافی
const cleanValue = (val: string) => val.replace(/^"|"$/g, '');

// تبدیل دیتای API به فرمت Technology
const mapApiToTechnology = (apiData: any[]): Technology[] => {
    return apiData.map((item) => ({
        id: cleanValue(item.sub_filters[0]), // فرض: اولین آیتم id است
        name: item.title,
        trendCluster: item.sub_filters.find((f: string) => keyToValueMap[f]?.field === 'trendCluster') || '',
        department: item.sub_filters.find((f: string) => keyToValueMap[f]?.field === 'department') || '',
        supplyChainStage: item.sub_filters.find((f: string) => keyToValueMap[f]?.field === 'supplyChainStage') || '',
        tradeChannelType: item.sub_filters.find((f: string) => keyToValueMap[f]?.field === 'tradeChannelType') || '',
        industry: cleanValue(item.sub_filters.find((f: string) => keyToValueMap[f]?.field === 'industry') || ''),
        impact: item.impact,
        timeline: item.time_line,
        sector: '',
        focusArea: '',
        description: item.description || null,
    }));
};

// تابع درخواست اصلی
export const fetchTechnologies = async (selectedKeys: string[]): Promise<Technology[]> => {
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
                // اگر توکن نیازه، اینجا اضافه کن:
                // 'Authorization': `Bearer ${yourToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return mapApiToTechnology(data.results || []);
    } catch (err) {
        throw new Error(`Failed to fetch technologies: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
};