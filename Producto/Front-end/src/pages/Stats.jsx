import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/* ── Constantes del juego ───────────────────────────────────── */
const W        = 900;
const H        = 240;
const BG       = 'rgb(22, 48, 100)';
const GROUND   = 24;
const P_SIZE   = 58;
const O_SIZE   = 52;
const JUMP_V   = 18;
const GRAVITY  = 0.85;
const BASE_SPD = 5;
const SPD_INC  = 0.001;
const MIN_GAP  = 300;

/* ── Config por tema ────────────────────────────────────────── */
const CFG = {
  safari:  { player:'🦖', obst:['🌵','🌴','🪨'], accent:'#f59e0b', grad:'#fcd34d', txtDark:'#78350f' },
  space:   { player:'👨‍🚀', obst:['☄️','🪐','💫'], accent:'#818cf8', grad:'#c4b5fd', txtDark:'#fff'    },
  default: { player:'🐱', obst:['📚','🌿','🍄'], accent:'#34d399', grad:'#6ee7b7', txtDark:'#064e3b' },
};

/* ── Componente ─────────────────────────────────────────────── */
export default function DinoGame() {
  const { activeTheme } = useTheme();
  const cfg = CFG[activeTheme] ?? CFG.default;

  const [status,    setStatus]    = useState('idle');
  const [score,     setScore]     = useState(0);
  const [highScore, setHighScore] = useState(
    () => parseInt(localStorage.getItem('kydira-hs') || '0', 10)
  );

  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const gRef      = useRef({
    playerY: 0, velY: 0,
    speed: BASE_SPD, rawScore: 0,
    obstacles: [], running: false, frame: 0,
  });

  const jump = useCallback(() => {
    const g = gRef.current;
    if (g.running && g.playerY < 2) g.velY = JUMP_V;
  }, []);

  const startGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    Object.assign(gRef.current, {
      playerY: 0, velY: 0,
      speed: BASE_SPD, rawScore: 0,
      obstacles: [], running: true, frame: 0,
    });
    setScore(0);
    setStatus('running');
  }, []);

  /* ── Game loop ─────────────────────────────────────────────── */
  useEffect(() => {
    if (status !== 'running') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx     = canvas.getContext('2d');
    const g       = gRef.current;
    const groundY = H - GROUND;

    const tick = () => {
      if (!g.running) return;
      g.frame++;
      g.speed += SPD_INC;

      /* Física */
      g.velY   -= GRAVITY;
      g.playerY = Math.max(0, g.playerY + g.velY);
      if (g.playerY === 0) g.velY = Math.min(0, g.velY);

      /* Puntaje */
      g.rawScore++;
      if (g.frame % 6 === 0) setScore(Math.floor(g.rawScore / 6));

      /* Spawn obstáculo */
      const last = g.obstacles[g.obstacles.length - 1];
      if (!last || last.x < W - MIN_GAP) {
        g.obstacles.push({
          x: W + 20,
          emoji: cfg.obst[Math.floor(Math.random() * cfg.obst.length)],
        });
      }

      /* Mover y limpiar */
      g.obstacles = g.obstacles.filter(o => { o.x -= g.speed; return o.x > -O_SIZE; });

      /* Colisión */
      const hit = g.obstacles.some(o =>
        o.x + O_SIZE - 8 > 66 &&
        o.x + 8 < 56 + P_SIZE - 10 &&
        g.playerY < O_SIZE - 10
      );

      if (hit) {
        g.running = false;
        const final = Math.floor(g.rawScore / 6);
        setHighScore(prev => {
          const hs = Math.max(prev, final);
          localStorage.setItem('kydira-hs', String(hs));
          return hs;
        });
        setStatus('dead');
        return;
      }

      /* ── Dibujar ──────────────────────────────────────────── */
      /* Fondo degradado — azul medio para contrastar con emojis oscuros */
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgb(18, 52, 120)');
      grad.addColorStop(1, 'rgb(10, 28, 72)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      /* Rayas de suelo en movimiento */
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      const dashOff = (g.frame * g.speed * 0.5) % 48;
      for (let x = -dashOff; x < W; x += 48) ctx.fillRect(x, groundY + 6, 28, 2);

      /* Línea de suelo */
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(0, groundY, W, 2);

      /* Jugador (volteado para mirar hacia la derecha) */
      ctx.save();
      ctx.scale(-1, 1);
      ctx.font = `${P_SIZE}px serif`;
      ctx.textBaseline = 'bottom';
      ctx.shadowColor = cfg.accent + 'cc';
      ctx.shadowBlur  = 20;
      ctx.fillText(cfg.player, -(56 + P_SIZE), groundY - g.playerY + 4);
      ctx.shadowBlur = 0;
      ctx.restore();

      /* Obstáculos con círculo de fondo */
      ctx.font = `${O_SIZE}px serif`;
      g.obstacles.forEach(o => {
        ctx.shadowColor = 'rgba(255,200,80,0.7)';
        ctx.shadowBlur  = 14;
        ctx.fillText(o.emoji, o.x, groundY + 4);
        ctx.shadowBlur = 0;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, cfg]);

  /* Teclado */
  useEffect(() => {
    const onKey = e => {
      if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
      e.preventDefault();
      if (status === 'idle' || status === 'dead') startGame(); else jump();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, startGame, jump]);

  const title = activeTheme === 'safari' ? '🦖 Carrera Jurásica'
              : activeTheme === 'space'  ? '🚀 Carrera Espacial'
              :                            '🎮 Carrera Infinita';

  const isNewRecord = status === 'dead' && score > 0 && score >= highScore;

  return (
    <Container className="pt-5 mt-5 pb-5">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <motion.div
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5 }}
          >
            {/* Header card */}
            <motion.div
              initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
              style={{
                marginBottom:'1.2rem',
                background:'rgba(11,26,74,0.80)',
                backdropFilter:'blur(12px)',
                WebkitBackdropFilter:'blur(12px)',
                borderRadius:20,
                border:'1px solid rgba(255,255,255,0.15)',
                padding:'1rem 1.4rem',
                boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <div className="text-center mb-3">
                <h2 className="fw-bold mb-1" style={{ color:'#f8c950' }}>{title}</h2>
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.88rem', margin:0 }}>
                  Esquiva los obstaculos — salta con Espacio, ↑ o clic
                </p>
              </div>

              {/* Separador */}
              <div style={{ height:1, background:'rgba(255,255,255,0.10)', marginBottom:'0.9rem' }} />

              {/* Record y puntaje */}
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.78rem', fontWeight:700 }}>
                  RECORD&nbsp;<span style={{ color:cfg.accent, fontWeight:900 }}>{highScore}</span>
                </span>
                <span style={{ color:'#fff', fontSize:'1.2rem', fontWeight:900, letterSpacing:4 }}>
                  {String(score).padStart(5, '0')}
                </span>
              </div>
            </motion.div>

            {/* Canvas del juego */}
            <div
              style={{
                position:'relative', borderRadius:18, overflow:'hidden',
                border:`2px solid ${cfg.accent}55`,
                boxShadow:`0 0 40px ${cfg.accent}22, 0 8px 32px rgba(0,0,0,0.6)`,
                cursor:'pointer',
              }}
              onClick={() => { if (status === 'idle' || status === 'dead') startGame(); else jump(); }}
            >
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                style={{ display:'block', width:'100%', height:H }}
              />

              {/* Overlay idle / dead */}
              <AnimatePresence>
                {status !== 'running' && (
                  <motion.div
                    key="overlay"
                    initial={{ opacity:0 }}
                    animate={{ opacity:1 }}
                    exit={{ opacity:0 }}
                    transition={{ duration:0.2 }}
                    style={{
                      position:'absolute', inset:0,
                      display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center',
                      background:'rgba(7,14,50,0.92)',
                    }}
                  >
                    {status === 'dead' && (
                      <>
                        <div style={{ fontSize:'1.9rem', fontWeight:900, color:'#ff6b6b', marginBottom:6 }}>
                          GAME OVER
                        </div>
                        <div style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.9rem', marginBottom:18 }}>
                          Puntaje:&nbsp;<strong style={{ color:'#fff' }}>{score}</strong>
                          {isNewRecord && (
                            <span style={{ color:cfg.accent, marginLeft:10 }}>¡Nuevo record! 🎉</span>
                          )}
                        </div>
                      </>
                    )}

                    {status === 'idle' && (
                      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.9rem', marginBottom:18 }}>
                        Presiona espacio o haz clic para empezar
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale:1.05 }}
                      whileTap={{ scale:0.96 }}
                      onClick={e => { e.stopPropagation(); startGame(); }}
                      style={{
                        background:`linear-gradient(135deg,${cfg.accent},${cfg.grad})`,
                        border:'none', borderRadius:50,
                        padding:'11px 32px',
                        color: cfg.txtDark,
                        fontWeight:900, fontSize:'1rem', cursor:'pointer',
                        boxShadow:`0 4px 20px ${cfg.accent}55`,
                      }}
                    >
                      {status === 'dead' ? '▶ Reintentar' : '▶ Jugar'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-center mt-2" style={{ color:'rgba(255,255,255,0.22)', fontSize:'0.73rem' }}>
              ⌨️ Espacio · ↑ &nbsp;|&nbsp; 📱 Tap para saltar
            </div>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
}
