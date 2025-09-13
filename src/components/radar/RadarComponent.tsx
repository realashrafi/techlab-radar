"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Technology } from "../lib/data";

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
                               zoomLevel = 1,
                               panOffset = { x: 0, y: 0 },
                               onPanChange,
                           }: RadarChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [needleAngle, setNeedleAngle] = useState(150);
    const [trailOpacity, setTrailOpacity] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [modalTech, setModalTech] = useState<Technology | null>(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (canvasRef.current?.parentElement) {
                const rect = canvasRef.current.parentElement.getBoundingClientRect();
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

            if (newAngle >= 390) {
                setTrailOpacity(0);
                setTimeout(() => setTrailOpacity(1), 200);
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
            { years: 2, radius: maxRadius * 0.2, color: "#A0A8B2" },
            { years: 4, radius: maxRadius * 0.4, color: "#B0BAC5" },
            { years: 6, radius: maxRadius * 0.6, color: "#C0CAD8" },
            { years: 8, radius: maxRadius * 0.8, color: "#D0DCEB" },
            { years: 10, radius: maxRadius, color: "#E0EDEF" },
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

            tech.x = (x - panOffset.x) / zoomLevel;
            tech.y = (y - panOffset.y) / zoomLevel;
        });

        if (needleEnabled) {
            let normalizedAngle = needleAngle % 360;
            if (normalizedAngle < 0) normalizedAngle += 360;
            const needleCanvasAngle = (normalizedAngle * Math.PI) / 180;
            const needleEndX = centerX + Math.cos(needleCanvasAngle) * maxRadius;
            const needleEndY = centerY + Math.sin(needleCanvasAngle) * maxRadius;

            for (let i = 0; i < 20; i++) {
                const trailProgress = i / 20;
                const trailAngleOffset = 20 * trailProgress;
                let trailAngle = needleAngle - trailAngleOffset;

                let normalizedTrailAngle = trailAngle % 360;
                if (normalizedTrailAngle < 0) normalizedTrailAngle += 360;

                const isInArc = (normalizedTrailAngle >= 150 && normalizedTrailAngle <= 360) || (normalizedTrailAngle >= 0 && normalizedTrailAngle <= 30);
                if (!isInArc) continue;

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
            ctx.globalAlpha = 0.5;
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
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const clickedTech = technologies.find((tech) => {
            if (!tech.x || !tech.y) return false;
            const distance = Math.sqrt((x - tech.x) ** 2 + (y - tech.y) ** 2);
            return distance <= 12;
        });
        onTechnologyClick(clickedTech || null);
        if (clickedTech) {
            setModalTech(clickedTech);
        } else {
            setModalTech(null);
        }
    };

    const closeModal = () => {
        console.log("closeModal");
        setModalTech(null);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (event.button === 0) {
            setIsDragging(true);
            setDragStart({ x: event.clientX - panOffset.x, y: event.clientY - panOffset.y });
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging && onPanChange) {
            onPanChange({
                x: event.clientX - dragStart.x,
                y: event.clientY - dragStart.y,
            });
        }
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const hoveredTech = technologies.find((tech) => {
            if (!tech.x || !tech.y) return false;
            const distance = Math.sqrt((x - tech.x) ** 2 + (y - tech.y) ** 2);
            return distance <= 12;
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

    const Modal = ({ tech, onClose }: { tech: Technology; onClose: () => void }) => (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] bg-opacity-50 flex items-center justify-center !z-[1000]"
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
        <div className="w-full h-[70vh] lg:h-[100vh] flex items-center justify-center bg-white rounded-lg relative ">
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                className="w-full h-full"
                style={{ width: dimensions.width, height: dimensions.height }}
            />
            <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2">
                <p className="text-xs text-[#2E2E2E]/60 text-center">
                    Distance from center = Implementation timeline • Arc position = Business impact (0-100%)
                </p>
            </div>
            {modalTech && <Modal tech={modalTech} onClose={closeModal} />}
        </div>
    );
}

export default RadarChart;