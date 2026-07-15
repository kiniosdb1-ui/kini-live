import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Seo from "./components/Seo";
import { routeMeta } from "./seo";

const ServicesShowcase = lazy(() => import("./components/ServicesShowcase"));
const FaqSection = lazy(() => import("./components/FaqSection"));
const ConsultationModal = lazy(() => import("./components/ConsultationModal"));
const PremiumSections = lazy(() => import("./components/PremiumSections"));

const navItems = [
  { label: "Services", target: "services", path: "/services" },
  { label: "About", target: "about", path: "/about" },
  { label: "FAQs", target: "faqs", path: "/faqs" },
  { label: "Contact", target: "contact", path: "/contact" },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState(routeMeta[window.location.pathname] ? window.location.pathname : "/");
  const [renderServices, setRenderServices] = useState(window.location.pathname === "/services");
  const [renderFaqs, setRenderFaqs] = useState(window.location.pathname === "/faqs");
  const servicesPlaceholderRef = useRef(null);
  const faqsPlaceholderRef = useRef(null);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (renderServices && renderFaqs) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === servicesPlaceholderRef.current) setRenderServices(true);
          if (entry.target === faqsPlaceholderRef.current) setRenderFaqs(true);
        });
      },
      { rootMargin: "0px", threshold: 0.01 },
    );

    if (!renderServices && servicesPlaceholderRef.current) observer.observe(servicesPlaceholderRef.current);
    if (!renderFaqs && faqsPlaceholderRef.current) observer.observe(faqsPlaceholderRef.current);
    return () => observer.disconnect();
  }, [renderServices, renderFaqs]);

  useEffect(() => {
    const scrollToCurrentRoute = () => {
      const route = routeMeta[window.location.pathname] || routeMeta["/"];
      setCurrentPath(routeMeta[window.location.pathname] ? window.location.pathname : "/");
      if (route.target === "services") setRenderServices(true);
      if (route.target === "faqs") setRenderFaqs(true);
      const targetSelector = window.location.hash || `#${route.target}`;
      const target = document.querySelector(targetSelector);
      if (!target) return;
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ block: "start" });
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      });
    };

    scrollToCurrentRoute();
    window.addEventListener("popstate", scrollToCurrentRoute);
    return () => window.removeEventListener("popstate", scrollToCurrentRoute);
  }, []);

  const scrollToSection = useCallback((targetId, pathname = "/") => {
    if (targetId === "services") setRenderServices(true);
    if (targetId === "faqs") setRenderFaqs(true);
    const target = document.getElementById(targetId);
    if (!target) return;

    if (window.location.pathname !== pathname) {
      window.history.pushState(null, "", pathname);
    }
    setCurrentPath(routeMeta[pathname] ? pathname : "/");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }, []);

  const openConsultation = useCallback((service = "") => {
    import("./components/ConsultationModal");
    setSelectedService(service);
    setConsultationOpen(true);
  }, []);

  const closeConsultation = useCallback(() => setConsultationOpen(false), []);

  return (
    <div className="site-shell">
      <Seo pathname={currentPath} />
      <header className={scrolled ? "site-header scrolled" : "site-header"}>
        <a className="brand-lockup" href="/" onClick={(event) => { event.preventDefault(); scrollToSection("home", "/"); }} aria-label="Kini Outsourcing Services home">
          <img src="/kini-logo.jpeg" alt="KINi Outsourcing Services logo" width="50" height="42" fetchPriority="high" decoding="async" />
          <span><strong>KINi</strong><small>Tax Consultant</small></span>
        </a>

        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.target} href={item.path} onClick={(event) => { event.preventDefault(); scrollToSection(item.target, item.path); }}>{item.label}</a>
          ))}
        </nav>

        <div className="header-actions">
          <a className="icon-button" href="/admin" aria-label="Open secure admin panel"><UserRound size={19} /></a>
          <button className="header-cta" type="button" onClick={() => openConsultation()}>Consult now</button>
          <button className="menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <img className="hero-watermark" src="/kini-logo.jpeg" alt="" aria-hidden="true" fetchPriority="high" decoding="async" />
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-content hero-reveal">
            <p className="hero-eyebrow">
              KINi Outsourcing Services <span /> Tax Consultant
            </p>
            <h1>
              <span>Clarity for </span><span>every</span> <em>financial move.</em>
            </h1>
            <p className="hero-copy">
              Reliable accounting, tax, GST, TDS, incorporation, licensing, and compliance support built around accuracy, confidentiality, and timely delivery.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => openConsultation()}>
                Request consultation <ArrowUpRight size={18} />
              </button>
              <a className="secondary-button" href="https://wa.me/919920515701?text=Hello%20Kini%20Outsourcing%20Services%2C%20I%20would%20like%20to%20discuss%20a%20service." target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </div>

          <div className="hero-proof hero-proof-reveal">
            <div><ShieldCheck size={18} /><span>Confidential</span></div>
            <div><CheckCircle2 size={18} /><span>Accurate</span></div>
            <div><Clock3 size={18} /><span>Deadline-aware</span></div>
          </div>

          <button className="hero-scroll" type="button" onClick={() => scrollToSection("services", "/services")} aria-label="Scroll to services">
            Services <ArrowDownRight size={17} />
          </button>
        </section>

        {renderServices ? (
          <Suspense fallback={<section className="services-section services-loading" id="services" aria-hidden="true" />}>
            <ServicesShowcase onConsult={openConsultation} />
          </Suspense>
        ) : (
          <section className="services-section services-loading" id="services" ref={servicesPlaceholderRef} aria-hidden="true" />
        )}

        <Suspense fallback={null}>
          <PremiumSections />
        </Suspense>

        <section className="about-section" id="about">
          <div className="about-image-wrap scroll-reveal">
            <img src="/hariom-pandey.jpeg" alt="Hariom M. Pandey, Founder and Tax Consultant at KINi Outsourcing Services" loading="lazy" decoding="async" />
            <div className="about-image-label"><span>Founder profile</span> Direct, accountable support</div>
          </div>
          <div className="about-copy scroll-reveal reveal-delay">
            <p className="section-kicker">About the consultant</p>
            <h2>Hariom M. Pandey</h2>
            <p className="about-role">Founder & Tax Consultant</p>
            <p>
              Kini Outsourcing Services is built around a simple promise: clients deserve financial and compliance support that is accurate, clear, confidential, and delivered responsibly.
            </p>
            <p>
              Every requirement is reviewed carefully, explained practically, and coordinated with accountability. When specialist assistance is needed, trusted outsourcing partners are engaged without compromising service quality.
            </p>
            <div className="about-principles">
              <span>Trust</span><span>Integrity</span><span>Accuracy</span><span>Performance</span>
            </div>
            <button type="button" className="text-action" onClick={() => openConsultation()}>
              Consult with Hariom <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>
        </section>

        {renderFaqs ? (
          <Suspense fallback={<section className="faq-section faq-loading" id="faqs" aria-hidden="true" />}>
            <FaqSection />
          </Suspense>
        ) : (
          <section className="faq-section faq-loading" id="faqs" ref={faqsPlaceholderRef} aria-hidden="true" />
        )}

        <section className="contact-section" id="contact">
          <div>
            <p className="section-kicker">Start a conversation</p>
            <h2>Let's make the next requirement clearer.</h2>
            <p>Choose a secure consultation request or speak directly on WhatsApp.</p>
          </div>
          <div className="contact-actions">
            <button className="primary-button" type="button" onClick={() => openConsultation()}>Request consultation <ArrowUpRight size={18} /></button>
            <a href="tel:+919920515701"><Phone size={18} /> +91 9920515701</a>
            <a href="mailto:kinioutsourcingservices@gmail.com"><Mail size={18} /> kinioutsourcingservices@gmail.com</a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <img src="/kini-logo.jpeg" alt="KINi Outsourcing Services logo" loading="lazy" decoding="async" />
          <p>KINi OUTSOURCING SERVICES<br /><span>Tax Consultant</span></p>
        </div>
        <p>Your Trusted Partner for Financial Clarity</p>
        <p>(c) {currentYear} Kini Outsourcing Services<br /><span className="developer-credit">Developed and Design by Kushal Shukla</span></p>
      </footer>

      {consultationOpen && (
        <Suspense fallback={null}>
          <ConsultationModal
            isOpen={consultationOpen}
            onClose={closeConsultation}
            initialService={selectedService}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
