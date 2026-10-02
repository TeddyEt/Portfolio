import { Code, Database, Cpu, Wrench } from 'lucide-react';

const categoryIcons = {
  'Frontend Engineering': Code,
  'Backend & Databases': Database,
  'Core & Systems': Cpu,
  'Tools & Workflow': Wrench,
};

export default function Skills({ skills = [] }) {
  return (
    <section className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30" id="skills" data-reveal>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-2">Technical Skills</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Languages, Frameworks & Tooling
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Core stack competencies developed through extensive 4th-year computer science coursework and hands-on system building.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((group) => {
            const Icon = categoryIcons[group.category] || Code;
            return (
              <div
                key={group.category}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items?.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
