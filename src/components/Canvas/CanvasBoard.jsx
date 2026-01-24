import React, { useRef, useEffect, useState } from 'react';
import styles from './CanvasBoard.module.css';

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
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Note: Clear using physical pixels or large rect
            // Because of scale(), clearing (0,0,width,height) clears logical area.
            // But clearRect is affected by transform.
            ctx.clearRect(0, 0, width, height);
        },

        // Simple validation: Checks if drawing stays mostly within the character shape
        validate: () => {
            const canvas = canvasRef.current;
            const ctx = contextRef.current;
            // Get user drawing data
            // We need to get data from the physical canvas size
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width;
            const h = canvas.height;
            const userImgData = ctx.getImageData(0, 0, w, h);

            // Create offscreen canvas for the "Correct" shape
            const guideCanvas = document.createElement('canvas');
            guideCanvas.width = w;
            guideCanvas.height = h;
            const gCtx = guideCanvas.getContext('2d', { willReadFrequently: true });

            // Setup font to match the CSS display exactly
            // CSS: font-size: 200px, family: Zen Maru Gothic
            // We need to scale font size by dpr because we are drawing on physical pixels directly (or use scale)
            gCtx.scale(dpr, dpr);
            gCtx.font = '200px "Zen Maru Gothic", "Kiwi Maru", serif';
            gCtx.textAlign = 'center';
            gCtx.textBaseline = 'middle';

            // Draw "Valid Zone" - allow some margin of error
            // We draw the character with a thick stroke to create a "safe zone"
            gCtx.lineJoin = 'round';
            gCtx.lineCap = 'round';
            gCtx.lineWidth = 45; // Reduced buffer (was 60) for stricter check
            gCtx.strokeStyle = '#000';
            gCtx.strokeText(character, width / 2, height / 2);
            gCtx.fillStyle = '#000';
            gCtx.fillText(character, width / 2, height / 2);

            const guideData = gCtx.getImageData(0, 0, w, h);

            let totalInk = 0;
            let outsideInk = 0;

            // Iterate pixels (RGBA)
            for (let i = 3; i < userImgData.data.length; i += 4) {
                // If user drew here (Alpha > 0)
                if (userImgData.data[i] > 30) {
                    totalInk++;

                    // Check if it matches guide (Guide Alpha > 0)
                    if (guideData.data[i] < 30) {
                        outsideInk++;
                    }
                }
            }

            // Heuristics
            const totalPixels = w * h;
            const fillRatio = totalInk / totalPixels;

            console.log(`Validation: TotalInk=${totalInk}, Outside=${outsideInk}, FillRatio=${fillRatio.toFixed(3)}`);

            // 1. Must have drawn something significant
            // e.g. at least 1% of canvas area? Or 500 pixels?
            if (totalInk < 500 * dpr * dpr) return false; // Too empty

            // 2. Blackout protection: If user filled more than 40% of the canvas, it's likely a mess/scribble
            // Normal character strokes shouldn't take up that much space.
            if (fillRatio > 0.45) {
                console.log('Validation Failed: Too much ink (Blackout protection)');
                return false;
            }

            // 3. "Messy" check: Too much ink outside the valid zone
            // If > 25% of ink is outside, it's messy
            const outsideRatio = outsideInk / totalInk;
            console.log(`Validation: OutsideRatio=${outsideRatio.toFixed(2)}`);

            return outsideRatio < 0.25; // Allow 25% error
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
                {character}
            </div>
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
