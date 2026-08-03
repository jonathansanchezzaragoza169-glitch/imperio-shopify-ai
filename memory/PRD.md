# PRD — Imperio Shopify AI

## Problema original
Plataforma con 10 agentes IA "master" que crean/gestionan tiendas Shopify: 1) productos sin stock con margen, 2) automatización total, 3) aumento de capital, 4) clonación/modelado de tiendas que facturan millones, 5) finanzas, 6) automatización YouTube/TikTok, 7) edición voz/vídeo/imagen, 8) futurismo y estética de tiendas pro, 9) coordinación de ventas, 10) cerebro master dirigido por el usuario (voz o chat). El usuario es el CEO; los agentes se encargan de todo.

## Decisiones (defaults asumidos)
- IA real: Emergent LLM Key (universal) con OpenAI gpt-5.4, streaming SSE
- Shopify: SIMULADO (métricas, tiendas y actividad demo)
- Cerebro: chat + entrada de voz (Web Speech API) + TTS opcional (speechSynthesis)
- Idioma: español · Sin login

## Arquitectura
- Backend FastAPI (/app/backend/server.py): AGENTS dict con 10 agentes y system prompts en español; POST /api/agents/{id}/chat (SSE streaming, historial en MongoDB db.messages); GET /api/agents, /api/metrics (simuladas crecientes), /api/activity (feed simulado), GET/DELETE /api/agents/{id}/messages
- Frontend React: dashboard oscuro "command center" (diseño en /app/design_guidelines.json) — MetricsBar, grid de 9 AgentCard (dialog con chat propio), ActivityFeed, panel derecho CerebroPanel (chat + mic + TTS)
- emergentintegrations instalada; EMERGENT_LLM_KEY en backend/.env

## Implementado (jun 2026)
- MVP completo, testeado (iteration_1.json: 100% backend, 100% frontend)

## Backlog priorizado
- P1: Conexión real a Shopify (API Admin) cuando el usuario tenga credenciales
- P1: Sección de "tiendas" con detalle por tienda
- P2: Panel de tareas asignables entre agentes (Cerebro delega y se refleja en el feed)
- P2: Botón limpiar conversación (endpoint DELETE ya existe)
- P2: Exportar informes de finanzas
