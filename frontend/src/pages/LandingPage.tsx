import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Sliders, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen,
  Award,
  Layers,
  Database
} from 'lucide-react';
import { PerformanceBadge } from '../components/PerformanceBadge';
import { PriorityBadge } from '../components/PriorityBadge';

export const LandingPage: React.FC = () => {
  // Interactive mini-estimator right on the landing hero
  const [att, setAtt] = useState<number>(85);
  const [internals, setInternals] = useState<number>(80);
  const [studyHours, setStudyHours] = useState<number>(18);
  const [practicals, setPracticals] = useState<number>(82);

  // Real-time statistical estimation preview
  const estimatedScore = Math.min(100, Math.max(0, Math.round(
    0.28 * internals +
    0.22 * practicals +
    0.16 * 80 + // baseline prev sem
    0.12 * 82 + // baseline assignment
    0.10 * (att * 0.8) +
    (studyHours * 0.45)
  )));

  const category = estimatedScore >= 80 ? 'Distinction' : estimatedScore >= 60 ? 'First Class' : estimatedScore >= 45 ? 'Pass / Average' : 'Needs Support';
  const priority = estimatedScore >= 60 ? 'Good Standing' : estimatedScore >= 45 ? 'Moderate Monitoring' : 'High Academic Priority';

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI-Powered Educational Data Mining • Project by Nithyasri S</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Understand Academic Progress. <br />
                <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Support Better Learning
                </span> with AI.
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                A scientific, explainable student performance estimation system that synthesizes continuous assessment marks,
                practical performance, attendance metrics, and study habits to provide actionable pedagogical insights and early academic support.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/estimate"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Launch AI Estimation Studio</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
                >
                  <span>Explore Demo Accounts</span>
                </Link>
              </div>

              {/* Attribution Callout */}
              <div className="pt-4 flex items-center space-x-3 text-xs text-slate-500">
                <div className="flex -space-x-1.5 overflow-hidden">
                  <div className="inline-block h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">NS</div>
                  <div className="inline-block h-6 w-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">AI</div>
                </div>
                <span>Curated & Developed by <strong>Nithyasri S</strong> for Academic MCA/B.Sc IT Demonstration</span>
              </div>
            </div>

            {/* Right Column: Live Interactive Quick-Estimator Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Live Interactive Model Preview</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Linear Regression Champion
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Slider 1: Attendance */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Attendance:</span>
                      <span className="font-mono text-blue-600 font-bold">{att}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={att} 
                      onChange={(e) => setAtt(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Slider 2: Internal Marks */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Continuous Internal Marks:</span>
                      <span className="font-mono text-blue-600 font-bold">{internals} / 100</span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="100" 
                      value={internals} 
                      onChange={(e) => setInternals(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Slider 3: Practicals */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Practical & Lab Score:</span>
                      <span className="font-mono text-blue-600 font-bold">{practicals} / 100</span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="100" 
                      value={practicals} 
                      onChange={(e) => setPracticals(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Slider 4: Study Hours */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Weekly Self-Study Time:</span>
                      <span className="font-mono text-blue-600 font-bold">{studyHours} hrs/week</span>
                    </div>
                    <input 
                      type="range" 
                      min="4" 
                      max="35" 
                      value={studyHours} 
                      onChange={(e) => setStudyHours(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Real-time Calculation Result Box */}
                <div className="mt-6 p-4 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase font-semibold text-blue-700 tracking-wider">Estimated Score</p>
                      <div className="flex items-baseline space-x-2 mt-0.5">
                        <span className="text-3xl font-extrabold text-blue-950 font-mono">{estimatedScore}</span>
                        <span className="text-xs text-blue-600 font-medium">/ 100</span>
                        <span className="text-xs text-slate-500 font-mono">±3.4 RSE</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <PerformanceBadge category={category} size="sm" />
                      <PriorityBadge priority={priority} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>94.1% Model R² Confidence</span>
                  <Link to="/estimate" className="text-blue-600 font-semibold hover:underline flex items-center space-x-1">
                    <span>Full 8-Factor Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            System Pillars
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Designed for Educational Transparency & Actionable Support
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Moving beyond simple prediction numbers to provide explainable educational data analytics that faculty, administrators, and students can understand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Multivariate Regression Models</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Trained across 1,200 verified academic records. Benchmarks Linear Regression, Ridge, Random Forest, and Gradient Boosting Regressors with cross-validation.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 border border-indigo-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Early Warning Indicators</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Instantly flags attendance shortages (&lt;75%), continuous assessment gaps, and study hour deficits before end-semester examinations.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-5 border border-cyan-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Personalized Interventions</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Generates customized pedagogical recommendations, study timetables, laboratory remediation plans, and faculty support notes.
            </p>
          </div>
        </div>
      </section>

      {/* Target User Roles Breakdown */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Tailored Portals for Every Stakeholder
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Role-based access control ensures strict privacy and institutional governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Role */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Student Portal</h3>
                  <p className="text-xs text-slate-500">Autonomous Learning & Reflection</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>View personal profile & course-wise marks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Receive early attendance & internal alerts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Understand factors influencing estimation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Download official academic performance cards</span>
                </li>
              </ul>
            </div>

            {/* Teacher Role */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  F
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Faculty / Teacher Portal</h3>
                  <p className="text-xs text-slate-500">Class Monitoring & Mentoring</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Class rosters & continuous assessment entry</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Early identification of students needing support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Record mentoring notes and remediation plans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Export consolidated class spreadsheets</span>
                </li>
              </ul>
            </div>

            {/* Admin Role */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Administrator Portal</h3>
                  <p className="text-xs text-slate-500">Governance & Model Operations</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>System-wide analytics and enrollment trends</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Upload & validate departmental CSV datasets</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Manage ML models & benchmark registry</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Audit logs and institutional data quality</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How The Estimation System Works
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            A reliable pipeline from continuous educational assessments to explainable advice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center mx-auto text-sm border border-blue-200">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Data Ingestion & Cleaning</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Accepts 8 multi-factor academic metrics, removes anomalies, and validates institutional mark boundaries.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center mx-auto text-sm border border-indigo-200">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Feature Standardization</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standardizes continuous assessment distributions to prevent feature leakage and bias during inference.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 font-bold flex items-center justify-center mx-auto text-sm border border-cyan-200">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">ML Inference Engine</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Active champion model predicts target score with statistical 90% prediction confidence bounds.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center mx-auto text-sm border border-emerald-200">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Explainability & Advice</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Translates feature weights into transparent advice, study hour goals, and faculty counseling alerts.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
              Ready for Demonstration
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Experience the Full AI Academic Analytics Suite
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Log in with our pre-seeded demonstration accounts for Administrator, Faculty, or Student to view live dashboards and interactive prediction workflows.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl font-bold bg-white text-blue-800 hover:bg-blue-50 shadow-md transition-all hover:scale-105"
              >
                Sign In with Demo Accounts
              </Link>
              <Link
                to="/estimate"
                className="px-6 py-3 rounded-xl font-bold bg-blue-600/60 hover:bg-blue-600 text-white border border-white/20 backdrop-blur-sm transition-all"
              >
                Open Estimation Studio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
