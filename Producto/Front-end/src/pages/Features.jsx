import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { BsMagic, BsController, BsJoystick, BsUnlockFill } from 'react-icons/bs';

const Features = () => {
  const features = [
    { icon: <BsMagic />, title: "Resúmenes Mágicos", desc: "Convierte textos largos en resúmenes divertidos y fáciles de entender con IA." },
    { icon: <BsController />, title: "Trivias Interactivas", desc: "Juega y aprende al mismo tiempo. Creamos preguntas basadas en tus documentos." },
    { icon: <BsJoystick />, title: "Juegos", desc: "Pon a prueba lo aprendido con la Carrera Jurásica o Espacial. Esquiva obstáculos y bate tu record!" },
    { icon: <BsUnlockFill />, title: "¡100% Gratuito!", desc: "Todas estas herramientas son completamente gratuitas. ¡Solo necesitas registrarte para empezar!" }
  ];

  return (
    <Container className="pt-5 mt-5 pb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          style={{
            marginBottom:'2rem',
            background:'rgba(11,26,74,0.80)',
            backdropFilter:'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            borderRadius:20,
            border:'1px solid rgba(255,255,255,0.15)',
            padding:'1.1rem 1.4rem',
            boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
            textAlign:'center',
          }}
        >
          <h2 className="fw-bold mb-0" style={{ fontSize:'2rem', color:'#f8c950' }}>
            ¿Que puedes hacer en Kidyra?
          </h2>
        </motion.div>

        <Row className="g-4">
          {features.map((feat, idx) => (
            <Col md={6} key={idx}>
              <Card className="glass-panel text-white border-0 h-100 p-4" style={{ backgroundColor: 'rgba(11,26,74,0.80)' }}>
                <div className="d-flex align-items-start gap-4">
                  <div className="text-warning" style={{ fontSize: '3rem' }}>
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="fw-bold text-info mb-2">{feat.title}</h4>
                    <p className="text-light fs-5 mb-0">{feat.desc}</p>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </motion.div>
    </Container>
  );
};

export default Features;
