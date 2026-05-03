import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PROJECT_TYPES } from "../data/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const POPUP_KEY = "lumiere_popup_seen_v1";
const POPUP_STUDIO_IMG =
  "https://images.unsplash.com/photo-1773867567872-3ad1fa481082?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

const initial = {
  name: "",
  phone: "",
  email: "",
  project_type: PROJECT_TYPES[0],
  message: "",
};

export default function EnquiryPopup() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Auto-open after 8s — only once per session
  useEffect(() => {
    if (sessionStorage.getItem(POPUP_KEY)) return;
    const t = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(t);
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    sessionStorage.setItem(POPUP_KEY, "1");
    setOpen(false);
  };

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
      await axios.post(`${API}/leads`, { ...form, source: "popup_offer" });
      setDone(true);
      sessionStorage.setItem(POPUP_KEY, "1");
      toast.success("Thank you. Your 10% offer is reserved.");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="enquiry-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-[hsl(var(--obsidian)/0.9)] backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-[hsl(0_0%_5%)] border border-[hsl(var(--gold)/0.25)] grid md:grid-cols-2 overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            <button
              data-testid="popup-close"
              onClick={close}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center text-[hsl(var(--ivory))] hover:text-[hsl(var(--gold))] bg-[hsl(var(--obsidian)/0.6)] border border-[hsl(var(--border))] transition-colors"
              aria-label="Close"
            >
              <X size={16} strokeWidth={1.4} />
            </button>

            {/* Left — studio image + offer */}
            <div className="relative min-h-[220px] md:min-h-[520px]">
              <img
                src={POPUP_STUDIO_IMG}
                alt="Lumière studio interior"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--obsidian))] via-[hsl(var(--obsidian)/0.5)] to-[hsl(var(--obsidian)/0.2)]" />
              <div className="relative h-full flex flex-col justify-end p-6 sm:p-8 md:p-10">
                <div className="flex items-center gap-2 mb-4 text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">
                  <Sparkles size={12} strokeWidth={1.4} />
                  Limited · This Week Only
                </div>
                <div className="font-display text-[hsl(var(--ivory))] text-3xl sm:text-4xl md:text-5xl leading-[1.05] font-light">
                  Flat{" "}
                  <em className="italic text-[hsl(var(--gold))]">10% off</em>
                  <br />
                  your first project.
                </div>
                <p className="mt-4 text-[hsl(var(--muted-foreground))] text-sm leading-relaxed max-w-sm font-light">
                  Enquire this week and we'll reserve our atelier team for your
                  space — plus a complimentary 60-minute design consultation
                  (worth ₹15,000).
                </p>
              </div>
            </div>

            {/* Right — form or success */}
            <div className="p-6 sm:p-8 md:p-10 flex flex-col">
              {!done ? (
                <>
                  <div className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase mb-3">
                    Claim Your Offer
                  </div>
                  <h3 className="font-display text-[hsl(var(--ivory))] text-2xl sm:text-3xl font-light leading-tight">
                    Tell us about your{" "}
                    <em className="italic text-[hsl(var(--gold))]">
                      space.
                    </em>
                  </h3>
                  <form
                    onSubmit={submit}
                    data-testid="popup-form"
                    className="mt-6 flex flex-col gap-2"
                    noValidate
                  >
                    <div>
                      <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))]">
                        Full Name
                      </label>
                      <input
                        data-testid="popup-name"
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
                        data-testid="popup-phone"
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
                        data-testid="popup-email"
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
                        data-testid="popup-project-type"
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
                    <button
                      data-testid="popup-submit"
                      type="submit"
                      disabled={loading}
                      className="btn-gold mt-5 justify-center disabled:opacity-60"
                    >
                      {loading ? "Reserving..." : "Claim 10% Offer"}
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </button>
                    <p className="mt-3 text-[hsl(var(--muted-foreground))] text-[10px] text-center">
                      By submitting, you agree to be contacted by our studio.
                      No spam.
                    </p>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col items-start justify-center"
                >
                  <div className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase mb-3">
                    Reserved
                  </div>
                  <h3 className="font-display text-[hsl(var(--ivory))] text-3xl md:text-4xl font-light leading-tight">
                    Your{" "}
                    <em className="italic text-[hsl(var(--gold))]">
                      10% offer
                    </em>{" "}
                    is secured.
                  </h3>
                  <p className="mt-4 text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                    A senior member of our studio will reach out within 24
                    hours to schedule your complimentary consultation.
                  </p>
                  <button
                    onClick={close}
                    className="btn-ghost-gold mt-8"
                    data-testid="popup-dismiss-success"
                  >
                    Continue Browsing
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
