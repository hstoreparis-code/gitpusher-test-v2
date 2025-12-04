import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, UserPlus, Gift, Save, AlertCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function AdminCreditsPanel() {
  const [creditSettings, setCreditSettings] = useState({
    initial_credits_free: 5,
    initial_credits_business_pack: 200
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditsToAdd, setCreditsToAdd] = useState("");
  const [addingCredits, setAddingCredits] = useState(false);

  const [simPlan, setSimPlan] = useState("Free");
  const [simCredits, setSimCredits] = useState(10);


  useEffect(() => {
    fetchCreditSettings();
  }, []);

  const fetchCreditSettings = async () => {
    try {
      const res = await axios.get(`${API}/admin/credit-settings`);
      setCreditSettings({
        initial_credits_free: res.data.initial_credits_free || 5,
        initial_credits_business_pack: res.data.initial_credits_business_pack || 200
      });
    } catch (err) {
      console.error("Failed to fetch credit settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage("");
    try {
      await axios.patch(
        `${API}/admin/credit-settings`,
        creditSettings,
      );
      setMessage("✅ Paramètres sauvegardés avec succès !");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Erreur lors de la sauvegarde");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!token || !userSearch.trim()) return;
    try {
      const res = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filtered = res.data.filter(u =>
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.display_name && u.display_name.toLowerCase().includes(userSearch.toLowerCase()))
      );
      setSearchResults(filtered.slice(0, 5));
    } catch (err) {
      console.error("Failed to search users", err);
    }
  };

  const handleAddCredits = async () => {
    if (!token || !selectedUser || !creditsToAdd || parseInt(creditsToAdd) <= 0) return;
    setAddingCredits(true);
    try {
      const res = await axios.post(
        `${API}/admin/users/${selectedUser.id}/add-credits`,
        { credits: parseInt(creditsToAdd) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ ${creditsToAdd} crédits ajoutés à ${selectedUser.email}. Nouveau total: ${res.data.new_credits}`);
      setCreditsToAdd("");
      setSelectedUser(null);
      setSearchResults([]);
      setUserSearch("");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setMessage(`❌ Erreur: ${err.response?.data?.detail || "Échec de l'ajout de crédits"}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setAddingCredits(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Message de feedback */}
      {message && (
        <div className={`p-3 rounded-lg border ${
          message.startsWith("✅")
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Configuration des crédits initiaux */}
      <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-cyan-400" />
            Configuration des Crédits Initiaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-400" />
                Crédits Gratuits (Nouveaux Utilisateurs)
              </Label>
              <Input
                type="number"
                min="0"
                value={creditSettings.initial_credits_free}
                onChange={(e) => setCreditSettings(prev => ({
                  ...prev,
                  initial_credits_free: parseInt(e.target.value) || 0
                }))}
                className="bg-slate-950/60 border-slate-700"
              />
              <p className="text-xs text-slate-400">
                Crédits offerts à chaque nouvel utilisateur à l'inscription
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-400" />
                Pack Business (Crédits)
              </Label>
              <Input
                type="number"
                min="0"
                value={creditSettings.initial_credits_business_pack}
                onChange={(e) => setCreditSettings(prev => ({
                  ...prev,
                  initial_credits_business_pack: parseInt(e.target.value) || 0
                }))}
                className="bg-slate-950/60 border-slate-700"
              />
              <p className="text-xs text-slate-400">
                Nombre de crédits dans le Pack Business (actuellement 200)
              </p>
            </div>
          </div>

          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-slate-950 font-semibold"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder les Paramètres"}
          </Button>
        </CardContent>
      </Card>

      {/* Simulateur de plan & crédits */}
      <Card className="bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-amber-500/5 border-2 border-amber-500/30 shadow-[0_0_24px_rgba(245,158,11,0.3)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-4 w-4 text-amber-400" />
            Simulateur de Plan & Crédits (Test visuel)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-400">
            Ce simulateur ne modifie pas la base de données. Il sert uniquement à tester le rendu des cartes pricing et des seuils de crédits.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Plan simulé</Label>
              <select
                value={simPlan}
                onChange={(e) => setSimPlan(e.target.value)}
                className="w-full px-2 py-1.5 rounded-md bg-slate-950/70 border border-slate-700 text-xs"
              >
                <option>Free</option>
                <option>Starter</option>
                <option>Pro</option>
                <option>Premium</option>
                <option>Business</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Crédits simulés</Label>
              <Input
                type="number"
                min="0"
                value={simCredits}
                onChange={(e) => setSimCredits(parseInt(e.target.value) || 0)}
                className="bg-slate-950/70 border-slate-700 h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Raccourcis</Label>
              <div className="flex flex-wrap gap-1.5">
                <Button size="xs" variant="outline" className="text-[10px]" onClick={() => setSimCredits(2)}>2</Button>
                <Button size="xs" variant="outline" className="text-[10px]" onClick={() => setSimCredits(10)}>10</Button>
                <Button size="xs" variant="outline" className="text-[10px]" onClick={() => setSimCredits(50)}>50</Button>
                <Button size="xs" variant="outline" className="text-[10px] border-emerald-500/60" onClick={() => { setSimPlan("Premium"); setSimCredits(999999); }}>∞</Button>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/30">
            <p className="text-xs text-blue-300">
              💡 Plan: <span className="font-bold">{simPlan}</span> • Crédits: <span className="font-bold">{simCredits}</span>
              {simCredits <= 2 ? " • État: ⚠️ WARNING (jaune)" : " • État: ✓ OK (bleu néon)"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attribution manuelle de crédits */}
      <Card className="bg-slate-900/80 border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-violet-400" />
            Attribution Manuelle de Crédits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Rechercher un utilisateur</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Email ou nom..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                className="bg-slate-950/60 border-slate-700"
              />
              <Button
                onClick={handleSearchUsers}
                variant="outline"
                className="border-slate-700"
              >
                Rechercher
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && !selectedUser && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">{searchResults.length} résultat(s) trouvé(s)</p>
              <div className="space-y-1">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="p-3 bg-slate-950/60 border border-slate-700 rounded-lg hover:border-cyan-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-200">{user.email}</p>
                        <p className="text-xs text-slate-400">{user.display_name || "-"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Crédits actuels</p>
                        <p className="text-sm font-mono text-cyan-400">{user.credits ?? 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedUser && (
            <div className="space-y-3 p-4 bg-slate-950/60 border border-cyan-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200 font-medium">{selectedUser.email}</p>
                  <p className="text-xs text-slate-400">Crédits actuels: {selectedUser.credits ?? 0}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedUser(null);
                    setCreditsToAdd("");
                  }}
                  className="text-xs"
                >
                  ✕ Changer
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Crédits à ajouter</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex: 50"
                  value={creditsToAdd}
                  onChange={(e) => setCreditsToAdd(e.target.value)}
                  className="bg-slate-950/60 border-slate-700"
                />
              </div>

              <Button
                onClick={handleAddCredits}
                disabled={addingCredits || !creditsToAdd || parseInt(creditsToAdd) <= 0}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-semibold"
              >
                {addingCredits ? "Ajout en cours..." : `Ajouter ${creditsToAdd || 0} crédits`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
