import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsArrowLeft, BsCheckCircleFill, BsXCircleFill,
  BsTrophy, BsArrowRepeat, BsVolumeUpFill, BsStopCircleFill, BsHourglassSplit,
} from 'react-icons/bs';
import SpeakButton from '../components/SpeakButton';
import { quizService } from '../services/quizService';

// Backend shape:
// Quiz: { quizId, title, generationDate, documentId }
// Question: { questionId, statement, sortOrder, alternatives: [{ alternativeId, content, isCorrect }] }
const adaptarQuizReal = (quizBackend) => {
  if (!quizBackend?.questions?.length) return null;
  return {
    title: quizBackend.title || 'Trivia del documento',
    questions: quizBackend.questions.map((q) => ({
      id:          q.questionId,
      text:        q.statement,
      options:     (q.alternatives || []).map((a) => a.content),
      correct:     (q.alternatives || []).findIndex((a) => a.correct || a.isCorrect),
      explanation: '',
    })),
  };
};

const LETTER = ['A', 'B', 'C', 'D'];

/* ── Mini botón TTS para alternativas ───────────────────────── */
const AZ_KEY    = import.meta.env.VITE_AZURE_SPEECH_KEY;
const AZ_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus2';
const AZ_URL    = `https://${AZ_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

const ssml = (text) => {
  const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<speak version='1.0' xml:lang='es-MX'><voice name='es-MX-DaliaNeural'><prosody rate='-5%' pitch='+8%'>${safe}</prosody></voice></speak>`;
};

const MiniSpeak = ({ text }) => {
  const [st,  setSt]  = useState('idle');
  const audioRef      = useRef(null);
  const blobRef       = useRef(null);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }
    setSt('idle');
  };

  useEffect(() => () => stop(), []);

  const speak = async (e) => {
    e.stopPropagation();
    if (st !== 'idle') { stop(); return; }
    setSt('loading');
    try {
      const res = await fetch(AZ_URL, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZ_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssml(text),
      });
      if (!res.ok) throw new Error();
      const blob = new Blob([await res.arrayBuffer()], { type: 'audio/mpeg' });
      blobRef.current = URL.createObjectURL(blob);
      const audio = new Audio(blobRef.current);
      audioRef.current = audio;
      audio.onended = stop;
      audio.onerror = stop;
      setSt('playing');
      audio.play();
    } catch { stop(); }
  };

  return (
    <button
      onClick={speak}
      title={st === 'playing' ? 'Detener' : 'Escuchar opcion'}
      style={{
        flexShrink: 0,
        width: 30, height: 30,
        borderRadius: '50%',
        background: st === 'playing' ? 'rgba(239,83,80,0.20)' : 'rgba(248,201,80,0.15)',
        border: `1.5px solid ${st === 'playing' ? 'rgba(239,83,80,0.6)' : 'rgba(248,201,80,0.45)'}`,
        color: st === 'playing' ? '#ef5350' : '#f8c950',
        cursor: st === 'loading' ? 'wait' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}
    >
      {st === 'loading' && (
        <motion.span animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:'linear' }} style={{ display:'flex' }}>
          <BsHourglassSplit size={11} />
        </motion.span>
      )}
      {st === 'playing' && (
        <motion.span animate={{ scale:[1,1.3,1] }} transition={{ repeat:Infinity, duration:0.6 }} style={{ display:'flex' }}>
          <BsStopCircleFill size={11} />
        </motion.span>
      )}
      {st === 'idle' && <BsVolumeUpFill size={12} />}
    </button>
  );
};

const scoreData = (correct, total) => {
  const pct = correct / total;
  if (pct === 1)  return { emoji: '🏆', msg: '¡Puntaje perfecto! ¡Eres un experto!',          color: '#f8c950' };
  if (pct >= 0.8) return { emoji: '🦕', msg: '¡Excelente! ¡Casi lo sabías todo!',              color: '#38ef7d' };
  if (pct >= 0.6) return { emoji: '🦖', msg: '¡Muy bien! ¡Sigue aprendiendo!',                 color: '#4fc3f7' };
  if (pct >= 0.4) return { emoji: '🥚', msg: '¡Buen intento! Revisa el resumen y vuelve.',     color: '#ffb74d' };
  return           { emoji: '📖', msg: '¡No te rindas! Lee el resumen e inténtalo de nuevo.', color: '#ef5350' };
};

const CARD_BASE = {
  backgroundColor: 'rgba(11,26,74,0.80)',
  borderRadius:    20,
  color:           '#fff',
};

const Trivia = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const { file, documentId, existingQuiz } = location.state || {};

  const [trivia,    setTrivia]    = useState(null);
  const [loadingQz, setLoadingQz] = useState(false);
  const [errorQz,   setErrorQz]   = useState(null);
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [current,   setCurrent]   = useState(0);

  useEffect(() => {
    // Si ya viene un quiz guardado desde Biblioteca, usarlo directamente
    if (existingQuiz) {
      const adapted = adaptarQuizReal(existingQuiz);
      setTrivia(adapted);
      return;
    }

    if (!documentId) return;

    const fetchQuiz = async () => {
      setLoadingQz(true);
      setErrorQz(null);
      try {
        const quizBackend = await quizService.generarQuiz(documentId);
        const adapted = adaptarQuizReal(quizBackend);
        setTrivia(adapted);
      } catch (err) {
        setErrorQz(err.response?.data || err.message || 'Error al generar la trivia');
      } finally {
        setLoadingQz(false);
      }
    };

    fetchQuiz();
  }, [documentId, existingQuiz]);

  /* ── Pantalla de carga mientras se genera el quiz ── */
  if (loadingQz) {
    return (
      <Container className="pt-5 mt-5 text-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          style={{ fontSize: '4rem', display: 'inline-block', marginBottom: '1.5rem' }}
        >
          🎮
        </motion.div>
        <h4 className="fw-bold">Generando tu trivia...</h4>
        <p className="text-light" style={{ opacity: 0.7 }}>La IA está preparando las preguntas</p>
      </Container>
    );
  }

  /* ── Error al generar el quiz ── */
  if (errorQz) {
    return (
      <Container className="pt-5 mt-5 text-center text-white">
        <p style={{ fontSize: '3rem' }}>⚠️</p>
        <h4 className="fw-bold">Error al generar la trivia</h4>
        <p className="text-light">{errorQz}</p>
        <button className="btn-yellow mt-4" onClick={() => navigate('/actividades')}>
          Volver a subir un archivo
        </button>
      </Container>
    );
  }

  /* ── Sin preguntas (backend aún no genera quiz completo) ── */
  if (!trivia?.questions) {
    return (
      <Container className="pt-5 mt-5 text-center text-white">
        <p style={{ fontSize: '3rem' }}>😕</p>
        <h4 className="fw-bold">No hay trivia disponible.</h4>
        <p className="text-light">El quiz no pudo ser generado para este documento.</p>
        <button className="btn-yellow mt-4" onClick={() => navigate('/actividades')}>
          Volver a subir un archivo
        </button>
      </Container>
    );
  }

  const questions = trivia.questions;
  const total     = questions.length;
  const answered  = Object.keys(answers).length;
  const correct   = questions.filter((q) => answers[q.id] === q.correct).length;
  const result    = scoreData(correct, total);

  const selectOption = (qId, idx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
    const qi = questions.findIndex((q) => q.id === qId);
    if (qi < questions.length - 1) {
      setTimeout(() => setCurrent(qi + 1), 400);
    }
  };

  const handleRetry = () => { setAnswers({}); setSubmitted(false); setCurrent(0); };

  return (
    <Container className="pt-5 mt-5 pb-5">

      {/* Barra superior */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2"
      >
        <div className="d-flex gap-2">
          {location.state?.fromBiblioteca && (
            <button
              className="btn btn-outline-light d-flex align-items-center gap-2"
              style={{ minHeight: 44, fontWeight: 700 }}
              onClick={() => navigate('/biblioteca')}
            >
              <BsArrowLeft /> Volver a Biblioteca
            </button>
          )}
          <button
            className="btn btn-outline-light d-flex align-items-center gap-2"
            style={{ minHeight: 44, fontWeight: 700 }}
            onClick={() => navigate('/actividades')}
          >
            <BsArrowLeft /> Subir otro archivo
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span style={{ color: '#d0d5ef', fontSize: '0.95rem', opacity: 0.8 }}>
            {file?.name ?? 'documento'}
          </span>
          <span
            style={{
              background:   'rgba(56,239,125,0.18)',
              border:       '2px solid rgba(56,239,125,0.5)',
              borderRadius: 30,
              padding:      '4px 14px',
              color:        '#38ef7d',
              fontWeight:   900,
              fontSize:     '1rem',
            }}
          >
            {answered}/{total} respondidas
          </span>
        </div>
      </motion.div>

      <Row className="justify-content-center">
        <Col md={10} lg={8}>

          {/* Cabecera con barra de progreso */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card
              className="shadow-lg mb-4"
              style={{ ...CARD_BASE, border: '2px solid rgba(56,239,125,0.4)', padding: '1.6rem 2rem' }}
            >
              <div className="d-flex align-items-center gap-3">
                <span style={{ fontSize: '2.8rem', lineHeight: 1 }}>🎮</span>
                <div className="flex-grow-1">
                  <h3 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>
                    {trivia.title}
                  </h3>
                  <div style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #11998e, #38ef7d)' }}
                      animate={{ width: `${(answered / total) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="mb-0 mt-1" style={{ fontSize: '0.9rem', color: '#38ef7d', fontWeight: 700 }}>
                    {answered === total ? '¡Todas respondidas! 🎉' : `Pregunta ${Math.min(current + 1, total)} de ${total}`}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Resultado final */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 180 }}
              >
                <Card
                  className="shadow-lg mb-4 text-center"
                  style={{ ...CARD_BASE, border: `3px solid ${result.color}66`, padding: '2.5rem 2rem' }}
                >
                  <motion.div
                    animate={{ rotate: [0, -12, 12, -6, 6, 0], scale: [1, 1.25, 1] }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                    style={{ fontSize: '5rem', marginBottom: '0.8rem' }}
                  >
                    {result.emoji}
                  </motion.div>

                  <h3 className="fw-bold mb-2" style={{ color: result.color, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>
                    {result.msg}
                  </h3>

                  <p style={{ fontSize: '1.15rem', color: '#dde8ff', marginBottom: '1.5rem' }}>
                    Acertaste{' '}
                    <strong style={{ color: result.color, fontSize: '1.4rem' }}>{correct}</strong>
                    {' '}de{' '}
                    <strong style={{ fontSize: '1.4rem' }}>{total}</strong> preguntas
                  </p>

                  <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
                    {questions.map((q, i) => {
                      const ok = answers[q.id] === q.correct;
                      return (
                        <motion.div
                          key={q.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 + i * 0.07 }}
                          style={{ textAlign: 'center' }}
                        >
                          <div
                            style={{
                              width: 46, height: 46, borderRadius: '50%',
                              background: ok ? 'rgba(56,239,125,0.18)' : 'rgba(239,83,80,0.18)',
                              border: `3px solid ${ok ? '#38ef7d' : '#ef5350'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              margin: '0 auto 6px',
                            }}
                          >
                            {ok
                              ? <BsCheckCircleFill color="#38ef7d" size={22} />
                              : <BsXCircleFill    color="#ef5350" size={22} />
                            }
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#a0aec0', fontWeight: 700 }}>P{i + 1}</span>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mb-4">
                    <SpeakButton
                      text={`${result.msg} Acertaste ${correct} de ${total} preguntas.`}
                      label="Escuchar resultado"
                    />
                  </div>

                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <button
                      className="btn btn-outline-light d-flex align-items-center gap-2"
                      style={{ minHeight: 48, fontWeight: 700, fontSize: '1rem' }}
                      onClick={handleRetry}
                    >
                      <BsArrowRepeat /> Intentar de nuevo
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preguntas */}
          {questions.map((q, qi) => {
            const chosen     = answers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect  = chosen === q.correct;
            const isCurrent  = qi === current && !submitted;

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + qi * 0.07 }}
                style={{ marginBottom: '1.4rem' }}
              >
                <Card
                  className="shadow"
                  style={{
                    ...CARD_BASE,
                    border: isCurrent
                      ? '2px solid rgba(56,239,125,0.7)'
                      : isAnswered
                        ? '2px solid rgba(255,255,255,0.22)'
                        : '2px solid rgba(255,255,255,0.1)',
                    padding: '1.6rem 1.8rem',
                    transition: 'border 0.3s',
                  }}
                >
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <span
                      style={{
                        background: isCurrent
                          ? 'linear-gradient(135deg, #11998e, #38ef7d)'
                          : isAnswered
                            ? 'rgba(255,255,255,0.2)'
                            : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 40, height: 40, minWidth: 40,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '1.05rem',
                        transition: 'all 0.3s', marginTop: 2,
                      }}
                    >
                      {qi + 1}
                    </span>

                    <div className="flex-grow-1">
                      <p className="fw-bold mb-2" style={{ fontSize: 'clamp(1.05rem, 3vw, 1.2rem)', lineHeight: 1.55, color: '#eef2ff' }}>
                        {q.text}
                      </p>
                      <SpeakButton text={q.text} label="Escuchar pregunta" />
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2 mt-3">
                    {q.options.map((opt, oi) => {
                      const isChosen = chosen === oi;
                      const isRight  = q.correct === oi;

                      let bg        = 'rgba(255,255,255,0.07)';
                      let border    = '2px solid rgba(255,255,255,0.18)';
                      let textColor = '#dde8ff';

                      if (submitted) {
                        if (isRight)       { bg = 'rgba(56,239,125,0.18)';  border = '2px solid #38ef7d'; textColor = '#d5fff0'; }
                        else if (isChosen) { bg = 'rgba(239,83,80,0.18)';   border = '2px solid #ef5350'; textColor = '#ffe0de'; }
                      } else if (isChosen) {
                        bg = 'rgba(56,239,125,0.14)'; border = '2px solid rgba(56,239,125,0.6)'; textColor = '#fff';
                      }

                      return (
                        <motion.div
                          key={oi}
                          role="button"
                          tabIndex={submitted ? -1 : 0}
                          whileHover={!submitted && !isChosen ? { x: 6, backgroundColor: 'rgba(255,255,255,0.12)' } : {}}
                          whileTap={!submitted ? { scale: 0.97 } : {}}
                          onClick={() => selectOption(q.id, oi)}
                          onKeyDown={e => { if (!submitted && (e.key === 'Enter' || e.key === ' ')) selectOption(q.id, oi); }}
                          className="text-start d-flex align-items-center gap-3"
                          style={{
                            background: bg, border, borderRadius: 14,
                            padding: '0.85rem 1.2rem', minHeight: 52,
                            cursor: submitted ? 'default' : 'pointer',
                            color: textColor, transition: 'all 0.2s',
                            fontSize: '1.05rem', userSelect: 'none',
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 900, fontSize: '1rem', minWidth: 24,
                              color: submitted && isRight ? '#38ef7d' : submitted && isChosen ? '#ef5350' : '#38ef7d',
                            }}
                          >
                            {LETTER[oi]}
                          </span>
                          <span style={{ flex: 1, lineHeight: 1.4 }}>{opt}</span>
                          <MiniSpeak text={opt} />
                          {submitted && isRight  && <BsCheckCircleFill color="#38ef7d" size={22} />}
                          {submitted && isChosen && !isRight && <BsXCircleFill color="#ef5350" size={22} />}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Explicación tras enviar */}
                  <AnimatePresence>
                    {submitted && q.explanation && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        transition={{ delay: qi * 0.06 }}
                        style={{
                          marginTop: '1.2rem',
                          background: isCorrect ? 'rgba(56,239,125,0.1)' : 'rgba(239,83,80,0.1)',
                          border: `2px solid ${isCorrect ? 'rgba(56,239,125,0.4)' : 'rgba(239,83,80,0.4)'}`,
                          borderRadius: 14, padding: '1rem 1.2rem',
                        }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {isCorrect
                            ? <BsCheckCircleFill color="#38ef7d" size={20} />
                            : <BsXCircleFill     color="#ef5350" size={20} />
                          }
                          <strong style={{ color: isCorrect ? '#38ef7d' : '#ef5350', fontSize: '1rem' }}>
                            {isCorrect ? '¡Correcto!' : '¡Casi! La respuesta correcta era otra.'}
                          </strong>
                        </div>
                        <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: '#dde8ff', margin: 0 }}>
                          {q.explanation}
                        </p>
                        <div className="mt-3">
                          <SpeakButton
                            text={`${isCorrect ? '¡Correcto!' : 'La respuesta correcta era otra.'} ${q.explanation}`}
                            label="Escuchar explicación"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}

          {/* Botón Enviar */}
          {!submitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-2 mb-5"
            >
              <button
                className="btn-space d-inline-flex align-items-center gap-2"
                style={{
                  background: 'linear-gradient(45deg, #11998e, #38ef7d)',
                  opacity:  answered < total ? 0.45 : 1,
                  cursor:   answered < total ? 'not-allowed' : 'pointer',
                  fontSize: '1.15rem', padding: '14px 40px', minHeight: 54,
                }}
                disabled={answered < total}
                onClick={() => setSubmitted(true)}
              >
                <BsTrophy size={22} />
                {answered < total
                  ? `Faltan ${total - answered} pregunta${total - answered > 1 ? 's' : ''}`
                  : '¡Ver mis resultados!'}
              </button>

              {answered < total && (
                <p className="text-light mt-2 mb-0" style={{ opacity: 0.6, fontSize: '0.95rem' }}>
                  Responde todas las preguntas para continuar
                </p>
              )}
            </motion.div>
          )}

        </Col>
      </Row>
    </Container>
  );
};

export default Trivia;
