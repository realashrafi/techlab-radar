import React, {useState} from 'react';
import RadarChart3D from './3DRadar'; // مسیر فایل کامپوننت 3D
import {Technology} from '../lib/data';
import Layout from "../layout/Layout"; // تایپ Technology رو از همون جا ایمپورت کنید (یا کپی کنید)

const View3D: React.FC = () => {
    const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
    const [hoveredTech, setHoveredTech] = useState<Technology | null>(null);

    const handleTechnologyClick = (tech: Technology | null) => {
        setSelectedTech(tech);
        console.log('فناوری انتخاب‌شده:', tech ? tech.name : 'هیچ‌کدام');
        // اینجا می‌تونید modal خارجی یا کار دیگه‌ای انجام بدید
    };

    const handleTechnologyHover = (tech: Technology | null) => {
        setHoveredTech(tech);
        console.log('فناوری hover:', tech ? tech.name : 'هیچ‌کدام');
    };

    return (
        <Layout>
            <div style={{height: '100vh', width: '100%'}}>
                <RadarChart3D
                    onTechnologyClick={handleTechnologyClick}
                    onTechnologyHover={handleTechnologyHover}
                    selectedTechnology={selectedTech}
                    hoveredTechnology={hoveredTech}
                    needleEnabled={true} // اختیاری: فعال/غیرفعال کردن انیمیشن سوزن
                />
            </div>
        </Layout>
    );
};

export default View3D;