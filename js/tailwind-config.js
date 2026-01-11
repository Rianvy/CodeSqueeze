tailwind.config = {
    theme: {
        extend: {
            colors: {
                'brand': {
                    50: '#e6fff5', 100: '#b3ffe0', 200: '#80ffcc', 300: '#4dffb8',
                    400: '#1affa3', 500: '#00ff88', 600: '#00cc6f', 700: '#009952',
                    800: '#006636', 900: '#003319'
                },
                'dark': {
                    50: '#2a2a2a', 100: '#1f1f1f', 200: '#1a1a1a',
                    300: '#141414', 400: '#0f0f0f', 500: '#0a0a0a',
                    600: '#050505'
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            }
        }
    }
}