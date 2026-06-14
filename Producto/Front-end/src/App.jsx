import { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider, useTheme, themes } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VisualIntensityProvider, useVisualIntensity } from './context/VisualIntensityContext';
import Header from './components/Header';
import IntensityControl from './components/IntensityControl';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import Resumen from './pages/Resumen';
import Trivia from './pages/Trivia';
import Stats from './pages/Stats';
import Login from './pages/Login';
import Biblioteca from './pages/Biblioteca';
import About from './pages/About';
import Features from './pages/Features';
import './index.css';

const PARTICLE_COUNT = { full: 80, soft: 30, calm: 0 };
const METEOR_COUNT   = { full: 25, soft: 10, calm: 0 };

const AppBackground = () => {
  const { activeTheme } = useTheme();
  const { intensity } = useVisualIntensity();

  const allParticles = useMemo(() =>
    Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top:               `${Math.random() * 100}vh`,
      left:              `${Math.random() * 100}vw`,
      animationDelay:    `${Math.random() * 3}s`,
      animationDuration: `${Math.random() * 2 + 2}s`,
    })),
  []);

  const starCount   = PARTICLE_COUNT[intensity];
  const meteorCount = METEOR_COUNT[intensity];

  return (
    <div
      className="app-bg"
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundImage: `url(${themes[activeTheme].background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
        transition: 'background-image 0.5s ease-in-out',
      }}
    >
      {activeTheme === 'space' && starCount > 0 && (
        <div className="particles-container">
          {allParticles.slice(0, starCount).map(p => (
            <div
              key={p.id}
              className="star"
              style={{ top: p.top, left: p.left, animationDelay: p.animationDelay, animationDuration: p.animationDuration }}
            />
          ))}
        </div>
      )}

      {activeTheme === 'safari' && meteorCount > 0 && (
        <div className="particles-container">
          {allParticles.slice(0, meteorCount).map(p => (
            <div
              key={p.id}
              className="meteor"
              style={{ top: p.top, left: p.left, animationDelay: p.animationDelay }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const AppContent = () => {
  const { intensity } = useVisualIntensity();

  return (
    <MotionConfig reducedMotion={intensity === 'calm' ? 'always' : 'never'}>
      <AppBackground />
      <div style={{ position: 'relative', zIndex: 1, height: '100vh', overflowY: 'auto' }}>
        <Header />
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/acerca"        element={<About />} />
          <Route path="/funcionalidades" element={<Features />} />
          <Route path="/login"         element={<Login />} />

          <Route path="/perfil"              element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/actividades"         element={<ProtectedRoute><Upload    /></ProtectedRoute>} />
          <Route path="/actividades/resumen" element={<ProtectedRoute><Resumen  /></ProtectedRoute>} />
          <Route path="/actividades/trivia"  element={<ProtectedRoute><Trivia   /></ProtectedRoute>} />
          <Route path="/biblioteca"          element={<ProtectedRoute><Biblioteca /></ProtectedRoute>} />
          <Route path="/juegos"              element={<ProtectedRoute><Stats    /></ProtectedRoute>} />
        </Routes>
      </div>
      <IntensityControl />
    </MotionConfig>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <VisualIntensityProvider>
          <Router>
            <AppContent />
          </Router>
        </VisualIntensityProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
