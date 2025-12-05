"use client";

import { motion } from "framer-motion";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface RiskIconProps {
  level: RiskLevel;
  className?: string;
}

export function RiskIcon({ level, className = "w-12 h-12" }: RiskIconProps) {
  const getIcon = () => {
    switch (level) {
      case "LOW":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#00E5FF]">
            <defs>
              <linearGradient id="lowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#0077FF" />
              </linearGradient>
            </defs>
            <path
              d="M12 2L4 5V11C4 16.55 7.38 21.74 12 23C16.62 21.74 20 16.55 20 11V5L12 2Z"
              fill="none"
              stroke="url(#lowGrad)"
              strokeWidth="1.5"
            />
          </svg>
        );
      case "MEDIUM":
        return (
          <motion.svg
            viewBox="0 0 24 24"
            className="w-full h-full text-[#FFC857]"
            animate={{ filter: ["drop-shadow(0 0 2px #FFC857)", "drop-shadow(0 0 8px #FFC857)", "drop-shadow(0 0 2px #FFC857)"] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <defs>
              <linearGradient id="medGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC857" />
                <stop offset="100%" stopColor="#FF8A00" />
              </linearGradient>
            </defs>
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" // Simplified Eye/Warning
              fill="none"
              stroke="url(#medGrad)"
              strokeWidth="1.5"
            />
          </motion.svg>
        );
      case "HIGH":
        return (
          <motion.svg
            viewBox="0 0 24 24"
            className="w-full h-full text-[#FF4F4F]"
            animate={{ scale: [1, 1.05, 1], filter: ["drop-shadow(0 0 4px #FF4F4F)", "drop-shadow(0 0 12px #FF0000)", "drop-shadow(0 0 4px #FF4F4F)"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <defs>
              <linearGradient id="highGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF4F4F" />
                <stop offset="100%" stopColor="#FF0000" />
              </linearGradient>
            </defs>
            <path
              d="M12 2L1 21H23L12 2ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" // Triangle Hazard
              fill="none"
              stroke="url(#highGrad)"
              strokeWidth="1.5"
            />
          </motion.svg>
        );
      case "CRITICAL":
        return (
          <motion.svg
            viewBox="0 0 24 24"
            className="w-full h-full text-[#D000FF]"
            animate={{ 
                scale: [1, 1.1, 1],
                filter: ["drop-shadow(0 0 5px #D000FF)", "drop-shadow(0 0 20px #6A00FF)", "drop-shadow(0 0 5px #D000FF)"]
            }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
          >
            <defs>
              <linearGradient id="critGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D000FF" />
                <stop offset="100%" stopColor="#6A00FF" />
              </linearGradient>
            </defs>
             <path
              d="M12 2L4 5V11C4 16.55 7.38 21.74 12 23C16.62 21.74 20 16.55 20 11V5L12 2Z"
              fill="none"
              stroke="url(#critGrad)"
              strokeWidth="1.5"
            />
            <path d="M11 8H13V14H11V8ZM11 16H13V18H11V16Z" fill="url(#critGrad)" />
             <path d="M10 8H9V14H10V8Z" fill="url(#critGrad)" /> {/* Extra fracture line mockup */}
          </motion.svg>
        );
    }
  };

  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      {getIcon()}
    </div>
  );
}

