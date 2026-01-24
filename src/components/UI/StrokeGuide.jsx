import React from 'react';
import { HIRAGANA_SVG } from '@/data/hiraganaSvg';

const StrokeGuide = ({ character, size = 320 }) => {
    const svgString = HIRAGANA_SVG[character];

    if (!svgString) return null;

    // Extract paths and stroke numbers
    const pathRegex = /<path d="([^"]+)"/g;
    const paths = [];
    let match;
    while ((match = pathRegex.exec(svgString)) !== null) {
        paths.push(match[1]);
    }

    // Extract numbers (approximate position from transform matrix)
    const numberRegex = /<text transform="matrix\(1 0 0 1 ([\d.]+) ([\d.]+)\)">(\d+)<\/text>/g;
    const numbers = [];
    while ((match = numberRegex.exec(svgString)) !== null) {
        numbers.push({ x: parseFloat(match[1]), y: parseFloat(match[2]), num: match[3] });
    }

    return (
        <div style={{ width: size, height: size, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox="0 0 109 109" width="100%" height="100%" style={{ pointerEvents: 'none', opacity: 0.6 }}>
                <g style={{ fill: 'none', stroke: '#ddd', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    {paths.map((d, i) => (
                        <path key={i} d={d} />
                    ))}
                </g>

                {/* Render Numbers */}
                <g style={{ fontSize: '10px', fill: '#888', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
                    {numbers.map((n, i) => (
                        <text key={i} x={n.x} y={n.y}>{n.num}</text>
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default StrokeGuide;
