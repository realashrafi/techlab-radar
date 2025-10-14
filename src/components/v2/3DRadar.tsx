//@ts-nocheck
import React, {useRef, useEffect, useState, useCallback} from 'react';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import {OrbitControls, Text, Billboard, Ring, Line} from '@react-three/drei';
import * as THREE from 'three';
import {gsap} from 'gsap';
import {RiFullscreenLine, RiFullscreenExitLine} from 'react-icons/ri';
import {FiZoomIn, FiZoomOut, FiRefreshCw} from 'react-icons/fi';
import {Technology, MenuItem} from '../lib/data';
import AccordionMenu from '../tools/AccordionMenu';
import {CustomExportControls} from '../tools/CustomExportControls';
import {labelOverrides, LabelOverride} from './labelOverrides';
import {fetchTechnologies} from './fetchTechnologies';
import {motion, AnimatePresence} from 'framer-motion';

// Utility functions
const areArraysEqual = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
};

const areMenuItemsEqual = (items1: MenuItem[], items2: MenuItem[]): boolean => {
    if (items1.length !== items2.length) return false;
    return items1.every((item1, index) => {
        const item2 = items2[index];
        if (item1.key !== item2.key || item1.title !== item2.title) return false;
        if (!item1.children && !item2.children) return true;
        if (!item1.children || !item2.children || item1.children.length !== item2.children.length) return false;
        return item1.children.every((child1, childIndex) => {
            const child2 = item2.children![childIndex];
            return child1.key === child2.key && child1.title === child2.title;
        });
    });
};

const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> => {
        return new Promise((resolve) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => resolve(func(...args)), wait);
        });
    };
};

// Props interface
interface RadarChart3DProps {
    onTechnologyHover: (tech: Technology | null) => void;
    onTechnologyClick: (tech: Technology | null) => void;
    selectedTechnology: Technology | null;
    hoveredTechnology: Technology | null;
    needleEnabled?: boolean;
}

export function RadarChart3D({
                                 onTechnologyHover,
                                 onTechnologyClick,
                                 selectedTechnology,
                                 hoveredTechnology,
                                 needleEnabled = true,
                             }: RadarChart3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const initialMenuItemsRef = useRef<MenuItem[] | null>(null);
    const controlsRef = useRef<any>(null);

    const [apiTechnologies, setApiTechnologies] = useState<Technology[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [summary, setSummary] = useState<{
        total_technologies: number;
        high_impact: number;
        near_term: number
    }>({total_technologies: 0, high_impact: 0, near_term: 0});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [modalTech, setModalTech] = useState<Technology | null>(null);
    const [localOverrides, setLocalOverrides] = useState<Record<string, LabelOverride>>({});

    const debouncedFetchTechnologies = useCallback(debounce(fetchTechnologies, 300), []);

    const getOverrideFor = (tech: Technology): LabelOverride | null => {
        const byId = localOverrides[String(tech.id)] || labelOverrides[String(tech.id)];
        const byName = localOverrides[tech.name] || labelOverrides[tech.name];
        return byId || byName || null;
    };

    const handleSelectionChange = useCallback((newKeys: string[]) => {
        setSelectedKeys((prev) => (areArraysEqual(prev, newKeys) ? prev : newKeys));
    }, []);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        debouncedFetchTechnologies(selectedKeys)
            .then((data) => {
                const uniqueTechnologies = data.technologies.filter((tech, index, self) =>
                    index === self.findIndex((t) => t.id === tech.id)
                );
                setApiTechnologies(uniqueTechnologies);
                setSummary(data.summary);
                if (!initialMenuItemsRef.current) {
                    initialMenuItemsRef.current = data.menuItems;
                    setMenuItems(data.menuItems);
                } else if (!areMenuItemsEqual(initialMenuItemsRef.current, data.menuItems)) {
                    initialMenuItemsRef.current = data.menuItems;
                    setMenuItems(data.menuItems);
                }
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [selectedKeys, debouncedFetchTechnologies]);

    useEffect(() => {
        const update = () => {
        };
        window.addEventListener('resize', update);
        document.addEventListener('fullscreenchange', () => setIsFullscreen(!!document.fullscreenElement));
        return () => {
            window.removeEventListener('resize', update);
            document.removeEventListener('fullscreenchange', update);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    const handleZoomIn = () => {
        if (controlsRef.current) controlsRef.current.dollyIn(1.2);
    };
    const handleZoomOut = () => {
        if (controlsRef.current) controlsRef.current.dollyOut(1.2);
    };
    const handleResetZoom = () => {
        if (controlsRef.current) controlsRef.current.reset();
    };

    const totalTechnologies = summary.total_techonologies;
    const highImpactTechnologies = summary.high_impact;
    const nearTermTechnologies = summary.near_term;

    const LoadingSpinner = () => (
        <div className="flex items-center justify-center h-full">
            <p className="ml-4 text-lg text-[#F67242]">Loading...</p>
        </div>
    );

    const Modal = ({ tech, onClose }: { tech: Technology; onClose: () => void }) => {
        // انیمیشن‌ها
        const modalVariants = {
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
            exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
        };

        const backdropVariants = {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
            exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
        };

        return (
            <motion.div
                className="fixed inset-0 z-[999999] flex items-center justify-center"
                style={{ pointerEvents: 'auto', userSelect: 'none' }}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={backdropVariants} // انیمیشن رو به backdrop منتقل کردم
            >
                <motion.div
                    className="fixed inset-0 z-[999998]"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                />
                <motion.div
                    className="bg-white/95 p-4 rounded-lg max-w-[90%] md:max-w-md w-full max-h-[80vh] overflow-y-auto shadow-lg"
                    style={{ pointerEvents: 'auto' }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={modalVariants}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">{tech.name}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Sector:</strong> {tech.sector || 'N/A'}</p>
                        <p><strong>Trend Cluster:</strong> {tech.trendCluster || 'N/A'}</p>
                        <p><strong>Focus Area:</strong> {tech.focusArea || 'N/A'}</p>
                        <p><strong>Impact:</strong> {tech.impact}%</p>
                        <p><strong>Timeline:</strong> {tech.timeline} years</p>
                        <p><strong>Department:</strong> {tech.department || 'N/A'}</p>
                        <p><strong>Supply Chain Stage:</strong> {tech.supplyChainStage || 'N/A'}</p>
                        <p><strong>Trade Channel Type:</strong> {tech.tradeChannelType || 'N/A'}</p>
                        <p><strong>Industry:</strong> {tech.industry || 'N/A'}</p>
                        <p className="mt-4"><strong>Description:</strong> {tech.description || 'N/A'}</p>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div ref={containerRef}
             className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center rounded-lg relative overflow-hidden"
             style={{zIndex: 1}}>
            {error ? (
                <div className="flex items-center justify-center h-full text-red-500">{error}</div>
            ) : isLoading ? (
                <LoadingSpinner/>
            ) : (
                <>
                    <div className="flex items-center justify-between gap-4 lg:mt-8 mt-20 transition-all"
                         style={{zIndex: 1000}}>
                        <div className="absolute top-40 lg:left-10">
                            <AccordionMenu items={menuItems} onSelectionChange={handleSelectionChange}
                                           selectedKeys={selectedKeys} style={{zIndex: 1001}}/>
                        </div>
                        <div
                            className="flex flex-col items-start justify-center lg:text-[14px] text-[12px] bg-gray-50 p-3 lg:min-w-68 border border-black/10 rounded-md">
                            <span>Total Technologies</span>
                            <span className="font-bold">{totalTechnologies}</span>
                        </div>
                        <div
                            className="flex flex-col items-start justify-center lg:text-[14px] text-[12px] bg-gray-50 p-3 lg:min-w-68 border border-black/10 rounded-md">
                            <span>High Impact</span>
                            <span className="font-bold">{highImpactTechnologies}</span>
                        </div>
                        <div
                            className="flex flex-col items-start justify-center lg:text-[14px] text-[12px] bg-gray-50 p-3 lg:min-w-68 border border-black/10 rounded-md">
                            <span>Near Term</span>
                            <span className="font-bold">{nearTermTechnologies}</span>
                        </div>
                    </div>

                    <Canvas camera={{position: [0, 10, 10], fov: 50}} style={{height: '100vh', zIndex: 1}}>
                        <Scene
                            technologies={apiTechnologies}
                            onTechnologyHover={onTechnologyHover}
                            onTechnologyClick={(tech) => {
                                onTechnologyClick(tech);
                                setModalTech(tech);
                            }}
                            selectedTechnology={selectedTechnology}
                            hoveredTechnology={hoveredTechnology}
                            needleEnabled={needleEnabled}
                            getOverrideFor={getOverrideFor}
                            controlsRef={controlsRef}
                        />
                    </Canvas>

                    <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2">
                        <p className="text-xs text-[#2E2E2E]/60 text-center">
                            Distance from center = Implementation timeline • Arc position = Business impact (0-100%)
                        </p>
                    </div>

                    <div className="absolute lg:top-28 top-8 left-8 lg:left-12 flex space-x-3">
                        <button onClick={handleZoomIn}
                                className="bg-[#F67242] hover:bg-[#F67242]/80 text-white font-bold p-3 rounded">
                            <FiZoomIn/>
                        </button>
                        <button onClick={handleZoomOut}
                                className="bg-[#F67242] hover:bg-[#F67242]/80 text-white font-bold p-3 rounded">
                            <FiZoomOut/>
                        </button>
                        <button onClick={handleResetZoom}
                                className="bg-[#F67242] hover:bg-[#F67242]/80 text-white font-bold p-3 rounded">
                            <FiRefreshCw/>
                        </button>
                        <button onClick={toggleFullscreen}
                                className="bg-[#F67242] hover:bg-[#F67242]/80 text-white font-bold p-3 rounded">
                            {isFullscreen ? <RiFullscreenExitLine/> : <RiFullscreenLine/>}
                        </button>
                    </div>

                    <div className="absolute lg:top-28 top-8 right-8 flex space-x-2">
                        <CustomExportControls technologies={apiTechnologies}/>
                    </div>

                    <AnimatePresence>
                        {modalTech && (
                            <Modal tech={modalTech} onClose={() => {
                                setModalTech(null);
                                onTechnologyClick(null);
                            }} />
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}

const Scene: React.FC<{
    technologies: Technology[];
    onTechnologyHover: (tech: Technology | null) => void;
    onTechnologyClick: (tech: Technology | null) => void;
    selectedTechnology: Technology | null;
    hoveredTechnology: Technology | null;
    needleEnabled: boolean;
    getOverrideFor: (tech: Technology) => LabelOverride | null;
    controlsRef: React.RefObject<any>;
}> = ({
          technologies,
          onTechnologyHover,
          onTechnologyClick,
          selectedTechnology,
          hoveredTechnology,
          needleEnabled,
          getOverrideFor,
          controlsRef
      }) => {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const needleRef = useRef<THREE.Line>(null);
    const [needleAngle, setNeedleAngle] = useState(150); // شروع از 150 درجه مثل دوبعدی
    const [trailOpacity, setTrailOpacity] = useState(1);
    const backgroundTexture = useLoader(THREE.TextureLoader, '/iran2.jpeg');

    const maxRadius = 5;
    const fourYearRadius = maxRadius * 0.4;
    const startAngleDeg = 150; // شروع از 150 درجه مثل دوبعدی
    const endAngleDeg = 30;    // پایان در 30 درجه
    const arcSpan = 240;       // محدوده 240 درجه

    useFrame(() => {
        if (!needleEnabled) return;
        setNeedleAngle((prev) => {
            const inc = 0.5;
            let next = prev + inc;
            let n = next % 360;
            if (n < 0) n += 360;
            const inArc = (n >= 150 && n <= 360) || (n >= 0 && n <= 30);
            if (next >= 390 || !inArc) {
                setTrailOpacity(0);
                setTimeout(() => {
                    setTrailOpacity(1);
                    setNeedleAngle(150);
                }, 200);
                return 150;
            }
            if (next >= 360) next -= 360;
            return next;
        });

        if (needleRef.current) {
            const a = ((needleAngle % 360) * Math.PI) / 180;
            const endX = Math.cos(a) * maxRadius;
            const endZ = Math.sin(a) * maxRadius;
            const points = [new THREE.Vector3(0, 0.01, 0), new THREE.Vector3(endX, 0.01, endZ)];
            needleRef.current.geometry.setFromPoints(points);
            needleRef.current.material.opacity = trailOpacity;
        }
    });

    useEffect(() => {
        if (!cameraRef.current || !selectedTechnology) return;
        const tech = technologies.find(t => t.id === selectedTechnology.id);
        if (!tech) return;
        const pos = calculatePosition(tech);
        const targetPosition = [pos[0], pos[1] + 2, pos[2] + 3];
        gsap.to(cameraRef.current.position, {
            x: targetPosition[0],
            y: targetPosition[1],
            z: targetPosition[2],
            duration: 1,
            ease: 'power2.out',
            onUpdate: () => cameraRef.current.lookAt(new THREE.Vector3(...pos)),
        });
    }, [selectedTechnology, technologies]);

    const calculatePosition = (tech: Technology): [number, number, number] => {
        const impactAngle = startAngleDeg + (tech.impact / 100) * arcSpan;
        const a = ((impactAngle % 360) * Math.PI) / 180;
        const r = Math.min(tech.timeline / 10, 1) * maxRadius;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        return [x, 0.1, z]; // z ثابت برای شبیه‌سازی صفحه دوبعدی
    };

    const adjustLabelPosition = (pos: [number, number, number], tech: Technology) => {
        // const override = getOverrideFor(tech);
        // if (override && override.mode === 'rel') {
        //     return [pos[0] + (override.dx || 0), pos[1] + (override.dy || 0), pos[2] + (override.dz || 0)];
        // }

        // قرار دادن لیبل مستقیماً بالای نقطه با جابجایی عمودی ثابت
        return [pos[0], pos[1] + 0.5, pos[2]]; // 0.5 واحد بالا
    };

    return (
        <>
            <ambientLight intensity={0.5}/>
            <pointLight position={[10, 10, 10]} intensity={1}/>
            <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} target={[0, 0, 0]}/>

            {/* Inner radar sector */}
            <mesh rotation={[-Math.PI / 2, 0, (startAngleDeg - 90) * Math.PI / 180]}>
                <ringGeometry args={[0, fourYearRadius, 64, 1, 0, arcSpan * Math.PI / 180]}/>
                <meshStandardMaterial color="#D0D8E233" transparent opacity={1} side={THREE.DoubleSide}/>
            </mesh>

            {/* Outer radar sector */}
            <mesh rotation={[-Math.PI / 2, 0, (startAngleDeg - 90) * Math.PI / 180]}>
                <ringGeometry args={[fourYearRadius, maxRadius, 64, 1, 0, arcSpan * Math.PI / 180]}/>
                <meshStandardMaterial color="#F0F4F826" transparent opacity={1} side={THREE.DoubleSide}/>
            </mesh>

            {/* Background image */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[maxRadius, 64]}/>
                <meshBasicMaterial map={backgroundTexture} transparent opacity={0.1} side={THREE.DoubleSide}/>
            </mesh>

            {/* Time rings */}
            {[
                {years: 2, radius: maxRadius * 0.2, color: '#A0A8B2'},
                {years: 4, radius: maxRadius * 0.4, color: '#B0BAC5'},
                {years: 6, radius: maxRadius * 0.6, color: '#C0CAD8'},
                {years: 8, radius: maxRadius * 0.8, color: '#D0DCEB'},
                {years: 10, radius: maxRadius, color: '#E0EDEF'},
            ].map((ring) => (
                <Ring key={ring.years}
                      args={[ring.radius - 0.01, ring.radius + 0.01, 64, 1, (startAngleDeg - 90) * Math.PI / 180, arcSpan * Math.PI / 180]}
                      rotation={[-Math.PI / 2, 0, 0]}>
                    <meshBasicMaterial color={ring.color}/>
                </Ring>
            ))}

            {/* Edge texts for impact */}
            <Billboard
                position={[Math.cos((startAngleDeg * Math.PI) / 180) * (maxRadius + 1), 0.1, Math.sin((startAngleDeg * Math.PI) / 180) * (maxRadius + 1)]}>
                <Text fontSize={0.2} color="#2E2E2E">0% Impact</Text>
            </Billboard>
            <Billboard
                position={[Math.cos((endAngleDeg * Math.PI) / 180) * (maxRadius + 1), 0.1, Math.sin((endAngleDeg * Math.PI) / 180) * (maxRadius + 1)]}>
                <Text fontSize={0.2} color="#2E2E2E">100% Impact</Text>
            </Billboard>

            {/* Needle */}
            <line ref={needleRef}>
                <bufferGeometry/>
                <lineBasicMaterial color="#17A398" linewidth={3} transparent opacity={trailOpacity}/>
            </line>

            {/* Technologies points and labels */}
            {technologies.map((tech) => {
                const pos = calculatePosition(tech);
                const isSelected = selectedTechnology?.id === tech.id;
                const isHovered = hoveredTechnology?.id === tech.id;
                const scale = isSelected ? 1.4 : isHovered ? 1.2 : 1;
                const labelPos = adjustLabelPosition(pos, tech);

                return (
                    <group key={String(tech.id) + tech.name}>
                        <mesh
                            position={pos}
                            scale={scale}
                            onClick={() => onTechnologyClick(tech)}
                            onPointerOver={() => onTechnologyHover(tech)}
                            onPointerOut={() => onTechnologyHover(null)}
                        >
                            <sphereGeometry args={[0.1, 8, 8]}/>
                            <meshStandardMaterial color={isHovered || isSelected ? '#17A398' : '#000000'}
                                                  emissive={isSelected ? '#17A398' : '#079a8f'}/>
                        </mesh>
                        <Billboard position={labelPos}>
                            <Text fontSize={0.1 * scale} color={isSelected ? '#17A398' : '#2E2E2E'} anchorX="center"
                                  anchorY="middle">
                                {tech.name}
                            </Text>
                        </Billboard>
                    </group>
                );
            })}
        </>
    );
};

export default RadarChart3D;