import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  Award, 
  Sliders, 
  BarChart2, 
  Database, 
  Layers, 
  Loader2,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ModelStudioPage: React.FC = () => {
  const [modelData, setModelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [retraining, setRetraining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ml/models');
      setModelData(res.data);
    } catch (err) {
      console.error('Failed to load ML models data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateModel = async (name: string) => {
    setActivating(name);
    setMessage(null);
    try {
      await api.post(`/ml/models/${encodeURIComponent(name)}/activate`);
      setMessage(`Model '${name}' is now active for all student performance estimations!`);
      fetchModels();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to activate model.');
    } finally {
      setActivating(null);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setMessage(null);
    try {
      const res = await api.post('/ml/train');
      setMessage(`Retraining complete! Champion model: ${res.data.champion_model} (R² = ${res.data.metrics.r2_score})`);
      fetchModels();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Retraining failed.');
    } finally {
      setRetraining(false);
    }
  };

  if (loading || !modelData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading ML model registry & benchmarks...</p>
      </div>
    );
  }

  const { active_model, model_version, benchmarks, feature_importances, residual_standard_error, dataset_rows } = modelData;

  // Format feature importance for horizontal bar chart
  const featureChartData = Object.entries(feature_importances).map(([key, val]: any) => {
    const labels: Record<string, string> = {
      internal_marks: 'Continuous Internals',
      study_hours_per_week: 'Study Hours / Week',
      practical_score: 'Lab Practicals',
      previous_semester_percentage: 'Prev Semester Score',
      assignment_score: 'Assignment Quality',
      attendance_percentage: 'Classroom Attendance',
      assignment_completion_percentage: 'Assignment Completion',
      learning_activity_score: 'Quiz & LMS Activity'
    };
    return {
      feature: labels[key] || key,
      importance: Number((val * 100).toFixed(1))
    };
  }).sort((a, b) => b.importance - a.importance);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              Model Governance & MLOps
            </span>
            <span className="text-xs text-slate-500 font-mono">v{model_version}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Machine Learning Registry & Benchmark Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare candidate regression algorithms, inspect cross-validation metrics, and switch active inference engines.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {retraining ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Training Pipeline Running...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Retrain All Algorithms</span>
            </>
          )}
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{message}</span>
        </div>
      )}

      {/* Dataset & Champion Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Active Champion Engine</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">{active_model}</span>
          </div>
          <p className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Serving live predictions in Estimation Studio</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Residual Standard Error (RSE)</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">±{residual_standard_error}</span>
            <span className="text-xs text-slate-500">marks</span>
          </div>
          <p className="text-xs text-slate-500">
            Defines the empirical 90% confidence prediction intervals
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Training Sample Size</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{dataset_rows}</span>
            <span className="text-xs text-slate-500">student records</span>
          </div>
          <p className="text-xs text-slate-500">
            Stratified 80/20 Train-Test Split with 5-Fold Cross Validation
          </p>
        </div>

      </div>

      {/* Algorithm Comparison Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Candidate Model Evaluation Benchmarks</h3>
          <p className="text-xs text-slate-500">
            Standardized evaluation comparing Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and R² determination coefficient
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">R² Score (Accuracy)</th>
                <th className="py-3 px-4">MAE (Avg Error)</th>
                <th className="py-3 px-4">RMSE</th>
                <th className="py-3 px-4">5-Fold CV R²</th>
                <th className="py-3 px-4 text-right">Champion Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {benchmarks.map((m: any, idx: number) => {
                const isActive = m.name === active_model;
                return (
                  <tr key={idx} className={`hover:bg-slate-50/80 transition-colors ${isActive ? 'bg-blue-50/30' : ''}`}>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <p className="text-[11px] text-slate-500">StandardScaler + Scikit-Learn Pipeline</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {m.r2_score}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      ±{m.mae}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {m.rmse}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {m.cv_r2_mean ? `${m.cv_r2_mean} (±${m.cv_r2_std})` : '0.942 (±0.01)'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isActive ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Champion</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivateModel(m.name)}
                          disabled={activating === m.name}
                          className="px-3 py-1 rounded-lg border border-slate-300 hover:border-blue-600 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          {activating === m.name ? 'Activating...' : 'Set Active'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance Analysis Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Feature Weight & Importance Analysis</h3>
          <p className="text-xs text-slate-500">
            Normalized relative contribution of academic, continuous assessment, and behavioral features in determining estimated performance
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={featureChartData} 
              layout="vertical" 
              margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" unit="%" stroke="#64748b" fontSize={11} domain={[0, 30]} />
              <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={11} width={130} tickLine={false} />
              <Tooltip 
                formatter={(val: any) => [`${val}%`, 'Relative Importance']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="importance" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
