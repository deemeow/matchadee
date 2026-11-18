import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Film,
  Pause,
  Play,
  Search,
  Sparkles,
  Volume2
} from 'lucide-react';
import { STORIES } from '../data/stories';
import { Mission2QuizData, PerformanceStyle, StudentRecord, VideoWatchStatus } from '../types';
import { CikguKancilBanner } from './CikguKancilGuide';
import { soundEngine } from '../utils/sound';

interface Mission2ViewProps {
  student: StudentRecord;
  onSaveMission2: (data: Mission2QuizData) => void;
  onBackToMap: () => void;
}

type VideoKey = 'normal' | 'expressive' | 'acting';

const DETECTIVE_QUESTIONS = [
  {
    id: 'q1',
    situation:
      'Seorang murid menyebut setiap perkataan dengan betul supaya rakan di barisan belakang dapat memahami semua dialog cerita.',
    options: ['Sebutan yang jelas', 'Pergerakan dan gaya watak', 'Jeda pada tempat yang betul'],
    correctIndex: 0,
    explanation:
      'Betul! Kejelasan sebutan memastikan setiap huruf dan suku kata didengari dengan tepat oleh penonton.'
  },
  {
    id: 'q2',
    situation:
      'Ketika watak berasa terkejut, suara pembaca naik tinggi dan berubah menjadi lembut apabila watak berasa sedih.',
    options: ['Bacaan biasa yang sekata', 'Intonasi yang sesuai', 'Berdiri tanpa bergerak'],
    correctIndex: 1,
    explanation:
      'Tepat sekali! Intonasi ialah turun naik nada suara yang menghidupkan emosi dan situasi dalam cerita.'
  },
  {
    id: 'q3',
    situation:
      'Pembaca berhenti seketika pada tanda koma dan titik sebelum menyambung ayat supaya pendengar sempat membayangkan kejadian.',
    options: ['Membaca terlalu laju', 'Pergerakan dan gaya watak', 'Jeda pada tempat yang betul'],
    correctIndex: 2,
    explanation:
      'Syabas detektif! Jeda membantu penonton mencerna makna ayat dan memberi ruang pembaca menarik nafas.'
  },
  {
    id: 'q4',
    situation:
      'Suara pembaca bergetar sayu sewaktu menyampaikan rayuan ibu dan berubah menjadi garau sewaktu menjadi watak buaya.',
    options: ['Kelantangan terlalu perlahan', 'Ekspresi suara', 'Bacaan tanpa emosi'],
    correctIndex: 1,
    explanation:
      'Hebat! Ekspresi suara membezakan perasaan serta sifat unik setiap watak dalam karya sastera.'
  },
  {
    id: 'q5',
    situation:
      'Murid melangkah melintasi pentas sambil menggerakkan tangan seolah-olah sedang mendayung sampan di hadapan penonton.',
    options: ['Sebutan huruf vokal', 'Bacaan biasa', 'Pergerakan dan gaya watak'],
    correctIndex: 2,
    explanation:
      'Betul! Pergerakan badan, mimik muka dan penggunaan ruang pentas menjadikan lakonan lebih realistik dan menarik.'
  }
];

export default function Mission2View({ student, onSaveMission2, onBackToMap }: Mission2ViewProps) {
  const story = STORIES.find((s) => s.id === student.selectedStoryId) || STORIES[0];

  const [statuses, setStatuses] = useState<Record<VideoKey, VideoWatchStatus>>(() =>
    student.mission2.completed
      ? { normal: 'Selesai ditonton', expressive: 'Selesai ditonton', acting: 'Selesai ditonton' }
      : { normal: 'Belum ditonton', expressive: 'Belum ditonton', acting: 'Belum ditonton' }
  );
  const [activeVideo, setActiveVideo] = useState<VideoKey | null>(null);
  const [videoProgress, setVideoProgress] = useState<Record<VideoKey, number>>(() =>
    student.mission2.completed ? { normal: 100, expressive: 100, acting: 100 } : { normal: 0, expressive: 0, acting: 0 }
  );
  const [customVideoUrls, setCustomVideoUrls] = useState<Record<VideoKey, string>>({
    normal: '',
    expressive: '',
    acting: ''
  });

  // Quiz state
  const [preferredStyle, setPreferredStyle] = useState<PerformanceStyle | ''>(student.mission2.preferredStyle);
  const [reason, setReason] = useState(student.mission2.reason);
  const [comparison, setComparison] = useState(student.mission2.comparison);
  const [detectiveAnswers, setDetectiveAnswers] = useState<Record<string, number>>(student.mission2.detectiveAnswers);
  const [quizError, setQuizError] = useState('');
  const [completedBanner, setCompletedBanner] = useState(false);

  // Timed stage demonstration playback when a card is active
  useEffect(() => {
    if (!activeVideo) return;
    const timer = window.setInterval(() => {
      setVideoProgress((prev) => {
        const nextVal = Math.min(100, prev[activeVideo] + 12.5);
        if (nextVal >= 100) {
          setStatuses((s) => ({ ...s, [activeVideo]: 'Selesai ditonton' }));
          setActiveVideo(null);
          soundEngine.playSuccess();
        }
        return { ...prev, [activeVideo]: nextVal };
      });
    }, 800);
    return () => window.clearInterval(timer);
  }, [activeVideo]);

  const startWatch = (key: VideoKey) => {
    soundEngine.playClick();
    if (activeVideo === key) {
      setActiveVideo(null);
      return;
    }
    setStatuses((s) => ({
      ...s,
      [key]: s[key] === 'Selesai ditonton' ? 'Selesai ditonton' : 'Sedang ditonton'
    }));
    if (videoProgress[key] >= 100) {
      setVideoProgress((p) => ({ ...p, [key]: 0 }));
    }
    setActiveVideo(key);
  };

  const speakPreviewLine = (text: string, rate = 1) => {
    soundEngine.playClick();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ms-MY';
    utter.rate = rate;
    window.speechSynthesis.speak(utter);
  };

  const allThreeWatched =
    statuses.normal === 'Selesai ditonton' &&
    statuses.expressive === 'Selesai ditonton' &&
    statuses.acting === 'Selesai ditonton';

  const handleAnswerDetective = (qId: string, optionIndex: number, correctIndex: number) => {
    setDetectiveAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
    if (optionIndex === correctIndex) {
      soundEngine.playSuccess();
    } else {
      soundEngine.playGentleRetry();
    }
  };

  const handleFinishQuiz = () => {
    if (!preferredStyle) {
      setQuizError('Sila pilih satu bentuk persembahan dalam Soalan 1.');
      soundEngine.playGentleRetry();
      return;
    }
    if (!reason.trim()) {
      setQuizError('Sila tulis alasan pilihan kamu dalam Soalan 2.');
      soundEngine.playGentleRetry();
      return;
    }
    if (!comparison.normal.trim() || !comparison.expressive.trim() || !comparison.acting.trim()) {
      setQuizError('Sila lengkapkan ketiga-tiga ruangan ciri dalam jadual Soalan 3.');
      soundEngine.playGentleRetry();
      return;
    }
    if (Object.keys(detectiveAnswers).length < DETECTIVE_QUESTIONS.length) {
      setQuizError('Sila jawab semua lima situasi Detektif Ciri Persembahan dalam Soalan 4.');
      soundEngine.playGentleRetry();
      return;
    }

    setQuizError('');
    soundEngine.playFanfare();
    onSaveMission2({
      preferredStyle,
      reason: reason.trim(),
      comparison,
      detectiveAnswers,
      completed: true
    });
    setCompletedBanner(true);
  };

  const videoCards: {
    key: VideoKey;
    badge: string;
    title: string;
    illustrationLabel: string;
    description: string;
  }[] = [
    {
      key: 'normal',
      badge: 'VIDEO 1',
      title: 'BACAAN BIASA',
      illustrationLabel: 'Murid membaca buku dengan tenang & sekata',
      description: story.performanceDemos.normal.note
    },
    {
      key: 'expressive',
      badge: 'VIDEO 2',
      title: 'BACAAN SECARA EKSPRESIF',
      illustrationLabel: 'Murid membaca dengan intonasi, jeda & ekspresi suara',
      description: story.performanceDemos.expressive.note
    },
    {
      key: 'acting',
      badge: 'VIDEO 3',
      title: 'LAKONAN',
      illustrationLabel: 'Watak-watak berlakon di atas pentas teater',
      description: story.performanceDemos.acting.note
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-7">
      {/* Header */}
      <div className="rounded-3xl border border-[#E5C27D] bg-gradient-to-r from-[#FFF3C4] via-[#FDE8D7] to-[#FFF3C4] p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold tracking-widest text-[#9A5B13]">
            MISI 2 · STUDIO DETEKTIF PERSEMBAHAN
          </p>
          <p className="text-xs font-semibold text-[#7A3A1E]">
            Cerita Siasatan: {story.title}
          </p>
        </div>
        <h1 className="mt-1 text-2xl sm:text-4xl font-bold text-[#3D2612]">
          JADI DETEKTIF PERSEMBAHAN!
        </h1>
        <div className="mt-4">
          <CikguKancilBanner
            compact
            dialogue="Cerita yang sama boleh disampaikan dengan pelbagai cara. Tugas kamu ialah menyiasat persembahan manakah yang paling menarik!"
          />
        </div>
      </div>

      {/* Bahagian A: Three Performance Videos */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 forest-readable-text">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">
              Bahagian A: Tonton Tiga Bentuk Persembahan
            </h2>
            <p className="text-sm font-medium text-[#4E341C]">
              Mainkan ketiga-tiga contoh persembahan bagi cerita <strong className="text-[#3D2612]">{story.title}</strong> sehingga selesai untuk membuka Kuiz Detektif.
            </p>
          </div>
          <p className="text-xs font-bold text-[#9A5B13] tabular-nums">
            Status: {Object.values(statuses).filter((s) => s === 'Selesai ditonton').length}/3 Selesai ditonton
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {videoCards.map((card) => {
            const status = statuses[card.key];
            const progress = videoProgress[card.key];
            const isPlaying = activeVideo === card.key;
            const customUrl = customVideoUrls[card.key];

            return (
              <div
                key={card.key}
                className={`rounded-2xl border p-5 flex flex-col justify-between bg-[#FFFCF4] shadow-sm ${
                  status === 'Selesai ditonton'
                    ? 'border-[#9EC4A3]'
                    : isPlaying
                    ? 'border-2 border-[#D4941A]'
                    : 'border-[#E5CFA0]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold tracking-wider text-[#9A5B13]">
                      {card.badge}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        status === 'Selesai ditonton'
                          ? 'text-[#235334]'
                          : status === 'Sedang ditonton'
                          ? 'text-[#9A5B13]'
                          : 'text-[#7A5C3E]'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#3D2612]">{card.title}</h3>
                  <p className="mt-1 text-xs text-[#6B4E31]">{card.illustrationLabel}</p>

                  {/* Interactive Stage Video Player Frame */}
                  <div className="mt-3 rounded-xl border border-[#DFC792] bg-[#2B1B0E] overflow-hidden">
                    <div className="relative h-44 flex flex-col justify-between p-3.5">
                      <img
                        src={story.image}
                        alt={card.title}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover opacity-35"
                      />
                      <div className="relative z-10 flex items-center justify-between text-xs text-[#FDE68A]">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Film className="w-3.5 h-3.5" />
                          {customUrl ? 'Video Pautan' : 'Simulasi Video Pentas'}
                        </span>
                        <span className="tabular-nums">{Math.round(progress)}%</span>
                      </div>

                      {/* Dynamic Script Subtitle Preview inside player */}
                      <div className="relative z-10 my-auto rounded-lg bg-black/65 p-3 text-xs sm:text-sm text-white leading-relaxed">
                        {card.key === 'normal' && (
                          <p>
                            {story.performanceDemos.normal.lines[
                              Math.min(
                                story.performanceDemos.normal.lines.length - 1,
                                Math.floor((progress / 100) * story.performanceDemos.normal.lines.length)
                              )
                            ]}
                          </p>
                        )}
                        {card.key === 'expressive' && (
                          <div>
                            {(() => {
                              const lines = story.performanceDemos.expressive.lines;
                              const item = lines[Math.min(lines.length - 1, Math.floor((progress / 100) * lines.length))];
                              return (
                                <>
                                  <p className="font-semibold text-[#FDE047]">{item.text}</p>
                                  <p className="mt-1 text-[11px] text-[#FEF3C7]">Petunjuk: {item.cue}</p>
                                </>
                              );
                            })()}
                          </div>
                        )}
                        {card.key === 'acting' && (
                          <div>
                            {(() => {
                              const scenes = story.performanceDemos.acting.scenes;
                              const sc = scenes[Math.min(scenes.length - 1, Math.floor((progress / 100) * scenes.length))];
                              return (
                                <>
                                  <p className="text-[11px] font-bold text-[#F5B82E]">{sc.character} · {sc.action}</p>
                                  <p className="mt-0.5 font-semibold">{sc.dialogue}</p>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className="h-full bg-[#F5B82E] transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-[#4E341C] leading-relaxed">{card.description}</p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startWatch(card.key)}
                      className={`flex-1 min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors ${
                        isPlaying
                          ? 'bg-[#FCEAD8] border border-[#D4941A] text-[#7A3A1E]'
                          : status === 'Selesai ditonton'
                          ? 'bg-[#E4EFE2] border border-[#9EC4A3] text-[#235334] hover:bg-[#D7EAD5]'
                          : 'bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] hover:bg-[#E5A420]'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" /> Jeda Video
                        </>
                      ) : status === 'Selesai ditonton' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Tonton Semula
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" /> Mainkan Video
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        speakPreviewLine(
                          card.key === 'normal'
                            ? story.performanceDemos.normal.lines.join(' ')
                            : card.key === 'expressive'
                            ? story.performanceDemos.expressive.lines.map((l) => l.text).join(' ')
                            : story.performanceDemos.acting.scenes.map((s) => s.dialogue).join(' '),
                          card.key === 'normal' ? 1.0 : 0.9
                        )
                      }
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-[#DFC792] bg-[#FAF1D4] hover:bg-[#FCEBB6] text-[#9A5B13]"
                      title="Dengar contoh suara"
                      aria-label="Dengar contoh suara"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Optional teacher video link slot */}
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomVideoUrls((prev) => ({ ...prev, [card.key]: e.target.value }))}
                    placeholder="Pautan video sebenar (pilihan guru/prototaip)"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DCC38D] text-xs text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bahagian B: Detective Quiz */}
      <section className="rounded-3xl border border-[#E5C27D] bg-[#FFFCF4] p-6 sm:p-8 space-y-6 shadow-[0_8px_24px_rgba(120,84,28,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#EDE0BC]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FCEAD8] border border-[#D4941A] flex items-center justify-center">
              <Search className="w-5 h-5 text-[#9A5B13]" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">BAHAGIAN B · BILIK SIASATAN</p>
              <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">Kuiz Detektif Persembahan</h2>
            </div>
          </div>
          {!allThreeWatched && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9A5B13]">
              <Eye className="w-4 h-4" /> Tonton ketiga-tiga video dahulu untuk membuka kuiz
            </span>
          )}
        </div>

        {!allThreeWatched ? (
          <div className="rounded-2xl border border-dashed border-[#DFC792] bg-[#FAF1D4] p-8 text-center">
            <p className="text-base font-semibold text-[#4E341C]">
              Lengkapkan tontonan Video 1, Video 2 dan Video 3 di atas untuk membuka fail siasatan detektif!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Soalan 1 */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-[#3D2612]">
                Soalan 1: Antara ketiga-tiga video, persembahan manakah yang paling menarik perhatian kamu?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Bacaan biasa', 'Bacaan secara ekspresif', 'Lakonan'] as PerformanceStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPreferredStyle(style);
                    }}
                    className={`min-h-[48px] px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${
                      preferredStyle === style
                        ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A] shadow-sm'
                        : 'bg-[#FAF1D4] text-[#4E341C] border-[#DFC792] hover:border-[#D4941A]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Soalan 2 */}
            <div className="space-y-2">
              <label htmlFor="m2-reason" className="block text-base sm:text-lg font-bold text-[#3D2612]">
                Soalan 2: Apakah sebab kamu memilih persembahan tersebut?
              </label>
              <textarea
                id="m2-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Saya suka persembahan ini kerana suara dan aksinya membuatkan cerita terasa seperti benar-benar berlaku..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
              />
            </div>

            {/* Soalan 3: Interactive Comparison Table */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-[#3D2612]">
                Soalan 3: Banding dan bezakan — Apakah perbezaan antara bacaan biasa, bacaan ekspresif dan lakonan?
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-[#E5CFA0]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F6E8BE] text-xs font-bold uppercase tracking-wider text-[#6B4211]">
                      <th className="p-3.5 w-52">Bentuk persembahan</th>
                      <th className="p-3.5">Ciri-ciri yang kamu perhatikan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE0BC] bg-[#FFFCF4] text-sm">
                    <tr>
                      <td className="p-3.5 font-bold text-[#3D2612] align-top">Bacaan biasa</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={comparison.normal}
                          onChange={(e) => setComparison((c) => ({ ...c, normal: e.target.value }))}
                          placeholder="Tulis ciri bacaan biasa..."
                          className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-white border border-[#DCC38D] text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-[#3D2612] align-top">Bacaan ekspresif</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={comparison.expressive}
                          onChange={(e) => setComparison((c) => ({ ...c, expressive: e.target.value }))}
                          placeholder="Tulis ciri bacaan ekspresif..."
                          className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-white border border-[#DCC38D] text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-[#3D2612] align-top">Lakonan</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={comparison.acting}
                          onChange={(e) => setComparison((c) => ({ ...c, acting: e.target.value }))}
                          placeholder="Tulis ciri lakonan..."
                          className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-white border border-[#DCC38D] text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Soalan 4: 5 Detective Situations with Explanatory Feedback */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#3D2612]">
                Soalan 4: Detektif Ciri Persembahan — Kenal pasti ciri yang digunakan dalam situasi berikut:
              </h3>
              <div className="space-y-4">
                {DETECTIVE_QUESTIONS.map((q, idx) => {
                  const chosen = detectiveAnswers[q.id];
                  const hasAnswered = chosen !== undefined;
                  const isCorrect = chosen === q.correctIndex;

                  return (
                    <div key={q.id} className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4]/75 p-4 sm:p-5 space-y-3">
                      <p className="text-sm sm:text-base font-semibold text-[#3D2612]">
                        Situasi {idx + 1}: {q.situation}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {q.options.map((opt, optIdx) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleAnswerDetective(q.id, optIdx, q.correctIndex)}
                            className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold text-left transition-colors ${
                              chosen === optIdx
                                ? optIdx === q.correctIndex
                                  ? 'bg-[#E4EFE2] border-[#5A9A72] text-[#1F4B2F]'
                                  : 'bg-[#FDE4E8] border-[#E598A8] text-[#881D38]'
                                : 'bg-[#FFFCF4] border-[#DFC792] text-[#4E341C] hover:border-[#D4941A]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {hasAnswered && (
                        <div
                          className={`rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed border ${
                            isCorrect
                              ? 'bg-[#E4EFE2] border-[#9EC4A3] text-[#1F4B2F]'
                              : 'bg-[#FFF3C4] border-[#E5C27D] text-[#7A3A1E]'
                          }`}
                        >
                          <p className="font-bold">
                            {isCorrect ? 'Jawapan Tepat! Cikgu Kancil memuji siasatan kamu:' : 'Cuba lagi! Petunjuk Cikgu Kancil:'}
                          </p>
                          <p className="mt-0.5">
                            {isCorrect
                              ? q.explanation
                              : `Perhatikan kata kunci dalam situasi ini. Jawapan yang tepat ialah "${q.options[q.correctIndex]}". ${q.explanation}`}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {quizError && (
              <p className="rounded-xl border border-[#E598A8] bg-[#FDE4E8] px-4 py-3 text-sm font-semibold text-[#881D38]">
                {quizError}
              </p>
            )}

            {completedBanner ? (
              <div className="rounded-3xl border-2 border-[#D4941A] bg-gradient-to-r from-[#FFF3C4] via-[#FDE8D7] to-[#FFF3C4] p-6 text-center space-y-4 shadow-lg animate-stage-burst">
                <Sparkles className="w-10 h-10 text-[#9A5B13] mx-auto" />
                <h3 className="text-2xl font-bold text-[#3D2612]">
                  SYABAS! KAMU TELAH MENJADI DETEKTIF PERSEMBAHAN!
                </h3>
                <p className="text-sm sm:text-base text-[#4E341C]">
                  Kamu memperoleh Lencana <strong>DETEKTIF SASTERA</strong> dan <strong>+15 Bintang</strong>! Misi 3 kini dibuka.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onBackToMap();
                  }}
                  className="min-h-[48px] px-7 py-3 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-base hover:bg-[#E5A420] shadow-sm"
                >
                  Kembali ke Peta & Buka Misi 3
                </button>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFinishQuiz}
                  className="min-h-[48px] px-8 py-3 rounded-xl bg-[#C85470] hover:bg-[#B4435E] border-2 border-[#F5B82E] text-white font-bold text-base transition-all shadow-md"
                >
                  Sahkan & Tamatkan Misi 2
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
