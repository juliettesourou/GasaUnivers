module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(220, 13%, 91%)",
        input: "hsl(220, 13%, 96%)",
        ring: "hsl(217, 91%, 60%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(220, 15%, 20%)",
        primary: {
          DEFAULT: "hsl(224, 76%, 48%)", // Bleu principal
          foreground: "hsl(0, 0%, 100%)",
        },
        secondary: {
          DEFAULT: "hsl(220, 80%, 55%)", // Bleu secondaire (plus clair)
          foreground: "hsl(0, 0%, 100%)",
        },
        tertiary: {
          DEFAULT: "hsl(220, 20%, 97%)",
          foreground: "hsl(220, 15%, 20%)",
        },
        neutral: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(220, 15%, 20%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        muted: {
          DEFAULT: "hsl(220, 14%, 96%)",
          foreground: "hsl(220, 9%, 40%)",
        },
        accent: {
          DEFAULT: "hsl(220, 80%, 55%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(220, 15%, 20%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(220, 15%, 20%)",
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
        'gradient-1': 'linear-gradient(180deg, hsl(340, 60%, 22%) 0%, hsl(26, 22%, 96%) 80%)',
        'gradient-2': 'linear-gradient(90deg, hsl(340, 60%, 22%) 10%, hsl(20, 15%, 94%) 90%)',
        'button-border-gradient': 'linear-gradient(90deg, hsla(340, 60%, 40%, 1), hsla(340, 60%, 30%, 1))',
      },
    },
  },
  plugins: [],
}
