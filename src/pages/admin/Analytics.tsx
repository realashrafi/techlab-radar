//@ts-nocheck
import React, { useState } from 'react';
import { FiTrendingUp, FiClock, FiTarget, FiZap } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Mock data with added hierarchy for demonstration (using '/' in trendCluster)
const mockTechnologies = [
    {
        "id": "1",
        "name": "AI Chatbots",
        "sector": "Technology",
        "trendCluster": "AI/Chatbots",
        "focusArea": "Customer Engagement",
        "impact": 81.2,
        "timeline": 2.0,
        "department": "Customer Service",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Electronic Commerce (E‑commerce)",
        "industry": "Retail – Online & Offline",
        "description": "AI-powered chatbots for automated customer service and engagement."
    },
    {
        "id": "2",
        "name": "Geographic Information Systems (GIS)",
        "sector": "Technology",
        "trendCluster": "Data & Analytics/GIS",
        "focusArea": "Logistics Optimization",
        "impact": 55.8,
        "timeline": 2.0,
        "department": "Transportation",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Systems for capturing, analyzing, and visualizing geographic data to optimize logistics."
    },
    {
        "id": "3",
        "name": "Audio AI",
        "sector": "Technology",
        "trendCluster": "AI/Audio AI",
        "focusArea": "Customer Engagement",
        "impact": 81.6,
        "timeline": 3.0,
        "department": "Customer Service",
        "supplyChainStage": "Last‑Mile Logistics",
        "tradeChannelType": "Electronic Commerce (E‑commerce)",
        "industry": "Retail – Online & Offline",
        "description": "AI-driven audio processing for enhanced customer interactions and voice-based services."
    },
    {
        "id": "4",
        "name": "Advanced Analytics",
        "sector": "Technology",
        "trendCluster": "Data & Analytics/Advanced Analytics",
        "focusArea": "Data Insights",
        "impact": 75.5,
        "timeline": 3.0,
        "department": "ITSupport",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Advanced data analytics for predictive insights and operational efficiency."
    },
    {
        "id": "5",
        "name": "RFID Technology",
        "sector": "Technology",
        "trendCluster": "IoT & Sensing",
        "focusArea": "Logistics Optimization",
        "impact": 64.5,
        "timeline": 3.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Radio-frequency identification for tracking and managing inventory."
    },
    {
        "id": "6",
        "name": "Sensors",
        "sector": "Technology",
        "trendCluster": "IoT & Sensing",
        "focusArea": "Logistics Optimization",
        "impact": 58.0,
        "timeline": 3.0,
        "department": "Transportation",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "IoT sensors for real-time monitoring of assets and environmental conditions."
    },
    {
        "id": "7",
        "name": "Gen AI",
        "sector": "Technology",
        "trendCluster": "AI/Gen AI",
        "focusArea": "Automation & Efficiency",
        "impact": 81.6,
        "timeline": 4.0,
        "department": "ITSupport",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Electronic Commerce (E‑commerce)",
        "industry": "Retail – Online & Offline",
        "description": "Generative AI for creating content, optimizing processes, and enhancing services."
    },
    {
        "id": "8",
        "name": "IoT (Platforms & Devices)",
        "sector": "Technology",
        "trendCluster": "IoT & Sensing",
        "focusArea": "Logistics Optimization",
        "impact": 74.0,
        "timeline": 4.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "IoT platforms and devices for connected logistics and operations."
    },
    {
        "id": "9",
        "name": "Biometric Systems",
        "sector": "Technology",
        "trendCluster": "IoT & Sensing",
        "focusArea": "Security & Tracking",
        "impact": 52.7,
        "timeline": 4.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Biometric technologies for secure identification and access control."
    },
    {
        "id": "10",
        "name": "Space Optimization",
        "sector": "Technology",
        "trendCluster": "Next Generation Packaging",
        "focusArea": "Logistics Optimization",
        "impact": 70.2,
        "timeline": 4.5,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Technologies for optimizing storage and transportation space."
    },
    {
        "id": "11",
        "name": "Smart Printables",
        "sector": "Technology",
        "trendCluster": "Next Generation Packaging",
        "focusArea": "Logistics Optimization",
        "impact": 58.2,
        "timeline": 5.7,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Smart packaging solutions with embedded sensors or tracking capabilities."
    },
    {
        "id": "12",
        "name": "Computer Vision",
        "sector": "Technology",
        "trendCluster": "Data & Analytics/Computer Vision",
        "focusArea": "Automation & Efficiency",
        "impact": 73.2,
        "timeline": 5.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "AI-powered visual analysis for inventory and quality control."
    },
    {
        "id": "13",
        "name": "Robots (Mobile & Stationary)",
        "sector": "Technology",
        "trendCluster": "Automation & Robotics",
        "focusArea": "Automation & Efficiency",
        "impact": 64.1,
        "timeline": 5.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Omni‑channel Commerce",
        "industry": "Healthcare, Pharma & Care",
        "description": "Robotic systems for automating warehouse and logistics tasks."
    },
    {
        "id": "14",
        "name": "Remote Operations",
        "sector": "Technology",
        "trendCluster": "Automation & Robotics",
        "focusArea": "Automation & Efficiency",
        "impact": 61.0,
        "timeline": 5.3,
        "department": "Transportation",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Electronic Commerce (E‑commerce)",
        "industry": "Retail – Online & Offline",
        "description": "Technologies enabling remote control and monitoring of operations."
    },
    {
        "id": "15",
        "name": "Wearable Devices/Sensors",
        "sector": "Technology",
        "trendCluster": "IoT & Sensing",
        "focusArea": "Logistics Optimization",
        "impact": 60.0,
        "timeline": 4.5,
        "department": "Warehouse Operations",
        "supplyChainStage": "Mid‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Wearable IoT devices for real-time tracking and worker efficiency."
    },
    {
        "id": "16",
        "name": "Edge Computing",
        "sector": "Technology",
        "trendCluster": "Digital Infrastructure & Connectivity",
        "focusArea": "Automation & Efficiency",
        "impact": 56.2,
        "timeline": 5.0,
        "department": "ITSupport",
        "supplyChainStage": "Mid‑Mile Logistics",
        "tradeChannelType": "Electronic Commerce (E‑commerce)",
        "industry": "Retail – Online & Offline",
        "description": "Distributed computing for processing data closer to its source."
    },
    {
        "id": "17",
        "name": "Blockchain",
        "sector": "Technology",
        "trendCluster": "Blockchain & Security",
        "focusArea": "Security & Tracking",
        "impact": 68.7,
        "timeline": 6.0,
        "department": "Transportation",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Electronic Commerce (E‑commerce)",
        "industry": "Retail – Online & Offline",
        "description": "Decentralized ledger for secure and transparent supply chain tracking."
    },
    {
        "id": "18",
        "name": "Extended Reality (AR)",
        "sector": "Technology",
        "trendCluster": "Mixed Reality (AR/VR/MR)",
        "focusArea": "Automation & Efficiency",
        "impact": 64.5,
        "timeline": 2.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Augmented reality for enhanced training and operational visualization."
    },
    {
        "id": "19",
        "name": "Extended Reality (VR)",
        "sector": "Technology",
        "trendCluster": "Mixed Reality (AR/VR/MR)",
        "focusArea": "Automation & Efficiency",
        "impact": 64.5,
        "timeline": 4.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Virtual reality for immersive training and simulation."
    },
    {
        "id": "20",
        "name": "Extended Reality (MR)",
        "sector": "Technology",
        "trendCluster": "Mixed Reality (AR/VR/MR)",
        "focusArea": "Automation & Efficiency",
        "impact": 64.5,
        "timeline": 7.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "Mid‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Mixed reality for combining physical and digital environments in operations."
    },
    {
        "id": "21",
        "name": "Next Generation Connectivity (5G & 6G)",
        "sector": "Technology",
        "trendCluster": "Digital Infrastructure & Connectivity",
        "focusArea": "Automation & Efficiency",
        "impact": 62.9,
        "timeline": 6.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Electronic Commerce (E‑commerce)",
        "industry": "Retail – Online & Offline",
        "description": "High-speed connectivity for real-time data transfer and IoT integration."
    },
    {
        "id": "22",
        "name": "Exoskeletons",
        "sector": "Technology",
        "trendCluster": "Automation & Robotics",
        "focusArea": "Automation & Efficiency",
        "impact": 45.3,
        "timeline": 6.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "Mid‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Healthcare, Pharma & Care",
        "description": "Wearable robotic systems to enhance worker strength and reduce fatigue."
    },
    {
        "id": "23",
        "name": "Renewable Energy",
        "sector": "Technology",
        "trendCluster": "Energy & Sustainability",
        "focusArea": "Sustainability",
        "impact": 35.5,
        "timeline": 6.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Energy & Infrastructure",
        "description": "Sustainable energy solutions for powering logistics operations."
    },
    {
        "id": "24",
        "name": "Digital Twins",
        "sector": "Technology",
        "trendCluster": "Data & Analytics/Digital Twins",
        "focusArea": "Data Insights",
        "impact": 80.0,
        "timeline": 7.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Electronic Commerce (E‑commerce)",
        "industry": "Retail – Online & Offline",
        "description": "Virtual models of physical assets for real-time monitoring and optimization."
    },
    {
        "id": "25",
        "name": "Drones",
        "sector": "Technology",
        "trendCluster": "Autonomous Transport & Delivery",
        "focusArea": "Logistics Optimization",
        "impact": 37.6,
        "timeline": 7.0,
        "department": "Transportation",
        "supplyChainStage": "Last‑Mile Logistics",
        "tradeChannelType": "Mobile Commerce (M‑commerce)",
        "industry": "Retail – Online & Offline",
        "description": "Unmanned aerial vehicles for last-mile delivery and logistics."
    },
    {
        "id": "26",
        "name": "3D Printing",
        "sector": "Technology",
        "trendCluster": "Automation & Robotics",
        "focusArea": "Advanced Manufacturing",
        "impact": 45.3,
        "timeline": 7.0,
        "department": "Warehouse Operations",
        "supplyChainStage": "First‑Mile Logistics",
        "tradeChannelType": "Traditional Commerce (Offline)",
        "industry": "Retail – Online & Offline",
        "description": "Additive manufacturing for on-demand production and prototyping."
    },
    {
        "id": "27",
        "name": "Autonomous Vehicles",
        "sector": "Technology",
        "trendCluster": "Autonomous Transport & Delivery",
        "focusArea": "Logistics Optimization",
        "impact": 44.5,
        "timeline": 8.0,
        "department": "Transportation",
        "supplyChainStage": "Mid‑Mile Logistics",
        "tradeChannelType": "Electronic Commerce (E‑commerce)",
        "industry": "Retail – Online & Offline",
        "description": "Self-driving vehicles for automated transportation and delivery."
    }
];

// Define colors
const COLORS = ['#005BBB', '#4A90E2', '#17A398', '#F15A22', '#62D4E8', '#A3F7FF', '#1D7A8C', '#FFA17F'];

// Build hierarchical tree from trendCluster
interface Node {
    name: string;
    value: number;
    children: { [key: string]: Node };
}

function buildTree(technologies: typeof mockTechnologies): Node {
    const root: Node = { name: 'root', value: 0, children: {} };

    technologies.forEach(tech => {
        const parts = tech.trendCluster.split('/').map(p => p.trim());
        let current = root;
        parts.forEach((part, idx) => {
            if (!current.children[part]) {
                current.children[part] = { name: part, value: 0, children: {} };
            }
            current = current.children[part];
            if (idx === parts.length - 1) {
                current.value += 1;
            }
        });
    });

    // Propagate values up the tree
    function propagate(node: Node): number {
        if (Object.keys(node.children).length === 0) {
            return node.value;
        }
        let sum = 0;
        for (let childKey in node.children) {
            sum += propagate(node.children[childKey]);
        }
        node.value = sum;
        return node.value;
    }

    propagate(root);
    return root;
}

const treeRoot = buildTree(mockTechnologies);

// Function to get current level data based on path
interface PieEntry {
    name: string;
    value: number;
    color: string;
    hasChildren: boolean;
}

function getCurrentData(path: string[], root: Node): PieEntry[] {
    let currentChildren = root.children;
    for (let p of path) {
        if (currentChildren[p]) {
            currentChildren = currentChildren[p].children;
        } else {
            return [];
        }
    }
    return Object.values(currentChildren).map((node, index) => ({
        name: node.name,
        value: node.value,
        color: COLORS[index % COLORS.length],
        hasChildren: Object.keys(node.children).length > 0,
    }));
}

// Calculate real data from mockTechnologies
const totalTechnologies = mockTechnologies.length;

// Timeline distribution
const timelineData = [
    {
        timeline: '0-2 years',
        count: mockTechnologies.filter((t) => t.timeline <= 2).length,
        impact:
            Math.round(
                mockTechnologies.filter((t) => t.timeline <= 2).reduce((sum, t) => sum + t.impact, 0) /
                (mockTechnologies.filter((t) => t.timeline <= 2).length || 1),
            ) || 0,
    },
    {
        timeline: '2-4 years',
        count: mockTechnologies.filter((t) => t.timeline > 2 && t.timeline <= 4).length,
        impact:
            Math.round(
                mockTechnologies.filter((t) => t.timeline > 2 && t.timeline <= 4).reduce((sum, t) => sum + t.impact, 0) /
                (mockTechnologies.filter((t) => t.timeline > 2 && t.timeline <= 4).length || 1),
            ) || 0,
    },
    {
        timeline: '4-6 years',
        count: mockTechnologies.filter((t) => t.timeline > 4 && t.timeline <= 6).length,
        impact:
            Math.round(
                mockTechnologies.filter((t) => t.timeline > 4 && t.timeline <= 6).reduce((sum, t) => sum + t.impact, 0) /
                (mockTechnologies.filter((t) => t.timeline > 4 && t.timeline <= 6).length || 1),
            ) || 0,
    },
    {
        timeline: '6-8 years',
        count: mockTechnologies.filter((t) => t.timeline > 6 && t.timeline <= 8).length,
        impact:
            Math.round(
                mockTechnologies.filter((t) => t.timeline > 6 && t.timeline <= 8).reduce((sum, t) => sum + t.impact, 0) /
                (mockTechnologies.filter((t) => t.timeline > 6 && t.timeline <= 8).length || 1),
            ) || 0,
    },
    {
        timeline: '8-10 years',
        count: mockTechnologies.filter((t) => t.timeline > 8).length,
        impact:
            Math.round(
                mockTechnologies.filter((t) => t.timeline > 8).reduce((sum, t) => sum + t.impact, 0) /
                (mockTechnologies.filter((t) => t.timeline > 8).length || 1),
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
    const [path, setPath] = useState<string[]>([]);
    const currentData = getCurrentData(path, treeRoot);
    const currentTitle = path.length > 0 ? `${path.join(' / ')} Subcategories` : 'Technologies by Tech Categories';

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
                        <h3 className="text-lg font-semibold text-gray-900">{currentTitle}</h3>
                    </div>
                    <div className="p-4">
                        <div
                            className="h-[300px]"
                            onClick={() => {
                                if (path.length > 0) {
                                    setPath(path.slice(0, -1));
                                }
                            }}
                        >
                            <ResponsiveContainer  width="100%" height="100%">
                                <PieChart >
                                    <Pie
                                        style={{ outline: 'none' }}
                                        data={currentData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                        onClick={(data, index, e) => {
                                            e.stopPropagation();
                                            if (data.hasChildren) {
                                                setPath([...path, data.name]);
                                            }
                                        }}
                                    >
                                        {currentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
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
                                    <Tooltip />
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
                                    <Tooltip />
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
                                {getCurrentData([], treeRoot).sort((a, b) => b.value - a.value)[0]?.name} (
                                {getCurrentData([], treeRoot).sort((a, b) => b.value - a.value)[0]?.value} technologies)
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