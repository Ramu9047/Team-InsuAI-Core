import { motion } from "framer-motion";

export default function Card({ title, children, style, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`card ${className || ''}`}
      style={{
        maxWidth: 400,
        margin: "40px auto",
        ...style
      }}
    >
      {title && <h2 style={{ textAlign: "center", marginBottom: 20 }}>{title}</h2>}
      {children}
    </motion.div>
  );
}
