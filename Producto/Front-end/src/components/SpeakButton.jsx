import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsVolumeUpFill, BsStopCircleFill, BsHourglassSplit } from 'react-icons/bs';

const AZURE_KEY    = import.meta.env.VITE_AZURE_SPEECH_KEY;
const AZURE_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus2';
const AZURE_URL    = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

const toSSML = (text) => {
  const safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return (
    `<speak version='1.0' xml:lang='es-MX'>` +
    `<voice name='es-MX-DaliaNeural'>` +
    `<prosody rate='-5%' pitch='+8%'>${safe}</prosody>` +
    `</voice></speak>`
  );
};

const SpeakButton = ({ text, label = 'Escuchar' }) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'playing'
  const audioRef   = useRef(null);
  const blobUrlRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setStatus('idle');
  };

  // Limpiar al salir de la página
  useEffect(() => () => {
    if (audioRef.current)   audioRef.current.pause();
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, []);

  const handleClick = async () => {
    if (status !== 'idle') { stopAudio(); return; }

    setStatus('loading');
    try {
      const res = await fetch(AZURE_URL, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Content-Type':              'application/ssml+xml',
          'X-Microsoft-OutputFormat':  'audio-16khz-128kbitrate-mono-mp3',
        },
        body: toSSML(text),
      });

      if (!res.ok) throw new Error(`Azure TTS ${res.status}`);

      const blob   = new Blob([await res.arrayBuffer()], { type: 'audio/mpeg' });
      const url    = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = stopAudio;
      audio.onerror = stopAudio;

      setStatus('playing');
      audio.play();
    } catch (err) {
      console.error('Azure TTS error:', err);
      setStatus('idle');
    }
  };

  const isLoading = status === 'loading';
  const isPlaying = status === 'playing';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isPlaying ? 'Detener lectura' : `Escuchar: ${label}`}
      title={isPlaying ? 'Detener' : 'Escuchar en voz alta'}
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          8,
        background:   isPlaying
          ? 'rgba(239,83,80,0.18)'
          : isLoading
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(248,201,80,0.18)',
        border: `2px solid ${isPlaying ? '#ef5350' : isLoading ? 'rgba(255,255,255,0.2)' : '#f8c950'}`,
        borderRadius: 30,
        color:        isPlaying ? '#ff6b6b' : isLoading ? 'rgba(255,255,255,0.45)' : '#f8c950',
        cursor:       isLoading ? 'wait' : 'pointer',
        padding:      '8px 18px',
        fontSize:     '0.95rem',
        fontWeight:   700,
        fontFamily:   'inherit',
        minHeight:    44,
        transition:   'all 0.2s',
        whiteSpace:   'nowrap',
      }}
    >
      {isPlaying && (
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
      )}
      {isLoading && (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ display: 'flex' }}
          >
            <BsHourglassSplit size={18} />
          </motion.span>
          Generando…
        </>
      )}
      {!isPlaying && !isLoading && (
        <>
          <BsVolumeUpFill size={18} />
          {label}
        </>
      )}
    </button>
  );
};

export default SpeakButton;
