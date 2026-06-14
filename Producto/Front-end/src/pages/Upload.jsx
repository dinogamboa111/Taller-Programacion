import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCloudUpload, BsFileText, BsController, BsMagic, BsExclamationTriangle } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { documentoService } from '../services/documentoService';
import { resumenService } from '../services/resumenService';
import { quizService } from '../services/quizService';

const STEPS = {
  summary: [
    { icon: '📤', msg: 'Subiendo tu documento...' },
    { icon: '🤖', msg: 'La IA está generando tu resumen...' },
    { icon: '✨', msg: '¡Listo!' },
  ],
  trivia: [
    { icon: '📤', msg: 'Subiendo tu documento...' },
    { icon: '🔍', msg: 'Analizando el contenido...' },
    { icon: '🎮', msg: '¡Preparando la trivia!' },
  ],
};

const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];

const isValidFile = (f) => {
  const ext = '.' + f.name.split('.').pop().toLowerCase();
  return ALLOWED_MIME.includes(f.type) || ALLOWED_EXT.includes(ext);
};

const Upload = () => {
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);
  const { user }     = useAuth();

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [step, setStep]             = useState(0);
  const [stepType, setStepType]     = useState(null);
  const [error, setError]           = useState(null);

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    if (!isValidFile(dropped)) {
      setError('Solo se permiten archivos PDF o Word (.pdf, .doc, .docx)');
      return;
    }
    setError(null);
    setFile(dropped);
  };

  const handleFileInput = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!isValidFile(selected)) {
      setError('Solo se permiten archivos PDF o Word (.pdf, .doc, .docx)');
      e.target.value = '';
      return;
    }
    setError(null);
    setFile(selected);
  };

  const handleUpload = async (type) => {
    if (!file || !user) return;
    setError(null);
    setLoading(true);
    setStepType(type);
    setStep(0);

    try {
      // Paso 1: subir el documento
      const documento = await documentoService.uploadDocumento(file, user.id);
      const documentId = documento.documentId;
      setStep(1);

      if (type === 'summary') {
        // Paso 2: generar resumen con Gemini
        const summaryReal = await resumenService.generarResumen(documentId);
        setStep(2);
        await new Promise((r) => setTimeout(r, 700));
        navigate('/actividades/resumen', {
          state: {
            file: { name: file.name, size: file.size },
            documentId,
            summaryReal,
          },
        });
      } else {
        const existingQuiz = await quizService.generarQuiz(documentId);
        setStep(2);
        await new Promise((r) => setTimeout(r, 700));
        navigate('/actividades/trivia', {
          state: {
            file: { name: file.name, size: file.size },
            documentId,
            existingQuiz,
          },
        });
      }
    } catch (err) {
      const msg = err.response?.data || err.message || 'Error al procesar el archivo';
      setError(typeof msg === 'string' ? msg : 'Error al procesar el archivo');
      setLoading(false);
    }
  };

  const steps = stepType ? STEPS[stepType] : [];

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

              {/* Pantalla de carga */}
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
                      animate={{ scale: 1, opacity: 1 }}
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

                /* Pantalla de upload */
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="glass-panel text-white border-0 shadow-lg p-5 text-center"
                    style={{ backgroundColor: 'rgba(11,26,74,0.80)' }}
                  >
                    <h2 className="fw-bold mb-4" style={{ color:'#f8c950' }}>Sube tu Documento</h2>
                    <p className="text-light mb-4 fs-5">
                      Convierte tus lecturas en resúmenes mágicos o juegos de trivia.
                    </p>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="d-flex align-items-center gap-2 p-3 rounded-3 mb-4"
                        style={{ background: 'rgba(239,83,80,0.18)', border: '2px solid rgba(239,83,80,0.5)', color: '#ffcdd2' }}
                      >
                        <BsExclamationTriangle size={20} />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {!file ? (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
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
                          <h4 className="fw-bold">Arrastra tu PDF o Word aquí</h4>
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
                        onClick={() => handleUpload('summary')}
                      >
                        <BsMagic size={24} /> Crear Resumen Mágico
                      </button>
                      <button
                        className="btn-space d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                        style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)' }}
                        onClick={() => handleUpload('trivia')}
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
