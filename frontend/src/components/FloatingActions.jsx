import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import { BRAND } from "../data/content";

const WhatsAppIcon = ({ size = 26 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.45L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l.6.953-1 3.648 3.737-.98.642.42zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01a1.099 1.099 0 0 0-.797.372c-.272.298-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z"/>
  </svg>
);

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
        <span className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40 transition-colors group-hover:bg-[#1ebe57]">
          <WhatsAppIcon size={28} />
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
