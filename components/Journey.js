import { GraduationCap, Award, Briefcase } from 'lucide-react';

const typeIcons = {
  education: GraduationCap,
  certification: Award,
  experience: Briefcase,
};

export default function Journey({ journey = [] }) {
  return (
    <section className="py-20 border-t border-slate-200 dark:border-slate-800/80" id="journey">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-2">Background</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Academic Journey & Certifications
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Formal education, industry bootcamps, and foundational milestones.
          </p>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-10">
          {journey.map((item, idx) => {
            const Icon = typeIcons[item.type] || GraduationCap;
            return (
              <div key={idx} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                </div>

                {/* Content Card */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                      <Icon className="w-3.5 h-3.5" />
                      {item.year}
                    </span>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5 mb-2">
                    {item.organization}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
