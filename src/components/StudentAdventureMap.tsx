import { useEffect, useRef, useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  Footprints,
  Lock,
  Play,
  Sparkles,
  Star
} from 'lucide-react';
import { AppScreen, StudentRecord } from '../types';
import { MISSION_BADGES, STORIES } from '../data/stories';
import { CikguKancilBanner } from './CikguKancilGuide';
import AdventureMap3D, { CameraFocusMode } from './AdventureMap3D';
import AchievementPinboard from './AchievementPinboard';
import { soundEngine } from '../utils/sound';

interface StudentAdventureMapProps {
  student: StudentRecord;
  justUnlockedMission: number | null;
  onDismissUnlock: () => void;
  onUpdateMapProgress: (updates: { adventureStarted?: boolean; mapLastStation?: number }) => void;
  onEnterMission: (screen: AppScreen) => void;
  onOpenGallery: () => void;
}

const LOCATIONS: {
  mission: number;
  screen: AppScreen;
  shortLabel: string;
  title: string;
  subtitle: string;
  starsReward: number;
  badgeTitle: string;
}[] = [
  {
    mission: 1,
    screen: 'MISSION_1',
    shortLabel: 'Misi 1',
    title: 'PERPUSTAKAAN SASTERA AJAIB',
    subtitle: 'Pilih dan fahami salah satu daripada tujuh kisah sastera rakyat.',
    starsReward: 10,
    badgeTitle: 'Penjelajah Sastera'
  },
  {
    mission: 2,
    screen: 'MISSION_2',
    shortLabel: 'Misi 2',
    title: 'STUDIO DETEKTIF PERSEMBAHAN',
    subtitle: 'Siasat dan bandingkan bacaan biasa, bacaan ekspresif dan lakonan.',
    starsReward: 15,
    badgeTitle: 'Detektif Sastera'
  },
  {
    mission: 3,
    screen: 'MISSION_3',
    shortLabel: 'Misi 3',
    title: 'MAKMAL PERSEMBAHAN',
    subtitle: 'Kuasai lima kemahiran suara dan rancang pelan pengarah muda.',
    starsReward: 20,
    badgeTitle: 'Pengarah Muda'
  },
  {
    mission: 4,
    screen: 'MISSION_4',
    shortLabel: 'Misi 4',
    title: 'BENGKEL TRANSFORMASI',
    subtitle: 'Buat rakaman percubaan, terima komen dan rancang penambahbaikan.',
    starsReward: 20,
    badgeTitle: 'Bintang yang Berkembang'
  },
  {
    mission: 5,
    screen: 'MISSION_5',
    shortLabel: 'Misi 5',
    title: 'PENTAS SERIBU KISAH (AKHIR)',
    subtitle: 'Hidupkan karya sastera di Dewan Seribu Kisah dan tulis refleksi.',
    starsReward: 25,
    badgeTitle: 'Bintang Pentas Teater'
  }
];

export default function StudentAdventureMap({
  student,
  justUnlockedMission,
  onDismissUnlock,
  onUpdateMapProgress,
  onEnterMission,
  onOpenGallery
}: StudentAdventureMapProps) {
  const chosenStory = STORIES.find((s) => s.id === student.selectedStoryId);
  const completedCount = student.completedMissions.length;
  const progressPercent = Math.round((completedCount / 5) * 100);
  const frontierMission = Math.min(5, Math.max(1, student.currentMission));
  const hasStarted = Boolean(student.adventureStarted) || completedCount > 0 || student.currentMission > 1;
  const nextActiveMission =
    LOCATIONS.find((loc) => !student.completedMissions.includes(loc.mission) && loc.mission <= student.currentMission) ||
    LOCATIONS[4];

  // Determine initial station for Cikgu Kancil without moving backward on revisit
  const savedStation = student.mapLastStation ?? (hasStarted ? frontierMission : 0);
  const initialStation = !hasStarted ? 0 : Math.min(frontierMission, Math.max(1, savedStation));

  const [kancilStation, setKancilStation] = useState<number>(initialStation);
  const [walkFromStation, setWalkFromStation] = useState<number | null>(null);
  const [walkTriggerId, setWalkTriggerId] = useState<number>(0);
  const [celebrateUnlock, setCelebrateUnlock] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<number>(initialStation);
  const [cameraMode, setCameraMode] = useState<CameraFocusMode>('follow');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [pendingEnterStation, setPendingEnterStation] = useState<number | null>(null);

  const triggeredStudentIdRef = useRef<string>(student.id);
  const pendingEnterRef = useRef<number | null>(null);
  const enterTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (enterTimerRef.current !== null) {
        window.clearTimeout(enterTimerRef.current);
      }
    };
  }, []);

  // Sync when switching student profile
  useEffect(() => {
    if (triggeredStudentIdRef.current !== student.id) {
      triggeredStudentIdRef.current = student.id;
      if (enterTimerRef.current !== null) {
        window.clearTimeout(enterTimerRef.current);
        enterTimerRef.current = null;
      }
      pendingEnterRef.current = null;
      setPendingEnterStation(null);
      const started = Boolean(student.adventureStarted) || student.completedMissions.length > 0 || student.currentMission > 1;
      const frontier = Math.min(5, Math.max(1, student.currentMission));
      const target = !started ? 0 : frontier;
      setKancilStation(target);
      setWalkFromStation(null);
      setSelectedStation(target);
      setCelebrateUnlock(false);
      setIsWalking(false);
    }
  }, [student.id, student.adventureStarted, student.completedMissions.length, student.currentMission]);

  // Animate Cikgu Kancil advancing forward ONLY when a new mission was genuinely unlocked
  useEffect(() => {
    if (!hasStarted) return;
    const prevSaved = student.mapLastStation ?? frontierMission;
    const targetAdvance = justUnlockedMission && justUnlockedMission > prevSaved
      ? justUnlockedMission
      : frontierMission > prevSaved
      ? frontierMission
      : null;

    if (targetAdvance && targetAdvance >= 2 && targetAdvance <= 5) {
      const origin = Math.max(1, targetAdvance - 1);
      setWalkFromStation(origin);
      setKancilStation(targetAdvance);
      setSelectedStation(targetAdvance);
      setCelebrateUnlock(true);
      setCameraMode('follow');
      setIsWalking(true);
      setWalkTriggerId((n) => n + 1);
      onUpdateMapProgress({ adventureStarted: true, mapLastStation: targetAdvance });
    }
  }, [hasStarted, justUnlockedMission, frontierMission, student.mapLastStation, onUpdateMapProgress]);

  const clearPendingEnter = () => {
    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    pendingEnterRef.current = null;
    setPendingEnterStation(null);
  };

  const handleStartAdventure = () => {
    clearPendingEnter();
    soundEngine.playFanfare();
    onUpdateMapProgress({ adventureStarted: true, mapLastStation: Math.max(student.mapLastStation ?? 0, 1) });
    setWalkFromStation(0);
    setKancilStation(1);
    setSelectedStation(1);
    setCelebrateUnlock(true);
    setCameraMode('follow');
    setIsWalking(true);
    setWalkTriggerId((n) => n + 1);
  };

  const handleSelectStation = (station: number) => {
    clearPendingEnter();
    soundEngine.playClick();
    setSelectedStation(station);
    setCameraMode('follow');
    setDockCollapsed(false);

    const isTargetAccessible =
      station === 0 || station <= frontierMission || student.completedMissions.includes(station);
    if (isTargetAccessible && kancilStation !== station) {
      if (!hasStarted && station >= 1) {
        onUpdateMapProgress({ adventureStarted: true, mapLastStation: Math.max(student.mapLastStation ?? 0, 1) });
      }
      setWalkFromStation(kancilStation);
      setKancilStation(station);
      setCelebrateUnlock(false);
      setIsWalking(true);
      setWalkTriggerId((n) => n + 1);
    }
  };

  const handleActivateMission = (station: number) => {
    const loc = LOCATIONS.find((l) => l.mission === station);
    if (!loc) return;

    const isDone = student.completedMissions.includes(station);
    const isOpen = station <= frontierMission || isDone;
    if (!isOpen) {
      // Locked building: select cleanly without unlocking or navigating
      clearPendingEnter();
      soundEngine.playClick();
      setSelectedStation(station);
      setCameraMode('follow');
      setDockCollapsed(false);
      return;
    }

    // Prevent duplicate rapid clicks on the same active target from restarting walk
    if (pendingEnterRef.current === station) return;

    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }

    soundEngine.playClick();
    if (!hasStarted) {
      onUpdateMapProgress({ adventureStarted: true, mapLastStation: Math.max(student.mapLastStation ?? 0, 1) });
    }

    pendingEnterRef.current = station;
    setPendingEnterStation(station);
    setSelectedStation(station);
    setCameraMode('follow');
    setDockCollapsed(false);

    if (kancilStation === station && !isWalking) {
      enterTimerRef.current = window.setTimeout(() => {
        pendingEnterRef.current = null;
        setPendingEnterStation(null);
        onEnterMission(loc.screen);
      }, 260);
    } else if (isWalking && kancilStation === station) {
      // Already walking toward this exact building; onWalkComplete will launch it
      return;
    } else {
      setWalkFromStation(kancilStation);
      setKancilStation(station);
      setCelebrateUnlock(false);
      setIsWalking(true);
      setWalkTriggerId((n) => n + 1);
    }
  };

  const selectedLocation = selectedStation >= 1 ? LOCATIONS.find((l) => l.mission === selectedStation) : null;
  const selectedCompleted = selectedLocation ? student.completedMissions.includes(selectedLocation.mission) : false;
  const selectedUnlocked = selectedLocation
    ? selectedLocation.mission <= frontierMission || selectedCompleted
    : true;

  const selectedStatusLabel = !selectedLocation
    ? hasStarted
      ? 'PENGEMBARAAN BERMULA'
      : 'PINTU MASUK'
    : selectedCompleted
    ? 'SELESAI'
    : !selectedUnlocked
    ? 'TERKUNCI'
    : kancilStation === selectedLocation.mission
    ? 'SEDANG DITEROKAI'
    : 'TERSEDIA';

  const kancilMessage =
    completedCount === 5
      ? 'Tahniah! Semua lima misi sudah berjaya diselesaikan. Kamu kini Bintang Pentas Teater!'
      : !hasStarted
      ? `Selamat datang, ${student.name}! Klik MULA PENGEMBARAAN pada Pintu Masuk untuk melangkah ke Misi 1.`
      : completedCount === 0
      ? `Cikgu Kancil sudah tiba di Perpustakaan Sastera Ajaib! Tekan MASUK untuk memulakan Misi 1.`
      : `Wah, ${completedCount} misi telah berjaya diselesaikan! Teruskan pengembaraan ke Misi ${nextActiveMission.mission}.`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-7">
      {/* Unlock celebration banner */}
      {justUnlockedMission && (
        <div className="rounded-2xl border-2 border-[#D4941A] bg-gradient-to-r from-[#FFF3C4] via-[#FDE8D7] to-[#FFF3C4] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-stage-burst">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Sparkles className="w-8 h-8 text-[#9A5B13] shrink-0" />
            <div>
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">MISI BAHARU DIBUKA!</p>
              <p className="text-base sm:text-lg font-bold text-[#3D2612]">
                Tahniah! Cikgu Kancil sedang menuju ke Misi {justUnlockedMission} untuk meneroka lokasi baharu.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissUnlock}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] whitespace-nowrap"
          >
            Teruskan
          </button>
        </div>
      )}

      {/* Top Welcome + Player Profile Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7">
          <CikguKancilBanner
            dialogue={kancilMessage}
            subtitle={
              chosenStory
                ? `Cerita pilihan kamu sepanjang pengembaraan: ${chosenStory.title}`
                : 'Pilih satu cerita rakyat dalam Misi 1 untuk memulakan pengembaraan pentas.'
            }
          />
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-[#E5CFA0] bg-[#FFFCF4] p-5 flex flex-col justify-between shadow-[0_8px_24px_rgba(120,84,28,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">PROFIL PENGEMBARA</p>
              <h2 className="mt-0.5 text-xl font-bold text-[#3D2612]">{student.name}</h2>
              <p className="text-sm text-[#6B4E31]">
                Kelas {student.className} · {completedCount}/5 Misi Selesai
              </p>
            </div>
            <div className="text-right tabular-nums">
              <p className="inline-flex items-center gap-1.5 text-2xl font-bold text-[#8A5600]">
                <Star className="w-6 h-6 fill-[#F5B82E] text-[#D4941A]" />
                {student.stars}
              </p>
              <p className="text-xs text-[#6B4E31]">Bintang Terkumpul</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-[#4E341C] mb-1.5">
              <span>Kemajuan Keseluruhan</span>
              <span className="tabular-nums text-[#9A5B13]">{progressPercent}%</span>
            </div>
            <div className="h-3 rounded-full bg-[#FAF1D4] overflow-hidden border border-[#DFC792]">
              <div
                className="h-full bg-gradient-to-r from-[#F5B82E] via-[#F59E0B] to-[#5A9A72] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                if (!hasStarted) {
                  handleStartAdventure();
                } else {
                  onEnterMission(nextActiveMission.screen);
                }
              }}
              className="flex-1 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#C85470] hover:bg-[#B4435E] border border-[#F5B82E] text-white font-bold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-colors"
            >
              <Play className="w-4 h-4 fill-current text-[#FDE68A]" />
              {!hasStarted ? 'MULA PENGEMBARAAN' : 'TERUSKAN MISI'}
            </button>

            {completedCount === 5 && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playFanfare();
                  onOpenGallery();
                }}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Award className="w-4 h-4" />
                GALERI BINTANG
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3D Fantasy Forest Adventure Map */}
      <section className="rounded-3xl border border-[#DFC792] bg-[#132722] shadow-xl relative overflow-hidden">
        {/* Top Compact Map Header Bar */}
        <div className="px-5 py-4 sm:px-6 bg-[#FFFCF4] border-b border-[#E5CFA0] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-[#9A5B13]">
              PETA PENGEMBARAAN KARYA SASTERA HIDUP
            </p>
            <h1 className="mt-0.5 text-xl sm:text-2xl font-bold text-[#3D2612]">
              Laluan Lima Misi Ke Pentas Digital
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF1D4] border border-[#DFC792] text-xs font-semibold text-[#4E341C]">
              <Compass className="w-3.5 h-3.5 text-[#9A5B13]" />
              {pendingEnterStation
                ? `Cikgu Kancil sedang menuju ke Misi ${pendingEnterStation}...`
                : isWalking
                ? `Cikgu Kancil sedang berjalan ke ${kancilStation === 0 ? 'Pintu Masuk' : `Misi ${kancilStation}`}...`
                : kancilStation === 0
                ? 'Lokasi Cikgu Kancil: Pintu Masuk'
                : `Lokasi Cikgu Kancil: Misi ${kancilStation}`}
            </span>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCameraMode((m) => (m === 'follow' ? 'overview' : 'follow'));
              }}
              className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#DFC792] bg-[#FFF7DF] hover:bg-[#FCEBB6] text-xs font-bold text-[#3D2612] inline-flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#9A5B13]" />
              {cameraMode === 'overview' ? 'Ikut Cikgu Kancil' : 'Lihat Semua Misi'}
            </button>
          </div>
        </div>

        {/* 3D Interactive World Viewport */}
        <div className="relative h-[470px] sm:h-[560px] lg:h-[620px] w-full">
          <AdventureMap3D
            kancilStation={kancilStation}
            walkFromStation={walkFromStation}
            walkTriggerId={walkTriggerId}
            celebrateUnlock={celebrateUnlock}
            selectedStation={selectedStation}
            completedMissions={student.completedMissions}
            unlockedUpToMission={frontierMission}
            pendingEnterStation={pendingEnterStation}
            cameraMode={cameraMode}
            onSelectStation={handleSelectStation}
            onActivateMission={handleActivateMission}
            onWalkComplete={(arrivedStation) => {
              setIsWalking(false);
              setCelebrateUnlock(false);
              if (pendingEnterRef.current === arrivedStation) {
                const targetLoc = LOCATIONS.find((l) => l.mission === arrivedStation);
                if (enterTimerRef.current !== null) {
                  window.clearTimeout(enterTimerRef.current);
                }
                enterTimerRef.current = window.setTimeout(() => {
                  pendingEnterRef.current = null;
                  setPendingEnterStation(null);
                  enterTimerRef.current = null;
                  if (targetLoc) onEnterMission(targetLoc.screen);
                }, 320);
              }
            }}
          />

          {/* Top-Gate Welcome CTA overlay before student begins adventure */}
          {!hasStarted && selectedStation === 0 && !isWalking && pendingEnterStation === null && (
            <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4 z-20">
              <div className="pointer-events-auto max-w-md w-full rounded-2xl border-2 border-[#D4941A] bg-[#FFFCF4]/95 p-4 shadow-xl text-center">
                <p className="text-[11px] font-bold tracking-widest text-[#9A5B13]">
                  PINTU MASUK PENGEMBARAAN
                </p>
                <h2 className="mt-1 text-base sm:text-lg font-extrabold text-[#3D2612]">
                  SELAMAT DATANG KE DUNIA TEATER FANTASI!
                </h2>
                <p className="mt-1 text-xs text-[#6B4E31]">
                  Cikgu Kancil sedia menemani kamu merentasi taman rimba menuju Pentas Seribu Kisah.
                </p>
                <button
                  type="button"
                  onClick={handleStartAdventure}
                  className="mt-3 min-h-[44px] px-6 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-extrabold text-sm hover:bg-[#E5A420] active:scale-[0.98] inline-flex items-center justify-center gap-2 shadow-md transition-transform"
                >
                  <Footprints className="w-4 h-4" />
                  MULA PENGEMBARAAN
                </button>
              </div>
            </div>
          )}

          {/* Subtle Gesture Hint Top-Right */}
          <div className="pointer-events-none absolute top-3 right-3 hidden sm:block z-20">
            <span className="inline-block rounded-lg bg-[#FFFCF4]/92 border border-[#DFC792] px-2.5 py-1 text-[11px] font-medium text-[#4E341C] shadow-sm">
              Seret untuk pusing · Skrol untuk zum · Tekan MASUK / BUKA SEMULA pada bangunan
            </span>
          </div>
        </div>

        {/* Single Sleek Collapsible Bottom Station Dock */}
        <div className="bg-[#FFFCF4] border-t border-[#E5CFA0] px-4 py-3.5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            {/* Station Quick-Selector Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              <button
                type="button"
                onClick={() => handleSelectStation(0)}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-colors ${
                  selectedStation === 0
                    ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A]'
                    : 'bg-[#FAF1D4] text-[#4E341C] border-[#DFC792] hover:border-[#D4941A]'
                }`}
              >
                Pintu Masuk
              </button>

              {LOCATIONS.map((loc) => {
                const isDone = student.completedMissions.includes(loc.mission);
                const isOpen = loc.mission <= frontierMission || isDone;
                const isHere = kancilStation === loc.mission;
                const isActive = selectedStation === loc.mission;

                return (
                  <button
                    key={loc.mission}
                    type="button"
                    onClick={() => handleSelectStation(loc.mission)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border inline-flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A]'
                        : isDone
                        ? 'bg-[#E4EFE2] text-[#235334] border-[#9EC4A3] hover:border-[#5A9A72]'
                        : isOpen
                        ? 'bg-[#FCEAD8] text-[#7A3A1E] border-[#EAB892] hover:border-[#D4941A]'
                        : 'bg-[#F5EBD0] text-[#8E7354] border-[#E2CFA3] hover:border-[#C9B07B]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : !isOpen ? (
                      <Lock className="w-3 h-3 shrink-0" />
                    ) : isHere ? (
                      <Footprints className="w-3.5 h-3.5 shrink-0" />
                    ) : null}
                    {loc.shortLabel}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setDockCollapsed((c) => !c)}
              aria-label={dockCollapsed ? 'Kembangkan panel misi' : 'Kecilkan panel misi'}
              className="min-h-[36px] min-w-[36px] rounded-xl border border-[#DFC792] bg-[#FAF1D4] text-[#4E341C] hover:bg-[#FCEBB6] inline-flex items-center justify-center shrink-0"
            >
              {dockCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {!dockCollapsed && (
            <div className="mt-3 pt-3 border-t border-[#EDE0BC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {selectedLocation ? (
                <>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="text-[#9A5B13]">MISI {selectedLocation.mission}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                          selectedCompleted
                            ? 'bg-[#D7EAD5] text-[#1F4B2F]'
                            : !selectedUnlocked
                            ? 'bg-[#F3EBD3] text-[#7A5C3E]'
                            : 'bg-[#FCEAD8] text-[#7A3A1E]'
                        }`}
                      >
                        {selectedStatusLabel}
                      </span>
                      <span className="text-[#8A5600] tabular-nums">+{selectedLocation.starsReward} Bintang</span>
                      <span className="text-[#6B4E31]">· Lencana {selectedLocation.badgeTitle}</span>
                    </div>
                    <h3 className="mt-1 text-base sm:text-lg font-bold text-[#3D2612] truncate">
                      {selectedLocation.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B4E31]">{selectedLocation.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2.5 sm:shrink-0">
                    {selectedCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleActivateMission(selectedLocation.mission)}
                        disabled={pendingEnterStation === selectedLocation.mission}
                        className="min-h-[44px] w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#245648] bg-[#387B68] hover:bg-[#2E6958] text-sm font-extrabold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-md disabled:opacity-80"
                      >
                        <Play className="w-4 h-4" />
                        {pendingEnterStation === selectedLocation.mission ? 'MENUJU KE MISI...' : 'BUKA SEMULA'}
                      </button>
                    ) : selectedUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleActivateMission(selectedLocation.mission)}
                        disabled={pendingEnterStation === selectedLocation.mission}
                        className="min-h-[44px] w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#D99A22] border border-[#9E6C0B] text-[#38200D] font-extrabold text-sm hover:bg-[#C78B1A] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-md disabled:opacity-80"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        {pendingEnterStation === selectedLocation.mission ? 'MENUJU KE MISI...' : 'MASUK'}
                      </button>
                    ) : (
                      <div className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FAF1D4] border border-[#DFC792] text-xs font-semibold text-[#6B4E31] inline-flex items-center gap-2 whitespace-nowrap">
                        <Lock className="w-4 h-4 text-[#9A5B13]" />
                        Selesaikan Misi {selectedLocation.mission - 1} Dahulu
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-[#9A5B13]">GERBANG UTAMA</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FCEAD8] text-[#7A3A1E] text-[11px] font-extrabold">
                        {selectedStatusLabel}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base sm:text-lg font-bold text-[#3D2612]">
                      PINTU MASUK PENGEMBARAAN
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B4E31]">
                      Mulakan perjalanan bersama Cikgu Kancil merentasi lima lokasi dunia sastera interaktif.
                    </p>
                  </div>
                  <div className="sm:shrink-0">
                    {!hasStarted ? (
                      <button
                        type="button"
                        onClick={handleStartAdventure}
                        className="min-h-[44px] w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-extrabold text-sm hover:bg-[#E5A420] inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                      >
                        <Footprints className="w-4 h-4" />
                        MULA PENGEMBARAAN
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectStation(frontierMission)}
                        className="min-h-[44px] w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FFF7DF] border border-[#D4941A] text-[#7A440B] font-bold text-sm hover:bg-[#FCEBB6] inline-flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <Compass className="w-4 h-4" />
                        Pergi ke Misi {frontierMission}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Earned Badges Showcase — Aesthetic Wooden Pinboard */}
      <AchievementPinboard badges={MISSION_BADGES} earnedBadgeIds={student.badges} />
    </div>
  );
}
