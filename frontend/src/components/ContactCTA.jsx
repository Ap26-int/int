import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, MapPin, Phone, Mail, Instagram } from "lucide-react";
import { BRAND, PROJECT_TYPES } from "../data/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const initial = {
  name: "",
  phone: "",
  email: "",
  project_type: PROJECT_TYPES[0],
  message: "",
};

export default function ContactCTA() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("Please complete the required fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/leads`, form);
      toast.success(data.message || "Thank you. We will be in touch.");
      setForm(initial);
    } catch (err) {
      const msg =
        err?.response?.data?.detail || "Something went wrong. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const waLink = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
    "Hello Lumière, I would like to discuss a project."
  )}`;

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative lux-section bg-[hsl(0_0%_3%)] border-t border-[hsl(var(--gold)/0.08)]"
    >
      <div className="lux-container">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left – heading + form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-10 h-px bg-[hsl(var(--gold))]" />
              <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px] font-medium">
                Begin Your Project
              </span>
            </div>
            <h2 className="font-display text-[hsl(var(--ivory))] text-4xl md:text-5xl lg:text-6xl font-light leading-[1.02] tracking-tight">
              Let's design your
              <br />
              <em className="italic text-[hsl(var(--gold))]">
                dream space.
              </em>
            </h2>
            <p className="mt-6 text-[hsl(var(--muted-foreground))] text-base lg:text-lg max-w-lg leading-relaxed font-light">
              Share a few details. A senior member of our studio will reach out
              within 24 hours to schedule a private consultation.
            </p>

            <form
              onSubmit={submit}
              data-testid="lead-form"
              className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2"
              noValidate
            >
              <div>
                <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))]">
                  Full Name
                </label>
                <input
                  data-testid="form-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="lux-input"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))]">
                  Phone
                </label>
                <input
                  data-testid="form-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="lux-input"
                  placeholder="+91 ..."
                  required
                />
              </div>
              <div>
                <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))]">
                  Email
                </label>
                <input
                  data-testid="form-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="lux-input"
                  placeholder="you@domain.com"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))]">
                  Project Type
                </label>
                <select
                  data-testid="form-project-type"
                  name="project_type"
                  value={form.project_type}
                  onChange={handleChange}
                  className="lux-input bg-[hsl(var(--obsidian))]"
                >
                  {PROJECT_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 mt-2">
                <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))]">
                  Tell us about your space (optional)
                </label>
                <textarea
                  data-testid="form-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  className="lux-input resize-none"
                  placeholder="A few words about your home, location, or vision."
                />
              </div>
              <div className="md:col-span-2 mt-8">
                <button
                  data-testid="form-submit"
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full md:w-auto disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Get Free Consultation"}
                  <ArrowRight size={14} strokeWidth={1.5} />
                </button>
              </div>
            </form>
          </motion.div>

          {/* Right – contact details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="bg-[hsl(var(--obsidian))] border border-[hsl(var(--gold)/0.18)] p-8 lg:p-10 space-y-8">
              <div>
                <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px] font-medium">
                  The Studio
                </span>
                <h3 className="font-display text-[hsl(var(--ivory))] text-2xl mt-3 italic">
                  Visit by appointment
                </h3>
              </div>

              <div className="space-y-6">
                <a
                  data-testid="contact-address"
                  href="https://maps.google.com/?q=Rohini+Delhi"
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-4 group"
                >
                  <MapPin
                    size={18}
                    strokeWidth={1.4}
                    className="mt-1 text-[hsl(var(--gold))] flex-shrink-0"
                  />
                  <div>
                    <div className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))] mb-1">
                      Address
                    </div>
                    <div className="text-[hsl(var(--ivory))] text-sm leading-relaxed group-hover:text-[hsl(var(--gold))] transition-colors">
                      {BRAND.fullAddress}
                    </div>
                  </div>
                </a>

                <a
                  data-testid="contact-phone"
                  href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                  className="flex gap-4 group"
                >
                  <Phone
                    size={18}
                    strokeWidth={1.4}
                    className="mt-1 text-[hsl(var(--gold))] flex-shrink-0"
                  />
                  <div>
                    <div className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))] mb-1">
                      Phone
                    </div>
                    <div className="text-[hsl(var(--ivory))] text-sm group-hover:text-[hsl(var(--gold))] transition-colors">
                      {BRAND.phone}
                    </div>
                  </div>
                </a>

                <a
                  data-testid="contact-email"
                  href={`mailto:${BRAND.email}`}
                  className="flex gap-4 group"
                >
                  <Mail
                    size={18}
                    strokeWidth={1.4}
                    className="mt-1 text-[hsl(var(--gold))] flex-shrink-0"
                  />
                  <div>
                    <div className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))] mb-1">
                      Email
                    </div>
                    <div className="text-[hsl(var(--ivory))] text-sm group-hover:text-[hsl(var(--gold))] transition-colors">
                      {BRAND.email}
                    </div>
                  </div>
                </a>

                <a
                  data-testid="contact-instagram"
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-4 group"
                >
                  <Instagram
                    size={18}
                    strokeWidth={1.4}
                    className="mt-1 text-[hsl(var(--gold))] flex-shrink-0"
                  />
                  <div>
                    <div className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))] mb-1">
                      Instagram
                    </div>
                    <div className="text-[hsl(var(--ivory))] text-sm group-hover:text-[hsl(var(--gold))] transition-colors">
                      @lumierebysambita
                    </div>
                  </div>
                </a>
              </div>

              {/* WhatsApp CTA */}
              <a
                data-testid="whatsapp-cta"
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="block btn-ghost-gold w-full text-center justify-center"
              >
                WhatsApp Concierge
              </a>
            </div>

            {/* Map */}
            <div className="mt-6 border border-[hsl(var(--gold)/0.18)] overflow-hidden h-64">
              <iframe
                data-testid="contact-map"
                title="Lumière Studio Location"
                src="https://www.google.com/maps?q=Rohini%2C+New+Delhi&output=embed"
                className="w-full h-full"
                style={{ filter: "invert(0.92) hue-rotate(180deg) saturate(0.5)" }}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
