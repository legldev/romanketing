import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TurnstileWidget } from "./TurnstileWidget";

const leadEndpoint = import.meta.env.VITE_LEAD_ENDPOINT || "/api/lead";
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

const fieldDefinitions = [
  {
    label: "Nombre",
    name: "name",
    placeholder: "John Doe",
    type: "text",
    autoComplete: "name",
    maxLength: 80,
    required: true
  },
  {
    label: "Teléfono",
    name: "phone",
    placeholder: "+57 300 000 0000",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    maxLength: 20,
    required: true
  },
  {
    label: "Email",
    name: "email",
    placeholder: "john@company.com",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
    maxLength: 120,
    full: true,
    required: true
  },
  {
    label: "Nombre de empresa",
    name: "company",
    placeholder: "Empresa S.A.S",
    type: "text",
    autoComplete: "organization",
    maxLength: 120
  },
  {
    label: "Cargo",
    name: "role",
    placeholder: "Gerente de Marketing",
    type: "text",
    autoComplete: "organization-title",
    maxLength: 80
  }
];

const initialValues = {
  name: "",
  phone: "",
  email: "",
  company: "",
  role: "",
  interest: "Optimización SEO",
  website: ""
};

function validateForm(values, captchaToken) {
  const nextErrors = {};

  if (!values.name.trim()) {
    nextErrors.name = "El nombre es obligatorio.";
  }

  if (!values.phone.trim()) {
    nextErrors.phone = "El teléfono es obligatorio.";
  } else if (values.phone.replace(/[^\d]/g, "").length < 7) {
    nextErrors.phone = "Ingresa un teléfono válido.";
  }

  if (!values.email.trim()) {
    nextErrors.email = "El email es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    nextErrors.email = "Ingresa un email válido.";
  }

  if (turnstileSiteKey && !captchaToken) {
    nextErrors.captcha = "Completa el captcha para enviar el formulario.";
  }

  return nextErrors;
}

export function AuditForm({ title, description, buttonLabel, compact = false, source }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setStatus({ type: "idle", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formErrors = validateForm(values, captchaToken);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setStatus({ type: "loading", message: "Enviando tu solicitud..." });

    try {
      const response = await fetch(leadEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...values,
          source,
          captchaToken
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "No pudimos enviar el formulario.");
      }

      setStatus({
        type: "success",
        message:
          payload.message || "Gracias. Recibimos tus datos y te contactaremos pronto."
      });
      setValues(initialValues);
      setErrors({});
      setCaptchaToken("");
      setCaptchaResetKey((current) => current + 1);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Hubo un problema al enviar el formulario. Intenta nuevamente."
      });
      setCaptchaToken("");
      setCaptchaResetKey((current) => current + 1);
    }
  };

  return (
    <form
      className={`audit-form ${compact ? "audit-form-compact" : ""}`}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="form-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="form-grid">
        {fieldDefinitions.map((field) => (
          <label
            className={field.full ? "field field-full" : "field"}
            key={field.name}
          >
            <span>
              {field.label}
              {field.required ? " *" : ""}
            </span>
            <input
              autoComplete={field.autoComplete}
              className={errors[field.name] ? "input-error" : ""}
              inputMode={field.inputMode}
              maxLength={field.maxLength}
              name={field.name}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              type={field.type}
              value={values[field.name]}
            />
            {errors[field.name] ? (
              <small className="field-error">{errors[field.name]}</small>
            ) : null}
          </label>
        ))}

        <label className="field field-full">
          <span>Interés</span>
          <div className="select-wrap">
            <select name="interest" onChange={handleChange} value={values.interest}>
              <option>Optimización SEO</option>
              <option>Paid Media</option>
              <option>Desarrollo estratégico</option>
              <option>Redes Sociales</option>
              <option>Desarrollo Web</option>
            </select>
            <ChevronDown aria-hidden="true" size={18} />
          </div>
        </label>

        <label className="field field-honeypot" aria-hidden="true" tabIndex={-1}>
          <span>Sitio web</span>
          <input
            autoComplete="off"
            maxLength={120}
            name="website"
            onChange={handleChange}
            tabIndex={-1}
            type="text"
            value={values.website}
          />
        </label>
      </div>

      {turnstileSiteKey ? (
        <div className="captcha-shell">
          <TurnstileWidget
            onError={() =>
              setErrors((current) => ({
                ...current,
                captcha: "No pudimos validar el captcha. Intenta nuevamente."
              }))
            }
            onExpire={() => setCaptchaToken("")}
            onVerify={(token) => {
              setCaptchaToken(token);
              setErrors((current) => ({ ...current, captcha: "" }));
            }}
            resetKey={captchaResetKey}
            siteKey={turnstileSiteKey}
            theme="light"
          />
          {errors.captcha ? <small className="field-error">{errors.captcha}</small> : null}
        </div>
      ) : import.meta.env.DEV ? (
        <p className="form-helper">
          El captcha se activa al configurar las claves de Cloudflare Turnstile.
        </p>
      ) : null}

      <button
        className="primary-button form-submit"
        disabled={status.type === "loading"}
        type="submit"
      >
        {status.type === "loading" ? "ENVIANDO..." : buttonLabel}
      </button>

      {status.type !== "idle" ? (
        <p className={`form-status form-status-${status.type}`}>{status.message}</p>
      ) : null}
    </form>
  );
}
