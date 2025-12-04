import { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Shield, AlertCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AdminSecurityPanel() {
  const [newUser, setNewUser] = useState({ email: "", password: "", display_name: "", role: "VIEWER" });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Admin APIs now rely on secure HttpOnly session cookies; no need
  // to send an Authorization header from the browser.

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/users`);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    setCreating(true);
    setMessage("");
    try {
      await axios.post(`${API}/auth/register`, newUser);
      
      // Update role after creation
      const usersList = await axios.get(`${API}/admin/users`);
      const createdUser = usersList.data.find(u => u.email === newUser.email);
      
      if (createdUser && newUser.role !== "VIEWER") {
        await axios.patch(`${API}/admin/users/${createdUser.id}/role`, 
          { role: newUser.role },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setMessage("✅ Utilisateur créé avec succès");
      setNewUser({ email: "", password: "", display_name: "", role: "VIEWER" });
      loadUsers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.detail || "Erreur création"}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setCreating(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.patch(`${API}/admin/users/${userId}/role`, 
        { role: newRole }
      );
      setMessage("✅ Rôle mis à jour");
      loadUsers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.detail || "Erreur"}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const deleteUser = async (userId, email) => {
    if (email === "founder@gitpusher.ai") {
      setMessage("❌ Impossible de supprimer le compte fondateur.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!window.confirm(`Supprimer définitivement le compte ${email} ?`)) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Utilisateur supprimé");
      loadUsers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.detail || "Erreur suppression"}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg border ${
          message.startsWith("✅") ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Create User */}
      <Card className="bg-slate-900/80 border-cyan-400/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-cyan-400" />
            Créer Nouveau Compte Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="user@example.com"
                className="bg-slate-950/60 border-slate-700 h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nom d'affichage</Label>
              <Input
                value={newUser.display_name}
                onChange={(e) => setNewUser({...newUser, display_name: e.target.value})}
                placeholder="John Doe"
                className="bg-slate-950/60 border-slate-700 h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mot de passe</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Min. 8 caractères"
                className="bg-slate-950/60 border-slate-700 h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Rôle</Label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="w-full px-2 py-2 rounded-md bg-slate-950/70 border border-slate-700 text-xs h-8"
              >
                <option value="VIEWER">VIEWER</option>
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
                <option value="FOUNDER_ADMIN">FOUNDER_ADMIN</option>
              </select>
            </div>
          </div>
          <Button
            onClick={createUser}
            disabled={creating || !newUser.email || !newUser.password}
            className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold"
            size="sm"
          >
            {creating ? "Création..." : "✚ Créer Compte"}
          </Button>
        </CardContent>
      </Card>

      {/* Manage Roles */}
      <Card className="bg-slate-900/80 border-violet-400/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-violet-400" />
              Gestion des Rôles
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={loadUsers}
              disabled={loading}
            >
              {loading ? "..." : "🔄 Recharger"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.slice(0, 20).map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{user.email}</p>
                  <p className="text-xs text-slate-400">{user.display_name || "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={user.role || "VIEWER"}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs"
                    disabled={user.email === "founder@gitpusher.ai"}
                  >
                    <option value="VIEWER">VIEWER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="FOUNDER_ADMIN">FOUNDER_ADMIN</option>
                  </select>
                  {user.email !== "founder@gitpusher.ai" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px] border-red-500/60 text-red-300 hover:bg-red-500/10"
                      onClick={() => deleteUser(user.id, user.email)}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
