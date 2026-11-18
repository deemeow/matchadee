import { useCallback, useEffect, useState } from 'react';
import {
  FeedbackComment,
  Mission2QuizData,
  Mission3Plan,
  Mission4Data,
  Mission5Data,
  RubricLevel,
  StudentRecord,
  TeacherEvaluation
} from '../types';
import { MISSION_BADGES } from '../data/stories';

const STORAGE_KEY = 'karya_sastera_hidup_state_v1';

interface PersistedState {
  teacherName: string;
  activeStudentId: string | null;
  students: StudentRecord[];
}

export function createEmptyStudent(id: string, name: string, className: string): StudentRecord {
  const now = new Date().toISOString();
  return {
    id,
    name,
    className,
    selectedStoryId: '',
    stars: 0,
    badges: [],
    completedMissions: [],
    currentMission: 1,
    mission1Completed: false,
    mission2: {
      preferredStyle: '',
      reason: '',
      comparison: { normal: '', expressive: '', acting: '' },
      detectiveAnswers: {},
      completed: false
    },
    mission3: {
      completedStations: [],
      selectedStyle: '',
      reason: '',
      skillsToHighlight: [],
      actingDetails: {
        characters: '',
        groupSize: '3 orang',
        props: '',
        setting: ''
      },
      saved: false
    },
    mission4: {
      trialVideoUrl: '',
      trialVideoType: '',
      trialVideoLabel: '',
      peerComments: [],
      teacherFeedback: '',
      teacherAuthor: 'Cikgu Aminah',
      selectedWeaknesses: [],
      identifiedWeakness: '',
      improvementAction: '',
      beforeAfter: {
        sebutan: { before: '', after: '' },
        intonasi: { before: '', after: '' },
        ekspresi: { before: '', after: '' },
        gaya: { before: '', after: '' }
      },
      saved: false
    },
    mission5: {
      stageReady: false,
      finalVideoUrl: '',
      finalVideoType: '',
      finalVideoLabel: '',
      finalVideoSubmittedAt: '',
      finalComments: [],
      allowPeerDownload: false,
      reflection: {
        newSkill: '',
        changesMade: '',
        proudestPart: '',
        futureGoal: ''
      },
      submitted: false
    },
    adventureStarted: false,
    mapLastStation: 0,
    updatedAt: now
  };
}

const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    id: 'sample-aiman',
    name: 'Aiman Hakim bin Razak',
    className: '5 Bestari',
    isDemo: true,
    selectedStoryId: 'sang-kancil-dan-buaya',
    stars: 90,
    badges: MISSION_BADGES.map((b) => b.id),
    completedMissions: [1, 2, 3, 4, 5],
    currentMission: 5,
    mission1Completed: true,
    mission2: {
      preferredStyle: 'Lakonan',
      reason: 'Lakonan mempunyai aksi watak dan dialog yang membuatkan cerita lebih hidup.',
      comparison: {
        normal: 'Suara sekata dan membaca terus daripada teks.',
        expressive: 'Menggunakan intonasi naik turun, jeda dan emosi suara.',
        acting: 'Menggabungkan suara watak, mimik muka dan pergerakan pentas.'
      },
      detectiveAnswers: { q1: 0, q2: 1, q3: 2, q4: 1, q5: 2 },
      completed: true
    },
    mission3: {
      completedStations: [1, 2, 3, 4, 5],
      selectedStyle: 'Lakonan',
      reason: 'Saya suka melakonkan watak Sang Kancil yang bijak dan bertenaga.',
      skillsToHighlight: ['Suara', 'Intonasi', 'Ekspresi', 'Gaya persembahan'],
      actingDetails: {
        characters: 'Sang Kancil, Ketua Buaya, Pencerita',
        groupSize: '3 orang',
        props: 'Topeng kancil kertas, kain biru sebagai sungai',
        setting: 'Tepi sungai rimba'
      },
      saved: true
    },
    mission4: {
      trialVideoUrl: 'demo-stage://sang-kancil-dan-buaya',
      trialVideoType: 'demo',
      trialVideoLabel: 'Rakaman Percubaan: Lakonan Sang Kancil (Demonstrasi)',
      trialVideoUploadedAt: '2026-11-12T09:00:00.000Z',
      peerComments: [
        {
          id: 'c-1',
          recordingId: 'rec-sample-aiman',
          authorId: 'sample-nurul',
          author: 'Nur Izzati',
          role: 'rakan',
          authorClass: '5 Bestari',
          strengths: 'Sebutan sangat jelas.',
          improvement: 'Bahagian mengira buaya boleh diperlahankan sedikit.',
          suggestion: 'Tambah jeda selepas setiap kiraan supaya penonton lebih teruja.',
          message: 'Sebutan kamu sangat jelas dan saya suka cara kamu membaca dialog watak Sang Kancil!',
          createdAt: '2026-11-12T10:15:00.000Z'
        },
        {
          id: 'c-2',
          recordingId: 'rec-sample-aiman',
          authorId: 'teacher-farah',
          author: 'Cikgu Farah',
          role: 'guru',
          strengths: 'Intonasi sesuai dengan watak.',
          improvement: 'Perhatikan penggunaan jeda.',
          suggestion: 'Berhenti seketika di hujung ayat kemuncak cerita.',
          message: 'Bagus! Intonasi kamu sudah sesuai dengan watak. Cuba perhatikan penggunaan jeda supaya penyampaian lebih lancar.',
          createdAt: '2026-11-12T14:20:00.000Z'
        }
      ],
      teacherFeedback: 'Bagus! Intonasi kamu sudah sesuai dengan watak. Cuba perhatikan penggunaan jeda supaya penyampaian lebih lancar.',
      teacherAuthor: 'Cikgu Farah',
      selectedWeaknesses: ['Intonasi', 'Gaya persembahan'],
      identifiedWeakness: 'Suara terlalu laju ketika Sang Kancil melompat di atas buaya.',
      improvementAction: 'Berhenti seketika sebelum berkata "Terima kasih, Sang Buaya!" dan luaskan gerak tangan.',
      beforeAfter: {
        sebutan: { before: 'Jelas pada bahagian awal', after: 'Jelas dan tepat dari awal hingga akhir' },
        intonasi: { before: 'Agak laju ketika dialog', after: 'Nada berubah mengikut watak Kancil dan Buaya' },
        ekspresi: { before: 'Senyuman kurang kelihatan', after: 'Mimik muka ceria dan yakin' },
        gaya: { before: 'Berdiri di satu tempat', after: 'Melangkah aktif mengikut ruang pentas' }
      },
      saved: true
    },
    mission5: {
      stageReady: true,
      finalVideoUrl: 'demo-stage://sang-kancil-dan-buaya-final',
      finalVideoType: 'demo',
      finalVideoLabel: 'Persembahan Akhir Pentas Teater: Sang Kancil dan Buaya',
      finalVideoSubmittedAt: '2026-11-14T08:15:00.000Z',
      allowPeerDownload: false,
      finalComments: [
        {
          id: 'fc-1',
          recordingId: 'final-sample-aiman',
          authorId: 'teacher-farah',
          author: 'Cikgu Farah',
          role: 'guru',
          strengths: '',
          improvement: '',
          suggestion: '',
          message:
            'Tahniah Aiman! Penggunaan jeda dan perubahan suara antara watak Sang Kancil dengan Ketua Buaya sangat menjadi. Penuh keyakinan di atas pentas!',
          createdAt: '2026-11-14T10:30:00.000Z'
        },
        {
          id: 'fc-2',
          recordingId: 'final-sample-aiman',
          authorId: 'sample-nurul',
          author: 'Nurul Ain binti Zulkifli',
          role: 'rakan',
          authorClass: '5 Bestari',
          strengths: '',
          improvement: '',
          suggestion: '',
          message:
            'Seronok sangat menonton lakonan kamu! Bahagian Sang Kancil mengira buaya paling menghiburkan.',
          createdAt: '2026-11-14T09:20:00.000Z'
        }
      ],
      reflection: {
        newSkill: 'Saya belajar cara menggunakan jeda dan intonasi berbeza untuk setiap watak.',
        changesMade: 'Saya memperlahankan tempo bacaan dan menambah pergerakan tangan di atas pentas.',
        proudestPart: 'Saya berjaya berlakon dengan yakin tanpa berasa gementar.',
        futureGoal: 'Saya ingin mencuba watak yang lebih mencabar dengan prop buatan sendiri.'
      },
      submitted: true
    },
    evaluation: {
      sebutan: 4,
      intonasi: 4,
      jeda: 3,
      ekspresi: 4,
      gaya: 4,
      comment: 'Persembahan pentas yang amat meyakinkan dan menghiburkan rakan sekelas.',
      awardCategory: 'Bintang Ekspresi Menarik',
      savedAt: '2026-11-14T08:30:00.000Z'
    },
    adventureStarted: true,
    mapLastStation: 5,
    updatedAt: '2026-11-14T08:30:00.000Z'
  },
  {
    id: 'sample-nurul',
    name: 'Nurul Ain binti Zulkifli',
    className: '5 Bestari',
    isDemo: true,
    selectedStoryId: 'bawang-merah-bawang-putih',
    stars: 65,
    badges: ['penjelajah_sastera', 'detektif_sastera', 'pengarah_muda', 'bintang_berkembang'],
    completedMissions: [1, 2, 3, 4],
    currentMission: 5,
    mission1Completed: true,
    mission2: {
      preferredStyle: 'Bacaan secara ekspresif',
      reason: 'Bacaan ekspresif menonjolkan perasaan sedih dan gembira Bawang Putih melalui suara.',
      comparison: {
        normal: 'Membaca dengan nada biasa.',
        expressive: 'Ada intonasi, jeda dan emosi yang menyentuh hati.',
        acting: 'Berlakon dengan pakaian dan pergerakan penuh.'
      },
      detectiveAnswers: { q1: 0, q2: 1, q3: 2, q4: 1, q5: 2 },
      completed: true
    },
    mission3: {
      completedStations: [1, 2, 3, 4, 5],
      selectedStyle: 'Bacaan secara ekspresif',
      reason: 'Cerita ini penuh emosi dan sesuai disampaikan dengan suara yang merdu.',
      skillsToHighlight: ['Intonasi', 'Jeda', 'Ekspresi'],
      actingDetails: { characters: '', groupSize: 'Individu', props: '', setting: '' },
      saved: true
    },
    mission4: {
      trialVideoUrl: 'demo-stage://bawang-merah-bawang-putih',
      trialVideoType: 'demo',
      trialVideoLabel: 'Rakaman Percubaan: Bacaan Ekspresif Bawang Putih (Demonstrasi)',
      trialVideoUploadedAt: '2026-11-13T10:30:00.000Z',
      peerComments: [
        {
          id: 'c-3',
          recordingId: 'rec-sample-nurul',
          authorId: 'sample-aiman',
          author: 'Aiman Hakim bin Razak',
          role: 'rakan',
          authorClass: '5 Bestari',
          strengths: 'Suara lembut dan penuh perasaan.',
          improvement: 'Kuatkan sedikit suara di bahagian akhir.',
          suggestion: 'Tarik nafas dalam sebelum menyanyi bahagian buaian.',
          message: 'Saya suka ekspresi suara kamu. Bahagian Bawang Putih menyanyi sangat menyentuh hati!',
          createdAt: '2026-11-13T15:10:00.000Z'
        }
      ],
      teacherFeedback: 'Nada suara kamu lembut dan sesuai. Cuba kuatkan sedikit suara pada bahagian akhir.',
      teacherAuthor: 'Cikgu Aminah',
      selectedWeaknesses: ['Sebutan'],
      identifiedWeakness: 'Suara agak perlahan apabila membaca bahagian sedih.',
      improvementAction: 'Berlatih mengawal pernafasan supaya suara tetap jelas walaupun bernada lembut.',
      beforeAfter: {
        sebutan: { before: 'Agak perlahan', after: 'Lebih lantang dan jelas' },
        intonasi: { before: 'Lembut dan syahdu', after: 'Bervariasi antara sedih dan gembira' },
        ekspresi: { before: 'Baik', after: 'Sangat menghayati watak' },
        gaya: { before: 'Postur statik', after: 'Menggunakan gerakan tangan ringan' }
      },
      saved: true
    },
    mission5: {
      stageReady: false,
      finalVideoUrl: '',
      finalVideoType: '',
      finalVideoLabel: '',
      reflection: { newSkill: '', changesMade: '', proudestPart: '', futureGoal: '' },
      submitted: false
    },
    adventureStarted: true,
    mapLastStation: 5,
    updatedAt: '2026-11-14T11:00:00.000Z'
  },
  {
    id: 'sample-daniel',
    name: 'Daniel Tan Wei Ming',
    className: '5 Cemerlang',
    isDemo: true,
    selectedStoryId: 'sang-arnab-dan-sang-kura-kura',
    stars: 25,
    badges: ['penjelajah_sastera', 'detektif_sastera'],
    completedMissions: [1, 2],
    currentMission: 3,
    mission1Completed: true,
    mission2: {
      preferredStyle: 'Lakonan',
      reason: 'Aksi perlumbaan sangat seronok untuk dilakonkan.',
      comparison: {
        normal: 'Bacaan biasa tanpa aksi.',
        expressive: 'Ada intonasi menarik.',
        acting: 'Banyak gerakan watak.'
      },
      detectiveAnswers: { q1: 0, q2: 1, q3: 2, q4: 1, q5: 2 },
      completed: true
    },
    mission3: {
      completedStations: [1, 2],
      selectedStyle: '',
      reason: '',
      skillsToHighlight: [],
      actingDetails: { characters: '', groupSize: '2 orang', props: '', setting: '' },
      saved: false
    },
    mission4: createEmptyStudent('tmp', 'tmp', 'tmp').mission4,
    mission5: createEmptyStudent('tmp', 'tmp', 'tmp').mission5,
    adventureStarted: true,
    mapLastStation: 3,
    updatedAt: '2026-11-13T14:20:00.000Z'
  },
  {
    id: 'sample-farisha',
    name: 'Farisha Damia binti Azhar',
    className: '5 Bestari',
    isDemo: true,
    selectedStoryId: 'puteri-gunung-ledang',
    stars: 90,
    badges: MISSION_BADGES.map((b) => b.id),
    completedMissions: [1, 2, 3, 4, 5],
    currentMission: 5,
    mission1Completed: true,
    mission2: {
      preferredStyle: 'Bacaan secara ekspresif',
      reason: 'Bacaan ekspresif membolehkan pendengar merasai keagungan kisah Puteri Gunung Ledang.',
      comparison: {
        normal: 'Bacaan biasa kedengaran rata.',
        expressive: 'Ada alunan suara tinggi rendah dan jeda yang memukau.',
        acting: 'Memerlukan pakaian dan lakonan watak sepenuhnya.'
      },
      detectiveAnswers: { q1: 0, q2: 1, q3: 2, q4: 1, q5: 2 },
      completed: true
    },
    mission3: {
      completedStations: [1, 2, 3, 4, 5],
      selectedStyle: 'Bacaan secara ekspresif',
      reason: 'Saya ingin menonjolkan kejelitaan bahasa klasik melalui intonasi dan jeda yang teratur.',
      skillsToHighlight: ['Sebutan', 'Intonasi', 'Jeda', 'Ekspresi'],
      actingDetails: { characters: '', groupSize: 'Individu', props: '', setting: 'Puncak Gunung Ledang' },
      saved: true
    },
    mission4: {
      trialVideoUrl: 'demo-stage://puteri-gunung-ledang',
      trialVideoType: 'demo',
      trialVideoLabel: 'Rakaman Percubaan: Bacaan Ekspresif Puteri Gunung Ledang (Demonstrasi)',
      trialVideoUploadedAt: '2026-11-12T11:00:00.000Z',
      peerComments: [],
      teacherFeedback: 'Sebutan kata klasik kamu jelas dan teratur. Teruskan gaya suara yang tenang.',
      teacherAuthor: 'Cikgu Aminah',
      selectedWeaknesses: ['Jeda'],
      identifiedWeakness: 'Perlu berhenti sejenak sebelum menyatakan tujuh syarat Puteri Gunung Ledang.',
      improvementAction: 'Memberi penekanan suara dan jeda dua saat sebelum menyenaraikan syarat.',
      beforeAfter: {
        sebutan: { before: 'Jelas', after: 'Sangat jelas dan fasih' },
        intonasi: { before: 'Mendatar di tengah', after: 'Beralun indah mengikut suasana' },
        ekspresi: { before: 'Sederhana', after: 'Berwibawa dan meyakinkan' },
        gaya: { before: 'Memandang teks selalu', after: 'Kerap memandang penonton' }
      },
      saved: true
    },
    mission5: {
      stageReady: true,
      finalVideoUrl: 'demo-stage://puteri-gunung-ledang-final',
      finalVideoType: 'demo',
      finalVideoLabel: 'Persembahan Akhir Pentas Teater: Puteri Gunung Ledang',
      finalVideoSubmittedAt: '2026-11-14T09:45:00.000Z',
      allowPeerDownload: true,
      finalComments: [
        {
          id: 'fc-3',
          recordingId: 'final-sample-farisha',
          authorId: 'sample-aiman',
          author: 'Aiman Hakim bin Razak',
          role: 'rakan',
          authorClass: '5 Bestari',
          strengths: '',
          improvement: '',
          suggestion: '',
          message:
            'Suara kamu sangat merdu dan tenang! Saya rasa seperti berada di puncak Gunung Ledang.',
          createdAt: '2026-11-14T11:10:00.000Z'
        }
      ],
      reflection: {
        newSkill: 'Saya dapat mengawal jeda dan nafas dengan lebih baik semasa membaca kisah klasik.',
        changesMade: 'Saya lebih kerap memandang ke hadapan dan menguatkan penekanan suara.',
        proudestPart: 'Rakan-rakan memuji kelancaran sebutan saya.',
        futureGoal: 'Saya mahu mencuba persembahan lakonan pula pada masa hadapan.'
      },
      submitted: true
    },
    adventureStarted: true,
    mapLastStation: 5,
    updatedAt: '2026-11-14T09:45:00.000Z'
  }
];

function loadInitialState(): PersistedState {
  if (typeof window === 'undefined') {
    return { teacherName: 'Cikgu Aminah', activeStudentId: null, students: SAMPLE_STUDENTS };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { teacherName: 'Cikgu Aminah', activeStudentId: null, students: SAMPLE_STUDENTS };
    }
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.students) || parsed.students.length === 0) {
      return { teacherName: parsed.teacherName || 'Cikgu Aminah', activeStudentId: null, students: SAMPLE_STUDENTS };
    }
    const existingIds = new Set(parsed.students.map((s) => s.id));
    const missingDemoStudents = SAMPLE_STUDENTS.filter((d) => !existingIds.has(d.id));
    const hydratedStudents = parsed.students.map((s) => {
      const sampleMatch = SAMPLE_STUDENTS.find((d) => d.id === s.id);
      const inferredStarted = s.adventureStarted ?? (s.completedMissions.length > 0 || s.currentMission > 1);
      const inferredStation = s.mapLastStation ?? (inferredStarted ? s.currentMission : 0);
      return {
        ...s,
        adventureStarted: inferredStarted,
        mapLastStation: inferredStation,
        mission5: {
          ...s.mission5,
          finalVideoSubmittedAt:
            s.mission5.finalVideoSubmittedAt ?? sampleMatch?.mission5.finalVideoSubmittedAt ?? '',
          finalComments: s.mission5.finalComments ?? sampleMatch?.mission5.finalComments ?? [],
          allowPeerDownload:
            s.mission5.allowPeerDownload ?? sampleMatch?.mission5.allowPeerDownload ?? false
        }
      };
    });
    return {
      ...parsed,
      students: [...hydratedStudents, ...missingDemoStudents]
    };
  } catch {
    return { teacherName: 'Cikgu Aminah', activeStudentId: null, students: SAMPLE_STUDENTS };
  }
}

export function getRubricLabel(level: RubricLevel): string {
  switch (level) {
    case 1:
      return 'Perlu bimbingan';
    case 2:
      return 'Sedang berkembang';
    case 3:
      return 'Baik';
    case 4:
      return 'Cemerlang';
  }
}

export function summarizeEvaluation(ev: Pick<TeacherEvaluation, 'sebutan' | 'intonasi' | 'jeda' | 'ekspresi' | 'gaya'>): {
  totalScore: number;
  maxScore: number;
  average: number;
  band: string;
  autoSummary: string;
} {
  const totalScore = ev.sebutan + ev.intonasi + ev.jeda + ev.ekspresi + ev.gaya;
  const maxScore = 20;
  const average = totalScore / 5;

  let band = 'Perlu Bimbingan';
  let autoSummary = 'Murid menunjukkan usaha awal dan digalakkan berlatih kejelasan sebutan serta keyakinan di atas pentas.';
  if (average >= 3.6) {
    band = 'Cemerlang';
    autoSummary = 'Murid berjaya menghidupkan karya sastera dengan penguasaan sebutan, intonasi, jeda, ekspresi dan gaya persembahan yang sangat cemerlang.';
  } else if (average >= 2.8) {
    band = 'Baik';
    autoSummary = 'Murid menyampaikan persembahan dengan baik dan teratur serta menunjukkan penghayatan watak yang positif.';
  } else if (average >= 2.0) {
    band = 'Sedang Berkembang';
    autoSummary = 'Murid semakin yakin dalam persembahan dan boleh memantapkan penggunaan jeda serta variasi nada suara.';
  }

  return { totalScore, maxScore, average, band, autoSummary };
}

export function useAppStore() {
  const [state, setState] = useState<PersistedState>(() => loadInitialState());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors on prototype local storage
    }
  }, [state]);

  const activeStudent = state.students.find((s) => s.id === state.activeStudentId) || null;

  const registerStudent = useCallback((name: string, className: string): StudentRecord => {
    const cleanName = name.trim();
    const cleanClass = className.trim();
    let createdOrExisting: StudentRecord | null = null;

    setState((prev) => {
      const existing = prev.students.find(
        (s) => s.name.toLowerCase() === cleanName.toLowerCase() && s.className.toLowerCase() === cleanClass.toLowerCase()
      );
      if (existing) {
        createdOrExisting = existing;
        return { ...prev, activeStudentId: existing.id };
      }
      const newStudent = createEmptyStudent(`student-${Date.now()}`, cleanName, cleanClass);
      createdOrExisting = newStudent;
      return {
        ...prev,
        activeStudentId: newStudent.id,
        students: [newStudent, ...prev.students]
      };
    });

    return createdOrExisting || createEmptyStudent(`student-${Date.now()}`, cleanName, cleanClass);
  }, []);

  const selectStudentProfile = useCallback((studentId: string) => {
    setState((prev) => ({ ...prev, activeStudentId: studentId }));
  }, []);

  const setTeacherName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, teacherName: name.trim() || 'Cikgu' }));
  }, []);

  const updateActiveStudent = useCallback((updater: (student: StudentRecord) => StudentRecord) => {
    setState((prev) => {
      if (!prev.activeStudentId) return prev;
      return {
        ...prev,
        students: prev.students.map((s) =>
          s.id === prev.activeStudentId ? { ...updater(s), updatedAt: new Date().toISOString() } : s
        )
      };
    });
  }, []);

  const updateStudentById = useCallback((studentId: string, updater: (student: StudentRecord) => StudentRecord) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...updater(s), updatedAt: new Date().toISOString() } : s
      )
    }));
  }, []);

  const completeMission1 = useCallback(
    (storyId: string) => {
      updateActiveStudent((s) => {
        const badge = MISSION_BADGES[0];
        const hasBadge = s.badges.includes(badge.id);
        const completed = s.completedMissions.includes(1) ? s.completedMissions : [...s.completedMissions, 1];
        return {
          ...s,
          selectedStoryId: storyId,
          mission1Completed: true,
          completedMissions: completed,
          currentMission: Math.max(s.currentMission, 2),
          badges: hasBadge ? s.badges : [...s.badges, badge.id],
          stars: hasBadge ? s.stars : s.stars + badge.stars
        };
      });
    },
    [updateActiveStudent]
  );

  const saveMission2 = useCallback(
    (quiz: Mission2QuizData) => {
      updateActiveStudent((s) => {
        const badge = MISSION_BADGES[1];
        const hasBadge = s.badges.includes(badge.id);
        const completed = s.completedMissions.includes(2) ? s.completedMissions : [...s.completedMissions, 2];
        return {
          ...s,
          mission2: { ...quiz, completed: true },
          completedMissions: completed,
          currentMission: Math.max(s.currentMission, 3),
          badges: hasBadge ? s.badges : [...s.badges, badge.id],
          stars: hasBadge ? s.stars : s.stars + badge.stars
        };
      });
    },
    [updateActiveStudent]
  );

  const updateMission3Plan = useCallback(
    (plan: Mission3Plan, finalize: boolean) => {
      updateActiveStudent((s) => {
        if (!finalize) {
          return { ...s, mission3: plan };
        }
        const badge = MISSION_BADGES[2];
        const hasBadge = s.badges.includes(badge.id);
        const completed = s.completedMissions.includes(3) ? s.completedMissions : [...s.completedMissions, 3];
        return {
          ...s,
          mission3: { ...plan, saved: true },
          completedMissions: completed,
          currentMission: Math.max(s.currentMission, 4),
          badges: hasBadge ? s.badges : [...s.badges, badge.id],
          stars: hasBadge ? s.stars : s.stars + badge.stars
        };
      });
    },
    [updateActiveStudent]
  );

  const updateMission4Data = useCallback(
    (data: Mission4Data, finalize: boolean) => {
      updateActiveStudent((s) => {
        if (!finalize) {
          return { ...s, mission4: data };
        }
        const badge = MISSION_BADGES[3];
        const hasBadge = s.badges.includes(badge.id);
        const completed = s.completedMissions.includes(4) ? s.completedMissions : [...s.completedMissions, 4];
        return {
          ...s,
          mission4: { ...data, saved: true },
          completedMissions: completed,
          currentMission: Math.max(s.currentMission, 5),
          badges: hasBadge ? s.badges : [...s.badges, badge.id],
          stars: hasBadge ? s.stars : s.stars + badge.stars
        };
      });
    },
    [updateActiveStudent]
  );

  const updateMission5Data = useCallback(
    (data: Mission5Data, finalize: boolean) => {
      updateActiveStudent((s) => {
        if (!finalize) {
          return { ...s, mission5: data };
        }
        const badge = MISSION_BADGES[4];
        const hasBadge = s.badges.includes(badge.id);
        const completed = s.completedMissions.includes(5) ? s.completedMissions : [...s.completedMissions, 5];
        return {
          ...s,
          mission5: { ...data, submitted: true },
          completedMissions: completed,
          currentMission: 5,
          badges: hasBadge ? s.badges : [...s.badges, badge.id],
          stars: hasBadge ? s.stars : s.stars + badge.stars
        };
      });
    },
    [updateActiveStudent]
  );

  const addPeerCommentToStudent = useCallback(
    (studentId: string, comment: FeedbackComment) => {
      updateStudentById(studentId, (s) => ({
        ...s,
        mission4: {
          ...s.mission4,
          peerComments: [comment, ...s.mission4.peerComments]
        }
      }));
    },
    [updateStudentById]
  );

  const saveTeacherFeedbackForStudent = useCallback(
    (studentId: string, teacherName: string, feedback: string) => {
      const cleanFeedback = feedback.trim();
      if (!cleanFeedback) return;
      updateStudentById(studentId, (s) => {
        const teacherComment: FeedbackComment = {
          id: `guru-${Date.now()}`,
          recordingId: `rec-${studentId}`,
          authorId: 'teacher-active',
          author: teacherName,
          role: 'guru',
          strengths: '',
          improvement: '',
          suggestion: '',
          message: cleanFeedback,
          createdAt: new Date().toISOString()
        };
        return {
          ...s,
          mission4: {
            ...s.mission4,
            teacherAuthor: teacherName,
            teacherFeedback: cleanFeedback,
            peerComments: [teacherComment, ...s.mission4.peerComments]
          }
        };
      });
    },
    [updateStudentById]
  );

  const saveTeacherEvaluation = useCallback(
    (studentId: string, evaluation: TeacherEvaluation) => {
      updateStudentById(studentId, (s) => ({
        ...s,
        evaluation
      }));
    },
    [updateStudentById]
  );

  const addFinalCommentToStudent = useCallback(
    (studentId: string, comment: FeedbackComment) => {
      updateStudentById(studentId, (s) => ({
        ...s,
        mission5: {
          ...s.mission5,
          finalComments: [comment, ...(s.mission5.finalComments || [])]
        }
      }));
    },
    [updateStudentById]
  );

  const toggleFinalDownloadPermission = useCallback(
    (studentId: string, allow: boolean) => {
      updateStudentById(studentId, (s) => ({
        ...s,
        mission5: {
          ...s.mission5,
          allowPeerDownload: allow
        }
      }));
    },
    [updateStudentById]
  );

  const updateMapProgress = useCallback(
    (updates: { adventureStarted?: boolean; mapLastStation?: number }) => {
      updateActiveStudent((s) => ({
        ...s,
        adventureStarted: updates.adventureStarted ?? s.adventureStarted ?? true,
        mapLastStation:
          updates.mapLastStation !== undefined
            ? Math.max(s.mapLastStation ?? 0, updates.mapLastStation)
            : s.mapLastStation
      }));
    },
    [updateActiveStudent]
  );

  return {
    teacherName: state.teacherName,
    students: state.students,
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
  };
}
