import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { google } from "googleapis";

const defaultRecipientEmail = process.env.LEAD_RECIPIENT_EMAIL || "clientes@romanketing.com";
const sheetName = process.env.GOOGLE_SHEET_TAB || "Leads";
const sheetHeader = [
  "Fecha de envío",
  "Origen",
  "Nombre",
  "Teléfono",
  "Email",
  "Nombre de empresa",
  "Cargo",
  "Interés",
  "Fingerprint"
];

function jsonResponse(status, body) {
  return {
    status,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body)
  };
}

function parseRequestBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    return JSON.parse(body);
  }

  return body;
}

function normalizeValue(value) {
  return String(value || "").trim();
}

function sanitizeLead(rawLead) {
  const lead = {
    name: normalizeValue(rawLead.name),
    phone: normalizeValue(rawLead.phone),
    email: normalizeValue(rawLead.email).toLowerCase(),
    company: normalizeValue(rawLead.company),
    role: normalizeValue(rawLead.role),
    interest: normalizeValue(rawLead.interest) || "Optimización SEO",
    source: normalizeValue(rawLead.source) || "landing",
    website: normalizeValue(rawLead.website),
    captchaToken: normalizeValue(rawLead.captchaToken)
  };

  const errors = {};

  if (!lead.name) {
    errors.name = "El nombre es obligatorio.";
  }

  if (!lead.phone) {
    errors.phone = "El teléfono es obligatorio.";
  } else if (lead.phone.replace(/[^\d]/g, "").length < 7) {
    errors.phone = "Ingresa un teléfono válido.";
  }

  if (!lead.email) {
    errors.email = "El email es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    errors.email = "Ingresa un email válido.";
  }

  if (lead.website) {
    errors.website = "No pudimos validar el envío.";
  }

  return {
    errors,
    lead
  };
}

function buildFingerprint(lead) {
  return createHash("sha256")
    .update(
      [
        lead.name.toLowerCase(),
        lead.email,
        lead.phone.replace(/[^\d]/g, ""),
        lead.company.toLowerCase(),
        lead.interest.toLowerCase()
      ].join("|")
    )
    .digest("hex");
}

function getRemoteIp(headers = {}, explicitIp = "") {
  const forwarded = headers["x-forwarded-for"] || headers["client-ip"] || explicitIp;
  return String(forwarded || "")
    .split(",")[0]
    .trim();
}

async function verifyTurnstileToken(token, remoteIp) {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    return { ok: true };
  }

  if (!token) {
    return { ok: false };
  }

  const formData = new URLSearchParams();
  formData.set("secret", process.env.TURNSTILE_SECRET_KEY);
  formData.set("response", token);

  if (remoteIp) {
    formData.set("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData
    }
  );

  const payload = await response.json();

  return { ok: Boolean(payload.success) };
}

function ensureInternalConfig() {
  const requiredVariables = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM_EMAIL",
    "GOOGLE_SHEET_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY"
  ];

  const missing = requiredVariables.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno para formularios: ${missing.join(", ")}.`
    );
  }
}

function getMailTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendLeadEmail(lead, submittedAt, fingerprint) {
  const transport = getMailTransport();

  await transport.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: defaultRecipientEmail,
    replyTo: lead.email,
    subject: `Nuevo lead desde Romanketing (${lead.source})`,
    text: [
      `Fecha: ${submittedAt}`,
      `Origen: ${lead.source}`,
      `Nombre: ${lead.name}`,
      `Teléfono: ${lead.phone}`,
      `Email: ${lead.email}`,
      `Empresa: ${lead.company || "-"}`,
      `Cargo: ${lead.role || "-"}`,
      `Interés: ${lead.interest}`,
      `Fingerprint: ${fingerprint}`
    ].join("\n"),
    html: `
      <h2>Nuevo lead desde Romanketing</h2>
      <p><strong>Fecha:</strong> ${submittedAt}</p>
      <p><strong>Origen:</strong> ${lead.source}</p>
      <p><strong>Nombre:</strong> ${lead.name}</p>
      <p><strong>Teléfono:</strong> ${lead.phone}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Empresa:</strong> ${lead.company || "-"}</p>
      <p><strong>Cargo:</strong> ${lead.role || "-"}</p>
      <p><strong>Interés:</strong> ${lead.interest}</p>
      <p><strong>Fingerprint:</strong> ${fingerprint}</p>
    `
  });
}

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({
    version: "v4",
    auth
  });
}

async function ensureSheetExists(sheets) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties"
  });

  const existingSheet = spreadsheet.data.sheets?.find(
    (sheet) => sheet.properties?.title === sheetName
  );

  if (existingSheet) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName
            }
          }
        }
      ]
    }
  });
}

async function readSheetRows(sheets) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:I`
  });

  return response.data.values || [];
}

async function ensureSheetHeader(sheets, rows) {
  if (rows.length > 0) {
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A1:I1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [sheetHeader]
    }
  });
}

function isDuplicate(rows, fingerprint) {
  if (rows.length < 2) {
    return false;
  }

  const recentRows = rows.slice(1).slice(-200);

  return recentRows.some((row) => row[8] === fingerprint);
}

async function appendLeadRow(sheets, lead, submittedAt, fingerprint) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A:I`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          submittedAt,
          lead.source,
          lead.name,
          lead.phone,
          lead.email,
          lead.company,
          lead.role,
          lead.interest,
          fingerprint
        ]
      ]
    }
  });
}

async function notifyWebhook(lead, submittedAt, fingerprint) {
  const response = await fetch(process.env.LEAD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...lead,
      submittedAt,
      recipientEmail: defaultRecipientEmail,
      fingerprint
    })
  });

  if (!response.ok) {
    throw new Error("El webhook de leads devolvió un error.");
  }
}

export async function handleLeadRequest({ method, headers, body, ip }) {
  if (method === "OPTIONS") {
    return jsonResponse(204, {});
  }

  if (method !== "POST") {
    return jsonResponse(405, {
      ok: false,
      message: "Método no permitido."
    });
  }

  let payload;

  try {
    payload = parseRequestBody(body);
  } catch {
    return jsonResponse(400, {
      ok: false,
      message: "No pudimos leer la información del formulario."
    });
  }

  const { errors, lead } = sanitizeLead(payload);

  if (Object.keys(errors).length > 0) {
    return jsonResponse(422, {
      ok: false,
      errors,
      message: errors.website || "Revisa los campos obligatorios e intenta nuevamente."
    });
  }

  const captchaCheck = await verifyTurnstileToken(
    lead.captchaToken,
    getRemoteIp(headers, ip)
  );

  if (!captchaCheck.ok) {
    return jsonResponse(400, {
      ok: false,
      message: "No pudimos validar el captcha."
    });
  }

  const fingerprint = buildFingerprint(lead);
  const submittedAt = new Date().toISOString();

  try {
    if (process.env.LEAD_WEBHOOK_URL) {
      await notifyWebhook(lead, submittedAt, fingerprint);

      return jsonResponse(200, {
        ok: true,
        message: "Gracias. Recibimos tu solicitud y te contactaremos muy pronto."
      });
    }

    ensureInternalConfig();

    const sheets = getSheetsClient();
    await ensureSheetExists(sheets);
    const rows = await readSheetRows(sheets);
    await ensureSheetHeader(sheets, rows);

    if (isDuplicate(rows, fingerprint)) {
      return jsonResponse(200, {
        ok: true,
        duplicate: true,
        message:
          "Ya recibimos una solicitud similar recientemente. Si necesitas actualizarla, escríbenos por correo."
      });
    }

    await Promise.all([
      sendLeadEmail(lead, submittedAt, fingerprint),
      appendLeadRow(sheets, lead, submittedAt, fingerprint)
    ]);

    return jsonResponse(200, {
      ok: true,
      message: "Gracias. Recibimos tu solicitud y te contactaremos muy pronto."
    });
  } catch (error) {
    console.error("[lead-handler]", error);

    return jsonResponse(500, {
      ok: false,
      message:
        "El formulario está listo, pero faltan datos de configuración del servidor para procesar los leads."
    });
  }
}
