import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const ABOUT_IMG =
  "https://images.unsplash.com/photo-1773867567872-3ad1fa481082?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400";

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
              alt="Sambita Bose atelier"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-[hsl(var(--gold)/0.2)]" />
          </div>
          {/* Floating year badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute -bottom-6 -right-6 lg:-bottom-10 lg:-right-10 bg-[hsl(var(--obsidian))] border border-[hsl(var(--gold)/0.3)] px-8 py-6 backdrop-blur-sm"
          >
            <div className="font-display text-[hsl(var(--gold))] text-5xl lg:text-6xl">
              2012
            </div>
            <div className="text-[hsl(var(--muted-foreground))] text-[10px] tracking-luxury uppercase mt-1">
              Atelier Established
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

          <h2 className="font-display text-[hsl(var(--ivory))] text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight">
            Interiors composed
            <br />
            <em className="italic text-[hsl(var(--gold))]">like couture</em> —
            measured, draped, finished by hand.
          </h2>

          <div className="mt-10 space-y-6 text-[hsl(var(--muted-foreground))] text-base md:text-lg leading-relaxed font-light max-w-xl">
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
          <div className="mt-12 pl-6 border-l-2 border-[hsl(var(--gold))] max-w-xl">
            <Quote
              size={28}
              strokeWidth={1}
              className="text-[hsl(var(--gold))] mb-4"
            />
            <p className="font-display italic text-[hsl(var(--ivory))] text-xl md:text-2xl leading-snug">
              "A home should hold you the way an old song does — softly, and
              completely."
            </p>
            <p className="mt-4 text-[hsl(var(--gold))] text-xs tracking-luxury uppercase">
              — Sambita Bose, Founder
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
