import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  GraduationCap, 
  ArrowLeft, 
  Calendar, 
  BookOpen, 
  Clock, 
  Award, 
  Sparkles, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  Download,
  Loader2,
  X
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { PerformanceBadge } from '../components/PerformanceBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { EarlyWarningAlert } from '../components/EarlyWarningAlert';

export const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Support note modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    priority: 'Medium',
    title: '',
    note: '',
    action_plan: ''
  });
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${studentId}`);
      setProfile(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    setSavingNote(true);
    try {
      await api.post(`/students/${studentId}/notes`, noteForm);
      setShowNoteModal(false);
      setNoteForm({ priority: 'Medium', title: '', note: '', action_plan: '' });
      fetchStudent();
      alert('Support note recorded successfully.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading student profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
          {error || 'Student not found.'}
        </div>
        <Link to="/teacher-dashboard" className="text-xs font-semibold text-blue-600 hover:underline">
          ← Back to Faculty Dashboard
        </Link>
      </div>
    );
  }

  const { aggregates, latest_estimate, academic_records, support_notes } = profile;

  const earlyTriggers: string[] = [];
  if (aggregates.average_attendance < 75.0) {
    earlyTriggers.push(`Attendance Shortage: ${aggregates.average_attendance}% is below 75% university eligibility.`);
  }
  if (aggregates.average_internal_marks < 50.0) {
    earlyTriggers.push(`Internal Exam Notice: Average internal marks (${aggregates.average_internal_marks}/100) indicates high revision requirement.`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation */}
      <div>
        <Link
          to="/teacher-dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Faculty Dashboard</span>
        </Link>
      </div>

      {/* Student Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                {profile.student_id}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • {profile.department} • Semester {profile.semester}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {profile.name}
            </h1>

            <p className="text-xs text-slate-500">
              Email: <span className="font-mono text-slate-700">{profile.email}</span> • Academic Year {profile.academic_year}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNoteModal(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Counseling Note</span>
            </button>

            <Link
              to={`/reports/student/${profile.student_id}`}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Report Card</span>
            </Link>

            <Link
              to="/estimate"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run AI Estimation</span>
            </Link>
          </div>
        </div>
      </div>

      {earlyTriggers.length > 0 && (
        <EarlyWarningAlert triggers={earlyTriggers} studentId={profile.student_id} studentName={profile.name} />
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Attendance Discipline"
          value={`${aggregates.average_attendance}%`}
          subtitle="Mandatory Minimum: 75%"
          icon={<Calendar className="w-6 h-6" />}
          colorScheme={aggregates.average_attendance >= 75 ? 'emerald' : 'rose'}
        />

        <MetricCard
          title="Continuous Internals"
          value={`${aggregates.average_internal_marks} / 100`}
          subtitle="Continuous Exam Avg"
          icon={<Award className="w-6 h-6" />}
          colorScheme="blue"
        />

        <MetricCard
          title="Practical / Lab Score"
          value={`${aggregates.average_practical_marks} / 100`}
          subtitle="Lab experiments average"
          icon={<BookOpen className="w-6 h-6" />}
          colorScheme="purple"
        />

        <MetricCard
          title="Weekly Study Hours"
          value={`${aggregates.average_study_hours} hrs`}
          subtitle="Self-study engagement"
          icon={<Clock className="w-6 h-6" />}
          colorScheme="amber"
        />
      </div>

      {/* AI Estimation Result Card */}
      {latest_estimate && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Current AI Performance Projection
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">
                  {latest_estimate.estimated_score}
                </span>
                <span className="text-slate-500 font-semibold text-lg">/ 100</span>
                <span className="text-xs text-slate-500 font-mono">
                  (90% CI: {latest_estimate.lower_bound} – {latest_estimate.upper_bound})
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <PerformanceBadge category={latest_estimate.performance_category} />
              <PriorityBadge priority={latest_estimate.support_priority} />
            </div>
          </div>
        </div>
      )}

      {/* Academic Records Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Continuous Academic Assessment History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Internal Marks</th>
                <th className="py-3 px-4">Practical Marks</th>
                <th className="py-3 px-4">Assignment Score</th>
                <th className="py-3 px-4">Study Hrs</th>
                <th className="py-3 px-4">Target Exam Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {academic_records.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{r.subject_code}</p>
                    <p className="text-slate-500 text-[11px]">{r.subject_name}</p>
                  </td>
                  <td className="py-3 px-4 font-mono">Sem {r.semester}</td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    <span className={r.attendance_percentage < 75 ? 'text-rose-600' : 'text-slate-700'}>
                      {r.attendance_percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.internal_marks}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{r.practical_score}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{r.assignment_score}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{r.study_hours_per_week} hrs</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {r.target_score || 'Continuous'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Notes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Faculty Counseling & Mentoring History</h3>
          <button
            onClick={() => setShowNoteModal(true)}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>
        </div>

        {support_notes && support_notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {support_notes.map((n: any) => (
              <div key={n.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{n.title}</span>
                  <PriorityBadge priority={n.priority} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.note}</p>
                {n.action_plan && (
                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">Remedial Action: </span>
                    <span className="text-slate-600">{n.action_plan}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Mentor: {n.teacher_name}</span>
                  <span>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No counseling notes recorded yet.</p>
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Add Faculty Counseling Note</h3>
                <p className="text-xs text-slate-500">Student: {profile.name} ({profile.student_id})</p>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Intervention Priority</label>
                <select
                  value={noteForm.priority}
                  onChange={(e) => setNoteForm({ ...noteForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="High">High Academic Priority</option>
                  <option value="Medium">Moderate Monitoring</option>
                  <option value="Good Standing">Good Standing / Commendation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Concern Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit exam 2 algorithms review"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observation & Discussion Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize faculty observation and counseling..."
                  value={noteForm.note}
                  onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remedial Action Plan</label>
                <input
                  type="text"
                  placeholder="e.g. Provide problem worksheets; review next week"
                  value={noteForm.action_plan}
                  onChange={(e) => setNoteForm({ ...noteForm, action_plan: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
