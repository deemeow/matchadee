import { ChangeEvent, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Link2,
  Sparkles,
  Square,
  Upload,
  Video
} from 'lucide-react';
import { STORIES } from '../data/stories';
import { FeedbackComment, Mission4Data, StudentRecord } from '../types';
import { CikguKancilBanner } from './CikguKancilGuide';
import Mission4TrialGallery from './Mission4TrialGallery';
import TheaterStage3D from './TheaterStage3D';
import { soundEngine } from '../utils/sound';

interface Mission4ViewProps {
  student: StudentRecord;
  allStudents: StudentRecord[];
  onSaveMission4: (data: Mission4Data, finalize: boolean) => void;
  onAddCommentToRecording: (targetStudentId: string, comment: FeedbackComment) => void;
  onBackToMap: () => void;
}

const ASPECT_CARDS = [
  { id: 'Sebutan', label: '1. Sebutan', desc: 'Kejelasan bunyi huruf dan suku kata.' },
  { id: 'Intonasi', label: '2. Intonasi', desc: 'Turun naik nada suara mengikut emosi.' },
  { id: 'Ekspresi', label: '3. Ekspresi', desc: 'Mimik muka dan penghayatan perasaan.' },
  { id: 'Gaya persembahan', label: '4. Gaya persembahan', desc: 'Postur badan, gerak tangan dan keyakinan.' }
];

export default function Mission4View({
  student,
  allStudents,
  onSaveMission4,
  onAddCommentToRecording,
  onBackToMap
}: Mission4ViewProps) {
  const story = STORIES.find((s) => s.id === student.selectedStoryId) || STORIES[0];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [data, setData] = useState<Mission4Data>(student.mission4);
  const [videoLinkInput, setVideoLinkInput] = useState(
    student.mission4.trialVideoType === 'link' ? student.mission4.trialVideoUrl : ''
  );
  const [isRecordingCam, setIsRecordingCam] = useState(false);
  const [camMessage, setCamMessage] = useState('');

  const [transformActive, setTransformActive] = useState(student.mission4.saved);
  const [formError, setFormError] = useState('');

  const handleUploadVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundEngine.playSuccess();
    const objectUrl = URL.createObjectURL(file);
    const updated: Mission4Data = {
      ...data,
      trialVideoUrl: objectUrl,
      trialVideoType: 'upload',
      trialVideoLabel: `Fail dimuat naik: ${file.name}`,
      trialVideoUploadedAt: new Date().toISOString()
    };
    setData(updated);
    onSaveMission4(updated, false);
  };

  const handleToggleCamera = async () => {
    if (isRecordingCam) {
      mediaRecorderRef.current?.stop();
      setIsRecordingCam(false);
      return;
    }

    setCamMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (cameraPreviewRef.current) {
        cameraPreviewRef.current.srcObject = stream;
        cameraPreviewRef.current.play().catch(() => {});
      }
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        if (cameraPreviewRef.current) {
          cameraPreviewRef.current.srcObject = null;
        }
        const updated: Mission4Data = {
          ...data,
          trialVideoUrl: url,
          trialVideoType: 'camera',
          trialVideoLabel: 'Rakaman Kamera Percubaan (Sesi Semasa)',
          trialVideoUploadedAt: new Date().toISOString()
        };
        setData(updated);
        onSaveMission4(updated, false);
        soundEngine.playSuccess();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingCam(true);
    } catch {
      setCamMessage(
        'Kamera tidak dapat diakses dalam persekitaran pelayar ini. Kamu boleh menggunakan butang Muat Naik Video, memasukkan pautan video atau memilih Simulasi Rakaman Prototaip di bawah.'
      );
    }
  };

  const handleSaveVideoLink = () => {
    if (!videoLinkInput.trim()) return;
    soundEngine.playSuccess();
    const updated: Mission4Data = {
      ...data,
      trialVideoUrl: videoLinkInput.trim(),
      trialVideoType: 'link',
      trialVideoLabel: `Pautan Video: ${videoLinkInput.trim()}`,
      trialVideoUploadedAt: new Date().toISOString()
    };
    setData(updated);
    onSaveMission4(updated, false);
  };

  const handleUseDemoClip = () => {
    soundEngine.playSuccess();
    const updated: Mission4Data = {
      ...data,
      trialVideoUrl: `demo-stage://${story.id}`,
      trialVideoType: 'demo',
      trialVideoLabel: `Prototaip Rakaman Latihan: ${story.title}`,
      trialVideoUploadedAt: new Date().toISOString()
    };
    setData(updated);
    onSaveMission4(updated, false);
  };

  const toggleWeakness = (aspect: string) => {
    soundEngine.playClick();
    setData((prev) => {
      const exists = prev.selectedWeaknesses.includes(aspect);
      return {
        ...prev,
        selectedWeaknesses: exists
          ? prev.selectedWeaknesses.filter((w) => w !== aspect)
          : [...prev.selectedWeaknesses, aspect]
      };
    });
  };

  const updateBeforeAfter = (
    key: keyof Mission4Data['beforeAfter'],
    field: 'before' | 'after',
    val: string
  ) => {
    setData((prev) => ({
      ...prev,
      beforeAfter: {
        ...prev.beforeAfter,
        [key]: {
          ...prev.beforeAfter[key],
          [field]: val
        }
      }
    }));
  };

  const handleSaveTransformation = () => {
    if (!data.trialVideoUrl) {
      setFormError('Sila muat naik video percubaan, rakam kamera atau aktifkan simulasi prototaip di Bahagian A.');
      soundEngine.playGentleRetry();
      return;
    }
    if (data.selectedWeaknesses.length === 0 || !data.identifiedWeakness.trim() || !data.improvementAction.trim()) {
      setFormError('Sila pilih aspek kelemahan serta lengkapkan kedua-dua ruangan jawapan di Bahagian C.');
      soundEngine.playGentleRetry();
      return;
    }

    setFormError('');
    soundEngine.playFanfare();
    setTransformActive(true);
    onSaveMission4({ ...data, saved: true }, true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-7">
      {/* Header */}
      <div className="rounded-3xl border border-[#E5C27D] bg-gradient-to-r from-[#FFF3C4] via-[#FDE8D7] to-[#FFF3C4] p-6 sm:p-8 shadow-lg">
        <p className="text-xs font-bold tracking-widest text-[#9A5B13]">
          MISI 4 · BENGKEL TRANSFORMASI PERSEMBAHAN
        </p>
        <h1 className="mt-1 text-2xl sm:text-4xl font-bold text-[#3D2612]">
          PERSEMBAHAN PERTAMA KAMU!
        </h1>
        <div className="mt-4">
          <CikguKancilBanner
            compact
            dialogue="Setiap penggiat seni memerlukan latihan. Jangan takut membuat kesilapan kerana maklum balas akan membantu kamu menjadi lebih baik!"
          />
        </div>
      </div>

      {/* Bahagian A: Trial Recording */}
      <section className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#EDE0BC]">
          <div>
            <p className="text-xs font-bold tracking-wider text-[#9A5B13]">BAHAGIAN A · RAKAMAN PERCUBAAN</p>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">Muat Naik & Semak Latihan Pertama</h2>
          </div>
          <span className="text-xs font-semibold text-[#6B4E31]">Prototaip Storan Setempat Pelayar</span>
        </div>

        {/* Summary strip from Misi 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl border border-[#E2CA99] bg-[#FAF1D4] p-4 text-sm">
          <div>
            <p className="text-xs text-[#6B4E31]">Nama Murid</p>
            <p className="font-bold text-[#3D2612]">{student.name}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B4E31]">Cerita Pilihan</p>
            <p className="font-bold text-[#8A5600]">{story.title}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B4E31]">Bentuk Persembahan</p>
            <p className="font-bold text-[#3D2612]">{student.mission3.selectedStyle || 'Belum dipilih'}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B4E31]">Fokus Kemahiran</p>
            <p className="font-semibold text-[#1F4B2F]">
              {student.mission3.skillsToHighlight.join(', ') || 'Suara & Intonasi'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <div className="rounded-2xl border border-[#DFC792] bg-[#FAF1D4] overflow-hidden min-h-[260px] flex flex-col items-center justify-center p-4">
              {isRecordingCam ? (
                <video ref={cameraPreviewRef} muted className="w-full max-h-64 rounded-xl bg-black" />
              ) : data.trialVideoType === 'upload' || data.trialVideoType === 'camera' ? (
                <video src={data.trialVideoUrl} controls className="w-full max-h-64 rounded-xl bg-black" />
              ) : data.trialVideoType === 'link' ? (
                <div className="text-center space-y-2 p-4">
                  <Link2 className="w-10 h-10 text-[#B4690E] mx-auto" />
                  <p className="text-sm font-bold text-[#3D2612]">Pautan Video Percubaan Disimpan</p>
                  <p className="text-xs text-[#8A5600] break-all">{data.trialVideoUrl}</p>
                </div>
              ) : data.trialVideoType === 'demo' ? (
                <div className="w-full text-center space-y-3">
                  <div className="relative h-44 rounded-xl overflow-hidden border border-[#E5C27D]">
                    <img
                      src={story.image}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4">
                      <Video className="w-9 h-9 text-[#FDE047] mb-1.5" />
                      <p className="text-sm font-bold text-white">{data.trialVideoLabel}</p>
                      <p className="text-xs text-[#FEF08A]">
                        Pratonton Prototaip Pentas Latihan · {student.mission3.selectedStyle || 'Persembahan'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 text-[#6B4E31]">
                  <Video className="w-10 h-10 mx-auto text-[#B4690E]" />
                  <p className="text-sm font-semibold text-[#3D2612]">Ruang Pratonton Video Percubaan</p>
                  <p className="text-xs max-w-sm">
                    Muat naik fail video, rakam menggunakan kamera atau pilih mod prototaip untuk menguji aliran komen.
                  </p>
                </div>
              )}
            </div>
            {data.trialVideoLabel && (
              <p className="text-xs font-semibold text-[#1F4B2F] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D52]" />
                {data.trialVideoLabel}
              </p>
            )}
          </div>

          <div className="lg:col-span-5 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleUploadVideo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[46px] w-full px-4 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              MUAT NAIK VIDEO PERCUBAAN
            </button>

            <button
              type="button"
              onClick={handleToggleCamera}
              className={`min-h-[46px] w-full px-4 py-2.5 rounded-xl border-2 font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors ${
                isRecordingCam
                  ? 'bg-rose-600 border-rose-400 text-white'
                  : 'bg-[#C85470] border-[#F5B82E] text-white hover:bg-[#B4435E]'
              }`}
            >
              {isRecordingCam ? <Square className="w-4 h-4 fill-current" /> : <Camera className="w-4 h-4" />}
              {isRecordingCam ? 'Hentikan Rakaman Kamera' : 'Rakam Terus (Kamera)'}
            </button>

            <div className="pt-2 space-y-2">
              <label className="block text-xs font-bold text-[#7A440B]">
                Atau tampal pautan video (Prototaip):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={videoLinkInput}
                  onChange={(e) => setVideoLinkInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-white border border-[#DCC38D] text-xs text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
                />
                <button
                  type="button"
                  onClick={handleSaveVideoLink}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFF7DF] hover:bg-[#FCEBB6] border border-[#DFC792] text-xs font-bold text-[#4E341C] transition-colors"
                >
                  Guna
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUseDemoClip}
              className="min-h-[42px] w-full px-4 py-2 rounded-xl border border-dashed border-[#D4941A] bg-[#FFF7DC] text-xs font-bold text-[#7A440B] hover:bg-[#FCEBB6] transition-colors"
            >
              Gunakan Video Simulasi Prototaip
            </button>

            {camMessage && (
              <p className="rounded-xl border border-[#EAB892] bg-[#FCEAD8] px-3 py-2 text-xs text-[#7A3A1E] leading-relaxed">
                {camMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Bahagian B: Galeri Koleksi Rakaman Percubaan & Komen Yang Saya Terima */}
      <Mission4TrialGallery
        activeStudent={student}
        allStudents={allStudents}
        onAddCommentToRecording={onAddCommentToRecording}
      />

      {/* Bahagian C: Identify Weaknesses */}
      <section className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 sm:p-8 space-y-5 shadow-sm">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#9A5B13]">BAHAGIAN C · REFLEKSI LATIHAN</p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">APA YANG BOLEH SAYA PERBAIKI?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ASPECT_CARDS.map((card) => {
            const selected = data.selectedWeaknesses.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => toggleWeakness(card.id)}
                className={`text-left rounded-2xl border p-4 transition-colors ${
                  selected
                    ? 'border-[#D4941A] bg-[#FEF0BE] shadow-sm'
                    : 'border-[#E2CA99] bg-[#FAF1D4] hover:border-[#D4941A]'
                }`}
              >
                <p className="text-sm font-bold text-[#8A5600]">{card.label}</p>
                <p className="mt-1 text-xs text-[#4E341C]">{card.desc}</p>
                <p className={`mt-2 text-xs font-bold ${selected ? 'text-[#235334]' : 'text-[#6B4E31]'}`}>
                  {selected ? '✓ Dipilih untuk diperbaiki' : 'Klik untuk pilih'}
                </p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#7A440B] mb-1.5">
              Kelemahan yang saya kenal pasti:
            </label>
            <textarea
              rows={3}
              value={data.identifiedWeakness}
              onChange={(e) => setData((p) => ({ ...p, identifiedWeakness: e.target.value }))}
              placeholder="Contoh: Suara saya agak laju semasa dialog penting..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#7A440B] mb-1.5">
              Tindakan yang akan saya lakukan untuk memperbaikinya:
            </label>
            <textarea
              rows={3}
              value={data.improvementAction}
              onChange={(e) => setData((p) => ({ ...p, improvementAction: e.target.value }))}
              placeholder="Contoh: Saya akan berhenti seketika pada tanda koma dan menguatkan suara..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCC38D] text-sm text-[#3D2612] placeholder:text-[#9C7F5E] focus:outline-none focus:border-[#D9911E]"
            />
          </div>
        </div>
      </section>

      {/* Bahagian D: Before & After Transformation Table */}
      <section className="rounded-3xl border border-[#E5C27D] bg-[#FFFCF4] p-6 sm:p-8 space-y-5 shadow-sm">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#9A5B13]">BAHAGIAN D · TRANSFORMASI SEBELUM & SELEPAS</p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#3D2612]">Pelan Lonjakan ke Pentas Akhir</h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E2CA99]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6E8BE] text-xs font-bold uppercase tracking-wider text-[#6B4211]">
                <th className="p-3.5 w-44">Aspek</th>
                <th className="p-3.5">Persembahan percubaan</th>
                <th className="p-3.5">Penambahbaikan saya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0BC] bg-[#FFFCF4] text-sm">
              {(
                [
                  ['sebutan', 'Sebutan'],
                  ['intonasi', 'Intonasi'],
                  ['ekspresi', 'Ekspresi'],
                  ['gaya', 'Gaya persembahan']
                ] as [keyof Mission4Data['beforeAfter'], string][]
              ).map(([key, label]) => (
                <tr key={key}>
                  <td className="p-3.5 font-bold text-[#3D2612]">{label}</td>
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={data.beforeAfter[key].before}
                      onChange={(e) => updateBeforeAfter(key, 'before', e.target.value)}
                      placeholder="Keadaan semasa percubaan..."
                      className="w-full min-h-[40px] px-3 py-1.5 rounded-lg bg-white border border-[#DCC38D] text-[#3D2612] placeholder:text-[#9C7F5E] text-xs sm:text-sm focus:outline-none focus:border-[#D9911E]"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={data.beforeAfter[key].after}
                      onChange={(e) => updateBeforeAfter(key, 'after', e.target.value)}
                      placeholder="Sasaran penambahbaikan..."
                      className="w-full min-h-[40px] px-3 py-1.5 rounded-lg bg-[#FFFBEB] border border-[#D4941A] text-[#3D2612] placeholder:text-[#9C7F5E] text-xs sm:text-sm focus:outline-none focus:border-[#B4690E]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {formError && (
          <p className="rounded-xl border border-[#E598A8] bg-[#FDE4E8] px-4 py-3 text-sm font-semibold text-[#881D38]">
            {formError}
          </p>
        )}

        {!transformActive ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveTransformation}
              className="min-h-[48px] px-7 py-3 rounded-xl bg-[#C85470] border-2 border-[#F5B82E] text-white font-bold text-base hover:bg-[#B4435E] transition-colors shadow-sm"
            >
              SIMPAN PELAN PENAMBAHBAIKAN
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-[#D4941A] overflow-hidden relative shadow-xl animate-stage-burst">
            <div className="h-64 relative">
              <TheaterStage3D mode="finale" curtainsOpen={true} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3D2612]/90 via-[#3D2612]/50 to-transparent flex flex-col items-center justify-end p-6 text-center">
                <Sparkles className="w-9 h-9 text-[#FDE047] mb-2" />
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Transformasi Pentas Berjaya!
                </h3>
                <p className="mt-1 text-sm text-[#FEF08A] max-w-xl">
                  Cahaya keemasan pentas kini bersinar! Kamu memperoleh Lencana <strong>BINTANG YANG BERKEMBANG</strong> dan <strong>+20 Bintang</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onBackToMap();
                  }}
                  className="mt-4 min-h-[44px] px-6 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] transition-colors"
                >
                  Kembali ke Peta & Buka Pentas Teater Akhir
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
