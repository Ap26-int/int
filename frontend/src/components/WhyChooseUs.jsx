import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { WHY_US } from "../data/content";

function Counter({ to, suffix = "", inView }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span>
      {n}
      {suffix}
    </span>
  );
}

export default function WhyChooseUs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="why"
      data-testid="why-section"
      ref={ref}
      className="relative lux-section overflow-hidden bg-[hsl(0_0%_3%)] border-t border-[hsl(var(--gold)/0.08)]"
    >
      {/* Decorative gold rings */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[hsl(var(--gold)/0.08)] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-[hsl(var(--gold)/0.05)] pointer-events-none" />

      <div className="lux-container relative z-10">
        <div className="max-w-3xl mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-10 h-px bg-[hsl(var(--gold))]" />
              <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px] font-medium">
                Why Lumière
              </span>
            </div>
            <h2 className="font-display text-[hsl(var(--ivory))] text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight">
              Twelve years.
              <br />
              <em className="italic text-[hsl(var(--gold))]">
                One uncompromising
              </em>{" "}
              standard.
            </h2>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[hsl(var(--gold)/0.12)] border border-[hsl(var(--gold)/0.12)]">
          {WHY_US.map((w, i) => (
            <motion.div
              key={w.label}
              data-testid={`why-stat-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="bg-[hsl(var(--obsidian))] p-8 lg:p-12"
            >
              <div className="font-display text-[hsl(var(--gold))] text-6xl lg:text-7xl font-light leading-none">
                <Counter to={w.number} suffix={w.suffix} inView={inView} />
              </div>
              <div className="mt-6 text-[hsl(var(--ivory))] text-base lg:text-lg font-medium">
                {w.label}
              </div>
              <div className="mt-3 text-[hsl(var(--muted-foreground))] text-sm leading-relaxed font-light">
                {w.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
