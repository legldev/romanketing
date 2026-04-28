import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { TurnstileWidget } from "./TurnstileWidget";

const leadEndpoint = import.meta.env.VITE_LEAD_ENDPOINT || "/api/lead";
const captchaSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

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

function getInitialCaptchaSize() {
  if (typeof window === "undefined") {
    return "flexible";
  }

  return window.matchMedia("(max-width: 560px)").matches ? "compact" : "flexible";
}

function validateForm(values) {
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

  return nextErrors;
}

export function AuditForm({ title, description, buttonLabel, compact = false, source }) {
  const isCaptchaConfigured = Boolean(captchaSiteKey);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaVersion, setCaptchaVersion] = useState(0);
  const [captchaSize, setCaptchaSize] = useState(getInitialCaptchaSize);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 560px)");
    const syncCaptchaSize = (event) => {
      setCaptchaSize(event.matches ? "compact" : "flexible");
    };

    setCaptchaSize(mediaQuery.matches ? "compact" : "flexible");

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncCaptchaSize);

      return () => {
        mediaQuery.removeEventListener("change", syncCaptchaSize);
      };
    }

    mediaQuery.addListener(syncCaptchaSize);

    return () => {
      mediaQuery.removeListener(syncCaptchaSize);
    };
  }, []);

  const resetCaptcha = () => {
    setCaptchaToken("");
    setCaptchaVersion((current) => current + 1);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "", captcha: "" }));

    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formErrors = validateForm(values);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!isCaptchaConfigured) {
      setStatus({
        type: "error",
        message: "El CAPTCHA todavía no está configurado."
      });
      return;
    }

    if (!captchaToken) {
      setErrors((current) => ({
        ...current,
        captcha: "Completa el CAPTCHA antes de enviar."
      }));
      setStatus({
        type: "error",
        message: "Completa el CAPTCHA antes de enviar."
      });
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
          token: captchaToken
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (payload.errors) {
          setErrors((current) => ({ ...current, ...payload.errors }));
        }

        throw new Error(payload.message || "No pudimos enviar el formulario.");
      }

      setValues(initialValues);
      setErrors({});
      resetCaptcha();
      setStatus({
        type: "success",
        message:
          payload.message || "Gracias. Recibimos tus datos y te contactaremos pronto."
      });
    } catch (error) {
      resetCaptcha();
      setStatus({
        type: "error",
        message:
          error.message ||
          "Hubo un problema al enviar el formulario. Intenta nuevamente."
      });
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

      <div className="captcha-block">
        <p className="captcha-block__title">Protección anti-spam</p>
        {isCaptchaConfigured ? (
          <>
            <TurnstileWidget
              key={`${source}-${captchaVersion}-${captchaSize}`}
              language="es"
              onError={() => {
                setCaptchaToken("");
                setErrors((current) => ({
                  ...current,
                  captcha: "No pudimos validar el CAPTCHA. Intenta nuevamente."
                }));
              }}
              onSuccess={(token) => {
                setCaptchaToken(token || "");
                setErrors((current) => ({ ...current, captcha: "" }));

                if (status.type !== "idle") {
                  setStatus({ type: "idle", message: "" });
                }
              }}
              siteKey={captchaSiteKey}
              size={captchaSize}
              theme="light"
            />
            <p className="form-note">Protegido con Cloudflare Turnstile.</p>
          </>
        ) : (
          <p className="form-note form-note--warning">
            Configura `VITE_TURNSTILE_SITE_KEY` en el cliente y `TURNSTILE_SECRET_KEY`
            en el servidor antes de publicar.
          </p>
        )}
        {errors.captcha ? <small className="field-error">{errors.captcha}</small> : null}
      </div>

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
