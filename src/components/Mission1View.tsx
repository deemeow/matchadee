import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Minus,
  Plus,
  Sparkles,
  Volume2,
  Square
} from 'lucide-react';
import { STORIES } from '../data/stories';
import { Story, StudentRecord } from '../types';
import { CikguKancilBanner } from './CikguKancilGuide';
import { soundEngine } from '../utils/sound';
import misi1BookshelfBg from '../assets/images/misi1_bookshelf_bg_1794926090716.jpg';

interface Mission1ViewProps {
  student: StudentRecord;
  onComplete: (storyId: string) => void;
  onBackToMap: () => void;
}

export default function Mission1View({ student, onComplete, onBackToMap }: Mission1ViewProps) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(() =>
    STORIES.find((s) => s.id === student.selectedStoryId) || null
  );
  const [viewMode, setViewMode] = useState<'library' | 'reader'>(
    student.selectedStoryId ? 'library' : 'library'
  );
  const [fontSize, setFontSize] = useState(18);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRewardBanner, setShowRewardBanner] = useState(false);

  // Web Speech API reading state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [audioNote, setAudioNote] = useState('');
  const stopSpeakingRef = useRef(false);

  const stopAudio = () => {
    stopSpeakingRef.current = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveParagraph(null);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handlePlayAudio = (story: Story) => {
    soundEngine.playClick();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioNote('Fungsi suara pelayar tidak disokong pada peranti ini. Kamu masih boleh membaca teks cerita dengan jelas di bawah.');
      return;
    }

    if (isSpeaking) {
      stopAudio();
      return;
    }

    setAudioNote('');
    stopSpeakingRef.current = false;
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const malayVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith('ms')) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('id')) ||
      null;

    setIsSpeaking(true);

    const speakIndex = (idx: number) => {
      if (stopSpeakingRef.current || idx >= story.paragraphs.length) {
        setIsSpeaking(false);
        setActiveParagraph(null);
        return;
      }
      setActiveParagraph(idx);
      const utter = new SpeechSynthesisUtterance(story.paragraphs[idx]);
      if (malayVoice) utter.voice = malayVoice;
      utter.lang = 'ms-MY';
      utter.rate = 0.92;
      utter.onend = () => {
        if (!stopSpeakingRef.current) speakIndex(idx + 1);
      };
      utter.onerror = () => {
        setIsSpeaking(false);
        setActiveParagraph(null);
        setAudioNote('Audio bacaan automatik terhenti. Kamu boleh terus membaca cerita ini secara kendiri.');
      };
      window.speechSynthesis.speak(utter);
    };

    speakIndex(0);
  };

  const handleOpenStory = (story: Story) => {
    stopAudio();
    soundEngine.playClick();
    setSelectedStory(story);
    setViewMode('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmUnderstood = () => {
    if (!selectedStory) return;
    stopAudio();
    soundEngine.playFanfare();
    setShowConfirmModal(false);
    setShowRewardBanner(true);
    onComplete(selectedStory.id);
  };

  if (viewMode === 'reader' && selectedStory) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopAudio();
              soundEngine.playClick();
              setViewMode('library');
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DFC792] bg-[#FFFCF4] hover:bg-[#FCEBB6] text-sm font-semibold text-[#4E341C] inline-flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#9A5B13]" />
            KEMBALI KE PILIHAN CERITA
          </button>

          {/* Font size & Audio controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-[#DFC792] bg-[#FFFCF4] p-1 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setFontSize((s) => Math.max(14, s - 2));
                }}
                className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-lg hover:bg-[#FAF1D4] text-[#3D2612]"
                aria-label="Kecilkan tulisan"
                title="Tulisan lebih kecil"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-2.5 text-xs font-bold text-[#9A5B13] tabular-nums">
                Saiz {fontSize}px
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setFontSize((s) => Math.min(26, s + 2));
                }}
                className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-lg hover:bg-[#FAF1D4] text-[#3D2612]"
                aria-label="Besarkan tulisan"
                title="Tulisan lebih besar"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handlePlayAudio(selectedStory)}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-2 whitespace-nowrap transition-colors shadow-sm ${
                isSpeaking
                  ? 'bg-[#C85470] text-white hover:bg-[#B4435E]'
                  : 'bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] hover:bg-[#E5A420]'
              }`}
            >
              {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
              {isSpeaking ? 'HENTI AUDIO' : 'DENGAR CERITA'}
            </button>
          </div>
        </div>

        {audioNote && (
          <p className="rounded-xl border border-[#E5C27D] bg-[#FAF1D4] px-4 py-3 text-sm text-[#4E341C]">
            {audioNote}
          </p>
        )}

        {/* Story Book Reader Panel */}
        <article className="rounded-3xl border-2 border-[#E5C27D] bg-[#FFFDF6] text-[#3D2612] overflow-hidden shadow-xl">
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#FAF1D4]">
            <img
              src={selectedStory.image}
              alt={selectedStory.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <p className="text-xs font-bold tracking-widest text-[#FDE047]">
                KOLEKSI CERITA RAKYAT · PERPUSTAKAAN SASTERA AJAIB
              </p>
              <h1 className="mt-1 text-2xl sm:text-4xl font-bold">{selectedStory.title}</h1>
              <p className="mt-1 text-sm text-[#FDE68A]">{selectedStory.tagline}</p>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-5">
            {selectedStory.paragraphs.map((para, index) => (
              <p
                key={index}
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
                className={`rounded-xl px-3 py-2 transition-colors ${
                  activeParagraph === index
                    ? 'bg-[#FEF3C7] ring-2 ring-[#F59E0B] text-[#3D2612]'
                    : 'text-[#3D2612]'
                }`}
              >
                {para}
              </p>
            ))}

            <div className="mt-6 rounded-2xl border border-[#D97706]/30 bg-[#FEF7E0] p-4 sm:p-5">
              <p className="text-xs font-bold tracking-wider text-[#92400E]">PENGAJARAN CERITA</p>
              <p className="mt-1 text-base font-semibold text-[#451A03]">{selectedStory.moral}</p>
            </div>
          </div>
        </article>

        {/* Reward celebration if already confirmed */}
        {showRewardBanner ? (
          <div className="rounded-3xl border-2 border-[#D4941A] bg-gradient-to-r from-[#FFF3C4] via-[#FDE8D7] to-[#FFF3C4] p-6 text-center space-y-4 shadow-xl animate-stage-burst">
            <Sparkles className="w-10 h-10 text-[#9A5B13] mx-auto" />
            <h2 className="text-2xl font-bold text-[#3D2612]">
              Tahniah! Misi 1 Selesai!
            </h2>
            <p className="text-sm sm:text-base text-[#4E341C]">
              Kamu memperoleh Lencana <strong>PENJELAJAH SASTERA</strong> dan <strong>+10 Bintang</strong>! Misi 2 kini telah dibuka.
            </p>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onBackToMap();
              }}
              className="min-h-[48px] px-7 py-3 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-base hover:bg-[#E5A420] transition-colors shadow-sm"
            >
              Kembali ke Peta & Buka Misi 2
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#E5CFA0] bg-[#FFFCF4] p-5 shadow-sm">
            <p className="text-sm text-[#4E341C]">
              Sudah habis membaca kisah <strong className="text-[#3D2612]">{selectedStory.title}</strong>? Klik butang di sebelah untuk mengesahkan bacaan kamu.
            </p>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowConfirmModal(true);
              }}
              className="min-h-[48px] px-7 py-3 rounded-xl bg-[#C85470] hover:bg-[#B4435E] border-2 border-[#F5B82E] text-white font-bold text-base whitespace-nowrap shadow-md"
            >
              SELESAI MEMBACA!
            </button>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2612]/55 backdrop-blur-xs p-4" role="dialog" aria-modal="true">
            <div className="max-w-md w-full rounded-3xl border-2 border-[#D4941A] bg-[#FFFCF4] p-6 text-center shadow-2xl animate-stage-burst">
              <BookOpen className="w-10 h-10 text-[#9A5B13] mx-auto" />
              <h2 className="mt-3 text-xl font-bold text-[#3D2612]">
                Adakah kamu sudah membaca dan memahami cerita ini?
              </h2>
              <p className="mt-2 text-sm text-[#6B4E31]">
                Cerita <strong className="text-[#3D2612]">{selectedStory.title}</strong> akan digunakan dalam Misi 2 hingga Misi 5 nanti.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleConfirmUnderstood}
                  className="min-h-[46px] w-full px-5 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] transition-colors"
                >
                  Ya, saya sudah bersedia!
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setShowConfirmModal(false);
                  }}
                  className="min-h-[44px] w-full px-5 py-2.5 rounded-xl border border-[#DFC792] bg-[#FAF1D4] text-[#4E341C] font-semibold text-sm hover:bg-[#FCEBB6] transition-colors"
                >
                  Saya mahu membaca semula.
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[#E5C27D] bg-[#FAF1D4] p-6 sm:p-8 shadow-lg">
        {/* Soft-blurred bookshelf background layer + subtle readability veil */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={misi1BookshelfBg}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full scale-105 object-cover object-center blur-[4px] select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFF7E2]/80 via-[#FDF0D5]/72 to-[#FFF7E2]/65" />
        </div>

        <div className="relative z-10">
          <p className="text-xs font-bold tracking-widest text-[#9A5B13] [text-shadow:0_1px_8px_rgba(255,250,235,0.9)]">
            MISI 1 · DUNIA BUKU CERITA AJAIB
          </p>
          <h1 className="mt-1 text-2xl sm:text-4xl font-bold text-[#3D2612] [text-shadow:0_1px_10px_rgba(255,250,235,0.95)]">
            SELAMAT DATANG KE PERPUSTAKAAN SASTERA AJAIB!
          </h1>
          <div className="mt-4">
            <CikguKancilBanner
              compact
              dialogue="Setiap buku menyimpan sebuah pengembaraan. Pilih satu cerita yang ingin kamu hidupkan di atas pentas!"
            />
          </div>
        </div>
      </div>

      {/* 7 Illustrated Story Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {STORIES.map((story, idx) => {
          const isPreviouslyChosen = student.selectedStoryId === story.id;
          return (
            <div
              key={story.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between bg-[#FFFCF4] transition-transform hover:-translate-y-1 shadow-sm ${
                isPreviouslyChosen ? 'border-2 border-[#D4941A] shadow-[0_8px_24px_rgba(212,148,26,0.2)]' : 'border-[#E5CFA0]'
              }`}
            >
              <div>
                <div className="relative h-48 bg-[#FAF1D4] overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <p className="absolute bottom-2.5 left-3 text-xs font-bold text-[#FDE047]">
                    Buku {idx + 1} · Cerita Rakyat
                  </p>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold text-[#3D2612] leading-snug">{story.title}</h2>
                  <p className="mt-1.5 text-sm text-[#6B4E31] leading-relaxed">{story.tagline}</p>
                  {isPreviouslyChosen && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#235334]">
                      <CheckCircle2 className="w-4 h-4" />
                      Pilihan Semasa Kamu
                    </p>
                  )}
                </div>
              </div>

              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => handleOpenStory(story)}
                  className="min-h-[44px] w-full px-4 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  BACA CERITA
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
