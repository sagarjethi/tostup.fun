import { BrainCircuit, ShieldCheck, Crosshair } from 'lucide-react';

const features = [
    {
        title: "Market Brain",
        description: "Market Brains, auto-reports winners inventory real-time and encodes AI market intelligence.",
        icon: <BrainCircuit className="w-8 h-8 text-cyan-400" />,
        gradient: "from-cyan-500/20 to-blue-500/5",
        border: "group-hover:border-cyan-500/30"
    },
    {
        title: "Risk Sentinel",
        description: "Sniper's re-enforce in technology with allocated agents brain, and Risk sentinel protection.",
        icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
        gradient: "from-green-500/20 to-emerald-500/5",
        border: "group-hover:border-green-500/30"
    },
    {
        title: "Sniper",
        description: "Sniper emoions (no-emotions) agent once in one bandlane livethg, and stens on vu smoking.",
        icon: <Crosshair className="w-8 h-8 text-red-400" />,
        gradient: "from-red-500/20 to-orange-500/5",
        border: "group-hover:border-red-500/30"
    }
];

export default function AgentAdvantage() {
    return (
        <section className="py-20 relative" id="features">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">The Agent Advantage</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Our multi-agent architecture ensures optimal performance in any market condition.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`group relative p-8 rounded-2xl border border-white/5 bg-gradient-to-b ${feature.gradient} backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 ${feature.border}`}
                        >
                            <div className="mb-6 p-4 rounded-xl bg-white/5 w-fit border border-white/10 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Hover Glow */}
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-transparent to-white/5" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
