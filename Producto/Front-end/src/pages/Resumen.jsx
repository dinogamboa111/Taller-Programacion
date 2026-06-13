import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { BsArrowLeft, BsController, BsClock } from 'react-icons/bs';
import SpeakButton from '../components/SpeakButton';

/* ── Animación de entrada escalonada ── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

/* ── Estilos de cards accesibles para niños ── */
const CARD_STYLE = {
  backgroundColor: 'rgba(8, 18, 60, 0.85)',   // alta opacidad → mayor contraste
  border:          '2px solid rgba(255,255,255,0.2)',
  borderRadius:    20,
  padding:         '2rem 2.2rem',
  marginBottom:    '1.4rem',
};

const Resumen = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  // Ambos datasets viajan en el state para poder cruzar a trivia
  const { file, summary, trivia } = location.state || {};

  /* ── Guardia ── */
  if (!summary) {
    return (
      <Container className="pt-5 mt-5 text-center text-white">
        <p style={{ fontSize: '3rem' }}>😕</p>
        <h4 className="fw-bold">No hay resumen disponible.</h4>
        <button className="btn-yellow mt-4" onClick={() => navigate('/actividades')}>
          Volver a subir un archivo
        </button>
      </Container>
    );
  }

  const goToTrivia = () =>
    navigate('/actividades/trivia', { state: { file, summary, trivia } });

  /* ── Render ── */
  return (
    <Container className="pt-5 mt-5 pb-5">

      {/* ── Barra de navegación ── */}
      <motion.div {...fadeUp(0)} className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <button
          className="btn btn-outline-light d-flex align-items-center gap-2"
          style={{ minHeight: 44, fontWeight: 700 }}
          onClick={() => navigate('/actividades')}
        >
          <BsArrowLeft /> Subir otro archivo
        </button>

        {trivia && (
          <button
            className="btn-space d-flex align-items-center gap-2"
            style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)', fontSize: '1rem', padding: '10px 24px', minHeight: 44 }}
            onClick={goToTrivia}
          >
            <BsController /> ¡Jugar Trivia!
          </button>
        )}
      </motion.div>

      <Row className="justify-content-center">
        <Col md={10} lg={9}>

          {/* ── CARD: Cabecera ── */}
          <motion.div {...fadeUp(0.05)}>
            <Card className="text-white shadow-lg" style={{ ...CARD_STYLE, border: '2px solid rgba(248,201,80,0.5)' }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <span style={{ fontSize: '3rem', lineHeight: 1 }}>🦕</span>
                <div>
                  <h2 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', lineHeight: 1.2 }}>
                    {summary.title}
                  </h2>
                  <span className="d-flex align-items-center gap-2" style={{ color: '#f8c950', fontWeight: 700, fontSize: '1rem' }}>
                    <BsClock /> {summary.readTime}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {summary.tags?.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      background:   'rgba(248,201,80,0.2)',
                      border:       '2px solid rgba(248,201,80,0.5)',
                      borderRadius: 30,
                      padding:      '4px 14px',
                      fontSize:     '0.95rem',
                      fontWeight:   700,
                      color:        '#f8c950',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-light mb-3" style={{ fontSize: '1rem', opacity: 0.8 }}>
                📄 Generado a partir de: <strong>{file?.name ?? 'tu documento'}</strong>
              </p>

              {/* Escuchar el título y los tags */}
              <SpeakButton
                text={`${summary.title}. Temas: ${summary.tags?.join(', ')}.`}
                label="Escuchar título"
              />
            </Card>
          </motion.div>

          {/* ── CARD: Puntos destacados ── */}
          <motion.div {...fadeUp(0.12)}>
            <Card className="text-white shadow" style={{ ...CARD_STYLE, border: '2px solid rgba(248,201,80,0.35)' }}>
              <h4 className="fw-bold mb-4" style={{ color: '#f8c950', fontSize: '1.3rem' }}>
                🌟 ¡Puntos importantes!
              </h4>

              <div className="d-flex flex-column gap-3 mb-4">
                {summary.highlights?.map((hl, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + i * 0.1 }}
                    style={{
                      display:      'flex',
                      alignItems:   'flex-start',
                      gap:          14,
                      background:   'rgba(248,201,80,0.08)',
                      border:       '2px solid rgba(248,201,80,0.3)',
                      borderRadius: 14,
                      padding:      '1rem 1.2rem',
                    }}
                  >
                    {/* Número del punto */}
                    <span
                      style={{
                        background:     'linear-gradient(135deg, #f8c950, #ffd666)',
                        color:          '#1a1a1a',
                        borderRadius:   '50%',
                        width:          34,
                        height:         34,
                        minWidth:       34,
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        fontWeight:     900,
                        fontSize:       '1rem',
                        marginTop:      2,
                      }}
                    >
                      {i + 1}
                    </span>

                    <div className="flex-grow-1">
                      <p className="m-0" style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#eef2ff' }}>
                        {hl}
                      </p>
                      {/* Botón escuchar por cada punto */}
                      <div className="mt-2">
                        <SpeakButton text={hl} label="Escuchar" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* ── CARDS: Secciones del resumen ── */}
          {summary.sections?.map((sec, i) => (
            <motion.div key={i} {...fadeUp(0.2 + i * 0.1)}>
              <Card className="text-white shadow" style={CARD_STYLE}>
                {/* Emoji + heading */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span
                    style={{
                      fontSize:       '2.2rem',
                      background:     'rgba(255,255,255,0.08)',
                      border:         '2px solid rgba(255,255,255,0.18)',
                      borderRadius:   14,
                      padding:        '8px 12px',
                      lineHeight:     1,
                    }}
                  >
                    {sec.emoji}
                  </span>
                  <h4
                    className="fw-bold mb-0"
                    style={{ fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', color: '#a8d8ff', lineHeight: 1.3 }}
                  >
                    {sec.heading}
                  </h4>
                </div>

                {/* Texto del cuerpo */}
                <p
                  style={{
                    fontSize:   '1.08rem',
                    lineHeight: 1.85,
                    color:      '#dde8ff',
                    marginBottom: '1.2rem',
                  }}
                >
                  {sec.body}
                </p>

                {/* Botón escuchar la sección completa */}
                <SpeakButton
                  text={`${sec.heading}. ${sec.body}`}
                  label="Escuchar sección"
                />
              </Card>
            </motion.div>
          ))}

          {/* ── CTA final: ir a trivia ── */}
          {trivia && (
            <motion.div {...fadeUp(0.55)} className="text-center mt-3 mb-5">
              <p
                className="fw-bold mb-3"
                style={{ fontSize: '1.15rem', color: '#eef2ff', opacity: 0.85 }}
              >
                ¿Quieres poner a prueba lo que aprendiste? 🦖
              </p>
              <button
                className="btn-space d-inline-flex align-items-center gap-2"
                style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)', fontSize: '1.15rem', padding: '14px 36px', minHeight: 52 }}
                onClick={goToTrivia}
              >
                <BsController size={24} /> ¡Jugar Trivia de Dinosaurios!
              </button>
            </motion.div>
          )}

        </Col>
      </Row>
    </Container>
  );
};


/* ─────────────────────────────────────────────────────────────────────────────
   Soporte para datos reales del backend
   Cuando se navegue desde handleUploadReal, el state traera summaryReal
   en lugar de summary (mock). Este helper normaliza ambos formatos.

   Shape backend: { fileName, summary (texto plano) }
   Shape mock:    { title, readTime, tags, highlights, sections }
   ───────────────────────────────────────────────────────────────────────────── */

// Convierte la respuesta del backend al shape que espera el render de Resumen
// Params: summaryReal - objeto { fileName, summary } del backend
// Returns: objeto compatible con el shape mock
export const adaptarResumenReal = (summaryReal) => {
  if (!summaryReal) return null;

  return {
    title:      summaryReal.fileName || 'Resumen generado',
    readTime:   'Generado por IA',
    tags:       [],
    highlights: [],
    // El texto completo se muestra como una sola seccion
    sections: [
      {
        emoji:   '📄',
        heading: 'Resumen del documento',
        body:    summaryReal.summary || '',
      },
    ],
  };
};

// Para usar en Resumen.jsx, reemplazar la linea:
//   const { file, summary, trivia } = location.state || {};
// por:
//   const { file, summary: summaryMock, summaryReal, trivia, documentId } = location.state || {};
//   const summary = summaryMock || adaptarResumenReal(summaryReal);



export default Resumen;
