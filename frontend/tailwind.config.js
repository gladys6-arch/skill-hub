/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '475px',
        phone: '640px',
        tablet: '768px',
        laptop: '1024px',
        desktop: '1280px',
      },
      colors: {
        neon: "#22ff88",
        cosmic: "#6366f1",
        midnight: "#0f172a",
        bubblegum: "#ec4899",
      },
    },
  },
  plugins: [],
}
