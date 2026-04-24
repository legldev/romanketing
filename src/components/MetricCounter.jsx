import { useEffect, useRef, useState } from "react";

export function MetricCounter({ id, value, suffix = "", duration = 1400 }) {
  const counterRef = useRef(null);
  const sessionKey = `romanketing-metric-${id}`;
  const hasAnimated =
    typeof window !== "undefined" && window.sessionStorage.getItem(sessionKey) === "done";
  const [displayValue, setDisplayValue] = useState(hasAnimated ? value : 0);

  useEffect(() => {
    if (hasAnimated) {
      return undefined;
    }

    const node = counterRef.current;

    if (!node) {
      return undefined;
    }

    let frameId = 0;
    let animationStarted = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animationStarted) {
          return;
        }

        animationStarted = true;
        const startedAt = performance.now();

        const tick = (timestamp) => {
          const progress = Math.min((timestamp - startedAt) / duration, 1);
          const eased = 1 - (1 - progress) * (1 - progress) * (1 - progress);
          setDisplayValue(Math.round(value * eased));

          if (progress < 1) {
            frameId = window.requestAnimationFrame(tick);
            return;
          }

          window.sessionStorage.setItem(sessionKey, "done");
        };

        frameId = window.requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.45 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, hasAnimated, sessionKey, value]);

  return (
    <strong ref={counterRef}>
      {displayValue}
      {suffix}
    </strong>
  );
}
