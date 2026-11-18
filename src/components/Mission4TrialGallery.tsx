import { FormEvent, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Film,
  GraduationCap,
  Maximize2,
  MessageSquare,
  Pause,
  Play,
  Search,
  Send,
  Sparkles,
  User,
  Video,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { CIKGU_KANCIL_IMAGE, STORIES } from '../data/stories';
import { FeedbackComment, StudentRecord } from '../types';
import { soundEngine } from '../utils/sound';

interface Mission4TrialGalleryProps {
  activeStudent: StudentRecord;
  allStudents: StudentRecord[];
  onAddCommentToRecording: (targetStudentId: string, comment: FeedbackComment) => void;
}

interface TrialRecordingItem {
  recordingId: string;
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
  uploadedAt: string;
  comments: FeedbackComment[];
}

type GalleryFilter = 'semua' | 'saya' | 'rakan';
type ReceivedCommentFilter = 'semua' | 'rakan' | 'guru';

function formatDateOnly(iso: string): string {
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

function buildUnifiedComments(student: StudentRecord): FeedbackComment[] {
  const list = [...student.mission4.peerComments];
  const tf = student.mission4.teacherFeedback?.trim();
  if (tf) {
    const alreadyInList = list.some(
      (c) => c.role === 'guru' && c.message.trim() === tf
    );
    if (!alreadyInList) {
      list.push({
        id: `legacy-guru-${student.id}`,
        recordingId: `rec-${student.id}`,
        authorId: 'teacher-legacy',
        author: student.mission4.teacherAuthor || 'Cikgu',
        role: 'guru',
        strengths: '',
        improvement: '',
        suggestion: '',
        message: tf,
        createdAt: student.updatedAt || new Date().toISOString()
      });
    }
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function Mission4TrialGallery({
  activeStudent,
  allStudents,
  onAddCommentToRecording
}: Mission4TrialGalleryProps) {
  const [stageView, setStageView] = useState<'magic_book' | 'gallery' | 'detail'>('magic_book');
  const [isBookOpening, setIsBookOpening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>('semua');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [receivedFilter, setReceivedFilter] = useState<ReceivedCommentFilter>('semua');

  // Comment form state
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');

  // Custom HTML5 video player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerBoxRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Derive 1 recording per student who has uploaded/activated a trial video in Bahagian A
  const recordings: TrialRecordingItem[] = useMemo(() => {
    const list: TrialRecordingItem[] = [];
    const seenOwnerIds = new Set<string>();

    for (const s of allStudents) {
      if (seenOwnerIds.has(s.id)) continue;
      if (!s.mission4.trialVideoUrl) continue;
      seenOwnerIds.add(s.id);

      const story = STORIES.find((st) => st.id === s.selectedStoryId) || STORIES[0];
      list.push({
        recordingId: `rec-${s.id}`,
        ownerId: s.id,
        ownerName: s.name,
        ownerClass: s.className,
        isMine: s.id === activeStudent.id,
        isDemo: Boolean(s.isDemo),
        storyId: story.id,
        storyTitle: story.title,
        storyImage: story.image,
        performanceStyle: s.mission3.selectedStyle || 'Bacaan secara ekspresif',
        videoUrl: s.mission4.trialVideoUrl,
        videoType: s.mission4.trialVideoType,
        videoLabel: s.mission4.trialVideoLabel,
        uploadedAt: s.mission4.trialVideoUploadedAt || s.updatedAt,
        comments: buildUnifiedComments(s)
      });
    }

    // Place active student's recording first if available
    return list.sort((a, b) => {
      if (a.isMine && !b.isMine) return -1;
      if (!a.isMine && b.isMine) return 1;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }, [allStudents, activeStudent.id]);

  const filteredRecordings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recordings.filter((rec) => {
      if (galleryFilter === 'saya' && !rec.isMine) return false;
      if (galleryFilter === 'rakan' && rec.isMine) return false;
      if (q && !rec.ownerName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [recordings, galleryFilter, searchQuery]);

  const selectedRecording = useMemo(
    () => recordings.find((r) => r.ownerId === selectedOwnerId) || null,
    [recordings, selectedOwnerId]
  );

  // Comments received strictly by the currently logged-in student
  const myRecording = recordings.find((r) => r.isMine) || null;
  const myReceivedComments = useMemo(() => {
    const unified = buildUnifiedComments(activeStudent);
    return unified;
  }, [activeStudent]);

  const filteredReceivedComments = useMemo(() => {
    if (receivedFilter === 'semua') return myReceivedComments;
    return myReceivedComments.filter((c) => c.role === receivedFilter);
  }, [myReceivedComments, receivedFilter]);

  const totalReceivedCount = myReceivedComments.length;
  const studentReceivedCount = myReceivedComments.filter((c) => c.role === 'rakan').length;
  const teacherReceivedCount = myReceivedComments.filter((c) => c.role === 'guru').length;

  const handleOpenMagicBook = () => {
    soundEngine.playFanfare();
    setIsBookOpening(true);
    window.setTimeout(() => {
      setIsBookOpening(false);
      setStageView('gallery');
    }, 420);
  };

  const handleOpenRecordingDetail = (ownerId: string) => {
    soundEngine.playClick();
    setSelectedOwnerId(ownerId);
    setCommentText('');
    setCommentError('');
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setStageView('detail');
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

  const handleToggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  const handleSeek = (val: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = val;
    setCurrentTime(val);
  };

  const handleFullscreen = () => {
    const target = videoRef.current || playerBoxRef.current;
    if (target && target.requestFullscreen) {
      target.requestFullscreen().catch(() => {});
    }
  };

  const handleSubmitComment = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRecording) return;

    const cleanMsg = commentText.trim();
    if (!cleanMsg) {
      setCommentError('Sila tulis komen yang positif dan membina sebelum menghantar.');
      soundEngine.playGentleRetry();
      return;
    }

    setCommentError('');
    soundEngine.playSuccess();

    const newComment: FeedbackComment = {
      id: `komen-${Date.now()}`,
      recordingId: selectedRecording.recordingId,
      authorId: activeStudent.id,
      author: activeStudent.name,
      role: 'rakan',
      authorClass: activeStudent.className,
      strengths: cleanMsg,
      improvement: '',
      suggestion: '',
      message: cleanMsg,
      createdAt: new Date().toISOString()
    };

    onAddCommentToRecording(selectedRecording.ownerId, newComment);
    setCommentText('');
  };

  return (
    <div className="space-y-7">
      {/* Main Section Container: Bahagian B */}
      <section className="rounded-3xl border border-[#E5C27D] bg-[#FFFCF4] p-6 sm:p-8 shadow-sm">
        {/* PAPARAN PERTAMA – BUKU AJAIB KOLEKSI RAKAMAN */}
        {stageView === 'magic_book' && (
          <div className="py-4 sm:py-6 flex flex-col items-center text-center space-y-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-bold tracking-widest text-[#9A5B13]">
                BAHAGIAN B · GALERI KOLEKSI RAKAMAN PERCUBAAN
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3D2612]">
                BUKU KOLEKSI RAKAMAN PERCUBAAN
              </h2>
              <p className="text-sm sm:text-base text-[#8A5600] font-medium">
                “Lihat Persembahan, Berikan Pandangan, Bantu Rakan!”
              </p>
            </div>

            {/* Magic Book Centerpiece + Cikgu Kancil Guide */}
            <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8">
              <button
                type="button"
                onClick={handleOpenMagicBook}
                aria-label="Buka Buku Koleksi Rakaman Percubaan"
                className={`group relative w-64 sm:w-72 h-80 rounded-r-3xl rounded-l-xl border-4 border-[#D4941A] bg-gradient-to-br from-[#FFF6D6] via-[#FDEAB2] to-[#F7D786] p-5 flex flex-col items-center justify-between shadow-[0_14px_34px_rgba(140,94,20,0.22)] hover:shadow-[0_18px_40px_rgba(140,94,20,0.34)] transition-all duration-300 cursor-pointer ${
                  isBookOpening ? 'scale-105 opacity-0 -rotate-3' : 'hover:-translate-y-1'
                }`}
              >
                {/* Book spine */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-5 rounded-l-lg bg-gradient-to-r from-[#B4435E] to-[#C85470] border-r-2 border-[#D4941A]"
                  aria-hidden="true"
                />
                {/* Ornate golden corner filigree */}
                <div className="w-full pl-3 flex items-center justify-between text-[#8A5600]" aria-hidden="true">
                  <span className="text-xs font-bold tracking-widest">✦ TEATER</span>
                  <span className="text-xs font-bold tracking-widest">FANTASI ✦</span>
                </div>

                {/* Theater arch + camera emblem */}
                <div className="pl-3 flex flex-col items-center gap-3">
                  <div className="w-36 h-24 rounded-t-full border-2 border-[#D4941A] bg-[#FDE4EC] flex items-center justify-center relative overflow-hidden">
                    {/* Theater curtain drape motif */}
                    <div className="absolute left-0 top-0 bottom-0 w-5 bg-[#C85470] rounded-br-2xl border-r border-[#D4941A]/60" />
                    <div className="absolute right-0 top-0 bottom-0 w-5 bg-[#C85470] rounded-bl-2xl border-l border-[#D4941A]/60" />
                    <div className="w-12 h-12 rounded-2xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Video className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-[#3D2612] leading-tight">
                      Koleksi Rakaman Kelas
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#6B4E31] tabular-nums">
                      {recordings.length} rakaman tersedia
                    </p>
                  </div>
                </div>

                <div className="pl-3 w-full border-t border-[#D4941A]/40 pt-2.5 text-[11px] font-bold tracking-wider text-[#8A5600]">
                  TEKAN UNTUK MEMBUKA
                </div>
              </button>

              {/* Cikgu Kancil beside the magic book */}
              <div className="max-w-xs rounded-2xl border border-[#E5C27D] bg-[#FAF1D4] p-5 text-center md:text-left space-y-3 shadow-sm">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <img
                    src={CIKGU_KANCIL_IMAGE}
                    alt="Cikgu Kancil memandu murid"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F5B82E]"
                  />
                  <div>
                    <p className="text-xs font-bold tracking-wider text-[#9A5B13]">CIKGU KANCIL</p>
                    <p className="text-xs text-[#6B4E31]">Penjaga Buku Koleksi</p>
                  </div>
                </div>
                <p className="text-sm text-[#4E341C] leading-relaxed">
                  “Setiap persembahan mempunyai cerita dan keistimewaannya tersendiri. Tekan buku ajaib ini untuk melihat rakaman kamu dan rakan-rakan!”
                </p>
                <button
                  type="button"
                  onClick={handleOpenMagicBook}
                  className="min-h-[48px] w-full px-6 py-3 rounded-xl bg-[#C85470] border-2 border-[#F5B82E] text-white font-bold text-sm sm:text-base hover:bg-[#B4435E] inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-[#FEF08A]" />
                  LIHAT KOLEKSI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAPARAN KEDUA – SEMUA KOLEKSI RAKAMAN */}
        {stageView === 'gallery' && (
          <div className="space-y-6 animate-stage-burst">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EDE0BC]">
              <div>
                <p className="text-xs font-bold tracking-wider text-[#9A5B13]">
                  BAHAGIAN B · “Lihat Persembahan, Berikan Pandangan, Bantu Rakan!”
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#3D2612]">
                  GALERI KOLEKSI RAKAMAN PERCUBAAN
                </h2>
                <p className="mt-1 text-sm text-[#6B4E31]">
                  “Terokai persembahan percubaan kamu dan rakan-rakan. Tonton, hayati dan berikan komen yang membina!”
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setStageView('magic_book');
                }}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-[#DFC792] bg-[#FFF7DF] hover:bg-[#FCEBB6] text-xs font-bold text-[#4E341C] inline-flex items-center gap-2 whitespace-nowrap self-start md:self-auto transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Tutup Buku Koleksi
              </button>
            </div>

            {/* Honest Prototype Notice */}
            <div className="rounded-xl border border-[#EAB892] bg-[#FCEAD8] px-4 py-2.5 text-xs text-[#7A3A1E]">
              Nota Prototaip: Rakaman yang kamu muat naik di Bahagian A terus dipaparkan dalam galeri ini secara setempat. Rakaman rakan lain ialah data demonstrasi kelas untuk latihan memberi maklum balas.
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* A. Bahagian Carian Murid */}
              <div className="relative flex-1 max-w-md flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#B4690E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama murid atau rakan kamu…"
                    className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSearchQuery('');
                      }}
                      aria-label="Padam carian"
                      className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded-lg hover:bg-[#FAF1D4] text-[#7A440B]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSearchQuery('');
                    }}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DFC792] bg-[#FFF7DF] hover:bg-[#FCEBB6] text-xs font-bold text-[#4E341C] whitespace-nowrap transition-colors"
                  >
                    Padam Carian
                  </button>
                )}
              </div>

              {/* B. Penapis Koleksi */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#FAF1D4] border border-[#E2CA99]">
                {(
                  [
                    { id: 'semua', label: 'SEMUA RAKAMAN' },
                    { id: 'saya', label: 'RAKAMAN SAYA' },
                    { id: 'rakan', label: 'RAKAMAN RAKAN' }
                  ] as { id: GalleryFilter; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setGalleryFilter(tab.id);
                    }}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      galleryFilter === tab.id
                        ? 'bg-[#F5B82E] text-[#3A2208] shadow-xs'
                        : 'text-[#4E341C] hover:bg-[#FFFDF4]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* C. Paparan Kad Video Grid */}
            {filteredRecordings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#DFC792] bg-[#FAF1D4] p-8 text-center space-y-3">
                <Video className="w-10 h-10 text-[#B4690E] mx-auto" />
                <p className="text-base font-bold text-[#3D2612]">
                  {galleryFilter === 'saya' && !myRecording
                    ? 'Kamu belum memuat naik rakaman percubaan di Bahagian A.'
                    : 'Tiada rakaman dijumpai untuk carian atau penapis ini.'}
                </p>
                <p className="text-xs text-[#6B4E31]">
                  {galleryFilter === 'saya' && !myRecording
                    ? 'Muat naik video, rakam kamera atau aktifkan simulasi di Bahagian A supaya rakaman kamu terus muncul di sini!'
                    : 'Cuba padam kata carian atau pilih penapis SEMUA RAKAMAN.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSearchQuery('');
                    setGalleryFilter('semua');
                  }}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-xs hover:bg-[#E5A420] transition-colors"
                >
                  Papar Semua Rakaman
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRecordings.map((rec) => {
                  const isPlayableFile = rec.videoType === 'upload' || rec.videoType === 'camera';
                  return (
                    <div
                      key={rec.recordingId}
                      className={`rounded-2xl border overflow-hidden flex flex-col justify-between bg-[#FAF1D4] shadow-sm transition-transform hover:-translate-y-0.5 ${
                        rec.isMine ? 'border-2 border-[#D4941A]' : 'border-[#E2CA99]'
                      }`}
                    >
                      <div>
                        {/* Video Thumbnail / Preview */}
                        <button
                          type="button"
                          onClick={() => handleOpenRecordingDetail(rec.ownerId)}
                          className="relative w-full h-44 bg-[#2B1B0E] overflow-hidden group block text-left"
                        >
                          {isPlayableFile ? (
                            <video
                              src={rec.videoUrl}
                              muted
                              preload="metadata"
                              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <img
                              src={rec.storyImage}
                              alt={`Pratonton cerita ${rec.storyTitle}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />

                          {/* Top status / RAKAMAN SAYA label */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            {rec.isMine ? (
                              <span className="px-2.5 py-1 rounded-lg bg-[#F5B82E] text-[#3A2208] text-[11px] font-bold shadow">
                                RAKAMAN SAYA
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-[#C85470]/95 text-white text-[11px] font-bold shadow">
                                {rec.isDemo ? 'Demonstrasi Kelas' : 'Rakaman Rakan'}
                              </span>
                            )}
                            <span className="px-2 py-1 rounded-lg bg-black/60 text-[11px] font-semibold text-white">
                              Rakaman Percubaan
                            </span>
                          </div>

                          {/* Center Play Button Icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-[#F5B82E] border-2 border-white text-[#3A2208] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </div>
                          </div>
                        </button>

                        {/* Card Details */}
                        <div className="p-4 space-y-2.5">
                          <div>
                            <h3 className="text-base font-bold text-[#3D2612] leading-snug">{rec.ownerName}</h3>
                            <p className="text-xs text-[#6B4E31]">
                              Kelas {rec.ownerClass} · {rec.performanceStyle}
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-[#8A5600]">
                            {rec.storyTitle}
                          </p>

                          <div className="flex items-center justify-between text-xs text-[#6B4E31] pt-1 border-t border-[#E2CA99] tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#B4690E]" />
                              {formatDateOnly(rec.uploadedAt)}
                            </span>
                            <span className="inline-flex items-center gap-1 font-bold text-[#235334]">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {rec.comments.length} komen
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <button
                          type="button"
                          onClick={() => handleOpenRecordingDetail(rec.ownerId)}
                          className="min-h-[42px] w-full px-4 py-2 rounded-xl bg-[#C85470] hover:bg-[#B4435E] border border-[#D4941A]/60 text-white font-bold text-xs sm:text-sm transition-colors"
                        >
                          LIHAT RAKAMAN
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PAPARAN KETIGA – VIDEO DAN RUANG KOMEN */}
        {stageView === 'detail' && selectedRecording && (
          <div className="space-y-6 animate-stage-burst">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EDE0BC]">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setStageView('gallery');
                }}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-[#DFC792] bg-[#FFF7DF] hover:bg-[#FCEBB6] text-xs sm:text-sm font-bold text-[#4E341C] inline-flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Galeri Koleksi
              </button>

              {selectedRecording.isMine && (
                <span className="px-3 py-1 rounded-lg bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] text-xs font-bold">
                  RAKAMAN SAYA
                </span>
              )}
            </div>

            {/* A. Maklumat Rakaman */}
            <div className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">
                    {selectedRecording.ownerName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-[#FCEAD8] border border-[#EAB892] text-[11px] font-bold text-[#7A3A1E]">
                    MURID
                  </span>
                  <span className="text-xs font-semibold text-[#6B4E31]">
                    · {selectedRecording.ownerClass}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#8A5600]">
                  {selectedRecording.storyTitle} · {selectedRecording.performanceStyle}
                </p>
              </div>
              <div className="text-xs text-[#6B4E31] tabular-nums">
                Dimuat naik: <strong className="text-[#3D2612]">{formatDateOnly(selectedRecording.uploadedAt)}</strong>
              </div>
            </div>

            {/* B. Pemain Video */}
            <div
              ref={playerBoxRef}
              className="rounded-2xl border-2 border-[#E5C27D] bg-[#FAF1D4] overflow-hidden shadow-md"
            >
              {selectedRecording.videoType === 'upload' || selectedRecording.videoType === 'camera' ? (
                <div>
                  <video
                    ref={videoRef}
                    src={selectedRecording.videoUrl}
                    onTimeUpdate={() => {
                      if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) setDuration(videoRef.current.duration);
                    }}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full max-h-[440px] bg-black"
                  />
                  {/* Custom Accessible Controls */}
                  <div className="p-3.5 sm:p-4 bg-[#FFF7DC] border-t border-[#E2CA99] flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="min-h-[40px] px-4 py-1.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#E5A420]"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      {isPlaying ? 'Jeda' : 'Main'}
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleMute}
                      className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-[#DFC792] bg-white text-[#4E341C] hover:bg-[#FCEBB6]"
                      aria-label={isMuted ? 'Bunyikan video' : 'Senyapkan video'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-[#9F2D49]" /> : <Volume2 className="w-4 h-4 text-[#B4690E]" />}
                    </button>

                    <div className="flex-1 min-w-[140px] flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#6B4E31] tabular-nums">{formatSeconds(currentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => handleSeek(Number(e.target.value))}
                        aria-label="Bar kemajuan video"
                        className="w-full accent-[#D4941A]"
                      />
                      <span className="text-xs font-semibold text-[#6B4E31] tabular-nums">{formatSeconds(duration)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleFullscreen}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#DFC792] bg-white hover:bg-[#FCEBB6] text-xs font-semibold text-[#4E341C] inline-flex items-center gap-1.5"
                    >
                      <Maximize2 className="w-4 h-4 text-[#B4690E]" />
                      Skrin Penuh
                    </button>
                  </div>
                </div>
              ) : selectedRecording.videoType === 'link' ? (
                <div className="p-8 text-center space-y-3">
                  <Film className="w-12 h-12 text-[#B4690E] mx-auto" />
                  <h3 className="text-lg font-bold text-[#3D2612]">Pautan Video Percubaan</h3>
                  <p className="text-sm text-[#8A5600] break-all max-w-xl mx-auto">
                    {selectedRecording.videoUrl}
                  </p>
                  <p className="text-xs text-[#6B4E31]">
                    Rakaman ini dipautkan melalui URL luar. Muat naik fail video sebenar di Bahagian A untuk tontonan terus dalam pemain video.
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <Video className="w-12 h-12 text-[#B4690E] mx-auto" />
                  <h3 className="text-lg font-bold text-[#3D2612]">
                    {selectedRecording.isDemo
                      ? 'Paparan Demonstrasi Rakaman Kelas (Prototaip)'
                      : 'Fail Video Sebenar Belum Dimuat Naik'}
                  </h3>
                  <p className="text-sm text-[#4E341C] max-w-xl mx-auto leading-relaxed">
                    {selectedRecording.isDemo
                      ? `Ini ialah entri demonstrasi untuk ${selectedRecording.ownerName} (${selectedRecording.storyTitle} · ${selectedRecording.performanceStyle}). Apabila murid memuat naik fail video sebenar atau merakam melalui kamera, video boleh dimainkan terus di sini.`
                      : 'Video percubaan diaktifkan dalam mod simulasi prototaip. Muat naik fail video sebenar di Bahagian A untuk memainkannya dengan kawalan penuh di sini.'}
                  </p>
                </div>
              )}
            </div>

            {/* C. Ruang Komen & 5. Fungsi Meninggalkan Komen */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-[#3D2612]">
                    KOMEN DAN MAKLUM BALAS
                  </h3>
                  <span className="text-xs font-bold text-[#9A5B13] tabular-nums">
                    {selectedRecording.comments.length} Komen
                  </span>
                </div>

                {selectedRecording.comments.length === 0 ? (
                  <div className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-6 text-center text-sm text-[#6B4E31]">
                    Belum ada komen untuk rakaman ini. Jadilah orang pertama memberikan pandangan yang membina!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedRecording.comments.map((c) => {
                      const isTeacher = c.role === 'guru';
                      return (
                        <div
                          key={c.id}
                          className={`rounded-2xl border p-4 space-y-2 ${
                            isTeacher
                              ? 'border-[#E9B1C4] bg-gradient-to-r from-[#FDE4EC] to-[#FFF2DB]'
                              : 'border-[#EAB892] bg-[#FFF8EC]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isTeacher
                                    ? 'bg-[#F5B82E] text-[#3A2208]'
                                    : 'bg-[#FCEAD8] text-[#7A3A1E] border border-[#EAB892]'
                                }`}
                              >
                                {isTeacher ? <GraduationCap className="w-5 h-5" /> : <User className="w-4 h-4" />}
                              </div>

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-[#3D2612]">{c.author}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${
                                      isTeacher
                                        ? 'bg-[#F5B82E] text-[#3A2208]'
                                        : 'bg-[#FCEAD8] text-[#7A3A1E] border border-[#EAB892]'
                                    }`}
                                  >
                                    {isTeacher ? 'GURU' : 'MURID'}
                                  </span>
                                  {!isTeacher && c.authorClass && (
                                    <span className="text-xs text-[#6B4E31]">· {c.authorClass}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="text-[11px] text-[#6B4E31] tabular-nums">
                              {formatDateTime(c.createdAt)}
                            </span>
                          </div>

                          <p className="text-sm text-[#4E341C] leading-relaxed pl-11">
                            “{c.message}”
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Leave a Comment Form */}
              <div className="lg:col-span-5">
                <form
                  onSubmit={handleSubmitComment}
                  className="rounded-2xl border border-[#E5C27D] bg-[#FAF1D4] p-5 space-y-4"
                >
                  <div>
                    <h3 className="text-lg font-bold text-[#3D2612]">BERIKAN KOMEN KAMU</h3>
                    <p className="text-xs text-[#6B4E31] mt-0.5">
                      Menghantar sebagai: <strong className="text-[#3D2612]">{activeStudent.name}</strong> (MURID · {activeStudent.className})
                    </p>
                  </div>

                  <textarea
                    rows={4}
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      if (commentError) setCommentError('');
                    }}
                    placeholder="Tulis komen yang positif dan membina…"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                  />

                  {commentError && (
                    <p className="rounded-lg bg-[#FDE4E8] border border-[#E598A8] px-3 py-1.5 text-xs font-semibold text-[#881D38]">
                      {commentError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="min-h-[46px] w-full px-5 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    HANTAR KOMEN
                  </button>

                  <div className="rounded-xl bg-[#FFFCF4] border border-[#E2CA99] p-3.5 text-xs text-[#4E341C] space-y-1.5">
                    <p className="font-bold text-[#9A5B13]">
                      “Berikan komen yang sopan. Nyatakan kekuatan persembahan dan cadangan penambahbaikan.”
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[#6B4E31]">
                      <li>Apakah kekuatan persembahan rakan?</li>
                      <li>Adakah sebutan dan intonasinya jelas?</li>
                      <li>Apakah satu perkara yang boleh diperbaiki?</li>
                      <li>Apakah cadangan kamu untuk membantu rakan?</li>
                    </ul>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* PAPARAN KEEMPAT – KOMEN YANG SAYA TERIMA */}
      <section className="rounded-3xl border border-[#E5C27D] bg-[#FFFCF4] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDE0BC]">
          <div>
            <p className="text-xs font-bold tracking-wider text-[#9A5B13]">
              MAKLUM BALAS PERIBADI UNTUK {activeStudent.name.toUpperCase()}
            </p>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-[#3D2612]">
              KOMEN YANG SAYA TERIMA
            </h2>
            <p className="mt-1 text-sm text-[#6B4E31]">
              “Lihat semua maklum balas daripada rakan-rakan dan guru terhadap rakaman percubaan kamu.”
            </p>
          </div>
        </div>

        {/* A. Paparan Ringkasan Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-4">
            <p className="text-xs font-bold text-[#9A5B13]">Jumlah komen diterima</p>
            <p className="mt-1 text-3xl font-bold text-[#3D2612] tabular-nums">{totalReceivedCount}</p>
          </div>
          <div className="rounded-2xl border border-[#EAB892] bg-[#FCEAD8] p-4">
            <p className="text-xs font-bold text-[#7A3A1E]">Jumlah komen daripada murid</p>
            <p className="mt-1 text-3xl font-bold text-[#3D2612] tabular-nums">{studentReceivedCount}</p>
          </div>
          <div className="rounded-2xl border border-[#E9B1C4] bg-[#FDE4EC] p-4">
            <p className="text-xs font-bold text-[#9F2D49]">Jumlah komen daripada guru</p>
            <p className="mt-1 text-3xl font-bold text-[#3D2612] tabular-nums">{teacherReceivedCount}</p>
          </div>
        </div>

        {/* B. Penapis & Senarai Komen Diterima */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#FAF1D4] border border-[#E2CA99]">
            {(
              [
                { id: 'semua', label: 'SEMUA KOMEN' },
                { id: 'rakan', label: 'KOMEN RAKAN' },
                { id: 'guru', label: 'KOMEN GURU' }
              ] as { id: ReceivedCommentFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setReceivedFilter(tab.id);
                }}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  receivedFilter === tab.id
                    ? 'bg-[#F5B82E] text-[#3A2208] shadow-xs'
                    : 'text-[#4E341C] hover:bg-[#FFFDF4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {myRecording && (
            <button
              type="button"
              onClick={() => handleOpenRecordingDetail(activeStudent.id)}
              className="text-xs font-bold text-[#8A5600] hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D9911E]" />
              Buka Video Saya ({myRecording.storyTitle})
            </button>
          )}
        </div>

        {filteredReceivedComments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DFC792] bg-[#FAF1D4] p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <img
              src={CIKGU_KANCIL_IMAGE}
              alt="Cikgu Kancil memberi semangat"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F5B82E] shrink-0"
            />
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">CIKGU KANCIL</p>
              <p className="text-sm sm:text-base font-semibold text-[#3D2612]">
                “Belum ada komen diterima. Teruskan berkongsi persembahan kamu dan tunggu maklum balas daripada rakan serta guru!”
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReceivedComments.map((c) => {
              const isTeacher = c.role === 'guru';
              const targetVideoTitle =
                myRecording?.storyTitle ||
                STORIES.find((s) => s.id === activeStudent.selectedStoryId)?.title ||
                'Rakaman Percubaan Saya';

              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border p-4 space-y-2.5 ${
                    isTeacher
                      ? 'border-[#E9B1C4] bg-gradient-to-br from-[#FDE4EC] to-[#FFF2DB]'
                      : 'border-[#EAB892] bg-[#FFF8EC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold tracking-wider text-[#9A5B13]">
                        {isTeacher ? 'KOMEN DARIPADA GURU' : 'KOMEN DARIPADA RAKAN'}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#3D2612]">{c.author}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isTeacher
                              ? 'bg-[#F5B82E] text-[#3A2208]'
                              : 'bg-[#FCEAD8] text-[#7A3A1E] border border-[#EAB892]'
                          }`}
                        >
                          {isTeacher ? 'GURU' : 'MURID'}
                        </span>
                        {!isTeacher && c.authorClass && (
                          <span className="text-xs text-[#6B4E31]">· {c.authorClass}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#6B4E31] tabular-nums shrink-0">
                      {formatDateTime(c.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-[#4E341C] leading-relaxed">“{c.message}”</p>

                  <p className="text-xs text-[#6B4E31] pt-2 border-t border-[#E2CA99]">
                    Video dikomen: <strong className="text-[#8A5600]">{targetVideoTitle}</strong>
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-[#6B4E31] pt-2">
          Langkah seterusnya: Gunakan maklum balas yang kamu terima di atas untuk mengenal pasti kelemahan dalam <strong className="text-[#3D2612]">Bahagian C</strong> di bawah.
        </p>
      </section>
    </div>
  );
}
