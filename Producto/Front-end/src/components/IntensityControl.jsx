import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsEyeFill, BsXLg } from 'react-icons/bs';
import { useVisualIntensity, INTENSITY_LEVELS } from '../context/VisualIntensityContext';

const LEVEL_STYLES = {
  full: { color: '#f8c950', bg: 'rgba(248,201,80,0.15)',  border: 'rgba(248,201,80,0.6)'  },
  soft: { color: '#4fc3f7', bg: 'rgba(79,195,247,0.15)', border: 'rgba(79,195,247,0.6)'  },
  calm: { color: '#38ef7d', bg: 'rgba(56,239,125,0.15)', border: 'rgba(56,239,125,0.6)'  },
};

const IntensityControl = () => {
  const { intensity, setIntensity } = useVisualIntensity();
  const [isOpen, setIsOpen] = useState(false);

  const current = LEVEL_STYLES[intensity];

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 1000 }}>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              bottom: 60,
              left: 0,
              background: 'rgba(6, 14, 50, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              padding: '14px 12px 10px',
              minWidth: 210,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              margin: '0 0 10px 6px',
            }}>
              Intensidad Visual
            </p>

            {Object.entries(INTENSITY_LEVELS).map(([key, level]) => {
              const s = LEVEL_STYLES[key];
              const isActive = intensity === key;
              return (
                <button
                  key={key}
                  onClick={() => { setIntensity(key); setIsOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    background: isActive ? s.bg : 'transparent',
                    border: `1.5px solid ${isActive ? s.border : 'transparent'}`,
                    borderRadius: 10,
                    padding: '9px 12px',
                    marginBottom: 4,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '1.25rem', lineHeight: 1, minWidth: 24, textAlign: 'center' }}>
                    {level.icon}
                  </span>
                  <div>
                    <div style={{ color: isActive ? s.color : '#e8eeff', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.2 }}>
                      {level.label}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.73rem', marginTop: 2 }}>
                      {level.description}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{
                      marginLeft: 'auto',
                      width: 7, height: 7,
                      borderRadius: '50%',
                      background: s.color,
                      boxShadow: `0 0 8px ${s.color}`,
                    }} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        title="Control de intensidad visual"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: intensity !== 'full'
            ? current.bg
            : 'rgba(8, 18, 60, 0.75)',
          border: `2px solid ${current.border}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: intensity !== 'full'
            ? `0 0 18px ${current.border}`
            : '0 4px 14px rgba(0,0,0,0.45)',
          transition: 'all 0.2s',
          color: current.color,
          position: 'relative',
        }}
      >
        {isOpen
          ? <BsXLg size={15} />
          : <BsEyeFill size={17} />
        }
        {/* Dot indicator when not full */}
        {intensity !== 'full' && !isOpen && (
          <div style={{
            position: 'absolute',
            top: 4, right: 4,
            width: 8, height: 8,
            borderRadius: '50%',
            background: current.color,
            boxShadow: `0 0 6px ${current.color}`,
            border: '1.5px solid rgba(6,14,50,0.9)',
          }} />
        )}
      </motion.button>
    </div>
  );
};

export default IntensityControl;
