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
      },
      borderRadius: {
        "4xl": "1.25rem",
      },
      boxShadow: {
        cute: "3px 3px 0px 0px #1D1D1D",
      },
    },
  },
  plugins: [],
};

export default config;
