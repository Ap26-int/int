import { Instagram, Linkedin } from "lucide-react";
import { BRAND, NAV_LINKS } from "../data/content";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      data-testid="site-footer"
      className="relative bg-[hsl(var(--obsidian))] border-t border-[hsl(var(--gold)/0.15)] pt-20 lg:pt-28"
    >
      <div className="lux-container">
        {/* Giant brand wordmark */}
        <div className="text-center mb-16">
          <div className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase mb-4">
            {BRAND.tagline}
          </div>
          <h3 className="font-display italic text-[hsl(var(--ivory))] text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] leading-none tracking-tight">
            Lumière
          </h3>
          <div className="text-[hsl(var(--muted-foreground))] text-xs tracking-luxury uppercase mt-3">
            By Sambita Bose
          </div>
        </div>

        <div className="gold-line h-px w-full mb-12" />

        <div className="grid md:grid-cols-3 gap-12 pb-10">
          <div>
            <div className="text-[10px] tracking-luxury uppercase text-[hsl(var(--gold))] mb-4">
              Atelier
            </div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
              {BRAND.fullAddress}
            </p>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-3">
              {BRAND.phone}
            </p>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              {BRAND.email}
            </p>
          </div>

          <div>
            <div className="text-[10px] tracking-luxury uppercase text-[hsl(var(--gold))] mb-4">
              Navigate
            </div>
            <div className="grid grid-cols-2 gap-y-2">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-[hsl(var(--muted-foreground))] text-sm hover:text-[hsl(var(--gold))] transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-luxury uppercase text-[hsl(var(--gold))] mb-4">
              Follow
            </div>
            <div className="flex gap-3">
              <a
                data-testid="footer-instagram"
                href={BRAND.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-11 h-11 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--ivory))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors"
              >
                <Instagram size={16} strokeWidth={1.4} />
              </a>
              <a
                data-testid="footer-pinterest"
                href={BRAND.pinterest}
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="w-11 h-11 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--ivory))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors"
              >
                <Linkedin size={16} strokeWidth={1.4} />
              </a>
            </div>
            <p className="text-[hsl(var(--muted-foreground))] text-xs mt-6 leading-relaxed">
              Behind the scenes from the studio — new commissions, sourcing
              trips and the occasional finished room.
            </p>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border))] py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[hsl(var(--muted-foreground))] text-xs tracking-elegant">
            © {year} Lumière By Sambita Bose. All rights reserved.
          </p>
          <p className="text-[hsl(var(--muted-foreground))] text-[10px] tracking-luxury uppercase">
            {BRAND.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
