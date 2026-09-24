import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  Award, 
  Calendar, 
  AlertTriangle, 
  Search, 
  Filter, 
  Sliders, 
  FileText, 
  Plus, 
  Eye, 
  MessageSquare,
  Download,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { PriorityBadge } from '../components/PriorityBadge';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [overview, setOverview] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  // Modal state for adding marks
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [markForm, setMarkForm] = useState({
    subject_code: 'CS401',
    subject_name: 'Design and Analysis of Algorithms',
    semester: 4,
    attendance_percentage: 85.0,
    internal_marks: 75.0,
    assignment_score: 80.0,
    practical_score: 80.0,
    previous_semester_percentage: 75.0,
    study_hours_per_week: 16.0,
    assignment_completion_percentage: 85.0,
    learning_activity_score: 80.0,
    target_score: 78.0
  });
  const [savingMark, setSavingMark] = useState(false);

  // Modal state for support note
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    priority: 'Medium',
    title: '',
    note: '',
    action_plan: ''
  });
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, department, semester]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/overview');
      setOverview(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const params: any = { page: 1, limit: 30 };
      if (search) params.search = search;
      if (department) params.department = department;
      if (semester) params.semester = semester;

      const res = await api.get('/students', { params });
      setStudents(res.data.items);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const handleOpenMarkModal = (stu: any) => {
    setSelectedStudent(stu);
    setShowMarkModal(true);
  };

  const handleOpenNoteModal = (stu: any) => {
    setSelectedStudent(stu);
    setShowNoteModal(true);
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSavingMark(true);
    try {
      await api.post('/academic-records', {
        student_id: selectedStudent.student_id,
        ...markForm
      });
      setShowMarkModal(false);
      fetchDashboardData();
      alert(`Academic record recorded successfully for ${selectedStudent.name}!`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to record marks.');
    } finally {
      setSavingMark(false);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSavingNote(true);
    try {
      await api.post(`/students/${selectedStudent.student_id}/notes`, noteForm);
      setShowNoteModal(false);
      setNoteForm({ priority: 'Medium', title: '', note: '', action_plan: '' });
      alert(`Faculty support note logged for ${selectedStudent.name}!`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading || !overview) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading faculty dashboard...</p>
      </div>
    );
  }

  const { metrics, performance_distribution } = overview;

  // Pie chart data
  const pieData = [
    { name: 'Distinction', value: performance_distribution['Distinction'] || 0, color: '#7c3aed' },
    { name: 'First Class', value: performance_distribution['First Class'] || 0, color: '#10b981' },
    { name: 'Pass / Average', value: performance_distribution['Pass / Average'] || 0, color: '#f59e0b' },
    { name: 'Needs Support', value: performance_distribution['Needs Support'] || 0, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Faculty Academic Monitoring Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Department Assessment Overview, Student Roster, Early Intervention Triage & AI Estimation
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/upload-dataset"
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center space-x-2"
          >
            <span>Upload Dataset CSV</span>
          </Link>

          <Link
            to="/estimate"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center space-x-2"
          >
            <Sliders className="w-4 h-4" />
            <span>AI Estimation Studio</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Monitored Students"
          value={metrics.total_students}
          subtitle="Enrolled cohort count"
          icon={<Users className="w-6 h-6" />}
          colorScheme="blue"
        />

        <MetricCard
          title="Class Attendance Avg"
          value={`${metrics.avg_attendance}%`}
          subtitle="Cohort aggregate"
          icon={<Calendar className="w-6 h-6" />}
          colorScheme={metrics.avg_attendance >= 75 ? 'emerald' : 'amber'}
        />

        <MetricCard
          title="Continuous Internal Marks"
          value={`${metrics.avg_internals} / 100`}
          subtitle="Internal assessment average"
          icon={<Award className="w-6 h-6" />}
          colorScheme="purple"
        />

        <MetricCard
          title="Attention Needed"
          value={metrics.attention_needed_count}
          subtitle="At-Risk (Attendance or Internals)"
          icon={<AlertTriangle className="w-6 h-6" />}
          colorScheme="rose"
        />
      </div>

      {/* Cohort Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Department & Cohort Insights</h3>
              <p className="text-xs text-slate-500">Distribution across continuous assessments</p>
            </div>
            <Link to="/reports" className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1">
              <span>View Full Report</span>
              <FileText className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
              <p className="text-xs text-blue-700 font-semibold">Practical Lab Avg</p>
              <p className="text-2xl font-extrabold text-blue-950 font-mono mt-1">{metrics.avg_practicals}</p>
              <p className="text-[11px] text-slate-500">Out of 100 marks</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <p className="text-xs text-emerald-700 font-semibold">Assignment Completion</p>
              <p className="text-2xl font-extrabold text-emerald-950 font-mono mt-1">{metrics.avg_completion_pct}%</p>
              <p className="text-[11px] text-slate-500">Submission rate</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
              <p className="text-xs text-amber-700 font-semibold">Self-Study Average</p>
              <p className="text-2xl font-extrabold text-amber-950 font-mono mt-1">{metrics.avg_study_hours} hrs</p>
              <p className="text-[11px] text-slate-500">Weekly dedicated hours</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
              <p className="text-xs text-purple-700 font-semibold">Active Support Notes</p>
              <p className="text-2xl font-extrabold text-purple-950 font-mono mt-1">{metrics.active_support_notes}</p>
              <p className="text-[11px] text-slate-500">Mentorship cases</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Estimated Categories</h3>
            <p className="text-xs text-slate-500">AI Estimation Distribution</p>
          </div>

          <div className="h-48 w-full my-auto">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={24} iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Run estimations to view distribution
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Roster & Actions Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Student Academic Roster</h3>
            <p className="text-xs text-slate-500">Search students, view continuous marks, run AI estimation, and record counseling notes</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Computer Applications">Computer Applications</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    <Link to={`/students/${s.student_id}`} className="hover:underline">
                      {s.student_id}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {s.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {s.department}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Sem {s.semester}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenMarkModal(s)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs cursor-pointer"
                        title="Enter / Update continuous marks"
                      >
                        Add Marks
                      </button>
                      <button
                        onClick={() => handleOpenNoteModal(s)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs cursor-pointer"
                        title="Add Faculty Counseling Note"
                      >
                        Support Note
                      </button>
                      <Link
                        to={`/students/${s.student_id}`}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Entry Modal */}
      {showMarkModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Record Continuous Assessment Marks</h3>
                <p className="text-xs text-slate-500">Student: {selectedStudent.name} ({selectedStudent.student_id})</p>
              </div>
              <button onClick={() => setShowMarkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={markForm.subject_code}
                    onChange={(e) => setMarkForm({ ...markForm, subject_code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={markForm.subject_name}
                    onChange={(e) => setMarkForm({ ...markForm, subject_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={markForm.attendance_percentage}
                    onChange={(e) => setMarkForm({ ...markForm, attendance_percentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Exam / 100</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={markForm.internal_marks}
                    onChange={(e) => setMarkForm({ ...markForm, internal_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Practical Score / 100</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={markForm.practical_score}
                    onChange={(e) => setMarkForm({ ...markForm, practical_score: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Score / 100</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={markForm.assignment_score}
                    onChange={(e) => setMarkForm({ ...markForm, assignment_score: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Study Hrs / Week</label>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    step="0.5"
                    required
                    value={markForm.study_hours_per_week}
                    onChange={(e) => setMarkForm({ ...markForm, study_hours_per_week: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Completion %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    required
                    value={markForm.assignment_completion_percentage}
                    onChange={(e) => setMarkForm({ ...markForm, assignment_completion_percentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMark}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  {savingMark ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Academic Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Note Modal */}
      {showNoteModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Add Faculty Counseling Note</h3>
                <p className="text-xs text-slate-500">Student: {selectedStudent.name} ({selectedStudent.student_id})</p>
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
                  placeholder="e.g. Mid-term algorithms revision counseling"
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
                  placeholder="Summarize discussion with student regarding attendance, continuous tests, or laboratory concepts..."
                  value={noteForm.note}
                  onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action Plan / Follow-Up</label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled remedial session on Friday; retest scheduled"
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
                  <span>Save Counseling Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
