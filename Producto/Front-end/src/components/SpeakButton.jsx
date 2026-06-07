import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BsVolumeUpFill, BsStopCircleFill } from 'react-icons/bs';

/* ─────────────────────────────────────────────────────────────
   Prioridad de dialectos: español latinoamericano primero.
   El orden importa: el primero que encuentre el browser "gana".
   ───────────────────────────────────────────────────────────── */
const LATIN_LANGS = [
  'es-MX',   // México        — la más disponible en todos los navegadores
  'es-US',   // Español de EE.UU. — acento neutro/latino muy común en Chrome
  'es-419',  // Latam genérico
  'es-AR',   // Argentina
  'es-CO',   // Colombia
  'es-CL',   // Chile
  'es-VE',   // Venezuela
  'es-PE',   // Perú
  'es-GT',   // Guatemala
];

/**
 * Elige la mejor voz disponible con estas reglas:
 * 1. Voz latina femenina  (pitch más amigable para niños)
 * 2. Cualquier voz latina
 * 3. Español que no sea es-ES
 * 4. Cualquier español (incluyendo es-ES)
 * 5. null → el browser usa su default
 */
const pickVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // 1. Latina + femenina
  for (const lang of LATIN_LANGS) {
    const v = voices.find(
      (v) => v.lang === lang && /female|mujer|woman/i.test(v.name),
    );
    if (v) return v;
  }

  // 2. Cualquier latina
  for (const lang of LATIN_LANGS) {
    const v = voices.find((v) => v.lang === lang);
    if (v) return v;
  }

  // 3. Español que no sea de España
  const nonES = voices.find(
    (v) => v.lang.startsWith('es') && !v.lang.startsWith('es-ES'),
  );
  if (nonES) return nonES;

  // 4. Cualquier español
  return voices.find((v) => v.lang.startsWith('es')) ?? null;
};

/* ─────────────────────────────────────────────────────────────
   Hook: carga las voces del browser (Chrome las carga async)
   ───────────────────────────────────────────────────────────── */
const useVoices = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const tryLoad = () => {
      if (window.speechSynthesis.getVoices().length > 0) setReady(true);
    };

    tryLoad(); // Firefox las tiene inmediatamente

    // Chrome necesita el evento
    window.speechSynthesis.addEventListener('voiceschanged', tryLoad);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', tryLoad);
  }, []);

  return ready;
};

/* ─────────────────────────────────────────────────────────────
   Componente SpeakButton
   ───────────────────────────────────────────────────────────── */
const SpeakButton = ({ text, label = 'Escuchar' }) => {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  const voicesReady  = useVoices();
  const supported    = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Detener al desmontar (navegación entre páginas)
  useEffect(() => {
    return () => {
      if (utteranceRef.current) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  const handleClick = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // detiene cualquier botón activo

    const utterance  = new SpeechSynthesisUtterance(text);
    const voice      = pickVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang  = voice.lang;   // respetar el locale exacto de la voz
    } else {
      utterance.lang  = 'es-MX';      // hint al browser si no hay voz cargada aún
    }

    // Parámetros para sonido amigable con niños
    utterance.rate  = 0.88;  // un poco más lento → más claro
    utterance.pitch = 1.25;  // más agudo → más expresivo / amigable

    utterance.onend   = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false); // también cubre cancel() externo

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={speaking ? 'Detener lectura en voz alta' : `Escuchar: ${label}`}
      title={speaking ? 'Detener' : 'Escuchar en voz alta'}
      disabled={!voicesReady && !speaking}  // evita clic antes de que carguen las voces
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:         8,
        background:  speaking
          ? 'rgba(239,83,80,0.18)'
          : voicesReady
            ? 'rgba(248,201,80,0.18)'
            : 'rgba(255,255,255,0.08)',
        border:      `2px solid ${speaking ? '#ef5350' : voicesReady ? '#f8c950' : 'rgba(255,255,255,0.2)'}`,
        borderRadius: 30,
        color:        speaking ? '#ff6b6b' : voicesReady ? '#f8c950' : 'rgba(255,255,255,0.4)',
        cursor:       voicesReady || speaking ? 'pointer' : 'wait',
        padding:      '8px 18px',
        fontSize:     '0.95rem',
        fontWeight:   700,
        fontFamily:   'inherit',
        minHeight:    44,
        transition:   'all 0.2s',
        whiteSpace:   'nowrap',
      }}
    >
      {speaking ? (
        <>
          <motion.span
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ repeat: Infinity, duration: 0.65 }}
            style={{ display: 'flex' }}
          >
            <BsStopCircleFill size={18} />
          </motion.span>
          Detener
        </>
      ) : (
        <>
          <BsVolumeUpFill size={18} />
          {voicesReady ? label : 'Cargando…'}
        </>
      )}
    </button>
  );
};

export default SpeakButton;
