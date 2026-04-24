import { useState } from "react";
import { Facebook, Instagram, Mail, MapPin, Phone, X, Menu } from "lucide-react";
import { AuditForm } from "./components/AuditForm";
import { BrandLogo } from "./components/BrandLogo";
import { MetricCounter } from "./components/MetricCounter";
import { ServicesSection } from "./components/ServicesSection";
import teamImage from "./assets/team-meeting.jpg";

const services = [
  {
    title: "Optimización SEO",
    description:
      "Aumenta la visibilidad orgánica e impulsa tráfico de alta calidad, para motores de búsqueda respaldados por datos."
  },
  {
    title: "Paid Media",
    description:
      "Maximiza el ROI con campañas publicitarias segmentadas en las redes de Google, Meta y TikTok."
  },
  {
    title: "Desarrollo estratégico",
    description:
      "Análisis de mercado exhaustivo y hojas de ruta de crecimiento adaptadas a tus objetivos empresariales."
  },
  {
    title: "Redes Sociales",
    description:
      "Construye una comunidad sólida y aumenta el engagement con contenido estratégico y gestión profesional."
  },
  {
    title: "Desarrollo Web",
    description:
      "Sitios web modernos, rápidos y optimizados para conversiones que reflejan la identidad de tu marca."
  }
];

const footerServices = [
  "Optimización SEO",
  "Paid Media (PPC)",
  "Desarrollo Estratégico",
  "Social Media",
  "Desarrollo de Website's"
];

const footerCompany = [
  { label: "Nosotros", href: "#about" },
  { label: "Casos de Estudio", href: "#case-studies" }
];

const metrics = [
  {
    id: "client-retention",
    value: 98,
    suffix: "%",
    label: "Retención de clientes."
  },
  {
    id: "successful-campaigns",
    value: 250,
    suffix: "+",
    label: "Campañas exitosas."
  }
];

function TikTokIcon(props) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      {...props}
    >
      <path
        d="M14.5 3c.4 1.9 1.7 3.6 3.5 4.4a6.7 6.7 0 0 0 2.5.6v3.1a9.5 9.5 0 0 1-3-.7v5.8a6.3 6.3 0 1 1-6.3-6.3c.4 0 .8 0 1.1.1v3.2a3.1 3.1 0 1 0 2 3V3h.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="container nav-row">
          <a className="logo-link" href="#top" aria-label="Ir al inicio">
            <BrandLogo />
          </a>

          <nav className={`site-nav ${menuOpen ? "site-nav-open" : ""}`}>
            <a href="#services" onClick={() => setMenuOpen(false)}>
              Servicios
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              Nosotros
            </a>
            <a href="#case-studies" onClick={() => setMenuOpen(false)}>
              Casos de Estudio
            </a>
            <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>
              Contáctanos
            </a>
          </nav>

          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="menu-toggle"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <h1>
                <span className="hero-line">Impulsa tu marca</span>
                <span className="hero-line hero-line-accent">
                  con <span>Marketing</span> Estratégico
                </span>
              </h1>
              <p>
                Combinamos la visión creativa con una estrategia basada en datos para
                elevar tu presencia digital. SEO, SEM, redes y crecimiento integral
                para empresas.
              </p>
              <div className="hero-actions">
                <a className="primary-button" href="#services">
                  Explorar Servicios
                </a>
                <a className="secondary-button" href="#about">
                  ¿Quiénes Somos?
                </a>
              </div>
            </div>

            <div className="hero-form-card" id="contact">
              <AuditForm
                compact
                buttonLabel="SOLICITAR AUDITORÍA"
                description="Completa el formulario y nuestro equipo se pondrá en contacto contigo"
                source="hero"
                title="Obtén tu auditoría gratuita"
              />
            </div>
          </div>
        </section>

        <ServicesSection services={services} />

        <section className="about-section" id="about">
          <div className="container about-grid">
            <div className="about-image-wrap">
              <img alt="Equipo de Romanketing en reunión de estrategia" src={teamImage} />
            </div>

            <div className="about-copy">
              <h2>
                Mas que una agencia,
                <br />
                Somos Aliados
              </h2>
              <p>
                En <strong>Romanketing</strong>, creemos en el poder de la conexión
                auténtica. Nuestro equipo de artesanos digitales diseña estrategias
                personalizadas que resuenan con su audiencia e impulsan una interacción
                significativa.
              </p>
              <p>
                Fundados bajo principios de transparencia y excelencia, navegamos por el
                complejo panorama digital para que usted pueda enfocarse en lo que mejor
                sabe hacer: <strong>dirigir su negocio.</strong>
              </p>

              <div className="stats-grid" id="case-studies">
                {metrics.map((metric) => (
                  <div key={metric.id}>
                    <MetricCounter
                      id={metric.id}
                      suffix={metric.suffix}
                      value={metric.value}
                    />
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-card-wrap">
            <div className="cta-card">
              <AuditForm
                buttonLabel="ENVIAR SOLICITUD DE AUDITORÍA"
                description="Completa tus datos para recibir una auditoría personalizada y empezar a crecer estratégicamente."
                source="footer"
                title="¿Listo para transformar tu negocio?"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <BrandLogo footer />
            <p>#RompemosConElAlgoritmo</p>
            <div className="social-links" aria-label="Redes sociales">
              <a
                href="https://www.facebook.com/profile.php?id=61581816820600"
                aria-label="Facebook"
                rel="noreferrer"
                target="_blank"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://www.instagram.com/somos.romanketing/"
                aria-label="Instagram"
                rel="noreferrer"
                target="_blank"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.tiktok.com/@somos.romanketing"
                aria-label="TikTok"
                rel="noreferrer"
                target="_blank"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          <div>
            <h4>Servicios</h4>
            <ul>
              {footerServices.map((item) => (
                <li key={item}>
                  <a href="#services">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Empresa</h4>
            <ul>
              {footerCompany.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Hablemos</h4>
            <ul className="contact-list">
              <li>
                <MapPin size={15} />
                <span>Calle 94 #16-29; Bogotá D.C.; Cundinamarca; Colombia.</span>
              </li>
              <li>
                <Phone size={15} />
                <span>+57 310 224 4517</span>
              </li>
              <li>
                <Mail size={15} />
                <span>clientes@romanketing.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© 2025 Romanketing. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#top">Privacy Policy</a>
            <a href="#top">Terms of Service</a>
            <a href="#top">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
