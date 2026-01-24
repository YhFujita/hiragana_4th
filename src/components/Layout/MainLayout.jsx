import React from 'react';
import styles from './MainLayout.module.css';

const MainLayout = ({ children, title = 'ひらがなれんしゅう' }) => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{title}</h1>
            </header>
            <main className={styles.main}>
                {children}
            </main>
            <footer className={styles.footer}>
                <p>© 2026 Hiragana Practice 4th</p>
            </footer>
        </div>
    );
};

export default MainLayout;
