
const fs = require('fs');
const path = require('path');

// 1. Load the existing file content
const inputPath = path.join(__dirname, '../src/data/hiraganaSvg.js');
const outputPath = path.join(__dirname, '../src/data/hiraganaSvg.js');

let fileContent = fs.readFileSync(inputPath, 'utf8');

// Helper to extract SVG string from the file content based on key
function extractSvg(char) {
    // Regex matches: 'char': `...`,
    // Allow spaces around colon.
    // Use [^`]* or [\s\S]* with ?
    const regex = new RegExp(`'${char}'\\s*:\\s*\`([\\s\\S]*?)\`\\s*,`);
    const match = fileContent.match(regex);
    if (!match) console.warn(`Warning: Could not extract ${char}`);
    return match ? match[1] : null;
}

// 2. Extract Data
console.log("Extracting base characters...");
const rawMa = extractSvg('ま'); // Contains Bo (ぼ)
const rawMi = extractSvg('み'); // Contains Po (ぽ)
const rawMu = extractSvg('む'); // Contains Ma (ま)
const rawMe = extractSvg('め'); // Contains Mi (み)
const rawMo = extractSvg('も'); // Contains Mu (む)
const rawNu = extractSvg('ぬ');
const rawShi = extractSvg('し');

if (!rawMa) throw new Error("Failed to extract 'ま'");
if (!rawMi) throw new Error("Failed to extract 'み'");
if (!rawMu) throw new Error("Failed to extract 'む'");
if (!rawMe) throw new Error("Failed to extract 'め'");
if (!rawMo) throw new Error("Failed to extract 'も'");

// 'bo' is basic 'ho' + dakuten
// 'po' is basic 'ho' + handakuten
// We need to extract the dakuten/handakuten parts from rawMa/rawMi.
// 'ho' usually has 4 strokes. 'bo' has 6. 'po' has 5 (ring).
const getExtraPaths = (svgString, skipCount) => {
    if (!svgString) return [];
    const pathRegex = /<path[^>]*\sd="([^"]+)"/g;
    let match;
    const paths = [];
    while ((match = pathRegex.exec(svgString)) !== null) {
        paths.push(match[1]);
    }
    return paths.slice(skipCount);
};

// 'ho' has 4 strokes.
const dakutenPaths = getExtraPaths(rawMa, 4);
const handakutenPaths = getExtraPaths(rawMi, 4);

console.log(`Dakuten paths found: ${dakutenPaths.length}`);
console.log(`Handakuten paths found: ${handakutenPaths.length}`);

// 3. Define the base map with corrections
// We will rebuild the map. Start with existing correct ones.
// And place the corrected ones.

const baseMap = {};
const chars = [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん'
];

chars.forEach(c => {
    let svg = null;
    if (c === 'ま') svg = rawMu;
    else if (c === 'み') svg = rawMe;
    else if (c === 'む') svg = rawMo;
    else if (c === 'め') {
        svg = null; // Generating later
    } else if (c === 'も') {
        svg = null; // Generating later
    } else {
        svg = extractSvg(c);
    }

    if (svg) baseMap[c] = svg;
});

function createSvg(char, paths, numbers) {
    let pathStr = '';
    paths.forEach((d, i) => {
        pathStr += `\t<path id="kvg:generated-${char}-s${i + 1}" d="${d}"/>\n`;
    });

    let numStr = '';
    numbers.forEach((n, i) => {
        numStr += `\t<text transform="matrix(1 0 0 1 ${n.x} ${n.y})">${i + 1}</text>\n`;
    });

    return `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd" [
<!ATTLIST g
xmlns:kvg CDATA #FIXED "http://kanjivg.tagaini.net"
kvg:element CDATA #IMPLIED
kvg:variant CDATA #IMPLIED
kvg:partial CDATA #IMPLIED
kvg:original CDATA #IMPLIED
kvg:part CDATA #IMPLIED
kvg:number CDATA #IMPLIED
kvg:tradForm CDATA #IMPLIED
kvg:radicalForm CDATA #IMPLIED
kvg:position CDATA #IMPLIED
kvg:radical CDATA #IMPLIED
kvg:phon CDATA #IMPLIED >
<!ATTLIST path
xmlns:kvg CDATA #FIXED "http://kanjivg.tagaini.net"
kvg:type CDATA #IMPLIED >
]>
<svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
<g id="kvg:StrokePaths_generated_${char}" style="fill:none;stroke:#000000;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;">
<g id="kvg:generated_${char}" kvg:element="${char}">
${pathStr}</g>
</g>
<g id="kvg:StrokeNumbers_generated_${char}" style="font-size:8;fill:#808080">
${numStr}</g>
</svg>`;
}

// Construct ME (approx)
if (!baseMap['め']) {
    console.log("Generating 'me'...");
    const nuPaths = getExtraPaths(rawNu, 0);
    // Use first 2 paths of Nu.
    // We assume Nu has at least 2 paths.
    if (nuPaths.length >= 2) {
        // Hack: Just use them as is for now.
        baseMap['め'] = createSvg('め', [nuPaths[0], nuPaths[1]], [{ x: 17, y: 27 }, { x: 47, y: 17 }]);
    }
}

// Construct MO (approx)
if (!baseMap['も']) {
    console.log("Generating 'mo'...");
    const shiPaths = getExtraPaths(rawShi, 0);
    if (shiPaths.length > 0) {
        const moPaths = [
            shiPaths[0],
            "M28,38 c6,0 43,-4 50,-5",
            "M24,56 c6,0 43,-3 50,-4"
        ];
        baseMap['も'] = createSvg('も', moPaths, [{ x: 30, y: 14 }, { x: 20, y: 36 }, { x: 18, y: 54 }]);
    }
}


// 5. Generate Dakuon / Handakuon
console.log("Generating extended characters...");
const dakuonMap = [
    { base: 'か', target: 'が' }, { base: 'き', target: 'ぎ' }, { base: 'く', target: 'ぐ' }, { base: 'け', target: 'げ' }, { base: 'こ', target: 'ご' },
    { base: 'さ', target: 'ざ' }, { base: 'し', target: 'じ' }, { base: 'す', target: 'ず' }, { base: 'せ', target: 'ぜ' }, { base: 'そ', target: 'ぞ' },
    { base: 'た', target: 'だ' }, { base: 'ち', target: 'ぢ' }, { base: 'つ', target: 'づ' }, { base: 'て', target: 'で' }, { base: 'と', target: 'ど' },
    { base: 'は', target: 'ば' }, { base: 'ひ', target: 'び' }, { base: 'ふ', target: 'ぶ' }, { base: 'へ', target: 'べ' }, { base: 'ほ', target: 'ぼ' }
];

const handakuonMap = [
    { base: 'は', target: 'ぱ' }, { base: 'ひ', target: 'ぴ' }, { base: 'ふ', target: 'ぷ' }, { base: 'へ', target: 'ぺ' }, { base: 'ほ', target: 'ぽ' }
];

// Combine Logic
function composeChar(baseChar, extraPaths, targetChar) {
    const baseSvg = baseMap[baseChar];
    if (!baseSvg) {
        console.warn(`Base char ${baseChar} missing for ${targetChar}`);
        return null;
    }
    const currentPaths = getExtraPaths(baseSvg, 0);

    // Parse original numbers
    const nReg = /<text transform="matrix\(1 0 0 1 ([\d.]+) ([\d.]+)\)">(\d+)<\/text>/g;
    let match;
    const originalNumbers = [];
    while ((match = nReg.exec(baseSvg)) !== null) {
        originalNumbers.push({ x: match[1], y: match[2] });
    }

    extraPaths.forEach((_, i) => {
        originalNumbers.push({ x: 80, y: 15 + (i * 10) }); // Dummy pos
    });

    return createSvg(targetChar, [...currentPaths, ...extraPaths], originalNumbers);
}

dakuonMap.forEach(item => {
    const svg = composeChar(item.base, dakutenPaths, item.target);
    if (svg) baseMap[item.target] = svg;
});

handakuonMap.forEach(item => {
    const svg = composeChar(item.base, handakutenPaths, item.target);
    if (svg) baseMap[item.target] = svg;
});


// 6. Yoon and 'Ti'
const combinations = [
    { target: 'きゃ', c1: 'き', c2: 'ya_small' },
    { target: 'きゅ', c1: 'き', c2: 'yu_small' },
    { target: 'きょ', c1: 'き', c2: 'yo_small' },
    { target: 'ぎゃ', c1: 'ぎ', c2: 'ya_small' },
    { target: 'ぎゅ', c1: 'ぎ', c2: 'yu_small' },
    { target: 'ぎょ', c1: 'ぎ', c2: 'yo_small' },
    { target: 'しゃ', c1: 'し', c2: 'ya_small' },
    { target: 'しゅ', c1: 'し', c2: 'yu_small' },
    { target: 'しょ', c1: 'し', c2: 'yo_small' },
    { target: 'じゃ', c1: 'じ', c2: 'ya_small' },
    { target: 'じゅ', c1: 'じ', c2: 'yu_small' },
    { target: 'じょ', c1: 'じ', c2: 'yo_small' },
    { target: 'ちゃ', c1: 'ち', c2: 'ya_small' },
    { target: 'ちゅ', c1: 'ち', c2: 'yu_small' },
    { target: 'ちょ', c1: 'ち', c2: 'yo_small' },
    { target: 'にゃ', c1: 'に', c2: 'ya_small' },
    { target: 'にゅ', c1: 'に', c2: 'yu_small' },
    { target: 'にょ', c1: 'に', c2: 'yo_small' },
    { target: 'ひゃ', c1: 'ひ', c2: 'ya_small' },
    { target: 'ひゅ', c1: 'ひ', c2: 'yu_small' },
    { target: 'ひょ', c1: 'ひ', c2: 'yo_small' },
    { target: 'びゃ', c1: 'び', c2: 'ya_small' },
    { target: 'びゅ', c1: 'び', c2: 'yu_small' },
    { target: 'びょ', c1: 'び', c2: 'yo_small' },
    { target: 'ぴゃ', c1: 'ぴ', c2: 'ya_small' },
    { target: 'ぴゅ', c1: 'ぴ', c2: 'yu_small' },
    { target: 'ぴょ', c1: 'ぴ', c2: 'yo_small' },
    { target: 'みゃ', c1: 'み', c2: 'ya_small' },
    { target: 'みゅ', c1: 'み', c2: 'yu_small' },
    { target: 'みょ', c1: 'み', c2: 'yo_small' },
    { target: 'りゃ', c1: 'り', c2: 'ya_small' },
    { target: 'りゅ', c1: 'り', c2: 'yu_small' },
    { target: 'りょ', c1: 'り', c2: 'yo_small' },
    { target: 'てィ', c1: 'て', c2: 'i_small' },
    { target: 'てぃ', c1: 'て', c2: 'i_small' }, // Add correct mapping too
];

function processPath(d, scale, dx, dy) {
    // Simple transform logic for KanjiVG d-strings (M x y c ... or s ...)
    const parts = d.split(/([a-zA-Z])/).filter(p => p.trim() !== "");
    let newD = "";

    parts.forEach((part, index) => {
        if (/[a-zA-Z]/.test(part)) {
            newD += part;
        } else {
            let nums = part.trim().split(/[\s,]+/).map(parseFloat);
            const cmd = parts[index - 1];

            // Only translate Absolute moves/lines/curves.
            // In KanjiVG, almost only M is absolute. 
            // C, L etc are rare but possible.
            // Small chars are simple.

            const isAbs = /^[A-Z]+$/.test(cmd);

            if (isAbs) {
                // Scale + Translate
                for (let k = 0; k < nums.length; k += 2) {
                    nums[k] = nums[k] * scale + dx;
                    if (k + 1 < nums.length) nums[k + 1] = nums[k + 1] * scale + dy;
                }
            } else {
                // Scale only
                nums = nums.map(n => n * scale);
            }
            newD += nums.map(n => n.toFixed(2)).join(" ");
        }
    });
    return newD;
}

const smallMap = {};
function prepareSmall(char, key) {
    const raw = baseMap[char];
    if (!raw) return;
    const paths = getExtraPaths(raw, 0);
    // Scale 0.5, Translate to Right Bottom (50, 50)
    const scaledPaths = paths.map(p => processPath(p, 0.5, 50, 50));
    smallMap[key] = scaledPaths;
}

prepareSmall('や', 'ya_small');
prepareSmall('ゆ', 'yu_small');
prepareSmall('よ', 'yo_small');
prepareSmall('い', 'i_small');

combinations.forEach(combo => {
    const p1Raw = baseMap[combo.c1];
    if (!p1Raw) {
        console.warn(`Part 1 ${combo.c1} missing for ${combo.target}`);
        return;
    }

    // Scale 0.6, Translate (5, 20)
    const paths1 = getExtraPaths(p1Raw, 0).map(p => processPath(p, 0.6, 5, 20));
    const paths2 = smallMap[combo.c2];

    if (paths1 && paths2) {
        const fullPaths = [...paths1, ...paths2];
        const nums = fullPaths.map((_, i) => ({ x: 10 + (i * 5), y: 10 }));
        baseMap[combo.target] = createSvg(combo.target, fullPaths, nums);
    }
});


// 8. Output
console.log("Writing file...");
let outputContent = "export const HIRAGANA_SVG = {\n";
for (const [key, val] of Object.entries(baseMap)) {
    if (val) {
        outputContent += `    '${key}': \`${val}\`,\n`;
    }
}
outputContent += "};\n";

fs.writeFileSync(outputPath, outputContent);
console.log("Generation Complete.");
