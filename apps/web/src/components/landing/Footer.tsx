import Link from 'next/link';
import { TrendingUp, Twitter, Github, Disc } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative pt-24 pb-12 overflow-hidden border-t border-white/5 bg-[#050508]">
            <div className="container mx-auto px-6">
                {/* Final CTA */}
                <div className="text-center mb-24">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to upgrade your trading stack?</h2>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:-translate-y-1"
                    >
                        Launch Terminal
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-white/10 pt-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg">
                                <TrendingUp className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">TostUp.fun</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            The World's First Multi-Agent AI Trading OS.
                        </p>
                    </div>

                    {/* Links Columns */}
                    <div className="col-span-1">
                        <h4 className="font-bold text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link href="#features" className="hover:text-cyan-400 transition-colors">Features</Link></li>
                            <li><Link href="#competition" className="hover:text-cyan-400 transition-colors">Competition</Link></li>
                            <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Terminal</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-bold text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-bold text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
                    <p>© 2025 TostUp.fun. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></Link>
                        <Link href="#" className="hover:text-white transition-colors"><Github className="w-4 h-4" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
