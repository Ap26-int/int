import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowRight, Check, MapPin } from "lucide-react";
import { BRAND } from "../data/content";

export default function ThankYou() {
  useEffect(() => {
    document.title = "Thank You · Lumière By Sambita Bose";
  }, []);

  return (
    <main
      data-testid="thank-you-page"
      className="min-h-[100svh] bg-[hsl(var(--obsidian))] flex flex-col items-center justify-center px-5 py-16 relative overflow-hidden"
    >
      {/* gold radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.12),transparent_60%)] pointer-events-none" />

      <motion.img
        src="/lumiere-logo.png"
        alt="Lumière"
        className="h-20 sm:h-24 w-auto mb-10 relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      />

      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.3,
          type: "spring",
          stiffness: 110,
        }}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[hsl(var(--gold))] flex items-center justify-center text-[hsl(var(--gold))] shadow-[0_0_60px_-10px_hsl(var(--gold))] relative"
      >
        <Check size={40} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="text-center mt-10 max-w-2xl relative"
      >
        <div className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase mb-3">
          Enquiry Received
        </div>
        <h1 className="font-display italic text-[hsl(var(--ivory))] text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05]">
          Thank you.
        </h1>
        <p className="mt-6 text-[hsl(var(--muted-foreground))] text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
          A senior member of our studio will reach out within 24 hours to
          schedule a private consultation. For anything urgent, call our
          concierge directly.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
        className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 relative"
      >
        <a
          data-testid="ty-call"
          href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
          className="btn-gold justify-center"
        >
          <Phone size={14} strokeWidth={1.5} /> Speak Now · {BRAND.phone}
        </a>
        <Link
          data-testid="ty-visit"
          to="/"
          className="btn-ghost-gold justify-center"
        >
          Visit Our Website
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        className="mt-12 flex items-center gap-2 text-[hsl(var(--muted-foreground))] text-xs relative"
      >
        <MapPin size={12} className="text-[hsl(var(--gold))]" />
        Delhi, India
      </motion.div>
    </main>
  );
}
