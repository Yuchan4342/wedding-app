/** @type {import('tailwindcss').Config} */
let colors = require('./src/colors');

module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    colors: colors,
    textColors: colors,
    borderColors: global.Object.assign({ default: colors['gray-light'] }, colors),
    extend: {},
  },
  plugins: [],
};
