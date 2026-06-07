import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsArrowLeft, BsCheckCircleFill, BsXCircleFill,
  BsFileText, BsTrophy, BsArrowRepeat,
} from 'react-icons/bs';
import SpeakButton from '../components/SpeakButton';

/* ── Helpers ── */
const LETTER = ['A', 'B', 'C', 'D'];

const scoreData = (correct, total) => {
  const pct = correct / total;
  if (pct === 1)   return { emoji: '🏆', msg: '¡Puntaje perfecto! ¡Eres un experto en dinos!', color: '#f8c950' };
  if (pct >= 0.8)  return { emoji: '🦕', msg: '¡Excelente! ¡Casi lo sabías todo!',              color: '#38ef7d' };
  if (pct >= 0.6)  return { emoji: '🦖', msg: '¡Muy bien! ¡Sigue aprendiendo!',                 color: '#4fc3f7' };
  if (pct >= 0.4)  return { emoji: '🥚', msg: '¡Buen intento! Revisa el resumen y vuelve.',     color: '#ffb74d' };
  return            { emoji: '📖', msg: '¡No te rindas! Lee el resumen e inténtalo de nuevo.', color: '#ef5350' };
};

/* ── Estilos de cards accesibles para niños ── */
const CARD_BASE = {
  backgroundColor: 'rgba(8, 18, 60, 0.85)',
  borderRadius:    20,
  color:           '#fff',
};

const Trivia = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const { file, summary, trivia } = location.state || {};

  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [current,   setCurrent]   = useState(0);

  /* ── Guardia ── */
  if (!trivia?.questions) {
    return (
      <Container className="pt-5 mt-5 text-center text-white">
        <p style={{ fontSize: '3rem' }}>😕</p>
        <h4 className="fw-bold">No hay trivia disponible.</h4>
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

  /* ── Render ── */
  return (
    <Container className="pt-5 mt-5 pb-5">

      {/* ── Barra superior ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2"
      >
        <button
          className="btn btn-outline-light d-flex align-items-center gap-2"
          style={{ minHeight: 44, fontWeight: 700 }}
          onClick={() => navigate('/actividades')}
        >
          <BsArrowLeft /> Subir otro archivo
        </button>

        {/* Contador de progreso */}
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

          {/* ── CARD: Cabecera con barra de progreso ── */}
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
                  {/* Barra de progreso */}
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

          {/* ── CARD: Resultado final ── */}
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
                  style={{
                    ...CARD_BASE,
                    border:  `3px solid ${result.color}66`,
                    padding: '2.5rem 2rem',
                  }}
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

                  {/* Mini scoreboard */}
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
                              width:          46, height: 46, borderRadius: '50%',
                              background:     ok ? 'rgba(56,239,125,0.18)' : 'rgba(239,83,80,0.18)',
                              border:         `3px solid ${ok ? '#38ef7d' : '#ef5350'}`,
                              display:        'flex',
                              alignItems:     'center',
                              justifyContent: 'center',
                              margin:         '0 auto 6px',
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

                  {/* Escuchar resultado */}
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
                    {summary && (
                      <button
                        className="btn-yellow d-flex align-items-center gap-2"
                        style={{ minHeight: 48, fontSize: '1rem' }}
                        onClick={() => navigate('/actividades/resumen', { state: location.state })}
                      >
                        <BsFileText size={20} /> Ver Resumen
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CARDS: Preguntas ── */}
          {questions.map((q, qi) => {
            const chosen    = answers[q.id];
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
                    border:     isCurrent
                      ? '2px solid rgba(56,239,125,0.7)'
                      : isAnswered
                        ? '2px solid rgba(255,255,255,0.22)'
                        : '2px solid rgba(255,255,255,0.1)',
                    padding:    '1.6rem 1.8rem',
                    transition: 'border 0.3s',
                  }}
                >
                  {/* Número + texto de pregunta */}
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <span
                      style={{
                        background:     isCurrent
                          ? 'linear-gradient(135deg, #11998e, #38ef7d)'
                          : isAnswered
                            ? 'rgba(255,255,255,0.2)'
                            : 'rgba(255,255,255,0.1)',
                        color:          '#fff',
                        borderRadius:   '50%',
                        width:          40, height: 40, minWidth: 40,
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        fontWeight:     900,
                        fontSize:       '1.05rem',
                        transition:     'all 0.3s',
                        marginTop:      2,
                      }}
                    >
                      {qi + 1}
                    </span>

                    <div className="flex-grow-1">
                      <p
                        className="fw-bold mb-2"
                        style={{ fontSize: 'clamp(1.05rem, 3vw, 1.2rem)', lineHeight: 1.55, color: '#eef2ff' }}
                      >
                        {q.text}
                      </p>
                      {/* Botón escuchar la pregunta */}
                      <SpeakButton text={q.text} label="Escuchar pregunta" />
                    </div>
                  </div>

                  {/* Opciones de respuesta */}
                  <div className="d-flex flex-column gap-2 mt-3">
                    {q.options.map((opt, oi) => {
                      const isChosen = chosen === oi;
                      const isRight  = q.correct === oi;

                      // Colores tras submit
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
                        <motion.button
                          key={oi}
                          whileHover={!submitted && !isChosen ? { x: 6, backgroundColor: 'rgba(255,255,255,0.12)' } : {}}
                          whileTap={!submitted ? { scale: 0.97 } : {}}
                          onClick={() => selectOption(q.id, oi)}
                          className="text-start d-flex align-items-center gap-3"
                          style={{
                            background:  bg,
                            border,
                            borderRadius: 14,
                            padding:     '0.85rem 1.2rem',
                            minHeight:   52,          // objetivo de toque accesible ≥ 44 px
                            cursor:      submitted ? 'default' : 'pointer',
                            color:       textColor,
                            transition:  'all 0.2s',
                            fontFamily:  'inherit',
                            fontSize:    '1.05rem',
                          }}
                        >
                          {/* Letra de opción */}
                          <span
                            style={{
                              fontWeight:     900,
                              fontSize:       '1rem',
                              color:          submitted && isRight ? '#38ef7d' : submitted && isChosen ? '#ef5350' : '#38ef7d',
                              minWidth:       24,
                            }}
                          >
                            {LETTER[oi]}
                          </span>

                          <span style={{ flex: 1, lineHeight: 1.4 }}>{opt}</span>

                          {/* Ícono de resultado */}
                          {submitted && isRight  && <BsCheckCircleFill color="#38ef7d" size={22} />}
                          {submitted && isChosen && !isRight && <BsXCircleFill color="#ef5350" size={22} />}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* ── Explicación tras enviar ── */}
                  <AnimatePresence>
                    {submitted && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0,  height: 'auto' }}
                        transition={{ delay: qi * 0.06 }}
                        style={{
                          marginTop:    '1.2rem',
                          background:   isCorrect ? 'rgba(56,239,125,0.1)' : 'rgba(239,83,80,0.1)',
                          border:       `2px solid ${isCorrect ? 'rgba(56,239,125,0.4)' : 'rgba(239,83,80,0.4)'}`,
                          borderRadius: 14,
                          padding:      '1rem 1.2rem',
                        }}
                      >
                        {/* Etiqueta correcto/incorrecto con ícono */}
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {isCorrect
                            ? <BsCheckCircleFill color="#38ef7d" size={20} />
                            : <BsXCircleFill     color="#ef5350" size={20} />
                          }
                          <strong style={{ color: isCorrect ? '#38ef7d' : '#ef5350', fontSize: '1rem' }}>
                            {isCorrect ? '¡Correcto!' : '¡Casi! La respuesta correcta era otra.'}
                          </strong>
                        </div>

                        <p
                          style={{ fontSize: '1.02rem', lineHeight: 1.7, color: '#dde8ff', margin: 0 }}
                        >
                          {q.explanation}
                        </p>

                        {/* Botón escuchar la explicación */}
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

          {/* ── Botón Enviar respuestas ── */}
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
                  opacity:    answered < total ? 0.45 : 1,
                  cursor:     answered < total ? 'not-allowed' : 'pointer',
                  fontSize:   '1.15rem',
                  padding:    '14px 40px',
                  minHeight:  54,
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
