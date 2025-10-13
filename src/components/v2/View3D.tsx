import React from 'react';
import RadarChart3D from './3DRadar';

// تعریف تایپ برای Technology (کپی از RadarChart3D برای هماهنگی)
interface Technology {
    id: string;
    name: string;
    impact: number;
    timeline: number;
    sector?: string;
    trendCluster?: string;
    focusArea?: string;
    department?: string;
    supplyChainStage?: string;
    tradeChannelType?: string;
    industry?: string;
    description?: string;
}

// لیست نمونه برای تست
const sampleTechnologies: Technology[] = [
    { id: '1', name: 'AI Automation', impact: 80, timeline: 3 },
    { id: '2', name: 'Quantum Computing', impact: 60, timeline: 7 },
    { id: '3', name: 'Blockchain', impact: 40, timeline: 5 },
];

const View3D: React.FC = () => {
    // تابع نمونه برای onTechnologyClick
    const handleTechnologyClick = (tech: Technology | null) => {
        console.log('فناوری انتخاب‌شده:', tech ? tech.name : 'هیچ‌کدام');
    };

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <RadarChart3D
                technologies={sampleTechnologies}
                onTechnologyClick={handleTechnologyClick}
            />
        </div>
    );
};

export default View3D;