import React, { useEffect, useState } from 'react';
import styles from './Mascot.module.css';

const Mascot = ({ message, visible, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (visible && message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 5000); // Auto hide after 5 seconds
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [visible, message, onClose]);

    if (!isVisible) return null;

    return (
        <div className={styles.container}>
            <div className={styles.speechBubble}>
                {message}
            </div>
            {/* Cute Rabbit Mascot SVG */}
            <svg className={styles.mascotSvg} viewBox="0 0 200 200">
                {/* Ears */}
                <ellipse cx="70" cy="60" rx="20" ry="50" fill="#fff" stroke="#333" strokeWidth="4" />
                <ellipse cx="130" cy="60" rx="20" ry="50" fill="#fff" stroke="#333" strokeWidth="4" />
                <ellipse cx="70" cy="60" rx="10" ry="35" fill="#fce4ec" />
                <ellipse cx="130" cy="60" rx="10" ry="35" fill="#fce4ec" />

                {/* Face */}
                <circle cx="100" cy="110" r="60" fill="#fff" stroke="#333" strokeWidth="4" />

                {/* Eyes */}
                <circle cx="80" cy="100" r="5" fill="#333" />
                <circle cx="120" cy="100" r="5" fill="#333" />

                {/* Cheeks */}
                <circle cx="65" cy="115" r="8" fill="#f48fb1" opacity="0.6" />
                <circle cx="135" cy="115" r="8" fill="#f48fb1" opacity="0.6" />

                {/* Nose/Mouth */}
                <path d="M 95, 115 q 5,5 10,0" fill="none" stroke="#333" strokeWidth="3" />
                <path d="M 100, 115 v 10" fill="none" stroke="#333" strokeWidth="3" />
            </svg>
        </div>
    );
};

export default Mascot;
