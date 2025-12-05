"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity, Zap } from "lucide-react";
import { Header } from "@/components/layout/Header";
import ATGShield from "@/components/ATGShield";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const sentences = [
  "Predicting risk before it becomes danger.",
  "Autonomously safeguarding treasury operations.",
  "Real-time intelligence for real-world assets.",
  "A guardian that never sleeps.",
  "Your treasury deserves a mind of its own."
];

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % sentences.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />
      
      {/* Animated Header Glow */}
      <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-2xl animate-pulse pointer-events-none" />

      <main className="flex-1 relative">
        <section className="relative py-24 lg:py-32 flex flex-col items-center justify-center min-h-[80vh]">
          
          {/* Hero Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-electric-teal/10 via-midnight-indigo/50 to-midnight-indigo -z-10" />
          
          {/* Center Back Shield (Parallax/Background) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none -z-10 scale-[2] blur-[2px]">
            <ATGShield className="w-96 h-96" />
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,229,255,0.1)_0%,_rgba(139,92,246,0.05)_40%,_transparent_70%)] pointer-events-none -z-10" />

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-10">
              
              {/* Status Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center rounded-full border border-electric-teal/30 bg-electric-teal/10 px-4 py-1.5 text-sm font-medium text-electric-teal backdrop-blur-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-electric-teal mr-2 animate-pulse" />
                Avalanche Testnet Live
              </motion.div>
              
              {/* Main Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-white via-photon-cyan to-electric-teal font-display"
              >
                Autonomous Treasury <br className="hidden sm:inline" />
                Guardian
              </motion.h1>
              
              {/* Subtitle & Typewriter */}
              <div className="space-y-4 h-24">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="text-xl font-medium text-electric-teal"
                >
                  AI-Driven Protection for On-Chain Treasuries
                </motion.p>
                
                <div className="h-8 relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="text-lg text-frost-white/70 md:text-xl/relaxed font-mono"
                    >
                      {sentences[index]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Animated Tagline */}
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 1, delay: 0.8 }}
                 className="flex items-center gap-2 text-sm text-frost-white/50 font-medium tracking-widest uppercase"
              >
                <ShieldCheck className="w-4 h-4 text-electric-teal" />
                Adaptive. Autonomous. Absolute.
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 min-w-[200px] pt-8"
              >
                <Link href="/dashboard">
                  <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4">
                    Launch Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link href="https://github.com/gethsun1/autonomous-treasury-guardian/tree/main/contracts/core" target="_blank" rel="noopener noreferrer">
                  <button className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 border-white/20 hover:border-electric-teal/50 hover:shadow-[0_0_20px_rgba(0,224,199,0.1)]">
                    View Architecture
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Feature Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32"
            >
              <div className="glass-card p-8 glass-card-hover group">
                <div className="mb-6 p-3 bg-electric-teal/10 rounded-xl w-fit group-hover:bg-electric-teal/20 transition-colors">
                  <ShieldCheck className="h-8 w-8 text-electric-teal" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-display">Risk Guardrails</h3>
                <p className="text-frost-white/60 leading-relaxed">
                  On-chain enforcement of max drawdowns, volatility thresholds, and runway limits.
                </p>
              </div>
              <div className="glass-card p-8 glass-card-hover group">
                <div className="mb-6 p-3 bg-photon-cyan/10 rounded-xl w-fit group-hover:bg-photon-cyan/20 transition-colors">
                  <Activity className="h-8 w-8 text-photon-cyan" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-display">AI Surveillance</h3>
                <p className="text-frost-white/60 leading-relaxed">
                  24/7 monitoring of market conditions with automated rebalancing proposals.
                </p>
              </div>
              <div className="glass-card p-8 glass-card-hover group">
                <div className="mb-6 p-3 bg-solar-gold/10 rounded-xl w-fit group-hover:bg-solar-gold/20 transition-colors">
                  <Zap className="h-8 w-8 text-solar-gold" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-display">Instant Execution</h3>
                <p className="text-frost-white/60 leading-relaxed">
                  Optimized routing on Avalanche via trusted executors and solvers.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
