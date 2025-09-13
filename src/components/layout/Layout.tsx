import React from 'react';

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className={'bg-blue-500 w-full h-20 flex justify-start items-center px-10 text-white'}>
                Logistics Technology Radar
            </div>
                {children}
        </div>
    );
}

export default Layout;