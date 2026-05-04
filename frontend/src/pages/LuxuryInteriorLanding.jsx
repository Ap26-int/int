import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Phone,
  MapPin,
  Star,
  Crown,
  Hammer,
  Sofa,
  Sparkles,
  Quote,
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
} from "lucide-react";
import FloatingActions from "../components/FloatingActions";
import About from "../components/About";
import { BRAND } from "../data/content";
import { LANDING_TESTIMONIALS, LANDING_GALLERY, BUDGETS } from "../data/landing-content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HERO_BG = LANDING_GALLERY[0].src;

const SERVICES = [
  { icon: Home, title: "Residential Interiors", text: "Apartments, villas, penthouses." },
  { icon: Crown, title: "Celebrity Homes", text: "Discreet, dramatic, restrained." },
  { icon: Hammer, title: "Turnkey Execution", text: "From sketch to last switch plate." },
  { icon: Sofa, title: "Custom Furniture", text: "Heirloom-grade, designed in-house." },
  { icon: Building2, title: "Penthouse Styling", text: "Statement city residences." },
  { icon: Sparkles, title: "Art Curation", text: "Sculpture, painting, objet." },
];

const initialForm = { name: "", phone: "", email: "", budget: BUDGETS[0], message: "" };

function LeadForm({ compact = false }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("Please complete the required fields.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/leads`, {
        ...form,
        project_type: "Luxury Interior Enquiry",
        source: "luxury-interior",
      });
      setDone(true);
      toast.success("Thank you. Our studio will reach out within 24 hours.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        data-testid="lead-form-success"
        className="bg-[hsl(0_0%_5%)] border border-[hsl(var(--gold))] p-8 sm:p-10 text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-full border border-[hsl(var(--gold))] flex items-center justify-center text-[hsl(var(--gold))] mb-5">
          <Check size={26} strokeWidth={1.5} />
        </div>
        <h3 className="font-display italic text-[hsl(var(--ivory))] text-2xl sm:text-3xl">
          We've received your enquiry.
        </h3>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-3 leading-relaxed">
          A senior member of our studio will reach out within 24 hours. For urgent
          conversations, call us directly at{" "}
          <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="text-[hsl(var(--gold))]">
            {BRAND.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      data-testid="luxury-lead-form"
      className={`relative bg-gradient-to-b from-[hsl(0_0%_7%)] to-[hsl(var(--obsidian))] backdrop-blur-md border border-[hsl(var(--gold))]/45 shadow-[0_30px_70px_-20px_rgba(201,169,97,0.35),0_10px_40px_-10px_rgba(0,0,0,0.8)] ${
        compact ? "p-5 sm:p-6" : "p-6 sm:p-7"
      }`}
      noValidate
    >
      {/* gold corner ornaments */}
      <span className="pointer-events-none absolute -top-px -left-px w-6 h-6 border-t border-l border-[hsl(var(--gold))]" />
      <span className="pointer-events-none absolute -top-px -right-px w-6 h-6 border-t border-r border-[hsl(var(--gold))]" />
      <span className="pointer-events-none absolute -bottom-px -left-px w-6 h-6 border-b border-l border-[hsl(var(--gold))]" />
      <span className="pointer-events-none absolute -bottom-px -right-px w-6 h-6 border-b border-r border-[hsl(var(--gold))]" />

      <div className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase mb-1.5">
        Enquire Now
      </div>
      <h3 className="font-display italic text-[hsl(var(--ivory))] text-2xl sm:text-[1.7rem] font-light leading-tight">
        Begin your{" "}
        <em className="text-[hsl(var(--gold))]">luxury home</em>.
      </h3>
      <p className="text-[hsl(var(--muted-foreground))] text-[11px] sm:text-xs mt-2 mb-4 leading-relaxed">
        For project enquiries, fill out the form, or contact us at{" "}
        <a
          href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
          className="text-[hsl(var(--gold))] hover:underline"
        >
          {BRAND.phone}
        </a>
        .
      </p>

      <div className="space-y-0">
        <div>
          <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--gold))/0.85)] text-[hsl(var(--gold))]">
            Full Name<span className="text-[hsl(var(--gold))]">*</span>
          </label>
          <input
            data-testid="lf-name"
            name="name"
            type="text"
            value={form.name}
            onChange={change}
            className="lux-input"
            style={{ padding: "0.6rem 0" }}
            required
          />
        </div>
        <div>
          <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--gold))]">
            Phone Number<span className="text-[hsl(var(--gold))]">*</span>
          </label>
          <input
            data-testid="lf-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={change}
            className="lux-input"
            style={{ padding: "0.6rem 0" }}
            required
          />
        </div>
        <div>
          <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--gold))]">
            Email ID<span className="text-[hsl(var(--gold))]">*</span>
          </label>
          <input
            data-testid="lf-email"
            name="email"
            type="email"
            value={form.email}
            onChange={change}
            className="lux-input"
            style={{ padding: "0.6rem 0" }}
            required
          />
        </div>
        <div>
          <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--gold))]">
            Choose Budget<span className="text-[hsl(var(--gold))]">*</span>
          </label>
          <select
            data-testid="lf-budget"
            name="budget"
            value={form.budget}
            onChange={change}
            className="lux-input bg-[hsl(var(--obsidian))]"
            style={{ padding: "0.6rem 0", colorScheme: "dark" }}
          >
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--gold))]">
            Any Other Information
          </label>
          <textarea
            data-testid="lf-message"
            name="message"
            value={form.message}
            onChange={change}
            rows={2}
            className="lux-input resize-none"
            style={{ padding: "0.6rem 0" }}
            placeholder="Project location, timeline, vision…"
          />
        </div>
      </div>

      <button
        data-testid="lf-submit"
        type="submit"
        disabled={loading}
        className="btn-gold w-full justify-center mt-5 disabled:opacity-60 shadow-[0_8px_24px_-6px_rgba(201,169,97,0.5)]"
      >
        {loading ? "Sending…" : "Contact Us"}
        <ArrowRight size={14} strokeWidth={1.5} />
      </button>
      <p className="mt-2.5 text-[hsl(var(--muted-foreground))] text-[10px] text-center">
        Delhi, India · We respond within 24 hours
      </p>
    </form>
  );
}

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      data-testid="luxury-hero"
      className="relative min-h-[100svh] w-full overflow-hidden bg-[hsl(var(--obsidian))] pt-28 sm:pt-32 lg:pt-36"
    >
      <motion.div style={{ y }} className="absolute inset-0 will-change-transform">
        <img src={HERO_BG} alt="Luxury living" className="w-full h-full object-cover" loading="eager" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--obsidian)/0.7)] via-[hsl(var(--obsidian)/0.55)] to-[hsl(var(--obsidian))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,hsl(var(--gold)/0.12),transparent_60%)]" />

      <motion.div
        style={{ opacity }}
        className="relative z-10 lux-container grid lg:grid-cols-12 gap-10 lg:gap-12 pb-16"
      >
        {/* Left — pitch */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="w-10 h-px bg-[hsl(var(--gold))]" />
            <span className="text-[hsl(var(--gold))] text-[10px] md:text-xs tracking-luxury uppercase">
              Luxury Interior · Delhi, India
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            data-testid="luxury-hero-headline"
            className="font-display text-[hsl(var(--ivory))] text-[2.25rem] xs:text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] leading-[0.95] tracking-[-0.02em] font-light"
          >
            Elevate your{" "}
            <em className="italic text-[hsl(var(--gold))]">Home</em>,
            <br />
            Celebrity Style.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-7 max-w-xl text-[hsl(var(--muted-foreground))] text-sm sm:text-base lg:text-lg leading-relaxed font-light"
          >
            From compact apartments to ultra-luxury villas — Lumière By Sambita Bose
            crafts homes for India's most discerning clients. Quiet luxury,
            celebrity-grade finishing, end-to-end execution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35 }}
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-[hsl(var(--ivory))] text-xs sm:text-sm"
          >
            <span className="flex items-center gap-2">
              <Check size={14} className="text-[hsl(var(--gold))]" /> 12+ Years
            </span>
            <span className="flex items-center gap-2">
              <Check size={14} className="text-[hsl(var(--gold))]" /> 280+ Homes Designed
            </span>
            <span className="flex items-center gap-2">
              <Check size={14} className="text-[hsl(var(--gold))]" /> 100% Turnkey
            </span>
            <span className="flex items-center gap-2">
              <Check size={14} className="text-[hsl(var(--gold))]" /> Award Winning
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-10 flex items-center gap-4"
          >
            <a
              href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
              className="btn-gold"
              data-testid="hero-call-btn"
            >
              <Phone size={14} strokeWidth={1.5} /> Call {BRAND.phone}
            </a>
            <span className="hidden sm:inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] text-xs">
              <MapPin size={12} className="text-[hsl(var(--gold))]" />
              Delhi, India
            </span>
          </motion.div>
        </div>

        {/* Right — form */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 lg:pl-2"
        >
          <LeadForm />
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { n: "12+", l: "Years of practice" },
    { n: "280+", l: "Homes designed" },
    { n: "47", l: "Celebrity homes" },
    { n: "100%", l: "Turnkey delivery" },
  ];
  return (
    <section className="relative bg-[hsl(0_0%_3%)] border-y border-[hsl(var(--gold)/0.15)]">
      <div className="lux-container grid grid-cols-2 lg:grid-cols-4 divide-x divide-[hsl(var(--border))]">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="px-5 py-8 sm:py-10 text-center"
          >
            <div className="font-display text-[hsl(var(--gold))] text-3xl sm:text-4xl lg:text-5xl">
              {s.n}
            </div>
            <div className="text-[hsl(var(--muted-foreground))] text-[10px] sm:text-xs tracking-luxury uppercase mt-2">
              {s.l}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ServicesGrid() {
  return (
    <section data-testid="luxury-services" className="lux-section bg-[hsl(var(--obsidian))]">
      <div className="lux-container">
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-[hsl(var(--gold))]" />
            <span className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">What we do</span>
          </div>
          <h2 className="font-display text-[hsl(var(--ivory))] text-3xl sm:text-4xl lg:text-5xl font-light leading-[1.05]">
            One studio.{" "}
            <em className="italic text-[hsl(var(--gold))]">Six disciplines.</em>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[hsl(var(--gold)/0.12)] border border-[hsl(var(--gold)/0.12)]">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-[hsl(var(--obsidian))] p-7 lg:p-10 group"
              >
                <Icon size={28} strokeWidth={1} className="text-[hsl(var(--gold))] mb-5 group-hover:-translate-y-1 transition-transform duration-500" />
                <h3 className="font-display text-[hsl(var(--ivory))] text-xl lg:text-2xl font-light">
                  {s.title}
                </h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">{s.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  return (
    <section
      data-testid="luxury-gallery"
      className="lux-section bg-[hsl(0_0%_3%)] border-y border-[hsl(var(--gold)/0.08)]"
    >
      <div className="lux-container">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-[hsl(var(--gold))]" />
              <span className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">Selected Projects</span>
            </div>
            <h2 className="font-display text-[hsl(var(--ivory))] text-3xl sm:text-4xl lg:text-5xl font-light leading-[1.05]">
              A glimpse of our{" "}
              <em className="italic text-[hsl(var(--gold))]">work.</em>
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANDING_GALLERY.map((g, i) => (
            <motion.div
              key={g.src}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.05 }}
              className={`relative overflow-hidden lux-image-frame group ${
                i === 0 ? "lg:col-span-2 lg:row-span-2" : ""
              }`}
              data-testid={`gallery-${i}`}
            >
              <img src={g.src} alt={g.title} loading="lazy" className="w-full h-full object-cover aspect-[4/3] lg:aspect-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--obsidian))] via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
                <span className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">{g.category}</span>
                <div className="font-display text-[hsl(var(--ivory))] text-xl lg:text-2xl mt-1 font-light">
                  {g.title}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSlider() {
  const [i, setI] = useState(0);
  const t = LANDING_TESTIMONIALS[i];
  const next = () => setI((p) => (p + 1) % LANDING_TESTIMONIALS.length);
  const prev = () => setI((p) => (p - 1 + LANDING_TESTIMONIALS.length) % LANDING_TESTIMONIALS.length);
  return (
    <section data-testid="luxury-testimonials" className="lux-section bg-[hsl(var(--obsidian))]">
      <div className="lux-container grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-[hsl(var(--gold))]" />
            <span className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">Clients</span>
          </div>
          <h2 className="font-display text-[hsl(var(--ivory))] text-3xl sm:text-4xl lg:text-5xl font-light leading-[1.05]">
            What our clients{" "}
            <em className="italic text-[hsl(var(--gold))]">say.</em>
          </h2>
          <div className="hidden lg:flex items-center gap-3 mt-10">
            <button
              data-testid="t-prev"
              onClick={prev}
              className="w-12 h-12 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--ivory))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors"
              aria-label="Prev"
            >
              <ChevronLeft size={18} strokeWidth={1.4} />
            </button>
            <button
              data-testid="t-next"
              onClick={next}
              className="w-12 h-12 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--ivory))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={18} strokeWidth={1.4} />
            </button>
          </div>
        </div>
        <div className="lg:col-span-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5 }}
              className="relative bg-[hsl(0_0%_5%)] border border-[hsl(var(--gold)/0.18)] p-7 sm:p-10 lg:p-14"
              data-testid={`testimonial-${i}`}
            >
              <Quote
                size={40}
                strokeWidth={0.6}
                className="absolute top-6 right-6 sm:top-8 sm:right-8 text-[hsl(var(--gold)/0.25)]"
              />
              <div className="flex gap-1 mb-6">
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
              <p className="font-display italic text-[hsl(var(--ivory))] text-lg sm:text-2xl md:text-3xl lg:text-[2.1rem] leading-snug font-light">
                "{t.quote}"
              </p>
              <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
                <div className="text-[hsl(var(--ivory))] text-base font-medium">{t.author}</div>
                <div className="text-[hsl(var(--muted-foreground))] text-xs tracking-elegant uppercase mt-1">
                  {t.location}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex lg:hidden items-center gap-3 mt-6">
            <button onClick={prev} className="w-11 h-11 border border-[hsl(var(--border))] flex items-center justify-center" aria-label="Prev">
              <ChevronLeft size={16} />
            </button>
            <button onClick={next} className="w-11 h-11 border border-[hsl(var(--border))] flex items-center justify-center" aria-label="Next">
              <ChevronRight size={16} />
            </button>
            <span className="ml-2 text-[hsl(var(--muted-foreground))] text-xs">
              {i + 1} / {LANDING_TESTIMONIALS.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      id="enquire"
      data-testid="luxury-final-cta"
      className="lux-section bg-[hsl(0_0%_3%)] border-t border-[hsl(var(--gold)/0.08)]"
    >
      <div className="lux-container grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-[hsl(var(--gold))]" />
            <span className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">Begin</span>
          </div>
          <h2 className="font-display text-[hsl(var(--ivory))] text-3xl sm:text-4xl lg:text-6xl font-light leading-[1.02]">
            Let's design your{" "}
            <em className="italic text-[hsl(var(--gold))]">dream space.</em>
          </h2>
          <p className="mt-6 text-[hsl(var(--muted-foreground))] text-sm sm:text-base lg:text-lg max-w-xl">
            Share a few details. A senior member of our studio will reach out
            within 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="btn-gold">
              <Phone size={14} strokeWidth={1.5} /> Call {BRAND.phone}
            </a>
            <a
              href={`https://wa.me/${BRAND.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost-gold"
            >
              WhatsApp Concierge
            </a>
          </div>
          <div className="mt-10 flex items-center gap-3 text-[hsl(var(--muted-foreground))] text-sm">
            <MapPin size={14} className="text-[hsl(var(--gold))]" />
            Delhi, India
          </div>
        </div>
        <div className="lg:col-span-5">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}

function MiniHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-30 backdrop-blur-xl bg-[hsl(var(--obsidian)/0.7)] border-b border-[hsl(var(--gold)/0.12)]">
      <div className="lux-container flex items-center justify-between py-4">
        <a href="/" className="flex items-center">
          <img src="/lumiere-logo.png" alt="Lumière" className="h-16 sm:h-20 w-auto" />
        </a>
        <a
          href="#enquire"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("enquire")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="btn-gold"
          style={{ padding: "0.7rem 1.4rem", fontSize: "0.62rem" }}
        >
          Enquire
        </a>
      </div>
    </header>
  );
}

function MiniFooter() {
  return (
    <footer className="bg-[hsl(var(--obsidian))] border-t border-[hsl(var(--gold)/0.15)] py-10">
      <div className="lux-container flex flex-col md:flex-row items-center justify-between gap-4 text-[hsl(var(--muted-foreground))] text-xs">
        <p>© {new Date().getFullYear()} Lumière By Sambita Bose · Delhi, India</p>
        <div className="flex items-center gap-5">
          <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="hover:text-[hsl(var(--gold))]">
            {BRAND.phone}
          </a>
          <a href={`mailto:${BRAND.email}`} className="hover:text-[hsl(var(--gold))]">
            {BRAND.email}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function LuxuryInteriorLanding() {
  useEffect(() => {
    document.title = "Luxury Interior · Lumière By Sambita Bose · Delhi";
  }, []);
  return (
    <main data-testid="luxury-interior-landing" className="bg-[hsl(var(--obsidian))]">
      <MiniHeader />
      <HeroSection />
      <About />
      <StatsBar />
      <ServicesGrid />
      <GallerySection />
      <TestimonialsSlider />
      <FinalCTA />
      <MiniFooter />
      <FloatingActions />
    </main>
  );
}
