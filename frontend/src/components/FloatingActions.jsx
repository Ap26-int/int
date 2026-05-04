import { Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BRAND } from "../data/content";

export default function FloatingActions() {
  const waLink = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
    "Hello Lumière, I'd like to discuss a luxury interior project."
  )}`;
  return (
    <>
      {/* WhatsApp — bottom-left */}
      <motion.a
        data-testid="float-whatsapp"
        href={waLink}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 left-5 sm:bottom-7 sm:left-7 z-40 group"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping" />
        <span className="absolute inset-0 rounded-full bg-emerald-500/30" />
        <span className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 transition-colors group-hover:bg-emerald-400">
          <MessageCircle size={26} strokeWidth={1.6} fill="currentColor" />
        </span>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden md:block whitespace-nowrap text-[10px] tracking-luxury uppercase bg-[hsl(var(--obsidian))] border border-emerald-500/40 text-emerald-300 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          WhatsApp Us
        </span>
      </motion.a>

      {/* Call — bottom-right */}
      <motion.a
        data-testid="float-call"
        href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
        aria-label="Call us"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.4 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 group"
      >
        <span className="absolute inset-0 rounded-full bg-[hsl(var(--gold))]/40 animate-ping" />
        <span className="absolute inset-0 rounded-full bg-[hsl(var(--gold))]/30" />
        <span className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[hsl(var(--gold))] text-[hsl(var(--obsidian))] shadow-2xl shadow-[hsl(var(--gold))]/40 transition-colors group-hover:bg-[hsl(var(--gold-soft))]">
          <Phone size={24} strokeWidth={1.8} className="animate-[wiggle_2s_ease-in-out_infinite]" />
        </span>
        <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden md:block whitespace-nowrap text-[10px] tracking-luxury uppercase bg-[hsl(var(--obsidian))] border border-[hsl(var(--gold))]/40 text-[hsl(var(--gold))] px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {BRAND.phone}
        </span>
      </motion.a>
    </>
  );
}
