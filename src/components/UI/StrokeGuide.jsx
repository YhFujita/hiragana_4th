import React from 'react';
import { HIRAGANA_SVG } from '@/data/hiraganaSvg';

const StrokeGuide = ({ character, size = 320 }) => {
    const svgString = HIRAGANA_SVG[character];

    if (!svgString) return null;

    // We can extract the inner content of the SVG to avoid nesting <svg> inside <svg> if possible,
    // OR just use an <img> or `dangerouslySetInnerHTML`.
    // Since we need to STYLE the paths differently (thick base, thin guide),
    // we need to be able to apply CSS to the paths.
    // If we use `dangerouslySetInnerHTML`, the SVG is in the DOM, so we can use CSS.

    // To cleanly separate "Base" (thick), "Guide" (thin dashed), and "Numbers",
    // we will render the SVG three times on top of each other, 
    // and use a container class to control visibility/styling of children.

    // Extract inner content? Or just dump the whole SVG?
    // HIRAGANA_SVG contains the full XML string including `<?xml...>` and `<!DOCTYPE...>`.
    // We should strip the preamble.
    const svgBody = svgString.replace(/<\?xml.*?>/, '').replace(/<!DOCTYPE.*?>/, '');

    const commonStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
    };

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <style>{`
                /* Layer 1: Base - Thick transparent stroke for visual weight (ghost) */
                .layer-base path {
                    stroke: #ddd !important;
                    stroke-width: 25px !important;
                    fill: none !important;
                    opacity: 0.5;
                }
                .layer-base text { display: none; }

                /* Layer 2: Guide - Thin dashed line */
                .layer-guide path {
                    stroke: #999 !important;
                    stroke-width: 3px !important;
                    stroke-dasharray: 5, 5;
                    fill: none !important;
                }
                .layer-guide text { display: none; }

                /* Layer 3: Numbers */
                .layer-numbers path { display: none; }
                .layer-numbers text {
                    font-size: 8px;
                    fill: #888;
                    font-family: sans-serif;
                    font-weight: bold;
                }
            `}</style>

            {/* Layer 1: Base */}
            <div className="layer-base" style={commonStyle} dangerouslySetInnerHTML={{ __html: svgBody }} />

            {/* Layer 2: Guide */}
            <div className="layer-guide" style={commonStyle} dangerouslySetInnerHTML={{ __html: svgBody }} />

            {/* Layer 3: Numbers */}
            <div className="layer-numbers" style={commonStyle} dangerouslySetInnerHTML={{ __html: svgBody }} />
        </div>
    );
};

export default StrokeGuide;
