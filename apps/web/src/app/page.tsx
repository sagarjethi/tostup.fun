import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import AgentAdvantage from '@/components/landing/AgentAdvantage';
import DecisionPipeline from '@/components/landing/DecisionPipeline';
import Competition from '@/components/landing/Competition';
import DeFiSection from '@/components/landing/DeFiSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] selection:bg-cyan-500/30">
      <Header />
      <Hero />
      <AgentAdvantage />
      <DecisionPipeline />
      <Competition />
      <DeFiSection />
      <Footer />
    </main>
  );
}
