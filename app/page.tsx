import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity, Zap } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 lg:py-32">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-electric-teal/20 via-midnight-indigo to-midnight-indigo -z-10" />
          
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="inline-flex items-center rounded-full border border-electric-teal/30 bg-electric-teal/10 px-3 py-1 text-sm font-medium text-electric-teal backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-electric-teal mr-2 animate-pulse" />
                Avalanche Testnet Live
              </div>
              
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white via-frost-white to-electric-teal">
                Autonomous Treasury <br className="hidden sm:inline" />
                Guardian
              </h1>
              
              <p className="max-w-[700px] text-lg text-frost-white/70 md:text-xl/relaxed">
                AI-powered asset management for DAOs. Real-time risk monitoring, 
                auto-rebalancing, and on-chain execution.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 min-w-[200px]">
                <Link href="/dashboard">
                  <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                    Launch Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="https://github.com/your-repo" target="_blank">
                  <button className="btn-secondary w-full sm:w-auto">
                    View Contract
                  </button>
                </Link>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
              <div className="glass-card p-6 glass-card-hover">
                <ShieldCheck className="h-10 w-10 text-electric-teal mb-4" />
                <h3 className="text-xl font-bold mb-2">Risk Guardrails</h3>
                <p className="text-frost-white/60">
                  On-chain enforcement of max drawdowns, volatility thresholds, and runway limits.
                </p>
              </div>
              <div className="glass-card p-6 glass-card-hover">
                <Activity className="h-10 w-10 text-photon-cyan mb-4" />
                <h3 className="text-xl font-bold mb-2">AI Surveillance</h3>
                <p className="text-frost-white/60">
                  24/7 monitoring of market conditions with automated rebalancing proposals.
                </p>
              </div>
              <div className="glass-card p-6 glass-card-hover">
                <Zap className="h-10 w-10 text-solar-gold mb-4" />
                <h3 className="text-xl font-bold mb-2">Instant Execution</h3>
                <p className="text-frost-white/60">
                  Optimized routing on Avalanche via trusted executors and solvers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
