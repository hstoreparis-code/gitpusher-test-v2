import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Save, AlertCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AdminEmailPanel() {
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ key: "", name: "", subject: "", body_html: "", body_text: "" });
  const [message, setMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [smtpConfig, setSmtpConfig] = useState({
    SMTP_HOST: "",
    SMTP_PORT: "587",
    SMTP_USER: "",
    SMTP_PASS: "",
    EMAIL_FROM: "welcome@gitpusher.ai"
  });
  
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await axios.get(`${API}/admin/email/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(res.data.templates || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(`${API}/admin/email/templates`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("✅ Template sauvegardé");
      setTimeout(() => setMessage(""), 3000);
      loadTemplates();
      setForm({ key: "", name: "", subject: "", body_html: "", body_text: "" });
    } catch (err) {
      setMessage("❌ Erreur sauvegarde");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSendTest = async (key) => {
    if (!testEmail) {
      setMessage("❌ Email de test requis");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    try {
      await axios.post(`${API}/admin/email/templates/${key}/send-test`, 
        { to: testEmail, name: "Test User" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Email test envoyé");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.detail || "Erreur envoi"}`);
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

      <div className="grid gap-4 md:grid-cols-2">
        {/* Templates List */}
        <Card className="bg-slate-900/80 border-cyan-400/30">
          <CardHeader>
            <CardTitle className="text-base">📧 Templates Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-cyan-300">welcome_email</p>
                  <p className="text-xs text-slate-400">Bienvenue sur GitPusher.AI</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setForm({
                    key: "welcome_email",
                    name: "Welcome Email",
                    subject: "Bienvenue sur GitPusher.AI, {{name}} ! 🚀",
                    body_html: "<div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f172a;color:#fff'><h1 style='color:#06b6d4'>Bienvenue {{name}} ! 🎉</h1><p>Merci de rejoindre GitPusher.AI !</p><p>Vous avez <strong>5 crédits gratuits</strong> pour commencer.</p><a href='https://gitpusher.ai/dashboard' style='display:inline-block;margin-top:20px;padding:12px 24px;background:linear-gradient(90deg,#06b6d4,#8b5cf6);color:#000;text-decoration:none;border-radius:8px;font-weight:bold'>Accéder au Dashboard</a></div>",
                    body_text: "Bienvenue {{name}} ! Merci de rejoindre GitPusher.AI. Vous avez 5 crédits gratuits."
                  })}
                >
                  ✏️ Éditer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => handleSendTest("welcome_email")}
                >
                  📤 Test
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Email de test</Label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="bg-slate-950/60 border-slate-700 h-8 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="bg-slate-900/80 border-violet-400/30">
          <CardHeader>
            <CardTitle className="text-base">✏️ Éditeur Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Key (identifiant unique)</Label>
              <Input
                value={form.key}
                onChange={(e) => setForm({...form, key: e.target.value})}
                placeholder="welcome_email"
                className="bg-slate-950/60 border-slate-700 h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nom du template</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="Welcome Email"
                className="bg-slate-950/60 border-slate-700 h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sujet (utilisez name)</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({...form, subject: e.target.value})}
                placeholder="Bienvenue name !"
                className="bg-slate-950/60 border-slate-700 h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Body HTML</Label>
              <Textarea
                value={form.body_html}
                onChange={(e) => setForm({...form, body_html: e.target.value})}
                rows={8}
                placeholder="<div>Bonjour name...</div>"
                className="bg-slate-950/60 border-slate-700 text-xs font-mono"
              />
            </div>
            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-bold"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* SMTP Config */}
      <Card className="bg-slate-900/80 border-amber-400/30">
        <CardHeader>
          <CardTitle className="text-base">⚙️ Configuration SMTP</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 text-xs">
          <div className="space-y-1">
            <Label>SMTP Host</Label>
            <Input value={smtpConfig.SMTP_HOST} onChange={(e) => setSmtpConfig({...smtpConfig, SMTP_HOST: e.target.value})} placeholder="smtp.gmail.com" className="bg-slate-950/60 h-8" />
          </div>
          <div className="space-y-1">
            <Label>Port</Label>
            <Input value={smtpConfig.SMTP_PORT} onChange={(e) => setSmtpConfig({...smtpConfig, SMTP_PORT: e.target.value})} placeholder="587" className="bg-slate-950/60 h-8" />
          </div>
          <div className="space-y-1">
            <Label>User</Label>
            <Input value={smtpConfig.SMTP_USER} onChange={(e) => setSmtpConfig({...smtpConfig, SMTP_USER: e.target.value})} placeholder="user@example.com" className="bg-slate-950/60 h-8" />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input type="password" value={smtpConfig.SMTP_PASS} onChange={(e) => setSmtpConfig({...smtpConfig, SMTP_PASS: e.target.value})} placeholder="********" className="bg-slate-950/60 h-8" />
          </div>
          <div className="space-y-1">
            <Label>From Address</Label>
            <Input value={smtpConfig.EMAIL_FROM} onChange={(e) => setSmtpConfig({...smtpConfig, EMAIL_FROM: e.target.value})} placeholder="welcome@gitpusher.ai" className="bg-slate-950/60 h-8" />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border-0"
              onClick={async () => {
                try {
                  await axios.post(`${API}/admin/smtp/config`, {
                    smtp_host: smtpConfig.SMTP_HOST,
                    smtp_port: smtpConfig.SMTP_PORT,
                    smtp_user: smtpConfig.SMTP_USER,
                    smtp_pass: smtpConfig.SMTP_PASS,
                    email_from: smtpConfig.EMAIL_FROM
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  setMessage("✅ Config SMTP sauvegardée. Redémarrez le backend pour appliquer.");
                  setTimeout(() => setMessage(""), 5000);
                } catch (err) {
                  setMessage("❌ Erreur sauvegarde SMTP");
                  setTimeout(() => setMessage(""), 3000);
                }
              }}
            >
              💾 Sauvegarder Config SMTP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
