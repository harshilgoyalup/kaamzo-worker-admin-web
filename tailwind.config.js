/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#725c00",
        "on-primary": "#ffffff",
        "primary-container": "#fdda68",
        "on-primary-container": "#755e00",
        secondary: "#6e5e00",
        "secondary-container": "#f7df7a",
        "on-secondary-container": "#736201",
        surface: "#fcf9f8",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3f2",
        "surface-container": "#f0eded",
        "surface-container-high": "#eae7e7",
        background: "#fcf9f8",
        "on-background": "#1c1b1b",
        "on-surface-variant": "#4c4636",
        outline: "#7e7664",
        "outline-variant": "#cfc6b0",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
