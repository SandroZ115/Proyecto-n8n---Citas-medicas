import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminUsuarios, reporteMensual } from '../services/api'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'

const ZONA = 'America/Guatemala'
const LIMITE_BITACORA = 5000

const TIPOS = [
  { valor: 'general', etiqueta: 'General (todo el personal)' },
  { valor: 'doctores', etiqueta: 'Doctores' },
  { valor: 'secretarias', etiqueta: 'Secretarias' },
]

const ETIQUETA_TIPO = {
  general: 'General',
  doctores: 'Doctores',
  secretarias: 'Secretarias',
}

const ROL_POR_TIPO = {
  doctores: 'doctor',
  secretarias: 'secretaria',
}

function partesGuatemala(fecha) {
  const formato = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  const partes = {}
  for (const parte of formato.formatToParts(fecha)) {
    partes[parte.type] = parte.value
  }
  return partes
}

function fechaHoraGT(fecha) {
  const p = partesGuatemala(fecha)
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`
}

function fechaLegibleGT(fecha) {
  return fecha.toLocaleString('es-GT', {
    timeZone: ZONA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function aFecha(valor) {
  if (valor === null || valor === undefined || valor === '') return null

  let texto = String(valor).trim()
  if (!texto) return null

  if (!/[Zz]|[+-]\d{2}:?\d{2}$/.test(texto)) {
    texto = texto.includes('T') ? `${texto}Z` : `${texto}T00:00:00Z`
  }

  const fecha = new Date(texto)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

function mesActual() {
  const p = partesGuatemala(new Date())
  return `${p.year}-${p.month}`
}

function mesPrevio(mes) {
  const [anio, numero] = mes.split('-').map(Number)
  const anterior = new Date(Date.UTC(anio, numero - 2, 1))
  return `${anterior.getUTCFullYear()}-${String(anterior.getUTCMonth() + 1).padStart(2, '0')}`
}

function textoCelda(valor) {
  if (valor === null || valor === undefined) return ''
  if (typeof valor === 'object') return JSON.stringify(valor)
  return String(valor)
}

function celdasCSV(valor) {
  let texto = textoCelda(valor)

  if (typeof valor === 'string' && /^[=+\-@]/.test(texto)) {
    texto = `'${texto}`
  }

  return `"${texto.replace(/"/g, '""')}"`
}

function aCSV(filas) {
  return filas.map((fila) => fila.map(celdasCSV).join(',')).join('\r\n')
}

function descargarCSV(nombre, contenido) {
  const blob = new Blob([`\uFEFF${contenido}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}

function conteos(valor, clavesNombre) {
  if (!valor) return []

  if (Array.isArray(valor)) {
    return valor.map((item) => {
      if (item && typeof item === 'object') {
        const nombre =
          clavesNombre.map((clave) => item[clave]).find((dato) => dato !== undefined && dato !== null) ?? ''
        const total = item.total ?? item.citas ?? item.cantidad ?? item.valor ?? 0
        return [nombre, total]
      }
      return [item, 0]
    })
  }

  return Object.entries(valor).map(([nombre, total]) => [nombre, total])
}

function tablasReporte(datos, tipo) {
  const lista = []

  lista.push({
    id: 'estado',
    titulo: 'Citas por estado',
    columnas: ['Estado', 'Citas'],
    filas: conteos(datos?.por_estado, ['estado', 'clave', 'nombre']),
  })

  lista.push({
    id: 'especialidad',
    titulo: 'Citas por especialidad',
    columnas: ['Especialidad', 'Citas'],
    filas: conteos(datos?.por_especialidad, ['especialidad', 'clave', 'nombre']),
  })

  lista.push({
    id: 'eventos',
    titulo: 'Eventos',
    columnas: ['Evento', 'Total'],
    filas: conteos(datos?.eventos, ['evento', 'accion', 'clave', 'nombre']),
  })

  if (tipo === 'general' || tipo === 'doctores') {
    const porDoctor = Array.isArray(datos?.por_doctor) ? datos.por_doctor : []
    lista.push({
      id: 'doctor',
      titulo: 'Por doctor',
      columnas: ['Doctor', 'Total', 'Completadas', 'Canceladas'],
      filas: porDoctor.map((item) => [
        item?.doctor ?? '',
        item?.total ?? 0,
        item?.completadas ?? 0,
        item?.canceladas ?? 0,
      ]),
    })
  }

  if (tipo === 'general' || tipo === 'secretarias') {
    const porCreador = Array.isArray(datos?.por_creador) ? datos.por_creador : []
    lista.push({
      id: 'creador',
      titulo: 'Por quién se creó',
      columnas: ['Quién', 'Rol', 'Total', 'Canceladas'],
      filas: porCreador.map((item) => [
        item?.creador ?? '',
        item?.rol ?? '',
        item?.total ?? 0,
        item?.canceladas ?? 0,
      ]),
    })
  }

  return lista
}

function textoCita(evento) {
  const cita = evento?.cita ?? evento?.cita_id ?? evento?.id_cita

  if (cita === null || cita === undefined) return ''
  if (typeof cita === 'object') {
    return textoCelda(cita.id ?? cita.nombre_paciente ?? cita)
  }
  return String(cita)
}

export default function Reportes() {
  const navigate = useNavigate()
  const toast = useToast()

  const [mes, setMes] = useState(() => mesPrevio(mesActual()))
  const [tipo, setTipo] = useState('general')
  const [usuarioId, setUsuarioId] = useState('0')
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(false)
  const [reporte, setReporte] = useState(null)

  const intentosRef = useRef(new Set())

  useEffect(() => {
    if (tipo === 'general') return
    if (intentosRef.current.has(tipo)) return
    intentosRef.current.add(tipo)

    let activo = true

    adminUsuarios({ accion: 'listar' }).then(({ status, data }) => {
      if (!activo) return

      if (status === 200) {
        setUsuarios(Array.isArray(data?.usuarios) ? data.usuarios : [])
        return
      }

      setUsuarios([])
      toast.error(data?.error ?? 'No se pudo cargar el listado de usuarios')

      if (status === 401) {
        sessionStorage.clear()
        navigate('/', { replace: true })
        return
      }

      if (status === 403) {
        navigate('/dashboard', { replace: true })
      }
    })

    return () => {
      activo = false
    }
  }, [tipo, navigate, toast])

  const personas = useMemo(() => {
    const rol = ROL_POR_TIPO[tipo]
    if (!rol) return []
    return usuarios.filter((usuario) => usuario?.rol === rol)
  }, [tipo, usuarios])

  const personaSeleccionada = useMemo(() => {
    if (usuarioId === '0') return null
    return personas.find((usuario) => String(usuario?.id) === String(usuarioId)) ?? null
  }, [personas, usuarioId])

  async function generar() {
    setCargando(true)

    const usuario = Number(usuarioId) || 0
    const { status, data } = await reporteMensual({ mes, tipo, usuario_id: usuario })

    setCargando(false)

    if (status === 200) {
      const generado = aFecha(data?.generado_en)

      setReporte({
        datos: data,
        mes,
        tipo,
        usuario,
        correo: personaSeleccionada?.correo ?? '',
        generadoEn: generado ? generado.getTime() : Date.now(),
      })
      return
    }

    if (status === 400) {
      toast.error('Los datos del reporte no son válidos')
      return
    }

    if (status === 401) {
      sessionStorage.clear()
      navigate('/', { replace: true })
      return
    }

    if (status === 403) {
      navigate('/dashboard', { replace: true })
      return
    }

    toast.error(data?.error ?? 'Error del servidor')
  }

  function usarMesActual() {
    setMes(mesActual())
  }

  const datos = reporte?.datos ?? null
  const tipoReporte = datos?.tipo ?? reporte?.tipo ?? 'general'
  const esGeneral = tipoReporte === 'general'

  const tablas = useMemo(() => tablasReporte(datos, tipoReporte), [datos, tipoReporte])

  const generadoEn = useMemo(
    () => (reporte ? new Date(reporte.generadoEn) : null),
    [reporte]
  )

  const titulo = useMemo(() => {
    const etiqueta = ETIQUETA_TIPO[tipoReporte]
    if (!etiqueta) return 'Reporte mensual de MediNova'
    const correo = reporte?.correo ? ` - ${reporte.correo}` : ''
    return `Reporte mensual de MediNova - ${etiqueta}${correo}`
  }, [tipoReporte, reporte])

  function descargarResumen() {
    if (!reporte || !datos) return

    const filas = [
      ['Concepto', 'Valor'],
      ['Mes', reporte.mes],
      ['Tipo', ETIQUETA_TIPO[tipoReporte] ?? tipoReporte],
      ['Fecha de generación', generadoEn ? fechaHoraGT(generadoEn) : ''],
    ]

    if (datos.futuro) {
      filas.push(['Estado', 'Mes futuro'])
    } else if (datos.parcial) {
      filas.push(['Estado', 'Parcial'])
    }

    if (esGeneral) {
      filas.push(['Solicitudes recibidas', datos.solicitudes_recibidas ?? 0])
    }

    filas.push(['Citas del mes', datos.total_citas ?? 0])

    for (const tabla of tablas) {
      filas.push(['', ''])
      filas.push([tabla.titulo, ''])
      filas.push(tabla.columnas)
      for (const fila of tabla.filas) {
        filas.push(fila.map(textoCelda))
      }
    }

    descargarCSV(
      `medinova-resumen-${tipoReporte}-${reporte.mes}.csv`,
      aCSV(filas)
    )
  }

  function descargarBitacora() {
    if (!reporte || !datos) return

    const bitacora = Array.isArray(datos.bitacora) ? datos.bitacora.slice(0, LIMITE_BITACORA) : []

    const filas = [['Fecha', 'Acción', 'Cita', 'Detalle']]

    for (const evento of bitacora) {
      const fecha = aFecha(
        evento?.fecha ?? evento?.fecha_hora ?? evento?.creado_en ?? evento?.timestamp
      )
      filas.push([
        fecha ? fechaHoraGT(fecha) : '',
        evento?.accion ?? evento?.accion_tipo ?? evento?.tipo ?? evento?.evento ?? '',
        textoCita(evento),
        evento?.detalle ?? evento?.descripcion ?? evento?.observacion ?? '',
      ])
    }

    descargarCSV(
      `medinova-bitacora-${tipoReporte}-${reporte.mes}.csv`,
      aCSV(filas)
    )
  }

  return (
    <div className="tarjeta tarjeta-ancha">
      <h1 className="titulo">{titulo}</h1>

      <div className="solo-imprimir">
        Mes: {reporte?.mes ?? mes} · Tipo: {ETIQUETA_TIPO[tipoReporte] ?? tipoReporte} ·
        Generado: {generadoEn ? fechaHoraGT(generadoEn) : '—'}
      </div>

      <div className="reportes-controles no-imprimir">
        <div className="campo">
          <label htmlFor="mes">Mes</label>
          <input
            id="mes"
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="tipo">Tipo de reporte</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value)
              setUsuarioId('0')
            }}
          >
            {TIPOS.map((item) => (
              <option key={item.valor} value={item.valor}>
                {item.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {ROL_POR_TIPO[tipo] && (
          <div className="campo">
            <label htmlFor="persona">Persona</label>
            <select
              id="persona"
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
            >
              <option value="0">Todos</option>
              {personas.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.correo}
                  {usuario.activo ? '' : ' (baja)'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="reportes-acciones">
          <Button variant="secondary" onClick={usarMesActual}>
            Mes actual
          </Button>
          <Button onClick={generar} loading={cargando}>
            Generar reporte
          </Button>
        </div>
      </div>

      {datos && (
        <>
          <div className="reportes-badges">
            {datos.futuro ? (
              <Badge variant="neutral">
                Mes futuro: solo incluye citas programadas, aún no ocurren
              </Badge>
            ) : datos.parcial ? (
              <Badge variant="warning">
                Reporte parcial: datos hasta {fechaLegibleGT(generadoEn)}
              </Badge>
            ) : null}
          </div>

          {datos.parcial && !datos.futuro && (
            <p className="reportes-nota">
              Incluye citas programadas para el resto del mes
            </p>
          )}

          <div className="reportes-tarjetas">
            {esGeneral && (
              <Card className="reporte-tarjeta">
                <span className="reporte-tarjeta__etiqueta">Solicitudes recibidas</span>
                <strong className="reporte-tarjeta__valor">
                  {datos.solicitudes_recibidas ?? 0}
                </strong>
              </Card>
            )}

            <Card className="reporte-tarjeta">
              <span className="reporte-tarjeta__etiqueta">Citas del mes</span>
              <strong className="reporte-tarjeta__valor">{datos.total_citas ?? 0}</strong>
            </Card>

            <Card className="reporte-tarjeta">
              <span className="reporte-tarjeta__etiqueta">Notificaciones enviadas</span>
              <strong className="reporte-tarjeta__valor">
                {datos.eventos?.notificacion_enviada ?? 0}
              </strong>
            </Card>

            <Card className="reporte-tarjeta">
              <span className="reporte-tarjeta__etiqueta">Recordatorios enviados</span>
              <strong className="reporte-tarjeta__valor">
                {datos.eventos?.recordatorio_enviado ?? 0}
              </strong>
            </Card>

            {esGeneral && (
              <Card className="reporte-tarjeta">
                <span className="reporte-tarjeta__etiqueta">Errores</span>
                <strong className="reporte-tarjeta__valor">
                  {datos.eventos?.error ?? 0}
                </strong>
              </Card>
            )}
          </div>

          {datos.bitacora_total > LIMITE_BITACORA && (
            <p className="reportes-aviso">
              La bitácora tiene más de {LIMITE_BITACORA} eventos; el archivo incluye los
              primeros {LIMITE_BITACORA}
            </p>
          )}

          {tablas.map((tabla) => (
            <section key={tabla.id} className="reportes-bloque">
              <h2 className="reportes-subtitulo">{tabla.titulo}</h2>
              <table className="tabla">
                <thead>
                  <tr>
                    {tabla.columnas.map((columna) => (
                      <th key={columna}>{columna}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tabla.filas.length === 0 ? (
                    <tr>
                      <td colSpan={tabla.columnas.length}>Sin datos</td>
                    </tr>
                  ) : (
                    tabla.filas.map((fila, indice) => (
                      <tr key={`${tabla.id}-${indice}`}>
                        {fila.map((celda, posicion) => (
                          <td key={posicion}>{textoCelda(celda)}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          ))}

          <div className="reportes-acciones no-imprimir">
            <Button variant="secondary" onClick={descargarResumen}>
              Descargar resumen (CSV)
            </Button>
            <Button variant="secondary" onClick={descargarBitacora}>
              Descargar bitácora (CSV)
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              Imprimir o guardar como PDF
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
