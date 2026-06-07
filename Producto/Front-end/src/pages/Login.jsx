import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BsPersonFill, BsLockFill } from 'react-icons/bs';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/perfil');
    } catch {
      setError('Credenciales incorrectas. Verifica tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="pt-5 mt-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '500px' }}
      >
        <Card className="glass-panel text-white border-0 shadow-lg p-5" style={{ backgroundColor: 'rgba(11, 26, 74, 0.6)' }}>
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2">Iniciar Sesión</h2>
            <p className="text-light">¡Bienvenido de vuelta a Kidyra!</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <div className="d-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-2 border border-light border-opacity-25">
                <BsPersonFill className="text-light me-2" size={20} />
                <Form.Control
                  type="text"
                  placeholder="Usuario"
                  className="bg-transparent border-0 shadow-none login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ outline: 'none', color: '#fff' }}
                  disabled={loading}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="d-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-2 border border-light border-opacity-25">
                <BsLockFill className="text-light me-2" size={20} />
                <Form.Control
                  type="password"
                  placeholder="Contraseña"
                  className="bg-transparent border-0 shadow-none login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ outline: 'none', color: '#fff' }}
                  disabled={loading}
                />
              </div>
            </Form.Group>

            <Button
              type="submit"
              className="btn-yellow w-100 rounded-pill py-2 mt-3 fw-bold fs-5"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar a mi Mundo'}
            </Button>
          </Form>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Login;
