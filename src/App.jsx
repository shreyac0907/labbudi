import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GameStateProvider } from './engine/GameState';
import PageTransition from './components/PageTransition';
import CloudMenu from './components/nav/CloudMenu';
import BackButton from './components/nav/BackButton';
import HomeScreen from './screens/HomeScreen';
import YearSelectScreen from './screens/YearSelectScreen';
import OverworldMapScreen from './screens/OverworldMapScreen';
import RoadmapScreen from './screens/RoadmapScreen';
import CheckpointScreen from './screens/CheckpointScreen';
import PracticalResultScreen from './screens/PracticalResultScreen';
import MissionPage from './screens/MissionPage';
import TermsPage from './screens/TermsPage';
import EquipmentPreview from './screens/EquipmentPreview';
import TestBenchScreen from './screens/TestBenchScreen';
import TestHandScreen from './screens/TestHandScreen';
import TestMicroscopeScreen from './screens/TestMicroscopeScreen';

export default function App() {
  const location = useLocation();
  // Subscribing here re-renders the whole routed tree on a language change, so
  // screens that hold on to practical data (live getters) pick the new text up.
  useTranslation();

  return (
    <GameStateProvider>
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        {/* Cloud menu: outside the routed page, so it is on every screen and
            never takes part in page transitions. */}
        <CloudMenu />

        {/* Back pill: overworld, roadmap and checkpoint only (it works out its own target). */}
        <BackButton />

        {/* One GSAP-animated container per route. Keyed by pathname so each
            navigation mounts a fresh one and plays the enter animation; the
            exit half is navigateWithTransition() in utils/pageTransition.js. */}
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/year-select" element={<YearSelectScreen />} />
            <Route path="/practicals/:year" element={<OverworldMapScreen />} />
            <Route path="/roadmap/:practicalId" element={<RoadmapScreen />} />
            <Route path="/checkpoint/:practicalId/:checkpointIndex" element={<CheckpointScreen />} />
            <Route path="/result/:practicalId" element={<PracticalResultScreen />} />
            <Route path="/mission" element={<MissionPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/preview/equipment" element={<EquipmentPreview />} />
            <Route path="/test-bench" element={<TestBenchScreen />} />
            <Route path="/test-hand" element={<TestHandScreen />} />
            <Route path="/test-microscope" element={<TestMicroscopeScreen />} />
          </Routes>
        </PageTransition>
      </div>
    </GameStateProvider>
  );
}
