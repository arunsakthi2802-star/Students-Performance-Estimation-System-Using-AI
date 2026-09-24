import React, { useState } from 'react';
import api from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Download, 
  Loader2, 
  Layers, 
  ArrowRight,
  Database
} from 'lucide-react';

export const DatasetUploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subjectCode, setSubjectCode] = useState('CS401');
  const [subjectName, setSubjectName] = useState('Design and Analysis of Algorithms');
  const [semester, setSemester] = useState<number>(4);

  const [previewResult, setPreviewResult] = useState<any>(null);
  const [validating, setValidating] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewResult(null);
      setImportSuccess(null);
      setError(null);
      validateFile(file);
    }
  };

  const validateFile = async (file: File) => {
    setValidating(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/datasets/validate-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreviewResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Spreadsheet validation failed.');
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    setError(null);
    setImportSuccess(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('subject_code', subjectCode);
    formData.append('subject_name', subjectName);
    formData.append('semester', semester.toString());

    try {
      const res = await api.post('/datasets/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportSuccess(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to import dataset records.');
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = 
`student_id,name,department,semester,attendance_percentage,internal_marks,assignment_score,practical_score,previous_semester_percentage,study_hours_per_week,assignment_completion_percentage,learning_activity_score,final_score
STU3001,Nithyasri Sundaram,Computer Science,4,88.5,84.0,92.0,88.0,86.5,22.0,95.0,90.0,87.4
STU3002,Aditi Krishnan,Information Technology,4,92.0,89.0,94.0,90.5,88.0,24.5,96.0,92.0,90.8
STU3003,Arun Kumar,Computer Applications,4,74.0,62.5,70.0,68.0,65.0,14.0,78.0,65.0,66.2
STU3004,Bhavya Ramesh,Software Engineering,4,68.0,55.0,62.0,60.0,58.0,11.0,70.0,55.0,58.4
STU3005,Deepak Sharma,Artificial Intelligence & Data Science,4,58.5,42.0,50.0,48.0,45.0,8.0,56.0,40.0,44.8`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_student_academic_upload.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Data Ingestion Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Academic Dataset Ingestion & Validation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload institutional CSV or XLSX spreadsheets, verify schema constraints, and stream records into the database.
          </p>
        </div>

        <button
          onClick={downloadSampleCSV}
          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center space-x-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 sm:p-12 text-center transition-colors">
          <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Select Student Assessment Spreadsheet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Supports .CSV and .XLSX files. Files will be parsed and checked for column mapping, duplicates, and range validity before import.
          </p>
          <div className="mt-4">
            <label className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all">
              <span>Choose Spreadsheet File</span>
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {selectedFile && (
            <p className="text-xs font-mono font-semibold text-blue-700 mt-3">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {validating && (
          <div className="p-4 text-center text-xs text-slate-600 flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Validating spreadsheet rows and detecting schema anomalies...</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {importSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-bold">{importSuccess}</span>
          </div>
        )}

        {/* Validation Summary & Preview */}
        {previewResult && (
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold">Total Rows</p>
                <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{previewResult.total_rows}</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs text-emerald-700 font-semibold">Valid Rows</p>
                <p className="text-2xl font-black text-emerald-950 font-mono mt-0.5">{previewResult.valid_rows}</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 font-semibold">Duplicate IDs</p>
                <p className="text-2xl font-black text-amber-950 font-mono mt-0.5">{previewResult.duplicate_count}</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <p className="text-xs text-purple-700 font-semibold">Validation Status</p>
                <div className="mt-1">
                  {previewResult.is_valid ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      ✓ Ready for Import
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                      Issues Detected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Validation Issues Notes */}
            {previewResult.validation_issues && previewResult.validation_issues.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Validation Warnings:</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  {previewResult.validation_issues.map((iss: string, idx: number) => (
                    <li key={idx}>{iss}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Course Mapping Input Form */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Assign Course & Semester Context For Ingestion
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Top 10 Rows Preview Table */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                Sample Ingestion Preview (Top 10 Records)
              </h4>
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b text-[11px] font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Student ID</th>
                      <th className="py-2.5 px-3">Attendance %</th>
                      <th className="py-2.5 px-3">Internals</th>
                      <th className="py-2.5 px-3">Practicals</th>
                      <th className="py-2.5 px-3">Assignments</th>
                      <th className="py-2.5 px-3">Study Hrs</th>
                      <th className="py-2.5 px-3">Final Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewResult.preview_data.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-semibold text-blue-700">{row.student_id}</td>
                        <td className="py-2 px-3 font-mono">{row.attendance_percentage}%</td>
                        <td className="py-2 px-3 font-mono">{row.internal_marks}</td>
                        <td className="py-2 px-3 font-mono">{row.practical_score}</td>
                        <td className="py-2 px-3 font-mono">{row.assignment_score}</td>
                        <td className="py-2 px-3 font-mono">{row.study_hours_per_week} hrs</td>
                        <td className="py-2 px-3 font-mono font-semibold text-emerald-700">{row.final_score || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confirm Ingestion Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleConfirmImport}
                disabled={importing || previewResult.valid_rows === 0}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Streaming Records into Database...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Ingest {previewResult.valid_rows} Records</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
