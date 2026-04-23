import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Code2,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Megaphone,
  Phone,
  Search,
  TrendingUp,
  X
} from "lucide-react";
import teamImage from "./assets/team-meeting.jpg";

const services = [
  {
    title: "Optimización SEO",
    description:
      "Aumenta la visibilidad orgánica e impulsa tráfico de alta calidad, para motores de búsqueda respaldados por datos.",
    icon: Search
  },
  {
    title: "Paid Media",
    description:
      "Maximiza el ROI con campañas publicitarias segmentadas en las redes de Google, Meta y TikTok.",
    icon: Megaphone
  },
  {
    title: "Desarrollo estratégico",
    description:
      "Análisis de mercado exhaustivo y hojas de ruta de crecimiento adaptadas a tus objetivos empresariales.",
    icon: TrendingUp
  },
  {
    title: "Redes Sociales",
    description:
      "Construye una comunidad sólida y aumenta el engagement con contenido estratégico y gestión profesional.",
    icon: Globe
  },
  {
    title: "Desarrollo Web",
    description:
      "Sitios web modernos, rápidos y optimizados para conversiones que reflejan la identidad de tu marca.",
    icon: Code2
  }
];

const formFields = [
  {
    label: "Nombre",
    name: "name",
    placeholder: "John Doe",
    type: "text"
  },
  {
    label: "Teléfono",
    name: "phone",
    placeholder: "+57 300 000 0000",
    type: "tel"
  },
  {
    label: "Email",
    name: "email",
    placeholder: "john@company.com",
    type: "email",
    full: true
  },
  {
    label: "Nombre de empresa",
    name: "company",
    placeholder: "Empresa S.A.S",
    type: "text"
  },
  {
    label: "Cargo",
    name: "role",
    placeholder: "Gerente de Marketing",
    type: "text"
  }
];

const footerServices = [
  "Optimización SEO",
  "Paid Media (PPC)",
  "Desarrollo Estratégico",
  "Social Media",
  "Desarrollo de Website's"
];

const footerCompany = ["About Us", "Our Team", "Case Studies", "Careers", "Contact"];

function Logo() {
  return <span className="brand-mark">Romanketing</span>;
}

function AuditForm({ title, description, buttonLabel, compact = false }) {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form
      className={`audit-form ${compact ? "audit-form-compact" : ""}`}
      onSubmit={handleSubmit}
    >
      <div className="form-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="form-grid">
        {formFields.map((field) => (
          <label
            className={field.full ? "field field-full" : "field"}
            key={field.name}
          >
            <span>{field.label}</span>
            <input name={field.name} placeholder={field.placeholder} type={field.type} />
          </label>
        ))}
        <label className="field field-full">
          <span>Interesado en</span>
          <div className="select-wrap">
            <select defaultValue="Optimización SEO" name="service">
              <option>Optimización SEO</option>
              <option>Paid Media</option>
              <option>Desarrollo estratégico</option>
              <option>Redes Sociales</option>
              <option>Desarrollo Web</option>
            </select>
            <ChevronDown aria-hidden="true" size={18} />
          </div>
        </label>
      </div>
      <button className="primary-button form-submit" type="submit">
        {buttonLabel}
      </button>
    </form>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="container nav-row">
          <a className="logo-link" href="#top" aria-label="Ir al inicio">
            <Logo />
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
                Impulsa tu marca
                <br />
                con <span>Marketing</span> Estratégico
              </h1>
              <p>
                Combinamos la visión creativa con una estrategia basada en datos para
                elevar tu presencia digital. SEO, SEM, redes y crecimiento integral
                para empresas.
              </p>
              <div className="hero-actions">
                <a className="primary-button" href="#services">
                  Explorar Servicios <ChevronRight size={18} />
                </a>
                <a className="secondary-button" href="#about">
                  ¿Quiénes Somos?
                </a>
              </div>
            </div>

            <div className="hero-form-card" id="contact">
              <AuditForm
                compact
                title="Obtén tu auditoría gratuita"
                description="Completa el formulario y nuestro equipo se pondrá en contacto contigo"
                buttonLabel="SOLICITAR AUDITORÍA"
              />
            </div>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="container">
            <div className="section-heading">
              <span>NUESTRA EXPERIENCIA</span>
              <h2>Soluciones digitales integrales</h2>
              <div className="section-accent" />
            </div>

            <div className="services-grid">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <article className="service-card" key={service.title}>
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
          </div>
        </section>

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
                <div>
                  <strong>98%</strong>
                  <span>Retención de clientes.</span>
                </div>
                <div>
                  <strong>250+</strong>
                  <span>Campañas exitosas.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-card-wrap">
            <div className="cta-card">
              <AuditForm
                title="¿Listo para transformar tu negocio?"
                description="Completa tus datos para recibir una auditoría personalizada y empezar a crecer estratégicamente."
                buttonLabel="ENVIAR SOLICITUD DE AUDITORÍA"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>#RompemosElAlgoritmo</p>
            <div className="social-links" aria-label="Redes sociales">
              <a href="https://facebook.com" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
              <a href="https://instagram.com" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="mailto:clientes@romanketing.com" aria-label="Email">
                <Mail size={16} />
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
            <h4>Compañía</h4>
            <ul>
              {footerCompany.map((item) => (
                <li key={item}>
                  <a href="#top">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Get in Touch</h4>
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
