//@ts-nocheck
import React, { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const initialCategories = {
    techCategories: [
        "AI",
        "IoT",
        "Robotics & Automation",
        "Blockchain",
        "Communications (5G/6G)",
        "Mixed Reality (AR/VR/MR)",
        "Renewable Energy",
        "Autonomous Transportation and Drones",
    ],
    departments: ["Warehouse Operations", "Transportation", "IT Support", "Customer Service"],
    supplyChainStage: ["First‑Mile Logistics", "Mid‑Mile Logistics", "Last‑Mile Logistics"],
    tradeChannelType: [
        "Traditional Commerce (Offline)",
        "Electronic Commerce (E‑commerce)",
        "Mobile Commerce (M‑commerce)",
        "Social Commerce",
        "Fast Commerce",
        "Marketplaces",
        "Subscription / Service",
        "Direct‑to‑Consumer (D2C) Model",
        "Omni‑channel Commerce",
    ],
    industry: [
        "Retail – Online & Offline",
        "Healthcare, Pharma & Care",
        "Food & Beverage",
        "Manufacturing & Industrial Goods",
        "Agriculture & Agro‑Supply Chain",
        "Energy & Infrastructure",
        "Mobility, Smart City & Logistics Infra",
    ],
};

function CategoryManager() {
    const [categories, setCategories] = useState(initialCategories);
    const [newCategory, setNewCategory] = useState("");
    const [activeTab, setActiveTab] = useState("techCategories");

    const addCategory = () => {
        if (newCategory.trim()) {
            setCategories((prev) => ({
                ...prev,
                [activeTab]: [...prev[activeTab as keyof typeof prev], newCategory.trim()],
            }));
            setNewCategory("");
        }
    };

    const removeCategory = (category: string) => {
        setCategories((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab as keyof typeof prev].filter((c) => c !== category),
        }));
    };

    const categoryLabels = {
        techCategories: "Tech Categories",
        departments: "Departments",
        supplyChainStage: "Supply Chain Stage",
        tradeChannelType: "Trade Channel Type",
        industry: "Industry",
    };

    const getCategoryColor = (tabKey: string) => {
        switch (tabKey) {
            case "techCategories":
                return "border-teal-500 text-teal-700 bg-teal-50";
            case "departments":
                return "border-blue-500 text-blue-700 bg-blue-50";
            case "supplyChainStage":
                return "border-red-500 text-red-700 bg-red-50";
            case "tradeChannelType":
                return "border-blue-600 text-blue-600 bg-blue-50";
            case "industry":
                return "border-teal-500 text-teal-700 bg-teal-50";
            default:
                return "border-gray-300 text-gray-700 bg-gray-50";
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-7xl mx-auto">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Category Management</h2>
            </div>
            <div className="p-6">
                <div className="border border-gray-200 rounded-md bg-white">
                    <div className="flex border-b border-gray-200">
                        {Object.keys(categories).map((key) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`px-4 py-2 text-sm font-medium ${
                                    activeTab === key
                                        ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                        : 'text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {categoryLabels[key as keyof typeof categoryLabels]}
                            </button>
                        ))}
                    </div>
                    {Object.entries(categories).map(([key, items]) => (
                        <div
                            key={key}
                            className={`space-y-4 p-4 ${activeTab === key ? 'block' : 'hidden'}`}
                        >
                            <div className="flex space-x-2">
                                <input
                                    placeholder={`Add new ${categoryLabels[key as keyof typeof categoryLabels].toLowerCase()}...`}
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md text-gray-900 focus:ring-blue-600 focus:border-blue-600"
                                />
                                <button
                                    onClick={addCategory}
                                    disabled={!newCategory.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <FiPlus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {items.map((item) => (
                                    <span
                                        key={item}
                                        className={`flex items-center space-x-2 px-3 py-1 text-sm rounded ${getCategoryColor(key)}`}
                                    >
                    <span>{item}</span>
                    <button
                        onClick={() => removeCategory(item)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </span>
                                ))}
                            </div>
                            {items.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No {categoryLabels[key as keyof typeof categoryLabels].toLowerCase()} added yet.</p>
                                    <p className="text-sm mt-1">Add your first item using the input field above.</p>
                                </div>
                            )}
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>{items.length}</strong> {categoryLabels[key as keyof typeof categoryLabels].toLowerCase()}{" "}
                                    {items.length === 1 ? "item" : "items"} currently available. These will be used as options in the
                                    technology management dropdowns.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CategoryManager;