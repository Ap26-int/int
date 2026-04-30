import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { TESTIMONIALS } from "../data/content";

export default function Testimonials() {
  const [i, setI] = useState(0);

  const next = () => setI((p) => (p + 1) % TESTIMONIALS.length);
  const prev = () =>
    setI((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  const t = TESTIMONIALS[i];

  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="relative lux-section bg-[hsl(var(--obsidian))]"
    >
      <div className="lux-container">
        <div className="grid lg:grid-cols-12 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-10 h-px bg-[hsl(var(--gold))]" />
              <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px] font-medium">
                Testimonials
              </span>
            </div>
            <h2 className="font-display text-[hsl(var(--ivory))] text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-light leading-[1.05] tracking-tight">
              Quietly,
              <br />
              <em className="italic text-[hsl(var(--gold))]">our clients</em>
              <br />
              tell the story.
            </h2>

            <div className="hidden lg:flex items-center gap-3 mt-12">
              <button
                data-testid="testimonial-prev"
                onClick={prev}
                aria-label="Previous"
                className="w-12 h-12 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--ivory))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors"
              >
                <ChevronLeft size={18} strokeWidth={1.4} />
              </button>
              <button
                data-testid="testimonial-next"
                onClick={next}
                aria-label="Next"
                className="w-12 h-12 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--ivory))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors"
              >
                <ChevronRight size={18} strokeWidth={1.4} />
              </button>
              <span className="ml-4 text-[hsl(var(--muted-foreground))] text-xs tracking-elegant">
                {String(i + 1).padStart(2, "0")} /{" "}
                {String(TESTIMONIALS.length).padStart(2, "0")}
              </span>
            </div>
          </motion.div>

          <div className="lg:col-span-8 relative min-h-[340px] md:min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                data-testid={`testimonial-card-${i}`}
                className="relative bg-[hsl(0_0%_5%)] border border-[hsl(var(--gold)/0.18)] p-7 sm:p-10 lg:p-14"
              >
                <Quote
                  size={40}
                  strokeWidth={0.6}
                  className="absolute top-6 right-6 sm:top-8 sm:right-8 text-[hsl(var(--gold)/0.25)]"
                />
                <div className="flex gap-1 mb-6 sm:mb-8">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={14}
                      strokeWidth={0}
                      fill="hsl(var(--gold))"
                      className="text-[hsl(var(--gold))]"
                    />
                  ))}
                </div>

                <p className="font-display italic text-[hsl(var(--ivory))] text-lg sm:text-2xl md:text-3xl lg:text-4xl leading-snug font-light">
                  "{t.quote}"
                </p>

                <div className="mt-10 pt-8 border-t border-[hsl(var(--border))] flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-[hsl(var(--ivory))] text-base font-medium">
                      {t.author}
                    </div>
                    <div className="text-[hsl(var(--muted-foreground))] text-xs tracking-elegant uppercase mt-1">
                      {t.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Mobile controls */}
            <div className="flex lg:hidden items-center gap-3 mt-8">
              <button
                onClick={prev}
                aria-label="Previous"
                className="w-11 h-11 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--ivory))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors"
              >
                <ChevronLeft size={16} strokeWidth={1.4} />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="w-11 h-11 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--ivory))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors"
              >
                <ChevronRight size={16} strokeWidth={1.4} />
              </button>
              <span className="ml-3 text-[hsl(var(--muted-foreground))] text-xs tracking-elegant">
                {String(i + 1).padStart(2, "0")} /{" "}
                {String(TESTIMONIALS.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
