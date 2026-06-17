import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Video } from 'lucide-react';
import { api } from '../api';
import type { ChatResponse } from '../types';
import IntentBar from '../components/IntentBar';
import EventCard from '../components/EventCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  data?: ChatResponse;
}

const EXAMPLES = [
  "Bonjour, qu'est-ce que tu peux faire ?",
  "Y'a eu quoi cette nuit sur les caméras ?",
  "Montre-moi les événements avec des personnes",
  "Fais un résumé de l'activité",
  "Envoie-moi le clip du dernier événement",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: "Bonjour ! Je suis votre assistant de surveillance IA. Je peux rechercher des événements, générer des clips .mp4 et créer des résumés d'activité. Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(`session-${Date.now()}`);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { id: Date.now().toString(), role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const data = await api.chat(text, sessionId.current);
      setMessages((m) => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', text: data.response, data }]);
    } catch {
      setMessages((m) => [...m, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Erreur de connexion à l'API. Vérifiez que le serveur FastAPI est démarré sur le port 8000.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-slate-200 bg-white">
        <h1 className="text-2xl font-bold text-slate-800">Assistant IA</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Dialoguez en français naturel — le classifieur d'intentions PyTorch route chaque message
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
              msg.role === 'user'
                ? 'bg-blue-600'
                : 'bg-white border border-slate-200'
            }`}>
              {msg.role === 'user'
                ? <User size={14} className="text-white" />
                : <Bot size={14} className="text-slate-500" />
              }
            </div>

            <div className={`max-w-xl flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'chat-bubble-user rounded-tr-sm'
                  : 'chat-bubble-bot rounded-tl-sm shadow-sm'
              }`}>
                {msg.text}
              </div>

              {msg.data?.classification_info && (
                <div className="w-full">
                  <IntentBar
                    scores={msg.data.classification_info.ml.all_scores}
                    topIntent={msg.data.classification_info.ml.intent}
                    confidence={msg.data.classification_info.ml.confidence}
                  />
                </div>
              )}

              {msg.data?.events && msg.data.events.length > 0 && (
                <div className="w-full flex flex-col gap-2 mt-1">
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <Video size={10} />
                    {msg.data.events.length} événement(s) trouvé(s)
                  </p>
                  {msg.data.events.map((ev, i) => (
                    <EventCard key={ev.id} event={ev} rank={i + 1} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-slate-500" />
            </div>
            <div className="chat-bubble-bot rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
              <Loader2 size={14} className="text-slate-400 animate-spin" />
              <span className="text-sm text-slate-600">Traitement en cours…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Example prompts */}
      {messages.length === 1 && (
        <div className="px-8 pb-2">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wider font-semibold">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => send(ex)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-8 py-5 border-t border-slate-200 bg-white">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question en français…"
            disabled={loading}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <button
            type="submit"
            aria-label="Envoyer le message"
            disabled={loading || !input.trim()}
            className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
