import React, { useRef, useEffect, useState } from 'react';
import styles from './CanvasBoard.module.css';
import { HIRAGANA_SVG } from '@/data/hiraganaSvg';
import StrokeGuide from '../UI/StrokeGuide';

const CanvasBoard = React.forwardRef(({ width, height, strokeColor = '#333', strokeWidth = 10, character = '' }, ref) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const contextRef = useRef(null);

    // Initial setup
    useEffect(() => {
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        contextRef.current = ctx;
    }, [width, height, strokeColor, strokeWidth]);

    // Expose methods to parent
    React.useImperativeHandle(ref, () => ({
        // Clears the canvas
        clear: () => {
            const canvas = canvasRef.current;
            const ctx = contextRef.current;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, width, height);
        },

        // Simple validation: Checks if drawing stays mostly within the character shape
        validate: () => {
            const canvas = canvasRef.current;
            const ctx = contextRef.current;
            // Get user drawing data
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width;
            const h = canvas.height;
            const userImgData = ctx.getImageData(0, 0, w, h);

            const guideCanvas = document.createElement('canvas');
            guideCanvas.width = w;
            guideCanvas.height = h;
            const gCtx = guideCanvas.getContext('2d', { willReadFrequently: true });

            const svgData = HIRAGANA_SVG[character];

            if (svgData) {
                // Use SVG paths for validation logic to match visual guide
                // Visual layout: centered, padding 20px (logical)
                const padding = 20 * dpr;
                const logicalW = width * dpr;
                const logicalH = height * dpr;

                // Effective area for SVG
                const drawW = logicalW - (padding * 2);
                const drawH = logicalH - (padding * 2);
                // SVG viewBox is 109x109
                const scale = Math.min(drawW, drawH) / 109;

                gCtx.translate(padding, padding);
                gCtx.scale(scale, scale);
                gCtx.lineCap = 'round';
                gCtx.lineJoin = 'round';
                // Validation thickness: 35 units in 109-space (~20-25% of width). 
                // This covers the visual "thick gray base" (width 25) plus margin.
                gCtx.lineWidth = 35;
                gCtx.strokeStyle = '#000';

                // Parse paths
                const pathRegex = /<path[^>]*\sd="([^"]+)"/g;
                let match;
                while ((match = pathRegex.exec(svgData)) !== null) {
                    const p = new Path2D(match[1]);
                    gCtx.stroke(p);
                }
            } else {
                // Fallback to Font
                gCtx.scale(dpr, dpr);
                gCtx.font = '200px "Zen Maru Gothic", "Kiwi Maru", serif';
                gCtx.textAlign = 'center';
                gCtx.textBaseline = 'middle';
                gCtx.lineJoin = 'round';
                gCtx.lineCap = 'round';
                gCtx.lineWidth = 45;
                gCtx.strokeStyle = '#000';
                gCtx.strokeText(character, width / 2, height / 2);
                gCtx.fillStyle = '#000';
                gCtx.fillText(character, width / 2, height / 2);
            }

            const guideData = gCtx.getImageData(0, 0, w, h);

            let totalInk = 0;
            let outsideInk = 0;
            let totalGuideInk = 0;
            let coveredGuideInk = 0;

            for (let i = 3; i < userImgData.data.length; i += 4) {
                const isUser = userImgData.data[i] > 30;
                const isGuide = guideData.data[i] > 30;

                if (isGuide) {
                    totalGuideInk++;
                }

                if (isUser) {
                    totalInk++;
                    if (isGuide) {
                        coveredGuideInk++;
                    } else {
                        outsideInk++;
                    }
                }
            }

            const totalPixels = w * h;
            const fillRatio = totalInk / totalPixels;

            // Calculate ratio of User Ink to Guide Area
            // Guide is drawn with `guideThickness` in SVG units (scaled by `scale`).
            // Physical width of guide = guideThickness * scale.
            // User pen is `strokeWidth` (physical pixels).
            const guideThickness = 35;
            // Note: If svgData is null (fallback), scale is dpr. guideThickness was 45.
            // But let's assume we are mostly using SVG now.
            // For robustness, calculate expected based on whatever drawn. 
            // Better approximation: Expected Ink = Length * strokeWidth.
            // Actual Guide Area = Length * guidePhysicalWidth.
            // So Expected / GuideArea = strokeWidth / guidePhysicalWidth.

            let physicalGuideWidth;
            if (svgData) {
                const padding = 20 * dpr;
                const logicalW = width * dpr;
                const logicalH = height * dpr;
                const drawW = logicalW - (padding * 2);
                const drawH = logicalH - (padding * 2);
                const scale = Math.min(drawW, drawH) / 109;
                physicalGuideWidth = 35 * scale;
            } else {
                physicalGuideWidth = 45 * dpr;
            }

            const expectedUserInk = totalGuideInk * (strokeWidth / physicalGuideWidth);

            // Completion Check: 
            // We accept if they covered at least 50% of the *expected* ink.
            const completionRate = expectedUserInk > 0 ? coveredGuideInk / expectedUserInk : 0;

            console.log(`Validation: TotalInk=${totalInk}, GuideArea=${totalGuideInk}, Expt=${expectedUserInk.toFixed(0)}, Cov=${coveredGuideInk}, Rate=${completionRate.toFixed(2)}`);

            if (totalInk < 500 * dpr * dpr) return false;
            if (fillRatio > 0.45) return false;

            const outsideRatio = outsideInk / totalInk;
            console.log(`Validation: OutsideRatio=${outsideRatio.toFixed(2)}`);

            // 1. Precision check: outside ratio
            if (outsideRatio > 0.40) return false;

            // 2. Completion check
            if (completionRate < 0.50) {
                console.log('Validation Failed: Incomplete (Not enough ink line length)');
                return false;
            }

            return true;
        }
    }));

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    // Helper to get coordinates correctly from Touch or Mouse events
    const getCoordinates = (event) => {
        if (event.touches && event.touches.length > 0) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const touch = event.touches[0];
            return {
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top
            };
        }
        return {
            offsetX: event.offsetX,
            offsetY: event.offsetY
        };
    };

    return (
        <div className={styles.boardContainer}>
            <div className={styles.guideText}>
                {/* 1. Underlying Font Character - Only show if NO SVG available */}
                {!HIRAGANA_SVG[character] && (
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        {character}
                    </span>
                )}
            </div>

            {/* Overlay Stroke Guide (SVG) - Now contains both base and guide */}
            {HIRAGANA_SVG[character] && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${width}px`,
                    height: `${height}px`,
                    pointerEvents: 'none',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px' // Add some padding so it doesn't touch edges
                }}>
                    <StrokeGuide character={character} size="100%" />
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
                onMouseLeave={finishDrawing}
                onTouchStart={startDrawing}
                onTouchEnd={finishDrawing}
                onTouchMove={draw}
            />
        </div>
    );
});

CanvasBoard.displayName = 'CanvasBoard';
export default CanvasBoard;
