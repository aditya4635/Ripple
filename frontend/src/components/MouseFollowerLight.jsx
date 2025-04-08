import { useState, useEffect } from "react";

export default function MouseFollowerSprinkles() {
  const [sprinkles, setSprinkles] = useState([]);
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-blue-500", "bg-indigo-500", "bg-purple-500"];

  useEffect(() => {
    const handleMouseMove = (event) => {
      const newSprinkle = {
        x: event.clientX,
        y: event.clientY,
        id: Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setSprinkles((prevSprinkles) => [...prevSprinkles, newSprinkle]);

      setTimeout(() => {
        setSprinkles((prevSprinkles) => prevSprinkles.filter(s => s.id !== newSprinkle.id));
      }, 150); // Sprinkle disappears after 1.5 seconds
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed top-0 left-0 w-full h-full z-50">
      {sprinkles.map((sprinkle) => (
        <div
          key={sprinkle.id}
          className={`absolute w-2 h-2 ${sprinkle.color} rounded-full opacity-80 transition-opacity duration-500`}
          style={{
            left: sprinkle.x,
            top: sprinkle.y,
            transform: "translate(-50%, -50%)",
          }}
        ></div>
      ))}
    </div>
  );
}
