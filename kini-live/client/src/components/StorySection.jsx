import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ParticleWave from "./ParticleWave";

const chapters = [
  {
    kicker: "More than compliance",
    title: "Financial clarity should feel calm, not complicated.",
    copy: "We translate recurring filings, records, and regulatory requirements into clear actions you can understand and trust.",
  },
  {
    kicker: "Client-first by design",
    title: "Every detail is handled with care and accountability.",
    copy: "Accuracy, confidentiality, transparency, and timely delivery guide every engagement from the first conversation onward.",
  },
  {
    kicker: "One dependable point of contact",
    title: "Support that moves with your requirements.",
    copy: "When specialist assistance is needed, trusted partners are coordinated responsibly so quality and communication remain consistent.",
  },
];

function StoryChapter({
  chapter,
  progress,
  range,
  opacityValues = [0, 1, 1, 0],
  yValues = [42, 0, 0, -42],
  blurValues = [10, 0, 0, 10],
}) {
  const opacity = useTransform(progress, range, opacityValues);
  const y = useTransform(progress, range, yValues);
  const blur = useTransform(progress, range, blurValues);
  const filter = useTransform(blur, (value) => `blur(${value}px)`);

  return (
    <motion.div className="story-chapter" style={{ opacity, y, filter }}>
      <p className="section-kicker">{chapter.kicker}</p>
      <h2>{chapter.title}</h2>
      <p>{chapter.copy}</p>
    </motion.div>
  );
}

function StorySection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="story-section" id="approach" ref={sectionRef} aria-label="Our approach">
      <div className="story-sticky">
        <div className="story-grid" aria-hidden="true" />
        <div className="story-mark">KINi / CLARITY</div>
        <div className="story-content">
          <StoryChapter
            chapter={chapters[0]}
            progress={scrollYProgress}
            range={[0, 0.08, 0.23, 0.34]}
            opacityValues={[1, 1, 1, 0]}
            yValues={[0, 0, 0, -42]}
            blurValues={[0, 0, 0, 10]}
          />
          <StoryChapter chapter={chapters[1]} progress={scrollYProgress} range={[0.3, 0.4, 0.58, 0.68]} />
          <StoryChapter chapter={chapters[2]} progress={scrollYProgress} range={[0.64, 0.74, 0.92, 1]} />
        </div>
        <ParticleWave />
        <div className="story-fade" aria-hidden="true" />
        <div className="scroll-indicator" aria-hidden="true">
          <span />
          Scroll to reveal
        </div>
      </div>
    </section>
  );
}

export default StorySection;
