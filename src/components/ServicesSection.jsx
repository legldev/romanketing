import { useEffectEvent, useRef, useState } from "react";
import { ChevronRight, Code2, Globe, Megaphone, Search, TrendingUp } from "lucide-react";

const iconByTitle = {
  "Optimización SEO": Search,
  "Paid Media": Megaphone,
  "Desarrollo estratégico": TrendingUp,
  "Redes Sociales": Globe,
  "Desarrollo Web": Code2
};

export function ServicesSection({ services }) {
  const cardRefs = useRef([]);
  const snapTimeoutRef = useRef(null);
  const isProgrammaticSnapRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const snapToCard = useEffectEvent((index, behavior = "smooth") => {
    const card = cardRefs.current[index];

    if (!card) {
      return;
    }

    isProgrammaticSnapRef.current = true;
    card.scrollIntoView({
      behavior,
      block: "nearest",
      inline: "start"
    });
    window.setTimeout(() => {
      isProgrammaticSnapRef.current = false;
    }, 220);
  });

  const handleScroll = useEffectEvent((event) => {
    if (window.innerWidth > 720) {
      return;
    }

    const track = event.currentTarget;
    const center = track.scrollLeft + track.clientWidth / 2;
    let nextIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((card, index) => {
      if (!card) {
        return;
      }

      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - center);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        nextIndex = index;
      }
    });

    setActiveIndex(nextIndex);

    window.clearTimeout(snapTimeoutRef.current);

    if (isProgrammaticSnapRef.current) {
      return;
    }

    snapTimeoutRef.current = window.setTimeout(() => {
      snapToCard(nextIndex);
    }, 120);
  });

  const scrollToCard = (index) => {
    snapToCard(index);
  };

  return (
    <section className="services-section" id="services">
      <div className="container">
        <div className="section-heading">
          <span>NUESTRA EXPERIENCIA</span>
          <h2>Soluciones digitales integrales</h2>
          <div className="section-accent" />
        </div>

        <div className="services-grid" onScroll={handleScroll}>
          {services.map((service, index) => {
            const Icon = iconByTitle[service.title] ?? Search;

            return (
              <article
                className="service-card"
                key={service.title}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
              >
                <div className="service-icon">
                  <Icon size={22} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href="#contact">
                  Saber más <ChevronRight size={16} />
                </a>
              </article>
            );
          })}
        </div>

        <div className="services-dots" aria-label="Navegación de servicios">
          {services.map((service, index) => (
            <button
              aria-label={`Ir a ${service.title}`}
              className={index === activeIndex ? "services-dot is-active" : "services-dot"}
              key={service.title}
              onClick={() => scrollToCard(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
