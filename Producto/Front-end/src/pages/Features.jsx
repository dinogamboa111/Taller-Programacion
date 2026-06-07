import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { BsMagic, BsController, BsGraphUp, BsUnlockFill } from 'react-icons/bs';

const Features = () => {
  const features = [
    { icon: <BsMagic />, title: "Resúmenes Mágicos", desc: "Convierte textos largos en resúmenes divertidos y fáciles de entender con IA." },
    { icon: <BsController />, title: "Trivias Interactivas", desc: "Juega y aprende al mismo tiempo. Creamos preguntas basadas en tus documentos." },
    { icon: <BsGraphUp />, title: "Estadísticas", desc: "Mide tu progreso, ve cuánto has estudiado y recibe recomendaciones personalizadas." },
    { icon: <BsUnlockFill />, title: "¡100% Gratuito!", desc: "Todas estas herramientas son completamente gratuitas. ¡Solo necesitas registrarte para empezar!" }
  ];

  return (
    <Container className="pt-5 mt-5 pb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center text-white fw-bold mb-5" style={{ fontSize: '3rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
          ¿Qué puedes hacer en Kidyra?
        </h2>

        <Row className="g-4">
          {features.map((feat, idx) => (
            <Col md={6} key={idx}>
              <Card className="glass-panel text-white border-0 h-100 p-4" style={{ backgroundColor: 'rgba(11, 26, 74, 0.6)' }}>
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
