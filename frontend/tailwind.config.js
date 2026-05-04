/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#C2185B',
                    light: '#E91E63',
                    dark: '#880E4F',
                    bg: '#FFF5F7',
                    accent: '#F8BBD9',
                },
                text: {
                    primary: '#2D2D2D',
                    secondary: '#666666',
                    light: '#999999',
                }
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
};