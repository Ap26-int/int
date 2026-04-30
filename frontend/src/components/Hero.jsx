import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowRight } from "lucide-react";

const HERO_BG =
  "https://images.pexels.com/photos/13722886/pexels-photo-13722886.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1920";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const handleScroll = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const stagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 1.7 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      ref={ref}
      data-testid="hero-section"
      className="relative h-[100svh] w-full overflow-hidden bg-[hsl(var(--obsidian))]"
    >
      {/* Parallax background */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 will-change-transform"
      >
        <img
          src={HERO_BG}
          alt="Cinematic luxury living interior"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </motion.div>

      {/* Layered overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--obsidian)/0.75)] via-[hsl(var(--obsidian)/0.55)] to-[hsl(var(--obsidian))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--gold)/0.08),transparent_60%)] pointer-events-none" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full lux-container flex flex-col justify-center"
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-5xl"
        >
          {/* Overline */}
          <motion.div variants={item} className="flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-[hsl(var(--gold))]" />
            <span
              className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px] md:text-xs font-medium"
              data-testid="hero-overline"
            >
              Lumière By Sambita Bose · Est. 2012
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            data-testid="hero-headline"
            className="font-display text-[hsl(var(--ivory))] text-[2.5rem] xs:text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] leading-[0.95] tracking-[-0.02em] font-light"
          >
            Elevate your <em className="italic text-[hsl(var(--gold))]">Home</em>,
            <br />
            <span className="">Celebrity Style.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={item}
            className="mt-8 sm:mt-10 max-w-xl text-[hsl(var(--muted-foreground))] text-sm sm:text-base md:text-lg leading-relaxed font-light"
          >
            Bespoke residential interiors crafted for India's most discerning
            homeowners. Quiet luxury, considered detail, finished to a
            celebrity-grade standard.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
          >
            <button
              data-testid="hero-cta-consult"
              onClick={() => handleScroll("#contact")}
              className="btn-gold justify-center"
            >
              Book a Consultation
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
            <button
              data-testid="hero-cta-portfolio"
              onClick={() => handleScroll("#portfolio")}
              className="btn-ghost-gold justify-center"
            >
              View Portfolio
              <ArrowDownRight size={14} strokeWidth={1.5} />
            </button>
          </motion.div>
        </motion.div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 1 }}
          className="absolute bottom-10 inset-x-0 lux-container flex items-end justify-between gap-6"
        >
          <div className="hidden md:flex items-center gap-3 text-[hsl(var(--ivory)/0.5)] text-[10px] tracking-luxury uppercase">
            <span className="w-8 h-px bg-[hsl(var(--ivory)/0.3)]" />
            Scroll to enter the studio
          </div>
          <div className="text-[hsl(var(--ivory)/0.5)] text-[10px] tracking-luxury uppercase">
            Rohini · New Delhi
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
