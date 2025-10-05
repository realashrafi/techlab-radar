import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Technologies from './Technologies';
import CategoryManager from './CategoryManager';
import AnalyticsDashboard from './Analytics';
import Layout from '../../components/layout/Layout';

function TabView() {
    const [activeTab, setActiveTab] = useState('tab1');

    const tabs = [
        { id: 'tab1', label: 'Technologies', component: <Technologies /> },
        { id: 'tab2', label: 'Categories', component: <CategoryManager /> },
        { id: 'tab3', label: 'Analytics', component: <AnalyticsDashboard /> },
    ];

    return (
        <Layout>
            <div className="rounded-lg pt-10 max-w-7xl mx-auto">
                {/* هدر تب‌ها */}
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded text-sm font-medium ${
                                activeTab === tab.id
                                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                    : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* رندر کامپوننت تب فعال با انیمیشن */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab} // کلید منحصربه‌فرد برای هر تب
                            initial={{ opacity: 0, y: 20 }} // حالت اولیه (قبل از ورود)
                            animate={{ opacity: 1, y: 0 }} // حالت نهایی (بعد از ورود)
                            exit={{ opacity: 0, y: -20 }} // حالت خروج
                            transition={{ duration: 0.3, ease: 'easeInOut' }} // تنظیمات انیمیشن
                        >
                            {tabs.find((tab) => tab.id === activeTab)?.component}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
}

export default TabView;