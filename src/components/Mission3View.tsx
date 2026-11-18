import { useRef, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Lock,
  Mic,
  Pause,
  Smile,
  Sparkles,
  Square,
  Theater,
  Volume2
} from 'lucide-react';
import { STORIES } from '../data/stories';
import { Mission3Plan, PerformanceStyle, StudentRecord } from '../types';
import { CikguKancilBanner } from './CikguKancilGuide';
import { soundEngine } from '../utils/sound';

interface Mission3ViewProps {
  student: StudentRecord;
  onSaveMission3: (plan: Mission3Plan, finalize: boolean) => void;
  onBackToMap: () => void;
}

const STATIONS = [
  { id: 1, title: 'STESEN 1 – KUASA SUARA', focus: 'Kelantangan dan kejelasan suara' },
  { id: 2, title: 'STESEN 2 – MAGIK INTONASI', focus: 'Penggunaan nada suara mengikut situasi' },
  { id: 3, title: 'STESEN 3 – RAHSIA JEDA', focus: 'Penggunaan jeda atau hentian ketika membaca' },
  { id: 4, title: 'STESEN 4 – EKSPRESI WATAK', focus: 'Penghayatan watak melalui suara dan ekspresi' },
  { id: 5, title: 'STESEN 5 – PILIH GAYA PERSEMBAHAN', focus: 'Memilih bentuk persembahan yang sesuai' }
];

const ALL_SKILLS = ['Suara', 'Intonasi', 'Jeda', 'Ekspresi', 'Gaya persembahan'];

export default function Mission3View({ student, onSaveMission3, onBackToMap }: Mission3ViewProps) {
  const story = STORIES.find((s) => s.id === student.selectedStoryId) || STORIES[0];

  const [completedStations, setCompletedStations] = useState<number[]>(student.mission3.completedStations);
  const [activeStation, setActiveStation] = useState<number>(
    student.mission3.completedStations.length >= 5 ? 5 : student.mission3.completedStations.length + 1
  );

  // Station 1: Voice Recording
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>('');
  const [micNote, setMicNote] = useState('');
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Station 2: Intonation matching
  const [selectedIntonation, setSelectedIntonation] = useState<string>('');
  const [intonationChecked, setIntonationChecked] = useState(false);

  // Station 3: Jeda interactive placement
  const [selectedPauses, setSelectedPauses] = useState<number[]>([]);
  const [jedaFeedback, setJedaFeedback] = useState('');

  // Station 4: Emotion expression matching
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');

  // Station 5: Style matching
  const [selectedStation5Choice, setSelectedStation5Choice] = useState<string>('');

  // Director Plan Form
  const [selectedStyle, setSelectedStyle] = useState<PerformanceStyle | ''>(student.mission3.selectedStyle);
  const [reason, setReason] = useState(student.mission3.reason);
  const [skillsToHighlight, setSkillsToHighlight] = useState<string[]>(student.mission3.skillsToHighlight);
  const [actingDetails, setActingDetails] = useState(student.mission3.actingDetails);
  const [planSaved, setPlanSaved] = useState(student.mission3.saved);
  const [planError, setPlanError] = useState('');

  const allStationsDone = completedStations.length >= 5;

  const completeStation = (stationId: number) => {
    soundEngine.playSuccess();
    const updated = completedStations.includes(stationId)
      ? completedStations
      : [...completedStations, stationId];
    setCompletedStations(updated);
    onSaveMission3(
      {
        completedStations: updated,
        selectedStyle,
        reason,
        skillsToHighlight,
        actingDetails,
        saved: planSaved
      },
      false
    );
    if (stationId < 5) {
      setActiveStation(stationId + 1);
    }
  };

  const toggleMicRecording = async () => {
    if (isRecordingAudio) {
      mediaRecorderRef.current?.stop();
      setIsRecordingAudio(false);
      return;
    }

    setMicNote('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        setPracticeCompleted(true);
        stream.getTracks().forEach((t) => t.stop());
        soundEngine.playSuccess();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
    } catch {
      setMicNote(
        'Mikrofon tidak dapat diakses pada pelayar ini. Kamu masih boleh berlatih membaca ayat dengan kuat dan tandakan latihan selesai.'
      );
      setPracticeCompleted(true);
    }
  };

  const togglePauseIndex = (wordIdx: number) => {
    soundEngine.playClick();
    setSelectedPauses((prev) =>
      prev.includes(wordIdx) ? prev.filter((i) => i !== wordIdx) : [...prev, wordIdx]
    );
    setJedaFeedback('');
  };

  const checkJeda = () => {
    const correct = story.jedaSentence.correctPauseIndices;
    const isMatch =
      correct.every((idx) => selectedPauses.includes(idx)) &&
      selectedPauses.length === correct.length;
    if (isMatch) {
      soundEngine.playSuccess();
      setJedaFeedback(`Tepat sekali! ${story.jedaSentence.explanation}`);
    } else {
      soundEngine.playGentleRetry();
      setJedaFeedback(
        `Hampir tepat! Cuba letakkan jeda pada perkataan bertanda koma atau pemisah idea. ${story.jedaSentence.explanation}`
      );
    }
  };

  const toggleSkill = (skill: string) => {
    soundEngine.playClick();
    setSkillsToHighlight((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSavePlan = () => {
    if (!selectedStyle) {
      setPlanError('Sila pilih satu bentuk persembahan.');
      soundEngine.playGentleRetry();
      return;
    }
    if (!reason.trim()) {
      setPlanError('Sila tulis sebab kamu memilih bentuk persembahan ini.');
      soundEngine.playGentleRetry();
      return;
    }
    if (skillsToHighlight.length === 0) {
      setPlanError('Pilih sekurang-kurangnya satu kemahiran yang ingin kamu tonjolkan.');
      soundEngine.playGentleRetry();
      return;
    }
    if (selectedStyle === 'Lakonan' && !actingDetails.characters.trim()) {
      setPlanError('Sila nyatakan watak yang akan dilakonkan untuk persembahan lakonan.');
      soundEngine.playGentleRetry();
      return;
    }

    setPlanError('');
    soundEngine.playFanfare();
    setPlanSaved(true);
    onSaveMission3(
      {
        completedStations,
        selectedStyle,
        reason: reason.trim(),
        skillsToHighlight,
        actingDetails,
        saved: true
      },
      true
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-7">
      {/* Header */}
      <div className="rounded-3xl border border-[#E5C27D] bg-gradient-to-r from-[#FFF3C4] via-[#FDE8D7] to-[#FFF3C4] p-6 sm:p-8 shadow-lg">
        <p className="text-xs font-bold tracking-widest text-[#9A5B13]">
          MISI 3 · MAKMAL LATIHAN PENTAS FUTURISTIK
        </p>
        <h1 className="mt-1 text-2xl sm:text-4xl font-bold text-[#3D2612]">
          SELAMAT DATANG KE MAKMAL PERSEMBAHAN!
        </h1>
        <div className="mt-4">
          <CikguKancilBanner
            compact
            dialogue="Sebelum menjadi bintang pentas, kamu perlu menguasai lima kemahiran penting!"
          />
        </div>
      </div>

      {/* 5 Station Progress Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {STATIONS.map((st) => {
          const isDone = completedStations.includes(st.id);
          const isUnlocked = st.id === 1 || completedStations.includes(st.id - 1) || isDone;
          const isActive = activeStation === st.id;

          return (
            <button
              key={st.id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => {
                if (!isUnlocked) return;
                soundEngine.playClick();
                setActiveStation(st.id);
              }}
              className={`text-left rounded-2xl border p-4 transition-all ${
                isActive
                  ? 'border-2 border-[#D4941A] bg-[#FCEBB6] shadow-md'
                  : isDone
                  ? 'border-[#9EC4A3] bg-[#E4EFE2]'
                  : isUnlocked
                  ? 'border-[#E5CFA0] bg-[#FFFCF4] hover:border-[#D4941A]'
                  : 'border-[#E2CFA3] bg-[#F5EBD0] opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-bold">
                <span className="text-[#9A5B13] tabular-nums">Stesen {st.id}/5</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#235334]" />
                ) : !isUnlocked ? (
                  <Lock className="w-4 h-4 text-[#8E7354]" />
                ) : null}
              </div>
              <p className="mt-1.5 text-sm font-bold text-[#3D2612] leading-snug">{st.title}</p>
              <p className="mt-1 text-xs text-[#6B4E31]">{st.focus}</p>
            </button>
          );
        })}
      </div>

      {/* Active Station Content */}
      <section className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 sm:p-8 space-y-6 shadow-[0_8px_24px_rgba(120,84,28,0.08)]">
        {activeStation === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEAD8] border border-[#D4941A] flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-[#9A5B13]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">STESEN 1 – KUASA SUARA</h2>
                <p className="text-sm text-[#6B4E31]">
                  Fokus: Kelantangan dan kejelasan suara supaya setiap pendengar memahami cerita kamu.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'low' as const, label: 'Terlalu Perlahan', desc: 'Sukar didengari oleh rakan di barisan belakang.', bar: 'w-1/4 bg-[#E06D7E]' },
                { key: 'ideal' as const, label: 'Sesuai & Jelas', desc: 'Lantang, bertenaga dan selesa didengar oleh semua penonton.', bar: 'w-2/3 bg-[#5A9A72]' },
                { key: 'loud' as const, label: 'Terlalu Kuat', desc: 'Menjerit sehingga bunyi pecah dan menyakitkan telinga.', bar: 'w-full bg-[#F5B82E]' }
              ].map((sample) => (
                <div key={sample.key} className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-4 space-y-3">
                  <p className="text-sm font-bold text-[#3D2612]">{sample.label}</p>
                  <div className="h-2.5 rounded-full bg-[#EBD9A7] overflow-hidden">
                    <div className={`h-full ${sample.bar}`} />
                  </div>
                  <p className="text-xs text-[#4E341C]">{sample.desc}</p>
                  <button
                    type="button"
                    onClick={() => soundEngine.playVolumeSample(sample.key)}
                    className="min-h-[40px] w-full px-3 py-2 rounded-xl border border-[#D4941A] bg-[#FFFCF4] hover:bg-[#FCEBB6] text-xs font-bold text-[#7A440B]"
                  >
                    Uji Tahap Bunyi
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#E5C27D] bg-[#FFF7DC] p-5 space-y-4">
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">AKTIVITI MINI · LATIHAN BACAAN JELAS</p>
              <p className="text-lg sm:text-xl font-bold text-[#3D2612] leading-relaxed">{story.sampleLine}</p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMicRecording}
                  className={`min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-sm ${
                    isRecordingAudio
                      ? 'bg-[#C85470] text-white'
                      : 'bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] hover:bg-[#E5A420]'
                  }`}
                >
                  {isRecordingAudio ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                  {isRecordingAudio ? 'Hentikan Rakaman' : 'Rakam Suara Latihan'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSuccess();
                    setPracticeCompleted(true);
                  }}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DFC792] bg-[#FFFCF4] hover:bg-[#FCEBB6] text-xs font-bold text-[#4E341C]"
                >
                  Saya Sudah Berlatih Membaca
                </button>
              </div>

              {micNote && <p className="text-xs text-[#7A3A1E]">{micNote}</p>}
              {recordedAudioUrl && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-[#235334] mb-1.5">Dengar Semula Suara Kamu:</p>
                  <audio controls src={recordedAudioUrl} className="w-full max-w-md" />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={!practiceCompleted && !completedStations.includes(1)}
                onClick={() => completeStation(1)}
                className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#4E8B63] text-white font-bold text-sm hover:bg-[#3F7652] disabled:opacity-45 disabled:cursor-not-allowed shadow-sm"
              >
                SELESAI STESEN 1
              </button>
            </div>
          </div>
        )}

        {activeStation === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEAD8] border border-[#D4941A] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#9A5B13]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">STESEN 2 – MAGIK INTONASI</h2>
                <p className="text-sm text-[#6B4E31]">
                  Fokus: Penggunaan nada suara yang sesuai mengikut situasi gembira, sedih, terkejut atau marah.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                { mood: 'Gembira', line: '“Wah, akhirnya kita berjaya memenangi perlumbaan ini!”', pitch: 'Nada tinggi & ceria' },
                { mood: 'Sedih', line: '“Mengapakah kamu meninggalkan kami sendirian di sini...”', pitch: 'Nada perlahan & sayu' },
                { mood: 'Terkejut', line: '“Eh! Lihatlah ke dalam air itu, ada bayang-bayang besar!”', pitch: 'Nada naik mendadak' },
                { mood: 'Marah', line: '“Berani kamu menipu kami semua di sungai ini!”', pitch: 'Nada tegas & kuat' }
              ].map((item) => (
                <div key={item.mood} className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-4 space-y-2">
                  <p className="text-sm font-bold text-[#9A5B13]">{item.mood}</p>
                  <p className="text-xs text-[#3D2612] leading-relaxed">{item.line}</p>
                  <p className="text-[11px] text-[#6B4E31]">{item.pitch}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#E5C27D] bg-[#FFF7DC] p-5 space-y-3">
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">AKTIVITI MINI · PILIH INTONASI TEPAT</p>
              <p className="text-base font-bold text-[#3D2612]">
                Dialog: “Tolong! Tolong! Kapal kita sedang dipukul ribut yang dahsyat!”
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Gembira', 'Sedih', 'Terkejut & Cemas', 'Mengantuk'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedIntonation(opt);
                      setIntonationChecked(true);
                      if (opt === 'Terkejut & Cemas') soundEngine.playSuccess();
                      else soundEngine.playGentleRetry();
                    }}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold ${
                      selectedIntonation === opt
                        ? opt === 'Terkejut & Cemas'
                          ? 'bg-[#E4EFE2] border-[#5A9A72] text-[#1F4B2F]'
                          : 'bg-[#FDE4E8] border-[#E598A8] text-[#881D38]'
                        : 'bg-[#FFFCF4] border-[#DFC792] text-[#4E341C] hover:border-[#D4941A]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {intonationChecked && (
                <p className="text-sm font-medium text-[#7A3A1E]">
                  {selectedIntonation === 'Terkejut & Cemas'
                    ? 'Tepat! Nada cemas dan tinggi menggambarkan bahaya ribut yang mendesak.'
                    : 'Cuba bayangkan situasi kapal dipukul ribut—nada yang sesuai ialah Terkejut & Cemas.'}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={selectedIntonation !== 'Terkejut & Cemas' && !completedStations.includes(2)}
                onClick={() => completeStation(2)}
                className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#4E8B63] text-white font-bold text-sm hover:bg-[#3F7652] disabled:opacity-45 disabled:cursor-not-allowed shadow-sm"
              >
                SELESAI STESEN 2
              </button>
            </div>
          </div>
        )}

        {activeStation === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEAD8] border border-[#D4941A] flex items-center justify-center">
                <Pause className="w-6 h-6 text-[#9A5B13]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">STESEN 3 – RAHSIA JEDA</h2>
                <p className="text-sm text-[#6B4E31]">
                  Fokus: Penggunaan jeda (hentian seketika) supaya bacaan tersusun dan mudah difahami.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-4">
              <p className="text-xs font-bold text-[#9A5B13] mb-1">CONTOH TANDA JEDA (/)</p>
              <p className="text-base text-[#3D2612]">
                “Setelah berfikir sejenak, / Sang Kancil tersenyum / lalu menyusun rancangan yang bijak.”
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5C27D] bg-[#FFF7DC] p-5 space-y-4">
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">
                AKTIVITI MINI · KLIK PERKATAAN UNTUK LETAK TANDA JEDA (/)
              </p>
              <p className="text-sm text-[#4E341C]">
                Klik pada perkataan di mana kamu perlu berhenti seketika (petunjuk: pilih {story.jedaSentence.correctPauseIndices.length} tempat berhenti):
              </p>
              <div className="flex flex-wrap gap-2">
                {story.jedaSentence.words.map((word, idx) => {
                  const hasPause = selectedPauses.includes(idx);
                  return (
                    <button
                      key={`${word}-${idx}`}
                      type="button"
                      onClick={() => togglePauseIndex(idx)}
                      className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-sm font-semibold transition-colors ${
                        hasPause
                          ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A]'
                          : 'bg-[#FFFCF4] text-[#3D2612] border-[#DFC792] hover:border-[#D4941A]'
                      }`}
                    >
                      {word} {hasPause && <span className="font-bold text-[#9F1239]">/</span>}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={checkJeda}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#C85470] text-white font-bold text-sm hover:bg-[#B4435E]"
                >
                  Semak Jeda Saya
                </button>
                {jedaFeedback && <p className="text-sm font-medium text-[#7A3A1E]">{jedaFeedback}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={selectedPauses.length === 0 && !completedStations.includes(3)}
                onClick={() => completeStation(3)}
                className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#4E8B63] text-white font-bold text-sm hover:bg-[#3F7652] disabled:opacity-45 disabled:cursor-not-allowed shadow-sm"
              >
                SELESAI STESEN 3
              </button>
            </div>
          </div>
        )}

        {activeStation === 4 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEAD8] border border-[#D4941A] flex items-center justify-center">
                <Smile className="w-6 h-6 text-[#9A5B13]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">STESEN 4 – EKSPRESI WATAK</h2>
                <p className="text-sm text-[#6B4E31]">
                  Fokus: Menghidupkan perasaan watak melalui riak wajah, suara dan bahasa badan.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5C27D] bg-[#FFF7DC] p-5 space-y-4">
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">
                AKTIVITI MINI · PADANKAN EKSPRESI WATAK DENGAN SITUASI
              </p>
              <p className="text-base font-bold text-[#3D2612]">
                Situasi: Watak berjaya mencari jalan keluar yang bijak selepas menghadapi cabaran besar dalam cerita {story.title}. Apakah ekspresi muka dan suara yang paling sesuai?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'yakin', title: 'Senyum Yakin & Mata Bercahaya', desc: 'Nada suara bertenaga dan postur tegak bangga.' },
                  { id: 'keliru', title: 'Muka Masam & Menunduk', desc: 'Nada suara lemah seolah-olah berputus asa.' },
                  { id: 'kosong', title: 'Wajah Kosong Tanpa Reaksi', desc: 'Membaca terus tanpa melihat ke arah penonton.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedEmotion(opt.id);
                      if (opt.id === 'yakin') soundEngine.playSuccess();
                      else soundEngine.playGentleRetry();
                    }}
                    className={`text-left p-4 rounded-2xl border transition-colors ${
                      selectedEmotion === opt.id
                        ? opt.id === 'yakin'
                          ? 'bg-[#E4EFE2] border-[#5A9A72] text-[#1F4B2F]'
                          : 'bg-[#FDE4E8] border-[#E598A8] text-[#881D38]'
                        : 'bg-[#FFFCF4] border-[#DFC792] text-[#3D2612] hover:border-[#D4941A]'
                    }`}
                  >
                    <p className="text-sm font-bold">{opt.title}</p>
                    <p className="mt-1 text-xs opacity-85">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {selectedEmotion && (
                <p className="text-sm font-medium text-[#7A3A1E]">
                  {selectedEmotion === 'yakin'
                    ? 'Syabas! Wajah yang ceria dan bertenaga membantu penonton merasai kejayaan watak.'
                    : 'Kurang sesuai. Apabila watak berjaya mengatasi cabaran, ekspresi yakin dan berseri lebih menyerlahkan persembahan.'}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={selectedEmotion !== 'yakin' && !completedStations.includes(4)}
                onClick={() => completeStation(4)}
                className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#4E8B63] text-white font-bold text-sm hover:bg-[#3F7652] disabled:opacity-45 disabled:cursor-not-allowed shadow-sm"
              >
                SELESAI STESEN 4
              </button>
            </div>
          </div>
        )}

        {activeStation === 5 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEAD8] border border-[#D4941A] flex items-center justify-center">
                <Theater className="w-6 h-6 text-[#9A5B13]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">STESEN 5 – PILIH GAYA PERSEMBAHAN</h2>
                <p className="text-sm text-[#6B4E31]">
                  Fokus: Memahami kekuatan tiga bentuk persembahan sebelum kamu merancang persembahan sendiri.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'Bacaan biasa',
                  desc: 'Sesuai untuk menyampaikan maklumat dengan cepat, teratur dan tenang tanpa lakonan.'
                },
                {
                  id: 'Bacaan secara ekspresif',
                  desc: 'Sesuai untuk persembahan individu yang menonjolkan kehebatan suara, intonasi, jeda dan emosi.'
                },
                {
                  id: 'Lakonan',
                  desc: 'Sesuai untuk persembahan berkumpulan atau solo yang menggabungkan dialog, prop dan gerak pentas.'
                }
              ].map((g) => (
                <div key={g.id} className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-4 space-y-2">
                  <p className="text-base font-bold text-[#9A5B13]">{g.id}</p>
                  <p className="text-xs sm:text-sm text-[#4E341C] leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#E5C27D] bg-[#FFF7DC] p-5 space-y-3">
              <p className="text-xs font-bold tracking-wider text-[#9A5B13]">AKTIVITI MINI · SOALAN KESESUAIAN GAYA</p>
              <p className="text-sm sm:text-base font-bold text-[#3D2612]">
                Jika kamu membuat persembahan seorang diri sambil duduk atau berdiri dengan fokus penuh kepada kemerduan suara dan turun naik nada, gaya manakah yang paling tepat?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {['Bacaan biasa', 'Bacaan secara ekspresif', 'Lakonan'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedStation5Choice(opt);
                      if (opt === 'Bacaan secara ekspresif') soundEngine.playSuccess();
                      else soundEngine.playGentleRetry();
                    }}
                    className={`min-h-[44px] px-4 py-2 rounded-xl border text-sm font-bold ${
                      selectedStation5Choice === opt
                        ? opt === 'Bacaan secara ekspresif'
                          ? 'bg-[#E4EFE2] border-[#5A9A72] text-[#1F4B2F]'
                          : 'bg-[#FDE4E8] border-[#E598A8] text-[#881D38]'
                        : 'bg-[#FFFCF4] border-[#DFC792] text-[#4E341C] hover:border-[#D4941A]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selectedStation5Choice && (
                <p className="text-sm font-medium text-[#7A3A1E]">
                  {selectedStation5Choice === 'Bacaan secara ekspresif'
                    ? 'Betul! Bacaan secara ekspresif memfokuskan penghayatan suara, intonasi dan jeda tanpa memerlukan prop besar.'
                    : 'Hampir tepat! Apabila fokus utama ialah suara, intonasi dan penghayatan emosi seorang pembaca, jawapannya ialah Bacaan secara ekspresif.'}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={selectedStation5Choice !== 'Bacaan secara ekspresif' && !completedStations.includes(5)}
                onClick={() => completeStation(5)}
                className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#4E8B63] text-white font-bold text-sm hover:bg-[#3F7652] disabled:opacity-45 disabled:cursor-not-allowed shadow-sm"
              >
                SELESAI STESEN 5 & BUKA STUDIO PENGARAH
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Bahagian Akhir: Studio Pengarah Muda */}
      {allStationsDone && (
        <section className="rounded-3xl border-2 border-[#D4941A] bg-[#FFFCF4] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EDE0BC]">
            <div className="w-12 h-12 rounded-2xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-[#9A5B13]">STUDIO PENGARAH MUDA</p>
              <h2 className="text-2xl font-bold text-[#3D2612]">MASA UNTUK MERANCANG PERSEMBAHAN KAMU!</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="rounded-xl bg-[#FAF1D4] border border-[#E2CA99] p-4">
                <p className="text-xs font-bold text-[#9A5B13]">1. CERITA PILIHAN (DARI MISI 1)</p>
                <p className="mt-1 text-lg font-bold text-[#3D2612]">{story.title}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-[#4E341C] mb-2">2. Pilih Bentuk Persembahan:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['Bacaan biasa', 'Bacaan secara ekspresif', 'Lakonan'] as PerformanceStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedStyle(style);
                      }}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold ${
                        selectedStyle === style
                          ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A] shadow-sm'
                          : 'bg-[#FAF1D4] text-[#4E341C] border-[#DFC792] hover:border-[#D4941A]'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="m3-reason" className="block text-sm font-bold text-[#4E341C] mb-1.5">
                  3. Mengapa saya memilih bentuk persembahan ini?
                </label>
                <textarea
                  id="m3-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Terangkan sebab pilihan kamu..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-[#4E341C] mb-2">
                  4. Kemahiran yang ingin saya tonjolkan:
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SKILLS.map((skill) => {
                    const checked = skillsToHighlight.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                          checked
                            ? 'bg-[#C85470] border-[#D4941A] text-white'
                            : 'bg-[#FAF1D4] border-[#DFC792] text-[#4E341C]'
                        }`}
                      >
                        {checked ? '✓ ' : ''}{skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Conditional Acting details or Director's tip */}
            <div className="space-y-4">
              {selectedStyle === 'Lakonan' ? (
                <div className="rounded-2xl border border-[#E5C27D] bg-[#FAF1D4] p-5 space-y-3">
                  <p className="text-xs font-bold tracking-wider text-[#9A5B13]">
                    PILIHAN TAMBAHAN · PERANCANGAN LAKONAN
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-[#4E341C] mb-1">Watak yang akan dilakonkan</label>
                    <input
                      type="text"
                      value={actingDetails.characters}
                      onChange={(e) => setActingDetails((a) => ({ ...a, characters: e.target.value }))}
                      placeholder={`Contoh: ${story.characters.slice(0, 2).join(', ')}`}
                      className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4E341C] mb-1">Bilangan ahli kumpulan</label>
                    <input
                      type="text"
                      value={actingDetails.groupSize}
                      onChange={(e) => setActingDetails((a) => ({ ...a, groupSize: e.target.value }))}
                      placeholder="Contoh: 1 orang / 3 orang"
                      className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4E341C] mb-1">Keperluan prop atau bahan</label>
                    <input
                      type="text"
                      value={actingDetails.props}
                      onChange={(e) => setActingDetails((a) => ({ ...a, props: e.target.value }))}
                      placeholder="Contoh: Topeng kertas, kain selendang, kayu penunjuk"
                      className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4E341C] mb-1">Latar tempat persembahan</label>
                    <input
                      type="text"
                      value={actingDetails.setting}
                      onChange={(e) => setActingDetails((a) => ({ ...a, setting: e.target.value }))}
                      placeholder={story.setting}
                      className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-5 space-y-2">
                  <p className="text-xs font-bold tracking-wider text-[#9A5B13]">PANDUAN PENGARAH</p>
                  <p className="text-sm text-[#4E341C] leading-relaxed">
                    Jika kamu memilih <strong>Bacaan biasa</strong> atau <strong>Bacaan secara ekspresif</strong>, berikan tumpuan penuh pada kejelasan suara, pernafasan pada tanda jeda dan hubungan mata dengan penonton.
                  </p>
                </div>
              )}

              {planError && (
                <p className="rounded-xl border border-[#E598A8] bg-[#FDE4E8] px-4 py-3 text-sm font-semibold text-[#881D38]">
                  {planError}
                </p>
              )}

              <button
                type="button"
                onClick={handleSavePlan}
                className="min-h-[48px] w-full px-6 py-3 rounded-xl bg-[#C85470] hover:bg-[#B4435E] border-2 border-[#F5B82E] text-white font-bold text-base transition-all shadow-md"
              >
                SIMPAN PELAN PERSEMBAHAN
              </button>
            </div>
          </div>

          {/* Saved Creative Director Board Summary */}
          {planSaved && (
            <div className="rounded-3xl border-2 border-[#D4941A] bg-[#FFFBEB] text-[#3D2612] p-6 sm:p-8 shadow-xl animate-stage-burst">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#D97706]/30">
                <div>
                  <p className="text-xs font-bold tracking-widest text-[#9A5B13]">
                    PAPAN PERANCANGAN PENGARAH TEATER
                  </p>
                  <h3 className="text-2xl font-bold text-[#3D2612]">
                    Pelan Rasmi: {student.name}
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#235334]">
                  Lencana PENGARAH MUDA · +20 Bintang
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs font-bold text-[#92400E]">Cerita Pilihan</p>
                  <p className="font-bold">{story.title}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#92400E]">Bentuk Persembahan</p>
                  <p className="font-bold">{selectedStyle}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#92400E]">Kemahiran Fokus</p>
                  <p className="font-semibold">{skillsToHighlight.join(', ')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#92400E]">Alasan Pilihan</p>
                  <p>{reason}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onBackToMap();
                  }}
                  className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420]"
                >
                  Kembali ke Peta & Buka Misi 4
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
