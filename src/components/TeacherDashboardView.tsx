import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Download,
  Film,
  Home,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Video
} from 'lucide-react';
import { AWARD_CATEGORIES, STORIES } from '../data/stories';
import { getRubricLabel, summarizeEvaluation } from '../store/useAppStore';
import { FeedbackComment, RubricLevel, StudentRecord, TeacherEvaluation } from '../types';
import { soundEngine } from '../utils/sound';
import { SharedForestBackground } from './EnchantedForestStage';

type TeacherMenu =
  | 'dashboard'
  | 'students'
  | 'missions'
  | 'plans'
  | 'trials'
  | 'feedback'
  | 'finals'
  | 'reflections'
  | 'rubric';

interface TeacherDashboardViewProps {
  teacherName: string;
  students: StudentRecord[];
  onSaveTeacherFeedback: (studentId: string, teacherName: string, feedback: string) => void;
  onSaveEvaluation: (studentId: string, evaluation: TeacherEvaluation) => void;
  onToggleFinalDownloadPermission: (studentId: string, allow: boolean) => void;
  onAddFinalComment: (studentId: string, comment: FeedbackComment) => void;
  onNavigateHome: () => void;
  onSwitchRole: () => void;
}

const MENU_ITEMS: { id: TeacherMenu; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Senarai Murid', icon: Users },
  { id: 'missions', label: 'Kemajuan Misi', icon: BarChart3 },
  { id: 'plans', label: 'Pelan Persembahan', icon: ClipboardList },
  { id: 'trials', label: 'Rakaman Percubaan', icon: Video },
  { id: 'feedback', label: 'Maklum Balas', icon: MessageSquare },
  { id: 'finals', label: 'Persembahan Akhir', icon: Film },
  { id: 'reflections', label: 'Refleksi Murid', icon: Sparkles },
  { id: 'rubric', label: 'Rubrik Penilaian', icon: ClipboardCheck }
];

const RUBRIC_ASPECTS: { key: 'sebutan' | 'intonasi' | 'jeda' | 'ekspresi' | 'gaya'; label: string }[] = [
  { key: 'sebutan', label: 'Sebutan' },
  { key: 'intonasi', label: 'Intonasi' },
  { key: 'jeda', label: 'Jeda' },
  { key: 'ekspresi', label: 'Ekspresi' },
  { key: 'gaya', label: 'Gaya persembahan' }
];

export default function TeacherDashboardView({
  teacherName,
  students,
  onSaveTeacherFeedback,
  onSaveEvaluation,
  onToggleFinalDownloadPermission,
  onAddFinalComment,
  onNavigateHome,
  onSwitchRole
}: TeacherDashboardViewProps) {
  const [activeMenu, setActiveMenu] = useState<TeacherMenu>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  // Teacher feedback inline editor
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [feedbackSavedMsg, setFeedbackSavedMsg] = useState(false);
  const [finalCommentDrafts, setFinalCommentDrafts] = useState<Record<string, string>>({});

  // Rubric state
  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0] || null;
  const [rubricLevels, setRubricLevels] = useState<Record<'sebutan' | 'intonasi' | 'jeda' | 'ekspresi' | 'gaya', RubricLevel>>({
    sebutan: selectedStudent?.evaluation?.sebutan || 3,
    intonasi: selectedStudent?.evaluation?.intonasi || 3,
    jeda: selectedStudent?.evaluation?.jeda || 3,
    ekspresi: selectedStudent?.evaluation?.ekspresi || 3,
    gaya: selectedStudent?.evaluation?.gaya || 3
  });
  const [rubricComment, setRubricComment] = useState(selectedStudent?.evaluation?.comment || '');
  const [awardCategory, setAwardCategory] = useState(
    selectedStudent?.evaluation?.awardCategory || AWARD_CATEGORIES[0]
  );
  const [rubricSavedBanner, setRubricSavedBanner] = useState(false);

  const selectStudentForReview = (student: StudentRecord) => {
    soundEngine.playClick();
    setSelectedStudentId(student.id);
    setFeedbackDraft(student.mission4.teacherFeedback || '');
    setRubricLevels({
      sebutan: student.evaluation?.sebutan || 3,
      intonasi: student.evaluation?.intonasi || 3,
      jeda: student.evaluation?.jeda || 3,
      ekspresi: student.evaluation?.ekspresi || 3,
      gaya: student.evaluation?.gaya || 3
    });
    setRubricComment(student.evaluation?.comment || '');
    setAwardCategory(student.evaluation?.awardCategory || AWARD_CATEGORIES[0]);
  };

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // KPI Metrics
  const totalStudents = students.length;
  const inProgressCount = students.filter((s) => s.completedMissions.length < 5).length;
  const completedAllCount = students.filter((s) => s.completedMissions.includes(5)).length;
  const submittedPerformancesCount = students.filter(
    (s) => Boolean(s.mission4.trialVideoUrl) || Boolean(s.mission5.finalVideoUrl)
  ).length;

  // Class progress distribution per mission
  const missionCounts = [1, 2, 3, 4, 5].map(
    (m) => students.filter((s) => s.completedMissions.includes(m)).length
  );

  const rubricSummary = summarizeEvaluation(rubricLevels);

  const handleSaveRubric = () => {
    if (!selectedStudent) return;
    soundEngine.playFanfare();
    onSaveEvaluation(selectedStudent.id, {
      ...rubricLevels,
      comment: rubricComment.trim() || rubricSummary.autoSummary,
      awardCategory,
      savedAt: new Date().toISOString()
    });
    setRubricSavedBanner(true);
    setTimeout(() => setRubricSavedBanner(false), 3000);
  };

  const getStoryTitle = (storyId: string) =>
    STORIES.find((st) => st.id === storyId)?.title || 'Belum dipilih';

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#4DD0E1] text-[#3D2612] flex flex-col lg:flex-row">
      <SharedForestBackground />

      {/* Sidebar */}
      <aside className="relative z-10 w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-[#E5CFA0] bg-[#FAF1D4]/95 backdrop-blur-sm p-4 sm:p-5 flex flex-col justify-between gap-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E2CA99]">
            <div>
              <p className="text-[11px] font-bold tracking-widest text-[#9A5B13]">MOD GURU</p>
              <h1 className="text-lg font-bold text-[#3D2612] leading-tight">PUSAT KAWALAN GURU</h1>
              <p className="mt-0.5 text-xs text-[#6B4E31]">{teacherName}</p>
            </div>
          </div>

          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveMenu(item.id);
                  }}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-colors text-left ${
                    active
                      ? 'bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold shadow-sm'
                      : 'text-[#4E341C] hover:bg-[#FFF8DF]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#E2CA99]">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onSwitchRole();
            }}
            className="min-h-[42px] w-full px-3.5 py-2 rounded-xl border border-[#DFC792] bg-[#FFFCF4] hover:bg-[#FCEBB6] text-xs font-bold text-[#3D2612] inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-[#9A5B13]" />
            Tukar Peranan
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onNavigateHome();
            }}
            className="min-h-[42px] w-full px-3.5 py-2 rounded-xl border border-[#DFC792] bg-[#FFF7DF] hover:bg-[#FCEBB6] text-xs font-bold text-[#7A440B] inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Halaman Utama
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-4 sm:p-8 space-y-6 overflow-x-hidden">
        {/* Prototype storage notice */}
        <div className="rounded-xl border border-[#E5CFA0] bg-[#FFFCF4] px-4 py-2.5 text-xs text-[#4E341C] flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <span>
            Mod Prototaip Storan Setempat: Rekod murid yang mendaftar dalam pelayar ini serta data contoh kelas dipaparkan secara masa nyata di sini.
          </span>
          <span className="font-bold text-[#9A5B13] tabular-nums">{students.length} Rekod Murid</span>
        </div>

        {/* 1. DASHBOARD */}
        {activeMenu === 'dashboard' && (
          <div className="space-y-6">
            <div className="forest-readable-text">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3D2612]">Ringkasan Prestasi Kelas</h2>
              <p className="text-sm font-medium text-[#4E341C]">
                Pantau penglibatan murid dalam lima misi KARYA SASTERA HIDUP!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-[#E5CFA0] bg-[#FFFCF4] p-5 shadow-sm">
                <p className="text-xs font-bold text-[#9A5B13]">Jumlah murid berdaftar</p>
                <p className="mt-2 text-3xl font-bold text-[#3D2612] tabular-nums">{totalStudents}</p>
              </div>
              <div className="rounded-2xl border border-[#EAB892] bg-[#FCEAD8]/70 p-5 shadow-sm">
                <p className="text-xs font-bold text-[#7A3A1E]">Sedang menjalankan misi</p>
                <p className="mt-2 text-3xl font-bold text-[#3D2612] tabular-nums">{inProgressCount}</p>
              </div>
              <div className="rounded-2xl border border-[#9EC4A3] bg-[#E4EFE2]/75 p-5 shadow-sm">
                <p className="text-xs font-bold text-[#235334]">Menamatkan semua misi</p>
                <p className="mt-2 text-3xl font-bold text-[#1F4B2F] tabular-nums">{completedAllCount}</p>
              </div>
              <div className="rounded-2xl border border-[#E9B1C4] bg-[#FDE4EC]/75 p-5 shadow-sm">
                <p className="text-xs font-bold text-[#881D38]">Persembahan dihantar</p>
                <p className="mt-2 text-3xl font-bold text-[#6E1A30] tabular-nums">{submittedPerformancesCount}</p>
              </div>
            </div>

            {/* Carta Kemajuan Kelas */}
            <div className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 space-y-4 shadow-[0_8px_24px_rgba(120,84,28,0.08)]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#3D2612]">Carta Kemajuan Kelas (Misi 1 – Misi 5)</h3>
                  <p className="text-xs text-[#6B4E31]">Bilangan murid yang telah menyelesaikan setiap misi</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                {[1, 2, 3, 4, 5].map((m, idx) => {
                  const count = missionCounts[idx];
                  const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                  return (
                    <div key={m} className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                        <span className="text-[#3D2612]">Misi {m}</span>
                        <span className="text-[#9A5B13] tabular-nums">
                          {count}/{totalStudents} murid ({pct}%)
                        </span>
                      </div>
                      <div className="h-3.5 rounded-full bg-[#FAF1D4] overflow-hidden border border-[#DFC792]">
                        <div
                          className="h-full bg-gradient-to-r from-[#F5B82E] via-[#E5984B] to-[#5A9A72] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. SENARAI MURID + PROFIL PEMBELAJARAN */}
        {activeMenu === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="forest-readable-text">
                <h2 className="text-2xl font-bold text-[#3D2612]">Senarai Murid & Profil Pembelajaran</h2>
                <p className="text-sm font-medium text-[#4E341C]">Klik nama murid untuk melihat rekod lengkap Misi 1 hingga Misi 5.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#9A5B13] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama murid atau kelas..."
                  className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E5CFA0] bg-[#FFFCF4] shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F6E8BE] text-xs font-bold uppercase tracking-wider text-[#6B4211]">
                    <th className="p-3.5">Nama murid</th>
                    <th className="p-3.5">Kelas</th>
                    <th className="p-3.5">Misi semasa</th>
                    <th className="p-3.5">Jumlah bintang</th>
                    <th className="p-3.5">Status kemajuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE0BC] text-sm">
                  {filteredStudents.map((st) => {
                    const isSelected = selectedStudent?.id === st.id;
                    const done = st.completedMissions.includes(5);
                    return (
                      <tr
                        key={st.id}
                        onClick={() => selectStudentForReview(st)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#FCEBB6]' : 'hover:bg-[#FFF6D6]'
                        }`}
                      >
                        <td className="p-3.5 font-bold text-[#3D2612]">
                          {st.name}
                          {st.isDemo && <span className="ml-2 text-[11px] font-normal text-[#7A5C3E]">(Contoh)</span>}
                        </td>
                        <td className="p-3.5 text-[#4E341C]">{st.className}</td>
                        <td className="p-3.5 text-[#9A5B13] font-semibold tabular-nums">Misi {st.currentMission}/5</td>
                        <td className="p-3.5 font-bold text-[#8A5600] tabular-nums">{st.stars} ★</td>
                        <td className="p-3.5">
                          <span className={`text-xs font-bold ${done ? 'text-[#235334]' : 'text-[#9A5B13]'}`}>
                            {done ? 'Tamat Semua Misi' : `${st.completedMissions.length}/5 Misi Selesai`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Student Full Learning Profile */}
            {selectedStudent && (
              <div className="rounded-3xl border-2 border-[#D4941A] bg-[#FFFCF4] p-6 space-y-5 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EDE0BC]">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-[#9A5B13]">PROFIL PEMBELAJARAN MURID</p>
                    <h3 className="text-xl font-bold text-[#3D2612]">
                      {selectedStudent.name} · {selectedStudent.className}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveMenu('rubric');
                      }}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-xs hover:bg-[#E5A420]"
                    >
                      Nilai dengan Rubrik
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div className="rounded-2xl bg-[#FAF1D4] border border-[#E2CA99] p-4 space-y-1">
                    <p className="font-bold text-[#9A5B13]">Misi 1 · Cerita & Bacaan</p>
                    <p className="text-[#3D2612] font-semibold">{getStoryTitle(selectedStudent.selectedStoryId)}</p>
                    <p className="text-[#6B4E31]">Status: {selectedStudent.mission1Completed ? 'Selesai dibaca & difahami' : 'Belum selesai'}</p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF1D4] border border-[#E2CA99] p-4 space-y-1">
                    <p className="font-bold text-[#9A5B13]">Misi 2 · Jawapan Kuiz Detektif</p>
                    <p className="text-[#3D2612]">Pilihan: {selectedStudent.mission2.preferredStyle || '-'}</p>
                    <p className="text-[#6B4E31]">{selectedStudent.mission2.reason || 'Belum dijawab'}</p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF1D4] border border-[#E2CA99] p-4 space-y-1">
                    <p className="font-bold text-[#9A5B13]">Misi 3 · Pelan Persembahan</p>
                    <p className="text-[#3D2612]">Gaya: {selectedStudent.mission3.selectedStyle || '-'}</p>
                    <p className="text-[#6B4E31]">Kemahiran: {selectedStudent.mission3.skillsToHighlight.join(', ') || '-'}</p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF1D4] border border-[#E2CA99] p-4 space-y-1">
                    <p className="font-bold text-[#9A5B13]">Misi 4 · Rakaman Percubaan & Penambahbaikan</p>
                    <p className="text-[#3D2612]">{selectedStudent.mission4.trialVideoLabel || 'Tiada rakaman percubaan'}</p>
                    <p className="text-[#6B4E31]">Tindakan: {selectedStudent.mission4.improvementAction || '-'}</p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF1D4] border border-[#E2CA99] p-4 space-y-1">
                    <p className="font-bold text-[#9A5B13]">Maklum Balas Rakan & Guru</p>
                    <p className="text-[#3D2612]">Komen rakan: {selectedStudent.mission4.peerComments.length}</p>
                    <p className="text-[#6B4E31]">Guru: {selectedStudent.mission4.teacherFeedback || 'Belum ada catatan'}</p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF1D4] border border-[#E2CA99] p-4 space-y-1">
                    <p className="font-bold text-[#9A5B13]">Misi 5 · Persembahan Akhir & Refleksi</p>
                    <p className="text-[#3D2612]">{selectedStudent.mission5.finalVideoLabel || 'Belum dihantar'}</p>
                    <p className="text-[#6B4E31]">Refleksi: {selectedStudent.mission5.reflection.proudestPart || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. KEMAJUAN MISI */}
        {activeMenu === 'missions' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#3D2612] forest-readable-text">Matriks Kemajuan Misi Kelas</h2>
            <div className="overflow-x-auto rounded-2xl border border-[#E5CFA0] bg-[#FFFCF4] shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F6E8BE] text-xs font-bold uppercase text-[#6B4211]">
                    <th className="p-3.5">Murid</th>
                    <th className="p-3.5">Cerita Pilihan</th>
                    <th className="p-3.5 text-center">M1</th>
                    <th className="p-3.5 text-center">M2</th>
                    <th className="p-3.5 text-center">M3</th>
                    <th className="p-3.5 text-center">M4</th>
                    <th className="p-3.5 text-center">M5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE0BC]">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-[#FFF6D6]">
                      <td className="p-3.5 font-bold text-[#3D2612]">{st.name}</td>
                      <td className="p-3.5 text-[#4E341C]">{getStoryTitle(st.selectedStoryId)}</td>
                      {[1, 2, 3, 4, 5].map((m) => (
                        <td key={m} className="p-3.5 text-center">
                          {st.completedMissions.includes(m) ? (
                            <CheckCircle2 className="w-5 h-5 text-[#2E7D52] inline" />
                          ) : (
                            <span className="text-[#B89F74]">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PELAN PERSEMBAHAN */}
        {activeMenu === 'plans' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#3D2612] forest-readable-text">Pelan Persembahan Murid (Misi 3)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((st) => (
                <div key={st.id} className="rounded-2xl border border-[#E5CFA0] bg-[#FFFCF4] p-5 space-y-2 text-sm shadow-sm">
                  <div className="flex justify-between gap-2">
                    <p className="font-bold text-[#3D2612]">{st.name}</p>
                    <span className="text-xs font-bold text-[#9A5B13]">{st.className}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#7A3A1E]">Cerita: {getStoryTitle(st.selectedStoryId)}</p>
                  <p className="text-[#3D2612]"><strong>Bentuk:</strong> {st.mission3.selectedStyle || 'Belum dirancang'}</p>
                  <p className="text-[#4E341C]"><strong>Alasan:</strong> {st.mission3.reason || '-'}</p>
                  <p className="text-[#235334] font-semibold text-xs">
                    Kemahiran: {st.mission3.skillsToHighlight.join(', ') || '-'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. RAKAMAN PERCUBAAN */}
        {activeMenu === 'trials' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#3D2612] forest-readable-text">Rakaman Percubaan & Penambahbaikan (Misi 4)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((st) => (
                <div key={st.id} className="rounded-2xl border border-[#E5CFA0] bg-[#FFFCF4] p-5 space-y-3 text-sm shadow-sm">
                  <p className="font-bold text-[#3D2612]">{st.name} · {st.className}</p>
                  <p className="text-xs font-semibold text-[#9A5B13]">{st.mission4.trialVideoLabel || 'Tiada rakaman percubaan dimuat naik'}</p>
                  {(st.mission4.trialVideoType === 'upload' || st.mission4.trialVideoType === 'camera') && st.mission4.trialVideoUrl && (
                    <video src={st.mission4.trialVideoUrl} controls className="w-full max-h-48 rounded-xl bg-black" />
                  )}
                  <div className="rounded-xl bg-[#FAF1D4] border border-[#E2CA99] p-3 text-xs space-y-1">
                    <p className="text-[#9A5B13] font-bold">Kelemahan dikenal pasti:</p>
                    <p className="text-[#3D2612]">{st.mission4.identifiedWeakness || '-'}</p>
                    <p className="text-[#235334] font-bold pt-1">Tindakan penambahbaikan:</p>
                    <p className="text-[#3D2612]">{st.mission4.improvementAction || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. MAKLUM BALAS */}
        {activeMenu === 'feedback' && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-[#3D2612] forest-readable-text">Pusat Maklum Balas Guru</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-4 space-y-2">
                {students.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => selectStudentForReview(st)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      selectedStudent?.id === st.id
                        ? 'bg-[#FCEBB6] border-[#D4941A] shadow-sm'
                        : 'bg-[#FFFCF4] border-[#E5CFA0] hover:border-[#D4941A]'
                    }`}
                  >
                    <p className="font-bold text-sm text-[#3D2612]">{st.name}</p>
                    <p className="text-xs text-[#6B4E31]">{st.className} · {st.mission4.peerComments.length} komen rakan</p>
                  </button>
                ))}
              </div>

              {selectedStudent && (
                <div className="lg:col-span-8 rounded-2xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 space-y-4 shadow-sm">
                  <h3 className="text-lg font-bold text-[#9A5B13]">
                    Beri Maklum Balas kepada {selectedStudent.name}
                  </h3>
                  <textarea
                    rows={4}
                    value={feedbackDraft}
                    onChange={(e) => setFeedbackDraft(e.target.value)}
                    placeholder="Tulis komen bimbingan membina untuk murid..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playSuccess();
                        onSaveTeacherFeedback(selectedStudent.id, teacherName, feedbackDraft.trim());
                        setFeedbackSavedMsg(true);
                        setTimeout(() => setFeedbackSavedMsg(false), 2500);
                      }}
                      className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420]"
                    >
                      SIMPAN MAKLUM BALAS GURU
                    </button>
                    {feedbackSavedMsg && <span className="text-xs font-bold text-[#235334]">Berjaya disimpan!</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. PERSEMBAHAN AKHIR (Teacher-Protected Gallery & Privacy Control) */}
        {activeMenu === 'finals' && (
          <div className="space-y-4">
            <div className="forest-readable-text">
              <h2 className="text-2xl font-bold text-[#3D2612]">
                Dewan Seribu Kisah & Kawalan Muat Turun Guru
              </h2>
              <p className="text-sm font-medium text-[#4E341C]">
                Guru boleh menyemak semua persembahan akhir murid, menentukan kebenaran muat turun oleh rakan sekelas dan menghantar komen penghargaan di Dewan Seribu Kisah.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((st) => {
                const isSubmitted = Boolean(st.mission5.finalVideoSubmittedAt || st.mission5.submitted);
                const peerDownloadAllowed = Boolean(st.mission5.allowPeerDownload);
                const finalCommentsCount = (st.mission5.finalComments || []).length;
                const draft = finalCommentDrafts[st.id] || '';
                return (
                  <div key={st.id} className="rounded-2xl border border-[#E5CFA0] bg-[#FFFCF4] p-5 space-y-3 text-sm shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#3D2612]">{st.name}</p>
                        <p className="text-xs text-[#6B4E31]">{st.className}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          isSubmitted
                            ? 'bg-[#E4EFE2] text-[#235334] border border-[#9EC4A3]'
                            : 'bg-[#FAF1D4] text-[#7A5C3E] border border-[#DFC792]'
                        }`}
                      >
                        {isSubmitted ? 'Dihantar' : 'Belum dihantar'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#7A3A1E]">
                      Cerita: {getStoryTitle(st.selectedStoryId)} · {st.mission3.selectedStyle || '-'}
                    </p>
                    <p className="text-xs text-[#4E341C]">
                      {st.mission5.finalVideoLabel || 'Tiada video akhir lagi'} ·{' '}
                      <span className="text-[#9A5B13] font-semibold">{finalCommentsCount} komen dewan</span>
                    </p>

                    {(st.mission5.finalVideoType === 'upload' || st.mission5.finalVideoType === 'camera') &&
                      st.mission5.finalVideoUrl && (
                        <video src={st.mission5.finalVideoUrl} controls className="w-full max-h-48 rounded-xl bg-black" />
                      )}

                    {/* Teacher Privacy Control Toggle */}
                    <div className="rounded-xl border border-[#E2CA99] bg-[#FAF1D4] p-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs">
                        <p className="font-bold text-[#3D2612]">Kebenaran Muat Turun oleh Rakan</p>
                        <p className="text-[#6B4E31]">
                          {peerDownloadAllowed
                            ? 'Rakan kelas dibenarkan memuat turun video ini.'
                            : 'Ditutup (hanya pemilik & guru boleh muat turun).'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          onToggleFinalDownloadPermission(st.id, !peerDownloadAllowed);
                        }}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                          peerDownloadAllowed
                            ? 'bg-[#4E8B63] text-white'
                            : 'bg-[#FFF7DF] border border-[#D4941A] text-[#7A440B]'
                        }`}
                      >
                        {peerDownloadAllowed ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        {peerDownloadAllowed ? 'Dibenarkan' : 'Dihadkan'}
                      </button>
                    </div>

                    {/* Teacher Final Hall Comment */}
                    {isSubmitted && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={draft}
                          onChange={(e) =>
                            setFinalCommentDrafts((prev) => ({ ...prev, [st.id]: e.target.value }))
                          }
                          placeholder="Tulis komen guru di Dewan Seribu Kisah..."
                          className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-white border border-[#DCC38D] text-xs text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const clean = draft.trim();
                            if (!clean) return;
                            soundEngine.playSuccess();
                            onAddFinalComment(st.id, {
                              id: `fc-guru-${Date.now()}`,
                              recordingId: `final-${st.id}`,
                              authorId: 'teacher-active',
                              author: teacherName,
                              role: 'guru',
                              strengths: '',
                              improvement: '',
                              suggestion: '',
                              message: clean,
                              createdAt: new Date().toISOString()
                            });
                            setFinalCommentDrafts((prev) => ({ ...prev, [st.id]: '' }));
                          }}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-xs inline-flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Hantar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 8. REFLEKSI MURID */}
        {activeMenu === 'reflections' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#3D2612] forest-readable-text">Refleksi Kendiri Murid (Misi 5)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((st) => (
                <div key={st.id} className="rounded-2xl border border-[#E5CFA0] bg-[#FFFCF4] p-5 space-y-2 text-xs sm:text-sm text-[#4E341C] shadow-sm">
                  <p className="font-bold text-base text-[#9A5B13]">{st.name} ({st.className})</p>
                  <p><strong className="text-[#3D2612]">Kemahiran baharu:</strong> {st.mission5.reflection.newSkill || '-'}</p>
                  <p><strong className="text-[#3D2612]">Perubahan dibuat:</strong> {st.mission5.reflection.changesMade || '-'}</p>
                  <p><strong className="text-[#3D2612]">Paling dibanggakan:</strong> {st.mission5.reflection.proudestPart || '-'}</p>
                  <p><strong className="text-[#3D2612]">Sasaran masa depan:</strong> {st.mission5.reflection.futureGoal || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. RUBRIK PENILAIAN DIGITAL */}
        {activeMenu === 'rubric' && (
          <div className="space-y-6">
            <div className="forest-readable-text">
              <h2 className="text-2xl font-bold text-[#3D2612]">Rubrik Penilaian Digital</h2>
              <p className="text-sm font-medium text-[#4E341C]">
                Pilih murid, tandakan tahap pencapaian bagi lima aspek persembahan dan simpan rumusan penilaian.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {students.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => selectStudentForReview(st)}
                  className={`min-h-[42px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 ${
                    selectedStudent?.id === st.id
                      ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A] shadow-sm'
                      : 'bg-[#FFFCF4] text-[#4E341C] border-[#DFC792] hover:border-[#D4941A]'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  {st.name}
                </button>
              ))}
            </div>

            {selectedStudent && (
              <div className="rounded-3xl border border-[#E5C27D] bg-[#FFFCF4] p-6 space-y-6 shadow-sm">
                <div className="overflow-x-auto rounded-2xl border border-[#E5CFA0]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F6E8BE] text-xs font-bold uppercase text-[#6B4211]">
                        <th className="p-3.5">Aspek penilaian</th>
                        <th className="p-3.5 text-center">Tahap 1 · Perlu bimbingan</th>
                        <th className="p-3.5 text-center">Tahap 2 · Sedang berkembang</th>
                        <th className="p-3.5 text-center">Tahap 3 · Baik</th>
                        <th className="p-3.5 text-center">Tahap 4 · Cemerlang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE0BC] bg-[#FFFCF4] text-xs sm:text-sm">
                      {RUBRIC_ASPECTS.map((aspect) => {
                        const currentVal = rubricLevels[aspect.key];
                        return (
                          <tr key={aspect.key}>
                            <td className="p-3.5 font-bold text-[#3D2612]">{aspect.label}</td>
                            {([1, 2, 3, 4] as RubricLevel[]).map((lvl) => (
                              <td key={lvl} className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    soundEngine.playClick();
                                    setRubricLevels((prev) => ({ ...prev, [aspect.key]: lvl }));
                                  }}
                                  className={`min-h-[40px] w-full px-2 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                                    currentVal === lvl
                                      ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A] shadow-sm'
                                      : 'bg-[#FAF1D4] text-[#4E341C] border-[#DFC792] hover:border-[#D4941A]'
                                  }`}
                                >
                                  {getRubricLabel(lvl)}
                                </button>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Automatic Evaluation Summary */}
                <div className="rounded-2xl border border-[#E5C27D] bg-[#FAF1D4] p-5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold tracking-wider text-[#9A5B13]">
                      RUMUSAN PENILAIAN AUTOMATIK
                    </p>
                    <p className="text-sm font-bold text-[#235334] tabular-nums">
                      Skor: {rubricSummary.totalScore}/{rubricSummary.maxScore} · Tahap {rubricSummary.band}
                    </p>
                  </div>
                  <p className="text-sm text-[#3D2612] leading-relaxed">{rubricSummary.autoSummary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#4E341C] mb-1.5">
                      Kategori Anugerah Bintang Sastera
                    </label>
                    <select
                      value={awardCategory}
                      onChange={(e) => setAwardCategory(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] focus:outline-none focus:border-[#D9911E]"
                    >
                      {AWARD_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#4E341C] mb-1.5">
                      Ulasan Tambahan Guru
                    </label>
                    <textarea
                      rows={3}
                      value={rubricComment}
                      onChange={(e) => setRubricComment(e.target.value)}
                      placeholder="Tulis ulasan khusus untuk prestasi murid ini..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {rubricSavedBanner ? (
                    <span className="text-sm font-bold text-[#235334] inline-flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Penilaian berjaya disimpan untuk {selectedStudent.name}!
                    </span>
                  ) : (
                    <span className="text-xs text-[#6B4E31] inline-flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[#D4941A]" />
                      Anugerah pilihan akan dipaparkan pada Sijil Digital murid.
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveRubric}
                    className="min-h-[46px] px-7 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] shadow-sm"
                  >
                    SIMPAN PENILAIAN
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
