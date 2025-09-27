//@ts-nocheck
import React, { useState } from 'react';
import SwitchButton from './SwitchButton';
import { VscChevronDown, VscChevronUp } from 'react-icons/vsc';
import { LuFilter, LuFilterX } from 'react-icons/lu';

interface MenuItem {
    key: string;
    title: string;
    children?: MenuItem[];
    onClick?: () => void;
}

interface AccordionMenuProps {
    items: MenuItem[];
    selectedKeys: string[]; // پراپ جدید برای کنترل انتخاب‌ها
    onSelectionChange: (selectedKeys: string[]) => void; // پراپ برای اطلاع‌رسانی تغییرات
}

const AccordionMenu: React.FC<AccordionMenuProps> = ({ items, selectedKeys, onSelectionChange }) => {
    const [openItems, setOpenItems] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    // مدیریت انتخاب یا لغو انتخاب یک فیلتر
    const toggleItem = (key: string, checked: boolean) => {
        const newSelected = checked
            ? [...new Set([...selectedKeys, key])] // اضافه کردن کلید
            : selectedKeys.filter((k) => k !== key); // حذف کلید
        onSelectionChange(newSelected);
    };

    const toggleAccordion = (index: string) => {
        setOpenItems((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const renderItem = (item: MenuItem, index: string, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openItems.includes(index);
        const isLeaf = !hasChildren;

        return (
            <div key={index} className={`mb-2 ${level > 0 ? `ml-${level * 4}` : ''}`}>
                <div
                    className={`flex justify-between items-center min-w-50 m-2 p-2 bg-gray-50 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 transition-colors ${
                        hasChildren ? 'has-children max-w-10' : ''
                    } ${isOpen ? 'open' : ''}`}
                    onClick={() => hasChildren && toggleAccordion(index)}
                >
                    <div className="flex items-center justify-between flex-1 gap-2">
            <span className={`text-gray-800 text-[14px] text-base ${isLeaf ? 'ml-0' : 'ml-2'}`}>
              {item.title}
            </span>
                        {isLeaf && (
                            <SwitchButton
                                checked={selectedKeys.includes(item.key)} // استفاده از selectedKeys پراپ
                                onChange={(checked) => toggleItem(item.key, checked)}
                            />
                        )}
                    </div>
                    {hasChildren && (
                        <span>{isOpen ? <VscChevronUp /> : <VscChevronDown />}</span>
                    )}
                </div>
                {hasChildren && isOpen && (
                    <div className="ml-4 border-l-2 border-[#F67242]">
                        {item.children!.map((child, childIndex) =>
                            renderItem(child, `${index}-${childIndex}`, level + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="font-sans">
            <button
                className="lg:hidden block mb-4 px-4 py-2 bg-[#F67242] text-white rounded-md hover:bg-[#e55f32] transition-colors"
                onClick={toggleMenu}
            >
                {isMenuOpen ? (
                    <div className="flex items-center">
                        مخفی کردن فیلترها <LuFilterX className="ml-2" />
                    </div>
                ) : (
                    <div className="flex items-center">
                        نمایش فیلترها <LuFilter className="ml-2" />
                    </div>
                )}
            </button>
            <div
                className={`max-w-xs overflow-y-auto h-[550px] max-h-[550px] ${
                    isMenuOpen ? 'block' : 'hidden lg:block'
                }`}
            >
                {items.map((item, index) => renderItem(item, index.toString()))}
            </div>
        </div>
    );
};

export default AccordionMenu;