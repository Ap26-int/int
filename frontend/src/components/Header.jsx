import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BRAND, NAV_LINKS } from "../data/content";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <motion.header
        data-testid="site-header"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-[hsl(var(--obsidian)/0.72)] border-b border-[hsl(var(--gold)/0.15)]"
            : "bg-transparent"
        }`}
      >
        <div className="lux-container flex items-center justify-between py-5 lg:py-6">
          {/* Logo / Wordmark */}
          <button
            data-testid="header-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center group"
            aria-label="Lumière By Sambita Bose"
          >
            <img
              src="/lumiere-logo.png"
              alt="Lumière By Sambita Bose"
              className="h-16 md:h-[72px] lg:h-20 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              loading="eager"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                onClick={() => handleNav(l.href)}
                className="nav-link"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-4">
            <button
              data-testid="header-cta-consult"
              onClick={() => handleNav("#contact")}
              className="hidden lg:inline-flex btn-gold"
              style={{ padding: "0.85rem 1.6rem", fontSize: "0.65rem" }}
            >
              Book Consultation
            </button>
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setOpen(true)}
              className="lg:hidden text-[hsl(var(--ivory))] hover:text-[hsl(var(--gold))] transition-colors"
              aria-label="Open menu"
            >
              <Menu size={26} strokeWidth={1.2} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[hsl(var(--obsidian))] lg:hidden"
          >
            <div className="lux-container py-5 flex justify-between items-center">
              <img
                src="/lumiere-logo.png"
                alt="Lumière By Sambita Bose"
                className="h-14 w-auto object-contain"
              />
              <button
                data-testid="mobile-menu-close"
                onClick={() => setOpen(false)}
                className="text-[hsl(var(--ivory))]"
                aria-label="Close menu"
              >
                <X size={26} strokeWidth={1.2} />
              </button>
            </div>
            <div className="lux-container mt-12 flex flex-col gap-8">
              {NAV_LINKS.map((l, i) => (
                <motion.button
                  key={l.label}
                  data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => handleNav(l.href)}
                  className="text-left font-display text-[hsl(var(--ivory))] text-3xl hover:text-[hsl(var(--gold))] transition-colors"
                >
                  {l.label}
                </motion.button>
              ))}
              <button
                data-testid="mobile-cta-consult"
                onClick={() => handleNav("#contact")}
                className="btn-gold mt-8 self-start"
              >
                Book Consultation
              </button>
              <div className="mt-8 text-[hsl(var(--muted-foreground))] text-xs tracking-elegant uppercase">
                {BRAND.location}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
