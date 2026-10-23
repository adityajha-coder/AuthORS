import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import LandingPage from './pages/LandingPage';
import DocsPage from './pages/DocsPage';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs/:slug" element={<DocsPage />} />
          </Routes>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </BrowserRouter>
  );
}
