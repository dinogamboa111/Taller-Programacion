import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { BsArrowLeft, BsController, BsClock } from 'react-icons/bs';
import SpeakButton from '../components/SpeakButton';

// Convierte { fileName, summary } del backend al shape que espera el render
const adaptarResumenReal = (summaryReal) => {
  if (!summaryReal?.summary) return null;
  return {
    title:    summaryReal.fileName || 'Resumen generado',
    readTime: 'Generado por IA',
    tags:       [],
    highlights: [],
    sections: [
      {
        emoji:   '📄',
        heading: 'Resumen del documento',
        body:    summaryReal.summary,
      },
    ],
  };
};

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

const CARD_STYLE = {
  backgroundColor: 'rgba(11,26,74,0.80)',
  border:          '2px solid rgba(255,255,255,0.15)',
  borderRadius:    20,
  padding:         '2rem 2.2rem',
  marginBottom:    '1.4rem',
};

const Resumen = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const { file, summaryReal, documentId } = location.state || {};
  const summary = adaptarResumenReal(summaryReal);

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
    navigate('/actividades/trivia', { state: { file, documentId } });

  return (
    <Container className="pt-5 mt-5 pb-5">

      <motion.div {...fadeUp(0)} className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
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

        {documentId && (
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

          {/* Cabecera */}
          <motion.div {...fadeUp(0.05)}>
            <Card className="text-white shadow-lg" style={{ ...CARD_STYLE, border: '2px solid rgba(248,201,80,0.5)' }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <span style={{ fontSize: '3rem', lineHeight: 1 }}>🦕</span>
                <div>
                  <h2 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', lineHeight: 1.2, color:'#f8c950' }}>
                    {summary.title}
                  </h2>
                  <span className="d-flex align-items-center gap-2" style={{ color: '#f8c950', fontWeight: 700, fontSize: '1rem' }}>
                    <BsClock /> {summary.readTime}
                  </span>
                </div>
              </div>

              <p className="text-light mb-3" style={{ fontSize: '1rem', opacity: 0.8 }}>
                📄 Generado a partir de: <strong>{file?.name ?? 'tu documento'}</strong>
              </p>

              <SpeakButton text={summary.title} label="Escuchar título" />
            </Card>
          </motion.div>

          {/* Secciones del resumen */}
          {summary.sections?.map((sec, i) => (
            <motion.div key={i} {...fadeUp(0.1 + i * 0.08)}>
              <Card className="text-white shadow" style={CARD_STYLE}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span
                    style={{
                      fontSize: '2.2rem',
                      background: 'rgba(255,255,255,0.08)',
                      border: '2px solid rgba(255,255,255,0.18)',
                      borderRadius: 14,
                      padding: '8px 12px',
                      lineHeight: 1,
                    }}
                  >
                    {sec.emoji}
                  </span>
                  <h4 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', color: '#a8d8ff', lineHeight: 1.3 }}>
                    {sec.heading}
                  </h4>
                </div>

                <p style={{ fontSize: '1.08rem', lineHeight: 1.85, color: '#dde8ff', marginBottom: '1.2rem', whiteSpace: 'pre-wrap' }}>
                  {sec.body}
                </p>

                <SpeakButton text={`${sec.heading}. ${sec.body}`} label="Escuchar sección" />
              </Card>
            </motion.div>
          ))}

          {/* CTA trivia */}
          {documentId && (
            <motion.div {...fadeUp(0.4)} className="text-center mt-3 mb-5">
              <p className="fw-bold mb-3" style={{ fontSize: '1.15rem', color: '#eef2ff', opacity: 0.85 }}>
                ¿Quieres poner a prueba lo que aprendiste? 🦖
              </p>
              <button
                className="btn-space d-inline-flex align-items-center gap-2"
                style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)', fontSize: '1.15rem', padding: '14px 36px', minHeight: 52 }}
                onClick={goToTrivia}
              >
                <BsController size={24} /> ¡Jugar Trivia!
              </button>
            </motion.div>
          )}

        </Col>
      </Row>
    </Container>
  );
};

export default Resumen;
