import { useState } from 'react';
import { Award, Compass, Printer, Sparkles, Star, Trophy } from 'lucide-react';
import { AWARD_CATEGORIES, CIKGU_KANCIL_IMAGE, MISSION_BADGES, STORIES } from '../data/stories';
import { StudentRecord } from '../types';
import { soundEngine } from '../utils/sound';

interface StarGalleryViewProps {
  student: StudentRecord;
  onBackToMap: () => void;
}

export default function StarGalleryView({ student, onBackToMap }: StarGalleryViewProps) {
  const story = STORIES.find((s) => s.id === student.selectedStoryId) || STORIES[0];
  const [showCertificate, setShowCertificate] = useState(true);

  const awardedCategory = student.evaluation?.awardCategory || 'Bintang Kreativiti Persembahan';

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-7">
      {/* Awards Ceremony Stage Header */}
      <section className="no-print rounded-3xl border-2 border-[#D4941A] bg-gradient-to-r from-[#FFF3C4] via-[#FDE8D7] to-[#FFF3C4] p-6 sm:p-10 text-center shadow-lg space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] mx-auto shadow-md">
          <Trophy className="w-9 h-9" />
        </div>
        <p className="text-xs font-bold tracking-[0.2em] text-[#9A5B13]">
          GALERI BINTANG SASTERA · MAJLIS ANUGERAH PENTAS TEATER
        </p>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#3D2612]">
          TAHNIAH! KAMU TELAH MENGHIDUPKAN KARYA SASTERA!
        </h1>

        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-[#FFFCF4] border border-[#E5C27D] p-4 text-left shadow-sm">
          <img
            src={CIKGU_KANCIL_IMAGE}
            alt="Cikgu Kancil mengucapkan tahniah"
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover border border-[#F5B82E] shrink-0"
          />
          <p className="text-sm sm:text-base font-semibold text-[#3D2612]">
            “Tahniah, {student.name}! Kamu telah membuktikan bahawa setiap karya sastera menjadi hidup apabila disampaikan dengan hati dan keberanian.”
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
          <div className="rounded-xl bg-[#FFFCF4] border border-[#E5CFA0] p-3.5">
            <p className="text-xs text-[#6B4E31]">Nama Murid</p>
            <p className="mt-0.5 text-sm font-bold text-[#3D2612]">{student.name}</p>
          </div>
          <div className="rounded-xl bg-[#FFFCF4] border border-[#E5CFA0] p-3.5">
            <p className="text-xs text-[#6B4E31]">Cerita Dipersembahkan</p>
            <p className="mt-0.5 text-sm font-bold text-[#9A5B13]">{story.title}</p>
          </div>
          <div className="rounded-xl bg-[#FFFCF4] border border-[#E5CFA0] p-3.5">
            <p className="text-xs text-[#6B4E31]">Bentuk Persembahan</p>
            <p className="mt-0.5 text-sm font-bold text-[#3D2612]">
              {student.mission3.selectedStyle || 'Persembahan Kreatif'}
            </p>
          </div>
          <div className="rounded-xl bg-[#FFFCF4] border border-[#E5CFA0] p-3.5">
            <p className="text-xs text-[#6B4E31]">Jumlah Bintang</p>
            <p className="mt-0.5 text-lg font-bold text-[#8A5600] inline-flex items-center gap-1 tabular-nums">
              <Star className="w-5 h-5 fill-[#F5B82E] text-[#D4941A]" />
              {student.stars}
            </p>
          </div>
        </div>
      </section>

      {/* Five Mission Badges & Five Award Categories */}
      <section className="no-print grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-[#3D2612] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#9A5B13]" />
            Lima Lencana Misi Diperoleh
          </h2>
          <div className="space-y-2.5">
            {MISSION_BADGES.map((b) => {
              const earned = student.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3 ${
                    earned ? 'border-[#D4941A] bg-[#FAF1D4]' : 'border-[#E2CA99] bg-[#FAF1D4]/50 opacity-55'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-[#9A5B13]">Misi {b.mission}</p>
                    <p className="text-sm font-bold text-[#3D2612]">{b.title}</p>
                  </div>
                  <span className="text-xs font-bold text-[#235334] tabular-nums">+{b.stars}★</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-[#3D2612] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#9A5B13]" />
            Lima Kategori Penghargaan Pentas
          </h2>
          <div className="space-y-2.5">
            {AWARD_CATEGORIES.map((cat) => {
              const isAwarded = cat === awardedCategory;
              return (
                <div
                  key={cat}
                  className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3 ${
                    isAwarded
                      ? 'border-2 border-[#D4941A] bg-gradient-to-r from-[#FFF3C4] to-[#FDE4EC]'
                      : 'border-[#E2CA99] bg-[#FAF1D4]/65'
                  }`}
                >
                  <span className="text-sm font-bold text-[#3D2612]">{cat}</span>
                  {isAwarded && (
                    <span className="text-xs font-bold text-[#9A5B13]">Anugerah Pilihan</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Performance & Reflection Summary */}
      <section className="no-print grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 space-y-3 shadow-sm">
          <h2 className="text-xl font-bold text-[#3D2612]">Persembahan Akhir Kamu</h2>
          {student.mission5.finalVideoType === 'upload' || student.mission5.finalVideoType === 'camera' ? (
            <video src={student.mission5.finalVideoUrl} controls className="w-full rounded-xl max-h-60 bg-black" />
          ) : (
            <div className="relative h-48 rounded-xl overflow-hidden border border-[#E5C27D]">
              <img src={story.image} alt={story.title} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-4 text-center">
                <p className="text-sm font-bold text-white">
                  {student.mission5.finalVideoLabel || `Persembahan Akhir: ${story.title}`}
                </p>
                {student.mission5.finalVideoUrl && (
                  <p className="mt-1 text-xs text-[#FDE68A] break-all">{student.mission5.finalVideoUrl}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-[#E5CFA0] bg-[#FFFCF4] p-6 space-y-3 text-sm shadow-sm">
          <h2 className="text-xl font-bold text-[#3D2612]">Refleksi Kendiri Murid</h2>
          <div className="space-y-2 text-[#4E341C]">
            <p><strong className="text-[#3D2612]">Kemahiran baharu:</strong> {student.mission5.reflection.newSkill || '-'}</p>
            <p><strong className="text-[#3D2612]">Perubahan selepas maklum balas:</strong> {student.mission5.reflection.changesMade || '-'}</p>
            <p><strong className="text-[#3D2612]">Perkara paling dibanggakan:</strong> {student.mission5.reflection.proudestPart || '-'}</p>
            <p><strong className="text-[#3D2612]">Sasaran masa hadapan:</strong> {student.mission5.reflection.futureGoal || '-'}</p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="no-print flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setShowCertificate((s) => !s);
          }}
          className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#FFF7DF] border border-[#D4941A] text-[#7A440B] font-bold text-sm hover:bg-[#FCEBB6]"
        >
          {showCertificate ? 'SEMBUNYI SIJIL' : 'LIHAT SIJIL'}
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setShowCertificate(true);
            setTimeout(() => window.print(), 100);
          }}
          className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#F5B82E] border border-[#D4941A] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] inline-flex items-center gap-2 shadow-sm"
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
          className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#C85470] hover:bg-[#B4435E] border border-[#F5B82E] text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm"
        >
          <Compass className="w-4 h-4 text-[#FDE68A]" />
          LIHAT SEMULA PETA PENGEMBARAAN
        </button>
      </div>

      {/* Digital Certificate */}
      {showCertificate && (
        <section className="print-certificate rounded-3xl border-4 border-double border-[#D97706] bg-[#FFFBEB] text-[#3D2612] p-8 sm:p-12 shadow-xl text-center space-y-5">
          <div className="flex items-center justify-center gap-2 text-[#B45309]">
            <Award className="w-8 h-8" />
            <span className="text-xs font-bold tracking-[0.25em]">KARYA SASTERA HIDUP!</span>
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-[#7F1D1D] tracking-wide">
            SIJIL BINTANG SASTERA
          </h2>

          <p className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-[#4E341C]">
            “Dengan ini diperakui bahawa{' '}
            <strong className="text-[#7F1D1D] underline decoration-[#D97706] underline-offset-4">
              {student.name}
            </strong>{' '}
            ({student.className}) telah berjaya menyelesaikan lima misi dalam{' '}
            <strong>KARYA SASTERA HIDUP!</strong> dan berjaya menghidupkan karya sastera melalui persembahan kreatif.”
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
        </section>
      )}
    </div>
  );
}
