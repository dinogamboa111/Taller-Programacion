import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsTrashFill, BsMagic, BsController, BsArrowClockwise,
  BsExclamationTriangleFill,
} from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { documentoService } from '../services/documentoService';
import { resumenService } from '../services/resumenService';
import { quizService } from '../services/quizService';

/* ── Paleta de tarjetas (cicla por indice) ───────────────────── */
const CARD_BG = 'rgba(11,26,74,0.80)';

const PALETTES = [
  { bg:CARD_BG, accent:'#10B981', grad:'linear-gradient(135deg,#10B981,#34D399)' },
  { bg:CARD_BG, accent:'#8B5CF6', grad:'linear-gradient(135deg,#8B5CF6,#A78BFA)' },
];

const FILTERS = [
  { id:'all',     label:'Todos',       emoji:'🌿' },
  { id:'summary', label:'Con resumen', emoji:'⭐' },
  { id:'quiz',    label:'Con trivia',  emoji:'🎮' },
];

const TIPS = [
  { emoji:'💡', text:'Motiva a tu nino a explorar, leer y jugar. Cada paso es un logro!' },
  { emoji:'📖', text:'Leer 10 minutos al dia mejora la comprension. Prueben el resumen juntos!' },
  { emoji:'🎮', text:'Los juegos de trivia fortalecen la memoria. Quien gana mas preguntas hoy?' },
  { emoji:'🌟', text:'Celebra cada documento completado! El aprendizaje es una aventura sin fin.' },
  { emoji:'🧠', text:'Revisar el resumen antes de dormir ayuda a recordar mejor el contenido.' },
];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' }) : '';

/* ══════════════════════════════════════════════════════════════
   Sub-componentes
══════════════════════════════════════════════════════════════ */

const ProgressBar = ({ hasSummary, hasQuiz, palette }) => {
  const pct = (hasSummary ? 50 : 0) + (hasQuiz ? 50 : 0);
  const barColor = pct === 100
    ? 'linear-gradient(90deg,#10B981,#34D399)'
    : pct === 50
    ? 'linear-gradient(90deg,#8B5CF6,#A78BFA)'
    : 'rgba(0,0,0,0.1)';

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:'0.65rem', fontWeight:800, color:palette.accent,
          textTransform:'uppercase', letterSpacing:0.6 }}>
          Mision
        </span>
        <span style={{ fontSize:'0.65rem', fontWeight:900, color:palette.accent }}>{pct}%</span>
      </div>
      <div style={{ height:7, borderRadius:99, background:'rgba(255,255,255,0.10)', overflow:'hidden' }}>
        <motion.div
          initial={{ width:0 }}
          animate={{ width:`${pct}%` }}
          transition={{ duration:0.9, ease:'easeOut', delay:0.15 }}
          style={{ height:'100%', borderRadius:99, background:barColor }}
        />
      </div>
    </div>
  );
};

const StatusChip = ({ done, labelDone, labelPending, emojDone, emojPending, accentDone }) => (
  <div style={{
    flex:1, padding:'6px 4px', borderRadius:9, textAlign:'center',
    background: done ? `${accentDone}22` : 'rgba(255,255,255,0.05)',
    border:`1.5px solid ${done ? `${accentDone}55` : 'rgba(255,255,255,0.12)'}`,
    transition:'all 0.3s',
  }}>
    <div style={{ fontSize:'0.95rem', lineHeight:1 }}>{done ? emojDone : emojPending}</div>
    <div style={{
      fontSize:'0.6rem', fontWeight:800, marginTop:2, letterSpacing:0.3,
      textTransform:'uppercase',
      color: done ? accentDone : 'rgba(255,255,255,0.28)',
    }}>
      {done ? labelDone : labelPending}
    </div>
  </div>
);

/* ── Tarjeta de documento ────────────────────────────────────── */
const DocCard = ({ doc, paletteIndex, status, busy, onResumen, onTrivia, onDelete, cardError }) => {
  const palette    = PALETTES[paletteIndex % PALETTES.length];
  const typeName   = doc.fileType?.typeName?.toUpperCase() || 'DOC';
  const hasQuiz    = status?.hasQuiz    ?? false;
  const hasSummary = status?.hasSummary ?? false;
  const isBusyRes  = busy?.id === doc.documentId && busy?.action === 'resumen';
  const isBusyTriv = busy?.id === doc.documentId && busy?.action === 'trivia';
  const anyBusy    = isBusyRes || isBusyTriv;

  // ✅ Botón principal siempre apunta a resumen con estilo amarillo
  const primary = hasSummary
    ? { label:'Ver Resumen',       icon:<BsMagic size={13}/>,      fn:onResumen, loading:isBusyRes,  loadLabel:'Cargando...', style:{ background:'linear-gradient(45deg,#f8c950,#ffd666)', color:'#1a1a2e' } }
    : { label:'Crear Resumen Mágico', icon:<BsMagic size={13}/>,   fn:onResumen, loading:isBusyRes,  loadLabel:'Generando...', style:{ background:'linear-gradient(45deg,#f8c950,#ffd666)', color:'#1a1a2e' } };

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:18, scale:0.94 }}
      animate={{ opacity:1, y:0,  scale:1   }}
      exit={{ opacity:0, scale:0.9 }}
      whileHover={{ y:-4 }}
      transition={{ type:'spring', stiffness:260, damping:22 }}
      style={{
        background: palette.bg,
        backdropFilter:'blur(10px)',
        WebkitBackdropFilter:'blur(10px)',
        borderRadius:18,
        border:'1px solid rgba(255,255,255,0.18)',
        padding:'0.8rem 0.85rem 0.75rem',
        boxShadow:`0 4px 20px rgba(0,0,0,0.28), 0 1px 4px ${palette.accent}18`,
        display:'flex', flexDirection:'column', gap:'0.45rem',
        position:'relative', overflow:'hidden', height:'100%',
      }}
    >
      {/* Fondo decorativo */}
      <div style={{
        position:'absolute', bottom:-20, right:-20, width:70, height:70,
        borderRadius:'50%', background:`${palette.accent}06`, pointerEvents:'none',
      }}/>

      {/* Numero + tipo */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{
          width:24, height:24, borderRadius:'50%',
          background: palette.grad,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'0.6rem', fontWeight:900, color:'#fff',
          boxShadow:`0 2px 7px ${palette.accent}55`,
        }}>
          {String(paletteIndex + 1).padStart(2, '0')}
        </div>
        <span style={{
          background: palette.grad, borderRadius:20,
          padding:'2px 8px', fontSize:'0.6rem', fontWeight:900,
          color:'#fff', letterSpacing:0.5,
          boxShadow:`0 2px 6px ${palette.accent}44`,
        }}>{typeName}</span>
      </div>

      {/* Titulo */}
      <p style={{
        fontWeight:800, fontSize:'0.85rem', lineHeight:1.25,
        color:'#eef2ff', margin:0, textAlign:'center',
        overflow:'hidden', textOverflow:'ellipsis',
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
      }} title={doc.fileName}>
        {doc.fileName}
      </p>

      {/* Emoticons de estado */}
      <div style={{ display:'flex', gap:5 }}>
        <StatusChip done={hasSummary} labelDone="Resumen" labelPending="Resumen"
          emojDone="⭐" emojPending="📋" accentDone="#8B5CF6" />
        <StatusChip done={hasQuiz} labelDone="Trivia" labelPending="Trivia"
          emojDone="🎮" emojPending="🎯" accentDone="#10B981" />
      </div>

      {/* Barra de mision */}
      <ProgressBar hasSummary={hasSummary} hasQuiz={hasQuiz} palette={palette} />

      {/* Boton principal prominente */}
      <button
        onClick={() => primary.fn(doc)}
        disabled={anyBusy}
        style={{
          width:'100%', minHeight:44, borderRadius:11, border:'none',
          background: anyBusy && !primary.loading ? 'rgba(0,0,0,0.06)' : (primary.style?.background || palette.grad),
          color: anyBusy && !primary.loading ? 'rgba(0,0,0,0.28)' : (primary.style?.color || '#fff'),
          fontWeight:900, fontSize:'0.95rem', letterSpacing:0.2,
          cursor: anyBusy ? 'wait' : 'pointer',
          boxShadow: anyBusy && !primary.loading ? 'none' : `0 5px 18px rgba(248,180,0,0.4)`,
          display:'flex', alignItems:'center', justifyContent:'center', gap:7,
          transition:'all 0.2s', marginTop:2,
        }}
      >
        {primary.loading
          ? <>
              <motion.span animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:'linear' }}
                style={{ display:'flex' }}>
                <BsArrowClockwise size={14}/>
              </motion.span>
              {primary.loadLabel}
            </>
          : <>{primary.icon} {primary.label}</>
        }
      </button>

      {/* Mensaje de error de IA */}
      {cardError && (
        <p style={{ fontSize:'0.7rem', color:'#f87171', textAlign:'center', margin:0, marginTop:2 }}>
          ¡Ups! La IA está saturada, intenta de nuevo 🤖
        </p>
      )}

      {/* Botón de trivia siempre visible */}
      <div style={{ display:'flex', gap:5 }}>
        <button
          onClick={() => onTrivia(doc)}
          disabled={anyBusy}
          title={hasQuiz ? 'Jugar Trivia' : 'Crear Trivia'}
          style={{
            flex:1, minHeight:34, borderRadius:7, border:'none',
            background: hasQuiz
              ? 'linear-gradient(45deg,#11998e,#38ef7d)'
              : 'rgba(17,153,142,0.15)',
            border: hasQuiz ? 'none' : '1.5px solid rgba(17,153,142,0.45)',
            color: hasQuiz ? '#fff' : '#38ef7d',
            fontWeight:700, fontSize:'0.72rem',
            cursor: anyBusy ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:4,
            transition:'all 0.2s',
          }}>
          <BsController size={11}/>{hasQuiz ? 'Jugar Trivia' : 'Crear Trivia'}
        </button>

        <button onClick={() => onDelete(doc)} disabled={anyBusy} title="Eliminar"
          style={{
            width:30, height:30, borderRadius:7, flexShrink:0,
            background:'rgba(239,68,68,0.12)', border:'1.5px solid rgba(239,68,68,0.30)',
            color:'rgba(239,83,80,0.65)',
            cursor: anyBusy ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s',
          }}>
          <BsTrashFill size={11}/>
        </button>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Modal de eliminacion
══════════════════════════════════════════════════════════════ */
const DeleteModal = ({ doc, onClose, onDeleted }) => {
  const [sel, setSel]         = useState({ resumen:false, trivia:false, documento:false });
  const [processing, setProc] = useState(false);

  const toggle = (key) => { if (processing) return; setSel((p) => ({ ...p, [key]:!p[key] })); };
  const nada   = !sel.resumen && !sel.trivia && !sel.documento;

  const ejecutar = async () => {
    setProc(true);
    const docId = doc.documentId;
    try {
      if (sel.documento) {
        try { await resumenService.eliminarResumen(docId); } catch {}
        try {
          const quizzes = await quizService.getQuizzesPorDocumento(docId);
          for (const q of quizzes) { try { await quizService.eliminarQuiz(q.quizId); } catch {} }
        } catch {}
        await documentoService.deleteDocumento(docId);
        onDeleted(docId);
      } else {
        if (sel.resumen) { try { await resumenService.eliminarResumen(docId); } catch {} }
        if (sel.trivia) {
          try {
            const quizzes = await quizService.getQuizzesPorDocumento(docId);
            for (const q of quizzes) { try { await quizService.eliminarQuiz(q.quizId); } catch {} }
          } catch {}
        }
      }
    } catch {}
    setProc(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={processing ? undefined : onClose}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(0,0,0,0.72)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
      }}
    >
      <motion.div
        initial={{ scale:0.88, opacity:0 }} animate={{ scale:1, opacity:1 }}
        exit={{ scale:0.88, opacity:0 }}
        transition={{ type:'spring', stiffness:260, damping:22 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background:'rgba(8,18,60,0.97)', border:'2px solid rgba(239,83,80,0.45)',
          borderRadius:22, padding:'2rem 2.2rem', maxWidth:440, width:'100%',
          boxShadow:'0 24px 60px rgba(0,0,0,0.6)', color:'#fff',
        }}
      >
        <div className="d-flex align-items-center gap-3 mb-1">
          <BsExclamationTriangleFill size={28} color="#f8c950"/>
          <h5 className="fw-bold mb-0" style={{ fontSize:'1.15rem' }}>Que deseas eliminar?</h5>
        </div>
        <p style={{ fontSize:'0.88rem', color:'rgba(255,255,255,0.5)', marginBottom:'1.5rem', paddingLeft:44 }}>
          {doc.fileName}
        </p>

        <div className="d-flex flex-column gap-2 mb-3">
          {[{ key:'resumen', label:'Resumen generado', icon:'📄' }, { key:'trivia', label:'Trivia y sus preguntas', icon:'🎮' }].map(({ key, label, icon }) => {
            const checked  = sel[key] || sel.documento;
            const disabled = sel.documento || processing;
            return (
              <label key={key} onClick={() => !disabled && toggle(key)} style={{
                display:'flex', alignItems:'center', gap:14,
                background:   checked ? 'rgba(239,83,80,0.14)' : 'rgba(255,255,255,0.05)',
                border:       `2px solid ${checked ? 'rgba(239,83,80,0.55)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius:12, padding:'0.75rem 1rem',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled && !sel.documento ? 0.5 : 1,
                transition:'all 0.2s', userSelect:'none',
              }}>
                <div style={{
                  width:22, height:22, borderRadius:6, flexShrink:0,
                  border:`2px solid ${checked ? '#ef5350' : 'rgba(255,255,255,0.3)'}`,
                  background: checked ? '#ef5350' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                }}>
                  {checked && <span style={{ color:'#fff', fontSize:13, fontWeight:900, lineHeight:1 }}>✓</span>}
                </div>
                <span style={{ fontSize:'0.9rem' }}>{icon} {label}</span>
              </label>
            );
          })}
        </div>

        <div style={{ height:1, background:'rgba(255,255,255,0.1)', margin:'0.75rem 0 1rem' }}/>

        <label onClick={() => !processing && toggle('documento')} style={{
          display:'flex', alignItems:'flex-start', gap:14,
          background:   sel.documento ? 'rgba(239,83,80,0.2)' : 'rgba(255,255,255,0.04)',
          border:       `2px solid ${sel.documento ? '#ef5350' : 'rgba(255,255,255,0.15)'}`,
          borderRadius:12, padding:'0.85rem 1rem',
          cursor: processing ? 'not-allowed' : 'pointer',
          transition:'all 0.2s', userSelect:'none', marginBottom:'1.4rem',
        }}>
          <div style={{
            width:22, height:22, borderRadius:6, flexShrink:0, marginTop:2,
            border:`2px solid ${sel.documento ? '#ef5350' : 'rgba(255,255,255,0.3)'}`,
            background: sel.documento ? '#ef5350' : 'transparent',
            display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
          }}>
            {sel.documento && <span style={{ color:'#fff', fontSize:13, fontWeight:900, lineHeight:1 }}>✓</span>}
          </div>
          <div>
            <p className="fw-bold mb-1" style={{ fontSize:'0.9rem', color:sel.documento ? '#ff8a80' : '#fff' }}>
              🗂️ Eliminar documento completo
            </p>
            <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.45)', margin:0, lineHeight:1.4 }}>
              Tambien eliminara el resumen y la trivia asociados.
            </p>
          </div>
        </label>

        <div className="d-flex gap-3">
          <button onClick={onClose} disabled={processing} style={{
            flex:1, minHeight:46, borderRadius:12,
            background:'rgba(255,255,255,0.07)', border:'2px solid rgba(255,255,255,0.18)',
            color:'rgba(255,255,255,0.75)', fontWeight:700, fontSize:'0.95rem',
            cursor: processing ? 'not-allowed' : 'pointer',
          }}>Cancelar</button>
          <button onClick={ejecutar} disabled={nada || processing} style={{
            flex:1, minHeight:46, borderRadius:12,
            background: nada || processing ? 'rgba(239,83,80,0.15)' : 'rgba(239,83,80,0.85)',
            border:'2px solid rgba(239,83,80,0.6)',
            color: nada ? 'rgba(239,83,80,0.4)' : '#fff',
            fontWeight:800, fontSize:'0.95rem',
            cursor: nada || processing ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s',
          }}>
            {processing
              ? <><motion.span animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:'linear' }} style={{ display:'flex' }}><BsArrowClockwise size={18}/></motion.span> Eliminando</>
              : <><BsTrashFill size={16}/> Eliminar</>
            }
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Pagina Biblioteca
══════════════════════════════════════════════════════════════ */
const Biblioteca = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [docs,      setDocs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [modal,     setModal]     = useState(null);
  const [busy,      setBusy]      = useState(null);
  const [docStatus, setDocStatus] = useState({});
  const [filter,    setFilter]    = useState('all');
  const [tipVisible, setTipVisible] = useState(true);
  const [tipIndex]   = useState(() => Math.floor(Math.random() * TIPS.length));
  const [cardError, setCardError] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentoService.getDocumentosByUsuario(user.id);
      const list = Array.isArray(data) ? data : [];
      setDocs(list);
      const status = {};
      list.forEach((doc) => {
        status[doc.documentId] = {
          hasQuiz:    doc.hasQuiz    ?? false,
          hasSummary: doc.hasSummary ?? false,
        };
      });
      setDocStatus(status);
    } catch {
      setError('No se pudo cargar tu biblioteca. Verifica tu conexion.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (user) fetchDocs(); }, [fetchDocs, user]);

  const handleResumen = async (doc) => {
    setBusy({ id:doc.documentId, action:'resumen' });
    setCardError(null);
    try {
      let summaryReal;
      if (docStatus[doc.documentId]?.hasSummary) {
        summaryReal = await resumenService.getResumenPorDocumento(doc.documentId);
      } else {
        summaryReal = await resumenService.generarResumen(doc.documentId);
        setDocStatus((prev) => ({ ...prev, [doc.documentId]: { ...prev[doc.documentId], hasSummary:true } }));
      }
      navigate('/actividades/resumen', {
        state: { file: { name:doc.fileName }, documentId:doc.documentId, summaryReal, fromBiblioteca:true },
      });
    } catch { setBusy(null); setCardError(doc.documentId); }
  };

  const handleTrivia = async (doc) => {
    setBusy({ id:doc.documentId, action:'trivia' });
    setCardError(null);
    try {
      let existingQuiz;
      if (docStatus[doc.documentId]?.hasQuiz) {
        const quizzes = await quizService.getQuizzesPorDocumento(doc.documentId);
        existingQuiz  = quizzes[quizzes.length - 1];
      } else {
        existingQuiz = await quizService.generarQuiz(doc.documentId);
        setDocStatus((prev) => ({ ...prev, [doc.documentId]: { ...prev[doc.documentId], hasQuiz:true } }));
      }
      navigate('/actividades/trivia', {
        state: { file: { name:doc.fileName }, documentId:doc.documentId, existingQuiz, fromBiblioteca:true },
      });
    } catch { setBusy(null); setCardError(doc.documentId); }
  };

  const handleDeleted = (docId) => setDocs((prev) => prev.filter((d) => d.documentId !== docId));

  const filtered = docs.filter((doc) => {
    const s = docStatus[doc.documentId];
    if (filter === 'summary') return s?.hasSummary;
    if (filter === 'quiz')    return s?.hasQuiz;
    return true;
  });

  const counts = {
    all:     docs.length,
    summary: docs.filter((d) =>  docStatus[d.documentId]?.hasSummary).length,
    quiz:    docs.filter((d) =>  docStatus[d.documentId]?.hasQuiz).length,
  };

  if (loading) return (
    <Container className="pt-5 mt-5 text-center text-white">
      <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1.1, ease:'linear' }}
        style={{ fontSize:'3.5rem', display:'inline-block', marginBottom:'1rem' }}>📚</motion.div>
      <h4 className="fw-bold">Cargando tu biblioteca</h4>
    </Container>
  );

  if (error) return (
    <Container className="pt-5 mt-5 text-center text-white">
      <p style={{ fontSize:'3rem' }}>⚠️</p>
      <h4 className="fw-bold mb-3">{error}</h4>
      <button onClick={fetchDocs} style={{
        background:'linear-gradient(135deg,#10B981,#34D399)', color:'#fff',
        border:'none', borderRadius:14, padding:'12px 28px', fontWeight:900,
        fontSize:'1rem', cursor:'pointer',
      }}>
        <BsArrowClockwise/> Reintentar
      </button>
    </Container>
  );

  if (docs.length === 0) return (
    <Container className="pt-5 mt-5 text-center text-white">
      <motion.div animate={{ y:[0,-14,0] }} transition={{ repeat:Infinity, duration:2.5 }}
        style={{ fontSize:'6rem', marginBottom:'1rem' }}>📭</motion.div>
      <h3 className="fw-bold mb-2">Tu biblioteca esta vacia!</h3>
      <p style={{ opacity:0.75, fontSize:'1.05rem', marginBottom:'1.5rem' }}>
        Sube tu primer documento y comienza tu primera mision 🚀
      </p>
      <button onClick={() => navigate('/actividades')} style={{
        background:'linear-gradient(135deg,#8B5CF6,#A78BFA)', color:'#fff',
        border:'none', borderRadius:50, padding:'14px 32px',
        fontWeight:900, fontSize:'1rem', cursor:'pointer',
        boxShadow:'0 6px 20px rgba(139,92,246,0.5)',
      }}>
        📤 Comenzar aventura!
      </button>
    </Container>
  );

  return (
    <>
      <Container className="pt-5 mt-5" style={{ paddingBottom:'5rem' }}>

        {/* HEADER */}
        <motion.div
          initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          style={{
            marginBottom:'1.5rem',
            background:'rgba(11,26,74,0.80)',
            backdropFilter:'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            borderRadius:20,
            border:'1px solid rgba(255,255,255,0.15)',
            padding:'1.1rem 1.4rem 1rem',
            boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
          }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
            <div>
              <h2 className="fw-bold mb-1" style={{ fontSize:'clamp(1.4rem,4vw,2rem)', color:'#f8c950' }}>
                📚 Mi Biblioteca
              </h2>
              <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.95rem', margin:0 }}>
                Selecciona un documento para aprender con tu tutor!
              </p>
            </div>
            <button
              onClick={() => navigate('/actividades')}
              style={{
                background:'linear-gradient(135deg,#10B981,#34D399)',
                border:'none', borderRadius:50, padding:'11px 24px',
                fontWeight:900, fontSize:'0.92rem', color:'#fff',
                boxShadow:'0 5px 18px rgba(16,185,129,0.45)', cursor:'pointer',
                display:'flex', alignItems:'center', gap:8,
              }}
            >
              ✨ Subir nuevo
            </button>
          </div>

          {/* FILTROS */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  style={{
                    background: active ? '#fff' : 'rgba(255,255,255,0.10)',
                    border: `2px solid ${active ? '#fff' : 'rgba(255,255,255,0.25)'}`,
                    borderRadius:50, padding:'7px 16px',
                    fontWeight: active ? 800 : 600, fontSize:'0.83rem',
                    color: active ? '#1a1a2e' : 'rgba(255,255,255,0.88)',
                    cursor:'pointer', transition:'all 0.2s',
                    display:'flex', alignItems:'center', gap:6,
                    boxShadow: active ? '0 3px 12px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  {f.emoji} {f.label}
                  <span style={{
                    background: active ? '#1a1a2e' : 'rgba(255,255,255,0.22)',
                    color:'#fff',
                    borderRadius:99, padding:'1px 7px',
                    fontSize:'0.72rem', fontWeight:800,
                  }}>{counts[f.id]}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ textAlign:'center', paddingTop:'4rem', color:'rgba(255,255,255,0.7)' }}>
            <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🔍</div>
            <h4 className="fw-bold text-white">Sin resultados</h4>
            <p style={{ marginBottom:'1.5rem' }}>No hay documentos con ese filtro.</p>
            <button onClick={() => setFilter('all')} style={{
              background:'rgba(255,255,255,0.14)', border:'2px solid rgba(255,255,255,0.3)',
              borderRadius:14, padding:'10px 24px', color:'#fff', fontWeight:700,
              cursor:'pointer', backdropFilter:'blur(8px)',
            }}>Ver todos</button>
          </motion.div>
        ) : (
          <Row className="g-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((doc) => {
                const originalIndex = docs.indexOf(doc);
                return (
                  <Col key={doc.documentId} xs={12} sm={6} md={4} lg={3}>
                    <DocCard
                      doc={doc}
                      paletteIndex={originalIndex}
                      status={docStatus[doc.documentId]}
                      busy={busy}
                      onResumen={handleResumen}
                      onTrivia={handleTrivia}
                      onDelete={setModal}
                      cardError={cardError === doc.documentId}
                    />
                  </Col>
                );
              })}
            </AnimatePresence>
          </Row>
        )}
      </Container>

      {/* TIP BAR FIJA */}
      <AnimatePresence>
        {tipVisible && (
          <motion.div
            initial={{ y:70, opacity:0 }}
            animate={{ y:0,  opacity:1 }}
            exit={{ y:70, opacity:0 }}
            transition={{ type:'spring', stiffness:200, damping:24, delay:0.4 }}
            style={{
              position:'fixed', bottom:0, left:0, right:0, zIndex:50,
              background:'rgba(255,248,200,0.96)',
              backdropFilter:'blur(12px)',
              borderTop:'2px solid rgba(245,158,11,0.35)',
              padding:'9px 16px 9px 20px',
              display:'flex', alignItems:'center', gap:10,
            }}
          >
            <motion.span
              animate={{ rotate:[-12,12,-12] }}
              transition={{ repeat:Infinity, duration:2.8 }}
              style={{ fontSize:'1.15rem', flexShrink:0 }}
            >{TIPS[tipIndex].emoji}</motion.span>
            <span style={{ fontWeight:700, fontSize:'0.84rem', color:'#78350F', flex:1 }}>
              <strong>Tip para tutores:</strong> {TIPS[tipIndex].text}
            </span>
            <button
              onClick={() => setTipVisible(false)}
              style={{
                flexShrink:0, width:26, height:26, borderRadius:'50%',
                background:'rgba(120,53,15,0.12)', border:'1.5px solid rgba(120,53,15,0.2)',
                color:'#92400E', fontWeight:900, fontSize:'0.8rem', lineHeight:1,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s',
              }}
              title="Cerrar"
            >✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINACION */}
      <AnimatePresence>
        {modal && (
          <DeleteModal
            doc={modal}
            onClose={() => setModal(null)}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Biblioteca;