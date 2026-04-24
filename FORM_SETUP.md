# Configuración de formularios

La landing ya envía ambos formularios al endpoint `/api/lead`.

## Opción A: webhook externo

Configura estas variables y conecta el webhook a Zapier, Make o tu backend:

```env
VITE_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
LEAD_WEBHOOK_URL=
LEAD_RECIPIENT_EMAIL=clientes@romanketing.com
```

El payload incluye:

- `name`
- `phone`
- `email`
- `company`
- `role`
- `interest`
- `source`
- `submittedAt`
- `recipientEmail`
- `fingerprint`

## Opción B: envío directo desde el serverless

Además del captcha, configura SMTP y Google Sheets:

```env
VITE_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
LEAD_RECIPIENT_EMAIL=clientes@romanketing.com
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
GOOGLE_SHEET_ID=
GOOGLE_SHEET_TAB=Leads
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

## Google Sheet

La hoja usa por defecto la pestaña `Leads` y crea estas columnas:

1. `Fecha de envío`
2. `Origen`
3. `Nombre`
4. `Teléfono`
5. `Email`
6. `Nombre de empresa`
7. `Cargo`
8. `Interés`
9. `Fingerprint`

## Deploy

- Vercel: usa `api/lead.js`
- Netlify: usa `netlify/functions/lead.js`
