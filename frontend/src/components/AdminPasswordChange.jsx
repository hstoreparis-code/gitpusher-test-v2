import { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AdminPasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (newPassword.length < 8) {
      setMessage("❌ Le mot de passe doit contenir au moins 8 caractères");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${API}/auth/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword
        },
      );
      
      setMessage("✅ Mot de passe modifié avec succès !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.detail || "Erreur lors du changement"}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/80 border-red-400/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="h-4 w-4 text-red-400" />
          Changer le Mot de Passe Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <div className={`mb-4 p-3 rounded-lg border ${
            message.startsWith("✅")
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}>
            <div className="flex items-center gap-2 text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>{message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Mot de passe actuel</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="bg-slate-950/60 border-slate-700 h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Nouveau mot de passe</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="bg-slate-950/60 border-slate-700 h-9 text-sm"
            />
            <p className="text-[10px] text-slate-500">Minimum 8 caractères</p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Confirmer le nouveau mot de passe</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-slate-950/60 border-slate-700 h-9 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-semibold"
          >
            {loading ? "Modification..." : "🔒 Modifier le Mot de Passe"}
          </Button>
        </form>

        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-400/30">
          <p className="text-xs text-blue-300">
            🔒 Sécurité : Mot de passe hashé avec bcrypt, JWT expiré à 60min, session unique par device
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
