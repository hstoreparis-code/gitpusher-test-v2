import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function AdminPagesContentPanel() {
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ slug: "", page_type: "seo", title: "", description: "", body: "", status: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMap, setStatusMap] = useState({});
  const [checking, setChecking] = useState(false);
  const [autofixing, setAutofixing] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/admin/pages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPages(res.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const onSelect = (page) => {
    setSelected(page.slug);
    setForm({
      slug: page.slug,
      page_type: page.page_type,
      title: page.title,
      description: page.description,
      body: page.body,
      status: page.status || "",
    });
  };

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await axios.post(
        `${API}/admin/pages`,
        {
          slug: form.slug,
          page_type: form.page_type,
          title: form.title,
          description: form.description,
          body: form.body,
          status: form.status || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const saved = res.data;
      setPages((prev) => {
        const idx = prev.findIndex((p) => p.slug === saved.slug);
        if (idx === -1) return [...prev, saved];
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      });
      setSelected(saved.slug);
      setForm((prev) => ({ ...prev, status: saved.status || "" }));
    } finally {
      setSaving(false);
    }
  };

  const onExportJson = async () => {
    if (!token) return;
    const res = await axios.get(`${API}/admin/pages/export/json`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pages-export-${new Date().toISOString()}.json`;
    a.click();
  };

  const onAutofix = async () => {
    if (!token || autofixing) return;
    setAutofixing(true);
    try {
      const updated = [];
      const hints = [];
      for (const p of pages) {
        if (statusMap[p.slug] === "error") {
          // Autofix simple : si le slug ne commence pas par une barre, on la rajoute
          let fixedSlug = p.slug;
          if (!fixedSlug.startsWith("/")) {
            fixedSlug = `/${fixedSlug}`;
          }
          // Si la page est SEO et commence par /seo/, on vérifie que la route est cohérente
          // (ici on se contente de normaliser le slug et de la marquer active)
          const res = await axios.post(
            `${API}/admin/pages`,
            {
              slug: fixedSlug.replace(/^\//, ""),
              page_type: p.page_type,
              title: p.title,
              description: p.description,
              body: p.body,
              status: "active",
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          updated.push(res.data);
          hints.push(`Page ${p.slug} normalisée en ${fixedSlug} et marquée active.`);
        }
      }
      if (updated.length > 0) {
        setPages((prev) => {
          const map = new Map(prev.map((x) => [x.slug, x]));
          for (const u of updated) {
            map.set(u.slug, u);
          }
          return Array.from(map.values());
        });
        // Re-vérification rapide pour tenter de passer le rouge au vert
        const results = {};
        for (const p of updated) {
          try {
            const res = await axios.get(`${window.location.origin}/${p.slug}`);
            results[p.slug] = res.status === 200 ? "active" : "error";
          } catch (e) {
            results[p.slug] = "error";
          }
        }
        setStatusMap((prev) => ({ ...prev, ...results }));
      } else {
        hints.push("Aucune page en erreur à corriger.");
      }
      if (hints.length > 0) {
        alert(
          [
            "Autofix terminé.",
            "Si certaines pastilles restent rouges, vérifiez :",
            "- Que la route frontend existe bien (App.js / pages/seo/).",
            "- Que le slug correspond exactement à l’URL.",
            "- Que la page ne renvoie pas une erreur serveur.",
            "",
            ...hints,
          ].join("\n"),
        );
      }
    } finally {
      setAutofixing(false);
    }
  };

  return (
    <Card className="bg-slate-900/80 border-white/10 text-emerald-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base text-emerald-300">Pages SEO / AEO</CardTitle>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[10px] text-slate-400">
            Vert = page accessible (HTTP 200) · Rouge = erreur d’accès (404/500…) · Autofix tente de corriger et explique quoi faire si le rouge persiste.
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
            onClick={async () => {
              if (!token || checking) return;
              setChecking(true);
              try {
                const results = {};
                for (const p of pages) {
                  try {
                    let pathSlug = p.slug;
                    // Mapper les variantes EN vers l’URL publique réelle
                    if (pathSlug.startsWith("seo/") && pathSlug.endsWith("-en")) {
                      pathSlug = pathSlug.replace(/-en$/, "");
                    }
                    const url = `${window.location.origin}/${pathSlug}`;
                    const res = await axios.get(url);
                    results[p.slug] = res.status === 200 ? "active" : "error";
                  } catch (e) {
                    results[p.slug] = "error";
                  }
                }
                setStatusMap(results);
              } finally {
                setChecking(false);
              }
            }}
          >
            {checking ? "Vérification…" : "Vérifier statut"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs bg-orange-500 hover:bg-orange-400 text-slate-950 border-orange-400"
            onClick={onAutofix}
            disabled={autofixing || Object.values(statusMap).filter(s => s === "error").length === 0}
          >
            {autofixing ? "Correction…" : "Autofix"}
          </Button>
          <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={onExportJson}>
            <Download className="w-4 h-4 mr-1" /> Export JSON
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-4">
        <div className="space-y-2 max-h-80 overflow-y-auto border border-slate-800 rounded-lg p-2 text-xs">
          {loading ? (
            <p className="text-emerald-300">Chargement…</p>
          ) : pages.length === 0 ? (
            <p className="text-emerald-300">Aucune page enregistrée pour l’instant.</p>
          ) : (
            pages.map((p) => (
              <button
                key={p.slug}
                onClick={() => onSelect(p)}
                className={`w-full text-left px-2 py-1 rounded-md hover:bg-slate-800/70 ${
                  selected === p.slug ? "bg-slate-800 border border-cyan-500/60" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-emerald-300">{p.slug}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-400 text-emerald-300">
                    <span>{p.page_type}</span>
                    {statusMap[p.slug] === "active" && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    {statusMap[p.slug] === "error" && <span className="w-2 h-2 rounded-full bg-red-500" />}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{p.title}</div>
                {p.body && (
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {p.body.length > 120 ? p.body.slice(0, 120) + "…" : p.body}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-slate-300">Slug</label>
              <Input
                value={form.slug}
                onChange={(e) => onChange("slug", e.target.value)}
                placeholder="seo/push-automatically"
                className="h-8 text-xs bg-slate-950/60 border-slate-700"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-300">Type</label>
              <select
                value={form.page_type}
                onChange={(e) => onChange("page_type", e.target.value)}
                className="h-8 w-full rounded-md bg-slate-950/60 border border-slate-700 text-xs px-2"
              >
                <option value="seo">SEO</option>
                <option value="aeo">AEO</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-slate-300">Titre</label>
              <Input
                value={form.title}
                onChange={(e) => onChange("title", e.target.value)}
                className="h-8 text-xs bg-slate-950/60 border-slate-700"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-300">Statut</label>
              <select
                value={form.status}
                onChange={(e) => onChange("status", e.target.value)}
                className="h-8 w-full rounded-md bg-slate-950/60 border border-slate-700 text-xs px-2"
              >
                <option value="">(auto)</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-slate-300">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={2}
              className="text-xs bg-slate-950/60 border-slate-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300">Contenu (Markdown ou HTML léger)</label>
            <Textarea
              value={form.body}
              onChange={(e) => onChange("body", e.target.value)}
              rows={10}
              className="text-xs font-mono bg-slate-950/60 border-slate-700"
            />
          </div>

          <div className="flex justify-end items-center gap-2">
            {form.status && (
              <span className={`text-[10px] px-2 py-1 rounded-full border ${
                form.status === "active"
                  ? "border-emerald-400 text-emerald-300"
                  : "border-slate-500 text-slate-300"
              }`}>
                {form.status === "active" ? "Actif" : "Inactif"}
              </span>
            )}
            <Button
              size="sm"
              className="rounded-full px-4 text-xs"
              onClick={onSave}
              disabled={saving || !form.slug}
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
