export type AppScreen =
  | 'TITLE'
  | 'ROLE_SELECT'
  | 'REGISTER_STUDENT'
  | 'REGISTER_TEACHER'
  | 'STUDENT_MAP'
  | 'MISSION_1'
  | 'MISSION_2'
  | 'MISSION_3'
  | 'MISSION_4'
  | 'MISSION_5'
  | 'STAR_GALLERY'
  | 'TEACHER_DASHBOARD';

export type PerformanceStyle =
  | 'Bacaan biasa'
  | 'Bacaan secara ekspresif'
  | 'Lakonan';

export type VideoWatchStatus = 'Belum ditonton' | 'Sedang ditonton' | 'Selesai ditonton';

export interface Story {
  id: string;
  title: string;
  tagline: string;
  moral: string;
  image: string;
  accentColor: string;
  paragraphs: string[];
  sampleLine: string;
  jedaSentence: {
    words: string[];
    correctPauseIndices: number[];
    explanation: string;
  };
  characters: string[];
  setting: string;
  performanceDemos: {
    normal: {
      note: string;
      lines: string[];
    };
    expressive: {
      note: string;
      lines: { text: string; cue: string }[];
    };
    acting: {
      note: string;
      scenes: { character: string; action: string; dialogue: string }[];
    };
  };
}

export interface Mission2QuizData {
  preferredStyle: PerformanceStyle | '';
  reason: string;
  comparison: {
    normal: string;
    expressive: string;
    acting: string;
  };
  detectiveAnswers: Record<string, number>;
  completed: boolean;
}

export interface Mission3Plan {
  completedStations: number[];
  selectedStyle: PerformanceStyle | '';
  reason: string;
  skillsToHighlight: string[];
  actingDetails: {
    characters: string;
    groupSize: string;
    props: string;
    setting: string;
  };
  saved: boolean;
}

export interface FeedbackComment {
  id: string;
  recordingId?: string;
  authorId?: string;
  author: string;
  role: 'rakan' | 'guru';
  authorClass?: string;
  strengths: string;
  improvement: string;
  suggestion: string;
  message: string;
  createdAt: string;
}

export interface Mission4Data {
  trialVideoUrl: string;
  trialVideoType: 'upload' | 'camera' | 'link' | 'demo' | '';
  trialVideoLabel: string;
  trialVideoUploadedAt?: string;
  peerComments: FeedbackComment[];
  teacherFeedback: string;
  teacherAuthor: string;
  selectedWeaknesses: string[];
  identifiedWeakness: string;
  improvementAction: string;
  beforeAfter: {
    sebutan: { before: string; after: string };
    intonasi: { before: string; after: string };
    ekspresi: { before: string; after: string };
    gaya: { before: string; after: string };
  };
  saved: boolean;
}

export interface Mission5Data {
  stageReady: boolean;
  finalVideoUrl: string;
  finalVideoType: 'upload' | 'camera' | 'link' | 'demo' | '';
  finalVideoLabel: string;
  finalVideoSubmittedAt?: string;
  finalComments?: FeedbackComment[];
  allowPeerDownload?: boolean;
  reflection: {
    newSkill: string;
    changesMade: string;
    proudestPart: string;
    futureGoal: string;
  };
  submitted: boolean;
}

export type RubricLevel = 1 | 2 | 3 | 4;

export interface TeacherEvaluation {
  sebutan: RubricLevel;
  intonasi: RubricLevel;
  jeda: RubricLevel;
  ekspresi: RubricLevel;
  gaya: RubricLevel;
  comment: string;
  awardCategory: string;
  savedAt: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  className: string;
  isDemo?: boolean;
  selectedStoryId: string;
  stars: number;
  badges: string[];
  completedMissions: number[];
  currentMission: number;
  mission1Completed: boolean;
  mission2: Mission2QuizData;
  mission3: Mission3Plan;
  mission4: Mission4Data;
  mission5: Mission5Data;
  evaluation?: TeacherEvaluation;
  adventureStarted?: boolean;
  mapLastStation?: number;
  updatedAt: string;
}

export interface BadgeInfo {
  id: string;
  mission: number;
  title: string;
  stars: number;
  description: string;
}
