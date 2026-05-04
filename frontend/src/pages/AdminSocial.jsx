import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  RefreshCw,
  Send,
  Clock,
  X as XIcon,
  Sparkles,
  Image as ImageIcon,
  Edit3,
  Check,
  AlertCircle,
  Calendar,
} from "lucide-react";
import SocialConnections from "../components/SocialConnections";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PLATFORM_LABEL = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
};

function absUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${process.env.REACT_APP_BACKEND_URL}${path}`;
}

export default function AdminSocial() {
  const [config, setConfig] = useState(null);
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    caption: "",
    hashtags: [],
    platforms: [],
    image_url: "",
  });
  const [scheduleAt, setScheduleAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, t, h] = await Promise.all([
        axios.get(`${API}/social/config`),
        axios.get(`${API}/social/drafts/today`),
        axios.get(`${API}/social/drafts?limit=20`),
      ]);
      setConfig(c.data);
      setToday(t.data && t.data.id ? t.data : null);
      setHistory(h.data || []);
    } catch (e) {
      toast.error("Failed to load social drafts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Lumière · Admin · Social";
    load();
  }, [load]);

  useEffect(() => {
    if (today && !editing) {
      setDraft({
        caption: today.caption || "",
        hashtags: today.hashtags || [],
        platforms: today.platforms || [],
        image_url: today.image_url || "",
      });
    }
  }, [today, editing]);

  const generate = async () => {
    setGenerating(true);
    toast.message("Generating today's draft… this may take 20–40s.");
    try {
      const { data } = await axios.post(`${API}/social/drafts/generate`, {});
      setToday(data);
      setEditing(false);
      toast.success("Draft generated.");
      load();
    } catch (e) {
      toast.error("Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const saveEdits = async () => {
    if (!today) return;
    try {
      const { data } = await axios.patch(`${API}/social/drafts/${today.id}`, {
        caption: draft.caption,
        hashtags: draft.hashtags,
        platforms: draft.platforms,
        image_url: draft.image_url,
      });
      setToday(data);
      setEditing(false);
      toast.success("Saved.");
    } catch {
      toast.error("Save failed.");
    }
  };

  const reject = async () => {
    if (!today) return;
    if (!window.confirm("Reject this draft? You can generate a new one.")) return;
    try {
      await axios.post(`${API}/social/drafts/${today.id}/reject`);
      setToday(null);
      toast.success("Draft rejected.");
      load();
    } catch {
      toast.error("Reject failed.");
    }
  };

  const publish = async ({ schedule = false } = {}) => {
    if (!today) return;
    if ((draft.platforms || []).length === 0) {
      toast.error("Pick at least one platform.");
      return;
    }
    setPublishing(true);
    try {
      const body = schedule
        ? { publish_now: false, scheduled_for: new Date(scheduleAt).toISOString(), platforms: draft.platforms }
        : { publish_now: true, platforms: draft.platforms };
      const { data } = await axios.post(`${API}/social/drafts/${today.id}/publish`, body);
      if (schedule) {
        toast.success(`Scheduled for ${new Date(scheduleAt).toLocaleString()}.`);
      } else {
        const mocked = (data.results || []).some((r) => r.mocked);
        if (mocked) {
          toast.message(
            "Posted (MOCKED) — connect platform tokens in backend/.env to enable real publishing.",
            { duration: 6000 }
          );
        } else {
          toast.success("Posted to all selected platforms.");
        }
      }
      load();
    } catch (e) {
      toast.error("Publish failed.");
    } finally {
      setPublishing(false);
    }
  };

  const togglePlatform = (p) => {
    setDraft((d) => {
      const set = new Set(d.platforms || []);
      set.has(p) ? set.delete(p) : set.add(p);
      return { ...d, platforms: Array.from(set) };
    });
  };

  return (
    <section data-testid="admin-social-page">
      <SocialConnections onChange={() => load()} />

      <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
        <div>
          <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px]">
            Studio · AI Social Editor
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3 italic font-light">
            Today's Post
          </h1>
          {config && (
            <p className="text-[hsl(var(--muted-foreground))] mt-2 text-xs">
              Auto-generated daily at{" "}
              <span className="text-[hsl(var(--gold))]">
                {config.daily_time_ist} IST
              </span>{" "}
              · {Object.values(config.configured).filter(Boolean).length} of{" "}
              {Object.keys(config.configured).length} platforms connected
            </p>
          )}
        </div>
        <button
          data-testid="generate-draft-btn"
          onClick={generate}
          disabled={generating}
          className="btn-gold disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            strokeWidth={1.5}
            className={generating ? "animate-spin" : ""}
          />
          {generating ? "Generating…" : today ? "Regenerate" : "Generate Today's Draft"}
        </button>
      </div>

      {loading && (
        <p className="text-[hsl(var(--muted-foreground))]">Loading…</p>
      )}

      {!loading && !today && (
        <div className="border border-dashed border-[hsl(var(--border))] p-14 text-center">
          <Sparkles
            size={36}
            strokeWidth={1}
            className="mx-auto mb-4 text-[hsl(var(--gold))]"
          />
          <p className="font-display text-2xl text-[hsl(var(--ivory))]">
            No draft for today yet
          </p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-3 max-w-sm mx-auto">
            Click <em className="text-[hsl(var(--gold))]">Generate Today's Draft</em>{" "}
            to compose a caption + AI image with the studio's signature voice.
          </p>
        </div>
      )}

      {!loading && today && (
        <div
          data-testid="today-draft-card"
          className="grid lg:grid-cols-12 gap-8 bg-[hsl(0_0%_5%)] border border-[hsl(var(--gold)/0.18)] p-6 lg:p-10"
        >
          {/* Image side */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] bg-[hsl(0_0%_8%)] border border-[hsl(var(--border))] overflow-hidden">
              {draft.image_url ? (
                <img
                  src={absUrl(draft.image_url)}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                  <ImageIcon size={32} />
                </div>
              )}
              <span
                className={`absolute top-3 left-3 px-2.5 py-1 text-[9px] tracking-luxury uppercase border ${
                  today.status === "posted"
                    ? "bg-[hsl(var(--gold))] text-[hsl(var(--obsidian))] border-[hsl(var(--gold))]"
                    : today.status === "scheduled"
                    ? "border-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {today.status}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-xs text-[hsl(var(--muted-foreground))]">
              <div>
                <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[9px] mr-2">
                  Theme
                </span>
                {today.theme}
              </div>
              {today.image_prompt && (
                <div>
                  <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[9px] mr-2">
                    Image direction
                  </span>
                  {today.image_prompt}
                </div>
              )}
              {editing && (
                <div>
                  <label className="block text-[9px] tracking-luxury uppercase text-[hsl(var(--gold))] mt-3 mb-1">
                    Replace image URL (optional)
                  </label>
                  <input
                    data-testid="edit-image-url"
                    type="text"
                    value={draft.image_url || ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, image_url: e.target.value }))
                    }
                    className="lux-input"
                    placeholder="https://… or /api/static/social/…"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content side */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px]">
                Caption
              </span>
              {!editing ? (
                <button
                  data-testid="edit-draft-btn"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-[hsl(var(--ivory))] text-[10px] tracking-elegant uppercase hover:text-[hsl(var(--gold))]"
                >
                  <Edit3 size={12} strokeWidth={1.4} /> Edit
                </button>
              ) : (
                <button
                  data-testid="save-edit-btn"
                  onClick={saveEdits}
                  className="flex items-center gap-1.5 text-[hsl(var(--gold))] text-[10px] tracking-elegant uppercase"
                >
                  <Check size={12} strokeWidth={1.6} /> Save
                </button>
              )}
            </div>

            {!editing ? (
              <p className="font-display whitespace-pre-line text-[hsl(var(--ivory))] text-base lg:text-lg leading-relaxed">
                {draft.caption}
              </p>
            ) : (
              <textarea
                data-testid="edit-caption"
                value={draft.caption}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, caption: e.target.value }))
                }
                rows={8}
                className="lux-input border border-[hsl(var(--border))] p-4 leading-relaxed"
              />
            )}

            {/* Hashtags */}
            <div className="mt-6">
              <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px]">
                Hashtags
              </span>
              {!editing ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(draft.hashtags || []).map((h) => (
                    <span
                      key={h}
                      className="px-2.5 py-1 text-xs border border-[hsl(var(--border))] text-[hsl(var(--ivory))]"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              ) : (
                <input
                  data-testid="edit-hashtags"
                  type="text"
                  value={(draft.hashtags || []).join(" ")}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      hashtags: e.target.value
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((h) => (h.startsWith("#") ? h : `#${h}`)),
                    }))
                  }
                  className="lux-input"
                  placeholder="#tag1 #tag2 ..."
                />
              )}
            </div>

            {/* Platforms */}
            <div className="mt-6">
              <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px]">
                Publish to
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(PLATFORM_LABEL).map((p) => {
                  const checked = (draft.platforms || []).includes(p);
                  const configured = config?.configured?.[p];
                  return (
                    <button
                      key={p}
                      data-testid={`platform-${p}`}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-elegant uppercase border transition-all ${
                        checked
                          ? "bg-[hsl(var(--gold))] text-[hsl(var(--obsidian))] border-[hsl(var(--gold))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--gold))]"
                      }`}
                    >
                      {PLATFORM_LABEL[p]}
                      {!configured && (
                        <span
                          title="Not connected — will be MOCKED"
                          className="text-[9px] opacity-70"
                        >
                          · MOCK
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {config && Object.values(config.configured).every((v) => !v) && (
                <p className="mt-3 flex items-start gap-2 text-[10px] text-[hsl(var(--muted-foreground))] tracking-elegant">
                  <AlertCircle
                    size={12}
                    strokeWidth={1.4}
                    className="mt-0.5 text-[hsl(var(--gold))]"
                  />
                  No platforms connected yet. Posts will be saved & marked
                  posted but not actually published. Add tokens to backend/.env
                  to go live.
                </p>
              )}
            </div>

            {/* Schedule + actions */}
            <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
              {today.status !== "posted" && today.status !== "rejected" && (
                <>
                  <div className="flex flex-wrap items-end gap-3 mb-3">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-[9px] tracking-luxury uppercase text-[hsl(var(--gold))]">
                        Schedule for
                      </label>
                      <input
                        data-testid="schedule-input"
                        type="datetime-local"
                        value={scheduleAt}
                        onChange={(e) => setScheduleAt(e.target.value)}
                        className="lux-input"
                      />
                    </div>
                    <button
                      data-testid="schedule-btn"
                      onClick={() => publish({ schedule: true })}
                      disabled={!scheduleAt || publishing}
                      className="btn-ghost-gold disabled:opacity-50"
                    >
                      <Calendar size={13} strokeWidth={1.5} /> Schedule
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <button
                      data-testid="publish-now-btn"
                      onClick={() => publish({ schedule: false })}
                      disabled={publishing}
                      className="btn-gold disabled:opacity-60"
                    >
                      <Send size={13} strokeWidth={1.5} />
                      {publishing ? "Publishing…" : "Approve & Post Now"}
                    </button>
                    <button
                      data-testid="reject-btn"
                      onClick={reject}
                      className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-red-400 text-[10px] tracking-luxury uppercase transition-colors"
                    >
                      <XIcon size={12} strokeWidth={1.4} /> Reject
                    </button>
                  </div>
                </>
              )}
              {today.publish_results && today.publish_results.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {today.publish_results.map((r, i) => (
                    <span
                      key={i}
                      className={`text-[10px] px-2.5 py-1 border tracking-elegant ${
                        r.ok
                          ? "border-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                          : "border-red-400 text-red-400"
                      }`}
                    >
                      {PLATFORM_LABEL[r.platform] || r.platform}:{" "}
                      {r.ok ? (r.mocked ? "Mocked ✓" : "Posted ✓") : "Failed"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl italic font-light text-[hsl(var(--ivory))] mb-6">
            Recent drafts
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.slice(0, 9).map((d) => (
              <div
                key={d.id}
                data-testid={`history-${d.id}`}
                className="bg-[hsl(0_0%_5%)] border border-[hsl(var(--border))] p-4"
              >
                <div className="flex items-center gap-2 text-[9px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))] mb-3">
                  <Clock size={10} strokeWidth={1.4} />
                  {new Date(d.created_at).toLocaleString()}
                  <span
                    className={`ml-auto px-1.5 py-0.5 ${
                      d.status === "posted"
                        ? "bg-[hsl(var(--gold))] text-[hsl(var(--obsidian))]"
                        : d.status === "scheduled"
                        ? "border border-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                        : d.status === "rejected"
                        ? "border border-red-400 text-red-400"
                        : "border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <p className="text-[hsl(var(--ivory))] text-sm leading-relaxed line-clamp-4">
                  {d.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
