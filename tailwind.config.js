
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        mist: "#eef2f6",
        glass: "rgba(255,255,255,0.7)",
      },
      boxShadow: {
        glass: "0 8px 30px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        '2xl': '1.25rem',
      }
    },
  },
  plugins: [],
}
