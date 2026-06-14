import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';

const About = () => {
  return (
    <Container className="pt-5 mt-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header card */}
        <motion.div
          initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          style={{
            marginBottom:'1.5rem',
            background:'rgba(11,26,74,0.80)',
            backdropFilter:'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            borderRadius:20,
            border:'1px solid rgba(255,255,255,0.15)',
            padding:'1rem 1.4rem',
            boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
            textAlign:'center',
          }}
        >
          <h2 className="fw-bold mb-0" style={{ fontSize:'2rem', color:'#f8c950' }}>Acerca de Nosotros</h2>
        </motion.div>

        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="glass-panel text-white border-0 shadow-lg p-5" style={{ backgroundColor: 'rgba(11,26,74,0.80)' }}>
              
              <div className="fs-5" style={{ lineHeight: '1.8' }}>
                <p>
                  <strong>Kidyra</strong> nace como un proyecto académico con una misión clara y apasionada: 
                  acercar la educación a los niños de una manera que realmente resuene con ellos.
                </p>
                <p>
                  Entendemos que cada niño es un universo distinto y que el aprendizaje tradicional a menudo no se adapta 
                  a sus intereses y ritmos. Por eso, hemos creado un entorno donde la educación se amolda a ellos, y no al revés.
                </p>
                <p>
                  A través de mundos interactivos, gamificación y el uso de inteligencia artificial, buscamos transformar 
                  "tener que estudiar" en "querer explorar". Kidyra es nuestro granito de arena para construir un futuro 
                  donde aprender sea la aventura más emocionante.
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default About;
