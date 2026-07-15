import { motion } from "framer-motion";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  FileText,
  Headphones,
  IndianRupee,
  LockKeyhole,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
  UsersRound,
  Workflow,
} from "lucide-react";
import { memo, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const howSteps = [
  { title: "Contact Us", text: "Share your requirement through a quick consultation request or WhatsApp.", icon: MessageCircle },
  { title: "Share Documents", text: "Send the required papers securely so the work can begin with clarity.", icon: FileText },
  { title: "Expert Processing", text: "Your filings, records, and compliance tasks are reviewed with care.", icon: Workflow },
  { title: "Service Delivered", text: "You receive completed work with clear communication and next steps.", icon: BadgeCheck },
];

const reasons = [
  { title: "Experienced Professionals", icon: BriefcaseBusiness },
  { title: "Fast Turnaround", icon: Clock3 },
  { title: "Secure & Confidential", icon: LockKeyhole },
  { title: "Affordable Pricing", icon: IndianRupee },
  { title: "Dedicated Support", icon: Headphones },
  { title: "Accurate Compliance", icon: ShieldCheck },
  { title: "Online & Offline Assistance", icon: UploadCloud },
  { title: "Long-Term Partnership", icon: UsersRound },
];

const processSteps = [
  "Requirement Analysis",
  "Document Collection",
  "Processing & Verification",
  "Submission & Completion",
  "Delivery & Ongoing Support",
];

const revealGroup = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

const revealItem = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.16, 1, 0.3, 1] } },
};

function PremiumIllustration({ type = "process" }) {
  const src = type === "choose" ? "/kini-growth-illustration.svg" : "/kini-process-illustration.svg";
  const alt = type === "choose"
    ? "Premium compliance support dashboard illustration"
    : "Business documents and compliance workflow illustration";

  return (
    <motion.div
      className="premium-illustration"
      initial={{ opacity: 0, y: 28, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      <img src={src} alt={alt} loading="lazy" decoding="async" width="520" height="420" />
      <span className="premium-illustration-pulse" aria-hidden="true" />
    </motion.div>
  );
}

function SpotlightCard({ children, className = "" }) {
  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <motion.article
      className={`premium-card spotlight-card ${className}`}
      variants={revealItem}
      onPointerMove={handlePointerMove}
    >
      {children}
    </motion.article>
  );
}

function HowItWorksSection() {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current || !lineRef.current) return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(min-width: 1021px)", () => {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              end: "bottom 62%",
              scrub: 0.7,
            },
          },
        );
      });

      media.add("(max-width: 1020px)", () => {
        gsap.fromTo(
          lineRef.current,
          { height: "0%" },
          {
            height: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 72%",
              end: "bottom 38%",
              scrub: 0.35,
            },
          },
        );
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section className="premium-section how-section" ref={sectionRef} aria-labelledby="how-it-works-title">
      <div className="premium-section-bg" aria-hidden="true" />
      <div className="premium-section-head">
        <p className="section-kicker">Client journey</p>
        <motion.h2
          id="how-it-works-title"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        >
          How It Works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.62, delay: 0.08 }}
        >
          From your first inquiry to final delivery, we make tax and business compliance simple and hassle-free.
        </motion.p>
      </div>

      <div className="how-layout">
        <PremiumIllustration />
        <div className="how-timeline-wrap">
          <div className="how-timeline-track" aria-hidden="true">
            <span ref={lineRef} />
          </div>
          <motion.div
            className="how-cards"
            variants={revealGroup}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.22 }}
          >
            {howSteps.map(({ title, text, icon: Icon }, index) => (
              <SpotlightCard key={title} className="how-card">
                <span className="premium-card-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="premium-icon"><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </SpotlightCard>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(max-width: 1020px)", () => {
        gsap.utils.toArray(".choose-card").forEach((card, index) => {
          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 28,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 86%",
                toggleActions: "play none none reverse",
                onEnter: () => card.classList.add("active"),
                onLeaveBack: () => card.classList.remove("active"),
              },
            },
          );
        });
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section className="premium-section choose-section" ref={sectionRef} aria-labelledby="why-choose-title">
      <div className="choose-layout">
        <div>
          <div className="premium-section-head align-left">
            <p className="section-kicker">Why clients choose us</p>
            <motion.h2
              id="why-choose-title"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
            >
              Why Choose KINi Outsourcing Services?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.62, delay: 0.08 }}
            >
              Professional expertise, transparent pricing, secure processes, and long-term business support.
            </motion.p>
          </div>
          <PremiumIllustration type="choose" />
        </div>

        <motion.div
          className="choose-grid"
          variants={revealGroup}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.16 }}
        >
          {reasons.map(({ title, icon: Icon }) => (
            <SpotlightCard key={title} className="choose-card">
              <div className="premium-icon floating-icon"><Icon size={21} /></div>
              <h3>{title}</h3>
              <p>Reliable support shaped around accuracy, communication, and responsible delivery.</p>
            </SpotlightCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function OurProcessSection() {
  const sectionRef = useRef(null);
  const progressRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    if (!sectionRef.current || !progressRef.current) return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(min-width: 1021px)", () => {
        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 68%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          },
        );
      });

      media.add("(max-width: 1020px)", () => {
        gsap.fromTo(
          progressRef.current,
          { height: "0%" },
          {
            height: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 72%",
              end: "bottom 34%",
              scrub: 0.35,
            },
          },
        );

        cardRefs.current.forEach((card, index) => {
          if (!card) return;
          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 28,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 86%",
                toggleActions: "play none none reverse",
                onEnter: () => card.classList.add("active"),
                onLeaveBack: () => card.classList.remove("active"),
              },
            },
          );
        });
      });

      media.add("(min-width: 1021px)", () => {
        cardRefs.current.forEach((card, index) => {
          if (!card) return;
          gsap.fromTo(
            card,
            { opacity: 0, x: index % 2 === 0 ? -36 : 36 },
            {
              opacity: 1,
              x: 0,
              duration: 0.72,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 82%",
                toggleActions: "play none none reverse",
                onEnter: () => card.classList.add("active"),
                onLeaveBack: () => card.classList.remove("active"),
              },
            },
          );
        });
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section className="premium-section process-section" ref={sectionRef} aria-labelledby="our-process-title">
      <div className="process-particles" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <div className="premium-section-head">
        <p className="section-kicker">Our process</p>
        <motion.h2
          id="our-process-title"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        >
          Our Process
        </motion.h2>
      </div>

      <div className="process-timeline">
        <div className="process-line" aria-hidden="true"><span ref={progressRef} /></div>
        {processSteps.map((step, index) => (
          <article
            className="process-card premium-card"
            key={step}
            ref={(element) => { cardRefs.current[index] = element; }}
          >
            <span className="process-dot" aria-hidden="true" />
            <span className="premium-card-number">{String(index + 1).padStart(2, "0")}</span>
            <h3>{step}</h3>
            <p>{index === processSteps.length - 1
              ? "Completed work is delivered clearly, with support for future compliance needs."
              : "Each stage is handled with transparent communication and careful verification."}
            </p>
            <RotateCcw size={17} aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}

function PremiumSections() {
  return (
    <>
      <HowItWorksSection />
      <WhyChooseSection />
      <OurProcessSection />
    </>
  );
}

export default memo(PremiumSections);
