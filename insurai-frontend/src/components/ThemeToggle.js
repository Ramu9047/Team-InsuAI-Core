import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div
      onClick={toggle}
      style={{
        width: 60,
        height: 30,
        background: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
        borderRadius: 30,
        display: "flex",
        alignItems: "center",
        padding: 4,
        cursor: "pointer",
        position: "relative",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
      }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: isDark ? "#818cf8" : "#fbbf24",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          x: isDark ? 30 : 0
        }}
      >
        <span style={{ fontSize: 14 }}>{isDark ? "🌙" : "☀️"}</span>
      </motion.div>
    </div>
  );
}
