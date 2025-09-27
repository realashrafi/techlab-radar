//@ts-nocheck
import React from 'react';
import { FaDownload, FaFileCsv, FaFileCode, FaFileImage } from 'react-icons/fa';
import { Technology } from '../lib/data';

interface CustomExportControlsProps {
    technologies: Technology[];
}

export function CustomExportControls({ technologies }: CustomExportControlsProps) {
    const exportToCSV = () => {
        const headers = ['Name', 'Sector', 'Trend Cluster', 'Focus Area', 'Impact', 'Timeline', 'Department', 'Supply Chain Stage', 'Trade Channel Type', 'Industry'];
        const csvContent = [
            headers.join(','),
            ...technologies.map((tech) =>
                [
                    `"${tech.name}"`,
                    `"${tech.sector}"`,
                    `"${tech.trendCluster}"`,
                    `"${tech.focusArea}"`,
                    tech.impact,
                    tech.timeline,
                    `"${tech.department}"`,
                    `"${tech.supplyChainStage}"`,
                    `"${tech.tradeChannelType}"`,
                    `"${tech.industry}"`,
                ].join(','),
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'radar-data.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportToJSON = () => {
        const jsonContent = JSON.stringify(technologies, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'radar-data.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportChart = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = 'radar-chart.png';
            a.click();
        }
    };

    return (
        <div className="relative">
            <button
                className="bg-[#F67242] hover:bg-[#F67242]/80 text-white font-bold py-2 px-4 rounded flex items-center"
                onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle('hidden')}
                aria-label="Open export menu"
            >
                <FaDownload className="w-4 h-4 mr-4" />
                Download
            </button>
            <div className="hidden absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button
                    onClick={exportToCSV}
                    className="flex items-center w-full px-4 py-2 text-sm text-[#2E2E2E] hover:bg-gray-50"
                >
                    <FaFileCsv className="w-4 h-4 mr-2" />
                    Export as CSV
                </button>
                <button
                    onClick={exportToJSON}
                    className="flex items-center w-full px-4 py-2 text-sm text-[#2E2E2E] hover:bg-gray-50"
                >
                    <FaFileCode className="w-4 h-4 mr-2" />
                    Export as JSON
                </button>
                <button
                    onClick={exportChart}
                    className="flex items-center w-full px-4 py-2 text-sm text-[#2E2E2E] hover:bg-gray-50"
                >
                    <FaFileImage className="w-4 h-4 mr-2" />
                    Export Chart as PNG
                </button>
            </div>
        </div>
    );
}