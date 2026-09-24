export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  student_id?: string;
  department?: string;
  is_active?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  academic_year: string;
  status: string;
  enrolled_date: string;
}

export interface AcademicRecord {
  id: number;
  student_id: string;
  subject_code: string;
  subject_name: string;
  semester: number;
  attendance_percentage: number;
  internal_marks: number;
  assignment_score: number;
  practical_score: number;
  previous_semester_percentage: number;
  study_hours_per_week: number;
  assignment_completion_percentage: number;
  learning_activity_score: number;
  target_score?: number | null;
  recorded_by?: string;
  updated_at: string;
}

export interface FeatureImpact {
  feature: string;
  label: string;
  value: number;
  importance_weight: number;
  impact: 'positive' | 'neutral' | 'negative';
  insight_note: string;
}

export interface RecommendationItem {
  category: string;
  title: string;
  priority: 'High' | 'Medium' | 'Good Standing';
  description: string;
  action_steps: string[];
}

export interface PredictionResult {
  estimated_score: number;
  lower_bound: number;
  upper_bound: number;
  performance_category: 'Distinction' | 'First Class' | 'Pass / Average' | 'Needs Support';
  support_priority: 'Good Standing' | 'Moderate Monitoring' | 'High Academic Priority';
  model_name: string;
  model_version: string;
  residual_standard_error: number;
  disclaimer: string;
  feature_impacts: FeatureImpact[];
  recommendations: RecommendationItem[];
  early_support_triggers: string[];
}

export interface PredictionHistoryItem {
  id: number;
  student_id?: string;
  student_name?: string;
  model_name: string;
  estimated_score: number;
  lower_bound: number;
  upper_bound: number;
  performance_category: string;
  support_priority: string;
  created_at: string;
}

export interface SupportNote {
  id: number;
  student_id: string;
  teacher_name: string;
  priority: 'High' | 'Medium' | 'Low' | 'Good Standing';
  title: string;
  note: string;
  action_plan?: string;
  resolved: boolean;
  created_at: string;
}

export interface ModelBenchmark {
  id?: number;
  name: string;
  algorithm: string;
  version: string;
  mae: number;
  rmse: number;
  r2_score: number;
  cv_r2_mean?: number;
  cv_r2_std?: number;
  is_active: boolean;
  trained_at?: string;
}

export interface DashboardOverview {
  metrics: {
    total_students: number;
    total_records: number;
    total_predictions: number;
    active_support_notes: number;
    attention_needed_count: number;
    avg_attendance: number;
    avg_internals: number;
    avg_practicals: number;
    avg_completion_pct: number;
    avg_study_hours: number;
  };
  performance_distribution: {
    Distinction: number;
    "First Class": number;
    "Pass / Average": number;
    "Needs Support": number;
  };
  priority_distribution: Record<string, number>;
  department_distribution: Array<{ department: string; count: number }>;
  recent_predictions: PredictionHistoryItem[];
}
