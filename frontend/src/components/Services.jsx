import { motion } from "framer-motion";
import {
  Home,
  Building2,
  Crown,
  Hammer,
  Sofa,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { SERVICES } from "../data/content";

const ICONS = { Home, Building2, Crown, Hammer, Sofa, Sparkles };

export default function Services() {
  return (
    <section
      id="services"
      data-testid="services-section"
      className="relative lux-section bg-[hsl(0_0%_3%)] border-t border-[hsl(var(--gold)/0.08)]"
    >
      <div className="lux-container">
        {/* Heading */}
        <div className="grid lg:grid-cols-12 gap-10 mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-10 h-px bg-[hsl(var(--gold))]" />
              <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px] font-medium">
                Services
              </span>
            </div>
            <h2 className="font-display text-[hsl(var(--ivory))] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight">
              Six disciplines.
              <br />
              <em className="italic text-[hsl(var(--gold))]">
                One signature.
              </em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-6 lg:col-start-7 self-end text-[hsl(var(--muted-foreground))] text-base md:text-lg leading-relaxed font-light max-w-xl"
          >
            Whether you are reimagining a single room or commissioning a
            complete villa, every Lumière project follows the same atelier
            process — slow, considered, deeply personal.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[hsl(var(--gold)/0.12)] border border-[hsl(var(--gold)/0.12)]">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.icon] || Home;
            return (
              <motion.div
                key={s.title}
                data-testid={`service-card-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative bg-[hsl(var(--obsidian))] p-7 sm:p-8 lg:p-12 transition-colors duration-700 hover:bg-[hsl(0_0%_5%)] cursor-default"
              >
                {/* Number */}
                <div className="font-display text-[hsl(var(--gold)/0.3)] text-sm tracking-widest absolute top-8 right-8 group-hover:text-[hsl(var(--gold))] transition-colors duration-500">
                  /{s.accent}
                </div>

                <Icon
                  size={36}
                  strokeWidth={1}
                  className="text-[hsl(var(--gold))] mb-8 transition-transform duration-700 group-hover:-translate-y-1 group-hover:rotate-[-4deg]"
                />

                <h3 className="font-display text-[hsl(var(--ivory))] text-xl sm:text-2xl lg:text-3xl font-light leading-tight mb-3 sm:mb-4 group-hover:text-[hsl(var(--gold))] transition-colors duration-500">
                  {s.title}
                </h3>

                <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed font-light">
                  {s.description}
                </p>

                <div className="mt-8 flex items-center gap-2 text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                  Discover
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
