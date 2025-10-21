import React from 'react';
import { ReactComponent as Logo } from '../lib/logo.svg';
import { GridBackgroundDemo } from '../tools/GridBackgroundDemo';
import {Link} from "react-router";


function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen relative"> {/* اضافه کردن min-height برای اطمینان از پوشش کل صفحه */}
            <div className="fixed top-0 left-0 z-50 bg-[#005BBB] w-full h-20 flex justify-start items-center px-10 text-white">
                <Link to={'/'} className="w-9 h-9 p-[2px] m-4 rounded flex items-center justify-center bg-[#F67242]">
                    <Logo />
                </Link>
                <div className="flex flex-col items-start justify-center -mt-1">
                    <span className="font-bold text-[20px]">Logistics Technology Radar</span>
                    <span className="text-[11px]">Trends in Iran 1404</span>
                </div>
            </div>
            <GridBackgroundDemo>
                {children}
            </GridBackgroundDemo>
            <div className="w-full h-20 bg-white/70 backdrop-blur-[4px] shadow border-t border-black/10">
                <div className=" mx-auto h-full flex items-center justify-between px-4">
        <span className="text-sm text-gray-600">
          © {new Date().getFullYear()} Logistics Technology Radar All Rights Reserved
        </span>
                    <Link
                        to={'/admin/dashboard'}
                        className="bg-gray-50 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Admin Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Layout;