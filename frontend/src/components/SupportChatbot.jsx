import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/config/constants";

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminName, setAdminName] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${API}/support/admin-online`);
        setAdminOnline(res.data.online);
        setAdminName(res.data.admin_name || 'Support');
      } catch (err) {
        setAdminOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (token && isOpen) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [token, isOpen]);

  const loadMessages = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/support/my-messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formattedMessages = res.data.map(msg => ({
        type: msg.is_admin ? 'bot' : 'user',
        text: msg.message,
        timestamp: msg.created_at
      }));
      if (formattedMessages.length === 0) {
        setMessages([{ type: 'bot', text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?' }]);
      } else {
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const quickReplies = [
    { text: 'Comment créer un dépôt ?', response: 'Pour créer un dépôt, cliquez sur "Nouveau workflow", uploadez vos fichiers, configurez les paramètres et lancez l\'automatisation !' },
    { text: 'Comment gérer mes crédits ?', response: 'Consultez votre dashboard pour voir vos crédits disponibles. Vous pouvez acheter plus de crédits dans la section Pricing.' },
    { text: 'Problème de connexion', response: 'Si vous avez des problèmes de connexion, essayez de vous reconnecter via GitHub, GitLab ou Bitbucket. Si le problème persiste, contactez-nous à support@gitpusher.ai' },
    { text: 'Contacter le support', response: 'Vous pouvez nous contacter par email à support@gitpusher.ai ou utiliser le formulaire de contact sur notre site.' }
  ];

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { type: 'user', text }]);
    setInputMessage('');

    if (token) {
      try {
        await axios.post(
          `${API}/support/messages`,
          { message: text },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Failed to send message", err);
      }
    } else {
      setTimeout(() => {
        const reply = quickReplies.find(q => text.toLowerCase().includes(q.text.toLowerCase()));
        const botResponse = reply?.response || 'Merci pour votre message. Pour une assistance personnalisée, veuillez vous connecter ou écrivez-nous à support@gitpusher.ai';
        setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
      }, 1000);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
        aria-label="Ouvrir le support"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse">!</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] w-full h-full bg-slate-900 border-0 sm:border sm:border-slate-700 sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-500 to-violet-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Support GitPusher</h3>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${adminOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              <p className="text-white/80 text-xs">
                {adminOnline ? `${adminName} en ligne` : 'Hors ligne - Email uniquement'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              msg.type === 'user'
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                : 'bg-slate-800 text-slate-100 border border-slate-700'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {messages.length <= 2 && (
        <div className="p-3 border-t border-slate-800 bg-slate-900">
          <p className="text-xs text-slate-400 mb-2">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(reply.text)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors"
              >
                {reply.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSendMessage(inputMessage)}
            className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => window.location.href = 'mailto:support@gitpusher.ai'}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email: support@gitpusher.ai
          </button>
        </div>
      </div>
    </div>
  );
}
