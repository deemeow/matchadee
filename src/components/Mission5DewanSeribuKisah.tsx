import { FormEvent, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  Film,
  GraduationCap,
  Lock,
  Maximize2,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
  User,
  Video,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { CIKGU_KANCIL_IMAGE, STORIES } from '../data/stories';
import { FeedbackComment, StudentRecord } from '../types';
import { soundEngine } from '../utils/sound';

interface Mission5DewanSeribuKisahProps {
  activeStudent: StudentRecord;
  allStudents: StudentRecord[];
  onAddFinalComment: (targetStudentId: string, comment: FeedbackComment) => void;
}

interface FinalPerformanceItem {
  performanceId: string;
  ownerId: string;
  ownerName: string;
  ownerClass: string;
  isMine: boolean;
  isDemo: boolean;
  storyId: string;
  storyTitle: string;
  storyImage: string;
  performanceStyle: string;
  videoUrl: string;
  videoType: 'upload' | 'camera' | 'link' | 'demo' | '';
  videoLabel: string;
  submittedAt: string;
  allowPeerDownload: boolean;
  comments: FeedbackComment[];
}

type HallFilter = 'semua' | 'saya' | 'rakan';

const POLITE_PROMPTS = [
  'Apakah bahagian paling menarik dalam persembahan ini?',
  'Apakah ekspresi atau suara yang kamu suka?',
  'Berikan kata-kata semangat kepada rakan kamu!',
  'Apakah cadangan membina untuk masa hadapan?'
];

function formatDateOnly(iso: string): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
}

function formatDateTime(iso: string): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('ms-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
}

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function sanitizeFileSegment(text: string): string {
  return text
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .replace(/\s+/g, '_') || 'Murid';
}

export default function Mission5DewanSeribuKisah({
  activeStudent,
  allStudents,
  onAddFinalComment
}: Mission5DewanSeribuKisahProps) {
  const [hallScreen, setHallScreen] = useState<'entrance' | 'collection' | 'stage'>('entrance');
  const [doorsOpening, setDoorsOpening] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<HallFilter>('semua');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);

  // Stage curtain & player states
  const [curtainOpen, setCurtainOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageBoxRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Download feedback
  const [downloadMessage, setDownloadMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Comment form
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');

  // Collect all final performances submitted to Dewan Seribu Kisah
  const performances: FinalPerformanceItem[] = useMemo(() => {
    const items: FinalPerformanceItem[] = [];
    const seen = new Set<string>();

    for (const s of allStudents) {
      if (seen.has(s.id)) continue;
      if (!s.mission5.finalVideoUrl) continue;
      // Only show in Dewan Seribu Kisah once submitted or marked final
      const isSubmittedToHall = Boolean(s.mission5.finalVideoSubmittedAt || s.mission5.submitted);
      if (!isSubmittedToHall) continue;

      seen.add(s.id);
      const story = STORIES.find((st) => st.id === s.selectedStoryId) || STORIES[0];
      const comments = [...(s.mission5.finalComments || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      items.push({
        performanceId: `final-${s.id}`,
        ownerId: s.id,
        ownerName: s.name,
        ownerClass: s.className,
        isMine: s.id === activeStudent.id,
        isDemo: Boolean(s.isDemo),
        storyId: story.id,
        storyTitle: story.title,
        storyImage: story.image,
        performanceStyle: s.mission3.selectedStyle || 'Persembahan Kreatif',
        videoUrl: s.mission5.finalVideoUrl,
        videoType: s.mission5.finalVideoType,
        videoLabel: s.mission5.finalVideoLabel,
        submittedAt: s.mission5.finalVideoSubmittedAt || s.updatedAt,
        allowPeerDownload: Boolean(s.mission5.allowPeerDownload),
        comments
      });
    }

    return items.sort((a, b) => {
      if (a.isMine && !b.isMine) return -1;
      if (!a.isMine && b.isMine) return 1;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [allStudents, activeStudent.id]);

  const filteredPerformances = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return performances.filter((p) => {
      if (filterMode === 'saya' && !p.isMine) return false;
      if (filterMode === 'rakan' && p.isMine) return false;
      if (q && !p.ownerName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [performances, filterMode, searchQuery]);

  const selectedPerformance = useMemo(
    () => performances.find((p) => p.ownerId === selectedOwnerId) || null,
    [performances, selectedOwnerId]
  );

  const handleEnterHall = () => {
    soundEngine.playFanfare();
    setDoorsOpening(true);
    window.setTimeout(() => {
      setDoorsOpening(false);
      setHallScreen('collection');
    }, 520);
  };

  const handleOpenIndividualStage = (ownerId: string) => {
    soundEngine.playClick();
    setSelectedOwnerId(ownerId);
    setCurtainOpen(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setDownloadMessage(null);
    setCommentText('');
    setCommentError('');
    setHallScreen('stage');
  };

  const handleOpenCurtain = () => {
    soundEngine.playFanfare();
    setCurtainOpen(true);
  };

  const handleTogglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    setCurrentTime(0);
    vid.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleToggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  const handleSeek = (value: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = value;
    setCurrentTime(value);
  };

  const handleFullscreen = () => {
    const target = videoRef.current || stageBoxRef.current;
    if (target && target.requestFullscreen) {
      target.requestFullscreen().catch(() => {});
    }
  };

  const handleDownloadVideo = async (perf: FinalPerformanceItem) => {
    setDownloadMessage(null);

    if (!perf.isMine && !perf.allowPeerDownload) {
      soundEngine.playGentleRetry();
      setDownloadMessage({
        type: 'err',
        text: 'Muat turun video rakan ditutup oleh guru untuk menjaga privasi murid.'
      });
      return;
    }

    if (perf.videoType !== 'upload' && perf.videoType !== 'camera') {
      soundEngine.playGentleRetry();
      setDownloadMessage({
        type: 'err',
        text: 'Tiada fail video boleh dimuat turun bagi entri pautan atau contoh prototaip ini.'
      });
      return;
    }

    try {
      const response = await fetch(perf.videoUrl);
      if (!response.ok) {
        throw new Error('Gagal membaca fail video');
      }
      const blob = await response.blob();
      const mime = blob.type.toLowerCase();
      const ext = mime.includes('webm') ? 'webm' : 'mp4';
      const fileName = `PersembahanAkhir_${sanitizeFileSegment(perf.ownerName)}_${sanitizeFileSegment(
        perf.ownerClass
      )}.${ext}`;

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);

      soundEngine.playSuccess();
      setDownloadMessage({
        type: 'ok',
        text: `Muat turun berjaya dimulakan (${fileName}).`
      });
    } catch {
      soundEngine.playGentleRetry();
      setDownloadMessage({
        type: 'err',
        text: 'Gagal memuat turun fail video. Sila pastikan video telah dimuat naik dengan sah.'
      });
    }
  };

  const handleSubmitComment = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPerformance) return;
    const clean = commentText.trim();
    if (!clean) {
      setCommentError('Sila tulis komen atau kata semangat yang membina sebelum menghantar.');
      soundEngine.playGentleRetry();
      return;
    }

    const newComment: FeedbackComment = {
      id: `fc-${Date.now()}`,
      recordingId: selectedPerformance.performanceId,
      authorId: activeStudent.id,
      author: activeStudent.name,
      role: 'rakan',
      authorClass: activeStudent.className,
      strengths: '',
      improvement: '',
      suggestion: '',
      message: clean,
      createdAt: new Date().toISOString()
    };

    onAddFinalComment(selectedPerformance.ownerId, newComment);
    setCommentText('');
    setCommentError('');
    soundEngine.playSuccess();
  };

  /* -------------------------------------------------------------------------- */
  /* PAPARAN PERTAMA: PINTU MASUK DEWAN SERIBU KISAH                            */
  /* -------------------------------------------------------------------------- */
  if (hallScreen === 'entrance') {
    return (
      <div className="rounded-3xl border-2 border-[#E5C27D] bg-gradient-to-b from-[#FFF3C4] via-[#FDE8D7] to-[#FAF1D4] p-6 sm:p-10 shadow-lg overflow-hidden relative">
        {/* Soft golden stage aura */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-56 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(245,184,46,0.35), rgba(200,84,112,0.12) 55%, transparent 80%)'
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 text-center space-y-2 mb-8">
          <p className="text-xs font-bold tracking-[0.22em] text-[#9A5B13] uppercase">
            PINTU MASUK UTAMA · MALAM ANUGERAH SASTERA
          </p>
          <h3 className="text-2xl sm:text-4xl font-bold text-[#3D2612]">
            DEWAN SERIBU KISAH
          </h3>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#4E341C]">
            Setiap persembahan akhir murid adalah bintang di malam kemuncak. Melangkah masuk ke Dewan Seribu Kisah untuk menonton dan meraikan bakat kamu serta rakan-rakan!
          </p>
        </div>

        {/* Grand Royal Double Doors + Lamps + Cikgu Kancil */}
        <div className="relative z-10 max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left & Center: Grand Rose-Berry & Gold Double Doors */}
          <div className="lg:col-span-8 flex items-center justify-center gap-3 sm:gap-5">
            {/* Left Golden Lamp */}
            <div className="hidden sm:flex flex-col items-center gap-1 shrink-0" aria-hidden="true">
              <div className="w-9 h-12 rounded-t-full rounded-b-lg border-2 border-[#D4941A] bg-gradient-to-b from-[#FEF08A] via-[#F59E0B] to-[#92400E] shadow-[0_0_24px_rgba(245,184,46,0.55)]" />
              <div className="w-2 h-16 bg-gradient-to-b from-[#F5B82E] to-[#78350F] rounded-full" />
              <div className="w-7 h-2 rounded-full bg-[#D4941A]" />
            </div>

            {/* Ornate Archway + Double Doors */}
            <div className="relative w-full max-w-md aspect-[4/3] sm:aspect-[5/4] rounded-t-[4.5rem] rounded-b-2xl border-4 border-[#D4941A] bg-[#FFF7DC] p-2.5 shadow-[0_14px_34px_rgba(140,94,20,0.22)] overflow-hidden">
              {/* Top Royal Arch Ornament */}
              <div className="flex items-center justify-center gap-2 py-1.5 text-[#9A5B13] border-b border-[#D4941A]/35 mb-2">
                <Star className="w-4 h-4 fill-[#F5B82E] text-[#D4941A]" />
                <BookOpen className="w-4 h-4 text-[#B4690E]" />
                <span className="text-[11px] font-bold tracking-[0.2em]">PENTAS SERIBU KISAH</span>
                <BookOpen className="w-4 h-4 text-[#B4690E]" />
                <Star className="w-4 h-4 fill-[#F5B82E] text-[#D4941A]" />
              </div>

              {/* Inner Warm Golden Glow revealed as doors part */}
              <div
                className="relative h-[calc(100%-2.4rem)] rounded-xl overflow-hidden flex"
                style={{
                  background:
                    'radial-gradient(circle at 50% 45%, rgba(254,240,138,0.95), rgba(245,184,46,0.48) 50%, rgba(217,119,6,0.7) 90%)'
                }}
              >
                {/* Left Door */}
                <div
                  className={`w-1/2 h-full bg-gradient-to-br from-[#C85470] via-[#B4435E] to-[#963049] border-r-2 border-[#F5B82E] p-3 flex flex-col justify-between transition-transform duration-500 ease-out origin-left ${
                    doorsOpening ? '-translate-x-full opacity-20' : 'translate-x-0'
                  }`}
                >
                  <div className="h-2/5 rounded-lg border-2 border-[#F5B82E]/70 bg-[#A63D57]/85 flex items-center justify-center">
                    <Star className="w-7 h-7 text-[#FDE047]" />
                  </div>
                  <div className="flex items-center justify-end pr-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FDE047] border-2 border-[#92400E] shadow-[0_0_10px_#FDE047]" />
                  </div>
                  <div className="h-2/5 rounded-lg border-2 border-[#F5B82E]/60 bg-[#963049]/85 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#FEF08A]" />
                  </div>
                </div>

                {/* Golden seam light between closed doors */}
                {!doorsOpening && (
                  <div
                    className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 bg-[#FEF08A]/80 blur-[3px]"
                    aria-hidden="true"
                  />
                )}

                {/* Right Door */}
                <div
                  className={`w-1/2 h-full bg-gradient-to-bl from-[#C85470] via-[#B4435E] to-[#963049] border-l-2 border-[#F5B82E] p-3 flex flex-col justify-between transition-transform duration-500 ease-out origin-right ${
                    doorsOpening ? 'translate-x-full opacity-20' : 'translate-x-0'
                  }`}
                >
                  <div className="h-2/5 rounded-lg border-2 border-[#F5B82E]/70 bg-[#A63D57]/85 flex items-center justify-center">
                    <Star className="w-7 h-7 text-[#FDE047]" />
                  </div>
                  <div className="flex items-center justify-start pl-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FDE047] border-2 border-[#92400E] shadow-[0_0_10px_#FDE047]" />
                  </div>
                  <div className="h-2/5 rounded-lg border-2 border-[#F5B82E]/60 bg-[#963049]/85 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#FEF08A]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Golden Lamp */}
            <div className="hidden sm:flex flex-col items-center gap-1 shrink-0" aria-hidden="true">
              <div className="w-9 h-12 rounded-t-full rounded-b-lg border-2 border-[#D4941A] bg-gradient-to-b from-[#FEF08A] via-[#F59E0B] to-[#92400E] shadow-[0_0_24px_rgba(245,184,46,0.55)]" />
              <div className="w-2 h-16 bg-gradient-to-b from-[#F5B82E] to-[#78350F] rounded-full" />
              <div className="w-7 h-2 rounded-full bg-[#D4941A]" />
            </div>
          </div>

          {/* Right: Cikgu Kancil + MULA TONTON CTA */}
          <div className="lg:col-span-4 rounded-2xl border border-[#E5C27D] bg-[#FFFCF4] p-5 space-y-4 text-center lg:text-left shadow-sm">
            <div className="flex items-center gap-3.5 justify-center lg:justify-start">
              <img
                src={CIKGU_KANCIL_IMAGE}
                alt="Cikgu Kancil menyambut di pintu Dewan Seribu Kisah"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F5B82E] shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-[#9A5B13]">CIKGU KANCIL</p>
                <p className="text-sm font-bold text-[#3D2612]">Pemandu Dewan</p>
              </div>
            </div>

            <p className="text-sm text-[#4E341C] leading-relaxed">
              “Tirai malam kemuncak sudah sedia menanti! Mari masuk ke Dewan Seribu Kisah untuk menonton persembahan akhir dan memberikan sokongan kepada rakan-rakan.”
            </p>

            <div className="rounded-xl bg-[#FAF1D4] border border-[#E2CA99] px-3.5 py-2.5 text-xs text-[#6B4E31]">
              Persembahan tersedia sekarang:{' '}
              <strong className="text-[#8A5600] tabular-nums">{performances.length} persembahan akhir</strong>
            </div>

            <button
              type="button"
              disabled={doorsOpening}
              onClick={handleEnterHall}
              className="min-h-[52px] w-full px-6 py-3 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-base shadow-sm hover:bg-[#E5A420] transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              {doorsOpening ? 'MEMBUKA PINTU DEWAN...' : 'MULA TONTON'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* PAPARAN KEDUA: KOLEKSI PERSEMBAHAN AKHIR MURID                             */
  /* -------------------------------------------------------------------------- */
  if (hallScreen === 'collection') {
    return (
      <div className="space-y-6">
        {/* Stage Backdrop Header with CLOSED Pastel Rose-Coral Curtains + Audience */}
        <div className="rounded-3xl border-2 border-[#E5C27D] bg-[#FFFCF4] overflow-hidden shadow-md">
          <div className="relative px-5 sm:px-8 pt-6 pb-8 text-center overflow-hidden">
            {/* Closed Rose-Berry Curtains Backdrop */}
            <div className="absolute inset-0 flex pointer-events-none" aria-hidden="true">
              <div
                className="w-1/2 h-full border-r-2 border-[#F5B82E]/70"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #9F2D49 0px, #C85470 18px, #8F2540 34px)'
                }}
              />
              <div
                className="w-1/2 h-full border-l-2 border-[#F5B82E]/70"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #8F2540 0px, #C85470 18px, #9F2D49 34px)'
                }}
              />
            </div>

            {/* Golden Spotlights from above */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 25% 0%, rgba(254,240,138,0.38), transparent 55%), radial-gradient(ellipse at 75% 0%, rgba(254,240,138,0.38), transparent 55%), linear-gradient(180deg, rgba(61,38,18,0.28) 0%, rgba(61,38,18,0.68) 100%)'
              }}
              aria-hidden="true"
            />

            {/* Valance gold trim */}
            <div className="relative z-10 inline-flex items-center gap-2 rounded-xl border-2 border-[#F5B82E] bg-[#FFFCF4] px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#9A5B13] shadow-md">
              <Sparkles className="w-4 h-4 text-[#B4690E]" />
              PENTAS SERIBU KISAH
              <Sparkles className="w-4 h-4 text-[#B4690E]" />
            </div>

            <div className="relative z-10 mt-3 space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
                KOLEKSI PERSEMBAHAN AKHIR MURID
              </h3>
              <p className="max-w-2xl mx-auto text-sm text-[#FEF08A]">
                Pilih persembahan di bawah untuk melangkah ke pentas dan membuka tirai persembahan!
              </p>
            </div>

            {/* Illustrated Audience Silhouettes */}
            <div className="relative z-10 mt-6 flex items-end justify-center gap-2.5 sm:gap-4 opacity-90" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-[#3D2612] border border-[#F5B82E]/60" />
                  <div className="w-7 h-4 rounded-t-full bg-[#3D2612] border-t border-[#F5B82E]/50" />
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="bg-[#FAF1D4] border-t border-[#E5C27D] p-5 sm:p-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search Box */}
              <div className="relative flex-1 max-w-xl">
                <Search className="w-4 h-4 text-[#B4690E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama rakan yang ingin kamu tonton…"
                  className="w-full min-h-[46px] pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Kosongkan carian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#FAF1D4] hover:bg-[#FCEBB6] text-[#7A440B] flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'semua', label: 'SEMUA PERSEMBAHAN', count: performances.length },
                    {
                      id: 'saya',
                      label: 'PERSEMBAHAN SAYA',
                      count: performances.filter((p) => p.isMine).length
                    },
                    {
                      id: 'rakan',
                      label: 'PERSEMBAHAN RAKAN',
                      count: performances.filter((p) => !p.isMine).length
                    }
                  ] as const
                ).map((tab) => {
                  const active = filterMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setFilterMode(tab.id);
                      }}
                      className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
                        active
                          ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A] shadow-xs'
                          : 'bg-[#FFFCF4] text-[#4E341C] border-[#DFC792] hover:bg-[#FCEBB6]'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] tabular-nums ${
                          active ? 'bg-[#3A2208]/15 text-[#3A2208]' : 'bg-[#FAF1D4] text-[#9A5B13]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B4E31]">
              <span>
                Nota prototaip: Rekod berlabel “Contoh Prototaip” ialah data sampel setempat bagi tujuan demonstrasi kelas.
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setHallScreen('entrance');
                }}
                className="text-xs font-bold text-[#8A5600] hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Pintu Masuk Dewan
              </button>
            </div>
          </div>
        </div>

        {/* Performance Cards Grid */}
        {filteredPerformances.length === 0 ? (
          <div className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-10 text-center space-y-3 shadow-sm">
            <Film className="w-10 h-10 text-[#B4690E] mx-auto" />
            <h4 className="text-lg font-bold text-[#3D2612]">Tiada Persembahan Ditemui</h4>
            <p className="text-sm text-[#6B4E31] max-w-md mx-auto">
              {searchQuery
                ? `Tiada persembahan sepadan dengan carian "${searchQuery}". Cuba padam kata carian atau pilih tab lain.`
                : filterMode === 'saya'
                ? 'Kamu belum menghantar video persembahan akhir. Lengkapkan ruangan rakaman di atas untuk menghantar video kamu ke Dewan Seribu Kisah.'
                : 'Belum ada persembahan akhir rakan dihantar lagi.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPerformances.map((perf) => {
              const hasRealVideo = perf.videoType === 'upload' || perf.videoType === 'camera';
              return (
                <article
                  key={perf.performanceId}
                  className={`rounded-3xl border-2 bg-[#FFFCF4] overflow-hidden flex flex-col justify-between shadow-sm transition-all hover:border-[#D4941A] ${
                    perf.isMine ? 'border-[#D4941A]' : 'border-[#E5CFA0]'
                  }`}
                >
                  {/* Thumbnail Header */}
                  <div>
                    <div className="relative h-44 bg-[#2B1B0E] overflow-hidden">
                      {hasRealVideo ? (
                        <video
                          src={perf.videoUrl}
                          preload="metadata"
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <img
                            src={perf.storyImage}
                            alt={perf.storyTitle}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-85"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                          <span className="absolute bottom-2.5 left-3 rounded-lg bg-[#FFFCF4]/95 border border-[#E5C27D] px-2.5 py-1 text-[11px] font-semibold text-[#7A440B]">
                            {perf.videoType === 'link' ? 'Pautan Video' : 'Pratonton Ilustrasi (Prototaip)'}
                          </span>
                        </>
                      )}

                      {/* Center Play Icon */}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#F5B82E] border-2 border-white text-[#3A2208] flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Badges Top */}
                      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                        {perf.isMine ? (
                          <span className="rounded-lg bg-[#F5B82E] px-2.5 py-1 text-[11px] font-bold text-[#3A2208] shadow">
                            PERSEMBAHAN SAYA
                          </span>
                        ) : (
                          <span className="rounded-lg bg-[#FFFCF4]/95 border border-[#E5C27D] px-2.5 py-1 text-[11px] font-bold text-[#3D2612]">
                            PERSEMBAHAN RAKAN
                          </span>
                        )}

                        {perf.isDemo && (
                          <span className="rounded-lg bg-[#C85470]/95 border border-[#F5B82E]/60 px-2.5 py-1 text-[11px] font-semibold text-white">
                            Contoh Prototaip
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Body */}
                    <div className="p-5 space-y-2.5">
                      <div>
                        <h4 className="text-lg font-bold text-[#3D2612] leading-snug">{perf.ownerName}</h4>
                        <p className="text-xs font-semibold text-[#9A5B13]">{perf.ownerClass}</p>
                      </div>

                      <div className="rounded-xl bg-[#FAF1D4] border border-[#E2CA99] p-3 space-y-1 text-xs">
                        <p className="text-[#8A5600] font-bold">{perf.storyTitle}</p>
                        <p className="text-[#4E341C]">Bentuk: {perf.performanceStyle}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#6B4E31] pt-1">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#B4690E]" />
                          {formatDateOnly(perf.submittedAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-[#235334] tabular-nums">
                          <MessageSquare className="w-3.5 h-3.5 text-[#2E7D52]" />
                          {perf.comments.length} komen
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="px-5 pb-5">
                    <button
                      type="button"
                      onClick={() => handleOpenIndividualStage(perf.ownerId)}
                      className="min-h-[46px] w-full px-4 py-2.5 rounded-xl bg-[#C85470] hover:bg-[#B4435E] border border-[#D4941A]/70 text-white font-bold text-sm transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current text-[#FEF08A]" />
                      LIHAT PERSEMBAHAN
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* PAPARAN KETIGA: PENTAS PERSEMBAHAN INDIVIDU                                */
  /* -------------------------------------------------------------------------- */
  if (!selectedPerformance) {
    return (
      <div className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-8 text-center space-y-4 shadow-sm">
        <p className="text-[#3D2612] font-bold">Persembahan tidak ditemui.</p>
        <button
          type="button"
          onClick={() => setHallScreen('collection')}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420]"
        >
          Kembali ke koleksi persembahan
        </button>
      </div>
    );
  }

  const hasRealVideo =
    selectedPerformance.videoType === 'upload' || selectedPerformance.videoType === 'camera';
  const canDownload =
    hasRealVideo && (selectedPerformance.isMine || selectedPerformance.allowPeerDownload);

  return (
    <div className="space-y-6">
      {/* Top Bar Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setHallScreen('collection');
          }}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FFF7DF] border border-[#DFC792] text-[#4E341C] font-bold text-sm hover:bg-[#FCEBB6] inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke koleksi persembahan
        </button>

        <div className="text-xs font-bold text-[#9A5B13] bg-[#FFFCF4] border border-[#E5C27D] rounded-xl px-4 py-2">
          MALAM PERSEMBAHAN SERIBU KISAH
        </div>
      </div>

      {/* Individual Stage Area with Closed -> Parting Rose-Berry Curtains */}
      <div
        ref={stageBoxRef}
        className="rounded-3xl border-2 border-[#D4941A] bg-[#FFFCF4] overflow-hidden shadow-md"
      >
        {/* Stage Header Strip */}
        <div className="bg-gradient-to-r from-[#FFF3C4] via-[#FDE4EC] to-[#FFF3C4] border-b border-[#E5C27D] px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#9A5B13]">
              PENTAS PERSEMBAHAN INDIVIDU
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-[#3D2612]">
              {selectedPerformance.ownerName}{' '}
              <span className="text-sm font-semibold text-[#8A5600]">({selectedPerformance.ownerClass})</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-lg bg-[#FFFCF4] border border-[#E5C27D] px-3 py-1.5 font-bold text-[#8A5600]">
              {selectedPerformance.storyTitle}
            </span>
            <span className="rounded-lg bg-[#FFFCF4] border border-[#E2CA99] px-3 py-1.5 font-semibold text-[#4E341C]">
              {selectedPerformance.performanceStyle}
            </span>
          </div>
        </div>

        {/* Theater Stage Viewport with Parting Curtains */}
        <div className="relative min-h-[340px] sm:min-h-[420px] bg-[#FAF1D4] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          {/* Top Golden Spotlight Cone */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              curtainOpen ? 'opacity-90' : 'opacity-45'
            }`}
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(245,184,46,0.34), rgba(245,184,46,0.10) 48%, transparent 78%)'
            }}
            aria-hidden="true"
          />

          {/* Wooden Stage Floor Rim */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#9C6635] via-[#C4915C] to-transparent border-t border-[#D4941A]/50"
            aria-hidden="true"
          />

          {/* Center Stage Video Player (behind curtains until opened) */}
          <div className="relative z-10 w-full max-w-3xl space-y-4">
            {hasRealVideo ? (
              <div className="rounded-2xl border-2 border-[#D4941A] bg-black overflow-hidden shadow-xl">
                <video
                  ref={videoRef}
                  src={selectedPerformance.videoUrl}
                  playsInline
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full max-h-[400px] bg-black"
                />

                {/* Stage Player Controls */}
                <div className="bg-[#FFF7DC] border-t border-[#E2CA99] p-3.5 space-y-3">
                  {/* Seek Bar */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-[#6B4E31] tabular-nums">
                    <span>{formatSeconds(currentTime)}</span>
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      aria-label="Kedudukan video persembahan"
                      className="flex-1 accent-[#D4941A] cursor-pointer"
                    />
                    <span>{formatSeconds(duration)}</span>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTogglePlay}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-xs sm:text-sm hover:bg-[#E5A420] inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        {isPlaying ? 'JEDA PERSEMBAHAN' : 'MAINKAN PERSEMBAHAN'}
                      </button>

                      <button
                        type="button"
                        onClick={handleReplay}
                        className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white border border-[#DFC792] text-[#4E341C] font-bold text-xs hover:bg-[#FCEBB6] inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <RotateCcw className="w-4 h-4 text-[#B4690E]" />
                        Tonton semula
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleMute}
                        aria-label={isMuted ? 'Bunyikan video' : 'Senyapkan video'}
                        className="min-h-[42px] px-3 py-2 rounded-xl bg-white border border-[#DFC792] text-[#4E341C] hover:bg-[#FCEBB6]"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-[#9F2D49]" /> : <Volume2 className="w-4 h-4 text-[#B4690E]" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleFullscreen}
                        aria-label="Skrin penuh"
                        className="min-h-[42px] px-3 py-2 rounded-xl bg-white border border-[#DFC792] text-[#4E341C] hover:bg-[#FCEBB6]"
                      >
                        <Maximize2 className="w-4 h-4 text-[#B4690E]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedPerformance.videoType === 'link' ? (
              <div className="rounded-2xl border-2 border-[#E5C27D] bg-[#FFFCF4] p-7 text-center space-y-4 shadow-sm">
                <ExternalLink className="w-10 h-10 text-[#B4690E] mx-auto" />
                <div>
                  <h4 className="text-lg font-bold text-[#3D2612]">Pautan Video Persembahan Akhir</h4>
                  <p className="mt-1 text-xs text-[#8A5600] break-all">{selectedPerformance.videoUrl}</p>
                </div>
                <p className="text-xs text-[#6B4E31] max-w-md mx-auto">
                  Murid ini menghantar pautan video luar. Pastikan pautan hanya dibuka dalam persekitaran kelas yang diselia.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-[#E5C27D] bg-[#FFFCF4] overflow-hidden shadow-sm">
                <div className="relative h-56 sm:h-64">
                  <img
                    src={selectedPerformance.storyImage}
                    alt={selectedPerformance.storyTitle}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25 flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <Sparkles className="w-9 h-9 text-[#FDE047]" />
                    <p className="text-base sm:text-lg font-bold text-white">
                      {selectedPerformance.videoLabel}
                    </p>
                    <p className="text-xs text-[#FEF08A] max-w-md">
                      Entri Contoh Prototaip: Tiada fail video sebenar dilampirkan pada sampel ini. Murid sebenar yang memuat naik fail MP4/WebM atau merakam kamera akan memaparkan pemain video sebenar di sini.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Left Rose-Berry Curtain */}
          <div
            className={`absolute inset-y-0 left-0 w-1/2 z-20 border-r-4 border-[#F5B82E] transition-transform duration-700 ease-out pointer-events-none ${
              curtainOpen ? '-translate-x-full' : 'translate-x-0'
            }`}
            style={{
              background:
                'repeating-linear-gradient(90deg, #9F2D49 0px, #C85470 22px, #8F2540 42px)'
            }}
            aria-hidden="true"
          />

          {/* Right Rose-Berry Curtain */}
          <div
            className={`absolute inset-y-0 right-0 w-1/2 z-20 border-l-4 border-[#F5B82E] transition-transform duration-700 ease-out pointer-events-none ${
              curtainOpen ? 'translate-x-full' : 'translate-x-0'
            }`}
            style={{
              background:
                'repeating-linear-gradient(90deg, #8F2540 0px, #C85470 22px, #9F2D49 42px)'
            }}
            aria-hidden="true"
          />

          {/* Pre-Open Curtain Overlay */}
          {!curtainOpen && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-black/25">
              <div className="max-w-lg rounded-3xl border-2 border-[#D4941A] bg-[#FFFCF4]/95 p-6 sm:p-8 shadow-xl space-y-4">
                <p className="text-xs font-bold tracking-[0.22em] text-[#9A5B13]">
                  MALAM PERSEMBAHAN SERIBU KISAH
                </p>
                <h4 className="text-2xl sm:text-3xl font-bold text-[#3D2612]">
                  {selectedPerformance.ownerName}
                </h4>
                <p className="text-sm text-[#4E341C]">
                  Kelas <strong>{selectedPerformance.ownerClass}</strong> · Cerita{' '}
                  <strong className="text-[#8A5600]">{selectedPerformance.storyTitle}</strong> ·{' '}
                  {selectedPerformance.performanceStyle}
                </p>
                <button
                  type="button"
                  onClick={handleOpenCurtain}
                  className="min-h-[52px] px-8 py-3 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-base shadow-sm hover:bg-[#E5A420] transition-colors whitespace-nowrap"
                >
                  BUKA TIRAI
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Download Video & Privacy Section below stage */}
        <div className="bg-[#FAF1D4] border-t border-[#E5C27D] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#3D2612] flex items-center gap-2">
                <Video className="w-4 h-4 text-[#B4690E]" />
                Muat Turun Video Persembahan Akhir
              </h4>
              <p className="text-xs text-[#6B4E31]">
                {selectedPerformance.isMine
                  ? 'Sebagai pemilik persembahan, kamu boleh memuat turun rakaman video akhir kamu sendiri.'
                  : selectedPerformance.allowPeerDownload
                  ? 'Guru telah membenarkan rakan kelas memuat turun persembahan ini untuk rujukan pembelajaran.'
                  : 'Muat turun video rakan ditutup oleh guru. Hanya pemilik video atau guru boleh memuat turun.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadVideo(selectedPerformance)}
              disabled={!canDownload && hasRealVideo}
              className={`min-h-[46px] px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap inline-flex items-center justify-center gap-2 transition-colors ${
                canDownload
                  ? 'bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] hover:bg-[#E5A420]'
                  : 'bg-[#FFF7DF] border border-[#DFC792] text-[#8A6D4F] cursor-not-allowed'
              }`}
            >
              {canDownload ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              MUAT TURUN VIDEO
            </button>
          </div>

          {downloadMessage && (
            <p
              className={`rounded-xl px-4 py-2.5 text-xs font-bold border ${
                downloadMessage.type === 'ok'
                  ? 'bg-[#E4EFE2] border-[#9EC4A3] text-[#1F4B2F]'
                  : 'bg-[#FDE4E8] border-[#E598A8] text-[#881D38]'
              }`}
            >
              {downloadMessage.text}
            </p>
          )}

          <div className="rounded-xl border border-[#EAB892] bg-[#FCEAD8] px-4 py-3 flex items-start gap-2.5 text-xs text-[#7A3A1E]">
            <ShieldAlert className="w-4 h-4 text-[#B4690E] shrink-0 mt-0.5" />
            <span>
              <strong>Peringatan Privasi:</strong> Video persembahan murid adalah untuk pembelajaran kelas sahaja. Elakkan berkongsi rakaman ke media sosial awam tanpa kebenaran guru dan ibu bapa.
            </span>
          </div>
        </div>
      </div>

      {/* Komen dan Penghargaan Penonton */}
      <div className="rounded-3xl border border-[#E5C27D] bg-[#FFFCF4] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wider text-[#9A5B13]">
              PENGHARGAAN & SOKONGAN PENONTON
            </p>
            <h4 className="text-xl font-bold text-[#3D2612]">
              Komen Rakan & Guru ({selectedPerformance.comments.length})
            </h4>
          </div>
        </div>

        {/* Add Comment Form */}
        <form
          onSubmit={handleSubmitComment}
          className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="inline-flex items-center gap-2 font-bold text-[#3D2612]">
              <User className="w-4 h-4 text-[#B4690E]" />
              Penghantar: {activeStudent.name} ({activeStudent.className})
            </div>
            <span className="rounded-md bg-[#FCEAD8] border border-[#EAB892] px-2.5 py-1 font-bold text-[#7A3A1E]">
              PERANAN: MURID
            </span>
          </div>

          {/* 4 Polite Prompt Chips */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#6B4E31]">
              Pilih ilham komen membina atau tulis sendiri:
            </p>
            <div className="flex flex-wrap gap-2">
              {POLITE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setCommentText((prev) => (prev ? `${prev} ` : '') + prompt + ' ');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#FFFCF4] border border-[#DFC792] text-xs text-[#4E341C] hover:border-[#D4941A] hover:bg-[#FCEBB6] text-left transition-colors"
                >
                  + {prompt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Tulis komen penghargaan untuk ${selectedPerformance.ownerName}...`}
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
            />
            <p className="mt-1.5 text-xs text-[#6B4E31]">
              Gunakan bahasa yang sopan, menghargai usaha rakan dan membina keyakinan diri.
            </p>
          </div>

          {commentError && (
            <p className="rounded-lg bg-[#FDE4E8] border border-[#E598A8] px-3 py-1.5 text-xs font-bold text-[#881D38]">
              {commentError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] whitespace-nowrap inline-flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              HANTAR KOMEN
            </button>
          </div>
        </form>

        {/* Comments List (Newest First) */}
        <div className="space-y-3">
          {selectedPerformance.comments.length === 0 ? (
            <p className="text-sm text-[#6B4E31] text-center py-4">
              Belum ada komen lagi. Jadilah penonton pertama yang memberikan penghargaan!
            </p>
          ) : (
            selectedPerformance.comments.map((c) => {
              const isTeacher = c.role === 'guru';
              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border p-4 space-y-1.5 ${
                    isTeacher
                      ? 'border-[#E9B1C4] bg-gradient-to-r from-[#FDE4EC] to-[#FFF2DB]'
                      : 'border-[#EAB892] bg-[#FFF8EC]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isTeacher ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#F5B82E] px-2 py-0.5 text-[11px] font-bold text-[#3A2208]">
                          <GraduationCap className="w-3.5 h-3.5" />
                          GURU
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#FCEAD8] border border-[#EAB892] px-2 py-0.5 text-[11px] font-bold text-[#7A3A1E]">
                          <User className="w-3 h-3" />
                          MURID
                        </span>
                      )}
                      <span className="text-sm font-bold text-[#3D2612]">{c.author}</span>
                      {!isTeacher && c.authorClass && (
                        <span className="text-xs text-[#6B4E31]">({c.authorClass})</span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6B4E31] tabular-nums">
                      {formatDateTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-[#4E341C] leading-relaxed">{c.message}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
