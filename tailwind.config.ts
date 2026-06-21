import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pass: "#3D8B5F",
        fail: "#C0392B",
        "knot-ivory": "#FAF7F2",
        "knot-paper": "#F3EEE6",
        "knot-sand": "#E5D8C7",
        "knot-red": "#C84B3C",
        "knot-red-soft": "#E9C8C1",
        "knot-gold": "#C9A86A",
        "knot-ink": "#2B2825",
        "knot-brown": "#6F5B4B",
        "knot-mist": "#F6F1E8",
      },
      fontFamily: {
        sans: ["Pretendard Variable", "Apple SD Gothic Neo", "Noto Sans KR", "sans-serif"],
      },
      boxShadow: {
        knot: "0 12px 40px rgba(111, 91, 75, 0.08)",
        card: "0 8px 24px rgba(111, 91, 75, 0.08)",
      },
    },
  },
  plugins: [],
}

export default config
