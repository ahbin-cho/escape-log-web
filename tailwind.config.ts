import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F5F0E6",
        panel: "#FFFCF6",
        edge: "#1D1D1D",
        candy: "#E49A4A",
        grape: "#8B7EC8",
        mint: "#5A9E78",
        cream: "#1D1D1D",
        line: "#E3DACA", // 얇은 구분선
        paper: "#F5F0E6", // 페이지 바탕(= ink)
      },
      fontFamily: {
        display: ["SBAggroB", "Pretendard", "sans-serif"],
      },
      borderRadius: {
        "4xl": "1.25rem",
      },
      boxShadow: {
        cute: "3px 3px 0px 0px #1D1D1D",
        float: "0 6px 16px rgba(29,29,29,0.14)",
      },
      animation: {
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
