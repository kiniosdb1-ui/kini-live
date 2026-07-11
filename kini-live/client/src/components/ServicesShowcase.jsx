import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  BadgeIndianRupee,
  Building2,
  Calculator,
  FileCheck2,
  FileText,
  Landmark,
  ReceiptText,
  UsersRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { services } from "../data";

const iconMap = {
  calculator: Calculator,
  fileText: FileText,
  receipt: ReceiptText,
  badgeIndianRupee: BadgeIndianRupee,
  building: Building2,
  users: UsersRound,
  fileCheck: FileCheck2,
  landmark: Landmark,
};

function ServiceVisual({ service }) {
  const Icon = iconMap[service.icon];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="service-visual"
        key={service.code}
        initial={{ opacity: 0, scale: 0.92, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.96, rotateX: -8 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="service-orbit service-orbit-one" />
        <div className="service-orbit service-orbit-two" />
        <span className="service-visual-code">{service.code}</span>
        <Icon size={52} strokeWidth={1.25} />
        <p>{service.short}</p>
      </motion.div>
    </AnimatePresence>
  );
}

function MobileServiceCard({ service, onConsult }) {
  const cardRef = useRef(null);
  const Icon = iconMap[service.icon];
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 88%", "end 28%"],
  });

  const cardOpacity = useTransform(scrollYProgress, [0, 0.22, 0.86, 1], [0, 1, 1, 0.74]);
  const cardX = useTransform(scrollYProgress, [0, 0.34, 1], [84, 0, -14]);
  const cardScale = useTransform(scrollYProgress, [0, 0.34, 1], [0.92, 1, 0.98]);
  const titleX = useTransform(scrollYProgress, [0.12, 0.48], [96, 0]);
  const textX = useTransform(scrollYProgress, [0.2, 0.56], [118, 0]);
  const lineScale = useTransform(scrollYProgress, [0.24, 0.72], [0, 1]);
  const iconRotate = useTransform(scrollYProgress, [0, 1], [-10, 8]);

  return (
    <article className="mobile-service-scene" ref={cardRef}>
      <motion.div
        className="mobile-service"
        style={{ opacity: cardOpacity, x: cardX, scale: cardScale }}
      >
        <div className="mobile-service-topline">
          <span>{service.code}</span>
          <motion.div style={{ rotate: iconRotate }}>
            <Icon size={28} strokeWidth={1.5} />
          </motion.div>
        </div>
        <motion.div className="mobile-service-rule" style={{ scaleX: lineScale }} />
        <motion.h3 style={{ x: titleX }}>{service.name}</motion.h3>
        <motion.p style={{ x: textX }}>{service.description}</motion.p>
        <motion.button
          type="button"
          className="text-action"
          style={{ x: textX }}
          onClick={() => onConsult(service.name)}
        >
          Discuss this service <ArrowUpRight size={15} aria-hidden="true" />
        </motion.button>
      </motion.div>
    </article>
  );
}

function ServicesShowcase({ onConsult }) {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setActiveIndex(Math.min(services.length - 1, Math.floor(value * services.length)));
  });

  const activeService = services[activeIndex];

  return (
    <section className="services-section" id="services" ref={sectionRef}>
      <div className="services-desktop">
        <div className="services-sticky">
          <div className="services-heading">
            <p className="section-kicker">Core services</p>
            <h2>Expert support, revealed one requirement at a time.</h2>
          </div>

          <div className="services-stage">
            <div className="service-index" aria-label="Services list">
              {services.map((service, index) => (
                <button
                  type="button"
                  key={service.code}
                  className={index === activeIndex ? "active" : ""}
                  onClick={() => setActiveIndex(index)}
                >
                  <span>{service.code}</span>
                  {service.name}
                </button>
              ))}
            </div>

            <div className="service-detail">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService.code}
                  initial={{ opacity: 0, x: 84, y: 18, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -48, y: -8, filter: "blur(10px)" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="detail-code">{activeService.code} / 08</span>
                  <h3>{activeService.name}</h3>
                  <p>{activeService.description}</p>
                  <ul>
                    {activeService.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button type="button" className="text-action" onClick={() => onConsult(activeService.name)}>
                    Discuss this service <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            <ServiceVisual service={activeService} />
          </div>
          <div className="services-progress" aria-hidden="true">
            <motion.span style={{ scaleX: scrollYProgress }} />
          </div>
        </div>
      </div>

      <div className="services-mobile">
        <motion.div
          className="services-heading"
          initial={{ opacity: 0, x: -72, y: 20, filter: "blur(14px)" }}
          whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="section-kicker">Core services</p>
          <h2>Expert support for every requirement.</h2>
        </motion.div>
        <div className="mobile-services-stack">
          {services.map((service) => (
            <MobileServiceCard key={service.code} service={service} onConsult={onConsult} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesShowcase;
