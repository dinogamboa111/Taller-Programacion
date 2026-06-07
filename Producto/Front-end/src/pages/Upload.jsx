import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCloudUpload, BsFileText, BsController, BsMagic } from 'react-icons/bs';
import { MOCK_SUMMARY, MOCK_TRIVIA, LOADING_STEPS } from '../data/mockDinos';

const Upload = () => {
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [step, setStep]             = useState(0);
  const [stepType, setStepType]     = useState(null);

  /* ── Handlers de archivo ── */
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  /* ── Simulación de carga → navegación ── */
  const simulate = (type) => {
    setLoading(true);
    setStep(0);
    setStepType(type);

    const steps = LOADING_STEPS[type];
    let current = 0;

    const advance = () => {
      current += 1;
      if (current < steps.length) {
        setStep(current);
        setTimeout(advance, 900);
      } else {
        // Navegar con AMBOS datasets en el state (resumen y trivia pueden cruzarse)
        setTimeout(() => {
          const destination = type === 'summary' ? '/actividades/resumen' : '/actividades/trivia';
          navigate(destination, {
            state: {
              file:    { name: file.name, size: file.size },
              summary: MOCK_SUMMARY,
              trivia:  MOCK_TRIVIA,
            },
          });
        }, 600);
      }
    };

    setTimeout(advance, 900);
  };

  const steps = stepType ? LOADING_STEPS[stepType] : [];

  /* ── Render ── */
  return (
    <Container className="pt-5 mt-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <AnimatePresence mode="wait">

              {/* ── Pantalla de carga ── */}
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="glass-panel text-white border-0 shadow-lg text-center"
                    style={{ backgroundColor: 'rgba(11, 26, 74, 0.82)', padding: '5rem 3rem', border: '2px solid rgba(255,255,255,0.15)' }}
                  >
                    <motion.div
                      key={step}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1,   opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      style={{ fontSize: '5rem', marginBottom: '1.5rem' }}
                    >
                      {steps[step]?.icon}
                    </motion.div>

                    <motion.h4
                      key={`msg-${step}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="fw-bold mb-4"
                      style={{ fontSize: '1.5rem' }}
                    >
                      {steps[step]?.msg}
                    </motion.h4>

                    {/* Barra de progreso */}
                    <div style={{ width: '100%', height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.15)', overflow: 'hidden', margin: '0 auto' }}>
                      <motion.div
                        style={{
                          height: '100%', borderRadius: 99,
                          background: stepType === 'summary'
                            ? 'linear-gradient(90deg, #f8c950, #ffd666)'
                            : 'linear-gradient(90deg, #11998e, #38ef7d)',
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>

                    <div className="d-flex justify-content-center gap-2 mt-4">
                      {steps.map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: i === step ? 1.4 : 1, opacity: i <= step ? 1 : 0.3 }}
                          style={{
                            width: 12, height: 12, borderRadius: '50%',
                            background: stepType === 'summary' ? '#f8c950' : '#38ef7d',
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-light mt-4 mb-0" style={{ opacity: 0.7, fontSize: '1rem' }}>
                      Procesando: <strong>{file?.name}</strong>
                    </p>
                  </Card>
                </motion.div>

              ) : (

                /* ── Pantalla de upload ── */
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="glass-panel text-white border-0 shadow-lg p-5 text-center"
                    style={{ backgroundColor: 'rgba(11, 26, 74, 0.4)' }}
                  >
                    <h2 className="fw-bold mb-4">Sube tu Documento</h2>
                    <p className="text-light mb-4 fs-5">
                      Convierte tus lecturas aburridas en resúmenes mágicos o juegos de trivia.
                    </p>

                    {!file ? (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          style={{ display: 'none' }}
                          onChange={handleFileInput}
                        />
                        <div
                          className={`p-5 rounded-4 mb-4 ${isDragging ? 'bg-white bg-opacity-25' : 'bg-white bg-opacity-10'}`}
                          style={{ border: '3px dashed rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.3s' }}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <BsCloudUpload size={80} className="mb-3 text-warning" />
                          </motion.div>
                          <h4 className="fw-bold">Arrastra tu PDF aquí</h4>
                          <p className="text-light m-0">o haz clic para buscar en tus archivos</p>
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-4 mb-4 bg-white bg-opacity-10 d-flex align-items-center justify-content-center gap-3"
                        style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                      >
                        <BsFileText size={40} className="text-info" />
                        <div className="text-start">
                          <h5 className="m-0 fw-bold">{file.name}</h5>
                          <small className="text-light">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                        </div>
                        <button className="btn btn-sm btn-outline-light ms-3" onClick={() => setFile(null)}>
                          Cambiar
                        </button>
                      </motion.div>
                    )}

                    <div
                      className={`d-flex flex-column flex-md-row gap-3 justify-content-center mt-4 ${!file ? 'opacity-50' : ''}`}
                      style={{ pointerEvents: !file ? 'none' : 'auto' }}
                    >
                      <button
                        className="btn-yellow d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                        onClick={() => simulate('summary')}
                      >
                        <BsMagic size={24} /> Crear Resumen Mágico
                      </button>
                      <button
                        className="btn-space d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                        style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)' }}
                        onClick={() => simulate('trivia')}
                      >
                        <BsController size={24} /> Jugar Trivia con esto
                      </button>
                    </div>
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default Upload;
