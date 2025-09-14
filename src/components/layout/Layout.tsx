import React from 'react';
import {ReactComponent as Logo} from "../lib/logo.svg";

function Layout({children}: { children: React.ReactNode }) {
    return (
        <div>
            <div className={'bg-blue-500 w-full h-20 flex justify-start items-center px-10 text-white'}>
                <div className={'w-9 h-9 p-[2px] m-4 rounded flex items-center justify-center bg-[#F67242]'}>
                    <Logo/>
                </div>
                <div className={'flex flex-col items-start justify-center -mt-1'}>
                    <span className={'font-bold text-[20px]'}>Logistics Technology Radar</span>
                    <span className={'text-[11px]'}>Trends in Iran 1404</span>
                </div>
            </div>
            {children}
        </div>
    );
}

export default Layout;