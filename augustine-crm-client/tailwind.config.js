/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // 🌈 Core Brand Colors
        primary: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7', // Main Brand Purple
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#4C0B7A',
          DEFAULT: '#A855F7',
        },
        // Legacy purplecrm colors (mapped to primary for consistency)
        purplecrm: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#4C0B7A',
        },
        secondary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          DEFAULT: '#0EA5E9', // Cool secondary blue
        },

        // 🌗 Neutral System
        background: '#F9FAFB', // Light gray background
        foreground: '#111827', // Main text color

        // 🎨 Accent + Muted
        accent: '#EDE9FE', // Soft purple tint for highlights
        muted: '#9CA3AF', // Muted gray for secondary text
        border: '#E5E7EB', // Light border color

        // 🧊 Status colors
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        card: '0 4px 18px rgba(99, 102, 241, 0.08)',
        subtle: '0 2px 10px rgba(0, 0, 0, 0.04)',
      },

      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};
