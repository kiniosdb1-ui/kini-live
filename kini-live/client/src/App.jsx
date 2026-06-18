import { motion } from "framer-motion";
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
import { useEffect, useState } from "react";
import ConsultationModal from "./components/ConsultationModal";
import FaqSection from "./components/FaqSection";
import ServicesShowcase from "./components/ServicesShowcase";
import StorySection from "./components/StorySection";

const navItems = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "FAQs", href: "#faqs" },
  { label: "Contact", href: "#contact" },
];

const reveal = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (target) {
      window.requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    }
  }, []);

  const openConsultation = (service = "") => {
    setSelectedService(service);
    setConsultationOpen(true);
  };

  return (
    <div className="site-shell">
      <header className={scrolled ? "site-header scrolled" : "site-header"}>
        <a className="brand-lockup" href="#home" aria-label="Kini Outsourcing Services home">
          <img src="/kini-logo.jpeg" alt="" />
          <span><strong>KINi</strong><small>Tax Consultant</small></span>
        </a>

        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
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
          <img className="hero-watermark" src="/kini-logo.jpeg" alt="" aria-hidden="true" />
          <div className="hero-glow" aria-hidden="true" />
          <motion.div className="hero-content" initial="hidden" animate="visible" transition={{ staggerChildren: 0.12 }}>
            <motion.p variants={reveal} transition={{ duration: 0.7 }} className="hero-eyebrow">
              KINi Outsourcing Services <span /> Tax Consultant
            </motion.p>
            <motion.h1 variants={reveal} transition={{ duration: 0.8 }}>
              <span>Clarity for </span><span>every</span> <em>financial move.</em>
            </motion.h1>
            <motion.p variants={reveal} transition={{ duration: 0.8 }} className="hero-copy">
              Reliable accounting, tax, GST, TDS, incorporation, licensing, and compliance support built around accuracy, confidentiality, and timely delivery.
            </motion.p>
            <motion.div variants={reveal} transition={{ duration: 0.8 }} className="hero-actions">
              <button className="primary-button" type="button" onClick={() => openConsultation()}>
                Request consultation <ArrowUpRight size={18} />
              </button>
              <a className="secondary-button" href="https://wa.me/919920515701?text=Hello%20Kini%20Outsourcing%20Services%2C%20I%20would%20like%20to%20discuss%20a%20service." target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </motion.div>
          </motion.div>

          <motion.div className="hero-proof" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}>
            <div><ShieldCheck size={18} /><span>Confidential</span></div>
            <div><CheckCircle2 size={18} /><span>Accurate</span></div>
            <div><Clock3 size={18} /><span>Deadline-aware</span></div>
          </motion.div>

          <a className="hero-scroll" href="#services" aria-label="Scroll to services">
            Explore <ArrowDownRight size={17} />
          </a>
        </section>

        <StorySection />

        <ServicesShowcase onConsult={openConsultation} />

        <section className="about-section" id="about">
          <motion.div className="about-image-wrap" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}>
            <img src="/hariom-pandey.jpeg" alt="Hariom M. Pandey, Founder and Tax Consultant" />
            <div className="about-image-label"><span>Founder profile</span> Direct, accountable support</div>
          </motion.div>
          <motion.div className="about-copy" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.12 }}>
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
          </motion.div>
        </section>

<section className="security-section">
  <div className="section-intro">
    <p className="section-kicker">Our Approach</p>
    <h2>A Clear Process. Professional Results.</h2>
    <p>
       We understand your requirements, provide expert guidance, and support
    implementation with a focus on compliance, accuracy, and long-term value.
    </p>
  </div>

  <div className="security-grid">
    <div>
      <span>01</span>
      <UserRound size={26} />
      <h3>Understanding Your Requirements</h3>
      <p>
        Every business has unique challenges and compliance needs. We begin by
        carefully understanding your objectives, current situation, and specific
        concerns to provide guidance that is practical, relevant, and aligned
        with your goals.
      </p>
    </div>

    <div>
      <span>02</span>
      <MessageCircle size={26} />
      <h3>Strategic Consultation & Planning</h3>
      <p>
        Once we understand your requirements, our experts evaluate the situation
        and recommend the most suitable course of action. We focus on clear
        communication, practical recommendations, and well-structured solutions.
      </p>
    </div>

    <div>
      <span>03</span>
      <CheckCircle2 size={26} />
      <h3>Execution, Compliance & Ongoing Support</h3>
      <p>
        Our support continues beyond consultation. We assist throughout the
        implementation process, help address compliance requirements, and remain
        available for ongoing guidance whenever needed.
      </p>
    </div>
  </div>
</section>

        <FaqSection />

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
            <img src="/kini-logo.jpeg" alt="Kini Outsourcing Services logo" />
              <p>
                KINi OUTSOURCING SERVICES
              <br />
                <span>Tax Consultant</span>
              </p>
          </div>

      <p>Your Trusted Partner for Financial Clarity</p>

        <p>(c) {new Date().getFullYear()} Kini Outsourcing Services</p>

      <p className="developer-credit">
      Designed & Developed by <strong>KUSHAL</strong>
    </p>
    </footer>

      <ConsultationModal
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        initialService={selectedService}
      />
    </div>
  );
}

export default App;
