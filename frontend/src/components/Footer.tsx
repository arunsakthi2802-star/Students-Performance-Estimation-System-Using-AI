import React from 'react';
import { GraduationCap, ShieldCheck, Heart, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Attribution */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Students Performance Estimation System Using AI
              </span>
            </div>
            
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              An educational data mining and explainable AI web application designed to analyze multidimensional
              student academic, attendance, and continuous assessment data for early learning intervention.
            </p>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 max-w-md">
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Academic Project Attribution</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Developed by: <span className="font-bold text-white">Nithyasri S</span>
              </p>
              <p className="text-xs text-slate-400">
                MCA / B.Sc. Computer Science & IT Major Project Demonstration
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Application Modules
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/estimate" className="hover:text-blue-400 transition-colors">AI Estimation Studio</Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-blue-400 transition-colors">Model Benchmarks & Metrics</Link>
              </li>
              <li>
                <Link to="/upload-dataset" className="hover:text-blue-400 transition-colors">Dataset Ingestion & Validation</Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-blue-400 transition-colors">Performance Reports & Export</Link>
              </li>
              <li>
                <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>FastAPI OpenAPI Docs</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Responsible AI & Ethics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Ethical AI & Transparency
            </h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Predictions are probabilistic estimates to assist faculty counseling and early student revision.
                </span>
              </div>
              <p className="pt-2 text-slate-500">
                Not a definitive examination grade or irrevocable student judgment. Privacy and academic integrity protected.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Students Performance Estimation System Using AI. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Designed & Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>by <strong className="text-slate-300">Nithyasri S</strong></span>
          </p>
        </div>
      </div>
    </footer>
  );
};
