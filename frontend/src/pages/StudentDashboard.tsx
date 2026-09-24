import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Download, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { PerformanceBadge } from '../components/PerformanceBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { EarlyWarningAlert } from '../components/EarlyWarningAlert';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/profile/me');
      setProfile(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading your student dashboard...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
          {error || 'Student record not found.'}
        </div>
        <Link to="/estimate" className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold">
          <span>Go to AI Estimation Studio</span>
        </Link>
      </div>
    );
  }

  const { aggregates, latest_estimate, academic_records, support_notes } = profile;

  // Chart data: subject wise breakdown
  const chartData = academic_records.map((r: any) => ({
    subject: r.subject_code,
    name: r.subject_name,
    Internals: r.internal_marks,
    Practicals: r.practical_score,
    Assignments: r.assignment_score,
    Attendance: r.attendance_percentage
  }));

  // Early warning triggers
  const earlyTriggers: string[] = [];
  if (aggregates.average_attendance < 75.0) {
    earlyTriggers.push(`Attendance Shortage: ${aggregates.average_attendance}% is below the mandatory 75% institutional limit.`);
  }
  if (aggregates.average_internal_marks < 50.0) {
    earlyTriggers.push(`Continuous Assessment Notice: Internal aggregate (${aggregates.average_internal_marks}/100) indicates revision is needed.`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Student Welcome Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-blue-50 to-indigo-50/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                {profile.student_id}
              </span>
              <span className="text-xs text-slate-500">• Semester {profile.semester} • Academic Year {profile.academic_year}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {profile.name} 👋
            </h1>
            
            <p className="text-sm text-slate-600 max-w-xl">
              Department of {profile.department}. Your continuous assessment records and AI performance estimates are updated.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/reports/student/${profile.student_id}`}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Academic Report Card</span>
            </Link>

            <Link
              to="/estimate"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Performance</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Early Warning Trigger Alert */}
      {earlyTriggers.length > 0 && (
        <EarlyWarningAlert triggers={earlyTriggers} studentId={profile.student_id} />
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Attendance Discipline"
          value={`${aggregates.average_attendance}%`}
          subtitle="Mandatory Minimum: 75%"
          icon={<Calendar className="w-6 h-6" />}
          colorScheme={aggregates.average_attendance >= 75 ? 'emerald' : 'rose'}
          trend={{
            value: aggregates.average_attendance >= 75 ? 'Above Threshold' : 'Shortage',
            isPositive: aggregates.average_attendance >= 75
          }}
        />

        <MetricCard
          title="Internal Assessment"
          value={`${aggregates.average_internal_marks}`}
          subtitle="Continuous Exam Avg / 100"
          icon={<Award className="w-6 h-6" />}
          colorScheme="blue"
        />

        <MetricCard
          title="Practical / Lab Score"
          value={`${aggregates.average_practical_marks}`}
          subtitle="Laboratory Experiments Avg"
          icon={<BookOpen className="w-6 h-6" />}
          colorScheme="purple"
        />

        <MetricCard
          title="Weekly Study Hours"
          value={`${aggregates.average_study_hours} hrs`}
          subtitle="Dedicated Self-Study Time"
          icon={<Clock className="w-6 h-6" />}
          colorScheme="amber"
        />
      </div>

      {/* AI Performance Estimation Card */}
      {latest_estimate ? (
        <div className="bg-linear-to-br from-white to-blue-50/50 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  AI Academic Performance Estimation
                </span>
                <span className="text-xs text-slate-500 font-mono">({latest_estimate.model_name})</span>
              </div>

              <div className="flex items-baseline space-x-3">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono">
                  {latest_estimate.estimated_score}
                </span>
                <span className="text-slate-500 font-semibold text-lg">/ 100</span>
                <span className="text-xs text-slate-500 font-mono">
                  (Confidence Interval: {latest_estimate.lower_bound} – {latest_estimate.upper_bound})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <PerformanceBadge category={latest_estimate.performance_category} />
                <PriorityBadge priority={latest_estimate.support_priority} />
              </div>

              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Estimate calculated using continuous assessment indicators, lab practical ratings, and attendance records.
                This projection serves as an early indicator to support your examination preparation.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs max-w-sm space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Next Milestone Focus</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {latest_estimate.estimated_score >= 80 
                  ? 'Excellent academic trajectory. Maintain your current attendance and coding laboratory consistency to secure Department Honors.'
                  : latest_estimate.estimated_score >= 60
                  ? 'Strong foundational progress. Increasing weekly self-study by 3 hours and revising unit tests can boost your score into Distinction range.'
                  : 'Faculty mentoring is recommended. Prioritize attending all remaining lecture hours and review sample internal question papers.'
                }
              </p>
              <Link to="/estimate" className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center space-x-1">
                <span>Run Interactive Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">No AI estimation recorded yet.</p>
          <Link to="/estimate" className="text-xs text-blue-600 font-bold hover:underline">
            Run your first estimation in the AI Studio →
          </Link>
        </div>
      )}

      {/* Subject-Wise Analytics Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Course-Wise Continuous Assessment Analytics</h3>
            <p className="text-xs text-slate-500">Comparison of Internal Exam marks, Lab Practicals, and Assignment Scores</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="subject" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Internals" fill="#2563eb" radius={[4, 4, 0, 0]} name="Internal Exam (100)" />
              <Bar dataKey="Practicals" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Practical Lab (100)" />
              <Bar dataKey="Assignments" fill="#0891b2" radius={[4, 4, 0, 0]} name="Assignment Score (100)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrolled Courses Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Enrolled Courses & Assessment Records</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Internal Marks</th>
                <th className="py-3 px-4">Assignment Score</th>
                <th className="py-3 px-4">Practical Marks</th>
                <th className="py-3 px-4">Study Hrs/Wk</th>
                <th className="py-3 px-4">Target Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {academic_records.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{r.subject_code}</p>
                    <p className="text-slate-500 text-[11px]">{r.subject_name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-semibold ${r.attendance_percentage < 75 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {r.attendance_percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {r.internal_marks} / 100
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {r.assignment_score}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {r.practical_score}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {r.study_hours_per_week} hrs
                  </td>
                  <td className="py-3 px-4">
                    {r.target_score ? (
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                        {r.target_score}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Continuous</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Support Notes */}
      {support_notes && support_notes.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Faculty Counseling & Support Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {support_notes.map((n: any) => (
              <div key={n.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{n.title}</span>
                  <PriorityBadge priority={n.priority} />
                </div>
                <p className="text-xs text-slate-600">{n.note}</p>
                {n.action_plan && (
                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">Action Plan: </span>
                    <span className="text-slate-600">{n.action_plan}</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-400">Recorded by: {n.teacher_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
