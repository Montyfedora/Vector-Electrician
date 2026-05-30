import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listLeads, parseLeadRow, type ParsedLead } from "@/lib/analyzer.functions";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({
    meta: [{ title: "Leads — Vector.SEO Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLeads,
});

type Snapshot = {
  brand?: string;
  domain?: string;
  city?: string;
  priority?: string;
  services?: string[];
  notServices?: string[];
  answers?: Record<string, string>;
};

function AdminLeads() {
  const fetchLeads = useServerFn(listLeads);
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<ParsedLead[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetchLeads({ data: { token, limit: 200 } });
      if (!res.ok) {
        setErr(res.error);
        setBusy(false);
        return;
      }
      setLeads(res.leads.map(parseLeadRow));
      setAuthed(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setBusy(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <form
          onSubmit={load}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4"
        >
          <div>
            <h1 className="text-xl font-bold">Vector.SEO — Leads</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your admin access code to view leads.
            </p>
          </div>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Access code"
            autoFocus
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            type="submit"
            disabled={busy || !token}
            className="w-full rounded-md bg-primary text-primary-foreground font-medium py-2.5 disabled:opacity-60"
          >
            {busy ? "Loading…" : "View leads"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <h1 className="font-semibold">
            Leads <span className="text-muted-foreground font-normal">· {leads.length}</span>
          </h1>
          <button
            onClick={() => load()}
            disabled={busy}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60"
          >
            {busy ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {err && <p className="mb-4 text-sm text-destructive">{err}</p>}
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Business / Target</th>
                  <th className="text-left px-4 py-2 font-medium">Article</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const snap = (lead.snapshot ?? {}) as Snapshot;
                  const isOpen = openId === lead.id;
                  return (
                    <>
                      <tr key={lead.id} className="border-t border-border align-top">
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                          {new Date(lead.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">{lead.name}</td>
                        <td className="px-4 py-3">
                          <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                            {lead.email}
                          </a>
                        </td>
                        <td className="px-4 py-3">{lead.target}</td>
                        <td className="px-4 py-3">
                          {lead.article ? (
                            <button
                              onClick={() => setOpenId(isOpen ? null : lead.id)}
                              className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
                            >
                              {isOpen ? "Hide" : "View"} article
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                      {isOpen && lead.article && (
                        <tr className="border-t border-border bg-muted/30">
                          <td colSpan={5} className="px-4 py-4">
                            <LeadDetail snap={snap} article={lead.article} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function LeadDetail({
  snap,
  article,
}: {
  snap: Snapshot;
  article: NonNullable<ParsedLead["article"]>;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="space-y-2 text-sm">
        <h3 className="font-semibold">Business</h3>
        <dl className="space-y-1 text-muted-foreground">
          <div>
            <span className="text-foreground">Brand:</span> {snap.brand || "—"}
          </div>
          <div>
            <span className="text-foreground">Domain:</span> {snap.domain || "—"}
          </div>
          <div>
            <span className="text-foreground">City:</span> {snap.city || "—"}
          </div>
          <div>
            <span className="text-foreground">Priority:</span> {snap.priority || "—"}
          </div>
          <div>
            <span className="text-foreground">Services:</span> {snap.services?.join(", ") || "—"}
          </div>
          <div>
            <span className="text-foreground">Not offered:</span>{" "}
            {snap.notServices?.join(", ") || "—"}
          </div>
        </dl>
        {snap.answers && Object.keys(snap.answers).length > 0 && (
          <>
            <h3 className="font-semibold pt-2">Survey</h3>
            <dl className="space-y-1 text-muted-foreground">
              {Object.entries(snap.answers).map(([k, v]) => (
                <div key={k}>
                  <span className="text-foreground">{k}:</span> {v}
                </div>
              ))}
            </dl>
          </>
        )}
      </div>

      <div className="md:col-span-2">
        <h3 className="font-semibold text-sm mb-2">
          {(article as { title?: string }).title || "Generated article"}
        </h3>
        <div className="max-h-[420px] overflow-auto rounded-lg border border-border bg-background p-4 text-sm whitespace-pre-wrap text-muted-foreground">
          {(article as { markdown?: string }).markdown || JSON.stringify(article, null, 2)}
        </div>
      </div>
    </div>
  );
}
