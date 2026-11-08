import { defineConfig } from 'vite';

export default defineConfig({
  // Laluan relatif supaya binaan berfungsi di mana-mana subdirektori (cth. GitHub Pages /buku-rph/).
  base: './',
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
  },
});
