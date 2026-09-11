import React from 'react';

function ModulePlaceholder({ title, description, icon: Icon, phaseNumber }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mx-auto mb-4">
        {Icon && <Icon className="w-7 h-7" />}
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3 border border-brand-200">
        Phase {phaseNumber} Module
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">{description}</p>
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-mono text-left max-w-md mx-auto">
        Status: Scaffolded in Phase 4 Foundation. Full CRUD, forms, and tables being linked sequentially.
      </div>
    </div>
  );
}

export default ModulePlaceholder;
