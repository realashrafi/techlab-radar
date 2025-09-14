import React, { useState } from 'react';
import SwitchButton from './SwitchButton'; // فرض بر import SwitchButton

interface MenuItem {
    key: string;
    title: string;
    children?: MenuItem[];
    onClick?: () => void;
}

interface AccordionMenuProps {
    items: MenuItem[];
    onSelectionChange?: (selectedKeys: string[]) => void;
}

const useMenuSelection = () => {
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]); // default خالی

    const toggleItem = (key: string, checked: boolean) => {
        setSelectedKeys(prev => {
            const newSelected = checked
                // @ts-ignore
                ? [...new Set([...prev, key])] // جلوگیری از duplicate
                : prev.filter(k => k !== key);
            return newSelected;
        });
    };

    return { selectedKeys, toggleItem };
};

const AccordionMenu: React.FC<AccordionMenuProps> = ({ items, onSelectionChange }) => {
    const { selectedKeys, toggleItem } = useMenuSelection();

    React.useEffect(() => {
        if (onSelectionChange) {
            onSelectionChange(selectedKeys);
        }
    }, [selectedKeys, onSelectionChange]);

    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleAccordion = (index: string) => {
        setOpenItems((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const renderItem = (item: MenuItem, index: string, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openItems.includes(index);
        const isLeaf = !hasChildren; // فقط برای leaf nodes (بدون children) switch رندر کن

        return (
            <div key={index} className={`mb-2 ${level > 0 ? `ml-${level * 4}` : ''}`}>
                <div
                    className={`flex justify-between items-center min-w-50  m-2 p-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 transition-colors ${
                        hasChildren ? 'has-children max-w-10' : ''
                    } ${isOpen ? 'open' : ''}`}
                    onClick={() => hasChildren && toggleAccordion(index)}
                >
                    <div className="flex items-center justify-between flex-1 gap-2">
                        <span className={`text-gray-800 text-base ${isLeaf ? 'ml-0' : 'ml-2'}`}>{item.title}</span>
                        {isLeaf && (
                            <SwitchButton
                                checked={selectedKeys.includes(item.key)}
                                onChange={(checked) => toggleItem(item.key, checked)}
                            />
                        )}
                    </div>
                    {hasChildren && (
                        <span className="text-lg font-bold ">{isOpen ? '−' : '+'}</span>
                    )}
                </div>
                {hasChildren && isOpen && (
                    <div className="ml-4 border-l-2 border-blue-300 pl-2">
                        {item.children!.map((child, childIndex) =>
                            renderItem(child, `${index}-${childIndex}`, level + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-xs font-sans">
            {items.map((item, index) => renderItem(item, index.toString()))}
        </div>
    );
};

export default AccordionMenu;