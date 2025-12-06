import Link from "next/link";
import { MoveRight, TrendingUp } from "lucide-react";

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(10,10,15,0.8)] backdrop-blur-md">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src="/logo.png" alt="TostUp.fun" className="h-10 w-auto" />
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {["Features", "Competition", "Docs"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                            {item}
                        </Link>
                    ))}
                </nav>

                {/* CTA */}
                <Link
                    href="/dashboard"
                    className="hidden md:flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    Launch Terminal
                    <MoveRight className="w-4 h-4" />
                </Link>

                {/* Mobile Menu Button - Placeholder */}
                <button className="md:hidden text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
