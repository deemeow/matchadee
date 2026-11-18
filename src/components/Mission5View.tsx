import { ChangeEvent, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Camera,
  CheckCircle2,
  Compass,
  Crown,
  Link2,
  Mic,
  Printer,
  Sparkles,
  Square,
  Star,
  Theater,
  Trash2,
  Trophy,
  Upload,
  Video
} from 'lucide-react';
import { AWARD_CATEGORIES, CIKGU_KANCIL_IMAGE, MISSION_BADGES, STORIES } from '../data/stories';
import { FeedbackComment, Mission5Data, StudentRecord } from '../types';
import { CikguKancilBanner } from './CikguKancilGuide';
import Mission5DewanSeribuKisah from './Mission5DewanSeribuKisah';
import { soundEngine } from '../utils/sound';

interface Mission5ViewProps {
  student: StudentRecord;
  allStudents: StudentRecord[];
  onSaveMission5: (data: Mission5Data, finalize: boolean) => void;
  onAddFinalComment: (targetStudentId: string, comment: FeedbackComment) => void;
  onFinishToGallery: () => void;
  onBackToMap: () => void;
}

type SubmissionStatus = 'Belum dihantar' | 'Sedang diproses' | 'Berjaya dihantar';

export default function Mission5View({
  student,
  allStudents,
  onSaveMission5,
  onAddFinalComment,
  onFinishToGallery,
  onBackToMap
}: Mission5ViewProps) {
  const story = STORIES.find((s) => s.id === student.selectedStoryId) || STORIES[0];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [data, setData] = useState<Mission5Data>(student.mission5);
  const [stageStarted, setStageStarted] = useState(
    student.mission5.stageReady || Boolean(student.mission5.finalVideoSubmittedAt) || student.mission5.submitted
  );
  const [activeHallTab, setActiveHallTab] = useState<'rakam' | 'dewan'>('rakam');
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>(
    student.mission5.finalVideoSubmittedAt || student.mission5.submitted
      ? 'Berjaya dihantar'
      : 'Belum dihantar'
  );
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState(
    Boolean(student.mission5.finalVideoSubmittedAt || student.mission5.submitted)
  );

  const [linkInput, setLinkInput] = useState(
    student.mission5.finalVideoType === 'link' ? student.mission5.finalVideoUrl : ''
  );
  const [isRecording, setIsRecording] = useState(false);
  const [camMessage, setCamMessage] = useState('');
  const [reflectionError, setReflectionError] = useState('');
  const [showFinale, setShowFinale] = useState(student.mission5.submitted);
  const [showCertificate, setShowCertificate] = useState(false);

  const performanceSent = submissionStatus === 'Berjaya dihantar';
  const awardedCategory = student.evaluation?.awardCategory || AWARD_CATEGORIES[4];

  const handleStartStage = () => {
    soundEngine.playFanfare();
    const updated = { ...data, stageReady: true };
    setData(updated);
    setStageStarted(true);
    onSaveMission5(updated, false);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setCamMessage('Fail yang dipilih bukan fail video yang sah. Sila pilih fail format video (MP4, WebM atau MOV).');
      soundEngine.playGentleRetry();
      e.target.value = '';
      return;
    }

    setCamMessage('');
    soundEngine.playSuccess();
    const url = URL.createObjectURL(file);
    const updated: Mission5Data = {
      ...data,
      stageReady: true,
      finalVideoUrl: url,
      finalVideoType: 'upload',
      finalVideoLabel: `Persembahan Akhir: ${file.name}`
    };
    setData(updated);
    setSubmissionStatus('Belum dihantar');
    setSubmissionSuccessMsg(false);
    onSaveMission5(updated, false);
  };

  const handleToggleCamera = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCamMessage(
        'Peranti atau pelayar ini tidak menyokong rakaman kamera terus. Sila muat naik fail video daripada peranti kamu.'
      );
      soundEngine.playGentleRetry();
      return;
    }

    setCamMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play().catch(() => {});
      }
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        stream.getTracks().forEach((t) => t.stop());
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = null;
        }
        if (blob.size === 0) {
          setCamMessage('Rakaman video kosong atau gagal disimpan. Sila cuba rakam semula atau muat naik fail.');
          soundEngine.playGentleRetry();
          return;
        }
        const url = URL.createObjectURL(blob);
        const updated: Mission5Data = {
          ...data,
          stageReady: true,
          finalVideoUrl: url,
          finalVideoType: 'camera',
          finalVideoLabel: 'Rakaman Kamera Pentas Akhir'
        };
        setData(updated);
        setSubmissionStatus('Belum dihantar');
        setSubmissionSuccessMsg(false);
        onSaveMission5(updated, false);
        soundEngine.playSuccess();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setCamMessage(
        'Kamera tidak dapat diakses pada pelayar ini. Kamu boleh memuat naik fail video, menampal pautan atau mengaktifkan Persembahan Pentas Prototaip.'
      );
    }
  };

  const handleApplyLink = () => {
    const clean = linkInput.trim();
    if (!clean) {
      setCamMessage('Sila masukkan pautan video yang sah terlebih dahulu.');
      soundEngine.playGentleRetry();
      return;
    }
    setCamMessage('');
    soundEngine.playSuccess();
    const updated: Mission5Data = {
      ...data,
      stageReady: true,
      finalVideoUrl: clean,
      finalVideoType: 'link',
      finalVideoLabel: `Pautan Persembahan Akhir: ${clean}`
    };
    setData(updated);
    setSubmissionStatus('Belum dihantar');
    setSubmissionSuccessMsg(false);
    onSaveMission5(updated, false);
  };

  const handleUseDemoStage = () => {
    setCamMessage('');
    soundEngine.playSuccess();
    const updated: Mission5Data = {
      ...data,
      stageReady: true,
      finalVideoUrl: `demo-stage://${story.id}-final`,
      finalVideoType: 'demo',
      finalVideoLabel: `Persembahan Pentas Akhir Prototaip: ${story.title}`
    };
    setData(updated);
    setSubmissionStatus('Belum dihantar');
    setSubmissionSuccessMsg(false);
    onSaveMission5(updated, false);
  };

  const handleRemoveOrReplaceVideo = () => {
    soundEngine.playClick();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const updated: Mission5Data = {
      ...data,
      finalVideoUrl: '',
      finalVideoType: '',
      finalVideoLabel: '',
      finalVideoSubmittedAt: ''
    };
    setData(updated);
    setLinkInput('');
    setCamMessage('');
    setSubmissionStatus('Belum dihantar');
    setSubmissionSuccessMsg(false);
    onSaveMission5(updated, false);
  };

  const handleSubmitFinalPerformance = () => {
    if (isRecording) {
      setCamMessage('Sila hentikan rakaman kamera terlebih dahulu sebelum menghantar persembahan akhir.');
      soundEngine.playGentleRetry();
      return;
    }
    if (!data.finalVideoUrl) {
      setCamMessage('Sila muat naik, rakam atau aktifkan video persembahan akhir dahulu sebelum menghantar.');
      setSubmissionStatus('Belum dihantar');
      soundEngine.playGentleRetry();
      return;
    }

    setCamMessage('');
    setSubmissionStatus('Sedang diproses');

    window.setTimeout(() => {
      const submittedAt = new Date().toISOString();
      const updated: Mission5Data = {
        ...data,
        stageReady: true,
        finalVideoSubmittedAt: submittedAt
      };
      setData(updated);
      setSubmissionStatus('Berjaya dihantar');
      setSubmissionSuccessMsg(true);
      onSaveMission5(updated, false);
      soundEngine.playFanfare();
    }, 320);
  };

  const handleSubmitReflection = () => {
    const { newSkill, changesMade, proudestPart, futureGoal } = data.reflection;
    if (!newSkill.trim() || !changesMade.trim() || !proudestPart.trim() || !futureGoal.trim()) {
      setReflectionError('Sila lengkapkan keempat-empat soalan refleksi kendiri kamu.');
      soundEngine.playGentleRetry();
      return;
    }
    setReflectionError('');
    soundEngine.playFanfare();
    const updated: Mission5Data = {
      ...data,
      finalVideoSubmittedAt: data.finalVideoSubmittedAt || new Date().toISOString(),
      submitted: true
    };
    setData(updated);
    onSaveMission5(updated, true);
    setShowFinale(true);
  };

  const planSummary = [
    student.mission3.skillsToHighlight.length > 0
      ? `Fokus kemahiran: ${student.mission3.skillsToHighlight.join(', ')}`
      : null,
    student.mission3.actingDetails.characters
      ? `Watak: ${student.mission3.actingDetails.characters}`
      : null,
    student.mission3.actingDetails.props ? `Prop: ${student.mission3.actingDetails.props}` : null
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-7">
      {/* Header Misi 5 */}
      <div className="no-print rounded-3xl border-2 border-[#E5C27D] bg-gradient-to-r from-[#FFF3C4] via-[#FDE8D7] to-[#FFF3C4] p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold tracking-widest text-[#9A5B13] flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-[#B4690E]" />
            MISI 5 · PENTAS SERIBU KISAH (AKHIR)
          </p>
          <span className="rounded-lg bg-[#FFFCF4] border border-[#E5C27D] px-3 py-1 text-xs font-bold text-[#7A440B]">
            Malam Anugerah Persembahan Sastera
          </span>
        </div>

        <h1 className="mt-2 text-2xl sm:text-4xl font-bold text-[#3D2612]">
          “Setiap Murid Bintang, Setiap Cerita Bermakna!”
        </h1>

        <div className="mt-4">
          <CikguKancilBanner
            compact
            dialogue="Tahniah kerana tiba ke malam kemuncak! Rakam dan hantar persembahan akhir kamu, tonton persembahan rakan-rakan di Dewan Seribu Kisah, kemudian catat refleksi diri kamu."
          />
        </div>
      </div>

      {/* Bahagian A: Persiapan Sebelum ke Pentas */}
      <section className="no-print rounded-3xl border border-[#E5C27D] bg-[#FFFCF4] p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wider text-[#9A5B13]">
              BAHAGIAN A · PERSEDIAAN PERSEMBAHAN AKHIR
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">
              PERSIAPAN SEBELUM KE PENTAS
            </h2>
          </div>
          {!stageStarted && (
            <button
              type="button"
              onClick={handleStartStage}
              className="min-h-[48px] px-7 py-3 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm sm:text-base hover:bg-[#E5A420] whitespace-nowrap shadow-sm transition-colors"
            >
              MULA PERSEMBAHAN AKHIR
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-4 space-y-1">
            <p className="text-xs font-bold text-[#9A5B13]">Nama Murid & Kelas</p>
            <p className="font-bold text-[#3D2612]">{student.name}</p>
            <p className="text-xs text-[#6B4E31]">Kelas: {student.className}</p>
          </div>

          <div className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-4 space-y-1">
            <p className="text-xs font-bold text-[#9A5B13]">Cerita Pilihan (Misi 1) & Bentuk (Misi 3)</p>
            <p className="font-bold text-[#3D2612]">{story.title}</p>
            <p className="text-xs font-semibold text-[#8A5600]">
              Bentuk: {student.mission3.selectedStyle || 'Persembahan Kreatif'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-4 space-y-1">
            <p className="text-xs font-bold text-[#9A5B13]">Pelan Persembahan (Misi 3)</p>
            <p className="text-xs sm:text-sm text-[#4E341C] leading-relaxed">
              {planSummary || student.mission3.reason || 'Menyampaikan cerita dengan sebutan jelas, intonasi dan ekspresi yakin.'}
            </p>
          </div>

          <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-[#E5C27D] bg-[#FFF7DC] p-4 space-y-1">
            <p className="text-xs font-bold text-[#9A5B13]">Penambahbaikan daripada Misi 4</p>
            <p className="text-sm text-[#4E341C]">
              <strong className="text-[#3D2612]">
                {student.mission4.selectedWeaknesses.join(', ') || 'Sebutan & Intonasi'}:
              </strong>{' '}
              {student.mission4.improvementAction ||
                student.mission4.identifiedWeakness ||
                'Memastikan suara jelas, jeda teratur dan ekspresi lebih yakin di atas pentas.'}
            </p>
          </div>
        </div>
      </section>

      {/* Bahagian B: Rakaman Akhir & Dewan Seribu Kisah */}
      {stageStarted && (
        <section className="no-print space-y-5">
          {/* Sub-navigation between Upload Stage and Dewan Seribu Kisah */}
          <div className="rounded-2xl border border-[#E5C27D] bg-[#FAF1D4] p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div>
              <p className="text-xs font-bold tracking-wider text-[#9A5B13] px-2">
                BAHAGIAN B · DEWAN SERIBU KISAH
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveHallTab('rakam');
                }}
                className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold whitespace-nowrap inline-flex items-center gap-2 transition-colors ${
                  activeHallTab === 'rakam'
                    ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A] shadow-xs'
                    : 'bg-[#FFFCF4] text-[#4E341C] border-[#DFC792] hover:bg-[#FCEBB6]'
                }`}
              >
                <Camera className="w-4 h-4" />
                1. Rakam & Muat Naik Akhir
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveHallTab('dewan');
                }}
                className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold whitespace-nowrap inline-flex items-center gap-2 transition-colors ${
                  activeHallTab === 'dewan'
                    ? 'bg-[#F5B82E] text-[#3A2208] border-[#D4941A] shadow-xs'
                    : 'bg-[#C85470] text-white border-[#F5B82E] hover:bg-[#B4435E]'
                }`}
              >
                <Theater className="w-4 h-4" />
                2. Masuk Dewan Seribu Kisah
              </button>
            </div>
          </div>

          {/* B.1: Rakam dan Muat Naik Video Persembahan Akhir */}
          {activeHallTab === 'rakam' && (
            <div className="rounded-3xl border-2 border-[#E5C27D] bg-[#FFFCF4] overflow-hidden shadow-md">
              {/* Mini Stage Banner with Warm Golden Spotlights, Mic & Cikgu Kancil */}
              <div className="relative bg-gradient-to-r from-[#FFF3C4] via-[#FDE4EC] to-[#FFF3C4] border-b border-[#E5C27D] p-5 sm:p-7 overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{
                    background:
                      'radial-gradient(circle at 20% 0%, rgba(245,184,46,0.28), transparent 55%), radial-gradient(circle at 80% 0%, rgba(245,184,46,0.28), transparent 55%)'
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F5B82E] border-2 border-[#D4941A] flex items-center justify-center shrink-0 shadow-sm">
                      <Mic className="w-7 h-7 text-[#3A2208]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest text-[#9A5B13]">
                        PENTAS RAKAMAN AKHIR MURID
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3D2612]">
                        RAKAM PERSEMBAHAN AKHIR KAMU!
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-[#FFFCF4] border border-[#E5C27D] px-4 py-2.5 shadow-xs">
                    <img
                      src={CIKGU_KANCIL_IMAGE}
                      alt="Cikgu Kancil memberi sokongan di pentas rakaman"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-[#F5B82E]"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-[#9A5B13]">Cikgu Kancil</p>
                      <p className="text-[#4E341C]">Tarik nafas, senyum & mulakan cerita!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Metadata & Submission Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl bg-[#FAF1D4] border border-[#E2CA99] p-3">
                    <p className="text-[#6B4E31]">Nama Murid</p>
                    <p className="mt-0.5 font-bold text-[#3D2612]">{student.name}</p>
                  </div>
                  <div className="rounded-xl bg-[#FAF1D4] border border-[#E2CA99] p-3">
                    <p className="text-[#6B4E31]">Kelas</p>
                    <p className="mt-0.5 font-bold text-[#3D2612]">{student.className}</p>
                  </div>
                  <div className="rounded-xl bg-[#FAF1D4] border border-[#E2CA99] p-3">
                    <p className="text-[#6B4E31]">Tajuk Cerita & Bentuk</p>
                    <p className="mt-0.5 font-bold text-[#8A5600]">
                      {story.title} · {student.mission3.selectedStyle || 'Kreatif'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FAF1D4] border border-[#E2CA99] p-3">
                    <p className="text-[#6B4E31]">Status Penghantaran</p>
                    <p
                      className={`mt-0.5 font-bold ${
                        submissionStatus === 'Berjaya dihantar'
                          ? 'text-[#1F4B2F]'
                          : submissionStatus === 'Sedang diproses'
                          ? 'text-[#9A5B13]'
                          : 'text-[#881D38]'
                      }`}
                    >
                      {submissionStatus}
                    </p>
                  </div>
                </div>

                {/* Video Preview + Controls Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Preview Area */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="rounded-2xl border border-[#DFC792] bg-[#FAF1D4] min-h-[270px] flex flex-col items-center justify-center p-4">
                      {isRecording ? (
                        <video ref={cameraVideoRef} muted className="w-full max-h-64 rounded-xl bg-black" />
                      ) : data.finalVideoType === 'upload' || data.finalVideoType === 'camera' ? (
                        <video src={data.finalVideoUrl} controls className="w-full max-h-64 rounded-xl bg-black" />
                      ) : data.finalVideoType === 'link' ? (
                        <div className="text-center space-y-2 p-4">
                          <Link2 className="w-10 h-10 text-[#B4690E] mx-auto" />
                          <p className="text-sm font-bold text-[#3D2612]">Pautan Persembahan Akhir</p>
                          <p className="text-xs text-[#8A5600] break-all">{data.finalVideoUrl}</p>
                        </div>
                      ) : data.finalVideoType === 'demo' ? (
                        <div className="w-full relative h-52 rounded-xl overflow-hidden border border-[#E5C27D]">
                          <img
                            src={story.image}
                            alt={story.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4 text-center">
                            <Sparkles className="w-9 h-9 text-[#FDE047] mb-1.5" />
                            <p className="text-sm font-bold text-white">{data.finalVideoLabel}</p>
                            <p className="text-xs text-[#FEF08A]">
                              Mod Prototaip Aktif — Sedia Dihantar ke Dewan Seribu Kisah
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-2 text-[#6B4E31]">
                          <Video className="w-10 h-10 mx-auto text-[#B4690E]" />
                          <p className="text-sm font-semibold text-[#3D2612]">
                            Pratonton Persembahan Akhir Kamu
                          </p>
                          <p className="text-xs max-w-sm">
                            Rakam terus dengan kamera, muat naik fail video dari peranti kamu, atau guna mod prototaip untuk melihat pratonton sebelum menghantar.
                          </p>
                        </div>
                      )}
                    </div>

                    {data.finalVideoLabel && (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#1F4B2F] inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D52]" />
                          {data.finalVideoLabel}
                        </p>

                        {!performanceSent && (
                          <button
                            type="button"
                            onClick={handleRemoveOrReplaceVideo}
                            className="px-3 py-1.5 rounded-lg border border-[#E598A8] bg-[#FDE4E8] text-xs font-bold text-[#881D38] hover:bg-[#FAD0D8] inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Padam / Ganti Video
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Upload / Record / Submit Actions */}
                  <div className="lg:col-span-5 space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[46px] w-full px-4 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Muat Naik Video Akhir
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      className={`min-h-[46px] w-full px-4 py-2.5 rounded-xl border-2 font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors ${
                        isRecording
                          ? 'bg-rose-600 border-rose-400 text-white'
                          : 'bg-[#C85470] border-[#F5B82E] text-white hover:bg-[#B4435E]'
                      }`}
                    >
                      {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Camera className="w-4 h-4" />}
                      {isRecording ? 'Hentikan Rakaman Pentas' : 'Rakam Video Pentas'}
                    </button>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="Pautan video akhir (pilihan)"
                        className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-white border border-[#DCC38D] text-xs text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyLink}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFF7DF] hover:bg-[#FCEBB6] border border-[#DFC792] text-xs font-bold text-[#4E341C] transition-colors"
                      >
                        Simpan
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleUseDemoStage}
                      className="min-h-[42px] w-full px-4 py-2 rounded-xl border border-dashed border-[#D4941A] bg-[#FFF7DC] text-xs font-bold text-[#7A440B] hover:bg-[#FCEBB6] transition-colors"
                    >
                      Aktifkan Persembahan Pentas Prototaip
                    </button>

                    {camMessage && (
                      <p className="rounded-xl border border-[#E598A8] bg-[#FDE4E8] px-3 py-2 text-xs text-[#881D38]">
                        {camMessage}
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={submissionStatus === 'Sedang diproses'}
                      onClick={handleSubmitFinalPerformance}
                      className="min-h-[50px] w-full px-5 py-3 rounded-xl bg-[#4E8B63] hover:bg-[#3F7652] text-white font-bold text-sm sm:text-base transition-colors disabled:opacity-60 shadow-sm"
                    >
                      {submissionStatus === 'Sedang diproses'
                        ? 'SEDANG MEMPROSES PENGHANTARAN...'
                        : 'HANTAR PERSEMBAHAN AKHIR'}
                    </button>

                    {submissionSuccessMsg && (
                      <div className="rounded-2xl border border-[#9EC4A3] bg-[#E4EFE2] p-4 space-y-3">
                        <p className="text-xs sm:text-sm font-bold text-[#1F4B2F]">
                          “Tahniah! Persembahan akhir kamu telah berjaya dihantar ke Dewan Seribu Kisah!”
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            setActiveHallTab('dewan');
                          }}
                          className="min-h-[42px] w-full px-4 py-2 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-xs sm:text-sm hover:bg-[#E5A420] inline-flex items-center justify-center gap-2 transition-colors"
                        >
                          <Theater className="w-4 h-4" />
                          TONTON DI DEWAN SERIBU KISAH
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B.2: Dewan Seribu Kisah */}
          {activeHallTab === 'dewan' && (
            <Mission5DewanSeribuKisah
              activeStudent={student}
              allStudents={allStudents}
              onAddFinalComment={onAddFinalComment}
            />
          )}
        </section>
      )}

      {/* Bahagian C: Refleksi Kendiri */}
      {performanceSent && !showFinale && (
        <section className="no-print rounded-3xl border border-[#E5C27D] bg-[#FFFCF4] p-6 sm:p-8 space-y-5 shadow-sm animate-stage-burst">
          <div>
            <p className="text-xs font-bold tracking-wider text-[#9A5B13]">
              BAHAGIAN C · REFLEKSI KENDIRI
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">
              Catat Pengalaman Pentas Seribu Kisah Kamu
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#7A440B] mb-1.5">
                1. Apakah kemahiran baharu yang saya pelajari?
              </label>
              <textarea
                rows={3}
                value={data.reflection.newSkill}
                onChange={(e) =>
                  setData((p) => ({ ...p, reflection: { ...p.reflection, newSkill: e.target.value } }))
                }
                placeholder="Tulis kemahiran baharu yang kamu kuasai..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#7A440B] mb-1.5">
                2. Apakah perubahan yang saya lakukan selepas menerima maklum balas?
              </label>
              <textarea
                rows={3}
                value={data.reflection.changesMade}
                onChange={(e) =>
                  setData((p) => ({ ...p, reflection: { ...p.reflection, changesMade: e.target.value } }))
                }
                placeholder="Ceritakan penambahbaikan yang telah kamu buat..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#7A440B] mb-1.5">
                3. Apakah perkara yang paling saya banggakan dalam persembahan ini?
              </label>
              <textarea
                rows={3}
                value={data.reflection.proudestPart}
                onChange={(e) =>
                  setData((p) => ({ ...p, reflection: { ...p.reflection, proudestPart: e.target.value } }))
                }
                placeholder="Nyatakan detik paling membanggakan..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#7A440B] mb-1.5">
                4. Apakah yang ingin saya perbaiki pada masa akan datang?
              </label>
              <textarea
                rows={3}
                value={data.reflection.futureGoal}
                onChange={(e) =>
                  setData((p) => ({ ...p, reflection: { ...p.reflection, futureGoal: e.target.value } }))
                }
                placeholder="Tulis matlamat kamu untuk persembahan seterusnya..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
              />
            </div>
          </div>

          {reflectionError && (
            <p className="rounded-xl border border-[#E598A8] bg-[#FDE4E8] px-4 py-3 text-sm font-semibold text-[#881D38]">
              {reflectionError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmitReflection}
              className="min-h-[50px] px-8 py-3 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-base hover:bg-[#E5A420] transition-colors shadow-sm"
            >
              HANTAR REFLEKSI & TAMATKAN MISI 5
            </button>
          </div>
        </section>
      )}

      {/* Paparan Tamat Misi 5: TAHNIAH, BINTANG SERIBU KISAH! */}
      {showFinale && (
        <section className="space-y-6 animate-stage-burst">
          <div className="no-print relative rounded-3xl border-2 border-[#D4941A] bg-gradient-to-b from-[#FFF3C4] via-[#FDE8D7] to-[#FAF1D4] p-6 sm:p-10 text-center shadow-lg overflow-hidden space-y-6">
            {/* Warm Golden Spotlights */}
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(circle at 25% 0%, rgba(245,184,46,0.28), transparent 55%), radial-gradient(circle at 75% 0%, rgba(245,184,46,0.28), transparent 55%)'
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F5B82E] border-2 border-[#D4941A] text-[#3A2208] shadow-md mx-auto">
                <Trophy className="w-9 h-9" />
              </div>

              <div className="flex items-center justify-center gap-2 text-[#9A5B13]">
                <Star className="w-5 h-5 fill-[#F5B82E] text-[#D4941A]" />
                <span className="text-xs font-bold tracking-[0.22em]">
                  PENTAS SERIBU KISAH (AKHIR) SELESAI
                </span>
                <Star className="w-5 h-5 fill-[#F5B82E] text-[#D4941A]" />
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold text-[#3D2612]">
                TAHNIAH, BINTANG SERIBU KISAH!
              </h2>

              <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-[#FFFCF4] border border-[#E5C27D] p-4 text-left shadow-xs">
                <img
                  src={CIKGU_KANCIL_IMAGE}
                  alt="Cikgu Kancil mengucapkan tahniah"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-[#F5B82E] shrink-0"
                />
                <p className="text-sm sm:text-base font-semibold text-[#3D2612]">
                  “Syabas, {student.name}! Seluruh Dewan Seribu Kisah memberikan tepukan gemuruh kepada kamu kerana berjaya menghidupkan karya sastera daripada Misi 1 hingga pentas akhir!”
                </p>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              <div className="rounded-xl bg-[#FFFCF4] border border-[#E2CA99] p-4">
                <p className="text-xs text-[#6B4E31]">Nama & Kelas</p>
                <p className="mt-0.5 text-sm font-bold text-[#3D2612]">{student.name}</p>
                <p className="text-xs font-semibold text-[#9A5B13]">{student.className}</p>
              </div>
              <div className="rounded-xl bg-[#FFFCF4] border border-[#E2CA99] p-4">
                <p className="text-xs text-[#6B4E31]">Cerita Pilihan</p>
                <p className="mt-0.5 text-sm font-bold text-[#8A5600]">{story.title}</p>
              </div>
              <div className="rounded-xl bg-[#FFFCF4] border border-[#E2CA99] p-4">
                <p className="text-xs text-[#6B4E31]">Bentuk Persembahan</p>
                <p className="mt-0.5 text-sm font-bold text-[#3D2612]">
                  {student.mission3.selectedStyle || 'Persembahan Kreatif'}
                </p>
              </div>
              <div className="rounded-xl bg-[#FFFCF4] border border-[#E2CA99] p-4">
                <p className="text-xs text-[#6B4E31]">Jumlah Bintang</p>
                <p className="mt-0.5 text-xl font-bold text-[#8A5600] inline-flex items-center gap-1 tabular-nums">
                  <Star className="w-5 h-5 fill-[#F5B82E] text-[#D4941A]" />
                  {student.stars} Bintang
                </p>
              </div>
            </div>

            {/* 5 Mission Badges Earned */}
            <div className="relative z-10 rounded-2xl bg-[#FFFCF4] border border-[#E2CA99] p-5 text-left space-y-3">
              <p className="text-xs font-bold tracking-wider text-[#9A5B13] flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                LENCANA MISI YANG DIPEROLEH ({student.badges.length}/5)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {MISSION_BADGES.map((badge) => {
                  const earned = student.badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`rounded-xl border p-3 text-xs ${
                        earned
                          ? 'border-[#D4941A] bg-[#FEF0BE] text-[#3D2612]'
                          : 'border-[#E2CA99] bg-[#FAF1D4] text-[#8A6D4F] opacity-75'
                      }`}
                    >
                      <p className="font-bold text-[#9A5B13]">Misi {badge.mission}</p>
                      <p className="mt-0.5 font-bold">{badge.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Illustrated Audience Applause */}
            <div className="relative z-10 pt-2 flex flex-col items-center gap-1.5 opacity-90" aria-hidden="true">
              <div className="flex items-end justify-center gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <div key={n} className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-[#8C5E34] border border-[#D4941A]" />
                    <div className="w-7 h-4 rounded-t-full bg-[#8C5E34] border-t border-[#D4941A]" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-semibold tracking-wider text-[#7A440B]">
                TEPUKAN GEMURUH PENONTON DEWAN SERIBU KISAH
              </p>
            </div>

            {/* Finale Action Buttons */}
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowCertificate((s) => !s);
                }}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#FFF7DF] border-2 border-[#D4941A] text-[#3D2612] font-bold text-sm hover:bg-[#FCEBB6] inline-flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#B4690E]" />
                {showCertificate ? 'SEMBUNYI SIJIL' : 'LIHAT SIJIL'}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowCertificate(true);
                  window.setTimeout(() => window.print(), 120);
                }}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] inline-flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <Printer className="w-4 h-4" />
                CETAK SIJIL
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onBackToMap();
                }}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#C85470] border border-[#D4941A] text-white font-bold text-sm hover:bg-[#B4435E] inline-flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <Compass className="w-4 h-4 text-[#FEF08A]" />
                KEMBALI KE PETA PENGEMBARAAN
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onFinishToGallery();
                }}
                className="min-h-[48px] px-5 py-2.5 rounded-xl border border-[#DFC792] bg-[#FFFCF4] text-[#3D2612] font-bold text-sm hover:bg-[#FCEBB6] inline-flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#B4690E]" />
                GALERI BINTANG SASTERA
              </button>
            </div>
          </div>

          {/* Inline Printable Digital Certificate */}
          {showCertificate && (
            <div className="print-certificate rounded-3xl border-4 border-double border-[#D97706] bg-[#FFFBEB] text-[#3D2612] p-8 sm:p-12 shadow-xl text-center space-y-5">
              <div className="flex items-center justify-center gap-2 text-[#B45309]">
                <Award className="w-8 h-8" />
                <span className="text-xs font-bold tracking-[0.25em]">KARYA SASTERA HIDUP!</span>
                <Award className="w-8 h-8" />
              </div>

              <h3 className="text-3xl sm:text-4xl font-bold text-[#7F1D1D] tracking-wide">
                SIJIL BINTANG SERIBU KISAH
              </h3>

              <p className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-[#4E341C]">
                “Dengan ini diperakui bahawa{' '}
                <strong className="text-[#7F1D1D] underline decoration-[#D97706] underline-offset-4">
                  {student.name}
                </strong>{' '}
                ({student.className}) telah berjaya menyelesaikan kesemua lima misi dalam{' '}
                <strong>KARYA SASTERA HIDUP!</strong> dan menamatkan persembahan akhir di{' '}
                <strong>Pentas Seribu Kisah</strong> dengan cemerlang.”
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-3 text-sm">
                <div className="rounded-xl bg-[#FEF3C7] border border-[#D97706]/30 p-3">
                  <p className="text-xs font-bold text-[#92400E]">Karya Pilihan</p>
                  <p className="font-bold text-[#3D2612]">{story.title}</p>
                </div>
                <div className="rounded-xl bg-[#FEF3C7] border border-[#D97706]/30 p-3">
                  <p className="text-xs font-bold text-[#92400E]">Anugerah Khas</p>
                  <p className="font-bold text-[#3D2612]">{awardedCategory}</p>
                </div>
                <div className="rounded-xl bg-[#FEF3C7] border border-[#D97706]/30 p-3">
                  <p className="text-xs font-bold text-[#92400E]">Jumlah Bintang</p>
                  <p className="font-bold text-[#3D2612] tabular-nums">{student.stars} Bintang</p>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between max-w-2xl mx-auto border-t border-[#D97706]/30 gap-4 text-xs text-[#6B4E31]">
                <div>
                  <p className="font-bold text-[#3D2612]">Cikgu Kancil</p>
                  <p>Pemandu Dunia Teater Fantasi</p>
                </div>
                <div>
                  <p className="font-bold text-[#3D2612]">Tarikh Perakuan</p>
                  <p className="tabular-nums">{new Date().toLocaleDateString('ms-MY')}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
