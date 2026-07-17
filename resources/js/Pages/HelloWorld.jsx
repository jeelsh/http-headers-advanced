import React, { useState, useEffect } from 'react';

export default function HelloWorld({ title, message, timestamp, posts_count, user, site }) {
    const [count, setCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>{title}</h1>
                <p style={styles.message}>{message}</p>
                
                <div style={styles.infoGrid}>
                    <div style={styles.infoCard}>
                        <h3>User Info</h3>
                        <p><strong>Name:</strong> {user?.name || 'Guest'}</p>
                        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                    </div>
                    <div style={styles.infoCard}>
                        <h3>Site Info</h3>
                        <p><strong>Name:</strong> {site?.name}</p>
                        <p><strong>URL:</strong> {site?.url}</p>
                    </div>
                    <div style={styles.infoCard}>
                        <h3>Stats</h3>
                        <p><strong>Published Posts:</strong> {posts_count}</p>
                        <p><strong>Page Loaded:</strong> {timestamp}</p>
                    </div>
                    <div style={styles.infoCard}>
                        <h3>Live Clock</h3>
                        <p style={styles.clock}>{currentTime}</p>
                    </div>
                </div>

                <div style={styles.interactive}>
                    <h3>Interactive Counter</h3>
                    <button onClick={() => setCount(count + 1)} style={styles.button}>
                        Clicked {count} times
                    </button>
                    <button onClick={() => setCount(0)} style={{...styles.button, ...styles.resetButton}}>
                        Reset
                    </button>
                </div>

                <div style={styles.footer}>
                    <p>Made with Antonella Framework + React + Vite</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '20px', backgroundColor: '#f0f0f1', minHeight: '100vh' },
    card: { maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', padding: '40px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    title: { color: '#1e293b', marginBottom: '10px', fontSize: '2.5rem' },
    message: { color: '#64748b', fontSize: '1.2rem', marginBottom: '30px' },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
    infoCard: { padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
    clock: { fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', fontFamily: 'monospace' },
    interactive: { textAlign: 'center', padding: '30px', backgroundColor: '#eff6ff', borderRadius: '8px', marginBottom: '30px' },
    button: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', margin: '0 10px' },
    resetButton: { backgroundColor: '#64748b' },
    footer: { textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #e2e8f0', color: '#64748b' },
};