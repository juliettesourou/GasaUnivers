module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(0, 0%, 90%)",
        input: "hsl(0, 0%, 95%)",
        ring: "hsl(217, 90%, 54%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(213, 12%, 18%)",
        primary: {
          DEFAULT: "hsl(217, 90%, 54%)", // bleu principal
          foreground: "hsl(0, 0%, 100%)",
        },
        secondary: {
          DEFAULT: "hsl(217, 80%, 46%)", // bleu secondaire
          foreground: "hsl(0, 0%, 100%)",
        },
        tertiary: {
          DEFAULT: "hsl(210, 16%, 96%)", // gris très clair pour backgrounds
          foreground: "hsl(213, 12%, 18%)",
        },
        neutral: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(213, 12%, 18%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        muted: {
          DEFAULT: "hsl(210, 16%, 96%)",
          foreground: "hsl(215, 14%, 34%)",
        },
        accent: {
          DEFAULT: "hsl(217, 80%, 46%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(213, 12%, 18%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(213, 12%, 18%)",
        },
        success: "hsl(140, 40%, 35%)",
        warning: "hsl(40, 80%, 40%)",
        gray: {
          50: "hsl(0, 0%, 98%)",
          100: "hsl(0, 0%, 95%)",
          200: "hsl(0, 0%, 90%)",
          300: "hsl(0, 0%, 80%)",
          400: "hsl(0, 0%, 65%)",
          500: "hsl(0, 0%, 50%)",
          600: "hsl(0, 0%, 40%)",
          700: "hsl(0, 0%, 30%)",
          800: "hsl(0, 0%, 20%)",
          900: "hsl(0, 0%, 10%)",
        },
      },
      fontFamily: {
        sans: ['"Work Sans"', 'sans-serif'],
        heading: ['"DM Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      spacing: {
        '4': '1rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
        '48': '12rem',
        '64': '16rem',
      },
      backgroundImage: {
        'gradient-1': 'linear-gradient(180deg, hsl(217, 90%, 54%) 0%, hsl(210, 16%, 96%) 80%)',
        'gradient-2': 'linear-gradient(90deg, hsl(217, 80%, 46%) 10%, hsl(210, 16%, 96%) 90%)',
        'button-border-gradient': 'linear-gradient(90deg, hsla(217, 90%, 60%, 1), hsla(217, 80%, 46%, 1))',
      },
    },
  },
  plugins: [],
}
