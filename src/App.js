//Global CSS
import './App.css';

// Component CSS
import './components/Navbar.css';
import './components/Hero.css';
import './components/YachtGallery.css';
import './components/AboutCharter.css';
import './components/TargetSpecies.css';
import './components/BookingPanel.css';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import YachtGallery from './components/YachtGallery';
import AboutCharter from './components/AboutCharter';
import WhatsIncluded from './components/WhatsIncluded';
import TargetSpecies from './components/TargetSpecies';
import Yacht3DViewer from './components/Yacht3DViewer';
import InteractiveMap from './components/InteractiveMap';
import PickupCancellation from './components/PickupCancellation';
import RecommendedYachts from './components/RecommendedYachts';
import BookingPanel from './components/BookingPanel';

function App() {
  return (
    <>
      <div className="hero-wrapper">
        <div className="hero-overlay"></div>
        <Navbar />
        <Hero />
      </div>

      <div className="page-layout">
        <main className="page-main">
          <YachtGallery />
          <AboutCharter />
          <WhatsIncluded />
          <TargetSpecies />
          <Yacht3DViewer />
          <InteractiveMap />
          <PickupCancellation />
        </main>

        <BookingPanel />
      </div>

      <RecommendedYachts />
    </>
  );
}

export default App;
