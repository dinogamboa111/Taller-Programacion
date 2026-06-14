import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { BsPersonCircle, BsRocket, BsBoxArrowRight, BsHouseFill } from 'react-icons/bs';
import { GiDinosaurRex } from 'react-icons/gi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const Header = () => {
  const { activeTheme, toggleTheme, setActiveTheme } = useTheme();
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = isLoggedIn 
    ? [
        { label: 'Home',       path: '/' },
        { label: 'Actividades', path: '/actividades' },
        { label: 'Biblioteca',  path: '/biblioteca' },
        { label: 'Juegos',      path: '/juegos' }
      ]
    : [
        { label: 'Home', path: '/' },
        { label: 'Acerca de nosotros', path: '/acerca' },
        { label: 'Funcionalidades', path: '/funcionalidades' }
      ];

  return (
    <Navbar expand="lg" variant="dark" className="glass-nav py-3" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center gap-3">
          <img
            src={logoImg}
            alt="Kidyra Logo"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '1.5rem', letterSpacing: '1px' }}>Kidyra</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          <Nav className="mx-auto" style={{ gap: '20px' }}>
            {navItems.map(item => (
              <Nav.Link
                as={NavLink}
                to={item.path}
                key={item.label}
                style={({ isActive }) => ({
                  fontWeight: 700,
                  color: isActive ? 'var(--accent-yellow)' : 'var(--text-light)',
                  borderBottom: isActive ? '3px solid var(--accent-yellow)' : '3px solid transparent',
                  paddingBottom: '5px'
                })}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
        <div className="d-none d-lg-flex align-items-center gap-4">
          
          <div className="d-flex align-items-center gap-2">
            {activeTheme !== 'default' && (
              <Button
                variant="outline-light"
                className="rounded-pill d-flex align-items-center gap-2"
                style={{ padding: '8px 15px', fontSize: '0.9rem', borderWidth: '2px' }}
                onClick={() => setActiveTheme('default')}
                title="Volver a la vista inicial mixta"
              >
                <BsHouseFill size={18} /> Restaurar
              </Button>
            )}
            
            {activeTheme !== 'space' && (
              <button 
                onClick={() => setActiveTheme('space')}
                className="btn-space d-flex align-items-center gap-2"
                style={{ padding: '8px 20px', fontSize: '1rem' }}
              >
                <BsRocket size={20} /> Ir al Espacio
              </button>
            )}

            {activeTheme !== 'safari' && (
              <button 
                onClick={() => setActiveTheme('safari')}
                className="btn-dino d-flex align-items-center gap-2"
                style={{ padding: '8px 20px', fontSize: '1rem' }}
              >
                <GiDinosaurRex size={20} /> Ir a Dinosaurios
              </button>
            )}
          </div>
          
          {isLoggedIn ? (
            <>
              <Link to="/perfil" className="d-flex align-items-center gap-2 text-white fw-bold" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                <BsPersonCircle size={28} /> <span className="d-none d-xl-block">Perfil</span>
              </Link>
              <Button variant="outline-light" onClick={handleLogout} className="rounded-pill d-flex align-items-center gap-2" size="sm">
                <BsBoxArrowRight /> Salir
              </Button>
            </>
          ) : (
            <Link to="/login" className="btn btn-warning fw-bold rounded-pill px-4">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
