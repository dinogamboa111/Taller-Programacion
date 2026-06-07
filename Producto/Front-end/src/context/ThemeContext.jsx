import { createContext, useState, useContext } from 'react';
import fondoWeb from '../assets/fondo3.png';
import fondoEspacio from '../assets/fondo-espacio.jpg';
import fondoSafari from '../assets/fondo2.png';
import personajeImg from '../assets/personaje1.png';
import kyEspacio from '../assets/personaje3.png';
import kySafari from '../assets/personaje2.png';

export const themes = {
  default: {
    background: fondoWeb,
    character: personajeImg,
    offset: '0px',
    scale: 1.08,
    name: 'Normal'
  },
  space: {
    background: fondoEspacio,
    character: kyEspacio,
    offset: '-40px',
    scale: 1.08,
    name: 'Espacio'
  },
  safari: {
    background: fondoSafari,
    character: kySafari,
    offset: '-44px',
    scale: 1.1,
    name: 'Dinosaurios'
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState('default');

  const toggleTheme = () => {
    setActiveTheme(prev => prev === 'space' ? 'safari' : 'space');
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
