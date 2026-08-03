# IMPERIO SHOPIFY AI v9 - INSTALACIÓN REAL

## Requisitos del sistema

1. **Python 3.10+** → https://python.org
2. **Node.js 18+** → https://nodejs.org
3. **MongoDB** → https://mongodb.com (local o Atlas gratis)

## Instalación en 3 pasos

### Paso 1: Clonar/descomprimir el proyecto
```bash
unzip imperio-shopify-real-v9-IMASD.zip
cd tiendas-shopify-auto-nuevo-main
```

### Paso 2: Configurar .env
```bash
cp backend/.env.example backend/.env
# Edita backend/.env con tus credenciales:
# - MONGO_URL (MongoDB local o Atlas)
# - DB_NAME (nombre de la base de datos)
# - EMERGENT_LLM_KEY (de emergentagent.com)
# - SHOPIFY_DOMAIN y SHOPIFY_ACCESS_TOKEN (opcional, se puede hacer desde el dashboard)

cp frontend/.env.example frontend/.env
# Por defecto apunta a http://localhost:8001
```

### Paso 3: Arrancar todo
```bash
python3 start.py
```

Esto automáticamente:
1. Verifica Python, MongoDB y .env
2. Instala dependencias de Python (pip install)
3. Instala dependencias de Node.js (npm install)
4. Arranca el backend en http://localhost:8001
5. Arranca el frontend en http://localhost:3000

## URLs

- **Dashboard:** http://localhost:3000
- **API:** http://localhost:8001/api
- **Docs API:** http://localhost:8001/docs

## Instalación manual (si start.py falla)

### Backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend (en otra terminal)
```bash
cd frontend
npm install
npm start
```

## Configuración desde el dashboard

Una vez arrancado, abre http://localhost:3000:

1. **Pestaña 24/7** → Click "ACTIVAR SISTEMA 24/7" con tu Shopify
2. **Pestaña Conectores** → Conecta PayPal, Stripe, Telegram, etc.
3. **Pestaña IMASD** → Click "Reunión de agentes" para buscar beneficios
4. **Pestaña Wallet** → Conecta Wise, Nordigen, registra tarjetas
5. **Pestaña Suscripciones** → Configura auto-pay de Shopify

## Cómo obtener cada credencial (todas gratuitas)

| Servicio | Cómo obtener | Coste |
|----------|-------------|-------|
| MongoDB | Local: `apt install mongodb` o Atlas: cloud.mongodb.com | Gratis |
| Emergent LLM | emergentagent.com (registro) | Gratis con créditos iniciales |
| Shopify | Admin → Apps → Desarrollador → App privada | Tu plan Shopify |
| PayPal | developer.paypal.com → Apps | Gratis |
| Stripe | dashboard.stripe.com → API Keys | Gratis |
| Telegram | @BotFather → /newbot | Gratis |
| Discord | discord.com → Config → Integraciones → Webhook | Gratis |
| Mastodon | Tu instancia → Config → Desarrollo | Gratis |
| Wise | wise.com/api → API Key | Gratis |
| Nordigen | nordigen.com → Registro | Gratis (Open Banking) |
| Reddit | reddit.com/prefs/apps | Gratis |
| Resend | resend.com → API Keys | Gratis (100 emails/día) |
| Klaviyo | klaviyo.com | Gratis (hasta 250 contactos) |
| Mailchimp | mailchimp.com | Gratis (hasta 500 contactos) |
| Slack | api.slack.com → Incoming Webhook | Gratis |
| Notion | notion.so → Integrations | Gratis |
| WhatsApp | business.facebook.com/whatsapp | Gratis |

## Solución de problemas

### MongoDB no arranca
```bash
# Linux
sudo systemctl start mongodb
# Mac
brew services start mongodb-community
# Windows
net start MongoDB
```

### Error "MONGO_URL not set"
Edita `backend/.env` y pone `MONGO_URL=mongodb://localhost:27017`

### Error "EMERGENT_LLM_KEY not set"
Regístrate en emergentagent.com, copia tu API key en backend/.env

### Frontend no carga
```bash
cd frontend
npm install
npm start
```

### Backend no arranca
```bash
cd backend
pip install -r requirements.txt
python server.py
# Mira el error en consola
```

## Sistema 24/7

Una vez configurado, el sistema trabaja solo:
- 23 tareas automáticas en background
- 10 agentes buscando beneficio cada 4h (IMASD)
- Auto-pricing, auto-restock, auto-customer-service
- Atención al cliente automática
- Procesamiento de pedidos automático
- Informes diarios y semanales a Slack/Telegram

**Tú solo supervisas el dinero. Los agentes trabajan.**
