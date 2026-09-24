import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Sliders, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Printer, 
  RotateCcw, 
  BookOpen, 
  Award,
  Calendar,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { PerformanceBadge } from '../components/PerformanceBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { EarlyWarningAlert } from '../components/EarlyWarningAlert';

export const EstimationStudio: React.FC = () => {
  // Student selection or free-form simulation
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');

  // 8 Core Educational Features
  const [attendance, setAttendance] = useState<number>(85.0);
  const [internalMarks, setInternalMarks] = useState<number>(78.0);
  const [assignmentScore, setAssignmentScore] = useState<number>(82.0);
  const [practicalScore, setPracticalScore] = useState<number>(84.0);
  const [prevSemPercentage, setPrevSemPercentage] = useState<number>(76.0);
  const [studyHours, setStudyHours] = useState<number>(18.0);
  const [assignmentCompletion, setAssignmentCompletion] = useState<number>(90.0);
  const [learningActivity, setLearningActivity] = useState<number>(80.0);

  // Model selection
  const [modelOverride, setModelOverride] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Estimation Result state
  const [estimationResult, setEstimationResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
    runEstimation();
  }, []);

  const fetchInitialData = async () => {
    try {
      const modelsRes = await api.get('/ml/models');
      setAvailableModels(modelsRes.data.available_models || []);
    } catch (err) {
      console.error('Failed to load available models', err);
    }

    try {
      const stuRes = await api.get('/students', { params: { limit: 50 } });
      setStudents(stuRes.data.items || []);
    } catch (err) {
      // Guest visitor (unauthenticated) - student selector is optional
      setStudents([]);
    }
  };

  const handleStudentSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sid = e.target.value;
    setSelectedStudentId(sid);
    if (!sid) return;

    try {
      const res = await api.get(`/students/${sid}`);
      const stu = res.data;
      setStudentName(stu.name);

      if (stu.academic_records && stu.academic_records.length > 0) {
        const rec = stu.academic_records[0];
        setAttendance(rec.attendance_percentage);
        setInternalMarks(rec.internal_marks);
        setAssignmentScore(rec.assignment_score);
        setPracticalScore(rec.practical_score);
        setPrevSemPercentage(rec.previous_semester_percentage);
        setStudyHours(rec.study_hours_per_week);
        setAssignmentCompletion(rec.assignment_completion_percentage);
        setLearningActivity(rec.learning_activity_score);
      }
    } catch (err) {
      console.error('Failed to load student details', err);
    }
  };

  const runEstimation = async () => {
    setLoading(true);
    setError(null);

    const payload: any = {
      attendance_percentage: Number(attendance),
      internal_marks: Number(internalMarks),
      assignment_score: Number(assignmentScore),
      practical_score: Number(practicalScore),
      previous_semester_percentage: Number(prevSemPercentage),
      study_hours_per_week: Number(studyHours),
      assignment_completion_percentage: Number(assignmentCompletion),
      learning_activity_score: Number(learningActivity)
    };

    if (selectedStudentId) payload.student_id = selectedStudentId;
    if (studentName) payload.student_name = studentName;
    if (modelOverride) payload.model_override = modelOverride;

    try {
      const res = await api.post('/ml/predict', payload);
      setEstimationResult(res.data);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const msgs = detail.map((d: any) => `${d.loc?.[d.loc.length - 1]}: ${d.msg}`).join(', ');
        setError(`Validation Error: ${msgs}`);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Estimation failed. Please verify input ranges.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetToBaseline = () => {
    setSelectedStudentId('');
    setStudentName('');
    setAttendance(78.0);
    setInternalMarks(72.0);
    setAssignmentScore(75.0);
    setPracticalScore(76.0);
    setPrevSemPercentage(70.0);
    setStudyHours(16.0);
    setAssignmentCompletion(80.0);
    setLearningActivity(72.0);
    setModelOverride('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Interactive ML Studio
            </span>
            <span className="text-xs text-slate-500 font-mono">v1.0 • Nithyasri S</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            AI Student Performance Estimation Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate hypothetical performance scenarios or evaluate enrolled students using validated regression pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetToBaseline}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>

          {estimationResult && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print / Export Summary</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Output & Insights on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 8 Parameter Controls */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 print:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Academic Input Parameters</h3>
              <p className="text-xs text-slate-500">Fine-tune the 8 standardized continuous evaluation attributes</p>
            </div>
            <div className="flex items-center space-x-1 text-xs text-blue-600 font-semibold">
              <Sliders className="w-4 h-4" />
              <span>Multi-Factor</span>
            </div>
          </div>

          {/* Student Preload Picker */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pre-load Registered Student (Optional)
            </label>
            <select
              value={selectedStudentId}
              onChange={handleStudentSelect}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Manual Simulation (No Student Selected) --</option>
              {students.map((s) => (
                <option key={s.id} value={s.student_id}>
                  {s.student_id} - {s.name} ({s.department})
                </option>
              ))}
            </select>
            {selectedStudentId && (
              <p className="text-[11px] text-blue-700 font-semibold">
                ✓ Loaded continuous assessment records for {studentName} ({selectedStudentId})
              </p>
            )}
          </div>

          {/* Controls List */}
          <div className="space-y-4">
            
            {/* 1. Classroom Attendance */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">1. Classroom Attendance Percentage</span>
                <span className={`font-mono font-bold ${attendance < 75 ? 'text-rose-600' : 'text-blue-700'}`}>
                  {attendance}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={attendance}
                onChange={(e) => setAttendance(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Institutional requirement: ≥ 75.0%</p>
            </div>

            {/* 2. Continuous Internal Marks */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">2. Continuous Internal Assessment Marks</span>
                <span className={`font-mono font-bold ${internalMarks < 50 ? 'text-rose-600' : 'text-blue-700'}`}>
                  {internalMarks} / 100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={internalMarks}
                onChange={(e) => setInternalMarks(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Highest regression weighting (25.4%)</p>
            </div>

            {/* 3. Practical / Lab Marks */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">3. Practical & Laboratory Examination Score</span>
                <span className="font-mono font-bold text-blue-700">{practicalScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={practicalScore}
                onChange={(e) => setPracticalScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* 4. Previous Semester Aggregate */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">4. Previous Semester Academic Aggregate</span>
                <span className="font-mono font-bold text-blue-700">{prevSemPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={prevSemPercentage}
                onChange={(e) => setPrevSemPercentage(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* 5. Weekly Self-Study Hours */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">5. Weekly Self-Study & Revision Time</span>
                <span className="font-mono font-bold text-blue-700">{studyHours} hrs/week</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="0.5"
                value={studyHours}
                onChange={(e) => setStudyHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Cohort average: 17.1 hrs/week</p>
            </div>

            {/* 6. Assignment Score */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">6. Continuous Assignment Quality Score</span>
                <span className="font-mono font-bold text-blue-700">{assignmentScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={assignmentScore}
                onChange={(e) => setAssignmentScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* 7. Assignment Completion Rate */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">7. Assignment Timely Submission Rate</span>
                <span className="font-mono font-bold text-blue-700">{assignmentCompletion}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={assignmentCompletion}
                onChange={(e) => setAssignmentCompletion(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* 8. Learning Activity / Quiz Engagement */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">8. Digital LMS & Coding Quiz Engagement</span>
                <span className="font-mono font-bold text-blue-700">{learningActivity} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={learningActivity}
                onChange={(e) => setLearningActivity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

          </div>

          {/* Model Selector & Action Button */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Algorithm Selection (Optional Override)
              </label>
              <select
                value={modelOverride}
                onChange={(e) => setModelOverride(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
              >
                <option value="">-- Google Gemini 1.5 Flash (Active AI Engine) --</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <button
              onClick={runEstimation}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Statistical Projection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Performance Estimation</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Estimation Output, Prediction Interval, Explainability, Recommendations */}
        <div className="lg:col-span-6 space-y-6">
          
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
              {error}
            </div>
          )}

          {estimationResult && (
            <>
              {/* Early Support Triggers Banner */}
              {estimationResult.early_support_triggers && estimationResult.early_support_triggers.length > 0 && (
                <EarlyWarningAlert 
                  triggers={estimationResult.early_support_triggers} 
                  studentId={selectedStudentId}
                  studentName={studentName}
                />
              )}

              {/* Main Estimation Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                      Estimated Academic Outcome
                    </span>
                    <div className="flex items-baseline space-x-3 mt-1">
                      <span className="text-5xl font-black text-slate-900 font-mono">
                        {estimationResult.estimated_score}
                      </span>
                      <span className="text-xl text-slate-500 font-semibold">/ 100</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      90% Confidence Interval: [{estimationResult.lower_bound} – {estimationResult.upper_bound}]
                    </p>
                  </div>

                  <div className="flex flex-col items-start sm:items-end space-y-1.5">
                    <PerformanceBadge category={estimationResult.performance_category} size="lg" />
                    <PriorityBadge priority={estimationResult.support_priority} />
                    <span className="text-[11px] text-slate-400 font-mono pt-1">
                      Model: {estimationResult.model_name}
                    </span>
                  </div>
                </div>

                {/* Educational Disclaimer */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{estimationResult.disclaimer}</span>
                </div>
              </div>

              {/* Explainable Feature Attribution (Why this estimate?) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Explainable Feature Attribution
                    </h3>
                    <p className="text-xs text-slate-500">
                      Breakdown of factors driving the projection relative to cohort baseline
                    </p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-2.5 pt-2">
                  {estimationResult.feature_impacts.map((f: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-800">{f.label}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded-sm border">
                            {(f.importance_weight * 100).toFixed(1)}% Weight
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{f.insight_note}</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="font-mono text-xs font-bold text-slate-700">{f.value}</span>
                        {f.impact === 'positive' && (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3 mr-0.5" /> +Positive
                          </span>
                        )}
                        {f.impact === 'negative' && (
                          <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            <TrendingDown className="w-3 h-3 mr-0.5" /> -Concern
                          </span>
                        )}
                        {f.impact === 'neutral' && (
                          <span className="inline-flex items-center text-[10px] font-medium text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                            <Minus className="w-3 h-3 mr-0.5" /> Neutral
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Pedagogical Recommendations */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Personalized Pedagogical Action Plan
                    </h3>
                    <p className="text-xs text-slate-500">
                      Targeted recommendations to optimize academic outcomes
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {estimationResult.recommendations.map((rec: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border space-y-2 ${
                        rec.priority === 'High' 
                          ? 'bg-rose-50/50 border-rose-200' 
                          : rec.priority === 'Medium'
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                        <PriorityBadge priority={rec.priority} />
                      </div>
                      
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Recommended Action Steps:
                        </p>
                        <ul className="space-y-1">
                          {rec.action_steps.map((step: string, sIdx: number) => (
                            <li key={sIdx} className="text-xs text-slate-700 flex items-start space-x-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
};
