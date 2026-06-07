import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import tituloImg from '../assets/titulo.png';
import { BsRocket } from 'react-icons/bs';
import { GiDinosaurRex } from 'react-icons/gi';

const Home = () => {
  const { activeTheme, setActiveTheme, themes } = useTheme();
  const [isLocked, setIsLocked] = useState(false);

  const handleThemeChange = (theme, lock = false) => {
    if (lock) {
      if (isLocked && activeTheme === theme) {
        setIsLocked(false);
        setActiveTheme('default');
      } else {
        setIsLocked(true);
        setActiveTheme(theme);
      }
    } else if (!isLocked) {
      setActiveTheme(theme);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      paddingTop: '80px'
    }}>
      {/* Title Above Mascot (Always Visible) */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center float-anim"
        style={{ zIndex: 10, marginTop: '10px', padding: '0 20px' }}
      >
        <img
          src={tituloImg}
          alt="KIDYRA"
          style={{ width: '100%', maxWidth: '400px', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.3))' }}
        />
      </motion.div>

      {/* Center Mascot Container - Stacked to prevent jumping */}
      <div
        style={{
          position: 'relative',
          height: '48vh',
          zIndex: 5,
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {Object.entries(themes).map(([key, theme]) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: '50%',
              transform: `translateX(calc(-50% + ${theme.offset}))`,
              opacity: activeTheme === key ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
              pointerEvents: 'none'
            }}
          >
            <div className="breathing-anim">
              <img
                src={theme.character}
                alt={`Personaje Kydyra ${key}`}
                style={{
                  transform: `scale(${theme.scale})`,
                  height: '48vh',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.4))'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Text Below Mascot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-2 d-flex flex-column align-items-center"
        style={{ zIndex: 10 }}
      >
        <span style={{
          fontSize: '3rem',
          fontWeight: '900',
          color: 'white',
          textShadow: '0 4px 15px rgba(0,0,0,0.8)',
          letterSpacing: '1px'
        }}>
          Tu Mundo, Tu Aprendizaje.
        </span>
      </motion.div>
    </div>
  );
};

export default Home;
