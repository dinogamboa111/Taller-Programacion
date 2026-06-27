import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { BsPersonFill, BsLockFill, BsEnvelopeFill, BsCheckCircleFill } from 'react-icons/bs';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]         = useState('');
  const [msg, setMsg]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError('Tu contraseña no coincide, favor corrige.');
          setLoading(false);
          return;
        }
        await authService.register(firstName, lastName, email, password);
        setMsg('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setIsRegistering(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        const loggedUser = await login(email, password);
        setWelcomeName(loggedUser?.firstName || '');
        setLoading(false);
        setTimeout(() => navigate('/'), 2500);
        return;
      }
    } catch (err) {
      setError(isRegistering ? 'Error al registrar. Verifica los datos o el correo.' : 'Tus credenciales están incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  const showWelcome = !!welcomeName;

  return (
    <Container className="pt-5 mt-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(11,26,74,0.92)', zIndex: 9999, textAlign: 'center',
            }}
          >
            <div>
              <BsCheckCircleFill size={64} style={{ color: '#f8c950', marginBottom: 20 }} />
              <h1 className="fw-bold text-white mb-2">¡Bienvenido, {welcomeName}!</h1>
              <p className="text-light fs-5">Preparando tu mundo Kidyra...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '500px' }}
      >
        <Card className="glass-panel text-white border-0 shadow-lg p-5" style={{ backgroundColor: 'rgba(11,26,74,0.80)' }}>
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2" style={{ color:'#f8c950' }}>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesion'}</h2>
            <p className="text-light">{isRegistering ? 'Únete a Kidyra' : '¡Bienvenido de vuelta a Kidyra!'}</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}
          {msg && <div className="alert alert-success py-2">{msg}</div>}

          <Form onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-2 border border-light border-opacity-25">
                    <BsPersonFill className="text-light me-2" size={20} />
                    <Form.Control type="text" placeholder="Nombre" className="bg-transparent border-0 shadow-none login-input text-white" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} style={{ outline: 'none' }} />
                  </div>
                </Form.Group>
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-2 border border-light border-opacity-25">
                    <BsPersonFill className="text-light me-2" size={20} />
                    <Form.Control type="text" placeholder="Apellido" className="bg-transparent border-0 shadow-none login-input text-white" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} style={{ outline: 'none' }} />
                  </div>
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-4">
              <div className="d-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-2 border border-light border-opacity-25">
                <BsEnvelopeFill className="text-light me-2" size={20} />
                <Form.Control type="email" placeholder="Correo Electrónico" className="bg-transparent border-0 shadow-none login-input text-white" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} style={{ outline: 'none' }} />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="d-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-2 border border-light border-opacity-25">
                <BsLockFill className="text-light me-2" size={20} />
                <Form.Control type="password" placeholder="Contraseña" className="bg-transparent border-0 shadow-none login-input text-white" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} style={{ outline: 'none' }} />
              </div>
            </Form.Group>

            {isRegistering && (
              <Form.Group className="mb-4">
                <div className="d-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-2 border border-light border-opacity-25">
                  <BsLockFill className="text-light me-2" size={20} />
                  <Form.Control type="password" placeholder="Repetir contraseña" className="bg-transparent border-0 shadow-none login-input text-white" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} style={{ outline: 'none' }} />
                </div>
              </Form.Group>
            )}

            <Button type="submit" className="btn-yellow w-100 rounded-pill py-2 mt-3 fw-bold fs-5" disabled={loading}>
              {loading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Entrar a mi Mundo')}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <span className="text-light" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setIsRegistering(!isRegistering); setError(''); setMsg(''); setPassword(''); setConfirmPassword(''); }}>
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </span>
          </div>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Login;