import { useEffect, useEffectEvent, useRef } from "react";

function loadTurnstileScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile no está disponible en el servidor."));
  }

  if (window.turnstile?.render) {
    return Promise.resolve(window.turnstile);
  }

  if (window.__romanketingTurnstilePromise) {
    return window.__romanketingTurnstilePromise;
  }

  window.__romanketingTurnstilePromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById("romanketing-turnstile-script");

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.turnstile), {
        once: true
      });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("No se pudo cargar Turnstile.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "romanketing-turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error("No se pudo cargar Turnstile."));
    document.head.appendChild(script);
  });

  return window.__romanketingTurnstilePromise;
}

export function TurnstileWidget({
  language = "es",
  onError,
  onSuccess,
  siteKey,
  size = "flexible",
  theme = "light"
}) {
  const containerRef = useRef(null);
  const handleSuccess = useEffectEvent(onSuccess);
  const handleError = useEffectEvent(onError);

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return undefined;
    }

    let cancelled = false;
    let widgetId;

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          language,
          size,
          "response-field": false,
          callback: (token) => handleSuccess?.(token),
          "expired-callback": () => handleError?.(),
          "timeout-callback": () => handleError?.(),
          "error-callback": () => handleError?.()
        });
      })
      .catch(() => {
        handleError?.();
      });

    return () => {
      cancelled = true;

      if (widgetId !== undefined && window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [language, siteKey, size, theme]);

  return <div className="turnstile-widget" ref={containerRef} />;
}
