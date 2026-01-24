import React from 'react';
import styles from './Hanamaru.module.css';

const Hanamaru = () => {
    return (
        <div className={styles.container}>
            <svg className={styles.svg} viewBox="0 0 200 200">
                <path
                    className={styles.path}

                    /* Simplified spiral/flower shape approximation */
                    d="M 100, 30
             A 70,70 0 1,0 120,35
             M 100, 30
             Q 80,80 30,80
             Q 80,80 80,130
             Q 80,80 130,80
             Q 80,80 100,30
             "
                // Actually let's use a simple circle + spiral for "Hanamaru"
                // Typically it's a spiral starting from center-ish or a multi-loop circle.
                // Let's draw a "Spiral" for the flower.
                />
                {/* Let's try a standard "Flower Circle" path */}
                <path
                    fill="none"
                    stroke="#FF3D00"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className={styles.drawAnimation}
                    d="M 90, 40
                a 60,60 0 1,0 20,0
                a 55,55 0 1,0 -10,10
                a 50,50 0 1,0 5,-5"
                /* Just a triple loop spiral */
                />
            </svg>
        </div>
    );
};

export default Hanamaru;
