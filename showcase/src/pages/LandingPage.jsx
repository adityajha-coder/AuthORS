import Hero from '../components/landing/Hero';
import StatsBar from '../components/landing/StatsBar';
import FeatureGrid from '../components/landing/FeatureGrid';
import ArchitectureDiagram from '../components/landing/ArchitectureDiagram';
import VersionTimeline from '../components/landing/VersionTimeline';
import TechStack from '../components/landing/TechStack';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Hero />
      <StatsBar />
      <FeatureGrid />
      <ArchitectureDiagram />
      <VersionTimeline />
      <TechStack />
    </div>
  );
}
