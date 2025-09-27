import React, { useState } from 'react';
import { RadarChart } from '../../components/radar/RadarComponent';
import { mockTechnologies } from '../../components/lib/data';
import Layout from '../../components/layout/Layout';
import { Technology } from '../../components/lib/data';

function View() {
    const [hoveredTechnology, setHoveredTechnology] = useState<Technology | null>(null);
    const [selectedTechnology, setSelectedTechnology] = useState<Technology | null>(null);

    const handleTechnologyHover = (tech: Technology | null) => {
        // console.log('Parent hover:', tech);
        setHoveredTechnology(tech);
    };

    const handleTechnologyClick = (tech: Technology | null) => {
        // console.log('Parent click:', tech);
        setSelectedTechnology(tech);
    };

    return (
        <Layout>
            <RadarChart
                technologies={mockTechnologies}
                onTechnologyHover={handleTechnologyHover}
                onTechnologyClick={handleTechnologyClick}
                selectedTechnology={selectedTechnology}
                hoveredTechnology={hoveredTechnology}
            />
        </Layout>
    );
}

export default View;