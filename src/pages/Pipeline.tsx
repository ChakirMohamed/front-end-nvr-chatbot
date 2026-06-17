import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface Step {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  tech: string[];
  active: { border: string; bg: string; title: string };
  detail: { description: string; metrics?: string[]; innovation?: string };
}

const STEPS: Step[] = [
  {
    id: 'ingestion',
    emoji: '📷',
    title: 'Ingestion',
    subtitle: 'Caméras IP RTSP',
    tech: ['OpenCV', 'MOG2', 'RTSP'],
    active: { border: 'border-slate-400', bg: 'bg-slate-50', title: 'text-slate-700' },
    detail: {
      description: 'Les flux vidéo RTSP sont capturés en continu par OpenCV. La soustraction de fond MOG2 filtre les frames statiques pour réduire drastiquement le volume de données à traiter.',
      metrics: ['− 90 % de frames filtrées', 'Traitement en temps réel'],
      innovation: 'Le filtrage MOG2 évite d\'indexer des milliers de frames vides, rendant le système viable sur matériel modeste.',
    },
  },
  {
    id: 'detection',
    emoji: '🎯',
    title: 'Détection',
    subtitle: 'YOLOv8 fine-tuné',
    tech: ['YOLOv8n', 'OpenVINO', 'VisDrone'],
    active: { border: 'border-amber-400', bg: 'bg-amber-50', title: 'text-amber-700' },
    detail: {
      description: 'YOLOv8n fine-tuné sur VisDrone — 6 471 images aériennes annotées, 10 classes, Université de Tianjin. Accélération matérielle via OpenVINO sur Intel Iris Xe.',
      metrics: ['mAP50 : 1,6 % → 25,6 % (× 16)', 'mAP50-95 : 0,7 % → 14,2 % (× 20)', '15 epochs · 37 min sur Tesla T4 (Colab)', '~8 fps sur Intel Iris Xe via OpenVINO'],
      innovation: 'OpenVINO est la seule voie d\'accélération matérielle sur Intel Iris Xe (pas de CUDA). Le fine-tuning VisDrone multiplie la précision par 16 sur des images de surveillance réelles.',
    },
  },
  {
    id: 'indexing',
    emoji: '🧠',
    title: 'Indexation',
    subtitle: 'CLIP + FAISS',
    tech: ['CLIP ViT-B/32', 'FAISS IVFFlat', 'SQLite'],
    active: { border: 'border-violet-400', bg: 'bg-violet-50', title: 'text-violet-700' },
    detail: {
      description: 'Chaque frame est encodé par CLIP ViT-B/32 en vecteur 512d. Les vecteurs sont stockés dans FAISS IVFFlat pour une recherche ANN ultra-rapide. Les métadonnées sont stockées dans SQLite.',
      metrics: ['Vecteurs 512d par frame', 'Auto-upgrade : IndexFlatIP → IVFFlat à ≥ 4 000 vecteurs', 'Recherche en < 300 ms'],
      innovation: 'L\'index démarre plat et se convertit automatiquement en IVFFlat quand la base dépasse le seuil — aucune configuration manuelle.',
    },
  },
  {
    id: 'search',
    emoji: '🔍',
    title: 'Recherche',
    subtitle: 'Requête texte → clips',
    tech: ['CLIP text encoder', 'FAISS ANN', 'FFmpeg'],
    active: { border: 'border-blue-400', bg: 'bg-blue-50', title: 'text-blue-700' },
    detail: {
      description: 'Une requête texte libre est encodée par le même CLIP ViT-B/32 (encoder texte). La similarité cosinus retrouve les frames les plus sémantiquement proches — sans mots-clés exacts, sans date.',
      metrics: ['< 300 ms de bout en bout', 'Filtres : caméra, plage horaire, types d\'objets', 'Génération de clips .mp4 via FFmpeg'],
    },
  },
  {
    id: 'chatbot',
    emoji: '💬',
    title: 'Chatbot IA',
    subtitle: 'Intent Classifier PyTorch',
    tech: ['TF-IDF', 'PyTorch MLP', 'Templates FR'],
    active: { border: 'border-emerald-400', bg: 'bg-emerald-50', title: 'text-emerald-700' },
    detail: {
      description: 'Classifieur d\'intentions entraîné from scratch sur 300 phrases françaises (5 classes). Architecture : TF-IDF (500 features) → Linear(500→128) → ReLU → Dropout → Linear(128→64) → ReLU → Dropout → Linear(64→5).',
      metrics: ['91,7 % de précision (300 phrases)', '76,0 % avec 125 phrases — effet dataset démontré', '~73 000 paramètres', '100 epochs · Adam lr=0,001 · batch 16'],
      innovation: 'Aucun appel LLM externe requis — le classifieur tourne en local, garantissant la confidentialité des images de surveillance.',
    },
  },
  {
    id: 'api',
    emoji: '⚡',
    title: 'API REST',
    subtitle: 'FastAPI + Uvicorn',
    tech: ['FastAPI', 'Uvicorn', 'asyncio'],
    active: { border: 'border-rose-400', bg: 'bg-rose-50', title: 'text-rose-700' },
    detail: {
      description: 'API REST complète exposée par FastAPI. Les opérations CPU-intensives (recherche FAISS, inférence CLIP) s\'exécutent dans un executor asyncio pour ne pas bloquer la boucle d\'événements.',
      metrics: ['POST /chat — dialogue multi-tours', 'POST /search — recherche sémantique', 'GET /clip/{id} — téléchargement .mp4', 'GET /events · /summary · /cameras · /health'],
    },
  },
];

export default function Pipeline() {
  const [selected, setSelected] = useState('detection');
  const step = STEPS.find((s) => s.id === selected)!;

  return (
    <div className="p-8 max-w-5xl w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pipeline IA</h1>
        <p className="text-sm text-slate-600 mt-0.5">Architecture complète — cliquez sur un bloc pour les détails</p>
      </div>

      {/* Flow */}
      <div className="flex items-center gap-1 flex-wrap mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelected(s.id)}
              className={`flex flex-col items-center px-4 py-3 rounded-xl border transition-all ${
                selected === s.id
                  ? `${s.active.border} ${s.active.bg} shadow-sm scale-105`
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className="text-xl mb-1">{s.emoji}</span>
              <span className={`text-xs font-semibold ${selected === s.id ? s.active.title : 'text-slate-600'}`}>
                {s.title}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">{s.subtitle}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Detail */}
      <div className={`card p-6 border ${step.active.border} ${step.active.bg}`}>
        <div className="flex items-start gap-4 mb-5">
          <span className="text-3xl">{step.emoji}</span>
          <div>
            <h2 className={`text-lg font-bold ${step.active.title}`}>{step.title}</h2>
            <p className="text-sm text-slate-600">{step.subtitle}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {step.tech.map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-300 text-slate-700 font-mono font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed mb-5">{step.detail.description}</p>

        {step.detail.metrics && (
          <div className="mb-4">
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-2 font-medium">Métriques</p>
            <ul className="flex flex-col gap-1.5">
              {step.detail.metrics.map((m) => (
                <li key={m} className={`text-sm flex items-start gap-2 ${step.active.title}`}>
                  <span className="shrink-0 mt-0.5">▸</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step.detail.innovation && (
          <div className="mt-4 bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-medium">Choix de conception</p>
            <p className="text-xs text-slate-600 leading-relaxed">{step.detail.innovation}</p>
          </div>
        )}
      </div>

      {/* Stack summary */}
      <div className="card p-5 mt-6">
        <p className="text-xs text-slate-600 uppercase tracking-widest font-medium mb-4">Stack complète</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[
            { cat: 'Détection',   items: 'YOLOv8n fine-tuné · OpenVINO · VisDrone' },
            { cat: 'Sémantique',  items: 'CLIP ViT-B/32 (open-clip-torch)' },
            { cat: 'Indexation',  items: 'FAISS IVFFlat · SQLite' },
            { cat: 'NLP',         items: 'TF-IDF + PyTorch MLP · templates FR' },
            { cat: 'API',         items: 'FastAPI · Uvicorn · asyncio' },
            { cat: 'Hardware',    items: 'Intel i5-1145G7 · 24 Go RAM · Iris Xe' },
          ].map((r) => (
            <div key={r.cat}>
              <p className="text-xs font-semibold text-slate-700 mb-0.5">{r.cat}</p>
              <p className="text-xs text-slate-600">{r.items}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
