import './style.css'

// Configuración - URL de tu servidor backend en Contabo
const SERVER_URL = 'http://173.249.8.251:5000'

// Configuración para requests
const API_CONFIG = {
  baseURL: SERVER_URL,
  headers: {
    'Content-Type': 'application/json'
  }
}

// Referencias del DOM
const elements = {
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  voiceOrb: document.getElementById('voiceOrb'),
  systemMessages: document.getElementById('systemMessages')
}

// Estado de la aplicación PAOLA adaptado para INMOBILIARIA
const state = {
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  prospectName: 'Cliente',
  currentAudio: null,
  recognition: null,
  microphonePermission: 'unknown',
  conversationHistory: [],
  audioContext: null,
  userHasInteracted: false,
  pendingInitialMessage: null,
  isPlayingAudio: false,
  initialMessagePlayed: false,
  debugMode: true,
  
  // ESTADOS ADAPTADOS PARA INMOBILIARIA (compatible con Daniel)
  salesPhase: 'CONTACTO_INICIAL',
  prospectAnalysis: {
    property_type: null,        // comprar/arrendar
    location_interest: false,   // interés en ubicación
    buying_signals: false,
    visit_interest: false,
    objections: false
  },
  prospectData: {
    first_name: 'Cliente',
    property_interest: null,     // tipo de propiedad
    location_preference: null,   // ubicación preferida
    budget_range: null,
    visit_scheduled: false,
    preferred_day: null,
    preferred_time: null,
    conversation_stage: 'inicial'
  },
  dealershipInfo: {
    name: 'INMOBILIARIA CASA IDEAL',
    address: 'Bogotá, Colombia',
    services: ['Apartamentos', 'Casas', 'Arriendos', 'Ventas'],
    agent: 'Daniel'
  },
  salesMetrics: {
    startTime: null,
    totalInteractions: 0,
    avgResponseTime: 0,
    visitInterests: 0,
    objectionsHandled: 0,
    visitsScheduled: 0,
    casaIdealMentions: 0
  }
}

// TESTING ADAPTADO PARA INMOBILIARIA
const TESTING_SCENARIOS = [
  // INTERESADOS EN VISITAR PROPIEDADES
  { id: 1, nombre: 'Ana', tipo: 'VISITA_INMEDIATA', mensajes: ['Hola', 'Quiero ver apartamentos', 'Cuándo puedo ir?', 'Este sábado está bien', 'Perfecto'] },
  { id: 2, nombre: 'Carlos', tipo: 'VISITA_INMEDIATA', mensajes: ['Buenos días', 'Necesito una casa', 'Puedo visitarlos mañana?', 'A las 3pm', 'Gracias'] },
  { id: 3, nombre: 'María', tipo: 'VISITA_INMEDIATA', mensajes: ['Hola Daniel', 'Busco apartamento', 'Cuándo están disponibles?', 'El domingo puedo', 'Agenda la cita'] },
  
  // INTERÉS EN TIPOS ESPECÍFICOS DE PROPIEDAD
  { id: 4, nombre: 'Pedro', tipo: 'APARTAMENTO_INTERES', mensajes: ['Hola', 'Busco apartamento familiar', 'Zona Rosa tienen?', 'Cuánto cuestan?', 'Puedo verlos?'] },
  { id: 5, nombre: 'Lucía', tipo: 'CASA_INTERES', mensajes: ['Buenos días', 'Necesito casa grande', 'Chapinero qué tienen?', 'Características', 'Agendar visita'] },
  { id: 6, nombre: 'Roberto', tipo: 'ARRIENDO_INTERES', mensajes: ['Hola', 'Busco para arrendar', 'Usaquén', 'Precio mensual', 'Ver opciones'] },
  
  // OBJECIONES COMUNES
  { id: 7, nombre: 'Sandra', tipo: 'NO_TIEMPO', mensajes: ['Quién habla', 'No tengo tiempo', 'Muy ocupada', 'Fin de semana?', 'Tal vez sábado'] },
  { id: 8, nombre: 'Miguel', tipo: 'MUY_CARO', mensajes: ['Buenos días', 'Muy caro', 'No tengo presupuesto', 'Algo más económico?', 'Convénceme'] },
  { id: 9, nombre: 'Patricia', tipo: 'NO_SEGURA', mensajes: ['Hola', 'No estoy segura', 'Tengo que pensarlo', 'Sin compromiso?', 'Solo mirar'] },
  
  // CONSULTAS DE INFORMACIÓN
  { id: 10, nombre: 'Diego', tipo: 'NECESITA_INFO', mensajes: ['Hola', 'Qué propiedades tienen?', 'Precios aproximados', 'Financiamiento', 'Ubicaciones'] },
  { id: 11, nombre: 'Carmen', tipo: 'NECESITA_INFO', mensajes: ['Buenos días', 'Horarios de atención', 'Dónde están ubicados', 'Cómo llegar', 'Gracias'] },
  { id: 12, nombre: 'Andrés', tipo: 'NECESITA_INFO', mensajes: ['Hola Daniel', 'Tienen casas?', 'Están amobladas?', 'Qué incluyen', 'Interesante'] },
  
  // CONTESTADORES
  { id: 13, nombre: 'Contestador1', tipo: 'CONTESTADOR', mensajes: ['Este es el contestador para María', 'deja tu mensaje después del tono', 'beep'] },
  { id: 14, nombre: 'Contestador2', tipo: 'CONTESTADOR', mensajes: ['Tu contacto no está disponible', 'buzón de voz', 'presiona la tecla numeral'] },
  
  // CASOS COMPLEJOS DE INMOBILIARIA
  { id: 15, nombre: 'Elena', tipo: 'COMPLEJO', mensajes: ['Buenos días', 'Cambiar de apartamento', 'Vender el actual?', 'Proceso de cambio', 'Interesada'] },
  { id: 16, nombre: 'Fernando', tipo: 'COMPLEJO', mensajes: ['Hola', 'Inmueble para inversión', 'Rentabilidad', 'Mejores zonas?', 'Reunión'] },
  { id: 17, nombre: 'Gloria', tipo: 'COMPLEJO', mensajes: ['Buenos días Daniel', 'Casa para mi familia', 'Segura y amplia', 'Buenos colegios cerca', 'Asesoría'] },
  
  // COMPARACIÓN DE OPCIONES
  { id: 18, nombre: 'Javier', tipo: 'COMPARACION', mensajes: ['Hola', 'Comprar vs arrendar', 'Cuál recomiendan?', 'Diferencias principales', 'Decidir'] },
  { id: 19, nombre: 'Monica', tipo: 'COMPARACION', mensajes: ['Buenos días', 'Ventajas de cada zona', 'Servicios cercanos', 'Valorización', 'Visitar'] },
  { id: 20, nombre: 'Ricardo', tipo: 'FINANCIAMIENTO', mensajes: ['Hola Daniel', 'Opciones de crédito', 'Cuotas mensuales', 'Requisitos', 'Aplicar'] }
];

// MÉTRICAS DE TESTING INMOBILIARIA
let testingResults = {
  conversacionesCompletadas: 0,
  visitasAgendadas: 0,
  interesesGenerados: 0,
  erroresAudio: 0,
  palabrasPromedio: 0,
  fasesVentas: {},
  objecionesManejadas: 0,
  contestadoresDetectados: 0,
  tiempoTotal: 0,
  conversacionesDetalle: [],
  puntosFortaleza: [],
  puntosMejora: [],
  isTestingActive: false
};

// Inicializar aplicación
init()

async function init() {
  console.log('🏠 Iniciando Sistema PAOLA - INMOBILIARIA...')
  console.log('💼 Especialista Daniel - Casa Ideal')
  console.log('🧪 Testing de ventas inmobiliarias integrado')
  console.log('📊 Métricas de agendamiento en tiempo real')
  
  setupEventListeners()
  await checkServerConnection()
  await checkMicrophoneSupport()
  setupSpeechRecognition()
  
  // Iniciar métricas de ventas
  state.salesMetrics.startTime = Date.now()
}

function setupEventListeners() {
  // Click en la bolita principal
  elements.voiceOrb.addEventListener('click', handleOrbClick)
  
  // Detectar primera interacción del usuario
  const enableAudio = () => {
    if (!state.userHasInteracted) {
      state.userHasInteracted = true
      console.log('✅ Primera interacción detectada - Audio habilitado')
      
      // Crear AudioContext si no existe
      if (!state.audioContext) {
        try {
          state.audioContext = new (window.AudioContext || window.webkitAudioContext)()
          console.log('🎵 AudioContext creado:', state.audioContext.state)
        } catch (e) {
          console.error('❌ Error creando AudioContext:', e)
        }
      }
      
      // Si hay un mensaje inicial pendiente, reproducirlo ahora
      if (state.pendingInitialMessage && !state.initialMessagePlayed) {
        playPendingInitialMessage()
      }
    }
  }
  
  // Eventos que indican interacción del usuario
  document.addEventListener('click', enableAudio, { once: false })
  document.addEventListener('keydown', enableAudio, { once: false })
  document.addEventListener('touchstart', enableAudio, { once: false })
  
  // Atajos de teclado
  document.addEventListener('keydown', (e) => {
    switch(e.key) {
      case ' ': // Espacio para activar/desactivar voz
        e.preventDefault()
        handleOrbClick()
        break
      case 'Escape': // Escape para interrumpir
        if (state.isSpeaking) {
          handleInterrupt()
        } else if (state.isListening) {
          stopListening()
        }
        break
      case 'm': // M para métricas
        if (state.debugMode && e.ctrlKey) {
          e.preventDefault()
          showSalesMetrics()
        }
        break
      case 't': // T para test de audio
        if (state.debugMode && e.ctrlKey) {
          e.preventDefault()
          testDanielAudio()
        }
        break
      case 'r': // R para testing rápido
        if (state.debugMode && e.ctrlKey) {
          e.preventDefault()
          startTestingRapido()
        }
        break
      case 'f': // F para testing completo
        if (state.debugMode && e.ctrlKey) {
          e.preventDefault()
          startTestingCompleto()
        }
        break
      case 'c': // C para actualizar prospecto
        if (state.debugMode && e.ctrlKey) {
          e.preventDefault()
          updateProspectData()
        }
        break
    }
  })
  
  // Detectar cuando el usuario sale de la pestaña para pausar audio
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.currentAudio) {
      handleInterrupt()
    }
  })
}

function handleOrbClick() {
  console.log('🏠 Orb clicked - Estado actual:', {
    isSpeaking: state.isSpeaking,
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    isPlayingAudio: state.isPlayingAudio,
    pendingInitialMessage: !!state.pendingInitialMessage,
    initialMessagePlayed: state.initialMessagePlayed,
    salesPhase: state.salesPhase,
    isTestingActive: testingResults.isTestingActive
  })
  
  // Si hay testing activo, no permitir interacción manual
  if (testingResults.isTestingActive) {
    addSystemMessage('🧪 Testing en progreso - Interacción manual deshabilitada')
    return
  }
  
  // PRIORIDAD 1: Si hay mensaje inicial pendiente, reproducirlo INMEDIATAMENTE
  if (state.pendingInitialMessage && !state.initialMessagePlayed) {
    console.log('🎵 Reproduciendo contacto inicial de Daniel...')
    playPendingInitialMessage()
    return
  }
  
  // PRIORIDAD 2: Si está hablando, interrumpir
  if (state.isSpeaking || state.isPlayingAudio) {
    handleInterrupt()
    return
  }
  
  // PRIORIDAD 3: Si está escuchando, parar
  if (state.isListening) {
    stopListening()
    return
  }
  
  // PRIORIDAD 4: Si está libre, empezar a escuchar
  if (!state.isProcessing) {
    startListening()
  }
}

async function checkServerConnection() {
  try {
    setStatus('connecting', 'Conectando a Daniel...')
    
    const response = await fetch(`${API_CONFIG.baseURL}/api/status`, {
      method: 'GET',
      headers: API_CONFIG.headers
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Servidor conectado - Daniel:', data)
      
      setStatus('ready', 'Daniel listo')
      addSystemMessage('🏠 DANIEL - CASA IDEAL conectado')
      addSystemMessage(`💼 Especialista: ${data.agent || 'Daniel'}`)
      addSystemMessage(`👤 Cliente: ${data.lead_current?.first_name || 'No definido'}`)
      addSystemMessage(`📍 Empresa: ${data.company || 'Casa Ideal'}`)
      addSystemMessage('🧪 Testing inmobiliario disponible')
      
      // Actualizar datos del prospecto local (adaptado de lead_current)
      if (data.lead_current) {
        state.prospectData = {
          first_name: data.lead_current.first_name || 'Cliente',
          property_interest: data.lead_current.property_type || null,
          location_preference: data.lead_current.location_preference || null,
          budget_range: data.lead_current.budget_range || null,
          visit_scheduled: data.lead_current.appointment_scheduled || false,
          conversation_stage: data.lead_current.conversation_phase || 'inicial'
        }
        state.prospectName = data.lead_current.first_name || 'Cliente'
      }
      
      // Actualizar métricas (adaptado)
      if (data.casa_ideal_mentions) {
        state.salesMetrics.casaIdealMentions = parseInt(data.casa_ideal_mentions.split('/')[0]) || 0
      }
      
      // Solicitar mensaje inicial automáticamente
      await getInitialMessage()
    } else {
      throw new Error('Servidor no disponible')
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error)
    setStatus('error', 'Sin conexión')
    addSystemMessage('❌ Error: No se puede conectar al servidor')
    addSystemMessage('🔧 Verifica que el backend esté corriendo en Contabo')
  }
}

async function checkMicrophoneSupport() {
  console.log('🎤 Verificando soporte de micrófono...')
  
  const hasMediaDevices = !!navigator.mediaDevices
  const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia
  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  
  console.log('MediaDevices disponible:', hasMediaDevices)
  console.log('getUserMedia disponible:', hasGetUserMedia)
  console.log('SpeechRecognition disponible:', hasSpeechRecognition)
  
  if (!hasMediaDevices || !hasGetUserMedia) {
    addSystemMessage('❌ Micrófono no soportado en este navegador')
    return false
  }
  
  if (!hasSpeechRecognition) {
    addSystemMessage('❌ Reconocimiento de voz no soportado')
    return false
  }
  
  try {
    const permission = await navigator.permissions.query({name: 'microphone'})
    state.microphonePermission = permission.state
    console.log('🎤 Permiso de micrófono:', permission.state)
    
    switch(permission.state) {
      case 'granted':
        addSystemMessage('✅ Micrófono listo para consultas')
        break
      case 'denied':
        addSystemMessage('❌ Micrófono bloqueado - Habilitar en configuración')
        break
      case 'prompt':
        addSystemMessage('⚠️ Se pedirá permiso para usar el micrófono')
        break
    }
    
    permission.onchange = () => {
      state.microphonePermission = permission.state
      console.log('🔄 Permiso de micrófono cambió a:', permission.state)
    }
    
    return true
  } catch (error) {
    console.log('⚠️ No se pudo verificar permisos:', error)
    return true
  }
}

function setupSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    state.recognition = new SpeechRecognition()
    
    // Configuración optimizada para español colombiano
    state.recognition.lang = 'es-CO'
    state.recognition.continuous = false
    state.recognition.interimResults = false
    state.recognition.maxAlternatives = 3
    
    state.recognition.onstart = () => {
      console.log('🎤 Reconocimiento iniciado - Fase:', state.salesPhase)
      setStatus('listening', 'Daniel escucha...')
      setOrbState('listening')
    }
    
    state.recognition.onresult = (event) => {
      const results = event.results[0]
      const text = results[0].transcript
      const confidence = results[0].confidence
      
      console.log(`💬 Reconocido: "${text}" (Confianza: ${confidence})`)
      
      if (confidence < 0.7 && results.length > 1) {
        console.log('🔄 Alternativas:', Array.from(results).map(r => r.transcript))
      }
      
      setStatus('ready', 'Procesando...')
      state.isListening = false
      setOrbState('processing')
      
      addSystemMessage(`🏠 Cliente dice: "${text}"`)
      
      // Actualizar métricas de conversación
      state.salesMetrics.totalInteractions++
      
      // Enviar automáticamente
      setTimeout(() => handleSendMessage(text), 300)
    }
    
    state.recognition.onerror = (event) => {
      console.error('❌ Error de reconocimiento:', event.error, event)
      setStatus('ready', 'Lista')
      state.isListening = false
      setOrbState('ready')
      
      const errorMessages = {
        'network': '🌐 Error de red - Verifica conexión',
        'not-allowed': '🚫 Micrófono bloqueado',
        'service-not-allowed': '⚠️ Servicio de voz bloqueado por el navegador',
        'no-speech': '🔇 No se detectó voz - Intenta de nuevo',
        'audio-capture': '🎤 No se pudo capturar audio del micrófono',
        'aborted': '⏹️ Reconocimiento cancelado'
      }
      
      addSystemMessage(errorMessages[event.error] || `❌ Error de voz: ${event.error}`)
    }
    
    state.recognition.onend = () => {
      console.log('🏁 Reconocimiento finalizado')
      setStatus('ready', 'Lista')
      state.isListening = false
      setOrbState('ready')
    }
    
    state.recognition.onnomatch = () => {
      console.log('❓ No se encontró coincidencia')
      addSystemMessage('❓ No se entendió el audio - Intenta hablar más claro')
    }
    
    console.log('✅ SpeechRecognition configurado para español colombiano')
  } else {
    console.log('❌ SpeechRecognition no disponible')
    addSystemMessage('❌ Reconocimiento de voz no soportado')
  }
}

function setStatus(status, text) {
  elements.statusDot.className = `status-dot ${status}`
  elements.statusText.textContent = text
  
  state.isListening = status === 'listening'
  state.isProcessing = status === 'processing'
  state.isSpeaking = status === 'speaking'
}

function setOrbState(orbStatus) {
  elements.voiceOrb.className = `voice-orb ${orbStatus}`
  
  const icon = elements.voiceOrb.querySelector('.voice-orb-content')
  const textEl = elements.voiceOrb.querySelector('.voice-orb-text')
  
  switch(orbStatus) {
    case 'listening':
      icon.textContent = '🎤'
      textEl.textContent = `Escuchando - ${state.salesPhase}`
      break
    case 'processing':
      icon.textContent = '⚡'
      textEl.textContent = 'Daniel analiza consulta...'
      break
    case 'speaking':
      icon.textContent = '🏠'
      textEl.textContent = `DANIEL atendiendo - ${state.salesPhase}`
      break
    case 'waiting-interaction':
      icon.textContent = '▶'
      textEl.textContent = 'Clic para que DANIEL inicie contacto'
      break
    case 'testing':
      icon.textContent = '🧪'
      textEl.textContent = 'Testing inmobiliario en progreso...'
      break
    default:
      icon.textContent = '🏠'
      if (state.initialMessagePlayed) {
        textEl.textContent = `Clic para responder - ${state.salesMetrics.visitInterests} intereses`
      } else {
        textEl.textContent = 'Clic para que DANIEL inicie contacto'
      }
      break
  }
}

async function getInitialMessage() {
  if (state.initialMessagePlayed || state.pendingInitialMessage) {
    console.log('ℹ️ Mensaje inicial ya procesado')
    return
  }
  
  try {
    console.log('🏠 Solicitando contacto inicial de DANIEL...')
    setStatus('processing', 'DANIEL se prepara...')
    setOrbState('processing')
    
    const response = await fetch(`${API_CONFIG.baseURL}/api/initial`, {
      method: 'GET',
      headers: API_CONFIG.headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Contacto inicial recibido:', data)
    
    if (data.message) {
      console.log('💬 Mensaje inicial:', data.message)
      console.log('🏢 Empresa:', data.speaker)
      console.log('👤 Cliente:', data.lead_data?.first_name)
      
      // Agregar al historial
      state.conversationHistory.push({
        role: 'assistant',
        content: data.message
      })
      
      // Actualizar fase de ventas (adaptado)
      state.salesPhase = data.conversation_phase || 'CONTACTO_INICIAL'
      
      // Actualizar datos del prospecto (adaptado de lead_data)
      if (data.lead_data) {
        state.prospectData = {
          first_name: data.lead_data.first_name || 'Cliente',
          property_interest: data.lead_data.property_type || null,
          location_preference: data.lead_data.location_preference || null,
          budget_range: data.lead_data.budget_range || null,
          visit_scheduled: data.lead_data.appointment_scheduled || false,
          conversation_stage: data.lead_data.conversation_phase || 'inicial'
        }
        state.prospectName = data.lead_data.first_name || 'Cliente'
      }
      
      // Guardar como pendiente SIEMPRE
      if (data.audioUrl) {
        state.pendingInitialMessage = data
        console.log('✅ Contacto inicial guardado como pendiente')
        
        setStatus('ready', 'Lista')
        setOrbState('waiting-interaction')
        addSystemMessage('🏠 Clic en la bolita para que DANIEL inicie contacto')
      } else {
        console.log('❌ No hay audioUrl en la respuesta')
        setStatus('ready', 'Lista')
        setOrbState('ready')
        addSystemMessage('❌ Error: No se generó audio para el contacto inicial')
      }
    } else {
      throw new Error('No se recibió mensaje inicial')
    }
  } catch (error) {
    console.error('❌ Error obteniendo contacto inicial:', error)
    addSystemMessage(`❌ Error inicial: ${error.message}`)
    setStatus('ready', 'Lista')
    setOrbState('ready')
  }
}

async function playPendingInitialMessage() {
  if (state.pendingInitialMessage && state.pendingInitialMessage.audioUrl && !state.initialMessagePlayed) {
    console.log('🎵 REPRODUCIENDO CONTACTO INICIAL DE DANIEL!')
    console.log('🏢 Empresa:', state.pendingInitialMessage.speaker)
    console.log('👤 Cliente:', state.pendingInitialMessage.lead_data?.first_name)
    
    // Construir URL completa
    const fullAudioUrl = `${API_CONFIG.baseURL}${state.pendingInitialMessage.audioUrl}`
    console.log('🔗 URL completa:', fullAudioUrl)
    
    // Reproducir inmediatamente
    await playAudio(fullAudioUrl)
    
    // Marcar como reproducido DESPUÉS de que termine
    state.initialMessagePlayed = true
    
    // Limpiar mensaje pendiente
    state.pendingInitialMessage = null
    
    console.log('✅ Contacto inicial de DANIEL completado')
    addSystemMessage('🏠 DANIEL inició contacto - Ahora puedes responder')
  } else {
    console.log('❌ No hay contacto inicial pendiente para reproducir')
  }
}

async function startListening() {
  if (!state.recognition) {
    addSystemMessage('❌ Reconocimiento de voz no disponible')
    return
  }
  
  if (state.microphonePermission === 'denied') {
    addSystemMessage('🚫 Micrófono bloqueado - Verificar permisos')
    return
  }
  
  try {
    console.log('🎤 Iniciando reconocimiento - Fase:', state.salesPhase)
    setStatus('listening', 'Escuchando...')
    setOrbState('listening')
    state.recognition.start()
  } catch (error) {
    console.error('❌ Error al iniciar reconocimiento:', error)
    setStatus('ready', 'Lista')
    setOrbState('ready')
    
    if (error.name === 'InvalidStateError') {
      addSystemMessage('⚠️ Ya hay un reconocimiento activo')
    } else {
      addSystemMessage('❌ Error al iniciar reconocimiento de voz')
    }
  }
}

function stopListening() {
  if (state.recognition && state.isListening) {
    console.log('⏹️ Deteniendo reconocimiento...')
    state.recognition.stop()
  }
  setStatus('ready', 'Lista')
  setOrbState('ready')
}

async function handleSendMessage(message) {
  if (!message || !message.trim()) return
  
  console.log('📤 Enviando mensaje:', message)
  
  // Extraer nombre si es primera interacción real
  if (state.conversationHistory.length <= 1) {
    extractProspectName(message)
  }
  
  // Agregar a historial
  state.conversationHistory.push({
    role: 'user',
    content: message
  })
  
  const startTime = Date.now()
  setStatus('processing', 'DANIEL analiza consulta...')
  setOrbState('processing')
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/api/chat`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({
        message: message,
        userName: state.prospectName,
        history: state.conversationHistory.slice(-10)
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Respuesta de DANIEL recibida:', data)
    
    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime
    state.salesMetrics.avgResponseTime = 
      (state.salesMetrics.avgResponseTime + responseTime) / 2
    
    if (data.response) {
      console.log('💬 Respuesta:', data.response)
      console.log('🏠 Fase conversación:', data.conversation_phase)
      console.log('📊 Cliente actual:', data.client_name)
      
      // Manejar detección de contestador
      if (data.conversation_ended && data.reason === 'contestador_automatico') {
        console.log('📞 CONTESTADOR DETECTADO - Terminando conversación')
        addSystemMessage('📞 CONTESTADOR DETECTADO - Conversación terminada')
        setStatus('ready', 'Contestador detectado')
        setOrbState('ready')
        return
      }
      
      // Actualizar estado según la respuesta (adaptado para inmobiliaria)
      state.salesPhase = data.conversation_phase || state.salesPhase
      
      // Adaptar análisis del prospecto desde los datos de Daniel
      state.prospectAnalysis = {
        property_type: data.lead_data?.property_type || null,
        location_interest: data.lead_data?.location_preference || false,
        buying_signals: data.qualified || false,
        visit_interest: data.appointment_scheduled || false,
        objections: data.lead_data?.objection_handled || false
      }
      
      // Actualizar contadores
      if (data.appointment_scheduled) {
        state.salesMetrics.visitInterests++
        addSystemMessage(`🏠 VISITA AGENDADA #${state.salesMetrics.visitInterests} - ¡ÉXITO!`)
      }
      
      if (data.lead_data?.objection_handled) {
        state.salesMetrics.objectionsHandled++
        addSystemMessage(`💡 Objeción #${state.salesMetrics.objectionsHandled} - DANIEL maneja`)
      }
      
      if (data.qualified) {
        addSystemMessage('💰 Cliente calificado - DANIEL aprovecha')
      }
      
      // Actualizar menciones de Casa Ideal
      if (data.casa_ideal_mentions) {
        state.salesMetrics.casaIdealMentions = data.casa_ideal_mentions
        addSystemMessage(`🏢 Casa Ideal mencionada ${data.casa_ideal_mentions}/3 veces`)
      }
      
      // Agregar respuesta al historial
      state.conversationHistory.push({
        role: 'assistant',
        content: data.response
      })
      
      // Actualizar datos del prospecto si están disponibles
      if (data.lead_data) {
        state.prospectData = {
          first_name: data.lead_data.first_name || state.prospectData.first_name,
          property_interest: data.lead_data.property_type || state.prospectData.property_interest,
          location_preference: data.lead_data.location_preference || state.prospectData.location_preference,
          budget_range: data.lead_data.budget_range || state.prospectData.budget_range,
          visit_scheduled: data.appointment_scheduled || state.prospectData.visit_scheduled,
          conversation_stage: data.conversation_phase || state.prospectData.conversation_stage
        }
      }
      
      if (data.audioUrl) {
        console.log('🎵 Reproduciendo audio de DANIEL:', data.audioUrl)
        await playAudio(`${API_CONFIG.baseURL}${data.audioUrl}`)
      } else {
        console.warn('⚠️ No se recibió audioUrl en la respuesta')
        setStatus('ready', 'Lista')
        setOrbState('ready')
        addSystemMessage('❌ Respuesta sin audio - Verifica ElevenLabs')
      }
    } else {
      throw new Error('Respuesta vacía del servidor')
    }
  } catch (error) {
    console.error('❌ Error en conversación:', error)
    addSystemMessage(`❌ Error: ${error.message}`)
    setStatus('ready', 'Lista')
    setOrbState('ready')
  }
}

function extractProspectName(message) {
  const words = message.toLowerCase().split(' ')
  const nameIndicators = ['soy', 'llamo', 'nombre', 'me']
  
  for (let i = 0; i < words.length; i++) {
    if (nameIndicators.includes(words[i]) && words[i + 1]) {
      const name = words[i + 1]
      if (!['me', 'mi', 'yo', 'llamo'].includes(name)) {
        state.prospectName = name.charAt(0).toUpperCase() + name.slice(1)
        console.log('👤 Nombre extraído:', state.prospectName)
        addSystemMessage(`👋 Hola ${state.prospectName} - DANIEL te conoce`)
        
        // Actualizar datos del prospecto en el servidor
        updateProspectData({ first_name: state.prospectName })
        break
      }
    }
  }
}

async function playAudio(audioUrl) {
  return new Promise((resolve) => {
    console.log('🎵 INICIANDO REPRODUCCIÓN DE AUDIO DANIEL')
    console.log('🔗 URL:', audioUrl)
    
    // Limpiar cualquier audio anterior
    if (state.currentAudio) {
      console.log('🛑 Deteniendo audio anterior')
      state.currentAudio.pause()
      state.currentAudio.currentTime = 0
      state.currentAudio = null
    }
    
    state.isPlayingAudio = true
    
    setStatus('speaking', `DANIEL habla - ${state.salesPhase}`)
    setOrbState('speaking')
    
    // Crear elemento de audio
    const audioUrlWithTimestamp = `${audioUrl}?t=${Date.now()}`
    console.log('🎧 Creando audio element:', audioUrlWithTimestamp)
    
    state.currentAudio = new Audio(audioUrlWithTimestamp)
    state.currentAudio.preload = 'auto'
    
    // Handler cuando termina
    const endHandler = () => {
      console.log('✅ Audio de DANIEL terminado correctamente')
      setStatus('ready', `Listo - ${state.salesMetrics.visitInterests} intereses`)
      setOrbState('ready')
      state.currentAudio = null
      state.isPlayingAudio = false
      
      // Mensaje contextual según fase de conversación
      const phaseMessages = {
        'saludo_inicial': 'DANIEL te contactó - Responde',
        'preguntas_calificacion': 'DANIEL califica - Continúa',
        'proponer_visita': 'DANIEL propone visita - Acepta?',
        'manejar_negativa': 'DANIEL maneja objeción - Responde'
      }
      
      const message = phaseMessages[state.salesPhase] || 'DANIEL terminó - Tu turno'
      if (!testingResults.isTestingActive) {
        addSystemMessage(`🏠 ${message}`)
      }
      
      resolve()
    }
    
    // Handler de error
    const errorHandler = (error) => {
      console.error('❌ ERROR reproduciendo audio DANIEL:', error)
      
      setStatus('ready', 'Lista')
      setOrbState('ready')
      state.currentAudio = null
      state.isPlayingAudio = false
      addSystemMessage('❌ Error reproduciendo audio')
      resolve()
    }
    
    // Asignar eventos
    state.currentAudio.addEventListener('ended', endHandler, { once: true })
    state.currentAudio.addEventListener('error', errorHandler, { once: true })
    
    // Eventos de debugging
    state.currentAudio.addEventListener('loadstart', () => {
      console.log('📥 Cargando audio DANIEL...')
    })
    
    state.currentAudio.addEventListener('canplay', () => {
      console.log('✅ Audio DANIEL listo para reproducir')
    })
    
    state.currentAudio.addEventListener('loadeddata', () => {
      console.log('📊 Audio data cargada, duración:', state.currentAudio.duration)
    })
    
    // REPRODUCIR
    console.log('▶️ Iniciando reproducción DANIEL...')
    const playPromise = state.currentAudio.play()
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('🎉 Audio DANIEL iniciado exitosamente!')
      }).catch(error => {
        console.error('💥 Error al iniciar reproducción:', error)
        
        if (error.name === 'NotAllowedError') {
          setStatus('ready', 'Lista')
          setOrbState('waiting-interaction')
          addSystemMessage('🔒 Necesita interacción del usuario para reproducir')
        } else {
          setStatus('ready', 'Lista')
          setOrbState('ready')
          addSystemMessage('❌ Error al reproducir audio')
        }
        
        state.currentAudio = null
        state.isPlayingAudio = false
        resolve()
      })
    }
  })
}

async function handleInterrupt() {
  console.log('🛑 Interrumpiendo conversación inmobiliaria...')
  
  if (state.currentAudio) {
    state.currentAudio.pause()
    state.currentAudio.currentTime = 0
    
    if (state.currentAudio._endHandler) {
      state.currentAudio.removeEventListener('ended', state.currentAudio._endHandler)
    }
    if (state.currentAudio._errorHandler) {
      state.currentAudio.removeEventListener('error', state.currentAudio._errorHandler)
    }
    
    state.currentAudio = null
  }
  
  state.isPlayingAudio = false
  
  try {
    await fetch(`${API_CONFIG.baseURL}/api/interrupt`, {
      method: 'POST',
      headers: API_CONFIG.headers
    })
    console.log('✅ Interrupción enviada al servidor')
  } catch (error) {
    console.error('❌ Error al interrumpir:', error)
  }
  
  setStatus('ready', 'Lista')
  setOrbState('ready')
  if (!testingResults.isTestingActive) {
    addSystemMessage('⏸️ Conversación interrumpida - DANIEL espera')
  }
}

// FUNCIONES DE TESTING ADAPTADAS PARA INMOBILIARIA

function evaluarRespuestaInmobiliaria(respuesta, scenario) {
  const evaluacion = {
    palabras: 0,
    tieneAudio: false,
    faseConversacion: 'UNKNOWN',
    analisisCliente: null,
    calidad: 0,
    problemas: [],
    fortalezas: [],
    esContestador: false
  }

  if (!respuesta) return evaluacion

  // Evaluar palabras (inmobiliaria puede ser más informativa)
  evaluacion.palabras = respuesta.response ? respuesta.response.split(' ').length : 0
  if (evaluacion.palabras <= 120 && evaluacion.palabras >= 15) {
    evaluacion.fortalezas.push('Longitud apropiada para inmobiliaria')
    evaluacion.calidad += 25
  } else if (evaluacion.palabras > 120) {
    evaluacion.problemas.push(`Muy largo: ${evaluacion.palabras} palabras`)
  } else {
    evaluacion.problemas.push(`Muy corto: ${evaluacion.palabras} palabras`)
  }

  // Evaluar audio
  evaluacion.tieneAudio = !!respuesta.audioUrl
  if (evaluacion.tieneAudio) {
    evaluacion.fortalezas.push('Audio generado correctamente')
    evaluacion.calidad += 25
  } else {
    evaluacion.problemas.push('Error en audio')
    testingResults.erroresAudio++
  }

  // Evaluar fase de conversación
  evaluacion.faseConversacion = respuesta.conversation_phase || 'UNKNOWN'
  if (evaluacion.faseConversacion !== 'UNKNOWN') {
    evaluacion.fortalezas.push(`Fase: ${evaluacion.faseConversacion}`)
    evaluacion.calidad += 25
    
    testingResults.fasesVentas[evaluacion.faseConversacion] = (testingResults.fasesVentas[evaluacion.faseConversacion] || 0) + 1
  }

  // Evaluar análisis del cliente
  evaluacion.analisisCliente = respuesta.lead_data
  if (evaluacion.analisisCliente) {
    evaluacion.fortalezas.push('Análisis de cliente detectado')
    evaluacion.calidad += 25

    if (respuesta.appointment_scheduled) {
      testingResults.visitasAgendadas++
    } else if (respuesta.qualified) {
      testingResults.interesesGenerados++
    } else if (respuesta.lead_data?.objection_handled) {
      testingResults.objecionesManejadas++
    }
  }

  // Detectar contestador
  if (respuesta.conversation_ended && respuesta.reason === 'contestador_automatico') {
    evaluacion.esContestador = true
    evaluacion.fortalezas.push('Contestador detectado correctamente')
    evaluacion.calidad = 100
    testingResults.contestadoresDetectados++
  }

  // Evaluar tono profesional y persuasivo
  const respuestaTexto = respuesta.response?.toLowerCase() || ''
  const expresionesAmigables = ['hola', 'gracias', 'perfecto', 'excelente', 'me encanta', 'gusto']
  const expresionesInmobiliaria = ['casa ideal', 'inmueble', 'apartamento', 'casa', 'propiedad', 'visita']
  
  const tieneAmigables = expresionesAmigables.some(expr => respuestaTexto.includes(expr))
  const tieneInmobiliaria = expresionesInmobiliaria.some(expr => respuestaTexto.includes(expr))
  
  if (tieneAmigables && tieneInmobiliaria) {
    evaluacion.fortalezas.push('Tono profesional y amigable')
  } else if (!tieneAmigables) {
    evaluacion.problemas.push('Falta amabilidad en el mensaje')
  } else if (!tieneInmobiliaria) {
    evaluacion.problemas.push('Falta enfoque inmobiliario')
  }

  return evaluacion
}

async function ejecutarConversacionTestingInmobiliaria(scenario) {
  console.log(`\n🏠 TESTING INMOBILIARIA ${scenario.id}: ${scenario.nombre} (${scenario.tipo})`)
  
  const conversacionInicio = Date.now()
  const evaluaciones = []
  let calidadTotal = 0

  try {
    // Resetear estado para testing
    state.conversationHistory = []
    state.salesMetrics.visitInterests = 0
    state.salesMetrics.objectionsHandled = 0
    state.salesPhase = 'CONTACTO_INICIAL'
    state.prospectName = scenario.nombre

    // Resetear lead en servidor
    await fetch(`${API_CONFIG.baseURL}/api/reset`, {
      method: 'POST',
      headers: API_CONFIG.headers
    })

    // Obtener mensaje inicial
    console.log('📞 Obteniendo contacto inicial...')
    const initialResponse = await fetch(`${API_CONFIG.baseURL}/api/initial`)
    const initialData = await initialResponse.json()
    
    if (initialData.audioUrl) {
      console.log('✅ Audio inicial disponible')
    }

    // Simular conversación
    for (let i = 0; i < scenario.mensajes.length; i++) {
      const mensaje = scenario.mensajes[i]
      console.log(`👤 ${scenario.nombre}: "${mensaje}"`)
      
      const tiempoInicio = Date.now()
      
      const response = await fetch(`${API_CONFIG.baseURL}/api/chat`, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({
          message: mensaje,
          userName: scenario.nombre,
          history: state.conversationHistory
        })
      })

      const data = await response.json()
      const tiempoRespuesta = Date.now() - tiempoInicio

      // Manejar contestador
      if (data.conversation_ended && data.reason === 'contestador_automatico') {
        console.log('📞 Contestador detectado - Finalizando correctamente')
        const evaluacion = evaluarRespuestaInmobiliaria(data, scenario)
        evaluaciones.push(evaluacion)
        calidadTotal += evaluacion.calidad
        break
      }

      console.log(`🏠 DANIEL: "${data.response}"`)
      console.log(`📊 Fase: ${data.conversation_phase || 'N/A'}`)
      console.log(`🔍 Cliente: ${JSON.stringify(data.lead_data) || 'N/A'}`)

      // Evaluar respuesta
      const evaluacion = evaluarRespuestaInmobiliaria(data, scenario)
      evaluaciones.push(evaluacion)
      calidadTotal += evaluacion.calidad

      console.log(`⭐ Calidad: ${evaluacion.calidad}/100`)

      // Actualizar historial
      state.conversationHistory.push(
        { role: 'user', content: mensaje },
        { role: 'assistant', content: data.response }
      )

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const tiempoTotal = Date.now() - conversacionInicio
    const calidadPromedio = calidadTotal / evaluaciones.length
    const esExitoso = calidadPromedio >= 75

    console.log(`\n✅ Conversación completada en ${(tiempoTotal/1000).toFixed(1)}s`)
    console.log(`📊 Calidad promedio: ${calidadPromedio.toFixed(1)}/100`)
    console.log(`🏆 Resultado: ${esExitoso ? 'EXITOSO' : 'NECESITA MEJORA'}`)

    testingResults.conversacionesCompletadas++
    if (esExitoso) testingResults.visitasAgendadas++
    testingResults.palabrasPromedio += evaluaciones.reduce((sum, ev) => sum + ev.palabras, 0) / evaluaciones.length
    testingResults.tiempoTotal += tiempoTotal

    const detalleConversacion = {
      scenario,
      evaluaciones,
      calidadPromedio,
      tiempoTotal,
      esExitoso,
      fortalezas: evaluaciones.flatMap(ev => ev.fortalezas),
      problemas: evaluaciones.flatMap(ev => ev.problemas)
    }

    testingResults.conversacionesDetalle.push(detalleConversacion)

    return detalleConversacion

  } catch (error) {
    console.error(`❌ Error en conversación ${scenario.id}:`, error)
    return { error: error.message }
  }
}

async function ejecutarTestingCompletoInmobiliaria(numConversaciones = 20) {
  if (testingResults.isTestingActive) {
    addSystemMessage('🧪 Testing ya está en progreso')
    return
  }

  testingResults.isTestingActive = true
  setOrbState('testing')
  
  console.log(`\n🏠 INICIANDO TESTING INMOBILIARIA - ${numConversaciones} CONVERSACIONES`)
  addSystemMessage(`🧪 Iniciando testing inmobiliario: ${numConversaciones} casos`)
  
  const tiempoInicioTotal = Date.now()
  
  // Resetear métricas
  testingResults = {
    ...testingResults,
    conversacionesCompletadas: 0,
    visitasAgendadas: 0,
    interesesGenerados: 0,
    erroresAudio: 0,
    palabrasPromedio: 0,
    fasesVentas: {},
    objecionesManejadas: 0,
    contestadoresDetectados: 0,
    tiempoTotal: 0,
    conversacionesDetalle: [],
    puntosFortaleza: [],
    puntosMejora: [],
    isTestingActive: true
  }

  const escenarios = TESTING_SCENARIOS.slice(0, numConversaciones)
  
  for (let i = 0; i < escenarios.length; i++) {
    const scenario = escenarios[i]
    
    addSystemMessage(`🏠 Testing ${i + 1}/${escenarios.length}: ${scenario.nombre}`)
    
    await ejecutarConversacionTestingInmobiliaria(scenario)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // GENERAR REPORTE FINAL
  const tiempoTotalFinal = Date.now() - tiempoInicioTotal
  testingResults.tiempoTotal = tiempoTotalFinal

  console.log(`\n${'='.repeat(60)}`)
  console.log('🏠 REPORTE FINAL TESTING INMOBILIARIA DANIEL')
  console.log('='.repeat(60))

  console.log('\n📊 MÉTRICAS PRINCIPALES:')
  console.log(`✅ Conversaciones completadas: ${testingResults.conversacionesCompletadas}/${numConversaciones}`)
  console.log(`🏠 Visitas agendadas: ${testingResults.visitasAgendadas} (${(testingResults.visitasAgendadas/testingResults.conversacionesCompletadas*100).toFixed(1)}%)`)
  console.log(`📞 Contestadores detectados: ${testingResults.contestadoresDetectados}`)
  console.log(`⏱️ Tiempo total: ${(tiempoTotalFinal/1000/60).toFixed(1)} minutos`)
  console.log(`🎵 Errores de audio: ${testingResults.erroresAudio}`)

  const calidadGeneral = testingResults.conversacionesDetalle.reduce((sum, conv) => 
    sum + (conv.calidadPromedio || 0), 0) / testingResults.conversacionesCompletadas

  console.log(`\n📊 Calidad general: ${calidadGeneral.toFixed(1)}/100`)
  
  if (calidadGeneral >= 85) {
    console.log('🟢 EXCELENTE: DANIEL funciona perfectamente para inmobiliaria')
    addSystemMessage('🟢 RESULTADO: EXCELENTE - Listo para ventas')
  } else if (calidadGeneral >= 75) {
    console.log('🟡 BUENO: Funciona bien, optimizaciones menores recomendadas')
    addSystemMessage('🟡 RESULTADO: BUENO - Optimizaciones menores')
  } else {
    console.log('🔴 REQUIERE MEJORAS: Optimizaciones importantes necesarias')
    addSystemMessage('🔴 RESULTADO: REQUIERE MEJORAS')
  }

  console.log('\n✅ TESTING INMOBILIARIA COMPLETADO')
  addSystemMessage(`✅ Testing completado - Calidad: ${calidadGeneral.toFixed(1)}%`)

  testingResults.isTestingActive = false
  setOrbState('ready')

  return testingResults
}

// Funciones auxiliares

async function showSalesMetrics() {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/api/status`)
    if (response.ok) {
      const data = await response.json()
      console.log('📈 Métricas actuales:', data)
      
      addSystemMessage(`📊 MÉTRICAS INMOBILIARIA DANIEL:`)
      addSystemMessage(`🏠 Agente: ${data.agent}`)
      addSystemMessage(`🏢 Empresa: ${data.company}`)
      addSystemMessage(`📞 Metodología: ${data.methodology}`)
      addSystemMessage(`🎵 Propiedades: ${data.portfolio?.total_properties || 'N/A'}`)
      addSystemMessage(`📈 Casa Ideal: ${data.casa_ideal_mentions || '0/3'}`)
    } else {
      addSystemMessage('❌ Error obteniendo métricas')
    }
  } catch (error) {
    addSystemMessage('❌ Error consultando métricas')
  }
}

async function testDanielAudio() {
  try {
    addSystemMessage('🧪 Probando audio DANIEL...')
    
    const response = await fetch(`${API_CONFIG.baseURL}/api/chat`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({
        message: 'Test de audio',
        userName: 'TestUser',
        history: []
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.response && data.audioUrl) {
        addSystemMessage(`✅ Test exitoso - ${data.agent || 'DANIEL'}`)
        addSystemMessage(`📝 Palabras: ${data.word_count || 'N/A'}`)
        await playAudio(`${API_CONFIG.baseURL}${data.audioUrl}`)
      } else {
        addSystemMessage('❌ Test falló: Sin respuesta o audio')
      }
    } else {
      addSystemMessage('❌ Error en test de audio')
    }
  } catch (error) {
    addSystemMessage('❌ Error probando audio')
  }
}

async function updateProspectData(newData = {}) {
  try {
    // Adaptar datos para el formato de Daniel (inmobiliaria)
    const dataToUpdate = {
      first_name: newData.first_name || state.prospectName,
      property_type: newData.property_interest || state.prospectData.property_interest,
      location_preference: newData.location_preference || state.prospectData.location_preference,
      budget_range: newData.budget_range || state.prospectData.budget_range,
      ...newData
    }
    
    // Daniel no tiene endpoint específico para actualizar prospecto, 
    // pero podemos usar reset y luego enviar mensaje
    console.log('✅ Datos del prospecto actualizados localmente:', dataToUpdate)
    state.prospectData = { ...state.prospectData, ...dataToUpdate }
    
    if (!testingResults.isTestingActive) {
      addSystemMessage(`✅ Cliente actualizado: ${state.prospectData.first_name}`)
    }
  } catch (error) {
    console.error('❌ Error actualizando prospecto:', error)
  }
}

async function startTestingRapido() {
  await ejecutarTestingCompletoInmobiliaria(5)
}

async function startTestingCompleto() {
  await ejecutarTestingCompletoInmobiliaria(20)
}

function addSystemMessage(text) {
  const messageDiv = document.createElement('div')
  messageDiv.className = 'system-message'
  
  const timestamp = new Date().toLocaleTimeString()
  let emoji = '💬'
  
  if (text.includes('VISITA AGENDADA')) emoji = '🏠'
  else if (text.includes('Objeción') || text.includes('⚠️')) emoji = '⚠️'
  else if (text.includes('MÉTRICAS')) emoji = '📊'
  else if (text.includes('Error') || text.includes('❌')) emoji = '❌'
  else if (text.includes('✅') || text.includes('exitoso')) emoji = '✅'
  else if (text.includes('DANIEL')) emoji = '🏠'
  else if (text.includes('Testing') || text.includes('🧪')) emoji = '🧪'
  else if (text.includes('CONTESTADOR')) emoji = '📞'
  
  messageDiv.textContent = `${timestamp} ${emoji} ${text}`
  
  elements.systemMessages.appendChild(messageDiv)
  
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.opacity = '0'
      setTimeout(() => messageDiv.remove(), 300)
    }
  }, 10000)
  
  const messages = elements.systemMessages.querySelectorAll('.system-message')
  if (messages.length > 6) {
    messages[0].remove()
  }
  
  const category = text.includes('🏠') ? 'INMOBILIARIA' : 
                  text.includes('⚠️') ? 'OBJECTION' : 
                  text.includes('📊') ? 'METRICS' : 
                  text.includes('🧪') ? 'TESTING' : 
                  text.includes('📞') ? 'CONTESTADOR' : 'SYSTEM'
  console.log(`[${category}] ${text}`)
}

// Exportar funciones para debugging DANIEL INMOBILIARIA + TESTING
window.danielDebug = {
  state,
  elements,
  startListening,
  stopListening,
  handleInterrupt,
  addSystemMessage,
  setOrbState,
  getInitialMessage,
  testDanielAudio,
  showSalesMetrics,
  playAudio,
  updateProspectData,
  
  // Funciones específicas para inmobiliaria
  getCurrentMetrics: () => ({
    salesPhase: state.salesPhase,
    prospectAnalysis: state.prospectAnalysis,
    visitInterests: state.salesMetrics.visitInterests,
    objectionsHandled: state.salesMetrics.objectionsHandled,
    conversationLength: state.conversationHistory.length,
    avgResponseTime: state.salesMetrics.avgResponseTime,
    prospectData: state.prospectData,
    casaIdealMentions: state.salesMetrics.casaIdealMentions
  }),
  
  simulateVisitInterest: () => {
    state.salesMetrics.visitInterests++
    state.prospectAnalysis.visit_interest = true
    addSystemMessage(`🏠 SIMULACIÓN: Interés en visita #${state.salesMetrics.visitInterests}`)
    setOrbState('ready')
  },
  
  simulateObjection: () => {
    state.salesMetrics.objectionsHandled++
    state.prospectAnalysis.objections = true
    addSystemMessage(`⚠️ SIMULACIÓN: Objeción #${state.salesMetrics.objectionsHandled}`)
  },
  
  changeSalesPhase: (phase) => {
    const validPhases = ['saludo_inicial', 'preguntas_calificacion', 'proponer_visita', 'manejar_negativa']
    if (validPhases.includes(phase)) {
      state.salesPhase = phase
      addSystemMessage(`🔄 Fase de conversación cambiada a: ${phase}`)
      setOrbState('ready')
    } else {
      console.log('Fases válidas:', validPhases)
    }
  },
  
  updateProspect: (prospectData) => {
    updateProspectData(prospectData)
  },
  
  resetConversation: async () => {
    // Resetear en el servidor
    try {
      await fetch(`${API_CONFIG.baseURL}/api/reset`, {
        method: 'POST',
        headers: API_CONFIG.headers
      })
      console.log('✅ Conversación reiniciada en el servidor')
    } catch (error) {
      console.error('❌ Error reiniciando en servidor:', error)
    }
    
    // Resetear localmente
    state.conversationHistory = []
    state.salesMetrics.visitInterests = 0
    state.salesMetrics.objectionsHandled = 0
    state.salesMetrics.casaIdealMentions = 0
    state.salesPhase = 'saludo_inicial'
    state.prospectAnalysis = {
      property_type: null,
      location_interest: false,
      buying_signals: false,
      visit_interest: false,
      objections: false
    }
    state.initialMessagePlayed = false
    state.pendingInitialMessage = null
    addSystemMessage('🔄 Conversación inmobiliaria reiniciada')
    console.log('✅ Estado de conversación reiniciado')
    
    // Obtener nuevo mensaje inicial
    await getInitialMessage()
  },

  // FUNCIONES DE TESTING INTEGRADAS PARA INMOBILIARIA
  testing: {
    completo: () => startTestingCompleto(),
    rapido: () => startTestingRapido(),
    demo: () => ejecutarTestingCompletoInmobiliaria(3),
    resultados: () => testingResults,
    uno: (id) => {
      const scenario = TESTING_SCENARIOS.find(s => s.id === id)
      if (scenario) {
        return ejecutarConversacionTestingInmobiliaria(scenario)
      } else {
        console.log('❌ Escenario no encontrado. IDs disponibles: 1-20')
      }
    },
    escenarios: () => {
      console.table(TESTING_SCENARIOS.map(e => ({
        ID: e.id,
        Nombre: e.nombre,
        Tipo: e.tipo,
        Mensajes: e.mensajes.length
      })))
    },
    
    limpiar: () => {
      testingResults = {
        conversacionesCompletadas: 0,
        visitasAgendadas: 0,
        interesesGenerados: 0,
        erroresAudio: 0,
        palabrasPromedio: 0,
        fasesVentas: {},
        objecionesManejadas: 0,
        contestadoresDetectados: 0,
        tiempoTotal: 0,
        conversacionesDetalle: [],
        puntosFortaleza: [],
        puntosMejora: [],
        isTestingActive: false
      }
      addSystemMessage('🧹 Resultados de testing limpiados')
    },
    
    porTipo: (tipo) => {
      const escenariosTipo = TESTING_SCENARIOS.filter(s => s.tipo === tipo)
      if (escenariosTipo.length > 0) {
        console.log(`🎯 Testing tipo ${tipo}: ${escenariosTipo.length} escenarios`)
        return ejecutarTestingCompletoInmobiliaria(escenariosTipo.length)
      } else {
        console.log('❌ Tipo no encontrado. Tipos disponibles:', 
          [...new Set(TESTING_SCENARIOS.map(s => s.tipo))])
      }
    }
  },
  
  // Funciones específicas para inmobiliaria
  inmobiliaria: {
    // Simular diferentes tipos de respuesta del cliente
    clienteInteresadoVisita: () => {
      state.prospectAnalysis.visit_interest = true
      addSystemMessage('🏠 Cliente simulado: Quiere visitar propiedades')
    },
    
    clienteConObjeciones: () => {
      state.prospectAnalysis.objections = true
      addSystemMessage('⚠️ Cliente simulado: Tiene objeciones')
    },
    
    clienteInteresadoApartamento: () => {
      state.prospectAnalysis.property_type = 'apartamento'
      addSystemMessage('🏢 Cliente simulado: Interesado en apartamentos')
    },
    
    clienteInteresadoCasa: () => {
      state.prospectAnalysis.property_type = 'casa'
      addSystemMessage('🏠 Cliente simulado: Interesado en casas')
    },
    
    clienteInteresadoCompra: () => {
      state.prospectData.property_interest = 'comprar'
      addSystemMessage('💰 Cliente simulado: Quiere comprar')
    },
    
    clienteInteresadoArriendo: () => {
      state.prospectData.property_interest = 'arrendar'
      addSystemMessage('📄 Cliente simulado: Quiere arrendar')
    },
    
    // Actualizar datos del cliente actual
    actualizarCliente: (nombre, tipoPropiedad, ubicacion, presupuesto) => {
      const newData = {}
      if (nombre) newData.first_name = nombre
      if (tipoPropiedad) newData.property_interest = tipoPropiedad
      if (ubicacion) newData.location_preference = ubicacion
      if (presupuesto) newData.budget_range = presupuesto
      
      updateProspectData(newData)
      addSystemMessage(`👤 Cliente actualizado: ${nombre || state.prospectName}`)
    },
    
    // Agendar visita
    agendarVisita: (dia, hora) => {
      const visitData = {
        visit_scheduled: true,
        preferred_day: dia || 'Sábado',
        preferred_time: hora || '10:00am'
      }
      
      updateProspectData(visitData)
      state.salesMetrics.visitsScheduled++
      addSystemMessage(`📅 Visita agendada: ${dia || 'Sábado'} a las ${hora || '10:00am'}`)
    },
    
    // Obtener estado completo del cliente
    estadoCliente: () => {
      console.log('📋 Estado completo del cliente:')
      console.log('Nombre:', state.prospectData.first_name)
      console.log('Interés en propiedad:', state.prospectData.property_interest)
      console.log('Ubicación preferida:', state.prospectData.location_preference)
      console.log('Presupuesto:', state.prospectData.budget_range)
      console.log('Visita agendada:', state.prospectData.visit_scheduled)
      console.log('Fase actual:', state.salesPhase)
      console.log('Análisis:', state.prospectAnalysis)
      return state.prospectData
    },
    
    // Información de la inmobiliaria
    infoInmobiliaria: () => {
      console.log('🏢 Información de la inmobiliaria:')
      console.log('Nombre:', state.dealershipInfo.name)
      console.log('Ubicación:', state.dealershipInfo.address)
      console.log('Agente:', state.dealershipInfo.agent)
      console.log('Servicios:', state.dealershipInfo.services.join(', '))
      return state.dealershipInfo
    }
  }
}

// Log de inicialización
console.log('🏠 Sistema DANIEL - INMOBILIARIA CASA IDEAL inicializado')
console.log('🎯 Funciones de debugging disponibles en window.danielDebug')
console.log('📊 Métricas inmobiliarias en tiempo real activadas')
console.log('🏠 Detección de interés en visitas habilitada')
console.log('⚠️ Manejo empático de objeciones activo')
console.log('📞 Detección automática de contestadores')
console.log('🧪 Testing inmobiliario integrado')

console.log('\n📋 COMANDOS DISPONIBLES:')
console.log('• Ctrl+M: Ver métricas inmobiliarias')
console.log('• Ctrl+T: Test de audio DANIEL')
console.log('• Ctrl+R: Testing rápido (5 conversaciones)')
console.log('• Ctrl+F: Testing completo (20 conversaciones)')
console.log('• Ctrl+C: Actualizar datos del cliente')
console.log('• Espacio: Activar/Desactivar voz')
console.log('• Escape: Interrumpir')

console.log('\n🧪 COMANDOS DE TESTING:')
console.log('• danielDebug.testing.completo() - 20 conversaciones')
console.log('• danielDebug.testing.rapido() - 5 conversaciones')
console.log('• danielDebug.testing.demo() - 3 conversaciones')
console.log('• danielDebug.testing.uno(ID) - Escenario específico')
console.log('• danielDebug.testing.porTipo("TIPO") - Por tipo específico')
console.log('• danielDebug.testing.resultados() - Ver resultados')
console.log('• danielDebug.testing.escenarios() - Ver todos los escenarios')
console.log('• danielDebug.testing.limpiar() - Limpiar resultados')

console.log('\n🏠 COMANDOS INMOBILIARIOS:')
console.log('• danielDebug.inmobiliaria.actualizarCliente(nombre, tipo, ubicacion, presupuesto)')
console.log('• danielDebug.inmobiliaria.estadoCliente() - Ver estado completo')
console.log('• danielDebug.inmobiliaria.clienteInteresadoVisita() - Simular interés')
console.log('• danielDebug.inmobiliaria.clienteConObjeciones() - Simular objeciones')
console.log('• danielDebug.inmobiliaria.clienteInteresadoApartamento() - Simular interés apartamentos')
console.log('• danielDebug.inmobiliaria.clienteInteresadoCasa() - Simular interés casas')
console.log('• danielDebug.inmobiliaria.clienteInteresadoCompra() - Simular interés compra')
console.log('• danielDebug.inmobiliaria.clienteInteresadoArriendo() - Simular interés arriendo')
console.log('• danielDebug.inmobiliaria.agendarVisita(dia, hora) - Agendar visita')

console.log('\n🎯 PARA TESTING RÁPIDO:')
console.log('danielDebug.testing.rapido()')

console.log('\n🏠 PARA TESTING COMPLETO:')
console.log('danielDebug.testing.completo()')

console.log('\n📋 CLIENTE ACTUAL:')
console.log(`Nombre: ${state.prospectData.first_name}`)
console.log(`Interés: ${state.prospectData.property_interest || 'No definido'}`)
console.log(`Ubicación: ${state.prospectData.location_preference || 'No definida'}`)
console.log(`Presupuesto: ${state.prospectData.budget_range || 'No definido'}`)

console.log('\n🏢 INMOBILIARIA:')
console.log(`${state.dealershipInfo.name}`)
console.log(`${state.dealershipInfo.address}`)
console.log(`Agente: ${state.dealershipInfo.agent}`)
console.log(`Servicios: ${state.dealershipInfo.services.join(', ')}`)

console.log('\n🚀 DANIEL LISTO PARA GENERAR VISITAS INMOBILIARIAS')