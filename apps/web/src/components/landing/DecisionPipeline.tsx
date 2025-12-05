import { BarChart3, CloudCog, ShieldAlert, ArrowRightLeft, Database, ChevronRight } from 'lucide-react';

const steps = [
    {
        title: "Market Data",
        icon: <BarChart3 className="w-6 h-6 text-blue-400" />
    },
    {
        title: "AI Decision",
        icon: <CloudCog className="w-6 h-6 text-purple-400" />
    },
    {
        title: "Risk Manager",
        icon: <ShieldAlert className="w-6 h-6 text-cyan-400" />
    },
    {
        title: "Execution",
        icon: <ArrowRightLeft className="w-6 h-6 text-green-400" />
    },
    {
        title: "Store Decision",
        icon: <Database className="w-6 h-6 text-orange-400" />
    }
];

export default function DecisionPipeline() {
    return (
        <section className="py-24 bg-gradient-to-b from-transparent to-black/20">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Decision Pipeline</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-16">
                    Decision antachse and decision stering anovnestien:nains and manager ertion your decision pipeline.
                </p>

                <div className="relative flex flex-wrap justify-center items-center gap-4 md:gap-8">
                    {/* Visual connector line for large screens */}
                    <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-y-1/2 z-0" />

                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-4 z-10">
                            {/* Step Card */}
                            <div className="flex flex-col items-center gap-4 group">
                                <div className="w-20 h-20 rounded-2xl bg-[#0A0A0F] border border-white/10 flex items-center justify-center shadow-lg shadow-black/50 group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20 transition-all duration-300">
                                    {step.icon}
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-cyan-400 transition-colors">
                                    {step.title}
                                </span>
                            </div>

                            {/* Chevron Arrow (not for last item) */}
                            {idx !== steps.length - 1 && (
                                <div className="text-gray-600">
                                    <ChevronRight className="w-6 h-6 animate-pulse" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
