import { MoveRight, Wallet, Zap } from 'lucide-react';

export default function DeFiSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-[#0A0A0F]/50 backdrop-blur-sm p-12 text-center relative overflow-hidden">
                    {/* Subtle Glows */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

                    <h2 className="text-3xl font-bold mb-16">True DeFi Trading: Native Aster DEX Support</h2>

                    {/* Diagram */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                        {/* On-chain P3 */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-[#0D0D12] border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                                <Wallet className="w-8 h-8 text-cyan-400" />
                            </div>
                            <span className="font-medium text-gray-300">On-chain P3</span>
                        </div>

                        {/* Arrows & Text */}
                        <div className="flex-1 flex flex-col items-center gap-2 max-w-xs">
                            <div className="flex items-center gap-2 text-xs text-cyan-400 uppercase tracking-widest font-semibold">
                                <span>An-chain completion</span>
                            </div>
                            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-cyan-500 rotate-45" />
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                                On-chain packet signing
                            </div>
                        </div>

                        {/* Aster DEX */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-[#0D0D12] border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
                                <Zap className="w-8 h-8 text-blue-400" />
                            </div>
                            <span className="font-medium text-gray-300">Aster DEX</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
