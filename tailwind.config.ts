import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        success: "#16a34a",
        danger: "#dc2626",
      },
      fontFamily: {
        sans: ["Pretendard", "Noto Sans KR", "sans-serif"],
      },
      boxShadow: {
        panel: "0 12px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
