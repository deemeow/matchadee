import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Compass, Mic, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import EnchantedForestStage, {
  CikguKancilForestSprite,
  SharedForestBackground
} from './EnchantedForestStage';
import { CIKGU_KANCIL_IMAGE } from '../data/stories';
import modGuruIlustrasiImg from '../assets/images/mod_guru_ilustrasi_1794754078106.jpg';
import modMuridIlustrasiImg from '../assets/images/mod_murid_ilustrasi_1794754231443.jpg';
import { StudentRecord } from '../types';
import { soundEngine } from '../utils/sound';

interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        soundEngine.playFanfare();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#4DD0E1] flex flex-col justify-between">
      {/* Enchanted Learning Forest Backdrop & Living Atmosphere */}
      <div className="absolute inset-0 z-0">
        <EnchantedForestStage />
      </div>

      {/* Gentle bottom meadow contrast scrim to ground CTA cleanly */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] z-10"
        style={{
          background:
            'linear-gradient(to top, rgba(6, 78, 59, 0.34) 0%, rgba(6, 78, 59, 0.12) 55%, rgba(6, 78, 59, 0) 100%)'
        }}
        aria-hidden="true"
      />

      {/* Minimal airy sky spacing at top */}
      <div className="relative z-20 pt-3 sm:pt-5" aria-hidden="true" />

      {/* Balanced Hero Composition: Dominant Title + Large Cikgu Kancil with Attached Speech Bubble */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-4 py-1 sm:py-2">
        {/* Left/Top Column: Huge, Bold, 3D-Styled Original Title Lockup */}
        <header className="w-full lg:w-[46%] flex flex-col items-center lg:items-start text-center lg:text-left">
          <p
            className="text-[11px] sm:text-xs font-extrabold tracking-[0.2em] text-[#064E3B] uppercase"
            style={{
              textShadow:
                '0 1.5px 0 #FFFDF5, 0 -1.5px 0 #FFFDF5, 1.5px 0 0 #FFFDF5, -1.5px 0 0 #FFFDF5, 0 3px 10px rgba(255, 253, 245, 0.94)'
            }}
          >
            PERMAINAN BAHASA MELAYU TAHUN 5 · DUNIA TEATER FANTASI
          </p>

          <h1
            className="mt-2 font-rounded font-bold text-[2.65rem] sm:text-[3.85rem] md:text-[4.4rem] lg:text-[clamp(3.65rem,5.4vw,5.4rem)] leading-[0.98] tracking-wide"
            style={{
              WebkitTextStroke: '9px #FFFDF5',
              paintOrder: 'stroke fill',
              filter:
                'drop-shadow(0 5px 0 #04382A) drop-shadow(0 14px 26px rgba(6, 78, 59, 0.30))'
            }}
          >
            <span className="block text-[#065F46]">KARYA SASTERA</span>
            <span className="block text-[#D97706]">HIDUP!</span>
          </h1>

          <p
            className="mt-2.5 sm:mt-3 font-rounded font-bold text-[1.25rem] sm:text-[1.65rem] md:text-[1.9rem] lg:text-[2rem] text-[#064E3B] tracking-wide leading-snug"
            style={{
              WebkitTextStroke: '4px #FFFDF5',
              paintOrder: 'stroke fill',
              filter: 'drop-shadow(0 3px 8px rgba(6, 78, 59, 0.18))'
            }}
          >
            Misi Pengembaraan ke Pentas Digital
          </p>

          <p
            className="mt-1.5 font-rounded font-bold text-xs sm:text-sm md:text-[15px] tracking-[0.16em] text-[#92400E] uppercase"
            style={{
              textShadow:
                '0 1.5px 0 #FFFDF5, 0 -1.5px 0 #FFFDF5, 1.5px 0 0 #FFFDF5, -1.5px 0 0 #FFFDF5, 0 2px 8px rgba(255, 253, 245, 0.96)'
            }}
          >
            Baca, Hayati, Persembahkan!
          </p>
        </header>

        {/* Right/Bottom Mascot Stage Unit: Speech Bubble Anchored Directly Beside Cikgu Kancil's Head */}
        <div className="w-full lg:w-[54%] flex flex-col sm:flex-row items-center sm:items-start justify-center lg:justify-end pointer-events-none">
          {/* Cute Rounded Speech Bubble Positioned Tight Next to Cikgu Kancil's Mouth/Head */}
          <div
            className="relative self-start sm:self-auto ml-2 sm:ml-0 -mb-5 sm:mb-0 sm:mt-[6%] lg:mt-[7%] sm:-mr-7 lg:-mr-10 xl:-mr-12 z-30 max-w-[230px] sm:max-w-[240px] lg:max-w-[235px] xl:max-w-[270px] rounded-[26px] sm:rounded-[30px] border-[3px] border-[#A7F3D0] bg-[#FFFDF7]/98 backdrop-blur-sm px-4 py-3 sm:px-5 sm:py-3.5 text-left animate-bubble-float shrink-0"
            style={{
              boxShadow:
                '0 14px 32px rgba(6, 78, 59, 0.22), 0 4px 10px rgba(13, 148, 136, 0.14), inset 0 0 0 2px rgba(254, 240, 138, 0.5)'
            }}
          >
            <p className="font-rounded text-[11px] sm:text-xs font-extrabold tracking-wider text-[#0D9488] uppercase">
              Cikgu Kancil
            </p>
            <p className="mt-0.5 text-[13px] sm:text-[14.5px] xl:text-[16px] font-extrabold text-[#1F3A2E] leading-snug">
              “Selamat datang ke dunia sastera! Mari hidupkan cerita rakyat bersama-sama.”
            </p>

            {/* Phone tail (< 640px): curves down-right straight toward Cikgu Kancil's smiling face */}
            <svg
              viewBox="0 0 34 24"
              className="block sm:hidden absolute -bottom-[19px] right-8 w-8 h-6 overflow-visible"
              aria-hidden="true"
            >
              <path
                d="M4 0 Q14 14 28 22 Q20 11 22 0 Z"
                fill="#FFFDF7"
                stroke="#A7F3D0"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              <rect x="2" y="-4" width="23" height="6" fill="#FFFDF7" />
            </svg>

            {/* Tablet & Desktop tail (>= 640px): points right directly toward Cikgu Kancil's mouth */}
            <svg
              viewBox="0 0 28 28"
              className="hidden sm:block absolute -right-[23px] bottom-5 w-6 h-7 overflow-visible"
              aria-hidden="true"
            >
              <path
                d="M0 4 Q14 10 26 16 Q13 21 0 24 Z"
                fill="#FFFDF7"
                stroke="#A7F3D0"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              <rect x="-4" y="2" width="6" height="24" fill="#FFFDF7" />
            </svg>
          </div>

          {/* Significantly Enlarged 3D Cartoon Cikgu Kancil */}
          <CikguKancilForestSprite className="h-[clamp(245px,36vh,315px)] sm:h-[clamp(305px,43vh,390px)] lg:h-[clamp(370px,57vh,520px)] xl:h-[clamp(410px,60vh,560px)] w-auto shrink-0" />
        </div>
      </main>

      {/* Bottom-Centered Upgraded Emerald-Turquoise Pill CTA */}
      <footer className="relative z-20 pb-4 sm:pb-7 pt-1 px-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playFanfare();
            onStart();
          }}
          className="group relative inline-flex items-center justify-center gap-2.5 min-h-[58px] sm:min-h-[62px] px-9 sm:px-12 py-3.5 sm:py-4 rounded-full bg-gradient-to-b from-[#34D399] via-[#10B981] to-[#0D9488] border-2 border-[#A7F3D0]/85 border-b-[5px] border-b-[#065F46] text-white font-rounded font-bold text-lg sm:text-xl tracking-wide animate-cta-pulse hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap overflow-hidden"
        >
          {/* Glossy top pill reflection */}
          <span
            className="pointer-events-none absolute inset-x-6 top-1.5 h-3 rounded-full bg-white/30"
            aria-hidden="true"
          />
          <Sparkles className="relative z-10 w-5 h-5 text-[#FEF08A] drop-shadow-sm transition-transform group-hover:rotate-12" />
          <span
            className="relative z-10"
            style={{ textShadow: '0 2px 4px rgba(6, 78, 59, 0.45)' }}
          >
            MULA PENGEMBARAAN
          </span>
        </button>

        <p
          className="text-xs font-bold text-[#FFFDF5] text-center"
          style={{
            textShadow: '0 1px 4px rgba(6, 78, 59, 0.85), 0 2px 10px rgba(6, 78, 59, 0.65)'
          }}
        >
          Tekan Enter atau klik butang untuk memilih peranan anda
        </p>
      </footer>
    </div>
  );
}

interface RoleSelectProps {
  onSelectTeacher: () => void;
  onSelectStudent: () => void;
  onBack: () => void;
}

export function RoleSelectScreen({ onSelectTeacher, onSelectStudent, onBack }: RoleSelectProps) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#4DD0E1] text-[#3D2612] px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
      <SharedForestBackground />
      <div className="relative z-10 w-full max-w-5xl">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onBack();
          }}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DFC792] bg-[#FFFCF4] hover:bg-[#FCEBB6] text-sm font-semibold text-[#4E341C] inline-flex items-center gap-2 transition-colors mb-6 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#9A5B13]" />
          Kembali ke Pentas Utama
        </button>

        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 forest-readable-text">
          <p className="text-xs font-bold tracking-widest text-[#9A5B13]">PEMILIHAN PERANAN</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-[#3D2612]">
            Siapakah yang sedang memasuki teater hari ini?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#4E341C] font-medium">
            Pilih Mod Guru untuk memantau prestasi kelas atau Mod Murid untuk memulakan lima misi pengembaraan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card A: Mod Guru */}
          <div className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-[#D4941A] transition-colors">
            <div>
              <div className="h-44 rounded-2xl bg-[#FAF1D4] border border-[#E5CFA0] overflow-hidden mb-6">
                <img
                  src={modGuruIlustrasiImg}
                  alt="Ilustrasi 3D Mod Guru: guru wanita bertudung dan berkaca mata menunjuk ke papan analisis kemajuan murid"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">A · MOD GURU</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3D2612]">Papan Pemuka Guru</h2>
              <p className="mt-2 text-sm sm:text-base text-[#4E341C] leading-relaxed">
                Urus pembelajaran dan pantau perkembangan murid. Semak hasil kerja, beri maklum balas dan nilai persembahan menggunakan rubrik digital.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onSelectTeacher();
              }}
              className="mt-6 min-h-[48px] w-full px-5 py-3 rounded-xl bg-[#FFF7DF] border-2 border-[#D4941A] text-[#7A440B] hover:bg-[#F5B82E] hover:text-[#3A2208] font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-5 h-5" />
              MASUK SEBAGAI GURU
            </button>
          </div>

          {/* Card B: Mod Murid */}
          <div className="rounded-3xl border-2 border-[#E5C27D] bg-gradient-to-b from-[#FFFDF4] to-[#FAF1D4] p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-[#D4941A] transition-colors">
            <div>
              <div className="h-44 rounded-2xl bg-[#FAF1D4] border border-[#E5C27D] overflow-hidden mb-6">
                <img
                  src={modMuridIlustrasiImg}
                  alt="Ilustrasi 3D Mod Murid: murid lelaki dan perempuan berkostum cerita dongeng membuat persembahan bercerita di pentas dengan tirai merah marun, lampu sorot dan buku ajaib"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">B · MOD MURID</p>
              <h2 className="mt-1 text-2xl font-bold text-[#3D2612]">Pengembaraan Murid</h2>
              <p className="mt-2 text-sm sm:text-base text-[#4E341C] leading-relaxed">
                Sertai pengembaraan dan lengkapkan lima misi! Baca cerita rakyat, siasat persembahan, berlatih suara dan bersinar di pentas akhir.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onSelectStudent();
              }}
              className="mt-6 min-h-[48px] w-full px-5 py-3 rounded-xl bg-[#C85470] hover:bg-[#B4435E] border-2 border-[#F5B82E] text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-all whitespace-nowrap shadow-md"
            >
              <Compass className="w-5 h-5 text-[#FDE68A]" />
              MASUK SEBAGAI MURID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RegisterStudentProps {
  existingStudents: StudentRecord[];
  onRegister: (name: string, className: string) => void;
  onSelectExisting: (studentId: string) => void;
  onBack: () => void;
}

export function RegisterStudentScreen({
  existingStudents,
  onRegister,
  onSelectExisting,
  onBack
}: RegisterStudentProps) {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('5 Bestari');
  const [welcomedName, setWelcomedName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Sila masukkan nama kamu terlebih dahulu.');
      soundEngine.playGentleRetry();
      return;
    }
    if (!className.trim()) {
      setError('Sila masukkan nama kelas kamu.');
      soundEngine.playGentleRetry();
      return;
    }
    setError('');
    soundEngine.playFanfare();
    setWelcomedName(name.trim());
    onRegister(name.trim(), className.trim());
  };

  if (welcomedName) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden bg-[#4DD0E1] text-[#3D2612] px-4 py-10 flex items-center justify-center">
        <SharedForestBackground />
        <div className="relative z-10 max-w-xl w-full rounded-3xl border-2 border-[#D4941A] bg-[#FFFCF4] p-6 sm:p-8 text-center shadow-xl animate-stage-burst">
          <img
            src={CIKGU_KANCIL_IMAGE}
            alt="Cikgu Kancil gembira"
            referrerPolicy="no-referrer"
            className="w-28 h-28 mx-auto rounded-2xl object-cover border-2 border-[#F5B82E]"
          />
          <p className="mt-4 text-xs font-bold tracking-widest text-[#9A5B13]">PENDAFTARAN BERJAYA</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[#3D2612] leading-snug">
            “Selamat datang, {welcomedName}! Cikgu Kancil sudah bersedia membawa kamu menjelajah dunia sastera!”
          </h1>
          <p className="mt-3 text-sm text-[#6B4E31]">
            Setiap misi yang diselesaikan akan menghadiahkan bintang dan lencana pencapaian khas untuk kamu.
          </p>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSuccess();
              onSelectExisting('__ACTIVE__');
            }}
            className="mt-6 min-h-[48px] px-8 py-3 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-base hover:bg-[#E5A420] transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-md"
          >
            <Sparkles className="w-5 h-5" />
            Buka Peta Pengembaraan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#4DD0E1] text-[#3D2612] px-4 py-8 flex flex-col items-center justify-center">
      <SharedForestBackground />
      <div className="relative z-10 w-full max-w-2xl">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onBack();
          }}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DFC792] bg-[#FFFCF4] hover:bg-[#FCEBB6] text-sm font-semibold text-[#4E341C] inline-flex items-center gap-2 mb-6 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#9A5B13]" />
          Kembali ke Pemilihan Peranan
        </button>

        <div className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-[#EDE0BC]">
            <img
              src={CIKGU_KANCIL_IMAGE}
              alt="Cikgu Kancil"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F5B82E]"
            />
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">PENDAFTARAN PENGEMBARA</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2612]">Daftar Masuk Mod Murid</h1>
              <p className="mt-1 text-sm text-[#6B4E31]">
                Masukkan nama dan kelas kamu supaya sijil serta bintang disimpan dengan teratur.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="student-name" className="block text-sm font-semibold text-[#4E341C] mb-1.5">
                Nama Murid
              </label>
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Siti Aisyah binti Ahmad"
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
              />
            </div>

            <div>
              <label htmlFor="student-class" className="block text-sm font-semibold text-[#4E341C] mb-1.5">
                Kelas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
                {['5 Bestari', '5 Cemerlang', '5 Dinamik', '5 Arif'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setClassName(cls);
                    }}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      className === cls
                        ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A]'
                        : 'bg-[#FAF1D4] text-[#4E341C] border-[#DFC792] hover:border-[#D4941A]'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
              <input
                id="student-class"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Atau taip nama kelas kamu"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-[#DCC38D] text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
              />
            </div>

            {error && (
              <p className="text-sm font-semibold text-[#881D38] bg-[#FDE4E8] border border-[#E598A8] rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="min-h-[50px] w-full px-6 py-3 rounded-xl bg-[#C85470] hover:bg-[#B4435E] border-2 border-[#F5B82E] text-white font-bold text-base transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
            >
              <BookOpen className="w-5 h-5 text-[#FDE68A]" />
              DAFTAR DAN MULA
            </button>
          </form>

          {/* Resume existing student profile */}
          {existingStudents.length > 0 && (
            <div className="mt-7 pt-6 border-t border-[#EDE0BC]">
              <p className="text-xs font-bold tracking-wider text-[#7A5C3E] mb-3">
                ATAU SAMBUNG PENGEMBARAAN PROFIL SEDIA ADA
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {existingStudents.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectExisting(s.id);
                    }}
                    className="text-left px-3.5 py-2.5 rounded-xl bg-[#FAF1D4] border border-[#DFC792] hover:border-[#D4941A] hover:bg-[#FFF5D6] transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#3D2612] truncate">{s.name}</p>
                      <p className="text-xs text-[#6B4E31]">
                        {s.className} · Misi {s.currentMission}/5
                      </p>
                    </div>
                    <UserCheck className="w-4 h-4 text-[#9A5B13] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-5 text-xs text-[#7A5C3E] leading-relaxed">
            Nota Prototaip: Kemajuan dan jawapan kamu disimpan secara setempat di dalam pelayar peranti ini supaya kamu boleh meneruskan pengembaraan pada bila-bila masa.
          </p>
        </div>
      </div>
    </div>
  );
}

interface RegisterTeacherProps {
  defaultName: string;
  onEnter: (teacherName: string) => void;
  onBack: () => void;
}

export function RegisterTeacherScreen({ defaultName, onEnter, onBack }: RegisterTeacherProps) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Sila masukkan nama guru.');
      soundEngine.playGentleRetry();
      return;
    }
    soundEngine.playSuccess();
    onEnter(name.trim());
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#4DD0E1] text-[#3D2612] px-4 py-8 flex flex-col items-center justify-center">
      <SharedForestBackground />
      <div className="relative z-10 w-full max-w-lg">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onBack();
          }}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DFC792] bg-[#FFFCF4] hover:bg-[#FCEBB6] text-sm font-semibold text-[#4E341C] inline-flex items-center gap-2 mb-6 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#9A5B13]" />
          Kembali ke Pemilihan Peranan
        </button>

        <div className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FCEAD8] border border-[#E5C27D] flex items-center justify-center">
              <Mic className="w-6 h-6 text-[#9A5B13]" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">AKSES PENDIDIK</p>
              <h1 className="text-2xl font-bold text-[#3D2612]">Pendaftaran Guru</h1>
            </div>
          </div>

          <p className="text-sm text-[#4E341C] mb-5">
            Masukkan nama anda untuk mengakses Pusat Kawalan Pengembaraan, memantau rekod murid dan mengisi rubrik penilaian digital.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="teacher-name" className="block text-sm font-semibold text-[#4E341C] mb-1.5">
                Nama Guru
              </label>
              <input
                id="teacher-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Cikgu Aminah binti Ismail"
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
              />
            </div>

            {error && (
              <p className="text-sm font-semibold text-[#881D38] bg-[#FDE4E8] border border-[#E598A8] rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="min-h-[48px] w-full px-6 py-3 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-base hover:bg-[#E5A420] transition-colors whitespace-nowrap shadow-md"
            >
              MASUK KE PAPAN PEMUKA GURU
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
