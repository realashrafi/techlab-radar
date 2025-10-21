//@ts-nocheck
import React, { useState, useEffect } from 'react';
import {
    FiUpload,
    FiDownload,
    FiFileText,
    FiAlertCircle,
    FiCheckCircle,
    FiX,
    FiEdit2,
    FiSave,
    FiXCircle,
} from 'react-icons/fi';
import { FaCloudUploadAlt } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import api from "../../components/utils/apiClient";


interface Technology {
    id: string;
    title: string;
    impact: number;
    time_line: number;
    departments: string;
    fakherbusinesses: string;
    industry: string;
    supplychainstage: string;
    techcategories: string;
    tradechanneltype: string;
}

interface XLSXUploadResult {
    success: boolean;
    message: string;
    errors?: string[];
}

interface ApiResponse {
    headers: string[];
    rows: Technology[];
    count: number;
}

function Technologies() {
    const [technologies, setTechnologies] = useState<Technology[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [uploadResult, setUploadResult] = useState<XLSXUploadResult | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTech, setEditingTech] = useState<Technology | null>(null);

    // Fetch technologies from API
    const fetchTechnologies = async () => {
        try {
            const response = await api.get('/project/technologies/table/');
            const apiData: ApiResponse = response.data;

            setHeaders(apiData.headers);
            setTechnologies(apiData.rows);
        } catch (error: any) {
            setUploadResult({
                success: false,
                message: 'Error fetching technologies',
                errors: [error.response?.data?.message || 'An error occurred while communicating with the server'],
            });
        }
    };

    // Load technologies on mount
    useEffect(() => {
        fetchTechnologies();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx')) {
            setUploadResult({
                success: false,
                message: 'Please upload an XLSX file',
                errors: ['Invalid file format. Only XLSX files are supported.'],
            });
            return;
        }

        setIsUploading(true);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            await api.post('/project/files/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Refresh technologies list after successful upload
            await fetchTechnologies();

            setUploadResult({
                success: true,
                message: 'File uploaded successfully',
            });
        } catch (error: any) {
            setUploadResult({
                success: false,
                message: 'Error uploading file',
                errors: [error.response?.data?.message || 'An error occurred while communicating with the server'],
            });
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const downloadTemplate = () => {
        const headers = ['title', 'impact', 'time_line', 'departments', 'fakherbusinesses', 'industry', 'supplychainstage', 'techcategories', 'tradechanneltype'];

        const sampleData = [
            {
                title: 'AI Chatbots',
                impact: 85,
                time_line: 1,
                departments: 'Customer Service',
                fakherbusinesses: 'Nona - Porsit',
                industry: 'Healthcare, Pharma & Care, Retail – Online & Offline',
                supplychainstage: 'Last‑Mile Logistics',
                techcategories: 'AI',
                tradechanneltype: 'Electronic Commerce (E‑commerce), Mobile Commerce (M‑commerce)',
            },
        ];

        const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'technology-template.xlsx');
    };

    const exportCurrentData = () => {
        const data = technologies.map(tech => ({
            title: tech.title,
            impact: tech.impact,
            time_line: tech.time_line,
            departments: tech.departments,
            fakherbusinesses: tech.fakherbusinesses,
            industry: tech.industry,
            supplychainstage: tech.supplychainstage,
            techcategories: tech.techcategories,
            tradechanneltype: tech.tradechanneltype,
        }));

        const ws = XLSX.utils.json_to_sheet(data, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Technologies');
        XLSX.writeFile(wb, 'current-technologies.xlsx');
    };

    const clearUploadResult = () => {
        setUploadResult(null);
    };

    const startEditing = (tech: Technology) => {
        setEditingId(tech.id);
        setEditingTech({ ...tech });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingTech(null);
    };

    const saveEditing = () => {
        if (!editingTech) return;

        if (editingTech.impact < 0 || editingTech.impact > 100) {
            alert('Impact must be between 0 and 100');
            return;
        }
        if (editingTech.time_line < 1 || editingTech.time_line > 10) {
            alert('Time line must be between 1 and 10 years');
            return;
        }

        setTechnologies(prev => prev.map(tech => (tech.id === editingTech.id ? editingTech : tech)));
        setEditingId(null);
        setEditingTech(null);
    };

    const updateEditingTech = (field: keyof Technology, value: string | number) => {
        if (!editingTech) return;
        setEditingTech({ ...editingTech, [field]: value });
    };

    // Map API headers to display labels (if needed, otherwise use raw header names)
    const headerLabels: { [key: string]: string } = {
        title: 'Title',
        impact: 'Impact',
        time_line: 'Time Line',
        departments: 'Departments',
        fakherbusinesses: 'Fakher Businesses',
        id: 'ID',
        industry: 'Industry',
        supplychainstage: 'Supply Chain Stage',
        techcategories: 'Tech Categories',
        tradechanneltype: 'Trade Channel Type',
    };

    return (
        <div className="space-y-6 p-4 max-w-7xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FiUpload className="w-5 h-5 mr-2 text-blue-600" />
                        Upload Technology Data
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="xlsx-upload" className="text-sm font-medium text-gray-900">
                                    Upload XLSX File
                                </label>
                                <div className="max-w-md mx-auto rounded-lg overflow-hidden md:max-w-xl">
                                    <div className="md:flex">
                                        <div className="w-full p-3">
                                            <div className="relative h-50 mt-1 rounded-lg border-2 border-blue-500 bg-gray-50 flex justify-center items-center hover:shadow-xl transition-shadow duration-300 ease-in-out">
                                                <div className="absolute flex flex-col items-center">
                                                    <FaCloudUploadAlt className={'w-8 h-8'} />
                                                    <span className="block text-gray-500 font-semibold">Drag and drop your files here</span>
                                                    <span className="block text-gray-400 font-normal mt-1">or click to upload</span>
                                                </div>
                                                <input
                                                    id="xlsx-upload"
                                                    type="file"
                                                    accept=".xlsx"
                                                    onChange={handleFileUpload}
                                                    disabled={isUploading}
                                                    className="h-full w-full opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Required columns: title, impact (0-100), time_line (1-10 years)
                                </p>
                            </div>
                            <button
                                onClick={downloadTemplate}
                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-transparent hover:bg-gray-50"
                            >
                                <FiFileText className="w-4 h-4 mr-2" />
                                Download XLSX Template
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">XLSX Format Requirements:</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• <strong>title</strong>: Technology name (required)</li>
                                    <li>• <strong>impact</strong>: Business impact 0-100 (required)</li>
                                    <li>• <strong>time_line</strong>: Years 1-10 (required)</li>
                                    <li>• <strong>departments</strong>: Departments</li>
                                    <li>• <strong>fakherbusinesses</strong>: Fakher Businesses</li>
                                    <li>• <strong>industry</strong>: Industry</li>
                                    <li>• <strong>supplychainstage</strong>: Supply Chain Stage</li>
                                    <li>• <strong>techcategories</strong>: Tech Categories</li>
                                    <li>• <strong>tradechanneltype</strong>: Trade Channel Type</li>
                                </ul>
                            </div>
                            <button
                                onClick={exportCurrentData}
                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-transparent hover:bg-gray-50"
                            >
                                <FiDownload className="w-4 h-4 mr-2" />
                                Export Current Data
                            </button>
                        </div>
                    </div>
                    {uploadResult && (
                        <div
                            className={`mt-4 p-4 rounded-md border ${uploadResult.success ? 'border-teal-500 bg-teal-50' : 'border-red-500 bg-red-50'}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-2">
                                    {uploadResult.success ? (
                                        <FiCheckCircle className="w-4 h-4 text-teal-500 mt-0.5" />
                                    ) : (
                                        <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
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
                                <button onClick={clearUploadResult} className="text-gray-500 hover:text-gray-900">
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                    {isUploading && (
                        <div className="flex items-center justify-center py-4">
                            <p className="text-gray-500">Processing XLSX file...</p>
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
                                    {headers.map(header => (
                                        <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            {headerLabels[header] || header}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {technologies.map(tech => (
                                    <tr key={tech.id} className="hover:bg-gray-50">
                                        {headers.map(header => (
                                            <td key={header} className="px-4 py-2 text-sm text-gray-900">
                                                {editingId === tech.id ? (
                                                    header === 'impact' || header === 'time_line' ? (
                                                        <input
                                                            type="number"
                                                            min={header === 'impact' ? 0 : 1}
                                                            max={header === 'impact' ? 100 : 10}
                                                            value={(editingTech as any)?.[header] || ''}
                                                            onChange={e => updateEditingTech(header as keyof Technology, Number.parseInt(e.target.value) || 0)}
                                                            className="h-8 text-sm w-20 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
                                                        />
                                                    ) : (
                                                        <input
                                                            value={(editingTech as any)?.[header] || ''}
                                                            onChange={e => updateEditingTech(header as keyof Technology, e.target.value)}
                                                            className="h-8 text-sm border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
                                                        />
                                                    )
                                                ) : (
                                                    <span
                                                        className={
                                                            ['departments', 'industry', 'supplychainstage', 'techcategories', 'tradechanneltype'].includes(header)
                                                                ? 'inline-flex items-center px-2 py-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-500 rounded'
                                                                : ''
                                                        }
                                                    >
                              {tech[header as keyof Technology]}
                            </span>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-4 py-2">
                                            {editingId === tech.id ? (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={saveEditing}
                                                        className="h-7 w-7 flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white rounded"
                                                    >
                                                        <FiSave className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="h-7 w-7 flex items-center justify-center border border-gray-300 hover:bg-gray-50 rounded"
                                                    >
                                                        <FiXCircle className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(tech)}
                                                    className="h-7 w-7 flex items-center justify-center border border-gray-300 hover:bg-gray-50 rounded"
                                                >
                                                    <FiEdit2 className="w-3 h-3" />
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
    );
}

export default Technologies;