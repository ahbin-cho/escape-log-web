import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 디자인 D: 흰 바탕 · 먹색 글씨 · 주황 하나. 색은 포스터가 낸다.
        ink: "#F5F5F3", // 옅은 채움(칸·입력칸 바탕). 페이지 바탕은 흰색(globals.css)
        panel: "#FFFFFF",
        edge: "#17171A",
        candy: "#EE7A2B",
        line: "#E8E8E5",
        grape: "#8B7EC8",
        mint: "#5A9E78",
        cream: "#17171A",
      },
      fontFamily: {
        display: ["SBAggroB", "Pretendard", "sans-serif"],
      },
      borderRadius: {
        "4xl": "1.25rem",
      },
      // 테두리는 얇은 회색 선 한 겹(border-edge·border-2 를 쓰던 곳이 한 번에 바뀐다)
      borderColor: {
        edge: "#E8E8E5",
      },
      borderWidth: {
        2: "1px",
      },
      boxShadow: {
        cute: "none",
        float: "0 6px 16px rgba(23,23,26,0.12)",
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
