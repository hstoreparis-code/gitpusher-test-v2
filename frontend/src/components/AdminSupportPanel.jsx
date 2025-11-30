import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageCircle, Send, Circle, Settings, Plus, Edit, Trash2, Save } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function AdminSupportPanel() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminOnline, setAdminOnline] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scenarios, setScenarios] = useState([
    {
      id: 1,
      trigger: "créer un dépôt",
      response: "Pour créer un dépôt, cliquez sur 'Nouveau workflow', uploadez vos fichiers, configurez les paramètres et lancez l'automatisation !",
      active: true
    },
    {
      id: 2,
      trigger: "crédits",
      response: "Consultez votre dashboard pour voir vos crédits disponibles. Vous pouvez acheter plus de crédits dans la section Pricing.",
      active: true
    },
    {
      id: 3,
      trigger: "connexion",
      response: "Si vous avez des problèmes de connexion, essayez de vous reconnecter via GitHub, GitLab ou Bitbucket.",
      active: true
    }
  ]);
  const [editingScenario, setEditingScenario] = useState(null);
  const [newScenario, setNewScenario] = useState({ trigger: "", response: "" });
  const [botSettings, setBotSettings] = useState({
    auto_response: true,
    greeting_message: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    offline_message: "Notre équipe est actuellement hors ligne. Laissez un message et nous vous répondrons dès que possible.",
    response_delay: 1000
  });
  const messagesEndRef = useRef(null);


  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const loadAdminStatus = async () => {
    try {
      const res = await axios.get(`${API}/support/admin-online`);
      setAdminOnline(res.data.online || false);
    } catch (err) {
      console.error("Failed to load admin status", err);
    }
  };

  const loadConversations = async () => {
    try {
      const [convRes, unreadRes] = await Promise.all([
        axios.get(`${API}/support/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/support/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setConversations(convRes.data);
      setUnreadCount(unreadRes.data.unread_count || 0);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load conversations", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin-login", { replace: true });
      return;
    }

    const run = () => {
      loadAdminStatus();
      loadConversations();
    };

    run();
    const interval = setInterval(run, 5000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  const toggleAdminStatus = async () => {
    try {
      await axios.patch(
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [selectedConversation]);


        `${API}/support/admin-status`,
        { online: !adminOnline },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminOnline(!adminOnline);
    } catch (err) {
      console.error("Failed to update admin status", err);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return;

    try {
      await axios.post(
        `${API}/support/messages`,
        { message: messageInput, user_id: selectedUser.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageInput("");
      loadConversations();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const selectedConversation = conversations.find(c => c.user_id === selectedUser?.user_id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Support Client - Chat en Direct
            </h1>
            <p className="text-sm text-slate-400 mt-1">Répondez aux utilisateurs en temps réel</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle Admin Online/Offline */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-700 rounded-full">
              <span className="text-xs text-slate-400">Statut Admin</span>
              <button
                onClick={toggleAdminStatus}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  adminOnline ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  adminOnline ? 'translate-x-[26px]' : 'translate-x-0.5'
                }`} />
              </button>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${adminOnline ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className={`text-xs font-medium ${adminOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                  {adminOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
            
            {/* Notification messages non lus */}
            {unreadCount > 0 && (
              <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse">
                <span className="text-xs font-semibold text-amber-300">{unreadCount} nouveau{unreadCount > 1 ? 'x' : ''} message{unreadCount > 1 ? 's' : ''}</span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-700 text-xs hover:border-cyan-500/40 hover:shadow-[0_0_12px_rgba(56,189,248,0.3)] transition-all"
              onClick={() => window.history.back()}
            >
              ← Retour
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Tabs defaultValue="conversations" className="w-full">
            <TabsList className="bg-slate-900/80 border border-slate-700/80 mb-4">
              <TabsTrigger value="conversations">
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversations
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres Chatbot
              </TabsTrigger>
            </TabsList>

            {/* Onglet Conversations */}
            <TabsContent value="conversations">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[700px]">
            {/* Liste des conversations */}
            <Card className="bg-slate-900/80 border-slate-800 overflow-hidden">
              <CardHeader className="border-b border-slate-800">
                <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  Conversations ({conversations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-scroll h-[600px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-400">
                      Aucune conversation pour le moment
                    </div>
                  ) : (
                    conversations.map((conv, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedUser({ user_id: conv.user_id, email: conv.user_email, name: conv.user_name })}
                        className={`w-full p-4 border-b border-slate-800/60 text-left hover:bg-slate-800/50 transition-colors ${
                          selectedUser?.user_id === conv.user_id ? 'bg-slate-800/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-200 truncate">{conv.user_email}</p>
                              {conv.unread_count > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{conv.user_name || 'Sans nom'}</p>
                            <p className="text-xs text-slate-500 mt-1 truncate">
                              {conv.messages[conv.messages.length - 1]?.message}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {new Date(conv.last_message_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Zone de chat */}
            <Card className="lg:col-span-2 bg-slate-900/80 border-slate-800 overflow-hidden">
              {selectedUser ? (
                <>
                  <CardHeader className="border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base text-slate-100">{selectedUser.email}</CardTitle>
                        <p className="text-xs text-slate-400 mt-1">{selectedUser.name || 'Sans nom'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
                        <span className="text-xs text-emerald-400">En ligne</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-scroll p-4 space-y-4 h-[520px] bg-slate-950 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                      {selectedConversation?.messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.is_admin
                              ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                              : 'bg-slate-800 text-slate-100 border border-slate-700'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-[10px] mt-1 opacity-70">
                              {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Tapez votre réponse..."
                          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!messageInput.trim()}
                          className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400">Sélectionnez une conversation</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
            </TabsContent>

            {/* Onglet Paramètres Chatbot */}
            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Paramètres Généraux */}
                <Card className="bg-slate-900/80 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-violet-400" />
                      Paramètres Généraux
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Message de bienvenue</label>
                      <Input
                        value={botSettings.greeting_message}
                        onChange={(e) => setBotSettings({...botSettings, greeting_message: e.target.value})}
                        className="bg-slate-950/60 border-slate-700 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Message hors ligne</label>
                      <Input
                        value={botSettings.offline_message}
                        onChange={(e) => setBotSettings({...botSettings, offline_message: e.target.value})}
                        className="bg-slate-950/60 border-slate-700 text-slate-100"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                      <div>
                        <p className="text-sm text-slate-200">Réponses automatiques</p>
                        <p className="text-xs text-slate-400 mt-1">Activer les réponses IA automatiques</p>
                      </div>
                      <button
                        onClick={() => setBotSettings({...botSettings, auto_response: !botSettings.auto_response})}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          botSettings.auto_response ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          botSettings.auto_response ? 'translate-x-[26px]' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <Button
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                      onClick={() => alert('Paramètres sauvegardés !')}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder les paramètres
                    </Button>
                  </CardContent>
                </Card>

                {/* Scénarios de Conversation */}
                <Card className="bg-slate-900/80 border-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-slate-100">Scénarios de Conversation</CardTitle>
                      <Button
                        size="sm"
                        className="bg-violet-500 hover:bg-violet-400 text-white text-xs"
                        onClick={() => {
                          const newId = Math.max(...scenarios.map(s => s.id), 0) + 1;
                          setScenarios([...scenarios, {
                            id: newId,
                            trigger: newScenario.trigger,
                            response: newScenario.response,
                            active: true
                          }]);
                          setNewScenario({ trigger: "", response: "" });
                        }}
                        disabled={!newScenario.trigger || !newScenario.response}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Nouveau scénario */}
                    <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-lg space-y-3">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Mot-clé déclencheur</label>
                        <Input
                          placeholder="Ex: prix, tarif, coût..."
                          value={newScenario.trigger}
                          onChange={(e) => setNewScenario({...newScenario, trigger: e.target.value})}
                          className="bg-slate-950/60 border-slate-700 text-slate-100 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Réponse automatique</label>
                        <textarea
                          placeholder="La réponse que le bot donnera..."
                          value={newScenario.response}
                          onChange={(e) => setNewScenario({...newScenario, response: e.target.value})}
                          className="w-full bg-slate-950/60 border border-slate-700 text-slate-100 text-sm p-2 rounded-md resize-none"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Liste des scénarios */}
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Scénarios actifs ({scenarios.filter(s => s.active).length})</p>
                      {scenarios.map((scenario) => (
                        <div key={scenario.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                          {editingScenario?.id === scenario.id ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs text-slate-400 mb-1 block">Déclencheur</label>
                                <Input
                                  value={editingScenario.trigger}
                                  onChange={(e) => setEditingScenario({...editingScenario, trigger: e.target.value})}
                                  className="bg-slate-900 border-slate-700 text-slate-100 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-400 mb-1 block">Réponse</label>
                                <textarea
                                  value={editingScenario.response}
                                  onChange={(e) => setEditingScenario({...editingScenario, response: e.target.value})}
                                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm p-2 rounded-md resize-none"
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white text-xs"
                                  onClick={() => {
                                    setScenarios(scenarios.map(s => 
                                      s.id === editingScenario.id ? editingScenario : s
                                    ));
                                    setEditingScenario(null);
                                  }}
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Sauvegarder
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-700 text-xs"
                                  onClick={() => setEditingScenario(null)}
                                >
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                      {scenario.trigger}
                                    </span>
                                    {scenario.active ? (
                                      <span className="text-xs text-emerald-400">● Actif</span>
                                    ) : (
                                      <span className="text-xs text-slate-500">○ Inactif</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-300 mt-2">{scenario.response}</p>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={() => setEditingScenario(scenario)}
                                    className="p-1.5 hover:bg-slate-800 rounded text-cyan-400 hover:text-cyan-300"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setScenarios(scenarios.map(s =>
                                      s.id === scenario.id ? {...s, active: !s.active} : s
                                    ))}
                                    className={`p-1.5 hover:bg-slate-800 rounded ${
                                      scenario.active ? 'text-amber-400' : 'text-emerald-400'
                                    }`}
                                  >
                                    {scenario.active ? '⏸' : '▶'}
                                  </button>
                                  <button
                                    onClick={() => setScenarios(scenarios.filter(s => s.id !== scenario.id))}
                                    className="p-1.5 hover:bg-slate-800 rounded text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Scripts Personnalisés */}
                <Card className="bg-slate-900/80 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-100">Scripts & Prompts IA</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Prompt système pour le chatbot IA</label>
                      <textarea
                        placeholder="Vous êtes un assistant support pour GitPusher. Soyez professionnel, courtois et précis..."
                        className="w-full bg-slate-950/60 border border-slate-700 text-slate-100 text-sm p-3 rounded-md resize-none"
                        rows={6}
                        defaultValue="Vous êtes un assistant support pour GitPusher, une plateforme d'automatisation Git No-Code. Votre rôle est d'aider les utilisateurs avec :\n- La création de dépôts Git automatisés\n- La gestion des crédits et abonnements\n- Les problèmes de connexion OAuth\n- Les questions sur les fonctionnalités\n\nSoyez professionnel, courtois et concis dans vos réponses."
                      />
                    </div>
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                      <p className="text-xs text-cyan-300 mb-2">💡 Astuce</p>
                      <p className="text-xs text-slate-400">
                        Les prompts personnalisés permettent d&apos;adapter le ton et le comportement du chatbot IA. 
                        Incluez des exemples de conversations pour améliorer la qualité des réponses.
                      </p>
                    </div>
                    <Button
                      className="w-full bg-violet-500 hover:bg-violet-400 text-white"
                      onClick={() => alert('Script IA sauvegardé !')}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder le script IA
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
