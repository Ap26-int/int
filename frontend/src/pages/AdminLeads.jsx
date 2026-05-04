import { useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Lumière · Admin · Leads";
    (async () => {
      try {
        const { data } = await axios.get(`${API}/leads`);
        setLeads(data);
      } catch (e) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section data-testid="admin-leads-page">
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <span className="text-[hsl(var(--gold))] tracking-luxury uppercase text-[10px]">
            Studio · Inbox
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3 italic font-light">
            Consultation Inquiries
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2 text-sm">
            {leads.length} {leads.length === 1 ? "entry" : "entries"}
          </p>
        </div>
      </div>

      {loading && <p className="text-[hsl(var(--muted-foreground))]">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && leads.length === 0 && (
        <p className="text-[hsl(var(--muted-foreground))] py-20 text-center border border-[hsl(var(--border))]">
          No inquiries yet.
        </p>
      )}

      {leads.length > 0 && (
        <div className="border border-[hsl(var(--border))] overflow-x-auto">
          <table data-testid="leads-table" className="w-full text-sm">
            <thead className="bg-[hsl(0_0%_6%)] text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Project</th>
                <th className="text-left p-4">Source</th>
                <th className="text-left p-4">Message</th>
                <th className="text-left p-4">Received</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr
                  key={l.id}
                  data-testid={`lead-row-${l.id}`}
                  className="border-t border-[hsl(var(--border))] hover:bg-[hsl(0_0%_5%)] transition-colors"
                >
                  <td className="p-4">{l.name}</td>
                  <td className="p-4">
                    <a
                      href={`tel:${l.phone}`}
                      className="hover:text-[hsl(var(--gold))]"
                    >
                      {l.phone}
                    </a>
                  </td>
                  <td className="p-4">
                    <a
                      href={`mailto:${l.email}`}
                      className="hover:text-[hsl(var(--gold))]"
                    >
                      {l.email}
                    </a>
                  </td>
                  <td className="p-4">{l.project_type}</td>
                  <td className="p-4 text-[hsl(var(--gold))] text-xs tracking-elegant uppercase">
                    {l.source || "site"}
                  </td>
                  <td className="p-4 max-w-xs truncate">{l.message || "—"}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
