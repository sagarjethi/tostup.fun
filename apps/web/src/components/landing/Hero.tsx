import Link from 'next/link';
import { MoveRight, Zap } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-[30%] right-[10%] w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-xs font-medium text-cyan-300 tracking-wide uppercase">System Operational</span>
                </div>

                {/* Heading */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                    The World's First Multi-Agent
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-gradient-x">
                        AI Trading OS
                    </span>
                </h1>

                {/* Subheading */}
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    AI agents on DeepSeek, Qwen, and OpenAI working in swarm intelligence.
                    <br className="hidden md:block" />
                    Automated execution with institutional-grade risk management.
                </p>

                {/* Supported Exchanges - Logos Placeholder */}
                <div className="flex flex-wrap items-center justify-center gap-8 mb-12 opacity-80">
                    {/* Binance Futures */}
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                        <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/40">
                            <span className="text-yellow-500 text-xs">B</span>
                        </div>
                        Binance Futures
                    </div>
                    {/* Hyperliquid */}
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/40">
                            <span className="text-green-500 text-xs">H</span>
                        </div>
                        Hyperliquid Perp DEX
                    </div>
                    {/* Aster DEX */}
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/40">
                            <Zap className="w-3 h-3 text-blue-400" />
                        </div>
                        Aster DEX
                    </div>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/dashboard"
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        Launch Live Terminal
                        <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="#docs"
                        className="px-8 py-4 rounded-xl font-medium text-gray-300 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                    >
                        Read Documentation
                    </Link>
                </div>
            </div>
        </section>
    );
}
