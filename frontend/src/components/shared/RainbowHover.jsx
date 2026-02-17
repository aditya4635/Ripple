import { useState } from "react";

export default function RainbowHover({ children }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={`transition-all duration-500 ${
        isHovered ? "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </span>
  );
}
