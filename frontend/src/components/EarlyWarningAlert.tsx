import React from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EarlyWarningAlertProps {
  triggers: string[];
  studentId?: string;
  studentName?: string;
}

export const EarlyWarningAlert: React.FC<EarlyWarningAlertProps> = ({
  triggers,
  studentId,
  studentName
}) => {
  if (!triggers || triggers.length === 0) return null;

  const hasCritical = triggers.some(t => t.includes('CRITICAL'));

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border transition-all ${
      hasCritical 
        ? 'bg-rose-50/90 border-rose-200 text-rose-900 shadow-xs shadow-rose-100'
        : 'bg-amber-50/90 border-amber-200 text-amber-900 shadow-xs shadow-amber-100'
    }`}>
      <div className="flex items-start space-x-3">
        <div className="shrink-0 mt-0.5">
          {hasCritical ? (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold tracking-tight">
              {hasCritical ? 'Critical Academic Priority Interventions Triggered' : 'Institutional Academic Advisory Triggers'}
            </h4>
            {studentId && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-white/70 border border-slate-200 text-slate-700">
                {studentId}
              </span>
            )}
          </div>
          
          {studentName && (
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Identified student: <span className="text-slate-900 font-semibold">{studentName}</span>
            </p>
          )}

          <div className="mt-2 space-y-1.5">
            {triggers.map((trigger, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                <span>{trigger}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-current/10 flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1 opacity-80">
              <Info className="w-3.5 h-3.5" />
              <span>Early faculty counseling recommended prior to semester terminal examinations.</span>
            </span>
            {studentId && (
              <Link 
                to={`/students/${studentId}`}
                className="font-semibold underline hover:no-underline flex items-center space-x-0.5"
              >
                <span>View Full Student File</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
