/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f5f9f9',
        primary: {
          DEFAULT: '#540c97',
          hover: '#6b0ec4',
          light: '#7a2eb0',
        },
        navbar: '#1a1818',
        link: {
          DEFAULT: '#0e57c8',
          hover: '#0a3d8f',
        },
      },
    },
  },
  plugins: [],
}


