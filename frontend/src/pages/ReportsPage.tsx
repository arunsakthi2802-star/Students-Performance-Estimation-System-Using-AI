import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  GraduationCap, 
  Award, 
  Calendar, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PerformanceBadge } from '../components/PerformanceBadge';
import { PriorityBadge } from '../components/PriorityBadge';

export const ReportsPage: React.FC = () => {
  const { studentId: paramStudentId } = useParams<{ studentId?: string }>();

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(paramStudentId || 'STU1001');
  const [reportCard, setReportCard] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [exportDept, setExportDept] = useState<string>('');
  const [exportSem, setExportSem] = useState<number | ''>('');

  useEffect(() => {
    fetchStudentList();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchReportCard(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchStudentList = async () => {
    try {
      const res = await api.get('/students', { params: { limit: 50 } });
      setStudents(res.data.items || []);
    } catch (err) {
      console.error('Failed to load students list', err);
    }
  };

  const fetchReportCard = async (sid: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/student/${sid}/report-card`);
      setReportCard(res.data);
    } catch (err) {
      console.error('Failed to fetch report card', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    let url = '/api/reports/export-csv';
    const params = new URLSearchParams();
    if (exportDept) params.append('department', exportDept);
    if (exportSem) params.append('semester', exportSem.toString());
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Institutional Reports
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Student Academic Reports & CSV Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate printable individual grade cards and export class assessment spreadsheets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center space-x-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Grade Card</span>
          </button>
        </div>
      </div>

      {/* CSV Export Bar (Hidden when printing) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 print:hidden">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Download className="w-4 h-4 text-blue-600" />
          <span>Export Consolidated Class Spreadsheet (CSV)</span>
        </h3>

        <div className="flex flex-wrap items-center gap-4">
          <select
            value={exportDept}
            onChange={(e) => setExportDept(e.target.value)}
            className="px-3 py-2 border rounded-xl text-xs bg-white text-slate-700"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Computer Applications">Computer Applications</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
          </select>

          <select
            value={exportSem}
            onChange={(e) => setExportSem(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 border rounded-xl text-xs bg-white text-slate-700"
          >
            <option value="">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Student Selector Bar (Hidden when printing) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3 w-full max-w-md">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
            Select Student:
          </span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-xs bg-white text-slate-800"
          >
            {students.map((s) => (
              <option key={s.id} value={s.student_id}>
                {s.student_id} - {s.name} ({s.department})
              </option>
            ))}
          </select>
        </div>

        <Link
          to={`/students/${selectedStudentId}`}
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
        >
          <span>View Student Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Printable Report Card Document */}
      {reportCard && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg space-y-8 print:border-none print:shadow-none print:p-0">
          
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xl print:text-black">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Department of Computer Science & Information Technology
                </h2>
                <p className="text-xs text-slate-600 font-semibold tracking-wide">
                  Students Performance Estimation System Using AI • Project by Nithyasri S
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold pt-2">
              Official Academic Performance & Early Estimation Statement
            </p>
          </div>

          {/* Student Profile Metadata Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Student Name</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{reportCard.student.name}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Registration ID</p>
              <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">{reportCard.student.student_id}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Department</p>
              <p className="font-semibold text-slate-800 mt-0.5">{reportCard.student.department}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Semester & Year</p>
              <p className="font-semibold text-slate-800 mt-0.5">Sem {reportCard.student.semester} ({reportCard.student.academic_year})</p>
            </div>
          </div>

          {/* Aggregate Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold">Total Courses Recorded</p>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{reportCard.academic_summary.total_courses}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold">Aggregate Attendance</p>
              <p className={`text-2xl font-bold font-mono mt-1 ${reportCard.academic_summary.aggregate_attendance < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {reportCard.academic_summary.aggregate_attendance}%
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold">Continuous Internals Average</p>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{reportCard.academic_summary.aggregate_internal_marks} / 100</p>
            </div>
          </div>

          {/* Course-Wise Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Continuous Assessment Course Record
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-[11px] font-bold uppercase text-slate-700">
                    <th className="py-2.5 px-3">Subject Code</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-3 text-center">Attendance %</th>
                    <th className="py-2.5 px-3 text-center">Internals (100)</th>
                    <th className="py-2.5 px-3 text-center">Practicals (100)</th>
                    <th className="py-2.5 px-3 text-center">Assignment (100)</th>
                    <th className="py-2.5 px-3 text-center">Final Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportCard.course_breakdown.map((c: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.subject_code}</td>
                      <td className="py-2.5 px-3 text-slate-800">{c.subject_name}</td>
                      <td className="py-2.5 px-3 font-mono text-center">{c.attendance_percentage}%</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-center">{c.internal_marks}</td>
                      <td className="py-2.5 px-3 font-mono text-center">{c.practical_score}</td>
                      <td className="py-2.5 px-3 font-mono text-center">{c.assignment_score}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-900">
                        {c.recorded_target_score !== null ? c.recorded_target_score : 'Continuous'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Estimation Section in Report */}
          {reportCard.ai_estimations && reportCard.ai_estimations.length > 0 && (
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Latest AI Continuous Assessment Projection
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Algorithm: {reportCard.ai_estimations[0].model_name}
                </span>
              </div>

              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-extrabold text-blue-950 font-mono">
                  {reportCard.ai_estimations[0].estimated_score}
                </span>
                <span className="text-xs text-blue-700 font-semibold">/ 100</span>
                <span className="text-xs text-slate-500 font-mono">
                  (90% Prediction Interval: {reportCard.ai_estimations[0].lower_bound} – {reportCard.ai_estimations[0].upper_bound})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <PerformanceBadge category={reportCard.ai_estimations[0].performance_category} />
                <PriorityBadge priority={reportCard.ai_estimations[0].support_priority} />
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Notice: Projections are computed by supervised regression trained on historical institutional parameters.
                Intended for continuous academic coaching and early mentoring before semester end.
              </p>
            </div>
          )}

          {/* Signature Block for Official Academic Demonstration */}
          <div className="pt-12 grid grid-cols-3 gap-8 text-center text-xs text-slate-600">
            <div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-2" />
              <p className="font-semibold">Student Signature</p>
              <p className="text-[10px] text-slate-400">{reportCard.student.name}</p>
            </div>
            <div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-2" />
              <p className="font-semibold">Faculty Mentor / Teacher</p>
              <p className="text-[10px] text-slate-400">Dr. S. Natarajan</p>
            </div>
            <div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-2" />
              <p className="font-semibold">Head of Department</p>
              <p className="text-[10px] text-slate-400">Department of Computer Science</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
            Document generated by Students Performance Estimation System Using AI • Project Developer: Nithyasri S
          </div>
        </div>
      )}

    </div>
  );
};
