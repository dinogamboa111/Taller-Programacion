import { useState } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsPersonBadgeFill,
  BsShieldLockFill, BsPersonFill, BsEnvelopeFill, BsXLg,
} from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import api from '../api/apiConfig';
import { ENDPOINTS } from '../api/endpoints';

/* ── Fila de dato de perfil ─────────────────────────────────── */
const DataRow = ({ icon, label, value }) => (
  <div style={{
    display:'flex', alignItems:'center', gap:12,
    background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(255,255,255,0.10)',
    borderRadius:12, padding:'12px 16px',
  }}>
    <span style={{ color:'#f8c950', fontSize:'1.05rem', flexShrink:0 }}>{icon}</span>
    <div>
      <div style={{
        fontSize:'0.68rem', color:'rgba(255,255,255,0.42)',
        textTransform:'uppercase', letterSpacing:0.8, fontWeight:700,
      }}>{label}</div>
      <div style={{ fontWeight:600, fontSize:'0.95rem' }}>{value || '—'}</div>
    </div>
  </div>
);

/* ── Pagina Perfil ──────────────────────────────────────────── */
const Profile = () => {
  const { user } = useAuth();

  const [showPwd, setShowPwd] = useState(false);
  const [pwd,     setPwd]     = useState({ nueva:'', confirmar:'' });
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const openPwd  = () => { setShowPwd(true);  setError(null); setSuccess(false); setPwd({ nueva:'', confirmar:'' }); };
  const closePwd = () => { setShowPwd(false); setError(null); setSuccess(false); setPwd({ nueva:'', confirmar:'' }); };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (pwd.nueva.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }
    if (pwd.nueva !== pwd.confirmar) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await api.put(ENDPOINTS.PERFIL.UPDATE(user.id), { password: pwd.nueva });
      setSuccess(true);
      setPwd({ nueva:'', confirmar:'' });
      setTimeout(closePwd, 2000);
    } catch {
      setError('Error al actualizar la contrasena. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="pt-5 mt-5 pb-5">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <Row className="justify-content-center">
          <Col md={10} lg={7}>
            <Card className="glass-panel text-white border-0 shadow-lg p-4"
              style={{ backgroundColor:'rgba(11,26,74,0.80)' }}>

              {/* Cabecera avatar */}
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary">
                <div className="bg-warning text-dark rounded-circle p-3 d-flex align-items-center justify-content-center shadow">
                  <BsPersonBadgeFill size={30} />
                </div>
                <div>
                  <h2 className="fw-bold mb-0">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="mb-0" style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.9rem' }}>Tutor</p>
                </div>
              </div>

              {/* Datos del perfil */}
              <div className="d-flex flex-column gap-3 mb-4">
                <DataRow
                  icon={<BsPersonFill />}
                  label="Nombre completo"
                  value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                />
                <DataRow
                  icon={<BsEnvelopeFill />}
                  label="Correo electronico"
                  value={user?.email}
                />
              </div>

              {/* Boton cambiar contrasena */}
              <div className="d-flex flex-column flex-md-row gap-3">
                <button
                  onClick={openPwd}
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    background:'rgba(255,255,255,0.10)',
                    border:'1.5px solid rgba(255,255,255,0.22)',
                    borderRadius:50, padding:'10px 22px',
                    color:'#fff', fontWeight:700, fontSize:'0.92rem',
                    cursor:'pointer', transition:'all 0.2s',
                  }}
                >
                  <BsShieldLockFill /> Cambiar Contrasena
                </button>
              </div>

              {/* Expansion inline del formulario */}
              <AnimatePresence initial={false}>
                {showPwd && (
                  <motion.div
                    key="pwd-form"
                    initial={{ opacity:0, height:0, marginTop:0 }}
                    animate={{ opacity:1, height:'auto', marginTop:20 }}
                    exit={{ opacity:0, height:0, marginTop:0 }}
                    transition={{ duration:0.3, ease:'easeInOut' }}
                    style={{ overflow:'hidden' }}
                  >
                    <div style={{
                      background:'rgba(255,255,255,0.04)',
                      border:'1px solid rgba(255,255,255,0.12)',
                      borderRadius:14,
                      padding:'1.25rem 1.2rem 1.1rem',
                    }}>
                      <div className="d-flex align-items-center gap-2 mb-4" style={{
                        color:'rgba(255,255,255,0.4)', fontSize:'0.72rem',
                        fontWeight:700, textTransform:'uppercase', letterSpacing:1,
                      }}>
                        <BsShieldLockFill style={{ color:'#f8c950' }} />
                        Nueva contrasena
                      </div>

                      {success ? (
                        <motion.div
                          initial={{ opacity:0, scale:0.9 }}
                          animate={{ opacity:1, scale:1 }}
                          style={{ textAlign:'center', padding:'1rem 0' }}
                        >
                          <div style={{ fontSize:'3rem', marginBottom:8 }}>✅</div>
                          <p className="fw-bold mb-0">Contrasena actualizada correctamente</p>
                        </motion.div>
                      ) : (
                        <Form onSubmit={handleChangePassword}>
                          {error && (
                            <div style={{
                              background:'rgba(239,83,80,0.18)', border:'1px solid rgba(239,83,80,0.5)',
                              borderRadius:8, padding:'10px 14px', marginBottom:16,
                              color:'#ffcdd2', fontSize:'0.87rem',
                            }}>
                              {error}
                            </div>
                          )}

                          <Form.Group className="mb-3">
                            <Form.Label style={{
                              fontSize:'0.82rem', color:'rgba(255,255,255,0.45)',
                              textTransform:'uppercase', letterSpacing:0.7, fontWeight:700,
                            }}>
                              Nueva contrasena
                            </Form.Label>
                            <Form.Control
                              type="password"
                              value={pwd.nueva}
                              onChange={e => setPwd({ ...pwd, nueva:e.target.value })}
                              placeholder="Minimo 6 caracteres"
                              style={{
                                background:'rgba(255,255,255,0.07)',
                                border:'1px solid rgba(255,255,255,0.15)',
                                borderRadius:10, color:'#fff',
                                padding:'10px 14px',
                              }}
                              className="shadow-none"
                              required
                            />
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label style={{
                              fontSize:'0.82rem', color:'rgba(255,255,255,0.45)',
                              textTransform:'uppercase', letterSpacing:0.7, fontWeight:700,
                            }}>
                              Confirmar contrasena
                            </Form.Label>
                            <Form.Control
                              type="password"
                              value={pwd.confirmar}
                              onChange={e => setPwd({ ...pwd, confirmar:e.target.value })}
                              placeholder="Repite la nueva contrasena"
                              style={{
                                background:'rgba(255,255,255,0.07)',
                                border:'1px solid rgba(255,255,255,0.15)',
                                borderRadius:10, color:'#fff',
                                padding:'10px 14px',
                              }}
                              className="shadow-none"
                              required
                            />
                          </Form.Group>

                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              onClick={closePwd}
                              style={{
                                flex:1, minHeight:44, borderRadius:50,
                                background:'rgba(255,255,255,0.07)',
                                border:'1.5px solid rgba(255,255,255,0.18)',
                                color:'rgba(255,255,255,0.65)', fontWeight:700, fontSize:'0.92rem',
                                padding:'0 22px', cursor:'pointer', transition:'all 0.2s',
                                display:'flex', alignItems:'center', gap:6,
                              }}
                            >
                              <BsXLg size={12} /> Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              style={{
                                flex:1, minHeight:44, borderRadius:50, border:'none',
                                background:'linear-gradient(135deg,#f8c950,#f0a500)',
                                color:'#3a2700', fontWeight:900, fontSize:'0.95rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                boxShadow:'0 4px 16px rgba(248,180,0,0.4)',
                                transition:'all 0.2s',
                              }}
                            >
                              {loading ? 'Guardando...' : 'Guardar Contrasena'}
                            </button>
                          </div>
                        </Form>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </Card>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default Profile;
