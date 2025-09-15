//@ts-nocheck
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { RiFullscreenLine, RiFullscreenExitLine } from 'react-icons/ri';
import { FiZoomIn, FiZoomOut, FiRefreshCw } from 'react-icons/fi';
import { menuItems, Technology } from '../lib/data';
import AccordionMenu from '../tools/AccordionMenu';
import { CustomExportControls } from '../tools/CustomExportControls';

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
                               panOffset: externalPanOffset = { x: 0, y: 0 },
                               onPanChange,
                           }: RadarChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [needleAngle, setNeedleAngle] = useState(150);
    const [trailOpacity, setTrailOpacity] = useState(1);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [modalTech, setModalTech] = useState<Technology | null>(null);
    const [zoomLevel, setZoomLevel] = useState(externalZoomLevel);
    const [panOffset, setPanOffset] = useState(externalPanOffset);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);
    const [techPositions, setTechPositions] = useState<Record<string, { x: number; y: number }>>({});

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
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
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
            setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
            if (onPanChange) {
                onPanChange({ x: newPanOffsetX, y: newPanOffsetY });
            }
        },
        [zoomLevel, panOffset, onPanChange]
    );

    const handleResetZoom = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        if (onPanChange) {
            onPanChange({ x: 0, y: 0 });
        }
    };

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
            canvas.addEventListener('wheel', handleWheel, { passive: false });
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd);
            return () => {
                canvas.removeEventListener('wheel', handleWheel);
                canvas.removeEventListener('touchstart', handleTouchStart);
                canvas.removeEventListener('touchmove', handleTouchMove);
                canvas.removeEventListener('touchend', handleTouchEnd);
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
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.scale(dpr, dpr);

        const backgroundImage = new Image();
        backgroundImage.src = '/iran.jpg';

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

                const fadeGradient = ctx.createRadialGradient(
                    centerX, centerY, fourYearRadius,
                    centerX, centerY, maxRadius
                );
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

            const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fourYearRadius);
            innerGradient.addColorStop(0, '#D0D8E233');
            innerGradient.addColorStop(1, '#A0A8B233');

            ctx.beginPath();
            ctx.arc(centerX, centerY, fourYearRadius, startAngle, endAngle, false);
            ctx.arc(centerX, centerY, 0, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = innerGradient;
            ctx.fill();

            const outerGradient = ctx.createRadialGradient(centerX, centerY, fourYearRadius, centerX, centerY, maxRadius);
            outerGradient.addColorStop(0, '#F0F4F826');
            outerGradient.addColorStop(1, '#C0C8D226');

            ctx.beginPath();
            ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle, false);
            ctx.arc(centerX, centerY, fourYearRadius, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = outerGradient;
            ctx.fill();

            const divisions = 10;
            const angleStep = 24;
            ctx.strokeStyle = '#E5E7EB';
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

            ctx.fillStyle = '#2E2E2E';
            ctx.globalAlpha = 0.7;
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText('0% Impact', centerX + Math.cos(startAngle) * (maxRadius + 35), centerY + Math.sin(startAngle) * (maxRadius + 35) + 15);
            ctx.fillText('100% Impact', centerX + Math.cos(endAngle) * (maxRadius + 35), centerY + Math.sin(endAngle) * (maxRadius + 35) + 15);

            const arcSpan = 240;
            const startRadarAngle = 150;

            const newPositions: Record<string, { x: number; y: number }> = {};
            const labelBoxes = []; // برای تشخیص overlap
            technologies.forEach((tech) => {
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

                newPositions[tech.id] = { x, y };

                const isSelected = selectedTechnology && String(selectedTechnology.id) === String(tech.id);
                const isHovered = hoveredTechnology && String(hoveredTechnology.id) === String(tech.id);
                console.log(`Tech: ${tech.name}, isHovered: ${isHovered}, hoveredTechnology: ${hoveredTechnology?.name || 'null'}`);

                const scale = isSelected ? 1.5 : isHovered ? 1.2 : 1;
                const alpha = isSelected || isHovered ? 1 : 0.9;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.strokeStyle = '#17A398';
                ctx.lineWidth = 2;
                ctx.stroke();

                if (isSelected || isHovered) {
                    ctx.beginPath();
                    ctx.arc(x, y, 12 * scale, 0, 2 * Math.PI);
                    ctx.fillStyle = '#17A398';
                    ctx.globalAlpha = 0.2;
                    ctx.fill();
                }

                // محاسبه offset پویا برای جلوگیری از overlap
                const baseLabelOffset = 15 * scale;
                let labelOffset = baseLabelOffset;
                const angleRad = canvasAngle;
                const labelX = x + Math.cos(angleRad) * labelOffset;
                const labelY = y + Math.sin(angleRad) * labelOffset;
                const textMetrics = ctx.measureText(tech.name);
                const textWidth = textMetrics.width;
                const textHeight = isSelected ? 14 : isHovered ? 13 : 12;
                const backgroundAlpha = isSelected ? 0.9 : isHovered ? 0.85 : 0.7;
                const backgroundPadding = isSelected || isHovered ? 3 : 2;

                // تنظیم offset بر اساس زاویه برای توزیع بهتر labelها
                if (Math.abs(Math.sin(angleRad)) < 0.5) {
                    // اگر زاویه افقی باشه، label رو کمی بالاتر/پایین‌تر بذار
                    labelOffset = baseLabelOffset + (Math.sin(angleRad) * 5);
                } else {
                    // اگر زاویه عمودی باشه، label رو کمی چپ/راست بذار
                    labelOffset = baseLabelOffset + (Math.cos(angleRad) * 3);
                }

                const adjustedLabelX = x + Math.cos(angleRad) * labelOffset;
                const adjustedLabelY = y + Math.sin(angleRad) * labelOffset;

                // تشخیص overlap ساده: اگر label جدید با labelهای قبلی overlap داشته باشه، offset رو افزایش بده
                let overlap = false;
                for (let existingBox of labelBoxes) {
                    const dx = Math.abs(adjustedLabelX - existingBox.x);
                    const dy = Math.abs(adjustedLabelY - existingBox.y);
                    if (dx < textWidth + existingBox.width && dy < textHeight + existingBox.height) {
                        overlap = true;
                        break;
                    }
                }

                if (overlap) {
                    labelOffset += 10; // افزایش offset برای جلوگیری از overlap
                    const newLabelX = x + Math.cos(angleRad) * labelOffset;
                    const newLabelY = y + Math.sin(angleRad) * labelOffset;
                } else {
                    labelBoxes.push({ x: adjustedLabelX - textWidth / 2, y: adjustedLabelY - textHeight / 2, width: textWidth + backgroundPadding * 2, height: textHeight + 2 });
                }

                ctx.globalAlpha = backgroundAlpha;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.roundRect(adjustedLabelX - textWidth / 2 - backgroundPadding, adjustedLabelY - textHeight / 2 - 1, textWidth + backgroundPadding * 2, textHeight + 2, 4); // border-radius 4px
                ctx.fill();

                if (isSelected || isHovered) {
                    ctx.strokeStyle = isSelected ? '#17A398' : '#B8D4E3';
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 0.5;
                    ctx.stroke();
                }

                ctx.globalAlpha = 1;
                ctx.fillStyle = isSelected ? '#17A398' : isHovered ? '#2E2E2E' : '#2E2E2E';
                ctx.font = `${isSelected || isHovered ? 'bold' : 'normal'} ${isSelected ? '12px' : isHovered ? '11px' : '10px'} Inter, sans-serif`;
                ctx.fillText(tech.name, adjustedLabelX, adjustedLabelY);

                ctx.restore();
            });

            setTechPositions(newPositions);

            ctx.restore();
        };

        const renderNeedle = () => {
            if (!needleEnabled || !ctx || !canvas) return;

            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            ctx.scale(zoomLevel, zoomLevel);

            const centerX = dimensions.width / 2;
            const centerY = dimensions.height / 2;
            const maxRadius = Math.min(dimensions.width / 2 - 50, dimensions.height / 2 - 50);

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

                        const trailIsInArc = (normalizedTrailAngle >= 150 && normalizedAngle <= 360) || (normalizedTrailAngle >= 0 && normalizedTrailAngle <= 30);
                        if (!trailIsInArc) continue;

                        const trailCanvasAngle = (normalizedTrailAngle * Math.PI) / 180;
                        const trailEndX = centerX + Math.cos(trailCanvasAngle) * maxRadius;
                        const trailEndY = centerY + Math.sin(trailCanvasAngle) * maxRadius;
                        const finalOpacity = (1 - trailProgress) * 0.3 * trailOpacity;

                        if (finalOpacity > 0.01) {
                            ctx.beginPath();
                            ctx.moveTo(centerX, centerY);
                            ctx.lineTo(trailEndX, trailEndY);
                            ctx.strokeStyle = `#17A398${Math.round(finalOpacity * 255).toString(16).padStart(2, '0')}`;
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    }

                    const needleGradient = ctx.createLinearGradient(centerX, centerY, needleEndX, needleEndY);
                    needleGradient.addColorStop(0, '#17A398');
                    needleGradient.addColorStop(1, '#17A398');

                    ctx.shadowBlur = 3;
                    ctx.shadowColor = '#17A398';
                    ctx.globalAlpha = 0.5 * trailOpacity;
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(needleEndX, needleEndY);
                    ctx.strokeStyle = needleGradient;
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';
                    ctx.globalAlpha = 1;
                }
            }

            ctx.restore();
        };

        const renderFrame = () => {
            if (!ctx || !canvas) return;

            renderRadar();
            if (needleEnabled) {
                renderNeedle();
            }

            animationRef.current = requestAnimationFrame(renderFrame);
        };

        renderFrame();

        backgroundImage.onerror = () => {
            console.error('Failed to load background image');
            renderRadar();
        };

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [dimensions, technologies, selectedTechnology, hoveredTechnology, needleEnabled, zoomLevel, panOffset, needleAngle, trailOpacity]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        console.log('Canvas clicked');
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left - panOffset.x) / zoomLevel;
        const y = (event.clientY - rect.top - panOffset.y) / zoomLevel;
        const clickedTech = technologies.find((tech) => {
            const pos = techPositions[tech.id];
            if (!pos) return false;
            const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
            return distance <= 20 / zoomLevel;
        });
        console.log('Clicked Tech:', clickedTech);
        onTechnologyClick(clickedTech || null);
        setModalTech(clickedTech || null);
        event.stopPropagation();
    };

    const closeModal = useCallback(() => {
        console.log('closeModal called');
        setModalTech(null);
        onTechnologyClick(null);
    }, [onTechnologyClick]);

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (event.button === 0) {
            setIsDragging(true);
            setDragStart({ x: event.clientX - panOffset.x, y: event.clientY - panOffset.y });
        }
    };

    const handleMouseMove = useCallback(
        (event: React.MouseEvent<HTMLCanvasElement>) => {
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
                const pos = techPositions[tech.id];
                if (!pos) return false;
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                return distance <= 20 / zoomLevel;
            });
            console.log('Hovered Tech:', hoveredTech);
            onTechnologyHover(hoveredTech || null);
            canvasRef.current.style.cursor = hoveredTech ? 'pointer' : isDragging ? 'grabbing' : 'grab';
        },
        [isDragging, dragStart, panOffset, zoomLevel, onPanChange, onTechnologyHover, technologies, techPositions]
    );

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        onTechnologyHover(null);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && modalTech) {
                console.log('Esc pressed, closing modal');
                closeModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalTech, closeModal]);

    const Modal = ({ tech, onClose }: { tech: Technology; onClose: () => void }) => {
        return createPortal(
            <div
                className="fixed inset-0 z-[100001]"
                style={{
                    pointerEvents: 'auto',
                    userSelect: 'none',
                }}
            >
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[100002]"
                    style={{
                        pointerEvents: 'auto',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                    }}
                    onClick={(e) => {
                        console.log('Overlay clicked, target:', e.target, 'currentTarget:', e.currentTarget);
                        if (e.target === e.currentTarget) {
                            onClose();
                        }
                    }}
                />
                <div
                    className="fixed bg-white/95 p-6 rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto z-[100003]"
                    style={{
                        pointerEvents: 'auto',
                        userSelect: 'text',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                    onClick={(e) => {
                        console.log('Modal content clicked');
                        e.stopPropagation();
                    }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800" style={{ userSelect: 'text' }}>
                            {tech.name}
                        </h2>
                        <button
                            onClick={(e) => {
                                console.log('Close button clicked');
                                e.stopPropagation();
                                onClose();
                            }}
                            className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none focus:ring-2 focus:ring-gray-500"
                            style={{ pointerEvents: 'auto', zIndex: 100004 }}
                            aria-label="Close modal"
                        >
                            &times;
                        </button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700" style={{ userSelect: 'text' }}>
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
            </div>,
            document.body
        );
    };

    return (
        <div
            ref={containerRef}
            className={`w-full min-h-[90vh] flex flex-col items-center ${isFullscreen && 'bg-white'} justify-center rounded-lg relative overflow-hidden`}
            style={{ pointerEvents: modalTech ? 'none' : 'auto' }}
        >
            <div
                className={`flex items-center justify-between gap-4 ${isFullscreen ? 'mt-28' : 'lg:mt-8 mt-20'} transition-all`}
            >
                <div className={'absolute top-40 lg:left-10'}>
                    <AccordionMenu
                        items={menuItems}
                        onSelectionChange={(keys) => {
                            setSelectedKeys(keys);
                        }}
                    />
                </div>

                <div className={'flex flex-col items-start justify-center lg:text-[14px] text-[12px] bg-gray-50 p-3 lg:min-w-68 border border-black/10 rounded-md'}>
                    <span>Total Technologies</span>
                    <span className={'font-bold'}>25</span>
                </div>
                <div className={'flex flex-col items-start justify-center lg:text-[14px] text-[12px] bg-gray-50 p-3 lg:min-w-68 border border-black/10 rounded-md'}>
                    <span>High Impact</span>
                    <span className={'font-bold'}>11</span>
                </div>
                <div className={'flex flex-col items-start justify-center lg:text-[14px] text-[12px] bg-gray-50 p-3 lg:min-w-68 border border-black/10 rounded-md'}>
                    <span>Near Term</span>
                    <span className={'font-bold'}>10</span>
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
            <div className="absolute lg:top-28 top-8 left-4 lg:left-12 flex space-x-2">
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
                    onClick={toggleFullscreen}
                    className="bg-[#F67242] hover:bg-[#F67242]/80 text-white font-bold p-3 rounded"
                    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                    {isFullscreen ? <RiFullscreenExitLine /> : <RiFullscreenLine />}
                </button>
            </div>
            <div className="absolute lg:top-28 top-8 right-12 flex space-x-2">
                <CustomExportControls technologies={technologies} />
            </div>
            {modalTech && <Modal tech={modalTech} onClose={closeModal} />}
        </div>
    );
}

export default RadarChart;