import { useEffect, useEffectEvent, useRef } from "react";

let turnstileScriptPromise;

function loadTurnstileScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile solo puede cargarse en el navegador."));
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-turnstile-script='true']");

      if (existing) {
        existing.addEventListener("load", () => resolve(window.turnstile), {
          once: true
        });
        existing.addEventListener("error", () => reject(new Error("No se pudo cargar Turnstile.")), {
          once: true
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstileScript = "true";
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => reject(new Error("No se pudo cargar Turnstile."));
      document.head.append(script);
    });
  }

  return turnstileScriptPromise;
}

export function TurnstileWidget({ onError, onExpire, onVerify, resetKey, siteKey, theme }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const emitVerify = useEffectEvent((token) => onVerify?.(token));
  const emitExpire = useEffectEvent(() => onExpire?.());
  const emitError = useEffectEvent(() => onError?.());

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return undefined;
    }

    let cancelled = false;

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        containerRef.current.innerHTML = "";

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token) => emitVerify(token),
          "expired-callback": () => emitExpire(),
          "error-callback": () => emitError()
        });
      })
      .catch(() => emitError());

    return () => {
      cancelled = true;

      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [emitError, emitExpire, emitVerify, resetKey, siteKey, theme]);

  return <div className="captcha-slot" ref={containerRef} />;
}
