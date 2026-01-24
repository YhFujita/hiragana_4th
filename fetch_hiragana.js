import fs from 'fs';
import https from 'https';

const charsFixed = {
    "あ": "3042", "い": "3044", "う": "3046", "え": "3048", "お": "304a",
    "か": "304b", "き": "304d", "く": "304f", "け": "3051", "こ": "3053",
    "さ": "3055", "し": "3057", "す": "3059", "せ": "305b", "そ": "305d",
    "た": "305f", "ち": "3061", "つ": "3064", "て": "3066", "と": "3068",
    "な": "306a", "に": "306b", "ぬ": "306c", "ね": "306d", "の": "306e",
    "は": "306f", "ひ": "3072", "ふ": "3075", "へ": "3078", "ほ": "307b",
    "ま": "307c", "み": "307d", "む": "307e", "め": "307f", "も": "3080",
    "や": "3084", "ゆ": "3086", "よ": "3088",
    "ら": "3089", "り": "308a", "る": "308b", "れ": "308c", "ろ": "308d",
    "わ": "308f", "を": "3092", "ん": "3093"
};

const fetchSvg = (hex) => {
    return new Promise((resolve, reject) => {
        const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/0${hex}.svg`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

const main = async () => {
    let newContent = `export const HIRAGANA_SVG = {\n`;

    // Fetch new
    for (const [char, hex] of Object.entries(charsFixed)) {
        console.log(`Fetching ${char} (${hex})...`);
        try {
            let svg = await fetchSvg(hex);
            // Cleanup
            svg = svg.replace(/<\?xml.*?>/g, '')
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/<!DOCTYPE.*?>/g, '')
                .trim();

            newContent += `    '${char}': \`${svg}\`,\n`;
        } catch (e) {
            console.error(`Failed ${char}:`, e);
        }
    }

    newContent += `};\n`;

    fs.writeFileSync('./src/data/hiraganaSvg.js', newContent);
    console.log('Done!');
};

main();
