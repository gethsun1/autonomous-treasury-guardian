"use client";

import { motion } from "framer-motion";

interface ATGShieldProps {
  className?: string;
}

export default function ATGShield({ className = "w-28 h-32" }: ATGShieldProps) {
  return (
    <motion.div
      className={`relative mx-auto ${className}`}
      animate={{ rotate: [0, 1.5, -1.5, 0] }}
      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 to-blue-500/40 rounded-xl blur-xl"></div>
      <motion.svg
        viewBox="0 0 200 240"
        className="relative z-10 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
      >
        <motion.path
          d="M100 10 L180 60 L160 200 L100 230 L40 200 L20 60 Z"
          fill="none"
          stroke="cyan"
          strokeWidth="4"
          animate={{
            strokeDasharray: [0, 600],
            strokeDashoffset: [600, 0],
          }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </motion.svg>
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{ boxShadow: ["0 0 20px #00f5ff33", "0 0 40px #00f5ff55", "0 0 20px #00f5ff33"] }}
        transition={{ repeat: Infinity, duration: 3 }}
      ></motion.div>
    </motion.div>
  );
}

