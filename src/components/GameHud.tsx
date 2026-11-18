import { useState } from 'react';
import {
  ArrowLeft,
  Award,
  ChevronDown,
  HelpCircle,
  Home,
  Lock,
  MapPin,
  Star,
  Volume2,
  VolumeX,
  CheckCircle2
} from 'lucide-react';
import { AppScreen, StudentRecord } from '../types';
import { soundEngine } from '../utils/sound';

interface GameHudProps {
  screen: AppScreen;
  student: StudentRecord;
  muted: boolean;
  onToggleMute: () => void;
  onNavigate: (screen: AppScreen) => void;
  onBack: () => void;
  onOpenHelp: () => void;
}

const MISSION_ITEMS: { mission: number; screen: AppScreen; label: string }[] = [
  { mission: 1, screen: 'MISSION_1', label: 'Misi 1: Perpustakaan Sastera Ajaib' },
  { mission: 2, screen: 'MISSION_2', label: 'Misi 2: Studio Detektif Persembahan' },
  { mission: 3, screen: 'MISSION_3', label: 'Misi 3: Makmal Persembahan' },
  { mission: 4, screen: 'MISSION_4', label: 'Misi 4: Bengkel Transformasi' },
  { mission: 5, screen: 'MISSION_5', label: 'Misi 5: Pentas Seribu Kisah (Akhir)' }
];

function getScreenLocationName(screen: AppScreen): string {
  switch (screen) {
    case 'STUDENT_MAP':
      return 'Peta Pengembaraan';
    case 'MISSION_1':
      return 'Misi 1 · Perpustakaan Sastera Ajaib';
    case 'MISSION_2':
      return 'Misi 2 · Studio Detektif Persembahan';
    case 'MISSION_3':
      return 'Misi 3 · Makmal Persembahan';
    case 'MISSION_4':
      return 'Misi 4 · Bengkel Transformasi';
    case 'MISSION_5':
      return 'Misi 5 · Pentas Seribu Kisah (Akhir)';
    case 'STAR_GALLERY':
      return 'Galeri Bintang Sastera';
    default:
      return 'Dunia Teater Fantasi';
  }
}

export default function GameHud({
  screen,
  student,
  muted,
  onToggleMute,
  onNavigate,
  onBack,
  onOpenHelp
}: GameHudProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const completedCount = student.completedMissions.length;
  const progressPct = Math.round((completedCount / 5) * 100);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[#E5CFA0] bg-[#FFFDF5]/95 backdrop-blur-sm text-[#3D2612] shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Zone 1: Back, Home & Location */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onBack();
            }}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#E2CA99] bg-[#FFF7DF] hover:bg-[#FCEBB6] text-xs sm:text-sm font-semibold text-[#4E341C] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#B87314]" />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onNavigate('TITLE');
            }}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#E2CA99] bg-[#FFF7DF] hover:bg-[#FCEBB6] text-xs sm:text-sm font-semibold text-[#4E341C] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
            title="Halaman Utama"
          >
            <Home className="w-4 h-4 text-[#B87314]" />
            <span className="hidden md:inline">Halaman Utama</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 pl-2 text-xs text-[#6B4E31] truncate">
            <MapPin className="w-3.5 h-3.5 text-[#C27816] shrink-0" />
            <span className="truncate font-semibold">{getScreenLocationName(screen)}</span>
          </div>
        </div>

        {/* Zone 2: Mission Dropdown + Student Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setMenuOpen((prev) => !prev);
              }}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-[#DFBE76] bg-[#FEF0BE] hover:bg-[#FDE593] text-[#3D2612] text-xs sm:text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <span>Menu Misi</span>
              <ChevronDown className={`w-4 h-4 text-[#9A5B13] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 sm:left-0 mt-2 w-72 rounded-2xl border border-[#DFC792] bg-[#FFFCF4] p-2 shadow-xl z-50">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setMenuOpen(false);
                    onNavigate('STUDENT_MAP');
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                    screen === 'STUDENT_MAP' ? 'bg-[#F5B82E] text-[#3A2208]' : 'hover:bg-[#FAF0CD] text-[#3D2612]'
                  }`}
                >
                  <span>Peta Pengembaraan</span>
                  <span className="text-xs tabular-nums opacity-85">{completedCount}/5</span>
                </button>
                <div className="my-1.5 border-t border-[#EDE0BC]" />
                <div className="space-y-1">
                  {MISSION_ITEMS.map((item) => {
                    const isUnlocked = item.mission <= student.currentMission || student.completedMissions.includes(item.mission);
                    const isDone = student.completedMissions.includes(item.mission);
                    const isCurrent = screen === item.screen;

                    return (
                      <button
                        key={item.mission}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => {
                          if (!isUnlocked) return;
                          soundEngine.playClick();
                          setMenuOpen(false);
                          onNavigate(item.screen);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors ${
                          isCurrent
                            ? 'bg-[#FADAD8] text-[#7D243C] border border-[#E5A7B5]'
                            : isUnlocked
                            ? 'hover:bg-[#FAF0CD] text-[#4E341C]'
                            : 'opacity-45 cursor-not-allowed text-[#9B8060]'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D52] shrink-0" />
                        ) : !isUnlocked ? (
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                {student.completedMissions.includes(5) && (
                  <>
                    <div className="my-1.5 border-t border-[#EDE0BC]" />
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setMenuOpen(false);
                        onNavigate('STAR_GALLERY');
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold bg-[#FEF0BE] text-[#6B4211] hover:bg-[#FDE593] flex items-center justify-between"
                    >
                      <span>Galeri Bintang & Sijil Digital</span>
                      <Award className="w-4 h-4 text-[#B87314]" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-[#6B4E31]">
            <span className="font-bold text-[#3D2612] truncate max-w-[140px]">{student.name}</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">{student.className}</span>
          </div>
        </div>

        {/* Zone 3: Stars, Badges, Sound, Help */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#FAF1D2] border border-[#E2CA99] text-xs font-bold tabular-nums">
            <span className="inline-flex items-center gap-1 text-[#8A5600]" title="Jumlah Bintang">
              <Star className="w-4 h-4 fill-[#F5B82E] text-[#D48A0D]" />
              {student.stars}
            </span>
            <span className="text-[#D5BC89]" aria-hidden="true">|</span>
            <span className="inline-flex items-center gap-1 text-[#8C4523]" title="Jumlah Lencana">
              <Award className="w-4 h-4 text-[#C27816]" />
              {student.badges.length}/5
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-[#E2CA99] bg-[#FFF7DF] hover:bg-[#FCEBB6] text-[#4E341C] transition-colors"
            title={muted ? 'Hidupkan Bunyi' : 'Senyapkan Bunyi'}
            aria-label={muted ? 'Hidupkan Bunyi' : 'Senyapkan Bunyi'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-[#C2415E]" /> : <Volume2 className="w-4 h-4 text-[#B87314]" />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenHelp();
            }}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#C85470] hover:bg-[#B4435E] text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors shadow-xs"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Bantuan</span>
          </button>
        </div>
      </div>

      {/* Slim progress strip */}
      <div className="h-1.5 w-full bg-[#F2E3B8]">
        <div
          className="h-full bg-gradient-to-r from-[#E07A5F] via-[#F5B82E] to-[#5A9A72] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </header>
  );
}
