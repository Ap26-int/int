import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, MapPin } from "lucide-react";
import { PORTFOLIO, PORTFOLIO_CATEGORIES } from "../data/content";

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);

  const visible =
    filter === "All"
      ? PORTFOLIO
      : PORTFOLIO.filter((p) => p.category === filter);

  return (
    <section
      id="portfolio"
      data-testid="portfolio-section"
      className="relative lux-section bg-[hsl(var(--obsidian))]"
    >
      <div className="lux-container">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-10 h-px bg-[hsl(var(--gold))]" />
              <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px] font-medium">
                Portfolio · Selected Works
              </span>
            </div>
            <h2 className="font-display text-[hsl(var(--ivory))] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight">
              Homes that hold
              <br />
              <em className="italic text-[hsl(var(--gold))]">
                a private silence.
              </em>
            </h2>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {PORTFOLIO_CATEGORIES.map((c) => (
              <button
                key={c}
                data-testid={`filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setFilter(c)}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] tracking-luxury uppercase border transition-all duration-400 ${
                  filter === c
                    ? "bg-[hsl(var(--gold))] text-[hsl(var(--obsidian))] border-[hsl(var(--gold))]"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Bento masonry */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[280px] md:auto-rows-[320px] lg:auto-rows-[280px] gap-4 lg:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <motion.button
                layout
                key={p.id}
                data-testid={`portfolio-item-${p.id}`}
                onClick={() => setActive(p)}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={`relative overflow-hidden group lux-image-frame text-left ${p.span}`}
              >
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--obsidian))] via-[hsl(var(--obsidian)/0.2)] to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700" />
                {/* hover content */}
                <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-3 opacity-80">
                    <span className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">
                      {p.category}
                    </span>
                    <span className="w-6 h-px bg-[hsl(var(--gold)/0.6)]" />
                    <span className="text-[hsl(var(--ivory)/0.6)] text-[10px] tracking-elegant">
                      {p.year}
                    </span>
                  </div>
                  <h3 className="font-display text-[hsl(var(--ivory))] text-2xl lg:text-3xl font-light leading-tight">
                    {p.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] text-xs">
                      <MapPin size={11} strokeWidth={1.5} />
                      {p.location}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500 text-[hsl(var(--gold))]">
                      <ArrowUpRight size={20} strokeWidth={1.4} />
                    </span>
                  </div>
                </div>
                {/* gold corner accent */}
                <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-[hsl(var(--gold)/0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            data-testid="portfolio-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[hsl(var(--obsidian)/0.95)] backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setActive(null)}
          >
            <button
              data-testid="lightbox-close"
              onClick={() => setActive(null)}
              className="absolute top-6 right-6 text-[hsl(var(--ivory))] hover:text-[hsl(var(--gold))] transition-colors"
              aria-label="Close"
            >
              <X size={28} strokeWidth={1.2} />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full"
            >
              <img
                src={active.image}
                alt={active.title}
                className="w-full max-h-[75vh] object-cover"
              />
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">
                    {active.category} · {active.year}
                  </span>
                  <h3 className="font-display text-[hsl(var(--ivory))] text-3xl md:text-4xl mt-2 font-light">
                    {active.title}
                  </h3>
                </div>
                <span className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] text-sm">
                  <MapPin size={14} /> {active.location}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
