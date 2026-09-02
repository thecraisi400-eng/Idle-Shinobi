/* PANTALLA PERFIL — Paso 14
   27.04 cargar con confirmación · 27.06 sobreescritura confirmada
   27.07 historial de 5 respaldos · 27.08 reinicio con doble confirmación
   27.10 fecha y hora del último guardado · 27.03 export/import .md
   30.06 estadísticas completas con gráficos · 30.01 logros · 30.02/03 misiones
   Sugerencias: #1 checksum · #2 recordatorio de exportar · #3 misiones que
   exploran · #4 pistas escalonadas · #5 resumen de sesión */

import { el, toast } from '../core/dom.js';
import { fmt } from '../core/format.js';
import { S } from '../core/state.js';
import { ir } from '../core/router.js';
import * as SAVE from '../systems/save.js';
import * as MD from '../systems/export-md.js';
import * as ACH from '../systems/achievements.js';
import * as Q from '../systems/quests.js';
import { LOGROS, CADENAS } from '../data/logros.js';
import * as PERF from '../systems/perf.js';
import * as TUT from '../systems/tutorial.js';
import * as VOTO from '../systems/encuesta.js';

let vista = 'resumen';   // resumen | logros | misiones | datos
let fotoSesion = null;   // Sugerencia #5

export function inicializarSesion() {
  fotoSesion = SAVE.tomarFoto();
}

export function render(root) {
  const tabs = el('div.perfil-tabs');
  const cuerpo = el('div');

  Q.sincronizar();
  ACH.revisar();

  const pintarTabs = () => {
    const opciones = [
      ['resumen', '📊 Resumen'],
      ['misiones', '📋 Misiones'],
      ['logros', '🏅 Logros'],
      ['datos', '💾 Datos']
    ];
    tabs.replaceChildren(...opciones.map(([id, txt]) =>
      el(`button.chip${vista === id ? '.ok' : ''}`, {
        onclick: () => { vista = id; pintar(); }
      }, txt)));
  };

  /* ================= RESUMEN (30.06) ================= */
  const pintarResumen = () => {
    const c = S.carrera;
    const winrate = c.luchas ? (c.victorias / c.luchas) : 0;
    const res = ACH.resumen();
    const sesion = fotoSesion ? SAVE.resumenSesion(fotoSesion) : null;

    cuerpo.replaceChildren(
      // Sugerencia #5: resumen de sesión
      sesion && sesion.huboProgreso
        ? el('div.card.sesion', {},
            el('b', { text: '⏱️ Tu sesión' }),
            el('p.card-sub', {},
              `En tus últimos ${sesion.minutos} minutos: `,
              el('b', { style:{color:'var(--oro)'}, text: `+${fmt(sesion.oro)} oro` }),
              sesion.niveles > 0 ? `, ${sesion.niveles} nivel(es)` : '',
              sesion.luchas > 0 ? `, ${sesion.luchas} luchas (${sesion.victorias} ganadas)` : '', '.'))
        : null,

      el('div.card.perfil-hd', {},
        el('span.perfil-ico', { text: '🤼' }),
        el('div', {},
          el('b', { text: S.perfil.nombre }),
          el('small', { text: `Nivel ${S.perfil.nivel} · ${S.perfil.clase || 'sin clase'}` })
        ),
        el('div.perfil-logros', {},
          el('b', { text: `${res.hechos}/${res.total}` }),
          el('small', { text: 'logros' })
        )
      ),

      el('div.sec-title', { text: 'Tu carrera' }),
      el('div.stats-grid', {},
        dato('🥊', 'Luchas', fmt(c.luchas)),
        dato('🏆', 'Victorias', fmt(c.victorias)),
        dato('📉', 'Derrotas', fmt(c.derrotas)),
        dato('📊', 'Ratio', `${(winrate * 100).toFixed(1)}%`),
        dato('💥', 'KOs', fmt(c.kos)),
        dato('⚡', 'Críticos', fmt(c.criticos)),
        dato('🌟', 'Especiales', fmt(c.especiales)),
        dato('🔥', 'Mejor racha', fmt(c.mejorRacha)),
        dato('🪙', 'Oro ganado', fmt(c.oroGanado)),
        dato('💎', 'Gemas', fmt(c.gemasGanadas)),
        dato('🏟️', 'Eventos', fmt(c.eventosJugados)),
        dato('👑', 'Torneos', fmt(c.torneosGanados))
      ),

      // 30.06 gráficos simples en canvas
      el('div.sec-title', { text: 'Gráficos' }),
      el('div.card', {},
        el('div.sec-mini', { text: 'Victorias frente a derrotas' }),
        graficoBarras([
          { etiqueta: 'Ganadas', valor: c.victorias, color: '#4ec97a' },
          { etiqueta: 'Perdidas', valor: c.derrotas, color: '#e2564f' }
        ]),
        el('div.sec-mini', { text: 'Actividad de combate' }),
        graficoBarras([
          { etiqueta: 'Golpes', valor: c.golpes, color: '#4d9cf0' },
          { etiqueta: 'Críticos', valor: c.criticos, color: '#e8b64c' },
          { etiqueta: 'Especiales', valor: c.especiales, color: '#a765e8' },
          { etiqueta: 'KOs', valor: c.kos, color: '#f0872f' }
        ]),
        el('div.sec-mini', { text: 'Daño' }),
        graficoBarras([
          { etiqueta: 'Infligido', valor: Math.round(c.danoInfligido), color: '#4ec97a' },
          { etiqueta: 'Recibido', valor: Math.round(c.danoRecibido), color: '#e2564f' }
        ])
      ),

      // Lo que tienes a tiro
      el('div.sec-title', { text: 'Casi lo tienes' }),
      el('div.card', {}, ...ACH.proximos(S, 5).map(({ logro, pct }) => {
        const v = ACH.valores(logro, S);
        return el('div.proximo', {},
          el('span', { text: logro.ico }),
          el('div.prox-info', {},
            el('b', { text: logro.nombre }),
            el('small', { text: logro.desc }),
            barra(pct)
          ),
          v ? el('small.prox-num', { text: `${fmt(v.actual)}/${fmt(v.meta)}` }) : null
        );
      }))
    );
  };

  const dato = (ico, k, v) => el('div.dato-c', {},
    el('span', { text: ico }),
    el('b', { text: v }),
    el('small', { text: k }));

  const barra = (pct) => el('div.barrita', {},
    el('i', { style: { width: `${Math.round(pct * 100)}%` } }));

  /** 30.06 — gráfico de barras en canvas, sin librerías. */
  const graficoBarras = (datos) => {
    const cv = document.createElement('canvas');
    const W = 320, H = 30 + datos.length * 30;
    cv.width = W * 2; cv.height = H * 2;            // nitidez en pantallas densas
    cv.style.width = '100%'; cv.style.height = `${H}px`;
    cv.className = 'gr';
    const x = cv.getContext('2d');
    x.scale(2, 2);

    const max = Math.max(1, ...datos.map(d => d.valor));
    x.font = '11px system-ui, sans-serif';

    datos.forEach((d, i) => {
      const y = 14 + i * 30;
      x.fillStyle = '#9aa0ad';
      x.textAlign = 'left';
      x.fillText(d.etiqueta, 0, y - 1);
      x.textAlign = 'right';
      x.fillStyle = '#f2f3f5';
      x.fillText(fmt(d.valor), W, y - 1);
      // pista
      x.fillStyle = 'rgba(255,255,255,.07)';
      x.fillRect(0, y + 4, W, 8);
      // barra
      x.fillStyle = d.color;
      const ancho = Math.max(2, (d.valor / max) * W);
      x.fillRect(0, y + 4, ancho, 8);
    });
    return cv;
  };

  /* ================= MISIONES ================= */
  const pintarMisiones = () => {
    const cont = Q.contadorPanel();
    cuerpo.replaceChildren(
      el('div.card.mis-hd', {},
        el('div', {},
          el('b', { text: 'Misiones diarias' }),
          el('small', { text: `${cont.hechas} de ${cont.total} cobradas · refrescos: ${Q.refrescosRestantes()}` })
        ),
        Q.hayRecompensas()
          ? el('button.btn.primary.sm', {
              onclick: () => {
                const r = Q.cobrarTodas();
                toast(`+${fmt(r.oro)} oro${r.gemas ? ` y ${r.gemas} gemas` : ''}`, 'ok');
                pintar();
              }
            }, 'Cobrar todo')
          : null
      ),
      ...(S.misiones.diarias || []).map(m => tarjetaMision(m, true)),
      el('div.sec-title', { text: 'Semanales' }),
      ...(S.misiones.semanales || []).map(m => tarjetaMision(m, false))
    );
  };

  const tarjetaMision = (m, esDiaria) => {
    const p = Q.progreso(m);
    return el(`div.mision${m.cobrada ? '.cobrada' : ''}${p.completa && !m.cobrada ? '.lista' : ''}`, {},
      el('span.mis-ico', { text: m.ico }),
      el('div.mis-info', {},
        el('b', { text: m.texto }),
        barra(p.pct),
        el('small', { text: `${fmt(p.hecho)} / ${fmt(p.objetivo)} · 🪙 ${fmt(m.oro)}${m.gemas ? ` · 💎 ${m.gemas}` : ''}` })
      ),
      m.cobrada
        ? el('span.mis-ok', { text: '✓' })
        : p.completa
          ? el('button.btn.primary.sm', {
              onclick: () => { const r = Q.cobrar(m.id); toast(r.ok ? `+${fmt(r.oro)} oro` : r.motivo, r.ok ? 'ok' : 'mal'); pintar(); }
            }, 'Cobrar')
          : el('div.mis-acciones', {},
              // Sugerencia #3: el botón que te lleva a donde se cumple
              el('button.btn.sm', { onclick: () => ir(m.zona) }, 'Ir'),
              esDiaria && Q.refrescosRestantes() > 0
                ? el('button.btn.sm', {
                    onclick: () => { const r = Q.refrescar(m.id); toast(r.ok ? 'Misión cambiada' : r.motivo, r.ok ? 'ok' : 'mal'); pintar(); }
                  }, '🔄')
                : null
            )
    );
  };

  /* ================= LOGROS ================= */
  const pintarLogros = () => {
    const res = ACH.resumen();
    const grupos = ACH.porCadenas();
    const nombreGrupo = c => c === 'hitos' ? 'Hitos y secretos'
      : (CADENAS.find(x => x.id === c)?.nombre || c);

    cuerpo.replaceChildren(
      el('div.card.logros-hd', {},
        el('b', { text: `${res.hechos} de ${res.total} logros` }),
        barra(res.pct),
        el('small', { text: `🪙 ${fmt(res.oroGanado)} y 💎 ${res.gemasGanadas} ganados · ${res.secretosHechos} secretos` })
      ),
      ...grupos.map(g => el('details.grupo-logros', { open: g.cadena === 'hitos' },
        el('summary', {},
          el('b', { text: nombreGrupo(g.cadena) }),
          el('span.g-cont', { text: `${g.hechos}/${g.total}` })
        ),
        ...g.logros.map(l => {
          const v = ACH.vista(l, S);
          const val = ACH.valores(l, S);
          return el(`div.logro${v.hecho ? '.hecho' : ''}${v.oculto ? '.oculto' : ''}`, {},
            el('span.lg-ico', { text: v.ico }),
            el('div.lg-info', {},
              el('b', { text: v.nombre }),
              el('small', { text: v.desc }),
              !v.hecho ? barra(v.pct) : null
            ),
            el('div.lg-premio', {},
              v.hecho
                ? el('span.lg-ok', { text: '✓' })
                : el('small', {}, `🪙${fmt(l.oro)}`, l.gemas ? el('span', { text: ` 💎${l.gemas}` }) : null),
              val && !v.hecho ? el('small.lg-num', { text: `${fmt(val.actual)}/${fmt(val.meta)}` }) : null
            )
          );
        })
      ))
    );
  };

  /* ================= DATOS (Grupo 27) ================= */
  const pintarDatos = () => {
    const info = SAVE.infoGuardado();
    const respaldos = SAVE.listarRespaldos();
    const avisa = SAVE.tocaRecordarExport();

    cuerpo.replaceChildren(
      // Sugerencia #2: recordatorio de exportar
      avisa ? el('div.card.aviso-export', {},
        el('b', { text: '⚠️ Haz una copia de seguridad' }),
        el('p.card-sub', { text: 'Tu progreso vive en este navegador. Si borras los datos de navegación, se pierde. Descarga el .md y guárdalo donde quieras.' })
      ) : null,

      el('div.card', {},
        el('div.sec-mini', { text: '💾 Estado del guardado' }),
        info.existe
          ? el('div', {},
              el('div.dp-fila', {}, el('span', { text: 'Último guardado' }), el('small', { text: SAVE.haceCuanto(info.cuando) }),
                el('b', { text: info.fecha ? info.fecha.toLocaleString('es') : '—' })),
              el('div.dp-fila', {}, el('span', { text: 'Nivel guardado' }), el('small', {}), el('b', { text: String(info.nivel) })),
              el('div.dp-fila', {}, el('span', { text: 'Tamaño' }), el('small', {}), el('b', { text: `${(info.bytes / 1024).toFixed(1)} KB` })),
              el('div.dp-fila', {}, el('span', { text: 'Versión' }), el('small', {}), el('b', { text: `v${info.version}` }))
            )
          : el('p.card-sub', { text: 'Todavía no hay ninguna partida guardada.' }),
        el('button.btn.primary.block', {
          onclick: () => { const r = SAVE.guardar('manual'); toast(r.ok ? 'Partida guardada' : 'No se pudo guardar', r.ok ? 'ok' : 'mal'); pintar(); }
        }, '💾 Guardar ahora')
      ),

      el('div.card', {},
        el('div.sec-mini', { text: '📤 Copia de seguridad' }),
        el('p.card-sub', { text: 'El archivo .md es legible: puedes abrirlo y ver tu progreso escrito. Al final lleva los datos para restaurarlo.' }),
        el('button.btn.block', {
          onclick: () => {
            const r = MD.descargar();
            S.meta.exportado = Date.now();
            SAVE.marcarExportado();
            ACH.revisar();
            toast(`Descargado ${r.nombre}`, 'ok');
            pintar();
          }
        }, '📥 Descargar .md'),
        el('label.btn.block.file-label', {},
          '📂 Importar .md',
          el('input', {
            type: 'file', accept: '.md,text/markdown', style: { display: 'none' },
            onchange: (e) => leerArchivo(e.target.files[0])
          })
        )
      ),

      // 27.07 historial de respaldos
      el('div.card', {},
        el('div.sec-mini', { text: `🕐 Respaldos automáticos (${respaldos.length}/5)` }),
        el('p.card-sub', { text: 'Se crea uno antes de cada operación peligrosa. Nunca se pierde nada.' }),
        respaldos.length === 0
          ? el('p.card-sub', { text: 'Todavía no hay respaldos.' })
          : el('div', {}, ...respaldos.map((b, i) =>
              el('div.respaldo', {},
                el('div', {},
                  el('b', { text: `Nivel ${b.nivel} · 🪙 ${fmt(b.oro)}` }),
                  el('small', { text: `${b.motivo} · ${SAVE.haceCuanto(b.cuando)}` })
                ),
                el('button.btn.sm', {
                  onclick: () => confirmarRestaurar(i, b)
                }, 'Restaurar')
              )))
      ),

      // 29.14 modo bajo rendimiento
      el('div.card', {},
        el('div.sec-mini', { text: '⚙️ Rendimiento' }),
        el('p.card-sub', { text: PERF.describir() }),
        el('div.accesos', {}, ...PERF.MODOS.map(m =>
          el(`button.btn.sm${PERF.leerModo() === m ? '.ok' : ''}`, {
            onclick: () => { PERF.guardarModo(m); toast('Ajuste aplicado', 'ok'); pintar(); }
          }, m === 'auto' ? 'Automático' : m === 'alto' ? 'Calidad' : 'Ahorro')))
      ),

      // Sugerencia #4: modo captura
      el('div.card', {},
        el('div.sec-mini', { text: '📸 Modo captura' }),
        el('p.card-sub', { text: 'Oculta la interfaz y deja tu luchador limpio en el ring, listo para una captura de pantalla.' }),
        el('button.btn.block', { onclick: modoCaptura }, '📸 Preparar captura')
      ),

      // 01.14 repetir la guía
      el('div.card', {},
        el('div.sec-mini', { text: '🎓 Guía de iniciación' }),
        el('p.card-sub', { text: TUT.tutorialHecho() ? 'Ya la completaste. Puedes volver a verla cuando quieras.' : 'Todavía no la has hecho.' }),
        el('button.btn.block', {
          onclick: () => {
            TUT.reiniciarTutorial();
            TUT.iniciarTutorial({ navegar: ir });
          }
        }, 'Repetir la guía')
      ),

      // Sugerencia #5 / 30.15: encuesta de prioridades
      el('div.card', {},
        el('div.sec-mini', { text: '🗳️ ¿Qué quieres que llegue primero?' }),
        el('p.card-sub', { text: 'El plan de la versión 1 está completo. Tu voto ordena lo que viene después.' }),
        ...VOTO.OPCIONES.map(o =>
          el(`div.voto-op${VOTO.votoActual() === o.id ? '.elegida' : ''}`, {
            onclick: () => { VOTO.votar(o.id); toast('Voto registrado, gracias', 'ok'); pintar(); }
          },
            el('span', { text: o.ico }),
            el('div', {}, el('b', { text: o.nombre }), el('small', { text: o.desc })),
            el('span.voto-check', { text: VOTO.votoActual() === o.id ? '✓' : '' })
          ))
      ),

      // 27.08 zona peligrosa
      el('div.card.peligro', {},
        el('div.sec-mini', { text: '⚠️ Zona peligrosa' }),
        el('p.card-sub', { text: 'Borra toda tu partida y empieza de cero. Se hará un respaldo antes, por si acaso.' }),
        el('button.btn.block.rojo', { onclick: confirmarReinicio }, '🗑️ Reiniciar todo el progreso')
      )
    );
  };

  /* ---------- Diálogos ---------- */
  const modal = (contenido) => {
    const ov = el('div.modal-fondo', { onclick: e => { if (e.target === ov) ov.remove(); } },
      el('div.modal', {}, ...contenido(() => ov.remove())));
    document.body.appendChild(ov);
    return ov;
  };

  /** 27.04 / 27.06 — importar pide confirmación antes de pisar nada. */
  const leerArchivo = (file) => {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      const r = MD.parsearMD(String(fr.result));
      if (!r.ok) return modal(cerrar => [
        el('b', { text: '❌ No se pudo importar' }),
        el('p.card-sub', { text: r.motivo }),
        r.checksumEsperado
          ? el('p.card-sub', { text: `Verificación esperada ${r.checksumEsperado}, obtenida ${r.checksumReal}.` })
          : null,
        el('button.btn.block', { onclick: cerrar }, 'Entendido')
      ]);

      modal(cerrar => [
        el('b', { text: '📂 Importar partida' }),
        el('p.card-sub', { text: 'Esto sustituirá tu partida actual. Se guardará un respaldo antes.' }),
        r.aviso ? el('div.modal-error', { text: r.aviso }) : null,
        el('div.import-resumen', {},
          el('div', {}, el('small', { text: 'Luchador' }), el('b', { text: r.resumen.nombre })),
          el('div', {}, el('small', { text: 'Nivel' }), el('b', { text: String(r.resumen.nivel) })),
          el('div', {}, el('small', { text: 'Oro' }), el('b', { text: fmt(r.resumen.oro) }))
        ),
        el('div.modal-botones', {},
          el('button.btn', { onclick: cerrar }, 'Cancelar'),
          el('button.btn.primary', {
            onclick: () => {
              SAVE.crearRespaldo('antes-de-importar');    // 27.07
              aplicarImportado(r.estado);
              cerrar();
            }
          }, 'Sí, importar')
        )
      ]);
    };
    fr.readAsText(file);
  };

  const aplicarImportado = async (estado) => {
    const st = await import('../core/state.js');
    st.reemplazarEstado(estado);
    SAVE.guardar('importacion', st.S);
    toast('Partida importada', 'ok');
    ir('panel');
  };

  const confirmarRestaurar = (i, b) => modal(cerrar => [
    el('b', { text: '🕐 Restaurar respaldo' }),
    el('p.card-sub', { text: `Volverás al estado de ${SAVE.haceCuanto(b.cuando)} (nivel ${b.nivel}). Tu partida actual se respaldará antes.` }),
    el('div.modal-botones', {},
      el('button.btn', { onclick: cerrar }, 'Cancelar'),
      el('button.btn.primary', {
        onclick: () => {
          const r = SAVE.restaurarRespaldo(i);
          toast(r.ok ? 'Respaldo restaurado' : r.motivo, r.ok ? 'ok' : 'mal');
          cerrar();
          if (r.ok) ir('panel');
        }
      }, 'Sí, restaurar')
    )
  ]);

  /** 27.08 — doble confirmación real: dos diálogos encadenados. */
  const confirmarReinicio = () => modal(cerrar1 => [
    el('b', { text: '⚠️ ¿Reiniciar todo?' }),
    el('p.card-sub', { text: 'Perderás tu nivel, tu equipo, tu oro y tus logros. Esto no se puede deshacer desde el juego.' }),
    el('div.modal-botones', {},
      el('button.btn', { onclick: cerrar1 }, 'No, cancelar'),
      el('button.btn.rojo', {
        onclick: () => {
          cerrar1();
          modal(cerrar2 => [
            el('b', { text: '🛑 Confirmación final' }),
            el('p.card-sub', { text: 'Última oportunidad. ¿Seguro que quieres borrar toda tu carrera?' }),
            el('div.modal-botones', {},
              el('button.btn.primary', { onclick: cerrar2 }, 'Mejor no'),
              el('button.btn.rojo', {
                onclick: async () => {
                  const r = SAVE.reiniciar(SAVE.TESTIGO_REINICIO);
                  cerrar2();
                  if (r.ok) {
                    const st = await import('../core/state.js');
                    st.iniciarEstado();
                    toast('Progreso reiniciado', 'info');
                    ir('panel');
                  }
                }
              }, 'Sí, borrar todo')
            )
          ]);
        }
      }, 'Sí, continuar')
    )
  ]);

  /** Sugerencia #4 — esconde el HUD y lleva al panel para la foto. */
  const modoCaptura = () => {
    document.body.classList.add('capturando');
    ir('panel');
    const salir = el('button.btn.primary.block', {
      style: { position: 'fixed', bottom: '18px', left: '50%',
               transform: 'translateX(-50%)', width: 'min(88%,360px)', zIndex: '7000' },
      onclick: () => { document.body.classList.remove('capturando'); salir.remove(); }
    }, 'Salir del modo captura');
    document.body.appendChild(salir);
    toast('Haz tu captura y pulsa salir', 'info');
  };

  const pintar = () => {
    pintarTabs();
    if (vista === 'resumen') pintarResumen();
    else if (vista === 'misiones') pintarMisiones();
    else if (vista === 'logros') pintarLogros();
    else pintarDatos();
  };

  root.append(el('div.sec-title', { text: '👤 Perfil' }), tabs, cuerpo);
  pintar();
}
