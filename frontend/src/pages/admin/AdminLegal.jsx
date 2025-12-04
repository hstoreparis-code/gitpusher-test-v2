import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import AIMeta from "../../components/AIMeta";

export default function AdminLegalPage() {
  const navigate = useNavigate();
  const [legalInfo, setLegalInfo] = useState({
    editor: "[Nom ou raison sociale à renseigner]",
    legalForm: "[Auto‑entrepreneur / SAS / SARL / …]",
    address: "[Adresse complète à renseigner]",
    siren: "[SIREN / SIRET à renseigner]",
    vat: "[Numéro de TVA le cas échéant]",
    director: "[Nom du responsable légal]",
    contact: "[Adresse e‑mail de contact officielle]",
    host: "[Nom de l'hébergeur, adresse, téléphone ou site web]",
  });

  const [cgu, setCgu] = useState({
    service: "Texte de l'objet du service (CGU section 2.1)",
    oauth: "Texte sur la création de compte et connexions OAuth (section 2.2)",
    data: "Texte sur les données traitées (section 2.3)",
    repos: "Texte sur l'accès à vos dépôts Git (section 2.4)",
    responsibility: "Texte sur les responsabilités (section 2.5)",
    security: "Texte sur la sécurité (section 2.6)",
    retention: "Texte sur la conservation & suppression (section 2.7)",
    changes: "Texte sur les modifications des conditions (section 2.8)",
  });

  const [contact, setContact] = useState(
    "Texte sur la politique de contact & réclamations (section 3).",
  );

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const handleCopy = () => {
    const full = `### Informations légales\n\n${JSON.stringify(legalInfo, null, 2)}\n\n### CGU\n\n${JSON.stringify(
      cgu,
      null,
      2,
    )}\n\n### Contact & réclamations\n\n${contact}`;
    navigator.clipboard.writeText(full).catch(() => {});
  };

  const handleSaveSection = async (sectionKey) => {
    try {
      setSaving(true);
      setStatus("");
      const token = typeof window !== "undefined" ? window.localStorage.getItem("admin_token") : null;
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const body = {};
      if (sectionKey === "legalInfo") body.legalInfo = legalInfo;
      if (sectionKey === "cgu") body.cgu = cgu;
      if (sectionKey === "contact") body.contact = contact;

      const res = await fetch("/api/admin/legal/terms", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.legalInfo) setLegalInfo(data.legalInfo);
      if (data.cgu) setCgu(data.cgu);
      if (data.contact) setContact(data.contact);
      setStatus("Modifications enregistrées.");
    } catch (e) {
      setStatus("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 sm:p-8 space-y-6">
      <AIMeta />

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)] border border-cyan-300/80"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Terms &amp; Legal Admin</h1>
            <p className="text-sm text-slate-400 mt-1">
              Espace interne pour préparer / modifier les sections légales et CGU avant intégration sur la page
              publique.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="border-cyan-400/70 text-cyan-200 hover:bg-cyan-500/10"
          onClick={handleCopy}
        >
          <FileText className="w-4 h-4 mr-2" /> Copier tout le contenu
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Colonne 1 : Informations légales */}
        <Card className="lg:col-span-1 bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              1. Informations légales (France)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300">
            <p className="text-[11px] text-slate-400 mb-1">
              Complétez ces champs avec les informations officielles de la société (mentions légales FR).
            </p>
            {Object.entries(legalInfo).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="block text-[11px] text-slate-400 capitalize">{key}</label>
                <textarea
                  className="w-full rounded-md bg-slate-950/60 border border-slate-700/80 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  rows={2}
                  value={value}
                  onChange={(e) => setLegalInfo((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                className="h-7 px-3 text-[11px] bg-cyan-600 hover:bg-cyan-500"
                disabled={saving}
                onClick={() => handleSaveSection("legalInfo")}
              >
                Enregistrer cette section
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Colonne 2 : CGU */}
        <Card className="lg:col-span-1 bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              2. CGU — Sections à remplir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300 max-h-[520px] overflow-y-auto pr-1">
            <p className="text-[11px] text-slate-400 mb-1">
              Prépare chaque bloc de texte des CGU pour la page publique "Terms &amp; Legal" (sections 2.1 à 2.8).
            </p>
            {Object.entries(cgu).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="block text-[11px] text-slate-400 capitalize">{key}</label>
                <textarea
                  className="w-full rounded-md bg-slate-950/60 border border-slate-700/80 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  rows={3}
                  value={value}
                  onChange={(e) => setCgu((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                className="h-7 px-3 text-[11px] bg-cyan-600 hover:bg-cyan-500"
                disabled={saving}
                onClick={() => handleSaveSection("cgu")}
              >
                Enregistrer cette section
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Colonne 3 : Contact & aperçu brut */}
        <Card className="lg:col-span-1 bg-slate-900/70 border-slate-700/70 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
              3. Contact &amp; réclamations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300">
            <p className="text-[11px] text-slate-400 mb-1">
              Texte pour expliquer comment les utilisateurs peuvent te contacter (support, réclamation, DPO, etc.).
            </p>
            <textarea
              className="w-full rounded-md bg-slate-950/60 border border-slate-700/80 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              rows={6}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />

            <div className="mt-4 border-t border-slate-800 pt-3">
              <p className="text-[11px] text-slate-500 mb-1">Aperçu brut (pour copier/coller vers la page publique).</p>
              <pre className="max-h-48 overflow-y-auto text-[10px] bg-slate-950/70 border border-slate-800 rounded-md p-2 text-slate-300 whitespace-pre-wrap">
{`### Informations légales\n${JSON.stringify(legalInfo, null, 2)}\n\n### CGU\n${JSON.stringify(cgu, null, 2)}\n\n### Contact & réclamations\n${contact}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
