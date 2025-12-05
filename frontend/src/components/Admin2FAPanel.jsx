import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ShieldCheck, Smartphone } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function Admin2FAPanel() {
  const [step, setStep] = useState("idle"); // idle | secret | verifying | enabled | error
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // On monte le composant, on reste en "idle" tant que l'admin n'a pas cliqué
  useEffect(() => {
    setStep("idle");
  }, []);

  const startSetup = async () => {
    setLoading(true);
    setMessage("");
    try {
      // L'admin est déjà authentifié via le cookie de session gitpusher_session
      // on peut donc appeler directement l'endpoint de setup sans header Authorization.
      const res = await axios.post(`${API}/auth/2fa/setup`);
      setSecret(res.data.secret);
      setOtpauthUrl(res.data.otpauth_url);
      setStep("secret");
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Impossible de démarrer la configuration 2FA.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${API}/auth/2fa/verify`, null, {
        params: { code },
      });
      if (res.data.status === "ok") {
        setStep("enabled");
        setMessage("✅ 2FA activée avec succès pour votre compte admin.");
      } else {
        setMessage("Code invalide.");
      }
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Échec de la vérification du code 2FA.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/80 border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-base">Sécurité avancée — 2FA Admin</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs text-slate-300">
        <p className="text-[11px] text-slate-400">
          Active une double authentification sur ton compte admin. Même si ton mot de passe fuit, l&apos;accès au
          dashboard nécessitera un code à usage unique généré par ton application d&apos;authentification
          (Google Authenticator, 1Password, etc.).
        </p>

        {message && (
          <div
            className={`p-3 rounded-lg border flex items-center gap-2 text-xs ${
              message.startsWith("✅")
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            <span>{message}</span>
          </div>
        )}

        {step === "idle" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Recommandé : active la 2FA sur ton compte fondateur et les comptes admin principaux.
            </p>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-full"
              onClick={startSetup}
              disabled={loading}
            >
              {loading ? "Initialisation..." : "🔐 Activer la 2FA sur mon compte"}
            </Button>
          </div>
        )}

        {step === "secret" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-cyan-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-slate-300 font-semibold">Étape 1 — Scanner ou ajouter manuellement</p>
                <p className="text-[11px] text-slate-400">
                  Dans ton application d&apos;authentification, ajoute un nouveau compte et scanne le QR code généré à
                  partir de l&apos;URL ci-dessous, ou saisis la clé secrète manuellement.
                </p>
                <div className="mt-2 p-2 rounded bg-slate-950/60 border border-slate-700 text-[10px] break-all">
                  <div className="font-mono text-cyan-300 mb-1">Clé secrète :</div>
                  <div className="font-mono text-xs text-slate-100">{secret}</div>
                </div>
                <div className="mt-2 p-2 rounded bg-slate-950/60 border border-slate-800 text-[10px] break-all">
                  <div className="font-mono text-cyan-300 mb-1">URL (QR code) :</div>
                  <div className="font-mono text-[10px] text-slate-100">{otpauthUrl}</div>
                </div>
              </div>
            </div>

            <form onSubmit={verifyCode} className="space-y-2 mt-3">
              <p className="text-xs text-slate-300 font-semibold">Étape 2 — Vérifier le premier code</p>
              <p className="text-[11px] text-slate-400">
                Une fois le compte ajouté dans ton application, saisis le code à 6 chiffres affiché pour valider l&apos;activation.
              </p>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]*"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="mt-1 h-9 text-sm bg-slate-950/60 border-slate-700 tracking-[0.3em] text-center"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-slate-600 text-xs"
                  onClick={() => {
                    setStep("idle");
                    setSecret("");
                    setOtpauthUrl("");
                    setCode("");
                    setMessage("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold"
                  disabled={loading}
                >
                  {loading ? "Vérification..." : "✔️ Vérifier et activer"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === "enabled" && (
          <div className="space-y-2">
            <p className="text-xs text-emerald-300 font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              2FA activée sur ce compte admin.
            </p>
            <p className="text-[11px] text-slate-400">
              À partir de maintenant, chaque connexion à /admin-login avec cet email demandera un code 2FA après le
              mot de passe.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
