import React, {useState} from 'react';
import {motion} from 'framer-motion';
import Layout from "../../components/layout/Layout";

const LoginComponent = () => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: any
    ) => {
        e.preventDefault();
        console.log('Mobile:', mobile, 'Password:', password);
    };

    return (
        <Layout>
            <div
                className="min-h-[calc(100vh-80px)] bg-[url('/iran2.jpeg')] bg-cover bg-center flex items-center justify-center relative">
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
                <motion.div
                    initial={{opacity: 0, y: -50}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="bg-white/70 backdrop-blur-[4px] p-8 rounded-lg shadow-lg w-full max-w-md relative z-10"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center text-[#005BBB]">
                        ورود به سیستم
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-[#005BBB]">
                                شماره موبایل
                            </label>
                            <motion.input
                                whileFocus={{scale: 1.02}}
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="w-full px-4 py-2 border border-[#005BBB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67242] transition-all duration-300"
                                placeholder="09123456789"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-[#005BBB]">
                                رمز عبور
                            </label>
                            <motion.input
                                whileFocus={{scale: 1.02}}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-[#005BBB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67242] transition-all duration-300"
                                placeholder="رمز عبور"
                                required
                            />
                        </div>
                        <motion.button
                            whileHover={{scale: 1.05, backgroundColor: '#e55e30'}}
                            whileTap={{scale: 0.95}}
                            type="submit"
                            className="w-full py-2 px-4 rounded-lg text-white font-semibold bg-[#F67242] transition-all duration-300"
                        >
                            ورود
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </Layout>
    );
};

export default LoginComponent;