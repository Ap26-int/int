import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Plug,
  PlugZap,
  X,
  ExternalLink,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PLATFORM_META = {
  instagram: {
    name: "Instagram",
    icon: Instagram,
    accent: "from-pink-500/20 to-amber-500/20",
    fields: [
      { key: "ig_business_account_id", label: "Instagram Business Account ID", type: "text" },
      { key: "page_access_token", label: "Page Access Token (long-lived)", type: "password" },
    ],
    helpUrl: "https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/getting-started",
    helpText:
      "Connect via Meta Business Suite → Settings → Business Assets → Instagram. Generate a long-lived Page access token with `instagram_content_publish` permission.",
  },
  facebook: {
    name: "Facebook Page",
    icon: Facebook,
    accent: "from-blue-500/20 to-indigo-500/20",
    fields: [
      { key: "fb_page_id", label: "Facebook Page ID", type: "text" },
      { key: "page_access_token", label: "Page Access Token (long-lived)", type: "password" },
    ],
    helpUrl: "https://developers.facebook.com/docs/pages-api",
    helpText:
      "Same Meta token as Instagram (your Page must be linked to the IG account). Permissions: pages_manage_posts, pages_read_engagement.",
  },
  twitter: {
    name: "X (Twitter)",
    icon: Twitter,
    accent: "from-zinc-500/20 to-slate-500/20",
    fields: [
      { key: "bearer_token", label: "Bearer Token", type: "password" },
      { key: "access_token", label: "Access Token", type: "password" },
      { key: "access_token_secret", label: "Access Token Secret", type: "password" },
    ],
    helpUrl: "https://developer.x.com/en/portal/dashboard",
    helpText:
      "Posting requires X API Basic plan ($100/month) or Pro. Create a project + app in the Developer Portal, generate User Auth tokens with Read+Write.",
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    accent: "from-sky-500/20 to-cyan-500/20",
    fields: [
      { key: "access_token", label: "OAuth Access Token", type: "password" },
      { key: "author_urn", label: "Author URN (urn:li:person:… or urn:li:organization:…)", type: "text" },
    ],
    helpUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/posts-api",
    helpText:
      "Apply for Marketing Developer Platform access. Use OAuth 2.0 with `w_member_social` (personal) or `w_organization_social` (page) scope.",
  },
};

function ConnectionCard({ platform, state, onConnect, onDisconnect }) {
  const meta = PLATFORM_META[platform];
  const Icon = meta.icon;
  const connected = state?.configured;
  return (
    <div
      data-testid={`connection-card-${platform}`}
      className={`relative bg-gradient-to-br ${meta.accent} bg-[hsl(0_0%_5%)] border ${
        connected ? "border-[hsl(var(--gold))]" : "border-[hsl(var(--border))]"
      } p-6 transition-all`}
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 flex items-center justify-center border ${
              connected
                ? "border-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <Icon size={18} strokeWidth={1.4} />
          </div>
          <div>
            <div className="text-[hsl(var(--ivory))] text-base font-medium">
              {meta.name}
            </div>
            <div
              className={`text-[10px] tracking-luxury uppercase mt-0.5 ${
                connected
                  ? "text-[hsl(var(--gold))]"
                  : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              {connected ? "Connected" : "Not Connected"}
            </div>
          </div>
        </div>
        <span
          className={`w-2.5 h-2.5 rounded-full mt-2 ${
            connected ? "bg-[hsl(var(--gold))]" : "bg-[hsl(var(--muted-foreground)/0.3)]"
          }`}
        />
      </div>

      {connected && state?.preview && (
        <div className="space-y-1 mb-4 text-[11px] text-[hsl(var(--muted-foreground))] font-mono tracking-tight">
          {Object.entries(state.preview).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <span className="opacity-60">{k}</span>
              <span className="truncate">{v || "—"}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          data-testid={`connect-${platform}`}
          onClick={() => onConnect(platform)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[hsl(var(--gold))] text-[hsl(var(--gold))] text-[10px] tracking-elegant uppercase hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--obsidian))] transition-colors"
        >
          {connected ? <PlugZap size={12} strokeWidth={1.5} /> : <Plug size={12} strokeWidth={1.5} />}
          {connected ? "Update" : "Connect"}
        </button>
        {connected && (
          <button
            data-testid={`disconnect-${platform}`}
            onClick={() => onDisconnect(platform)}
            className="py-2.5 px-3 border border-red-500/30 text-red-300/80 text-[10px] tracking-elegant uppercase hover:border-red-400 hover:text-red-300"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}

function ConnectModal({ platform, onClose, onSaved }) {
  const meta = PLATFORM_META[platform];
  const [vals, setVals] = useState({});
  const [saving, setSaving] = useState(false);

  if (!meta) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/social/credentials/${platform}`, { fields: vals });
      toast.success(`${meta.name} connected.`);
      onSaved?.();
      onClose();
    } catch (err) {
      const detail =
        err?.response?.data?.detail || err?.message || "Connection failed.";
      toast.error(typeof detail === "string" ? detail : "Connection failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {platform && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-[hsl(var(--obsidian)/0.85)] backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[hsl(0_0%_5%)] border border-[hsl(var(--gold)/0.3)] p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">
                  Connect Platform
                </div>
                <h3 className="font-display italic text-2xl text-[hsl(var(--ivory))] mt-1">
                  {meta.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-[hsl(var(--ivory))] hover:text-[hsl(var(--gold))]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-[hsl(var(--muted-foreground))] text-xs leading-relaxed mb-5">
              {meta.helpText}{" "}
              <a
                href={meta.helpUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[hsl(var(--gold))] hover:underline inline-flex items-center gap-1"
              >
                Docs <ExternalLink size={10} />
              </a>
            </p>

            <form onSubmit={submit} className="space-y-3">
              {meta.fields.map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))]">
                    {f.label}
                  </label>
                  <input
                    data-testid={`field-${platform}-${f.key}`}
                    type={f.type}
                    value={vals[f.key] || ""}
                    onChange={(e) =>
                      setVals((s) => ({ ...s, [f.key]: e.target.value }))
                    }
                    className="lux-input"
                    autoComplete="off"
                    required
                  />
                </div>
              ))}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[hsl(var(--muted-foreground))] text-[10px] tracking-elegant uppercase hover:text-[hsl(var(--ivory))]"
                >
                  Cancel
                </button>
                <button
                  data-testid={`save-${platform}`}
                  type="submit"
                  disabled={saving}
                  className="btn-gold disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save & Connect"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SocialConnections({ onChange }) {
  const [creds, setCreds] = useState({});
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/social/credentials`);
      setCreds(data);
      onChange?.(data);
    } catch {
      toast.error("Failed to load connections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = async (platform) => {
    if (!window.confirm(`Disconnect ${PLATFORM_META[platform].name}?`)) return;
    try {
      await axios.delete(`${API}/social/credentials/${platform}`);
      toast.success(`${PLATFORM_META[platform].name} disconnected.`);
      load();
    } catch {
      toast.error("Disconnect failed.");
    }
  };

  return (
    <section data-testid="social-connections" className="mb-12">
      <div className="flex items-end justify-between mb-5">
        <div>
          <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px]">
            Connections
          </span>
          <h2 className="font-display italic text-2xl text-[hsl(var(--ivory))] mt-1.5 font-light">
            Social accounts
          </h2>
        </div>
      </div>

      {loading ? (
        <p className="text-[hsl(var(--muted-foreground))] text-sm">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(PLATFORM_META).map((p) => (
            <ConnectionCard
              key={p}
              platform={p}
              state={creds[p]}
              onConnect={setActive}
              onDisconnect={disconnect}
            />
          ))}
        </div>
      )}

      <ConnectModal
        platform={active}
        onClose={() => setActive(null)}
        onSaved={load}
      />
    </section>
  );
}
