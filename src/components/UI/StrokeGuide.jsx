import React from 'react';
import { HIRAGANA_SVG } from '@/data/hiraganaSvg';

const StrokeGuide = ({ character, size = 320 }) => {
    let svgString = HIRAGANA_SVG[character];

    if (!svgString) return null;

    // Make SVG responsive by replacing fixed dimensions with 100%
    // The viewBox will handle the aspect ratio and scaling.
    svgString = svgString.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"');

    return (
        <div
            style={{
                width: size,
                height: size,
                pointerEvents: 'none',
                opacity: 0.6,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
            dangerouslySetInnerHTML={{ __html: svgString }}
        />
    );
};

export default StrokeGuide;
