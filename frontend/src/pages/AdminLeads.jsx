import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import LeadDetailPanel from "../components/LeadDetailPanel";
import { Search, Filter } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_META = {
  new: { label: "New", cls: "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]" },
  contacted: { label: "Contacted", cls: "border-blue-400/40 text-blue-300" },
  qualified: { label: "Qualified", cls: "border-[hsl(var(--gold))] text-[hsl(var(--gold))]" },
  scheduled: { label: "Scheduled", cls: "border-purple-400/40 text-purple-300" },
  won: { label: "Won", cls: "bg-[hsl(var(--gold))] text-[hsl(var(--obsidian))] border-[hsl(var(--gold))]" },
  lost: { label: "Lost", cls: "border-red-400/40 text-red-300" },
};

const STATUS_FILTERS = ["all", "new", "contacted", "qualified", "scheduled", "won", "lost"];

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/leads`);
      setLeads(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Lumière · Admin · Leads";
    load();
  }, []);

  const filtered = useMemo(() => {
    let out = leads;
    if (statusFilter !== "all") out = out.filter((l) => (l.status || "new") === statusFilter);
    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter(
        (l) =>
          l.name?.toLowerCase().includes(needle) ||
          l.email?.toLowerCase().includes(needle) ||
          l.phone?.includes(needle) ||
          l.project_type?.toLowerCase().includes(needle) ||
          (l.tags || []).some((t) => t.toLowerCase().includes(needle))
      );
    }
    return out;
  }, [leads, statusFilter, q]);

  const counts = useMemo(() => {
    const c = { all: leads.length };
    Object.keys(STATUS_META).forEach((s) => (c[s] = 0));
    leads.forEach((l) => {
      const s = l.status || "new";
      c[s] = (c[s] || 0) + 1;
    });
    return c;
  }, [leads]);

  const onLeadUpdate = (updated) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setActive(updated);
  };

  return (
    <section data-testid="admin-leads-page">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px]">
            Studio · Inbox
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3 italic font-light">
            Consultation Inquiries
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2 text-sm">
            {leads.length} {leads.length === 1 ? "entry" : "entries"} · click any row to manage
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            strokeWidth={1.4}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
          />
          <input
            data-testid="lead-search"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full bg-[hsl(0_0%_5%)] border border-[hsl(var(--border))] pl-9 pr-3 py-2.5 text-sm focus:border-[hsl(var(--gold))] focus:outline-none"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter size={12} strokeWidth={1.4} className="text-[hsl(var(--muted-foreground))]" />
        {STATUS_FILTERS.map((s) => {
          const active = statusFilter === s;
          const meta = s === "all" ? { label: "All" } : STATUS_META[s];
          return (
            <button
              key={s}
              data-testid={`filter-${s}`}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[10px] tracking-elegant uppercase border transition-all ${
                active
                  ? "bg-[hsl(var(--gold))] text-[hsl(var(--obsidian))] border-[hsl(var(--gold))]"
                  : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--gold))]"
              }`}
            >
              {meta.label}
              <span className="ml-1.5 opacity-70">{counts[s] || 0}</span>
            </button>
          );
        })}
      </div>

      {loading && <p className="text-[hsl(var(--muted-foreground))]">Loading…</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-[hsl(var(--muted-foreground))] py-20 text-center border border-[hsl(var(--border))]">
          No matching inquiries.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="border border-[hsl(var(--border))] overflow-x-auto">
          <table data-testid="leads-table" className="w-full text-sm">
            <thead className="bg-[hsl(0_0%_6%)] text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Project</th>
                <th className="text-left p-4">Budget</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Source</th>
                <th className="text-left p-4">Follow-up</th>
                <th className="text-left p-4">Received</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const meta = STATUS_META[l.status || "new"];
                return (
                  <tr
                    key={l.id}
                    data-testid={`lead-row-${l.id}`}
                    onClick={() => setActive(l)}
                    className="border-t border-[hsl(var(--border))] hover:bg-[hsl(0_0%_5%)] transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="text-[hsl(var(--ivory))]">{l.name}</div>
                      <div className="text-[hsl(var(--muted-foreground))] text-xs">
                        {l.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 text-[9px] tracking-elegant uppercase border ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                      {(l.comments || []).length > 0 && (
                        <span className="ml-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                          · {l.comments.length} note{l.comments.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </td>
                    <td className="p-4">{l.project_type}</td>
                    <td className="p-4 text-[hsl(var(--ivory))] text-xs">{l.budget || "—"}</td>
                    <td className="p-4 text-[hsl(var(--muted-foreground))]">
                      {l.phone}
                    </td>
                    <td className="p-4 text-[hsl(var(--gold))] text-xs tracking-elegant uppercase">
                      {l.source || "site"}
                    </td>
                    <td className="p-4 text-[hsl(var(--muted-foreground))] text-xs">
                      {l.follow_up_date
                        ? new Date(l.follow_up_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-4 text-[hsl(var(--muted-foreground))] text-xs">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <LeadDetailPanel
        lead={active}
        onClose={() => setActive(null)}
        onUpdate={onLeadUpdate}
      />
    </section>
  );
}
