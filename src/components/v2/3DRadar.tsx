import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

// تعریف تایپ‌ها
interface Technology {
    id: string;
    name: string;
    impact: number;
    timeline: number;
    sector?: string;
    trendCluster?: string;
    focusArea?: string;
    department?: string;
    supplyChainStage?: string;
    tradeChannelType?: string;
    industry?: string;
    description?: string;
}

interface SelectedTech extends Technology {
    position: [number, number, number];
}

interface RadarChart3DProps {
    technologies?: Technology[];
    onTechnologyClick: (tech: Technology | null) => void;
}

// کامپوننت Scene برای هندل کردن رندر 3D و انیمیشن‌ها
const Scene: React.FC<{
    technologies: Technology[];
    selectedTech: SelectedTech | null;
    setSelectedTech: React.Dispatch<React.SetStateAction<SelectedTech | null>>;
    onTechnologyClick: (tech: Technology | null) => void;
    cameraRef: React.RefObject<THREE.PerspectiveCamera>;
}> = ({ technologies, selectedTech, setSelectedTech, onTechnologyClick, cameraRef }) => {
    const needleRef = useRef<THREE.Line>(null);
    const [needleAngle, setNeedleAngle] = useState<number>(150);

    // انیمیشن نیدل (2D روی صفحه رادار)
    useFrame(() => {
        setNeedleAngle((prev) => {
            const inc = 1;
            let next = prev + inc;
            if (next >= 360) next -= 360;
            return next;
        });

        if (needleRef.current) {
            const a = ((needleAngle % 360) * Math.PI) / 180;
            const r = 5; // شعاع رادار
            const endX = Math.cos(a) * r;
            const endZ = Math.sin(a) * r;
            // آپدیت نقاط خط نیدل
            const points = [
                new THREE.Vector3(0, 0.01, 0), // شروع از مرکز
                new THREE.Vector3(endX, 0.01, endZ), // انتها روی لبه رادار
            ];
            needleRef.current.geometry.setFromPoints(points);
        }
    });

    // انیمیشن دوربین برای فوکوس
    const focusOnTech = (tech: SelectedTech | null) => {
        if (!cameraRef.current) return;
        const pos = tech ? tech.position : [0, 0, 0];
        const targetPosition = tech
            ? [
                pos[0], // x: در مرکز نقطه
                pos[1] + 2, // y: کمی بالاتر برای پرسپکتیو
                pos[2] + 3, // z: فاصله برای دید کامل
            ]
            : [0, 10, 10]; // موقعیت پیش‌فرض برای نمای کلی

        gsap.to(cameraRef.current.position, {
            x: targetPosition[0],
            y: targetPosition[1],
            z: targetPosition[2],
            duration: 1,
            ease: 'power2.out',
            onUpdate: () => {
                if (cameraRef.current) {
                    // دوربین به مرکز نقطه نگاه کند
                    cameraRef.current.lookAt(
                        tech ? new THREE.Vector3(pos[0], pos[1], pos[2]) : new THREE.Vector3(0, 0, 0)
                    );
                }
            },
        });
    };

    // کلیک روی نقاط
    const handleClick = (tech: SelectedTech) => {
        setSelectedTech(tech);
        onTechnologyClick(tech);
        focusOnTech(tech);
    };

    // برگشت به نمای کلی وقتی selectedTech null می‌شود
    useEffect(() => {
        if (!selectedTech) focusOnTech(null);
    }, [selectedTech]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <OrbitControls enablePan={true} enableZoom={true} />

            {/* صفحه رادار */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[5, 64]} />
                <meshStandardMaterial
                    color="#D0D8E2"
                    transparent
                    opacity={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* نیدل (خط 2D) */}
            <line
                //@ts-ignore
                ref={needleRef}>
                <bufferGeometry />
                <lineBasicMaterial color="#17A398" linewidth={2} />
            </line>

            {/* نقاط فناوری‌ها */}
            {technologies.map((tech) => {
                const impactAngle = 150 + (tech.impact / 100) * 240;
                const a = ((impactAngle % 360) * Math.PI) / 180;
                const r = Math.min(tech.timeline / 10, 1) * 5;
                const x = Math.cos(a) * r;
                const z = Math.sin(a) * r;
                return (
                    <group key={tech.id}>
                        <mesh
                            position={[x, 0.1, z]}
                            onClick={() => handleClick({ ...tech, position: [x, 0.1, z] })}
                            onPointerOver={() => (document.body.style.cursor = 'pointer')}
                            onPointerOut={() => (document.body.style.cursor = 'default')}
                        >
                            <sphereGeometry args={[0.2, 16, 16]} />
                            <meshStandardMaterial color="#FFFFFF" />
                        </mesh>
                        <Billboard
                            follow={true}
                            lockX={false}
                            lockY={false}
                            lockZ={false}
                            position={[x, 0.3, z]}
                        >
                            <Text
                                fontSize={0.2}
                                color="#2E2E2E"
                                anchorX="center"
                                anchorY="middle"
                            >
                                {tech.name}
                            </Text>
                        </Billboard>
                    </group>
                );
            })}
        </>
    );
};

// کامپوننت اصلی
const RadarChart3D: React.FC<RadarChart3DProps> = ({ technologies = [], onTechnologyClick }) => {
    const [selectedTech, setSelectedTech] = useState<SelectedTech | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera>(null!); // اطمینان از غیر null بودن

    return (
        <Canvas
            camera={{ position: [0, 10, 10], fov: 50 }}
            style={{ height: '100vh' }}
            onCreated={({ camera }) => {
                cameraRef.current = camera as THREE.PerspectiveCamera;
            }}
        >
            <Scene
                technologies={technologies}
                selectedTech={selectedTech}
                setSelectedTech={setSelectedTech}
                onTechnologyClick={onTechnologyClick}
                cameraRef={cameraRef}
            />
        </Canvas>
    );
};

export default RadarChart3D;