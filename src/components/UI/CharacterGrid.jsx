import React, { useState } from 'react';
import styles from './CharacterGrid.module.css';

const TABS = {
    SEION: 'せいおん',
    DAKUON: 'だくおん',
    YOON: 'ようおん'
};

const CHAR_SETS = {
    [TABS.SEION]: [
        ['あ', 'い', 'う', 'え', 'お'],
        ['か', 'き', 'く', 'け', 'こ'],
        ['さ', 'し', 'す', 'せ', 'そ'],
        ['た', 'ち', 'つ', 'て', 'と'],
        ['な', 'に', 'ぬ', 'ね', 'の'],
        ['は', 'ひ', 'ふ', 'へ', 'ほ'],
        ['ま', 'み', 'む', 'め', 'も'],
        ['や', 'ゆ', 'よ'],
        ['ら', 'り', 'る', 'れ', 'ろ'],
        ['わ', 'を', 'ん'],
    ],
    [TABS.DAKUON]: [
        ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
        ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
        ['だ', 'ぢ', 'づ', 'で', 'ど'],
        ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
        ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
    ],
    [TABS.YOON]: [
        ['きゃ', 'きゅ', 'きょ'],
        ['ぎゃ', 'ぎゅ', 'ぎょ'],
        ['しゃ', 'しゅ', 'しょ'],
        ['じゃ', 'じゅ', 'じょ'],
        ['ちゃ', 'ちゅ', 'ちょ'],
        ['にゃ', 'にゅ', 'にょ'],
        ['ひゃ', 'ひゅ', 'ひょ'],
        ['びゃ', 'びゅ', 'びょ'],
        ['ぴゃ', 'ぴゅ', 'ぴょ'],
        ['みゃ', 'みゅ', 'みょ'],
        ['りゃ', 'りゅ', 'りょ'],
        ['てぃ'],
    ]
};

const CharacterGrid = ({ onSelect }) => {
    const [activeTab, setActiveTab] = useState(TABS.SEION);

    return (
        <div className={styles.gridContainer}>
            <div className={styles.tabContainer}>
                {Object.values(TABS).map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className={styles.gridContent}>
                {CHAR_SETS[activeTab].map((row, rowIndex) => (
                    <div key={rowIndex} className={styles.row}>
                        {row.map((char) => (
                            <button
                                key={char}
                                className={`${styles.charButton} ${char.length > 1 ? styles.wide : ''}`}
                                onClick={() => onSelect(char)}
                            >
                                {char}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CharacterGrid;
