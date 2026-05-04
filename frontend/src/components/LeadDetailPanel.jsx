import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Calendar as CalendarIcon,
  Tag,
  Trash2,
  Plus,
  Check,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUSES = [
  { key: "new", label: "New", color: "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]" },
  { key: "contacted", label: "Contacted", color: "border-blue-400/40 text-blue-300" },
  { key: "qualified", label: "Qualified", color: "border-[hsl(var(--gold))] text-[hsl(var(--gold))]" },
  { key: "scheduled", label: "Scheduled", color: "border-purple-400/40 text-purple-300" },
  { key: "won", label: "Won", color: "bg-[hsl(var(--gold))] text-[hsl(var(--obsidian))] border-[hsl(var(--gold))]" },
  { key: "lost", label: "Lost", color: "border-red-400/40 text-red-300" },
];

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function LeadDetailPanel({ lead, onClose, onUpdate }) {
  const [local, setLocal] = useState(lead);
  const [comment, setComment] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [savingField, setSavingField] = useState("");

  useEffect(() => setLocal(lead), [lead]);

  const patch = async (data, fieldKey = "status") => {
    setSavingField(fieldKey);
    try {
      const { data: updated } = await axios.patch(
        `${API}/leads/${local.id}`,
        data
      );
      setLocal(updated);
      onUpdate?.(updated);
    } catch {
      toast.error("Save failed");
    } finally {
      setSavingField("");
    }
  };

  const setStatus = (s) => patch({ status: s }, "status");
  const setFollowUp = (d) => patch({ follow_up_date: d || "" }, "follow_up_date");

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if ((local.tags || []).includes(t)) {
      setTagInput("");
      return;
    }
    patch({ tags: [...(local.tags || []), t] }, "tags");
    setTagInput("");
  };
  const removeTag = (t) =>
    patch({ tags: (local.tags || []).filter((x) => x !== t) }, "tags");

  const addComment = async () => {
    const txt = comment.trim();
    if (!txt) return;
    try {
      const { data } = await axios.post(
        `${API}/leads/${local.id}/comments`,
        { text: txt }
      );
      const next = { ...local, comments: [...(local.comments || []), data] };
      setLocal(next);
      onUpdate?.(next);
      setComment("");
      toast.success("Comment added.");
    } catch {
      toast.error("Failed to add comment.");
    }
  };

  const deleteComment = async (cid) => {
    try {
      await axios.delete(`${API}/leads/${local.id}/comments/${cid}`);
      const next = {
        ...local,
        comments: (local.comments || []).filter((c) => c.id !== cid),
      };
      setLocal(next);
      onUpdate?.(next);
    } catch {
      toast.error("Delete failed.");
    }
  };

  return (
    <AnimatePresence>
      {local && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[hsl(var(--obsidian)/0.7)] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            data-testid="lead-detail-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xl bg-[hsl(0_0%_5%)] border-l border-[hsl(var(--gold)/0.2)] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-[hsl(0_0%_5%)] border-b border-[hsl(var(--border))] px-6 py-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">
                  Inquiry · {local.source}
                </div>
                <h2 className="font-display italic text-2xl sm:text-3xl text-[hsl(var(--ivory))] mt-1.5 font-light">
                  {local.name}
                </h2>
                <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1">
                  Received {fmtDate(local.created_at)}
                </p>
              </div>
              <button
                data-testid="lead-panel-close"
                onClick={onClose}
                className="text-[hsl(var(--ivory))] hover:text-[hsl(var(--gold))]"
                aria-label="Close"
              >
                <X size={22} strokeWidth={1.4} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-8">
              {/* Quick contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`tel:${local.phone}`}
                  className="flex items-center gap-3 p-3 border border-[hsl(var(--border))] hover:border-[hsl(var(--gold))] transition-colors"
                >
                  <Phone size={14} strokeWidth={1.4} className="text-[hsl(var(--gold))]" />
                  <span className="text-sm">{local.phone}</span>
                </a>
                <a
                  href={`mailto:${local.email}`}
                  className="flex items-center gap-3 p-3 border border-[hsl(var(--border))] hover:border-[hsl(var(--gold))] transition-colors"
                >
                  <Mail size={14} strokeWidth={1.4} className="text-[hsl(var(--gold))]" />
                  <span className="text-sm truncate">{local.email}</span>
                </a>
              </div>

              {/* Status pipeline */}
              <div>
                <div className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase mb-3">
                  Status
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => {
                    const active = local.status === s.key;
                    return (
                      <button
                        key={s.key}
                        data-testid={`status-${s.key}`}
                        onClick={() => setStatus(s.key)}
                        disabled={savingField === "status"}
                        className={`px-3 py-1.5 text-[10px] tracking-elegant uppercase border transition-all ${
                          active
                            ? s.color
                            : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))]"
                        }`}
                      >
                        {active && <Check size={10} className="inline mr-1" />}
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Follow-up date */}
              <div>
                <div className="flex items-center gap-2 text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase mb-3">
                  <CalendarIcon size={12} strokeWidth={1.4} />
                  Follow-up Date
                </div>
                <div className="flex items-center gap-3">
                  <input
                    data-testid="follow-up-date"
                    type="date"
                    value={local.follow_up_date || ""}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className="lux-input flex-1 bg-[hsl(var(--obsidian))] border border-[hsl(var(--border))] px-3 py-2"
                    style={{ colorScheme: "dark" }}
                  />
                  {local.follow_up_date && (
                    <button
                      onClick={() => setFollowUp("")}
                      className="text-[hsl(var(--muted-foreground))] hover:text-red-400 text-[10px] tracking-elegant uppercase"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center gap-2 text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase mb-3">
                  <Tag size={12} strokeWidth={1.4} /> Tags
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(local.tags || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                    >
                      {t}
                      <button
                        onClick={() => removeTag(t)}
                        className="hover:text-red-400"
                        aria-label={`Remove ${t}`}
                      >
                        <X size={10} strokeWidth={1.6} />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      data-testid="tag-input"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="add tag"
                      className="bg-transparent border-b border-[hsl(var(--border))] text-xs px-2 py-1 focus:outline-none focus:border-[hsl(var(--gold))] w-24"
                    />
                    <button
                      onClick={addTag}
                      className="text-[hsl(var(--gold))]"
                      aria-label="Add tag"
                    >
                      <Plus size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Project + message */}
              <div className="bg-[hsl(var(--obsidian))] border border-[hsl(var(--border))] p-4 space-y-2">
                <div className="text-[10px] tracking-luxury uppercase text-[hsl(var(--gold))]">
                  Project
                </div>
                <div className="text-sm">{local.project_type}</div>
                {local.message && (
                  <>
                    <div className="text-[10px] tracking-luxury uppercase text-[hsl(var(--gold))] pt-3">
                      Message
                    </div>
                    <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {local.message}
                    </p>
                  </>
                )}
              </div>

              {/* Comments timeline */}
              <div>
                <div className="flex items-center gap-2 text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase mb-3">
                  <MessageSquare size={12} strokeWidth={1.4} /> Activity
                </div>
                <div className="space-y-3 mb-4">
                  {(local.comments || []).length === 0 && (
                    <p className="text-[hsl(var(--muted-foreground))] text-xs italic">
                      No notes yet. Add the first follow-up below.
                    </p>
                  )}
                  {(local.comments || []).map((c) => (
                    <div
                      key={c.id}
                      data-testid={`comment-${c.id}`}
                      className="border-l-2 border-[hsl(var(--gold))] pl-4 py-1 group"
                    >
                      <p className="text-sm text-[hsl(var(--ivory))] whitespace-pre-line">
                        {c.text}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] tracking-elegant">
                          {c.author_name || c.author_email} · {fmtDate(c.created_at)}
                        </p>
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-opacity"
                          aria-label="Delete comment"
                        >
                          <Trash2 size={11} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <textarea
                  data-testid="comment-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addComment();
                  }}
                  rows={3}
                  placeholder="Add a follow-up note… (Cmd/Ctrl+Enter to send)"
                  className="w-full bg-[hsl(var(--obsidian))] border border-[hsl(var(--border))] p-3 text-sm focus:border-[hsl(var(--gold))] focus:outline-none resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    data-testid="comment-submit"
                    onClick={addComment}
                    disabled={!comment.trim()}
                    className="btn-gold disabled:opacity-50"
                    style={{ padding: "0.7rem 1.4rem", fontSize: "0.65rem" }}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
