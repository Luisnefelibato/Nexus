# 📚 DOCUMENTACIÓN COMPLETA - CAMILO REFINADO 2.0

**Sistema de Ventas con IA - SPIN Selling + Audio Colombiano**

---

## 📖 TABLA DE CONTENIDOS

1. [Manual de Uso](#manual-de-uso)
2. [Guía de Troubleshooting](#guía-de-troubleshooting)
3. [Scripts de Monitoreo](#scripts-de-monitoreo)
4. [Configuración Técnica](#configuración-técnica)
5. [API Reference](#api-reference)
6. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 MANUAL DE USO

### 📋 Información General

**Camilo Refinado 2.0** es un sistema de ventas automatizado que utiliza:
- **SPIN Selling** (Situation, Problem, Implication, Need-payoff)
- **Audio colombiano profesional** con ElevenLabs
- **Análisis de intenciones** en tiempo real
- **Métricas de conversión** automáticas

### 🚀 Acceso al Sistema

#### **URLs Principales**
```
🌐 Servidor Backend: http://173.249.8.251:5000
📱 Frontend: http://localhost:3000
📊 Estado del sistema: http://173.249.8.251:5000/api/status
🎵 Test de audio: http://173.249.8.251:5000/api/test-audio
```

#### **Credenciales y Configuración**
- **Servidor**: Contabo VPS (173.249.8.251)
- **ElevenLabs Voice ID**: Ux2YbCNfurnKHnzlBHGX
- **Modelo IA**: llama3.2:latest (Ollama)
- **Velocidad Audio**: 1.8x (profesional)

### 👥 Uso para Usuarios Finales

#### **1. Inicio de Conversación**
1. Abrir frontend en localhost:3000
2. Hacer clic en la bolita dorada
3. Camilo iniciará con saludo SPIN
4. Responder usando el micrófono

#### **2. Flujo de Conversación SPIN**
```
SITUACIÓN → PROBLEMA → IMPLICACIÓN → BENEFICIO → CIERRE
```

**Ejemplo de flujo típico:**
- **Camilo**: "¿Actualmente cuenta con protección para su familia?"
- **Cliente**: "No tengo seguro"
- **Camilo**: "¿Qué pasaría con su familia si algo le ocurriera?"
- **Cliente**: "Me preocupa"
- **Camilo**: "Sin protección enfrentarían crisis económica. ¿Le daría paz mental asegurar 200 millones?"

#### **3. Controles Disponibles**
- **Espacio**: Activar/Desactivar micrófono
- **Escape**: Interrumpir audio de Camilo
- **Clic en bolita**: Alternar entre escuchar/hablar
- **Ctrl+M**: Ver métricas de conversión
- **Ctrl+T**: Test de audio

### 📊 Interpretación de Métricas

#### **Indicadores en Tiempo Real**
- **Señales de Compra**: Detectadas automáticamente
- **Fase SPIN Actual**: SITUATION/PROBLEM/IMPLICATION/NEED-PAYOFF
- **Intención del Cliente**: HOT_LEAD/OBJECTION/NEUTRAL
- **Calidad de Respuesta**: 0-100 puntos

#### **Panel de Métricas**
```
📊 Conversaciones iniciadas: XX
🔥 Señales de compra: XX
⚠️ Objeciones manejadas: XX
🏆 Cierres intentados: XX
📈 Tasa de conversión: XX%
```

### 🎯 Tarifas y Ofertas

#### **Precios por Edad (2025)**
- **20-30 años**: $80,000/mes → $200,000,000 cobertura
- **30-40 años**: $120,000/mes → $200,000,000 cobertura
- **40-50 años**: $160,000/mes → $200,000,000 cobertura
- **50+ años**: $200,000/mes → $200,000,000 cobertura

#### **Técnicas de Cierre**
- **Directo**: "¿Está listo para proteger a su familia hoy?"
- **Alternativo**: "¿Pago mensual o anual con descuento?"
- **Urgencia**: "Esta tarifa especial vence hoy"
- **Emocional**: "Imagine la tranquilidad de su familia protegida"

---

## 🔧 GUÍA DE TROUBLESHOOTING

### ❌ Problemas Comunes

#### **1. Servidor No Responde**
```bash
# Síntomas
- Frontend muestra "Sin conexión"
- HTTP 500 o timeout

# Diagnóstico
ssh root@173.249.8.251
systemctl status nexus-backend

# Solución
systemctl restart nexus-backend
systemctl enable nexus-backend
```

#### **2. Audio No Se Genera**
```bash
# Síntomas
- Respuestas de texto sin audio
- Error "Audio no disponible"

# Diagnóstico
curl -X POST http://173.249.8.251:5000/api/test-audio \
  -H "Content-Type: application/json" \
  -d '{"text": "Test de audio"}'

# Verificar ElevenLabs
grep "ELEVENLABS_API_KEY" /home/nexus-backend/server.py

# Solución
# 1. Verificar API key de ElevenLabs
# 2. Comprobar límites de ElevenLabs
# 3. Reiniciar servicio
```

#### **3. Respuestas Lentas**
```bash
# Síntomas
- Tiempo de respuesta > 5 segundos
- Timeouts frecuentes

# Diagnóstico
# Verificar carga del servidor
htop
# Verificar conexión a Ollama
curl https://nexusagent.loca.lt/api/generate

# Solución
# 1. Reiniciar Ollama tunnel
# 2. Optimizar parámetros del modelo
# 3. Limpiar archivos temporales
find /tmp/nexus_temp -name "*.mp3" -mtime +1 -delete
```

#### **4. Micrófono No Funciona**
```bash
# Síntomas
- "Micrófono bloqueado"
- No se detecta voz

# Solución
# 1. Permitir micrófono en navegador
# 2. Usar HTTPS para frontend
# 3. Verificar permisos del navegador
# 4. Probar con Chrome/Firefox
```

#### **5. Respuestas Incoherentes**
```bash
# Síntomas
- Camilo no sigue metodología SPIN
- Respuestas > 35 palabras
- No detecta intenciones

# Diagnóstico
# Verificar logs de Ollama
journalctl -u nexus-backend | grep "Ollama"

# Solución
# 1. Verificar configuración del modelo
# 2. Ajustar parámetros de temperatura
# 3. Revisar contexto SPIN
# 4. Reiniciar servicio
```

### 🚨 Códigos de Error

#### **Códigos HTTP**
- **200**: ✅ OK - Todo funcionando
- **400**: ❌ Bad Request - Datos inválidos
- **500**: ❌ Server Error - Error interno
- **503**: ❌ Service Unavailable - Servicio caído

#### **Errores de Audio**
- **"Error ElevenLabs: 401"**: API key inválida
- **"Error ElevenLabs: 429"**: Límite de requests excedido
- **"Archivo muy pequeño"**: Audio no generado correctamente

#### **Errores de IA**
- **"Error Ollama: timeout"**: Modelo no responde
- **"Error Ollama: connection"**: Túnel caído
- **"Respuesta vacía"**: Problema con el prompt

### 🔍 Logs Importantes

#### **Ubicaciones de Logs**
```bash
# Logs del servicio principal
journalctl -u nexus-backend -f

# Logs específicos por componente
grep "ElevenLabs" /var/log/nexus-backend.log
grep "Ollama" /var/log/nexus-backend.log
grep "SPIN" /var/log/nexus-backend.log
```

#### **Logs a Monitorear**
- `✅ Audio generado`: Audio funcionando
- `❌ Error ElevenLabs`: Problema con síntesis de voz
- `🎯 SEÑALES DE COMPRA`: Cliente interesado
- `⚠️ OBJECIONES DETECTADAS`: Manejar objeción

---

## 📊 SCRIPTS DE MONITOREO

### 🔄 Script de Monitoreo Automático

```bash
#!/bin/bash
# monitor_camilo.sh - Monitoreo continuo de Camilo Refinado

LOG_FILE="/var/log/camilo_monitor.log"
SERVER_URL="http://173.249.8.251:5000"

monitor_health() {
    echo "[$(date)] Iniciando verificación de salud..." >> $LOG_FILE
    
    # 1. Verificar servicio
    if systemctl is-active --quiet nexus-backend; then
        echo "[$(date)] ✅ Servicio activo" >> $LOG_FILE
    else
        echo "[$(date)] ❌ Servicio inactivo - Reiniciando..." >> $LOG_FILE
        systemctl restart nexus-backend
        sleep 5
    fi
    
    # 2. Verificar conectividad HTTP
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SERVER_URL/api/status)
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "[$(date)] ✅ HTTP OK" >> $LOG_FILE
    else
        echo "[$(date)] ❌ HTTP $HTTP_STATUS" >> $LOG_FILE
    fi
    
    # 3. Verificar audio
    AUDIO_TEST=$(curl -s -X POST $SERVER_URL/api/test-audio \
        -H "Content-Type: application/json" \
        -d '{"text": "Test automatico"}')
    
    if echo "$AUDIO_TEST" | grep -q '"success":true'; then
        echo "[$(date)] ✅ Audio OK" >> $LOG_FILE
    else
        echo "[$(date)] ❌ Audio FAIL" >> $LOG_FILE
    fi
    
    # 4. Verificar uso de memoria
    MEMORY_USAGE=$(ps aux | grep "python.*server.py" | awk '{print $4}' | head -1)
    echo "[$(date)] 📊 Memoria: ${MEMORY_USAGE}%" >> $LOG_FILE
    
    # 5. Limpiar archivos temporales antiguos
    CLEANED=$(find /tmp/nexus_temp -name "*.mp3" -mtime +1 -delete 2>/dev/null | wc -l)
    if [ "$CLEANED" -gt 0 ]; then
        echo "[$(date)] 🧹 Limpiados $CLEANED archivos" >> $LOG_FILE
    fi
}

# Ejecutar cada 5 minutos
while true; do
    monitor_health
    sleep 300
done
```

### 📈 Script de Métricas de Rendimiento

```bash
#!/bin/bash
# performance_metrics.sh - Métricas de rendimiento

collect_metrics() {
    echo "📊 MÉTRICAS DE RENDIMIENTO - $(date)"
    echo "=================================="
    
    # Métricas del servidor
    echo "🖥️ SERVIDOR:"
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "RAM: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
    echo "Disco: $(df -h / | awk 'NR==2{printf "%s", $5}')"
    
    # Métricas del servicio
    echo ""
    echo "🎯 CAMILO REFINADO:"
    METRICS=$(curl -s http://173.249.8.251:5000/api/metrics)
    echo "Conversaciones: $(echo $METRICS | jq -r '.metrics.conversations_started // 0')"
    echo "Cierres exitosos: $(echo $METRICS | jq -r '.metrics.closes_attempted // 0')"
    echo "Tasa conversión: $(echo $METRICS | jq -r '.conversion_rate // 0')%"
    
    # Estado del audio
    echo ""
    echo "🎵 AUDIO:"
    AUDIO_FILES=$(ls /tmp/nexus_temp/*.mp3 2>/dev/null | wc -l)
    echo "Archivos de audio: $AUDIO_FILES"
    
    # Logs recientes
    echo ""
    echo "📝 ACTIVIDAD RECIENTE:"
    journalctl -u nexus-backend --since "1 hour ago" | \
        grep -E "(SEÑALES DE COMPRA|OBJECIONES|Audio generado)" | \
        tail -5
}

# Generar reporte
collect_metrics > /var/log/camilo_performance_$(date +%Y%m%d_%H%M).log
```

### 🚨 Script de Alertas

```bash
#!/bin/bash
# alert_system.sh - Sistema de alertas

WEBHOOK_URL="YOUR_SLACK_WEBHOOK_HERE"  # Opcional: webhook de Slack

send_alert() {
    local message="$1"
    local severity="$2"
    
    echo "[$(date)] ALERTA [$severity]: $message" >> /var/log/camilo_alerts.log
    
    # Opcional: enviar a Slack
    if [ ! -z "$WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 Camilo Alert [$severity]: $message\"}" \
            $WEBHOOK_URL
    fi
}

check_critical_issues() {
    # 1. Verificar si el servicio está corriendo
    if ! systemctl is-active --quiet nexus-backend; then
        send_alert "Servicio nexus-backend está CAÍDO" "CRÍTICO"
    fi
    
    # 2. Verificar conectividad HTTP
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://173.249.8.251:5000/api/status)
    if [ "$HTTP_STATUS" != "200" ]; then
        send_alert "Servidor no responde HTTP (Status: $HTTP_STATUS)" "CRÍTICO"
    fi
    
    # 3. Verificar errores recientes
    ERROR_COUNT=$(journalctl -u nexus-backend --since "5 minutes ago" | grep -i error | wc -l)
    if [ "$ERROR_COUNT" -gt 5 ]; then
        send_alert "Múltiples errores detectados: $ERROR_COUNT en 5 minutos" "ALTO"
    fi
    
    # 4. Verificar uso de memoria
    MEMORY_USAGE=$(ps aux | grep "python.*server.py" | awk '{print $4}' | head -1 | cut -d'.' -f1)
    if [ "$MEMORY_USAGE" -gt 80 ]; then
        send_alert "Uso de memoria alto: ${MEMORY_USAGE}%" "MEDIO"
    fi
    
    # 5. Verificar audio ElevenLabs
    AUDIO_TEST=$(curl -s -X POST http://173.249.8.251:5000/api/test-audio \
        -H "Content-Type: application/json" \
        -d '{"text": "test"}' | grep -o '"success":[^,]*' | cut -d':' -f2)
    
    if [ "$AUDIO_TEST" != "true" ]; then
        send_alert "Sistema de audio no funciona correctamente" "ALTO"
    fi
}

# Ejecutar verificaciones cada minuto
while true; do
    check_critical_issues
    sleep 60
done
```

### 📊 Dashboard de Monitoreo

```bash
#!/bin/bash
# dashboard.sh - Dashboard en tiempo real

show_dashboard() {
    clear
    echo "🎯 DASHBOARD CAMILO REFINADO 2.0 - $(date)"
    echo "=================================================="
    
    # Estado del servicio
    if systemctl is-active --quiet nexus-backend; then
        echo "🟢 SERVICIO: ACTIVO"
    else
        echo "🔴 SERVICIO: INACTIVO"
    fi
    
    # Conectividad
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://173.249.8.251:5000/api/status)
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "🟢 HTTP: OK ($HTTP_STATUS)"
    else
        echo "🔴 HTTP: ERROR ($HTTP_STATUS)"
    fi
    
    # Métricas en tiempo real
    METRICS=$(curl -s http://173.249.8.251:5000/api/metrics 2>/dev/null)
    if [ ! -z "$METRICS" ]; then
        echo ""
        echo "📊 MÉTRICAS DE CONVERSIÓN:"
        echo "Conversaciones: $(echo $METRICS | jq -r '.metrics.conversations_started // 0')"
        echo "Señales compra: $(echo $METRICS | jq -r '.metrics.buying_signals_detected // 0')"
        echo "Objeciones: $(echo $METRICS | jq -r '.metrics.objections_handled // 0')"
        echo "Cierres: $(echo $METRICS | jq -r '.metrics.closes_attempted // 0')"
        echo "Tasa conversión: $(echo $METRICS | jq -r '.conversion_rate // 0')%"
    fi
    
    # Estado del sistema
    echo ""
    echo "🖥️ SISTEMA:"
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "RAM: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
    
    # Audio
    AUDIO_FILES=$(ls /tmp/nexus_temp/*.mp3 2>/dev/null | wc -l)
    echo "Archivos audio: $AUDIO_FILES"
    
    # Actividad reciente
    echo ""
    echo "📝 ACTIVIDAD RECIENTE:"
    journalctl -u nexus-backend --since "10 minutes ago" | \
        grep -E "(SEÑALES DE COMPRA|OBJECIONES|Audio generado)" | \
        tail -3 | while read line; do
            echo "$(echo $line | cut -d' ' -f1-3) $(echo $line | grep -o '[🎯🔥⚠️].*')"
        done
    
    echo ""
    echo "⏰ Actualizado cada 30 segundos (Ctrl+C para salir)"
}

# Mostrar dashboard cada 30 segundos
while true; do
    show_dashboard
    sleep 30
done
```

---

## ⚙️ CONFIGURACIÓN TÉCNICA

### 🔧 Configuración del Servidor

#### **Archivo de Servicio Systemd**
```ini
# /etc/systemd/system/nexus-backend.service
[Unit]
Description=Nexus Backend API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/nexus-backend
Environment=PATH=/home/nexus-backend/venv/bin
ExecStart=/home/nexus-backend/venv/bin/python server.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

#### **Variables de Entorno**
```bash
# En server.py
LOCAL_OLLAMA_URL = "https://nexusagent.loca.lt"
MODEL_NAME = "llama3.2:latest"
ELEVENLABS_API_KEY = "sk_461f0eb94d7fc7f8b2e24f6d6136824392cd88050c27eebc"
ELEVENLABS_VOICE_ID = "Ux2YbCNfurnKHnzlBHGX"
```

#### **Parámetros Optimizados del Modelo**
```python
"options": {
    "temperature": 0.8,         # Naturalidad en ventas
    "top_p": 0.9,              # Fluidez
    "num_predict": 50,         # Máximo para 35 palabras
    "repeat_penalty": 1.15,    # Evitar repeticiones
    "speaking_rate": 1.8       # Velocidad profesional
}
```

### 🌐 Configuración del Frontend

#### **Estructura de Archivos**
```
proyecto/
├── index.html          # Interfaz principal
├── src/
│   ├── main.js         # Lógica + Testing
│   └── style.css       # Estilos refinados
├── package.json        # Dependencias
└── vite.config.js      # Configuración Vite
```

#### **Configuración de Vite**
```javascript
export default defineConfig({
  server: {
    host: true,
    port: 3000
  }
})
```

---

## 🔗 API REFERENCE

### 📡 Endpoints Principales

#### **GET /api/status**
Obtiene estado del servidor y métricas básicas.

**Response:**
```json
{
  "server": "online",
  "agent": "Camilo Rueda - Vendedor Élite REFINADO",
  "version": "2.0 Optimizado",
  "voice_engine": "ElevenLabs Turbo v2.5",
  "methodology": "SPIN Selling Avanzado",
  "performance": {
    "conversations": 15,
    "buying_signals": 8,
    "closes_attempted": 5
  }
}
```

#### **GET /api/initial**
Obtiene mensaje inicial de Camilo con audio.

**Response:**
```json
{
  "message": "Buenas tardes. Soy Camilo Rueda de Seguros de Vida Asociados...",
  "audioUrl": "/api/audio/camilo_refined_abc123.mp3",
  "speaker": "Camilo Rueda - Vendedor Élite",
  "methodology": "SPIN - Situación Inicial",
  "word_count": 18
}
```

#### **POST /api/chat**
Envía mensaje y recibe respuesta SPIN con análisis.

**Request:**
```json
{
  "message": "Me interesa un seguro",
  "userName": "Carlos",
  "history": [...]
}
```

**Response:**
```json
{
  "response": "Perfecto Carlos. ¿Actualmente cuenta con algún seguro de vida?",
  "audioUrl": "/api/audio/camilo_refined_def456.mp3",
  "conversation_phase": "SITUATION",
  "intent_detected": "HOT_LEAD",
  "word_count": 12,
  "conversion_metrics": {...}
}
```

#### **GET /api/metrics**
Obtiene métricas detalladas de conversión.

**Response:**
```json
{
  "metrics": {
    "conversations_started": 25,
    "buying_signals_detected": 12,
    "objections_handled": 8,
    "closes_attempted": 15
  },
  "conversion_rate": 60.0,
  "performance": {
    "objection_handling_rate": 32.0,
    "close_attempt_ratio": 60.0
  }
}
```

### 🎵 Endpoints de Audio

#### **POST /api/test-audio**
Prueba la generación de audio.

**Request:**
```json
{
  "text": "Texto de prueba para audio"
}
```

#### **GET /api/audio/{filename}**
Sirve archivos de audio generados.

---

## ✅ MEJORES PRÁCTICAS

### 🎯 Para Vendedores

#### **Optimización de Conversiones**
1. **Dejar que Camilo lidere**: Seguir metodología SPIN
2. **Escuchar señales de compra**: Atender a indicadores automáticos
3. **No interrumpir el flujo**: Permitir secuencia completa
4. **Monitorear métricas**: Revisar tasa de conversión

#### **Manejo de Objeciones**
- **"Es muy caro"** → Camilo compara con gastos diarios
- **"Déjeme pensarlo"** → Identifica inquietud específica
- **"Ya tengo seguro"** → Evalúa cobertura actual
- **"No tengo dinero"** → Contrasta con riesgo de desprotección

### 🔧 Para Administradores

#### **Mantenimiento Preventivo**
```bash
# Verificación diaria
./dashboard.sh

# Limpieza semanal
find /tmp/nexus_temp -name "*.mp3" -mtime +7 -delete

# Backup de logs
tar -czf backup_logs_$(date +%Y%m%d).tar.gz /var/log/camilo*

# Actualización de métricas
curl http://173.249.8.251:5000/api/metrics > metrics_$(date +%Y%m%d).json
```

#### **Optimización de Rendimiento**
- **Monitorear uso de memoria**: < 80%
- **Limpiar archivos temporales**: Diario
- **Verificar conectividad a APIs**: ElevenLabs y Ollama
- **Rotar logs**: Semanal

#### **Respaldos Importantes**
- **Configuración**: `/home/nexus-backend/server.py`
- **Logs de conversión**: `/var/log/camilo_metrics.log`
- **Scripts de monitoreo**: `/usr/local/bin/monitor_camilo.sh`

### 📊 Métricas de Éxito

#### **KPIs Principales**
- **Tasa de Conversión**: > 60%
- **Tiempo de Respuesta**: < 2 segundos
- **Disponibilidad del Sistema**: > 99%
- **Calidad de Audio**: > 95% éxito

#### **Alertas Críticas**
- Servicio caído > 1 minuto
- Errores de audio > 10%
- Memoria > 90%
- Tasa de conversión < 40%

---

## 📞 SOPORTE Y CONTACTO

### 🔧 Soporte Técnico
- **Logs del Sistema**: `journalctl -u nexus-backend -f`
- **Estado en Tiempo Real**: `./dashboard.sh`
- **Reinicio de Emergencia**: `systemctl restart nexus-backend`

### 📋 Checklist de Resolución
1. ✅ Verificar estado del servicio
2. ✅ Comprobar conectividad HTTP
3. ✅ Probar generación de audio
4. ✅ Revisar logs de errores
5. ✅ Validar métricas de conversión

---

**📅 Última actualización**: $(date)  
**📋 Versión**: Camilo Refinado 2.0  
**🎯 Estado**: Producción  
**👥 Equipo**: Desarrollo IA + Ventas