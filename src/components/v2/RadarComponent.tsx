//@ts-nocheck
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RiFullscreenLine, RiFullscreenExitLine } from 'react-icons/ri';
import { FiZoomIn, FiZoomOut, FiRefreshCw } from 'react-icons/fi';
import { Technology, MenuItem } from '../lib/data';
import AccordionMenu from '../tools/AccordionMenu';
import { CustomExportControls } from '../tools/CustomExportControls';
import { labelOverrides, LabelOverride } from './labelOverrides';
import { fetchTechnologies } from './fetchTechnologies';
import Loading from "../layout/Loading";

// Utility to compare arrays for equality
const areArraysEqual = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
};

// Deep comparison for menuItems
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

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> => {
        return new Promise((resolve) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                resolve(func(...args));
            }, wait);
        });
    };
};

interface RadarChartProps {
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
                               onTechnologyHover,
                               onTechnologyClick,
                               selectedTechnology,
                               hoveredTechnology,
                               needleEnabled = true,
                               zoomLevel: externalZoomLevel = 1,
                               panOffset: externalPanOffset = { x: 0, y: 0 },
                               onPanChange,
                           }: RadarChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const initialMenuItemsRef = useRef<MenuItem[] | null>(null); // Store initial menuItems

    const [apiTechnologies, setApiTechnologies] = useState<Technology[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [summary, setSummary] = useState<{
        total_technologies: number;
        high_impact: number;
        near_term: number;
    }>({ total_technologies: 0, high_impact: 0, near_term: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [needleAngle, setNeedleAngle] = useState(150);
    const [trailOpacity, setTrailOpacity] = useState(1);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [zoomLevel, setZoomLevel] = useState(externalZoomLevel);
    const [panOffset, setPanOffset] = useState(externalPanOffset);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);

    // Panning/editing state
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Positions for points and labels
    const [techPositions, setTechPositions] = useState<Record<string, { x: number; y: number }>>({});
    const [labelPositions, setLabelPositions] = useState<
        Record<string, { x: number; y: number; lineStartX: number; lineStartY: number }>
    >({});

    // Manual label editing
    const [editLabelsMode, setEditLabelsMode] = useState(false);
    const draggingLabelRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
    const [localOverrides, setLocalOverrides] = useState<Record<string, LabelOverride>>({});
    const labelBoxesRef = useRef<Record<string, { x: number; y: number; w: number; h: number }>>({});

    // Modal
    const [modalTech, setModalTech] = useState<Technology | null>(null);

    // Helper: Get override (local first, then file)
    const getOverrideFor = (tech: Technology): LabelOverride | null => {
        const byId = localOverrides[String(tech.id)] || labelOverrides[String(tech.id)];
        const byName = localOverrides[tech.name] || labelOverrides[tech.name];
        return byId || byName || null;
    };

    // Statistics from summary
    const totalTechnologies = summary.total_techonologies;
    const highImpactTechnologies = summary.high_impact;
    const nearTermTechnologies = summary.near_term;

    // Debounced fetch
    const debouncedFetchTechnologies = useCallback(debounce(fetchTechnologies, 300), []);

    // Optimized selection change handler
    const handleSelectionChange = useCallback((newKeys: string[]) => {
        setSelectedKeys((prev) => {
            if (areArraysEqual(prev, newKeys)) return prev;
            return newKeys;
        });
    }, []);

    // Fetch data
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        debouncedFetchTechnologies(selectedKeys)
            .then((data) => {
                setApiTechnologies(data.technologies);
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

    // Rest of the useEffect hooks and other functions remain the same
    // Dimensions
    useEffect(() => {
        const update = () => {
            if (!containerRef.current) return;
            const r = containerRef.current.getBoundingClientRect();
            setDimensions({ width: Math.max(r.width, 300), height: Math.max(r.height, 300) });
        };
        update();
        window.addEventListener('resize', update);
        document.addEventListener('fullscreenchange', update);
        return () => {
            window.removeEventListener('resize', update);
            document.removeEventListener('fullscreenchange', update);
        };
    }, []);

    // Needle animation
    const animateNeedle = useCallback(() => {
        if (!needleEnabled || !dimensions.width) return;
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
        animationRef.current = requestAnimationFrame(animateNeedle);
    }, [needleEnabled, dimensions.width]);

    useEffect(() => {
        if (needleEnabled && dimensions.width) {
            animationRef.current = requestAnimationFrame(animateNeedle);
        }
        return () => animationRef.current && cancelAnimationFrame(animationRef.current);
    }, [animateNeedle, needleEnabled, dimensions.width]);

    // Zoom/pan
    const handleZoom = useCallback(
        (delta: number, clientX: number, clientY: number) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const mouseY = clientY - rect.top;
            const newZoom = Math.min(Math.max(zoomLevel + delta, 0.5), 3);
            const zx = (mouseX - panOffset.x) / zoomLevel;
            const zy = (mouseY - panOffset.y) / zoomLevel;
            const newPanX = mouseX - zx * newZoom;
            const newPanY = mouseY - zy * newZoom;
            setZoomLevel(newZoom);
            setPanOffset({ x: newPanX, y: newPanY });
            onPanChange?.({ x: newPanX, y: newPanY });
        },
        [zoomLevel, panOffset, onPanChange]
    );

    const handleResetZoom = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        onPanChange?.({ x: 0, y: 0 });
    };

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            if (e.shiftKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                handleZoom(delta, e.clientX, e.clientY);
            }
        },
        [handleZoom]
    );

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const [t1, t2] = [e.touches[0], e.touches[1]];
                setLastPinchDistance(Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY));
            }
        },
        []
    );

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const [t1, t2] = [e.touches[0], e.touches[1]];
                const d = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                if (lastPinchDistance !== null) {
                    const delta = (d - lastPinchDistance) * 0.01;
                    handleZoom(delta, (t1.clientX + t2.clientX) / 2, (t1.clientY + t2.clientY) / 2);
                }
                setLastPinchDistance(d);
            }
        },
        [lastPinchDistance, handleZoom]
    );

    const handleTouchEnd = useCallback(() => setLastPinchDistance(null), []);

    useEffect(() => {
        const cv = canvasRef.current;
        if (!cv) return;
        cv.addEventListener('wheel', handleWheel, { passive: false });
        cv.addEventListener('touchstart', handleTouchStart, { passive: false });
        cv.addEventListener('touchmove', handleTouchMove, { passive: false });
        cv.addEventListener('touchend', handleTouchEnd);
        return () => {
            cv.removeEventListener('wheel', handleWheel);
            cv.removeEventListener('touchstart', handleTouchStart);
            cv.removeEventListener('touchmove', handleTouchMove);
            cv.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

    // Reset label cache on layout change
    useEffect(() => {
        setLabelPositions({});
    }, [apiTechnologies, zoomLevel, dimensions.width, dimensions.height]);

    function toggleFullscreen() {
        if (!containerRef.current) return;
        if (!isFullscreen) containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
        else document.exitFullscreen().then(() => setIsFullscreen(false));
    }

    const handleZoomIn = () => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        handleZoom(0.1, rect.left + dimensions.width / 2, rect.top + dimensions.height / 2);
    };

    const handleZoomOut = () => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        handleZoom(-0.1, rect.left + dimensions.width / 2, rect.top + dimensions.height / 2);
    };

    const pickNearestLabel = (worldX: number, worldY: number): string | null => {
        let bestId: string | null = null;
        let bestD = Infinity;
        for (const [id, pos] of Object.entries(labelPositions)) {
            const d = Math.hypot(worldX - (pos as any).x, worldY - (pos as any).y);
            if (d < bestD) {
                bestD = d;
                bestId = id;
            }
        }
        return bestD <= 40 ? bestId : null;
    };

    // Automatic label placement (when no override)
    const placeLabelWithCollision = (
        ctx: CanvasRenderingContext2D,
        pointX: number,
        pointY: number,
        angleRad: number,
        maxRadius: number,
        text: string,
        scale: number,
        occupiedLabels: any[],
        isHovered: boolean,
        isSelected: boolean
    ) => {
        const baseOffset = isSelected || isHovered ? 22 : 12;
        const textMetrics = ctx.measureText(text);
        let textWidth = textMetrics.width;
        let textHeight = 12;
        const padding = 2;
        let boxWidth = textWidth + padding * 2 + 4;
        let boxHeight = textHeight + 2 + 4;

        const candidates: any[] = [];
        const directions = [
            { angle: angleRad + Math.PI / 2 },
            { angle: angleRad - Math.PI / 2 },
            { angle: angleRad },
            { angle: angleRad + Math.PI },
            { angle: angleRad + (3 * Math.PI) / 4 },
            { angle: angleRad + Math.PI / 4 },
            { angle: angleRad - (3 * Math.PI) / 4 },
            { angle: angleRad - Math.PI / 4 },
        ];

        directions.forEach((dir) => {
            for (let offsetLevel = 0; offsetLevel < 5; offsetLevel++) {
                const offset = baseOffset + offsetLevel * 10;
                let labelX = pointX + Math.cos(dir.angle) * offset;
                let labelY = pointY + Math.sin(dir.angle) * offset;
                let lineStartX = pointX;
                let lineStartY = pointY;
                let score = calculateOverlapScore(
                    {
                        x: labelX - textWidth / 2 - padding,
                        y: labelY - textHeight / 2 - 1,
                        width: boxWidth,
                        height: boxHeight,
                    },
                    occupiedLabels
                );
                score += Math.hypot(labelX - pointX, labelY - pointY) * 0.04;
                candidates.push({ labelX, labelY, lineStartX, lineStartY, score });
            }
        });

        for (let radialLevel = 0; radialLevel < 3; radialLevel++) {
            const radialOffset = baseOffset + 20 + radialLevel * 10;
            let labelX = pointX + Math.cos(angleRad) * radialOffset;
            let labelY = pointY + Math.sin(angleRad) * radialOffset;
            let lineStartX = pointX + Math.cos(angleRad) * (radialOffset - 12);
            let lineStartY = pointY + Math.sin(angleRad) * (radialOffset - 12);
            let score = calculateOverlapScore(
                {
                    x: labelX - textWidth / 2 - padding,
                    y: labelY - textHeight / 2 - 1,
                    width: boxWidth,
                    height: boxHeight,
                },
                occupiedLabels
            );
            score += Math.hypot(labelX - pointX, labelY - pointY) * 0.04;
            candidates.push({ labelX, labelY, lineStartX, lineStartY, score });
        }

        let best = candidates.sort((a, b) => a.score - b.score)[0];
        const box = {
            x: best.labelX - textWidth / 2 - padding,
            y: best.labelY - textHeight / 2 - 1,
            width: boxWidth,
            height: boxHeight,
        };
        occupiedLabels.push(box);
        return {
            labelX: best.labelX,
            labelY: best.labelY,
            lineStartX: best.lineStartX,
            lineStartY: best.lineStartY,
            box,
            score: best.score,
        };
    };

    function calculateOverlapScore(newBox: any, occupied: any[]) {
        let score = 0;
        for (let existing of occupied) {
            const dx = Math.abs(newBox.x - existing.x);
            const dy = Math.abs(newBox.y - existing.y);
            const overlapX = Math.max(0, newBox.width / 2 + existing.width / 2 + 2 - dx);
            const overlapY = Math.max(0, newBox.height / 2 + existing.height / 2 + 2 - dy);
            if (overlapX > 0 && overlapY > 0) score += (overlapX * overlapY) / 50;
        }
        return score;
    }

    // Background image
    const backgroundImage = React.useMemo(() => {
        const img = new Image();
        img.src = '/iran2.jpeg';
        return img;
    }, []);

    useEffect(() => {
        backgroundImage.onerror = () => {
            console.error('Failed to load background image');
        };
    }, [backgroundImage]);

    useEffect(() => {
        if (!canvasRef.current || !dimensions.width || !dimensions.height) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.scale(dpr, dpr);

        const renderRadar = () => {
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            ctx.scale(zoomLevel, zoomLevel);

            const centerX = dimensions.width / 2;
            const centerY = dimensions.height / 2;
            const maxRadius = Math.min(dimensions.width / 2 - 50, dimensions.height / 2 - 50);
            const startAngle = (150 * Math.PI) / 180;
            const endAngle = (30 * Math.PI) / 180;
            const fourYearRadius = maxRadius * 0.4;

            // innerGradient for 0-4 years
            const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fourYearRadius);
            innerGradient.addColorStop(0, '#D0D8E233');
            innerGradient.addColorStop(1, '#A0A8B233');

            ctx.beginPath();
            ctx.arc(centerX, centerY, fourYearRadius, startAngle, endAngle, false);
            ctx.arc(centerX, centerY, 0, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = innerGradient;
            ctx.fill();

            // outerGradient for 4+ years
            const outerGradient = ctx.createRadialGradient(centerX, centerY, fourYearRadius, centerX, centerY, maxRadius);
            outerGradient.addColorStop(0, '#F0F4F826');
            outerGradient.addColorStop(1, '#C0C8D226');

            ctx.beginPath();
            ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle, false);
            ctx.arc(centerX, centerY, fourYearRadius, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = outerGradient;
            ctx.fill();

            // Background
            if (backgroundImage.complete && backgroundImage.naturalWidth !== 0) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle, false);
                ctx.arc(centerX, centerY, fourYearRadius, endAngle, startAngle, true);
                ctx.closePath();
                ctx.clip();

                const worldLeft = -panOffset.x / zoomLevel;
                const worldTop = -panOffset.y / zoomLevel;
                const worldWidth = dimensions.width / zoomLevel;
                const worldHeight = dimensions.height / zoomLevel;

                const imgAspect = backgroundImage.naturalWidth / backgroundImage.naturalHeight;
                const viewAspect = worldWidth / worldHeight;
                let drawWidth, drawHeight, offsetX, offsetY;

                if (imgAspect > viewAspect) {
                    drawHeight = worldHeight;
                    drawWidth = drawHeight * imgAspect;
                    offsetX = worldLeft - (drawWidth - worldWidth) / 2;
                    offsetY = worldTop;
                } else {
                    drawWidth = worldWidth;
                    drawHeight = drawWidth / imgAspect;
                    offsetX = worldLeft;
                    offsetY = worldTop - (drawHeight - worldHeight) / 2;
                }

                ctx.globalAlpha = 0.2;
                ctx.drawImage(backgroundImage, offsetX, offsetY, drawWidth, drawHeight);

                const fadeGradient = ctx.createRadialGradient(centerX, centerY, fourYearRadius, centerX, centerY, maxRadius);
                fadeGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                fadeGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
                fadeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');

                ctx.globalAlpha = 1;
                ctx.fillStyle = fadeGradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle, false);
                ctx.arc(centerX, centerY, fourYearRadius, endAngle, startAngle, true);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }

            // Simple radial lines
            ctx.strokeStyle = '#E5E7EB';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            const divisions = 10,
                angleStep = 24;
            for (let i = 0; i <= divisions; i++) {
                const radarAngle = 150 + i * angleStep;
                const a = (radarAngle * Math.PI) / 180;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + Math.cos(a) * maxRadius, centerY + Math.sin(a) * maxRadius);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            // Time rings
            const rings = [
                { years: 2, radius: maxRadius * 0.2, color: '#A0A8B2' },
                { years: 4, radius: maxRadius * 0.4, color: '#B0BAC5' },
                { years: 6, radius: maxRadius * 0.6, color: '#C0CAD8' },
                { years: 8, radius: maxRadius * 0.8, color: '#D0DCEB' },
                { years: 10, radius: maxRadius, color: '#E0EDEF' },
            ];
            rings.forEach((ring) => {
                ctx.beginPath();
                ctx.arc(centerX, centerY, ring.radius, startAngle, endAngle, false);
                ctx.strokeStyle = ring.color;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.fillStyle = '#2E2E2E';
                ctx.globalAlpha = 0.8;
                ctx.font = '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${ring.years}yr`, centerX, centerY - ring.radius - 8);
            });

            // Gradient ring around radar
            const gradientRingRadius = maxRadius + 20;
            const gradientRingWidth = 12;
            const impactGradient = ctx.createLinearGradient(
                centerX + Math.cos(startAngle) * gradientRingRadius,
                centerY + Math.sin(startAngle) * gradientRingRadius,
                centerX + Math.cos(endAngle) * gradientRingRadius,
                centerY + Math.sin(endAngle) * gradientRingRadius
            );
            impactGradient.addColorStop(0, '#E8F4F8');
            impactGradient.addColorStop(0.5, '#B8D4E3');
            impactGradient.addColorStop(1, '#17A398');

            ctx.beginPath();
            ctx.arc(centerX, centerY, gradientRingRadius, startAngle, endAngle, false);
            ctx.arc(centerX, centerY, gradientRingRadius - gradientRingWidth, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = impactGradient;
            ctx.globalAlpha = 0.8;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(centerX, centerY, gradientRingRadius, startAngle, endAngle, false);
            ctx.strokeStyle = '#D1D5DB';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.4;
            ctx.stroke();

            // Edge text
            ctx.fillStyle = '#2E2E2E';
            ctx.globalAlpha = 0.7;
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText('0% Impact', centerX + Math.cos(startAngle) * (maxRadius + 35), centerY + Math.sin(startAngle) * (maxRadius + 35) + 15);
            ctx.fillText('100% Impact', centerX + Math.cos(endAngle) * (maxRadius + 35), centerY + Math.sin(endAngle) * (maxRadius + 35) + 15);
            ctx.globalAlpha = 1;

            // Calculate point positions
            const arcSpan = 240,
                startRadarAngle = 150;
            const newPositions: Record<string, { x: number; y: number }> = {};
            const occupiedLabels: { x: number; y: number; width: number; height: number }[] = [];

            const sorted = [...apiTechnologies].sort((a, b) => {
                const ra = Math.min(a.timeline / 10, 1);
                const rb = Math.min(b.timeline / 10, 1);
                if (rb !== ra) return rb - ra;
                return startRadarAngle + (a.impact / 100) * arcSpan - (startRadarAngle + (b.impact / 100) * arcSpan);
            });

            sorted.forEach((tech) => {
                const impactAngle = startRadarAngle + (tech.impact / 100) * arcSpan;
                const a = ((impactAngle % 360) * Math.PI) / 180;
                const r = Math.min(tech.timeline / 10, 1) * maxRadius;
                newPositions[tech.id] = { x: centerX + Math.cos(a) * r, y: centerY + Math.sin(a) * r };
            });

            // Forbidden halo around points
            Object.values(newPositions).forEach((p) => {
                const sz = 28;
                occupiedLabels.push({ x: p.x - sz / 2, y: p.y - sz / 2, width: sz, height: sz });
            });

            setTechPositions(newPositions);
            labelBoxesRef.current = {};

            // Draw points and labels
            sorted.forEach((tech) => {
                const pos = newPositions[tech.id];
                if (!pos) return;
                const x = pos.x,
                    y = pos.y;

                const isSelected = selectedTechnology && String(selectedTechnology.id) === String(tech.id);
                const isHovered = hoveredTechnology && String(hoveredTechnology.id) === String(tech.id);
                const visualScale = isSelected ? 1.5 : isHovered ? 1.2 : 1;

                // Point
                ctx.save();
                ctx.globalAlpha = isSelected || isHovered ? 1 : 0.9;
                ctx.beginPath();
                ctx.arc(x, y, 6 * visualScale, 0, 2 * Math.PI);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.strokeStyle = '#17A398';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Determine label position: override or auto
                const ov = getOverrideFor(tech);
                const radarAngle = startRadarAngle + (tech.impact / 100) * arcSpan;
                const canvasAngle = ((radarAngle % 360) * Math.PI) / 180;

                let labelX: number, labelY: number, lineStartX = x, lineStartY = y;

                if (ov) {
                    if (ov.mode === 'rel') {
                        labelX = x + (ov.dx ?? 0);
                        labelY = y + (ov.dy ?? 0);
                    } else {
                        labelX = ov.x ?? x;
                        labelY = ov.y ?? y;
                    }
                    const tm = ctx.measureText(tech.name);
                    const h = 12 * visualScale,
                        pad = 2 * visualScale;
                    const w = tm.width * visualScale + pad * 2 + 4;
                    const bh = h + 2 + 4;
                    occupiedLabels.push({
                        x: labelX - (tm.width * visualScale) / 2 - pad,
                        y: labelY - h / 2 - 1,
                        width: w,
                        height: bh,
                    });
                } else {
                    const placed = placeLabelWithCollision(ctx, x, y, canvasAngle, maxRadius, tech.name, 1, occupiedLabels, !!isHovered, !!isSelected);
                    labelX = placed.labelX;
                    labelY = placed.labelY;
                    lineStartX = placed.lineStartX;
                    lineStartY = placed.lineStartY;
                }

                // Cache label position
                setLabelPositions((prev) => ({ ...prev, [tech.id]: { x: labelX, y: labelY, lineStartX, lineStartY } }));

                // Connection line
                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = isHovered ? '#17A398' : '#B8D4E3';
                ctx.lineWidth = isHovered ? 2 : 1;
                ctx.beginPath();
                ctx.moveTo(lineStartX, lineStartY);
                ctx.lineTo(labelX, labelY);
                ctx.stroke();

                // Background and text
                const tm2 = ctx.measureText(tech.name);
                const textW = tm2.width * visualScale;
                const textH = 12 * visualScale - 1;
                const pad2 = 2 * visualScale;
                const bgAlpha = isSelected ? 0.9 : isHovered ? 0.85 : 0.7;

                ctx.globalAlpha = bgAlpha;
                ctx.fillStyle = '#FFFFFF';
                if (ctx.roundRect) {
                    ctx.beginPath();
                    ctx.roundRect(labelX - textW / 2 - pad2, labelY - textH / 2 - 1, textW + pad2 * 2, textH + 2, 4);
                    ctx.fill();
                } else {
                    ctx.fillRect(labelX - textW / 2 - pad2, labelY - textH / 2 - 1, textW + pad2 * 2, textH + 2);
                }

                ctx.globalAlpha = 1;
                ctx.fillStyle = isSelected ? '#17A398' : '#2E2E2E';
                ctx.font = `${isSelected || isHovered ? 'bold ' : ''}${textH}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(tech.name, labelX, labelY);

                // Store box for hit-test (edit)
                labelBoxesRef.current[String(tech.id)] = {
                    x: labelX - textW / 2 - pad2,
                    y: labelY - textH / 2 - 1,
                    w: textW + pad2 * 2,
                    h: textH + 2,
                };

                // Show red border around label in Edit mode
                if (editLabelsMode) {
                    const b = labelBoxesRef.current[String(tech.id)];
                    ctx.save();
                    ctx.setLineDash([4, 2]);
                    ctx.strokeStyle = '#EF4444';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(b.x, b.y, b.w, b.h);
                    ctx.restore();
                }

                ctx.restore();
            });

            // Big ribbon at top of canvas when Edit is on
            if (editLabelsMode) {
                ctx.save();
                ctx.resetTransform?.();
                if (!ctx.resetTransform) {
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                }
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = '#10B981';
                ctx.fillRect(10, 10, 140, 28);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Inter, sans-serif';
                ctx.fillText('EDIT MODE (drag labels)', 18, 28);
                ctx.restore();
            }

            ctx.restore();
        };

        const renderNeedle = () => {
            if (!needleEnabled) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            ctx.scale(zoomLevel, zoomLevel);

            const centerX = dimensions.width / 2;
            const centerY = dimensions.height / 2;
            const maxRadius = Math.min(dimensions.width / 2 - 50, dimensions.height / 2 - 50);

            let n = needleAngle % 360;
            if (n < 0) n += 360;
            const inArc = (n >= 150 && n <= 360) || (n >= 0 && n <= 30);
            if (inArc && trailOpacity > 0) {
                const a = (n * Math.PI) / 180;
                const ex = centerX + Math.cos(a) * maxRadius;
                const ey = centerY + Math.sin(a) * maxRadius;
                ctx.globalAlpha = 0.5 * trailOpacity;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(ex, ey);
                ctx.strokeStyle = '#17A398';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            ctx.restore();
        };

        const frame = () => {
            renderRadar();
            renderNeedle();
            animationRef.current = requestAnimationFrame(frame);
        };
        frame();

        return () => animationRef.current && cancelAnimationFrame(animationRef.current);
    }, [
        dimensions,
        apiTechnologies,
        selectedTechnology,
        hoveredTechnology,
        needleEnabled,
        zoomLevel,
        panOffset,
        needleAngle,
        trailOpacity,
        editLabelsMode,
        localOverrides,
    ]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (editLabelsMode) return;
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - panOffset.x) / zoomLevel;
        const y = (e.clientY - rect.top - panOffset.y) / zoomLevel;
        const clicked = apiTechnologies.find((t) => {
            const p = techPositions[t.id];
            if (!p) return false;
            return Math.hypot(x - p.x, y - p.y) <= 20 / zoomLevel;
        });
        onTechnologyClick(clicked || null);
        setModalTech(clicked || null);
        e.stopPropagation();
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const worldX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
        const worldY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

        if (editLabelsMode) {
            const id = pickNearestLabel(worldX, worldY);
            if (id) {
                draggingLabelRef.current = { id, offsetX: 0, offsetY: 0 };
                canvasRef.current.style.cursor = 'grabbing';
            } else {
                draggingLabelRef.current = null;
            }
            return;
        }

        if (e.button === 0) {
            setIsPanning(true);
            setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const worldX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
        const worldY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

        if (editLabelsMode) {
            if (draggingLabelRef.current) {
                const id = draggingLabelRef.current;
                const point = techPositions[id];
                if (point) {
                    const dx = Math.round(worldX - point.x);
                    const dy = Math.round(worldY - point.y);
                    setLocalOverrides((prev) => ({ ...prev, [id]: { mode: 'rel', dx, dy } }));
                }
                return;
            }

            const nearId = pickNearestLabel(worldX, worldY);
            canvasRef.current.style.cursor = nearId ? 'move' : 'default';
            return;
        }

        if (isPanning && onPanChange) {
            const newPan = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
            setPanOffset(newPan);
            onPanChange(newPan);
        } else {
            const hovered = Object.entries(techPositions).find(([, p]) => Math.hypot(worldX - (p as any).x, worldY - (p as any).y) <= 20 / zoomLevel);
            onTechnologyHover(hovered ? apiTechnologies.find((t) => String(t.id) === hovered[0]) || null : null);
            canvasRef.current.style.cursor = hovered ? 'pointer' : isPanning ? 'grabbing' : 'grab';
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        draggingLabelRef.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = editLabelsMode ? 'move' : 'default';
    };

    const handleMouseEnter = () => {};

    const handleMouseLeave = () => {
        onTechnologyHover(null);
        draggingLabelRef.current = null;
        setIsPanning(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && modalTech) {
                setModalTech(null);
                onTechnologyClick(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalTech]);

    const Modal = ({ tech, onClose }: { tech: Technology; onClose: () => void }) => (
        <div className="fixed inset-0 z-[999999]" style={{ pointerEvents: 'auto', userSelect: 'none' }}>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[999999]"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (e.target === e.currentTarget) onClose();
                }}
            />
            <div
                className="fixed bg-white/95 p-6 rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto z-[1000000]"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{tech.name}</h2>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onClose();
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none focus:ring-2 focus:ring-gray-500"
                        style={{ pointerEvents: 'auto' }}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                    <p>
                        <strong>Sector:</strong> {tech.sector}
                    </p>
                    <p>
                        <strong>Trend Cluster:</strong> {tech.trendCluster}
                    </p>
                    <p>
                        <strong>Focus Area:</strong> {tech.focusArea}
                    </p>
                    <p>
                        <strong>Impact:</strong> {tech.impact}%
                    </p>
                    <p>
                        <strong>Timeline:</strong> {tech.timeline} years
                    </p>
                    <p>
                        <strong>Department:</strong> {tech.department}
                    </p>
                    <p>
                        <strong>Supply Chain Stage:</strong> {tech.supplyChainStage}
                    </p>
                    <p>
                        <strong>Trade Channel Type:</strong> {tech.tradeChannelType}
                    </p>
                    <p>
                        <strong>Industry:</strong> {tech.industry}
                    </p>
                    <p className="mt-4">
                        <strong>Description:</strong> {tech.description}
                    </p>
                </div>
            </div>
        </div>
    );

    // Loading spinner component
    const LoadingSpinner = () => (<Loading/>);

    return (
        <div ref={containerRef} className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center rounded-lg relative overflow-hidden">
            {error ? (
                <div className="flex items-center justify-center h-full text-red-500">{error}</div>
            ) : isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <div className="flex items-center justify-between gap-4 lg:mt-8 mt-20 transition-all">
                        <div className="absolute top-40 lg:left-10">
                            <AccordionMenu items={menuItems} onSelectionChange={handleSelectionChange} selectedKeys={selectedKeys} />
                        </div>
                        <div className="flex flex-col items-start justify-center lg:text-[14px] text-[12px] bg-gray-50 p-3 lg:min-w-68 border border-black/10 rounded-md">
                            <span>Total Technologies</span>
                            <span className="font-bold">{totalTechnologies}</span>
                        </div>
                        <div className="flex flex-col items-start justify-center lg:text-[14px] text-[12px] bg-gray-50 p-3 lg:min-w-68 border border-black/10 rounded-md">
                            <span>High Impact</span>
                            <span className="font-bold">{highImpactTechnologies}</span>
                        </div>
                        <div className="flex flex-col items-start justify-center lg:text-[14px] text-[12px] bg-gray-50 p-3 lg:min-w-68 border border-black/10 rounded-md">
                            <span>Near Term</span>
                            <span className="font-bold">{nearTermTechnologies}</span>
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
                        style={{ width: dimensions.width, height: dimensions.height }}
                    />

                    <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2">
                        <p className="text-xs text-[#2E2E2E]/60 text-center">
                            Distance from center = Implementation timeline • Arc position = Business impact (0-100%)
                        </p>
                    </div>

                    <div className="absolute lg:top-28 top-8 left-8 lg:left-12 flex space-x-3">
                        <button
                            onClick={handleZoomIn}
                            className="bg-[#F67242] hover:bg-[#F67242]/80 text-white font-bold p-3 rounded"
                            aria-label="Zoom In"
                        >
                            <FiZoomIn />
                        </button>
                        <button
                            onClick={handleZoomOut}
                            className="bg-[#F67242] hover:bg-[#F67242]/80 text-white font-bold p-3 rounded"
                            aria-label="Zoom Out"
                        >
                            <FiZoomOut />
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="bg-[#F67242] hover:bg-[#F67242]/80 text-white font-bold p-3 rounded"
                            aria-label="Reset Zoom"
                        >
                            <FiRefreshCw />
                        </button>
                        <button
                            onClick={() => toggleFullscreen()}
                            className="bg-[#F67242] hover:bg-[#F67242]/80 text-white font-bold p-3 rounded"
                            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        >
                            {isFullscreen ? <RiFullscreenExitLine /> : <RiFullscreenLine />}
                        </button>
                    </div>

                    <div className="absolute lg:top-28 top-8 right-8 flex space-x-2">
                        <CustomExportControls technologies={apiTechnologies} />
                    </div>

                    {modalTech && (
                        <Modal
                            tech={modalTech}
                            onClose={() => {
                                setModalTech(null);
                                onTechnologyClick(null);
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default RadarChart;