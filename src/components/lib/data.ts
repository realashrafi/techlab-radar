export interface Technology {
    id: string
    name: string
    sector: string
    trendCluster: string
    focusArea: string
    image?:string
    impact: number // 0-100
    timeline: number // years
    department: string
    supplyChainStage: string
    tradeChannelType: string
    industry: string
    description: string
    x?: number // for chart positioning
    y?: number // for chart positioning
}
export const menuItems = [
    {
        key: 'parent1',
        title: 'والد ۱',
        checked: false, // checked اولیه
        children: [
            {
                key: 'child1-1',
                title: 'فرزند ۱-۱',
                checked: false
            },
            {
                key: 'child1-2',
                title: 'فرزند ۱-۲',
                checked:false,
            },
        ],
    },{
        key: 'parent2',
        title: 'والد2',
        checked: false, // checked اولیه
        children: [
            {
                key: 'child2-1',
                title: 'فرزند ۱-۱',
                checked: false
            },
            {
                key: 'child2-2',
                title: 'فرزند ۱-۲',
                checked:false,
            },
        ],
    },

];
export interface FilterState {
    sectors: string[]
    trendClusters: string[]
    focusAreas: string[]
    departments: string[]
    supplyChainStages: string[]
    tradeChannelTypes: string[]
    industries: string[]
}

export const mockTechnologies: Technology[] = [
    {
        "id": "1",
        "name": "AI Chatbots",
        "sector": "Technology",
        "trendCluster": "AI",
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
        "trendCluster": "Data & Analytics",
        "focusArea": "Logistics Optimization",
        "impact": 60.8,
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
        "trendCluster": "AI",
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
        "trendCluster": "Data & Analytics",
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
        "trendCluster": "AI",
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
        "impact": 66.1,
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
        "impact": 68.2,
        "timeline": 5.0,
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
        "impact": 59.2,
        "timeline": 5.0,
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
        "trendCluster": "Data & Analytics",
        "focusArea": "Automation & Efficiency",
        "impact": 68.2,
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
        "impact": 62.0,
        "timeline": 5.0,
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
        "timeline": 5.0,
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
        "impact": 59.2,
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
        "impact": 65.7,
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
        "timeline": 6.0,
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
        "timeline": 6.0,
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
        "timeline": 6.0,
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
        "trendCluster": "Data & Analytics",
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
]