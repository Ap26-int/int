import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const ABOUT_IMG =
  "https://customer-assets.emergentagent.com/job_lumiere-interior/artifacts/c05zcsby_hom-abt.jpg";

export default function About() {
  return (
    <section
      id="about"
      data-testid="about-section"
      className="relative lux-section bg-[hsl(var(--obsidian))]"
    >
      <div className="lux-container grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* Image side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 relative"
        >
          <div className="lux-image-frame aspect-[4/5] w-full">
            <img
              src={ABOUT_IMG}
              alt="Sambita Bose receiving an industry award alongside Arbaaz Khan"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-[hsl(var(--gold)/0.2)]" />
            {/* Award caption */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[hsl(var(--obsidian))] via-[hsl(var(--obsidian)/0.85)] to-transparent pt-16 pb-5 px-5 sm:px-6 sm:pr-44 lg:pr-56">
              <div className="flex items-center gap-3">
                <span className="w-6 h-px bg-[hsl(var(--gold))]" />
                <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[9px] sm:text-[10px]">
                  Celebrity Interior Designer
                </span>
              </div>
              <p className="text-[hsl(var(--ivory))] text-[11px] sm:text-xs md:text-sm mt-2 font-light leading-snug">
                Sambita Bose felicitated for excellence in Celebrity interior design
              </p>
            </div>
          </div>
          {/* Floating founder name badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute right-3 -bottom-3 sm:-right-5 sm:-bottom-5 lg:-right-8 lg:-bottom-8 z-10 bg-[hsl(var(--obsidian))] border border-[hsl(var(--gold)/0.35)] px-5 py-3 sm:px-6 sm:py-4 backdrop-blur-sm shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
          >
            <div className="font-display italic text-[hsl(var(--gold))] text-xl sm:text-2xl lg:text-3xl leading-none whitespace-nowrap">
              Sambita Bose
            </div>
            <div className="text-[hsl(var(--muted-foreground))] text-[8px] sm:text-[9px] tracking-luxury uppercase mt-1 sm:mt-1.5 whitespace-nowrap">
              Celebrity Interior Designer
            </div>
          </motion.div>
        </motion.div>

        {/* Content side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="w-10 h-px bg-[hsl(var(--gold))]" />
            <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px] font-medium">
              The Studio
            </span>
          </div>

          <h2 className="font-display text-[hsl(var(--ivory))] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight">
            Interiors composed
            <br />
            <em className="italic text-[hsl(var(--gold))]">like couture</em> —
            measured, draped, finished by hand.
          </h2>

          <div className="mt-8 sm:mt-10 space-y-5 sm:space-y-6 text-[hsl(var(--muted-foreground))] text-sm sm:text-base md:text-lg leading-relaxed font-light max-w-xl">
            <p>
              Lumière is the private design atelier of <strong className="text-[hsl(var(--ivory))] font-medium">Sambita Bose</strong> — a designer
              celebrated for the still, almost cinematic homes she creates for
              India's leading actors, founders and old-money families.
            </p>
            <p>
              From a quiet studio in Rohini, every Lumière project moves through
              the same hands. Sketches drawn in pencil. Materials chosen in
              person. Walls finished slowly, the way they were finished a century
              ago. The result is luxury that doesn't announce itself — it lingers.
            </p>
          </div>

          {/* Signature quote */}
          <div className="mt-10 sm:mt-12 pl-5 sm:pl-6 border-l-2 border-[hsl(var(--gold))] max-w-xl">
            <Quote
              size={24}
              strokeWidth={1}
              className="text-[hsl(var(--gold))] mb-3 sm:mb-4"
            />
            <p className="font-display italic text-[hsl(var(--ivory))] text-lg sm:text-xl md:text-2xl leading-snug">
              "A home should hold you the way an old song does — softly, and
              completely."
            </p>
            <p className="mt-3 sm:mt-4 text-[hsl(var(--gold))] text-[10px] sm:text-xs tracking-luxury uppercase">
              — Sambita Bose, Founder
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
