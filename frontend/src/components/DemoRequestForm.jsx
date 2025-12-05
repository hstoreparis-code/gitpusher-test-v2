import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

export default function DemoRequestForm({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    role: "",
    team_size: "",
    use_case: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/public/demo-request`, form, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccess(true);
    } catch (err) {
      console.error("Demo request failed", err);
      setError("Impossible d'envoyer la demande pour le moment. Merci de réessayer plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-emerald-300">
          Merci ! Ta demande de démo a bien été enregistrée. Un membre de l&apos;équipe GitPusher™ te contactera par email.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs"
            onClick={onClose}
          >
            Fermer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Prénom & Nom *</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50"
            placeholder="Jean Dupont"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Email professionnel *</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50"
            placeholder="jean.dupont@entreprise.com"
          />
        </div>
      </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Site web *</label>
          <input
            type="url"
            name="website"
            required
            value={form.website}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50"
            placeholder="https://www.ton-organisation.com"
          />
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Société</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50"
            placeholder="Nom de l'organisation"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Rôle</label>
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50"
            placeholder="CTO, lead dev, agence..."
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-300">Taille d'équipe</label>
        <select
          name="team_size"
          value={form.team_size}
          onChange={handleChange}
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50 text-xs"
        >
          <option value="">Sélectionner...</option>
          <option value="1-5">1–5</option>
          <option value="6-20">6–20</option>
          <option value="21-100">21–100</option>
          <option value="100+">100+</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-300">Cas d'usage principal</label>
        <input
          name="use_case"
          value={form.use_case}
          onChange={handleChange}
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50"
          placeholder="Agence, startup produit SaaS, équipe interne, etc."
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-300">Message (optionnel)</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50 resize-none"
          placeholder="Explique ton besoin ou les workflows que tu aimerais voir en démo."
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs border-slate-600"
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={submitting}
          className="text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950"
        >
          {submitting ? "Envoi en cours..." : "Envoyer la demande"}
        </Button>
      </div>
    </form>
  );
}
