import React, { useState } from 'react';

interface SwitchButtonProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({ checked = false, onChange, label }) => {
    const [isChecked, setIsChecked] = useState(checked);

    const handleToggle = () => {
        const newChecked = !isChecked;
        setIsChecked(newChecked);
        if (onChange) onChange(newChecked);
    };

    return (
        <div className="flex items-center gap-2">
            <label className="relative inline-block w-14 h-8">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleToggle}
                    className="opacity-0 w-0 h-0"
                />
                <span
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-400 rounded-full transition-all duration-400 ease-in-out ${
                        isChecked ? '!bg-[#F67242]' : ''
                    }`}
                >
          <span
              className={`absolute h-6 w-6 bg-white rounded-full bottom-1 left-1 transition-transform duration-400 ease-in-out ${
                  isChecked ? 'translate-x-6' : ''
              }`}
          ></span>
        </span>
            </label>
            {label && <span className="text-gray-700 text-base">{label}</span>}
        </div>
    );
};

export default SwitchButton;