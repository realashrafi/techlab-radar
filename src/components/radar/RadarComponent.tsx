import React, {useRef, useEffect, useState, useCallback} from "react";
import {menuItems, Technology} from "../lib/data";
import AccordionMenu from "../tools/AccordionMenu";

interface RadarChartProps {
    technologies: Technology[];
    onTechnologyHover: (tech: Technology | null) => void;
    onTechnologyClick: (tech: Technology | null) => void;
    selectedTechnology: Technology | null;
    hoveredTechnology: Technology | null;
    needleEnabled?: boolean;
    zoomLevel?: number;
    panOffset?: { x: number; y: number };
    onPanChange?: (offset: { x: number; y: number }) => void;
}

export function RadarChart({
                               technologies,
                               onTechnologyHover,
                               onTechnologyClick,
                               selectedTechnology,
                               hoveredTechnology,
                               needleEnabled = true,
                               zoomLevel: externalZoomLevel = 1,
                               panOffset: externalPanOffset = {x: 0, y: 0},
                               onPanChange,
                           }: RadarChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const [dimensions, setDimensions] = useState({width: 0, height: 0});
    const [needleAngle, setNeedleAngle] = useState(150);
    const [trailOpacity, setTrailOpacity] = useState(1);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({x: 0, y: 0});
    const [isHovered, setIsHovered] = useState(false);
    const [modalTech, setModalTech] = useState<Technology | null>(null);
    const [zoomLevel, setZoomLevel] = useState(externalZoomLevel);
    const [panOffset, setPanOffset] = useState(externalPanOffset);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.max(rect.width, 300),
                    height: Math.max(rect.height, 300),
                });
            }
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const animateNeedle = useCallback(() => {
        if (!needleEnabled || !dimensions.width) return;

        setNeedleAngle((prevAngle) => {
            const increment = 0.5;
            let newAngle = prevAngle + increment;

            let normalizedAngle = newAngle % 360;
            if (normalizedAngle < 0) normalizedAngle += 360;
            const isInArc = (normalizedAngle >= 150 && normalizedAngle <= 360) || (normalizedAngle >= 0 && normalizedAngle <= 30);

            if (newAngle >= 390 || !isInArc) {
                setTrailOpacity(0);
                setTimeout(() => {
                    setTrailOpacity(1);
                    setNeedleAngle(150);
                }, 200);
                return 150;
            }

            if (newAngle >= 360) {
                newAngle -= 360;
            }

            return newAngle;
        });

        animationRef.current = requestAnimationFrame(animateNeedle);
    }, [needleEnabled, dimensions.width]);

    useEffect(() => {
        if (needleEnabled && dimensions.width > 0) {
            animationRef.current = requestAnimationFrame(animateNeedle);
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [animateNeedle, needleEnabled, dimensions.width]);

    const handleZoom = useCallback(
        (delta: number, clientX: number, clientY: number) => {
            if (!canvasRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const mouseY = clientY - rect.top;

            const newZoomLevel = Math.min(Math.max(zoomLevel + delta, 0.5), 3);

            const zoomPointX = (mouseX - panOffset.x) / zoomLevel;
            const zoomPointY = (mouseY - panOffset.y) / zoomLevel;

            const newPanOffsetX = mouseX - zoomPointX * newZoomLevel;
            const newPanOffsetY = mouseY - zoomPointY * newZoomLevel;

            setZoomLevel(newZoomLevel);
            setPanOffset({x: newPanOffsetX, y: newPanOffsetY});
            if (onPanChange) {
                onPanChange({x: newPanOffsetX, y: newPanOffsetY});
            }
        },
        [zoomLevel, panOffset, onPanChange]
    );

    const handleWheel = useCallback(
        (event: WheelEvent) => {
            if (event.shiftKey) {
                event.preventDefault();
                const delta = event.deltaY > 0 ? -0.1 : 0.1;
                handleZoom(delta, event.clientX, event.clientY);
            }
        },
        [handleZoom]
    );

    const handleTouchStart = useCallback((event: TouchEvent) => {
        if (event.touches.length === 2) {
            event.preventDefault();
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const distance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            setLastPinchDistance(distance);
        }
    }, []);

    const handleTouchMove = useCallback(
        (event: TouchEvent) => {
            if (event.touches.length === 2) {
                event.preventDefault();
                const touch1 = event.touches[0];
                const touch2 = event.touches[1];
                const distance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );

                if (lastPinchDistance !== null) {
                    const delta = (distance - lastPinchDistance) * 0.01;
                    const centerX = (touch1.clientX + touch2.clientX) / 2;
                    const centerY = (touch1.clientY + touch2.clientY) / 2;
                    handleZoom(delta, centerX, centerY);
                }

                setLastPinchDistance(distance);
            }
        },
        [lastPinchDistance, handleZoom]
    );

    const handleTouchEnd = useCallback(() => {
        setLastPinchDistance(null);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener("wheel", handleWheel, {passive: false});
            canvas.addEventListener("touchstart", handleTouchStart, {passive: false});
            canvas.addEventListener("touchmove", handleTouchMove, {passive: false});
            canvas.addEventListener("touchend", handleTouchEnd);
            return () => {
                canvas.removeEventListener("wheel", handleWheel);
                canvas.removeEventListener("touchstart", handleTouchStart);
                canvas.removeEventListener("touchmove", handleTouchMove);
                canvas.removeEventListener("touchend", handleTouchEnd);
            };
        }
    }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    const handleZoomIn = () => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const centerX = rect.left + dimensions.width / 2;
        const centerY = rect.top + dimensions.height / 2;
        handleZoom(0.1, centerX, centerY);
    };

    const handleZoomOut = () => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const centerX = rect.left + dimensions.width / 2;
        const centerY = rect.top + dimensions.height / 2;
        handleZoom(-0.1, centerX, centerY);
    };

    useEffect(() => {
        if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.scale(dpr, dpr);

        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        const maxRadius = Math.min(dimensions.width / 2 - 50, dimensions.height / 2 - 50);

        if (maxRadius <= 0) return;

        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        ctx.scale(zoomLevel, zoomLevel);

        const startAngle = (150 * Math.PI) / 180;
        const endAngle = (30 * Math.PI) / 180;
        const fourYearRadius = maxRadius * 0.4;

        const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fourYearRadius);
        innerGradient.addColorStop(0, "#D0D8E233");
        innerGradient.addColorStop(1, "#A0A8B233");

        ctx.beginPath();
        ctx.arc(centerX, centerY, fourYearRadius, startAngle, endAngle, false);
        ctx.arc(centerX, centerY, 0, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = innerGradient;
        ctx.fill();

        const outerGradient = ctx.createRadialGradient(centerX, centerY, fourYearRadius, centerX, centerY, maxRadius);
        outerGradient.addColorStop(0, "#F0F4F826");
        outerGradient.addColorStop(1, "#C0C8D226");

        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle, false);
        ctx.arc(centerX, centerY, fourYearRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = outerGradient;
        ctx.fill();

        const divisions = 10;
        const angleStep = 24;
        ctx.strokeStyle = "#E5E7EB";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;

        for (let i = 0; i <= divisions; i++) {
            const radarAngle = 150 + i * angleStep;
            const canvasAngle = (radarAngle * Math.PI) / 180;
            const x = centerX + Math.cos(canvasAngle) * maxRadius;
            const y = centerY + Math.sin(canvasAngle) * maxRadius;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        const gradientRingRadius = maxRadius + 20;
        const gradientRingWidth = 12;
        const impactGradient = ctx.createLinearGradient(
            centerX + Math.cos(startAngle) * gradientRingRadius,
            centerY + Math.sin(startAngle) * gradientRingRadius,
            centerX + Math.cos(endAngle) * gradientRingRadius,
            centerY + Math.sin(endAngle) * gradientRingRadius
        );
        impactGradient.addColorStop(0, "#E8F4F8");
        impactGradient.addColorStop(0.5, "#B8D4E3");
        impactGradient.addColorStop(1, "#17A398");

        ctx.beginPath();
        ctx.arc(centerX, centerY, gradientRingRadius, startAngle, endAngle, false);
        ctx.arc(centerX, centerY, gradientRingRadius - gradientRingWidth, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = impactGradient;
        ctx.globalAlpha = 0.8;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, gradientRingRadius, startAngle, endAngle, false);
        ctx.strokeStyle = "#D1D5DB";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4;
        ctx.stroke();

        const rings = [
            {years: 2, radius: maxRadius * 0.2, color: "#A0A8B2"},
            {years: 4, radius: maxRadius * 0.4, color: "#B0BAC5"},
            {years: 6, radius: maxRadius * 0.6, color: "#C0CAD8"},
            {years: 8, radius: maxRadius * 0.8, color: "#D0DCEB"},
            {years: 10, radius: maxRadius, color: "#E0EDEF"},
        ];

        rings.forEach((ring) => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, ring.radius, startAngle, endAngle, false);
            ctx.strokeStyle = ring.color;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.fillStyle = "#2E2E2E";
            ctx.globalAlpha = 0.8;
            ctx.font = "10px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`${ring.years}yr`, centerX, centerY - ring.radius - 8);
        });

        ctx.fillStyle = "#2E2E2E";
        ctx.globalAlpha = 0.7;
        ctx.font = "12px Inter, sans-serif";
        ctx.fillText("0% Impact", centerX + Math.cos(startAngle) * (maxRadius + 35), centerY + Math.sin(startAngle) * (maxRadius + 35) + 15);
        ctx.fillText("100% Impact", centerX + Math.cos(endAngle) * (maxRadius + 35), centerY + Math.sin(endAngle) * (maxRadius + 35) + 15);

        const arcSpan = 240;
        const startRadarAngle = 150;

        technologies.forEach((tech, index) => {
            const impactAngle = startRadarAngle + (tech.impact / 100) * arcSpan;
            let radarAngle = impactAngle;

            if (radarAngle >= 360) {
                radarAngle -= 360;
            }

            const canvasAngle = (radarAngle * Math.PI) / 180;
            const normalizedTimeline = Math.min(tech.timeline / 10, 1);
            const radius = normalizedTimeline * maxRadius;

            const x = centerX + Math.cos(canvasAngle) * radius;
            const y = centerY + Math.sin(canvasAngle) * radius;

            const isSelected = selectedTechnology?.id === tech.id;
            const isHovered = hoveredTechnology?.id === tech.id;
            const scale = isSelected ? 1.5 : isHovered ? 1.2 : 1;
            const alpha = isSelected || isHovered ? 1 : 0.9;

            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI);
            ctx.fillStyle = "#FFFFFF";
            ctx.fill();
            ctx.strokeStyle = "#17A398";
            ctx.lineWidth = 2;
            ctx.stroke();

            if (isSelected || isHovered) {
                ctx.beginPath();
                ctx.arc(x, y, 12 * scale, 0, 2 * Math.PI);
                ctx.fillStyle = "#17A398";
                ctx.globalAlpha = 0.2;
                ctx.fill();
            }

            const labelOffset = 15 * scale;
            const labelX = x + Math.cos(canvasAngle) * labelOffset;
            const labelY = y + Math.sin(canvasAngle) * labelOffset;
            const textMetrics = ctx.measureText(tech.name);
            const textWidth = textMetrics.width;
            const textHeight = isSelected ? 14 : isHovered ? 13 : 12;
            const backgroundAlpha = isSelected ? 0.9 : isHovered ? 0.85 : 0.7;
            const backgroundPadding = isSelected || isHovered ? 3 : 2;

            ctx.globalAlpha = backgroundAlpha;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(labelX - textWidth / 2 - backgroundPadding, labelY - textHeight / 2 - 1, textWidth + backgroundPadding * 2, textHeight + 2);

            if (isSelected || isHovered) {
                ctx.strokeStyle = isSelected ? "#17A398" : "#B8D4E3";
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.5;
                ctx.strokeRect(labelX - textWidth / 2 - backgroundPadding, labelY - textHeight / 2 - 1, textWidth + backgroundPadding * 2, textHeight + 2);
            }

            ctx.globalAlpha = 1;
            ctx.fillStyle = isSelected ? "#17A398" : isHovered ? "#2E2E2E" : "#2E2E2E";
            ctx.font = `${isSelected || isHovered ? "bold" : "normal"} ${isSelected ? "12px" : isHovered ? "11px" : "10px"} Inter, sans-serif`;
            ctx.fillText(tech.name, labelX, labelY);

            tech.x = x;
            tech.y = y;
        });

        if (needleEnabled) {
            let normalizedAngle = needleAngle % 360;
            if (normalizedAngle < 0) normalizedAngle += 360;
            const isInArc = (normalizedAngle >= 150 && normalizedAngle <= 360) || (normalizedAngle >= 0 && normalizedAngle <= 30);

            if (isInArc && trailOpacity > 0) {
                const needleCanvasAngle = (normalizedAngle * Math.PI) / 180;
                const needleEndX = centerX + Math.cos(needleCanvasAngle) * maxRadius;
                const needleEndY = centerY + Math.sin(needleCanvasAngle) * maxRadius;

                for (let i = 0; i < 20; i++) {
                    const trailProgress = i / 20;
                    const trailAngleOffset = 20 * trailProgress;
                    let trailAngle = needleAngle - trailAngleOffset;

                    let normalizedTrailAngle = trailAngle % 360;
                    if (normalizedTrailAngle < 0) normalizedTrailAngle += 360;

                    const trailIsInArc = (normalizedTrailAngle >= 150 && normalizedTrailAngle <= 360) || (normalizedTrailAngle >= 0 && normalizedTrailAngle <= 30);
                    if (!trailIsInArc) continue;

                    const trailCanvasAngle = (normalizedTrailAngle * Math.PI) / 180;
                    const trailEndX = centerX + Math.cos(trailCanvasAngle) * maxRadius;
                    const trailEndY = centerY + Math.sin(trailCanvasAngle) * maxRadius;
                    const finalOpacity = (1 - trailProgress) * 0.3 * trailOpacity;

                    if (finalOpacity > 0.01) {
                        ctx.beginPath();
                        ctx.moveTo(centerX, centerY);
                        ctx.lineTo(trailEndX, trailEndY);
                        ctx.strokeStyle = `#17A398${Math.round(finalOpacity * 255).toString(16).padStart(2, "0")}`;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }

                const needleGradient = ctx.createLinearGradient(centerX, centerY, needleEndX, needleEndY);
                needleGradient.addColorStop(0, "#17A39899");
                needleGradient.addColorStop(1, "#17A3981A");

                ctx.shadowBlur = 3;
                ctx.shadowColor = "#17A398";
                ctx.globalAlpha = 0.5 * trailOpacity;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(needleEndX, needleEndY);
                ctx.strokeStyle = needleGradient;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.shadowColor = "transparent";
                ctx.globalAlpha = 1;
            }
        }

        ctx.restore();
    }, [
        dimensions,
        technologies,
        selectedTechnology,
        hoveredTechnology,
        needleAngle,
        needleEnabled,
        trailOpacity,
        zoomLevel,
        panOffset,
    ]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left - panOffset.x) / zoomLevel;
        const y = (event.clientY - rect.top - panOffset.y) / zoomLevel;
        const clickedTech = technologies.find((tech) => {
            if (!tech.x || !tech.y) return false;
            const distance = Math.sqrt((x - tech.x) ** 2 + (y - tech.y) ** 2);
            return distance <= 12 / zoomLevel; // Adjust hitbox size based on zoom
        });
        onTechnologyClick(clickedTech || null);
        if (clickedTech) {
            setModalTech(clickedTech);
        } else {
            setModalTech(null);
        }
    };

    const closeModal = useCallback(() => {
        console.log("closeModal");
        setModalTech(null);
    }, []);

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (event.button === 0) {
            setIsDragging(true);
            setDragStart({x: event.clientX - panOffset.x, y: event.clientY - panOffset.y});
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging && onPanChange) {
            const newPanOffset = {
                x: event.clientX - dragStart.x,
                y: event.clientY - dragStart.y,
            };
            setPanOffset(newPanOffset);
            onPanChange(newPanOffset);
        }
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left - panOffset.x) / zoomLevel;
        const y = (event.clientY - rect.top - panOffset.y) / zoomLevel;
        const hoveredTech = technologies.find((tech) => {
            if (!tech.x || !tech.y) return false;
            const distance = Math.sqrt((x - tech.x) ** 2 + (y - tech.y) ** 2);
            return distance <= 12 / zoomLevel;
        });
        onTechnologyHover(hoveredTech || null);
        canvasRef.current.style.cursor = hoveredTech ? "pointer" : isDragging ? "grabbing" : "grab";
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        onTechnologyHover(null);
    };

    const Modal = ({tech, onClose}: { tech: Technology; onClose: () => void }) => (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] bg-opacity-50 flex items-center justify-center !z-[1000]"
            onClick={() => {
                console.log("Overlay clicked");
                onClose();
            }}
        >
            <div
                className="bg-white/90 backdrop-blur-[2px] p-6 rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto z-[1001]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{tech.name}</h2>
                    <button
                        onClick={() => {
                            console.log("Close button clicked");
                            onClose();
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none focus:ring-2 focus:ring-gray-500 pointer-events-auto"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Sector:</strong> {tech.sector}</p>
                    <p><strong>Trend Cluster:</strong> {tech.trendCluster}</p>
                    <p><strong>Focus Area:</strong> {tech.focusArea}</p>
                    <p><strong>Impact:</strong> {tech.impact}%</p>
                    <p><strong>Timeline:</strong> {tech.timeline} years</p>
                    <p><strong>Department:</strong> {tech.department}</p>
                    <p><strong>Supply Chain Stage:</strong> {tech.supplyChainStage}</p>
                    <p><strong>Trade Channel Type:</strong> {tech.tradeChannelType}</p>
                    <p><strong>Industry:</strong> {tech.industry}</p>
                    <p className="mt-4"><strong>Description:</strong> {tech.description}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className="w-full min-h-[90vh] flex flex-col items-center justify-center bg-white rounded-lg relative overflow-hidden"
        >
            <div
                className={` flex items-center justify-between gap-4  ${isFullscreen ? 'mt-28' : 'lg:mt-8 mt-20'} transition-all`}>
                <div className={'absolute top-36 lg:left-10 '}>
                    <AccordionMenu
                        items={menuItems}
                        onSelectionChange={(keys) => {
                            setSelectedKeys(keys);
                        }}
                    />
                </div>

                <div className={'flex items-center justify-center bg-gray-100 p-5 rounded'}>
                    A
                </div>
                <div className={'flex items-center justify-center bg-gray-100 p-5 rounded'}>
                    B
                </div>
                <div className={'flex items-center justify-center bg-gray-100 p-5 rounded'}>
                    C
                </div>
            </div>
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                className="w-full h-full transition-all"
                style={{width: dimensions.width, height: dimensions.height}}
            />
            <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2">
                <p className="text-xs text-[#2E2E2E]/60 text-center">
                    Distance from center = Implementation timeline • Arc position = Business impact (0-100%)
                </p>
            </div>
            <div className="absolute top-4 right-4 flex space-x-2">
                <button
                    onClick={handleZoomIn}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded"
                    aria-label="Zoom In"
                >
                    +
                </button>
                <button
                    onClick={handleZoomOut}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded"
                    aria-label="Zoom Out"
                >
                    -
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded"
                    aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? "🡯" : "🡭"}
                </button>
            </div>
            {modalTech && <Modal tech={modalTech} onClose={closeModal}/>}
        </div>
    );
}

export default RadarChart;
