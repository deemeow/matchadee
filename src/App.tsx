import { useState } from 'react';
import { AppScreen } from './types';
import { useAppStore } from './store/useAppStore';
import { soundEngine } from './utils/sound';
import {
  RegisterStudentScreen,
  RegisterTeacherScreen,
  RoleSelectScreen,
  TitleScreen
} from './components/IntroAndAuthViews';
import GameHud from './components/GameHud';
import StudentAdventureMap from './components/StudentAdventureMap';
import Mission1View from './components/Mission1View';
import Mission2View from './components/Mission2View';
import Mission3View from './components/Mission3View';
import Mission4View from './components/Mission4View';
import Mission5View from './components/Mission5View';
import StarGalleryView from './components/StarGalleryView';
import TeacherDashboardView from './components/TeacherDashboardView';
import { HelpModal } from './components/CikguKancilGuide';
import { SharedForestBackground } from './components/EnchantedForestStage';

function getHelpContent(screen: AppScreen): { title: string; tips: string[] } {
  switch (screen) {
    case 'MISSION_1':
      return {
        title: 'Panduan Misi 1: Perpustakaan Sastera Ajaib',
        tips: [
          'Klik butang "BACA CERITA" pada salah satu daripada tujuh kad cerita rakyat.',
          'Gunakan butang saiz tulisan (+ / -) atau "DENGAR CERITA" jika ingin mendengar bacaan.',
          'Selepas membaca hingga akhir, klik "SELESAI MEMBACA!" untuk membuka Misi 2 dan memperoleh 10 bintang.'
        ]
      };
    case 'MISSION_2':
      return {
        title: 'Panduan Misi 2: Studio Detektif Persembahan',
        tips: [
          'Mainkan ketiga-tiga video persembahan (Bacaan Biasa, Bacaan Ekspresif dan Lakonan) hingga selesai ditonton.',
          'Setelah ketiga-tiga berstatus "Selesai ditonton", jawab semua empat soalan dalam Kuiz Detektif.',
          'Baca maklum balas Cikgu Kancil selepas setiap jawapan untuk memahami ciri persembahan yang hebat.'
        ]
      };
    case 'MISSION_3':
      return {
        title: 'Panduan Misi 3: Makmal Persembahan',
        tips: [
          'Lengkapkan lima stesen latihan mengikut turutan dari Stesen 1 hingga Stesen 5.',
          'Dalam Stesen 3 (Rahsia Jeda), klik pada perkataan untuk meletakkan tanda berhenti (/).',
          'Di bahagian Studio Pengarah Muda, pilih gaya persembahan dan simpan pelan kamu.'
        ]
      };
    case 'MISSION_4':
      return {
        title: 'Panduan Misi 4: Bengkel Transformasi',
        tips: [
          'Muat naik video percubaan, rakam menggunakan kamera atau guna Mod Simulasi Prototaip.',
          'Kumpulkan maklum balas rakan dan guru yang sopan serta membina.',
          'Pilih aspek yang ingin diperbaiki, isi jadual sebelum dan selepas, kemudian klik "SIMPAN PELAN PENAMBAHBAIKAN".'
        ]
      };
    case 'MISSION_5':
      return {
        title: 'Panduan Misi 5: Pentas Seribu Kisah (Akhir)',
        tips: [
          'Semak senarai persediaan kamu dan tekan "MULA PERSEMBAHAN AKHIR".',
          'Rakam atau muat naik persembahan akhir, tekan "HANTAR PERSEMBAHAN AKHIR" dan tonton persembahan rakan di Dewan Seribu Kisah.',
          'Lengkapkan keempat-empat soalan refleksi kendiri untuk membuka sijil dan tamat pengembaraan!'
        ]
      };
    case 'STAR_GALLERY':
      return {
        title: 'Panduan Galeri Bintang & Sijil',
        tips: [
          'Lihat lencana pencapaian dan kategori anugerah bintang kamu.',
          'Klik "CETAK SIJIL" untuk menyimpan atau mencetak Sijil Bintang Sastera.',
          'Klik "LIHAT SEMULA PETA PENGEMBARAAN" untuk meninjau semula misi kamu.'
        ]
      };
    default:
      return {
        title: 'Panduan Peta Pengembaraan',
        tips: [
          'Selesaikan lima misi secara berurutan dari Misi 1 hingga Misi 5.',
          'Klik butang "TERUSKAN MISI" untuk menyambung lokasi aktif kamu sekarang.',
          'Gunakan "Menu Misi" di bahagian atas pada bila-bila masa untuk bergerak antara lokasi yang telah dibuka.'
        ]
      };
  }
}

export default function App() {
  const {
    teacherName,
    students,
    activeStudent,
    registerStudent,
    selectStudentProfile,
    setTeacherName,
    completeMission1,
    saveMission2,
    updateMission3Plan,
    updateMission4Data,
    updateMission5Data,
    addPeerCommentToStudent,
    saveTeacherFeedbackForStudent,
    saveTeacherEvaluation,
    addFinalCommentToStudent,
    toggleFinalDownloadPermission,
    updateMapProgress
  } = useAppStore();

  const [screen, setScreen] = useState<AppScreen>('TITLE');
  const [muted, setMuted] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [justUnlockedMission, setJustUnlockedMission] = useState<number | null>(null);

  const toggleMute = () => {
    const next = !muted;
    soundEngine.muted = next;
    setMuted(next);
    if (!next) soundEngine.playClick();
  };

  const handleBackNavigation = () => {
    if (screen === 'STUDENT_MAP') {
      setScreen('ROLE_SELECT');
    } else if (
      screen === 'MISSION_1' ||
      screen === 'MISSION_2' ||
      screen === 'MISSION_3' ||
      screen === 'MISSION_4' ||
      screen === 'MISSION_5' ||
      screen === 'STAR_GALLERY'
    ) {
      setScreen('STUDENT_MAP');
    } else {
      setScreen('TITLE');
    }
  };

  if (screen === 'TITLE') {
    return <TitleScreen onStart={() => setScreen('ROLE_SELECT')} />;
  }

  if (screen === 'ROLE_SELECT') {
    return (
      <RoleSelectScreen
        onSelectTeacher={() => setScreen('REGISTER_TEACHER')}
        onSelectStudent={() => setScreen('REGISTER_STUDENT')}
        onBack={() => setScreen('TITLE')}
      />
    );
  }

  if (screen === 'REGISTER_STUDENT') {
    return (
      <RegisterStudentScreen
        existingStudents={students}
        onRegister={(name, className) => {
          registerStudent(name, className);
        }}
        onSelectExisting={(id) => {
          if (id !== '__ACTIVE__') {
            selectStudentProfile(id);
          }
          setScreen('STUDENT_MAP');
        }}
        onBack={() => setScreen('ROLE_SELECT')}
      />
    );
  }

  if (screen === 'REGISTER_TEACHER') {
    return (
      <RegisterTeacherScreen
        defaultName={teacherName}
        onEnter={(name) => {
          setTeacherName(name);
          setScreen('TEACHER_DASHBOARD');
        }}
        onBack={() => setScreen('ROLE_SELECT')}
      />
    );
  }

  if (screen === 'TEACHER_DASHBOARD') {
    return (
      <TeacherDashboardView
        teacherName={teacherName}
        students={students}
        onSaveTeacherFeedback={saveTeacherFeedbackForStudent}
        onSaveEvaluation={saveTeacherEvaluation}
        onToggleFinalDownloadPermission={toggleFinalDownloadPermission}
        onAddFinalComment={addFinalCommentToStudent}
        onNavigateHome={() => setScreen('TITLE')}
        onSwitchRole={() => setScreen('ROLE_SELECT')}
      />
    );
  }

  // Fallback if student state isn't selected yet
  if (!activeStudent) {
    return (
      <RegisterStudentScreen
        existingStudents={students}
        onRegister={(name, className) => {
          registerStudent(name, className);
        }}
        onSelectExisting={(id) => {
          if (id !== '__ACTIVE__') selectStudentProfile(id);
          setScreen('STUDENT_MAP');
        }}
        onBack={() => setScreen('ROLE_SELECT')}
      />
    );
  }

  const helpContent = getHelpContent(screen);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#4DD0E1] text-[#3D2612] flex flex-col">
      <SharedForestBackground />

      <div className="relative z-10 flex-1 flex flex-col">
        <GameHud
          screen={screen}
          student={activeStudent}
          muted={muted}
          onToggleMute={toggleMute}
          onNavigate={setScreen}
          onBack={handleBackNavigation}
          onOpenHelp={() => setHelpOpen(true)}
        />

        <main className="flex-1 pb-12">
        {screen === 'STUDENT_MAP' && (
          <StudentAdventureMap
            student={activeStudent}
            justUnlockedMission={justUnlockedMission}
            onDismissUnlock={() => setJustUnlockedMission(null)}
            onUpdateMapProgress={updateMapProgress}
            onEnterMission={(target) => {
              setJustUnlockedMission(null);
              setScreen(target);
            }}
            onOpenGallery={() => setScreen('STAR_GALLERY')}
          />
        )}

        {screen === 'MISSION_1' && (
          <Mission1View
            student={activeStudent}
            onComplete={(storyId) => {
              const wasCompleted = activeStudent.completedMissions.includes(1);
              completeMission1(storyId);
              if (!wasCompleted) setJustUnlockedMission(2);
            }}
            onBackToMap={() => setScreen('STUDENT_MAP')}
          />
        )}

        {screen === 'MISSION_2' && (
          <Mission2View
            student={activeStudent}
            onSaveMission2={(quiz) => {
              const wasCompleted = activeStudent.completedMissions.includes(2);
              saveMission2(quiz);
              if (!wasCompleted) setJustUnlockedMission(3);
            }}
            onBackToMap={() => setScreen('STUDENT_MAP')}
          />
        )}

        {screen === 'MISSION_3' && (
          <Mission3View
            student={activeStudent}
            onSaveMission3={(plan, finalize) => {
              const wasCompleted = activeStudent.completedMissions.includes(3);
              updateMission3Plan(plan, finalize);
              if (finalize && !wasCompleted) setJustUnlockedMission(4);
            }}
            onBackToMap={() => setScreen('STUDENT_MAP')}
          />
        )}

        {screen === 'MISSION_4' && (
          <Mission4View
            student={activeStudent}
            allStudents={students}
            onSaveMission4={(data, finalize) => {
              const wasCompleted = activeStudent.completedMissions.includes(4);
              updateMission4Data(data, finalize);
              if (finalize && !wasCompleted) setJustUnlockedMission(5);
            }}
            onAddCommentToRecording={addPeerCommentToStudent}
            onBackToMap={() => setScreen('STUDENT_MAP')}
          />
        )}

        {screen === 'MISSION_5' && (
          <Mission5View
            student={activeStudent}
            allStudents={students}
            onSaveMission5={updateMission5Data}
            onAddFinalComment={addFinalCommentToStudent}
            onFinishToGallery={() => setScreen('STAR_GALLERY')}
            onBackToMap={() => setScreen('STUDENT_MAP')}
          />
        )}

        {screen === 'STAR_GALLERY' && (
          <StarGalleryView
            student={activeStudent}
            onBackToMap={() => setScreen('STUDENT_MAP')}
          />
        )}
        </main>
      </div>

      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={helpContent.title}
        tips={helpContent.tips}
      />
    </div>
  );
}
