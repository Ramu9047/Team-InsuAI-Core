import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Theme Context for Dark/Light Mode
 */

const ThemeContext = createContext();

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Load from localStorage or default to light
        const saved = localStorage.getItem('theme');
        return saved || 'light';
    });

    useEffect(() => {
        // Save to localStorage
        localStorage.setItem('theme', theme);

        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);

        // Update CSS variables
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--bg-primary', '#111827');
            root.style.setProperty('--bg-secondary', '#1f2937');
            root.style.setProperty('--bg-card', '#374151');
            root.style.setProperty('--text-main', '#f9fafb');
            root.style.setProperty('--text-muted', '#d1d5db');
            root.style.setProperty('--card-border', '#4b5563');
            root.style.setProperty('--input-bg', '#374151');
            root.style.setProperty('--input-border', '#4b5563');
        } else {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f9fafb');
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--text-main', '#111827');
            root.style.setProperty('--text-muted', '#6b7280');
            root.style.setProperty('--card-border', '#e5e7eb');
            root.style.setProperty('--input-bg', '#ffffff');
            root.style.setProperty('--input-border', '#d1d5db');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Theme Toggle Button Component
 */
export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            style={{
                position: 'relative',
                width: '60px',
                height: '32px',
                background: isDark ? '#374151' : '#e5e7eb',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
            }}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Toggle Circle */}
            <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                transform: isDark ? 'translateX(28px)' : 'translateX(0)',
                transition: 'transform 0.3s ease'
            }}>
                {isDark ? '🌙' : '☀️'}
            </div>
        </button>
    );
}

/**
 * Themed Card Component
 * Automatically adapts to current theme
 */
export function ThemedCard({ children, style, ...props }) {
    return (
        <div
            style={{
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                ...style
            }}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * Themed Input Component
 */
export function ThemedInput({ style, ...props }) {
    return (
        <input
            style={{
                background: 'var(--input-bg)',
                color: 'var(--text-main)',
                border: '2px solid var(--input-border)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '1rem',
                width: '100%',
                transition: 'all 0.2s ease',
                ...style
            }}
            onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.outline = 'none';
            }}
            onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--input-border)';
            }}
            {...props}
        />
    );
}

/**
 * Global Theme Styles
 * Add this to your main App component
 */
export function GlobalThemeStyles() {
    return (
        <style>{`
            :root {
                /* Light mode (default) */
                --bg-primary: #ffffff;
                --bg-secondary: #f9fafb;
                --bg-card: #ffffff;
                --text-main: #111827;
                --text-muted: #6b7280;
                --card-border: #e5e7eb;
                --input-bg: #ffffff;
                --input-border: #d1d5db;
            }

            [data-theme="dark"] {
                /* Dark mode */
                --bg-primary: #111827;
                --bg-secondary: #1f2937;
                --bg-card: #374151;
                --text-main: #f9fafb;
                --text-muted: #d1d5db;
                --card-border: #4b5563;
                --input-bg: #374151;
                --input-border: #4b5563;
            }

            body {
                background: var(--bg-primary);
                color: var(--text-main);
                transition: background 0.3s ease, color 0.3s ease;
            }

            /* Smooth transitions for all themed elements */
            * {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            }
        `}</style>
    );
}

export default { ThemeProvider, useTheme, ThemeToggle, ThemedCard, ThemedInput, GlobalThemeStyles };
