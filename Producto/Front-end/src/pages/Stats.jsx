import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { BsClockHistory, BsCheckCircleFill, BsFiles, BsLightbulbFill } from 'react-icons/bs';

const Stats = () => {
  return (
    <Container className="pt-5 mt-5 pb-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-center text-white fw-bold mb-5" style={{ fontSize: '3rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
          Tus Estadísticas de Aprendizaje
        </h2>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="glass-panel text-white border-0 h-100 p-4 text-center" style={{ backgroundColor: 'rgba(11, 26, 74, 0.5)' }}>
              <BsClockHistory size={50} className="mb-3 text-warning mx-auto" />
              <h5 className="fw-bold text-light mb-2">Tiempo de Estudio</h5>
              <h2 className="fw-bold mb-0" style={{ fontSize: '2.5rem' }}>12 hrs</h2>
              <p className="text-light mt-2 mb-0">Esta semana</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="glass-panel text-white border-0 h-100 p-4 text-center" style={{ backgroundColor: 'rgba(11, 26, 74, 0.5)' }}>
              <BsCheckCircleFill size={50} className="mb-3 text-success mx-auto" />
              <h5 className="fw-bold text-light mb-2">Precisión en Trivias</h5>
              <div className="d-flex align-items-center justify-content-center gap-3 mt-2">
                <h2 className="fw-bold mb-0" style={{ fontSize: '2.5rem' }}>85%</h2>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'conic-gradient(#38ef7d 85%, rgba(255,255,255,0.2) 0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#0b1a4a' }}></div>
                </div>
              </div>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="glass-panel text-white border-0 h-100 p-4 text-center" style={{ backgroundColor: 'rgba(11, 26, 74, 0.5)' }}>
              <BsFiles size={50} className="mb-3 text-info mx-auto" />
              <h5 className="fw-bold text-light mb-2">Documentos Jugados</h5>
              <h2 className="fw-bold mb-0" style={{ fontSize: '2.5rem' }}>24</h2>
              <p className="text-light mt-2 mb-0">Convertidos a magia</p>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card className="glass-panel text-white border-0 p-4" style={{ backgroundColor: 'rgba(11, 26, 74, 0.5)' }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-warning p-3 rounded-circle d-flex">
                  <BsLightbulbFill size={30} className="text-dark" />
                </div>
                <div>
                  <h4 className="fw-bold mb-1">Recomendación de tu IA</h4>
                  <p className="text-light mb-0 fs-5">¡Te fue genial en Ciencias! Vamos a repasar un poco más de Historia para mantener el ritmo.</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h6 className="fw-bold mb-2">Progreso de Ciencias</h6>
                <ProgressBar variant="success" now={90} className="mb-3" style={{ height: '15px' }} />
                <h6 className="fw-bold mb-2">Progreso de Historia</h6>
                <ProgressBar variant="warning" now={45} style={{ height: '15px' }} />
              </div>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default Stats;
