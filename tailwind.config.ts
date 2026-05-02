import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#d7bf91",
        "paper-deep": "#b88957",
        ink: "#24160f",
        cinnabar: "#8f241d",
        lamp: "#e8b65a",
        soot: "#130d0a"
      },
      fontFamily: {
        serifCN: [
          "Songti SC",
          "STSong",
          "Noto Serif CJK SC",
          "SimSun",
          "serif"
        ],
        kai: ["Kaiti SC", "STKaiti", "KaiTi", "serif"]
      },
      boxShadow: {
        paper: "0 28px 70px rgba(30, 14, 8, 0.34)",
        insetPaper: "inset 0 0 70px rgba(94, 49, 20, 0.26)"
      }
    }
  },
  plugins: []
} satisfies Config;
