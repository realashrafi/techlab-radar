//@ts-nocheck
import React, {useState} from 'react';
import {
    FiUpload,
    FiDownload,
    FiFileText,
    FiAlertCircle,
    FiCheckCircle,
    FiX,
    FiEdit2,
    FiSave,
    FiXCircle
} from 'react-icons/fi';
import {mockTechnologies, Technology} from "../../components/lib/data";
import { FaCloudUploadAlt } from "react-icons/fa";


interface CSVUploadResult {
    success: boolean;
    message: string;
    data?: Technology[];
    errors?: string[];
}

const trendClusterOptions = [
    "AI",
    "IoT",
    "Robotics & Automation",
    "Blockchain",
    "Communications (5G/6G)",
    "Mixed Reality (AR/VR/MR)",
    "Renewable Energy",
    "Autonomous Transportation and Drones",
];

const departmentOptions = ["Warehouse Operations", "Transportation", "IT Support", "Customer Service"];

const supplyChainStageOptions = ["First‑Mile Logistics", "Mid‑Mile Logistics", "Last‑Mile Logistics"];

const tradeChannelTypeOptions = [
    "Traditional Commerce (Offline)",
    "Electronic Commerce (E‑commerce)",
    "Mobile Commerce (M‑commerce)",
    "Social Commerce",
    "Fast Commerce",
    "Marketplaces",
    "Subscription / Service",
    "Direct‑to‑Consumer (D2C) Model",
    "Omni‑channel Commerce",
];

const industryOptions = [
    "Retail – Online & Offline",
    "Healthcare, Pharma & Care",
    "Food & Beverage",
    "Manufacturing & Industrial Goods",
    "Agriculture & Agro‑Supply Chain",
    "Energy & Infrastructure",
    "Mobility, Smart City & Logistics Infra",
];

// const mockTechnologies: Technology[] = mockTechnologies;

function Technologies() {
    const [technologies, setTechnologies] = useState<Technology[]>(mockTechnologies);
    const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTech, setEditingTech] = useState<Technology | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            setUploadResult({
                success: false,
                message: 'Please upload a CSV file',
                errors: ['Invalid file format. Only CSV files are supported.'],
            });
            return;
        }

        setIsUploading(true);
        setUploadResult(null);

        try {
            const text = await file.text();
            const result = parseCSV(text);
            setUploadResult(result);

            if (result.success && result.data) {
                setTechnologies(result.data);
            }
        } catch (error) {
            setUploadResult({
                success: false,
                message: 'Error reading file',
                errors: ['Failed to read the uploaded file. Please try again.'],
            });
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const parseCSV = (csvText: string): CSVUploadResult => {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            return {
                success: false,
                message: 'CSV file must contain at least a header row and one data row',
                errors: ['File appears to be empty or contains only headers'],
            };
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'impact', 'timeline'];
        const missingHeaders = requiredHeaders.filter(header => !headers.some(h => h.includes(header.toLowerCase())));

        if (missingHeaders.length > 0) {
            return {
                success: false,
                message: 'Missing required columns',
                errors: [`Required columns: ${missingHeaders.join(', ')}`],
            };
        }

        const errors: string[] = [];
        const technologies: Technology[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

            if (values.length !== headers.length) {
                errors.push(`Row ${i + 1}: Column count mismatch`);
                continue;
            }

            try {
                const tech: Technology = {
                    id: Date.now().toString() + i,
                    name: getValueByHeader(headers, values, 'name') || `Technology ${i}`,
                    impact: Number.parseInt(getValueByHeader(headers, values, 'impact') || '50'),
                    timeline: Number.parseInt(getValueByHeader(headers, values, 'timeline') || '5'),
                    sector: getValueByHeader(headers, values, 'sector') || 'Technology',
                    trendCluster: getValueByHeader(headers, values, 'trendcluster') || 'AI',
                    focusArea: getValueByHeader(headers, values, 'focusarea') || 'Automation & Efficiency',
                    department: getValueByHeader(headers, values, 'department') || 'IT Support',
                    supplyChainStage: getValueByHeader(headers, values, 'supplychainstage') || 'Mid‑Mile Logistics',
                    tradeChannelType: getValueByHeader(headers, values, 'tradechanneltype') || 'Electronic Commerce (E‑commerce)',
                    industry: getValueByHeader(headers, values, 'industry') || 'Manufacturing & Industrial Goods',
                    description: getValueByHeader(headers, values, 'description') || 'Technology description not provided.',
                };

                if (tech.impact < 0 || tech.impact > 100) {
                    errors.push(`Row ${i + 1}: Impact must be between 0-100`);
                    continue;
                }
                if (tech.timeline < 1 || tech.timeline > 10) {
                    errors.push(`Row ${i + 1}: Timeline must be between 1-10 years`);
                    continue;
                }

                technologies.push(tech);
            } catch (error) {
                errors.push(`Row ${i + 1}: Error parsing data`);
            }
        }

        if (technologies.length === 0) {
            return {
                success: false,
                message: 'No valid technologies found in CSV',
                errors: errors.length > 0 ? errors : ['All rows contained invalid data'],
            };
        }

        return {
            success: true,
            message: `Successfully imported ${technologies.length} technologies`,
            data: technologies,
            errors: errors.length > 0 ? errors : undefined,
        };
    };

    const getValueByHeader = (headers: string[], values: string[], searchHeader: string): string => {
        const index = headers.findIndex(h => h.includes(searchHeader.toLowerCase()));
        return index >= 0 ? values[index] : '';
    };

    const downloadTemplate = () => {
        const headers = [
            'name',
            'impact',
            'timeline',
            'Tech Categories',
            'Departments',
            'Supply Chain Stage',
            'Trade Channel Type',
            'Industry',
            'description',
        ];

        const sampleData = [
            'AI Chatbots,85,1,AI,Customer Service,Last‑Mile Logistics,Electronic Commerce (E‑commerce),Retail – Online & Offline,Intelligent conversational agents for customer support',
        ];

        const csvContent = [headers.join(','), ...sampleData].join('\n');
        const blob = new Blob([csvContent], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'technology-template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportCurrentData = () => {
        const headers = [
            'name',
            'impact',
            'timeline',
            'sector',
            'trendCluster',
            'focusArea',
            'department',
            'supplyChainStage',
            'tradeChannelType',
            'industry',
            'description',
        ];

        const csvContent = [
            headers.join(','),
            ...technologies.map(tech =>
                [
                    `"${tech.name}"`,
                    tech.impact,
                    tech.timeline,
                    `"${tech.sector}"`,
                    `"${tech.trendCluster}"`,
                    `"${tech.focusArea}"`,
                    `"${tech.department}"`,
                    `"${tech.supplyChainStage}"`,
                    `"${tech.tradeChannelType}"`,
                    `"${tech.industry}"`,
                    `"${tech.description}"`,
                ].join(','),
            ),
        ].join('\n');

        const blob = new Blob([csvContent], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'current-technologies.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearUploadResult = () => {
        setUploadResult(null);
    };

    const startEditing = (tech: Technology) => {
        setEditingId(tech.id);
        setEditingTech({...tech});
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingTech(null);
    };

    const saveEditing = () => {
        if (!editingTech) return;

        if (editingTech.impact < 0 || editingTech.impact > 100) {
            alert('Impact must be between 0-100');
            return;
        }
        if (editingTech.timeline < 1 || editingTech.timeline > 10) {
            alert('Timeline must be between 1-10 years');
            return;
        }

        setTechnologies(prev => prev.map(tech => (tech.id === editingTech.id ? editingTech : tech)));
        setEditingId(null);
        setEditingTech(null);
    };

    const updateEditingTech = (field: keyof Technology, value: string | number) => {
        if (!editingTech) return;
        setEditingTech({...editingTech, [field]: value});
    };

    return (
        // <Layout>
            <div className="space-y-6 p-4 max-w-7xl mx-auto">
                {/* Upload Section */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FiUpload className="w-5 h-5 mr-2 text-blue-600"/>
                            Upload Technologies Data
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="csv-upload" className="text-sm font-medium text-gray-900">
                                        Upload CSV File
                                    </label>
                                    <div className="max-w-md mx-auto rounded-lg overflow-hidden md:max-w-xl">
                                        <div className="md:flex">
                                            <div className="w-full p-3">
                                                <div
                                                    className="relative h-44 mt-1 rounded-lg border-2 border-blue-500 bg-gray-50 flex justify-center items-center  hover:shadow-xl transition-shadow duration-300 ease-in-out"
                                                >
                                                    <div className="absolute flex flex-col items-center">
                                                        <FaCloudUploadAlt className={'w-8 h-8'}/>
                                                        <span className="block text-gray-500 font-semibold"
                                                        >Drag &amp; drop your files here</span
                                                        >
                                                        <span className="block text-gray-400 font-normal mt-1"
                                                        >or click to upload</span
                                                        >
                                                    </div>

                                                    <input
                                                        id="csv-upload"
                                                        type="file"
                                                        accept=".csv"
                                                        onChange={handleFileUpload}
                                                        disabled={isUploading}
                                                        className="h-full w-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Required columns: name, impact (0-100), timeline (1-10 years)
                                    </p>
                                </div>
                                <button
                                    onClick={downloadTemplate}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-transparent hover:bg-gray-50"
                                >
                                    <FiFileText className="w-4 h-4 mr-2"/>
                                    Download CSV Template
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">CSV Format Requirements:</h4>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                        <li>• <strong>name</strong>: Technology name (required)</li>
                                        <li>• <strong>impact</strong>: Business impact 0-100 (required)</li>
                                        <li>• <strong>timeline</strong>: Years 1-10 (required)</li>
                                        <li>• <strong>Tech Categories</strong>: Category name</li>
                                        <li>• <strong>Departments</strong>: Department name</li>
                                        <li>• <strong>Supply Chain Stage</strong>: Chain stage name</li>
                                        <li>• <strong>Trade Channel Type</strong>: Channel name</li>
                                        <li>• <strong>Industry</strong>: Industry name</li>
                                    </ul>
                                </div>
                                <button
                                    onClick={exportCurrentData}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-transparent hover:bg-gray-50"
                                >
                                    <FiDownload className="w-4 h-4 mr-2"/>
                                    Export Current Data
                                </button>
                            </div>
                        </div>
                        {uploadResult && (
                            <div
                                className={`mt-4 p-4 rounded-md border ${uploadResult.success ? 'border-teal-500 bg-teal-50' : 'border-red-500 bg-red-50'}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-2">
                                        {uploadResult.success ? (
                                            <FiCheckCircle className="w-4 h-4 text-teal-500 mt-0.5"/>
                                        ) : (
                                            <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5"/>
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${uploadResult.success ? 'text-teal-700' : 'text-red-700'}`}>
                                                <strong>{uploadResult.message}</strong>
                                            </p>
                                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                                                <ul className="mt-2 space-y-1">
                                                    {uploadResult.errors.map((error, index) => (
                                                        <li key={index} className="text-sm text-gray-700">
                                                            • {error}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={clearUploadResult}
                                        className="text-gray-500 hover:text-gray-900"
                                    >
                                        <FiX className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        )}
                        {isUploading && (
                            <div className="flex items-center justify-center py-4">
                                <p className="text-gray-500">Processing CSV file...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Technologies Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Current Technologies ({technologies.length})
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <div className="max-h-[600px] overflow-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-white sticky top-0">
                                    <tr className="hover:bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impact</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tech
                                            Categories
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departments</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supply
                                            Chain Stage
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trade
                                            Channel Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {technologies.map(tech => (
                                        <tr key={tech.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                {editingId === tech.id ? (
                                                    <input
                                                        value={editingTech?.name || ''}
                                                        onChange={e => updateEditingTech('name', e.target.value)}
                                                        className="h-8 text-sm border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
                                                    />
                                                ) : (
                                                    tech.name
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {editingId === tech.id ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={editingTech?.impact || 0}
                                                        onChange={e => updateEditingTech('impact', Number.parseInt(e.target.value) || 0)}
                                                        className="h-8 text-sm w-20 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
                                                    />
                                                ) : (
                                                    `${tech.impact}%`
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {editingId === tech.id ? (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={editingTech?.timeline || 1}
                                                        onChange={e => updateEditingTech('timeline', Number.parseInt(e.target.value) || 1)}
                                                        className="h-8 text-sm w-20 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
                                                    />
                                                ) : (
                                                    `${tech.timeline}yr`
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === tech.id ? (
                                                    <select
                                                        value={editingTech?.trendCluster || ''}
                                                        onChange={e => updateEditingTech('trendCluster', e.target.value)}
                                                        className="h-8 text-sm border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
                                                    >
                                                        {trendClusterOptions.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-500 rounded">
                            {tech.trendCluster}
                          </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === tech.id ? (
                                                    <select
                                                        value={editingTech?.department || ''}
                                                        onChange={e => updateEditingTech('department', e.target.value)}
                                                        className="h-8 text-sm border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
                                                    >
                                                        {departmentOptions.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-500 rounded">
                            {tech.department}
                          </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === tech.id ? (
                                                    <select
                                                        value={editingTech?.supplyChainStage || ''}
                                                        onChange={e => updateEditingTech('supplyChainStage', e.target.value)}
                                                        className="h-8 text-sm border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
                                                    >
                                                        {supplyChainStageOptions.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-500 rounded">
                            {tech.supplyChainStage}
                          </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === tech.id ? (
                                                    <select
                                                        value={editingTech?.tradeChannelType || ''}
                                                        onChange={e => updateEditingTech('tradeChannelType', e.target.value)}
                                                        className="h-8 text-sm border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
                                                    >
                                                        {tradeChannelTypeOptions.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-600 rounded">
                            {tech.tradeChannelType}
                          </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === tech.id ? (
                                                    <select
                                                        value={editingTech?.industry || ''}
                                                        onChange={e => updateEditingTech('industry', e.target.value)}
                                                        className="h-8 text-sm border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
                                                    >
                                                        {industryOptions.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-500 rounded">
                            {tech.industry}
                          </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === tech.id ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={saveEditing}
                                                            className="h-7 w-7 flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white rounded"
                                                        >
                                                            <FiSave className="w-3 h-3"/>
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="h-7 w-7 flex items-center justify-center border border-gray-300 hover:bg-gray-50 rounded"
                                                        >
                                                            <FiXCircle className="w-3 h-3"/>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditing(tech)}
                                                        className="h-7 w-7 flex items-center justify-center border border-gray-300 hover:bg-gray-50 rounded"
                                                    >
                                                        <FiEdit2 className="w-3 h-3"/>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        // </Layout>
    );
}

export default Technologies;