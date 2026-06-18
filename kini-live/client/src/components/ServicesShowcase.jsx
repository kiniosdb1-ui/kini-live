import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
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
                  initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
                  transition={{ duration: 0.42 }}
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
        <div className="services-heading">
          <p className="section-kicker">Core services</p>
          <h2>Expert support for every requirement.</h2>
        </div>
        {services.map((service) => {
          const Icon = iconMap[service.icon];
          return (
            <motion.article
              className="mobile-service"
              key={service.code}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div>
                <span>{service.code}</span>
                <Icon size={28} strokeWidth={1.5} />
              </div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <button type="button" className="text-action" onClick={() => onConsult(service.name)}>
                Discuss this service <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default ServicesShowcase;
