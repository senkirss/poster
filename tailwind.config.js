/** Tailwind config Posteria — dipakai saat build CSS (lihat package.json: npm run build:css). */
module.exports = {
  content: ['./index.html', './src/**/*.js', './src/**/*.html'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px -15px rgba(20,26,51,.45)',
        card: '0 8px 30px -8px rgba(0,0,0,.12)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
