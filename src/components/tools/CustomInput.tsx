import React from 'react';

interface CustomInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    label?: string;
    error?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
                                                     value,
                                                     onChange,
                                                     type = 'text',
                                                     placeholder,
                                                     label,
                                                     error,
                                                 }) => {
    return (
        <div className="mb-4 flex flex-col">
            {label && <label className="text-sm font-bold text-gray-700 mb-1">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`p-2 border-2 rounded-md text-base focus:outline-none focus:border-blue-500 transition-colors ${
                    error ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
        </div>
    );
};

export default CustomInput;