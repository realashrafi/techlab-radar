import React from 'react';
import {RadarChart} from "../../components/radar/RadarComponent";
import {mockTechnologies} from "../../components/lib/data";
import Layout from "../../components/layout/Layout";

function View() {
    return (
        <Layout>
            <RadarChart technologies={mockTechnologies} onTechnologyHover={() => {
            }} onTechnologyClick={() => {
            }} selectedTechnology={null} hoveredTechnology={null}/>
        </Layout>
    );
}

export default View;