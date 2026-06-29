// tailwind.config.js
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // optional: safelist classes you build dynamically
  safelist: [
    'text-orange-500',
    'text-gray-200',
    'hover:text-white',
    'bg-slate-950/85',
    'bg-orange-500/10',
    // add any other classes that are built dynamically at runtime
  ],
};
