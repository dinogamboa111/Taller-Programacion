import { createContext, useState, useContext, useEffect } from 'react';

export const INTENSITY_LEVELS = {
  full: { label: 'Completo', icon: '🌟', description: 'Todas las animaciones' },
  soft: { label: 'Suave',    icon: '☁️',  description: 'Animaciones reducidas' },
  calm: { label: 'Calma',    icon: '🌿',  description: 'Sin animaciones, máximo foco' },
};

const VisualIntensityContext = createContext();

export const VisualIntensityProvider = ({ children }) => {
  const [intensity, setIntensity] = useState(
    () => localStorage.getItem('kidyra-intensity') || 'full'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-intensity', intensity);
    localStorage.setItem('kidyra-intensity', intensity);
  }, [intensity]);

  return (
    <VisualIntensityContext.Provider value={{ intensity, setIntensity }}>
      {children}
    </VisualIntensityContext.Provider>
  );
};

export const useVisualIntensity = () => useContext(VisualIntensityContext);
