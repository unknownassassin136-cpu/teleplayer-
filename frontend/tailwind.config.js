module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          dark: '#141414',
          darker: '#0f0f0f',
          red: '#e50914',
          gray: '#564d4d',
        }
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
