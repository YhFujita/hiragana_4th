import React from 'react';
import styles from './CharacterGrid.module.css';

const HIRAGANA_ROWS = [
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
];

const CharacterGrid = ({ onSelect }) => {
    return (
        <div className={styles.gridContainer}>
            {HIRAGANA_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className={styles.row}>
                    {row.map((char) => (
                        <button
                            key={char}
                            className={styles.charButton}
                            onClick={() => onSelect(char)}
                        >
                            {char}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default CharacterGrid;
