import './style.css'

// Configuración - URL de tu servidor backend en Contabo
const SERVER_URL = 'http://173.249.8.251:5000'

// Configuración para desarrollo vs producción
const API_CONFIG = {
  // En producción (Vercel) usamos tu servidor de Contabo
  baseURL: SERVER_URL,
  // Headers adicionales para CORS
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
}

// Referencias del DOM
const elements = {
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  chatContainer: document.getElementById('chatContainer'),
  messageInput: document.getElementById('messageInput'),
  voiceBtn: document.getElementById('voiceBtn'),
  sendBtn: document.getElementById('sendBtn'),
  modeToggle: document.getElementById('modeToggle'),
  interruptBtn: document.getElementById('interruptBtn')
}

// Estado de la aplicación
const state = {
  isVoiceMode: true,
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  userName: 'Usuario',
  currentAudio: null,
  recognition: null
}

// Inicializar aplicación
init()

async function init() {
  setupEventListeners()
  await checkServerConnection()
  setupSpeechRecognition()
}

function setupEventListeners() {
  // Botón enviar
  elements.sendBtn.addEventListener('click', handleSendMessage)
  
  // Enter en input
  elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  })
  
  // Botón de voz
  elements.voiceBtn.addEventListener('click', toggleListening)
  
  // Cambiar modo
  elements.modeToggle.addEventListener('click', toggleMode)
  
  // Interrumpir
  elements.interruptBtn.addEventListener('click', handleInterrupt)
  
  // Atajos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isSpeaking) {
      handleInterrupt()
    }
  })
}

async function checkServerConnection() {
  try {
    setStatus('connecting', 'Conectando...')
    
    const response = await fetch(`${API_CONFIG.baseURL}/api/status`, {
      method: 'GET',
      headers: API_CONFIG.headers,
      mode: 'cors' // Importante para CORS
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('Servidor conectado:', data)
      
      setStatus('ready', 'Listo')
      enableInterface(true)
      
      // Mostrar mensaje del sistema
      addSystemMessage('Conectado al servidor ✅')
    } else {
      throw new Error('Servidor no disponible')
    }
  } catch (error) {
    console.error('Error de conexión:', error)
    setStatus('error', 'Sin conexión')
    addSystemMessage('Error: No se puede conectar al servidor ❌')
    addSystemMessage('Verifica que el backend esté corriendo en Contabo')
    enableInterface(false)
  }
}

function setupSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    state.recognition = new SpeechRecognition()
    
    state.recognition.lang = 'es-ES'
    state.recognition.continuous = false
    state.recognition.interimResults = false
    
    state.recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      elements.messageInput.value = text
      setStatus('ready', 'Listo')
      state.isListening = false
      
      // Enviar automáticamente
      setTimeout(() => handleSendMessage(), 500)
    }
    
    state.recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error)
      setStatus('ready', 'Listo')
      state.isListening = false
      addSystemMessage('Error al reconocer voz')
    }
    
    state.recognition.onend = () => {
      setStatus('ready', 'Listo')
      state.isListening = false
    }
  }
}

function setStatus(status, text) {
  elements.statusDot.className = `status-dot ${status}`
  elements.statusText.textContent = text
  
  // Actualizar estado
  state.isListening = status === 'listening'
  state.isProcessing = status === 'processing'
  state.isSpeaking = status === 'speaking'
}

function enableInterface(enabled) {
  elements.messageInput.disabled = !enabled
  elements.sendBtn.disabled = !enabled
  elements.voiceBtn.disabled = !enabled
  elements.modeToggle.disabled = !enabled
  elements.interruptBtn.disabled = !enabled
}

function toggleMode() {
  state.isVoiceMode = !state.isVoiceMode
  elements.modeToggle.textContent = `Modo: ${state.isVoiceMode ? 'Voz' : 'Texto'}`
  elements.voiceBtn.style.display = state.isVoiceMode ? 'flex' : 'none'
  addSystemMessage(`Cambiado a modo ${state.isVoiceMode ? 'voz' : 'texto'}`)
}

function toggleListening() {
  if (state.isListening) {
    stopListening()
  } else {
    startListening()
  }
}

function startListening() {
  if (!state.recognition) {
    addSystemMessage('Reconocimiento de voz no disponible')
    return
  }
  
  setStatus('listening', 'Escuchando...')
  state.recognition.start()
}

function stopListening() {
  if (state.recognition) {
    state.recognition.stop()
  }
  setStatus('ready', 'Listo')
}

async function handleSendMessage() {
  const message = elements.messageInput.value.trim()
  if (!message) return
  
  // Añadir mensaje del usuario
  addUserMessage(message)
  elements.messageInput.value = ''
  
  // Extraer nombre si es primera interacción
  if (document.querySelectorAll('.message.user').length === 1) {
    extractUserName(message)
  }
  
  setStatus('processing', 'Procesando...')
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/api/chat`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      mode: 'cors',
      body: JSON.stringify({
        message: message,
        userName: state.userName,
        history: getConversationHistory()
      })
    })
    
    const data = await response.json()
    
    if (data.response) {
      addAssistantMessage(data.response)
      
      if (data.audioUrl) {
        await playAudio(`${API_CONFIG.baseURL}${data.audioUrl}`)
      } else {
        setStatus('ready', 'Listo')
      }
    } else {
      addSystemMessage('Error al obtener respuesta')
      setStatus('ready', 'Listo')
    }
  } catch (error) {
    console.error('Error:', error)
    addSystemMessage('Error de conexión')
    setStatus('ready', 'Listo')
  }
}

function extractUserName(message) {
  const words = message.toLowerCase().split(' ')
  const nameIndicators = ['soy', 'llamo', 'nombre']
  
  for (let i = 0; i < words.length; i++) {
    if (nameIndicators.includes(words[i]) && words[i + 1]) {
      const name = words[i + 1]
      if (!['me', 'mi', 'yo'].includes(name)) {
        state.userName = name.charAt(0).toUpperCase() + name.slice(1)
        break
      }
    }
  }
}

async function playAudio(audioUrl) {
  return new Promise((resolve) => {
    setStatus('speaking', 'Hablando...')
    
    state.currentAudio = new Audio(audioUrl)
    
    state.currentAudio.onended = () => {
      setStatus('ready', 'Listo')
      state.currentAudio = null
      resolve()
    }
    
    state.currentAudio.onerror = () => {
      console.error('Error al reproducir audio')
      setStatus('ready', 'Listo')
      state.currentAudio = null
      resolve()
    }
    
    state.currentAudio.play().catch(error => {
      console.error('Error al reproducir audio:', error)
      setStatus('ready', 'Listo')
      state.currentAudio = null
      resolve()
    })
  })
}

async function handleInterrupt() {
  if (state.currentAudio) {
    state.currentAudio.pause()
    state.currentAudio.currentTime = 0
    state.currentAudio = null
  }
  
  try {
    await fetch(`${API_CONFIG.baseURL}/api/interrupt`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      mode: 'cors'
    })
  } catch (error) {
    console.error('Error al interrumpir:', error)
  }
  
  setStatus('ready', 'Listo')
  addSystemMessage('Respuesta interrumpida')
}

function getConversationHistory() {
  const messages = []
  const messageElements = document.querySelectorAll('.message:not(.system)')
  
  messageElements.forEach(element => {
    const isUser = element.classList.contains('user')
    const text = element.querySelector('.message-text').textContent
    
    messages.push({
      role: isUser ? 'user' : 'assistant',
      content: text
    })
  })
  
  return messages
}

function addUserMessage(text) {
  const messageDiv = document.createElement('div')
  messageDiv.className = 'message user'
  
  messageDiv.innerHTML = `
    <div class="message-author">${state.userName}</div>
    <div class="message-text">${text}</div>
  `
  
  elements.chatContainer.appendChild(messageDiv)
  scrollToBottom()
}

function addAssistantMessage(text) {
  const messageDiv = document.createElement('div')
  messageDiv.className = 'message assistant'
  
  messageDiv.innerHTML = `
    <div class="message-author">Luis</div>
    <div class="message-text">${text}</div>
  `
  
  elements.chatContainer.appendChild(messageDiv)
  scrollToBottom()
}

function addSystemMessage(text) {
  const messageDiv = document.createElement('div')
  messageDiv.className = 'message system'
  
  messageDiv.innerHTML = `
    <div class="message-text">${text}</div>
  `
  
  elements.chatContainer.appendChild(messageDiv)
  scrollToBottom()
}

function scrollToBottom() {
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight
}