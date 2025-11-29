import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Circle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function AdminSupportPanel() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  useEffect(() => {
    if (!token) {
      navigate("/admin-login", { replace: true });
      return;
    }
    loadConversations();
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  const loadConversations = async () => {
    try {
      const res = await axios.get(`${API}/support/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load conversations", err);
      setLoading(false);
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Support Client - Chat en Direct
          </h1>
          <p className="text-sm text-slate-400 mt-1">Répondez aux utilisateurs en temps réel</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
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
                <div className="overflow-y-auto h-[600px]">
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
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[520px] bg-slate-950">
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
        )}
      </div>
    </div>
  );
}
