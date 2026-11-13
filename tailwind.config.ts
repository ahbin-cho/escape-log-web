import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 디자인 D: 종이색 바탕 · 먹색 글씨 · 주황 하나. 색은 포스터가 낸다.
        paper: "#F5F0E6", // 페이지 바탕: 살짝 구겨진 종이 색(globals.css 에서 결 무늬를 얹는다)
        ink: "#ECE6D9", // 옅은 채움(칸·입력칸 바탕)
        panel: "#FFFFFF",
        edge: "#17171A",
        candy: "#EE7A2B",
        line: "#E0D9CA",
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
        edge: "#E0D9CA",
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
