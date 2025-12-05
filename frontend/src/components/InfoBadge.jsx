import { useState } from "react";
import { Info } from "lucide-react";

/**
 * Petit composant générique pour afficher un "i" d'information.
 * - Affiche un bouton rond avec un i.
 * - Au clic, ouvre un panneau flottant avec un texte explicatif détaillé.
 */
export function InfoBadge({ text }) {
  const [open, setOpen] = useState(false);

  if (!text) return null;

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Informations détaillées"
        className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full border border-cyan-400/70 bg-slate-900/80 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-100 text-[10px] shadow-[0_0_10px_rgba(34,211,238,0.6)]"
        onClick={() => setOpen((v) => !v)}
      >
        <Info className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 max-w-xs rounded-xl border border-cyan-400/40 bg-slate-950/95 p-3 text-[11px] text-slate-200 shadow-[0_0_30px_rgba(34,211,238,0.55)] z-20">
          <p className="leading-snug whitespace-pre-line">{text}</p>
        </div>
      )}
    </div>
  );
}
