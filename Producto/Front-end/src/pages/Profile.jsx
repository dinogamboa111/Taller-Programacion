import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BsPersonBadgeFill, BsCloudUpload, BsFileEarmarkText, BsTrash, BsGearFill } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

const Profile = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', password: '' });

  // Llenar el formulario automáticamente con los datos del usuario actual
  useEffect(() => {
    if (user) {
      setEditForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', password: '' });
    }
  }, [user]);

  const uploadedFiles = [
    { id: 1, name: 'Historia_de_Roma_Cap1.pdf', date: '02/05/2026', type: 'Trivia Generada' },
    { id: 2, name: 'Sistema_Solar_Basico.pdf', date: '28/04/2026', type: 'Resumen Mágico' },
    { id: 3, name: 'Dinosaurios_y_Fosiles.pdf', date: '20/04/2026', type: 'Trivia Generada' }
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put(ENDPOINTS.PERFIL.UPDATE(user.id), editForm);
      alert("¡Perfil actualizado con éxito! (Cierra sesión y vuelve a entrar para ver los cambios)");
      setShowModal(false);
    } catch (err) {
      alert("Error al actualizar el perfil. Intenta de nuevo.");
    }
  };

  return (
    <Container className="pt-5 mt-5 pb-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="glass-panel text-white border-0 shadow-lg p-4" style={{ backgroundColor: 'rgba(11, 26, 74, 0.6)' }}>
              
              <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-warning text-dark rounded-circle p-3 d-flex align-items-center justify-content-center shadow">
                    <BsPersonBadgeFill size={30} />
                  </div>
                  <div>
                    <h2 className="fw-bold mb-0">Panel de {user?.firstName || 'Tutor'}</h2>
                    <p className="text-light mb-0">{user?.email || 'Administrador de Contenido'}</p>
                  </div>
                </div>
                <Button variant="outline-light" onClick={() => setShowModal(true)} className="rounded-pill d-flex align-items-center gap-2">
                  <BsGearFill /> Configuración
                </Button>
              </div>

              <Row className="g-4 mb-4">
                <Col md={6}>
                  <Card className="glass-panel h-100 p-3 border-0" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <h5 className="text-warning fw-bold mb-3">Estudiante Asignado</h5>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(45deg, #11998e, #38ef7d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        🦖
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">Piloto Kidyra</h5>
                        <small className="text-light">Nivel 15 • Explorador Jurásico</small>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="glass-panel h-100 p-3 border-0 d-flex flex-column justify-content-center align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-center text-light mb-2">Añade nuevo material de estudio para generar juegos y resúmenes.</p>
                    <Link to="/actividades" className="btn btn-warning fw-bold rounded-pill d-flex align-items-center gap-2 w-100 justify-content-center">
                      <BsCloudUpload size={20} /> Cargar Nuevo Contenido
                    </Link>
                  </Card>
                </Col>
              </Row>

              <h4 className="fw-bold mb-3 text-info">Material de Estudio Administrado</h4>
              <ListGroup variant="flush" className="rounded-3 overflow-hidden">
                {uploadedFiles.map(file => (
                  <ListGroup.Item 
                    key={file.id} 
                    className="d-flex justify-content-between align-items-center p-3 text-white"
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <BsFileEarmarkText size={24} className="text-light" />
                      <div>
                        <h6 className="mb-0 fw-bold">{file.name}</h6>
                        <small className="text-white-50">{file.date} • {file.type}</small>
                      </div>
                    </div>
                    <Button variant="outline-danger" size="sm" className="rounded-circle p-2 d-flex align-items-center justify-content-center" title="Eliminar material">
                      <BsTrash />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>

            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* MODAL DE EDICIÓN DE PERFIL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>Editar Perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form onSubmit={handleUpdateProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="bg-secondary text-white border-0 shadow-none" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control type="text" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="bg-secondary text-white border-0 shadow-none" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="bg-secondary text-white border-0 shadow-none" />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Nueva Contraseña (Opcional)</Form.Label>
              <Form.Control type="password" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} placeholder="Escribe solo si deseas cambiarla" className="bg-secondary text-white border-0 shadow-none" />
            </Form.Group>
            <Button type="submit" variant="warning" className="w-100 fw-bold rounded-pill">Guardar Cambios</Button>
          </Form>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default Profile;