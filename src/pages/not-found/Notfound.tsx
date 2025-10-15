import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Float, Points, PointMaterial, Box, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useMemo } from 'react';

// کامپوننت پارتیکل‌های سبک
const Particles = () => {
    const ref = useRef<THREE.Points>(null);
    const particleCount = 500; // کمتر برای موبایل (optimize بیشتر)

    const positions = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 15; // فضای کوچکتر برای موبایل
            pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
        }
        return pos;
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.05; // سرعت کمتر برای عملکرد بهتر
            ref.current.rotation.x += delta * 0.03;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={true}>
            <PointMaterial
                transparent
                color="#F67242" // رنگ نارنجی برای پارتیکل‌ها
                size={0.03} // کوچکتر برای موبایل
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
};

// کامپوننت انیمیشن 404
const Animated404 = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.3; // کندتر برای موبایل
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
        }
    });

    return (
        <group ref={groupRef}>
            <Center>
                <Box position={[-1.2, 0, 0]} args={[0.9, 1.8, 0.3]}> {/* کوچکتر برای موبایل */}
                    <meshNormalMaterial />
                </Box>
                <Box position={[0, 0, 0]} args={[0.9, 1.8, 0.3]}>
                    <meshNormalMaterial />
                </Box>
                <Box position={[1.2, 0, 0]} args={[0.9, 1.8, 0.3]}>
                    <meshNormalMaterial />
                </Box>
            </Center>
            <Text
                position={[0, -1.8, 0]} // نزدیک‌تر
                fontSize={0.5} // کوچکتر برای موبایل
                color="#F67242"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.03}
                outlineColor="#005BBB"
            >
                صفحه پیدا نشد!
            </Text>
        </group>
    );
};

// صحنه 3D با تنظیمات responsive
const NotFoundScene = () => {
    return (
        <Canvas
            camera={{ position: [0, 0, 6], fov: 100 }} // fov بیشتر و position نزدیک‌تر برای موبایل (زاویه دید وسیع‌تر)
            gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }} // optimize برای موبایل: antialias خاموش، low-power
            dpr={[1, 1.5]} // دستگاه‌های موبایل رزولوشن پایین‌تر برای عملکرد
        >
            <ambientLight intensity={0.5} /> {/* شدت کمتر */}
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, -5, -5]} intensity={0.3} color="#005BBB" />
            <Suspense fallback={null}>
                <Particles />
                <Float speed={1} rotationIntensity={0.5} floatIntensity={1}> {/* کندتر */}
                    <Animated404 />
                </Float>
                <mesh position={[-3, 1, -1]}> {/* کوچکتر */}
                    <torusGeometry args={[0.6, 0.2, 8, 50]} />
                    <meshStandardMaterial color="#005BBB" emissive="#005BBB" emissiveIntensity={0.3} />
                </mesh>
                <mesh position={[3, -1, -1]}>
                    <sphereGeometry args={[0.9, 16, 16]} /> {/* segments کمتر برای optimize */}
                    <meshStandardMaterial color="#F67242" emissive="#F67242" emissiveIntensity={0.2} />
                </mesh>
            </Suspense>
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={false}
                panSpeed={1}
                zoomSpeed={0.8}
                maxPolarAngle={Math.PI / 2} // محدود برای موبایل
            />
        </Canvas>
    );
};

const NotFoundPage = () => {
    return (
        <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#005BBB] via-purple-800 to-[#F67242] text-white flex flex-col items-center justify-center">
            {/* Canvas responsive - حالا flex و h-full برای پوشش کامل */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full"
            >
                <NotFoundScene />
            </motion.div>

            {/* محتوا responsive - متن کوچکتر در موبایل */}
            <div dir={'rtl'} className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center z-10 px-4 w-full max-w-md">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: 'backOut' }}
                    className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg"
                >
                    اوه! این صفحه گم شده.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="text-sm md:text-lg mb-4"
                >
                    بیایید به خانه برگردیم!
                </motion.p>
                <motion.a
                    href="/"
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="px-6 py-3 md:px-8 md:py-4 bg-[#F67242] text-[#005BBB] rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all text-sm md:text-base"
                >
                    بازگشت به صفحه اصلی
                </motion.a>
            </div>
        </div>
    );
};

export default NotFoundPage;