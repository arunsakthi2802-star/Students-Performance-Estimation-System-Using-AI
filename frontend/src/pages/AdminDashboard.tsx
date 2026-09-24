import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Shield, 
  Users, 
  Cpu, 
  UploadCloud, 
  FileText, 
  RefreshCw, 
  CheckCircle, 
  Database, 
  Layers,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';

export const AdminDashboard: React.FC = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      setAdminData(res.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainMsg(null);
    try {
      const res = await api.post('/ml/train');
      setRetrainMsg(`Models successfully retrained! Active champion: ${res.data.champion_model} (R² = ${res.data.metrics.r2_score})`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Model retraining failed.');
    } finally {
      setRetraining(false);
    }
  };

  if (loading || !adminData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading administrative management panel...</p>
      </div>
    );
  }

  const { user_roles, total_users, total_students, registered_models, recent_uploads } = adminData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              System Administrator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Administrative Governance & ML Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            User access control, dataset ingestion audits, ML model retraining & system-wide analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {retraining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Retraining Models...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Retrain ML Models</span>
              </>
            )}
          </button>
        </div>
      </div>

      {retrainMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{retrainMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Registered Accounts"
          value={total_users}
          subtitle="System authentication users"
          icon={<Shield className="w-6 h-6" />}
          colorScheme="purple"
        />

        <MetricCard
          title="Students in Database"
          value={total_students}
          subtitle="Unique student profiles"
          icon={<Users className="w-6 h-6" />}
          colorScheme="blue"
        />

        <MetricCard
          title="Candidate ML Models"
          value={registered_models.length}
          subtitle="Trained regression algorithms"
          icon={<Cpu className="w-6 h-6" />}
          colorScheme="emerald"
        />

        <MetricCard
          title="Dataset Ingestion Batches"
          value={recent_uploads.length}
          subtitle="Audited spreadsheet imports"
          icon={<UploadCloud className="w-6 h-6" />}
          colorScheme="amber"
        />
      </div>

      {/* User Roles Breakdown & Quick Nav Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Roles Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">User Roles Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100">
              <span className="text-xs font-semibold text-blue-800">Students</span>
              <span className="font-mono font-bold text-blue-900 text-sm">{user_roles['student'] || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-800">Faculty / Teachers</span>
              <span className="font-mono font-bold text-indigo-900 text-sm">{user_roles['teacher'] || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/70 border border-purple-100">
              <span className="text-xs font-semibold text-purple-800">Administrators</span>
              <span className="font-mono font-bold text-purple-900 text-sm">{user_roles['admin'] || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Access Module Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/models"
            className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">ML Registry & Activation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Benchmark evaluation metrics (MAE, RMSE, R²), view feature importance, and switch active champion inference model.
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-600 mt-4 flex items-center space-x-1">
              <span>Open Model Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/upload-dataset"
            className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Dataset Ingestion & Quality</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload departmental CSV/XLSX spreadsheets, perform pre-ingestion anomaly checks, and stream into the database.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-4 flex items-center space-x-1">
              <span>Upload Spreadsheets</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

      </div>

      {/* Model Registry Summary Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Machine Learning Candidate Models</h3>
            <p className="text-xs text-slate-500">Evaluated on cross-validated educational continuous assessment data</p>
          </div>
          <Link to="/models" className="text-xs font-semibold text-blue-600 hover:underline">
            Manage in Model Studio →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Model Name</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">R² Score</th>
                <th className="py-3 px-4">MAE (Error)</th>
                <th className="py-3 px-4">RMSE</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {registered_models.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {m.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    v{m.version}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                    {m.r2_score}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    ±{m.mae}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {m.rmse}
                  </td>
                  <td className="py-3 px-4">
                    {m.is_active ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center w-max space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active Champion</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        Registered
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Ingestion Audit Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Dataset Ingestion & Data Quality Audits</h3>
        
        {recent_uploads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Rows Imported</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recent_uploads.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {u.filename}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {u.row_count} records
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.uploaded_by || 'Administrator'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No dataset uploads recorded yet.</p>
        )}
      </div>

    </div>
  );
};
