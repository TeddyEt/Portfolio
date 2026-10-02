import {
  ArrowDown,
  FileText,
  Send,
  Sparkles,
  Code2,
  Database,
  Layers,
  Cpu,
  Globe,
  Terminal,
  Server,
  Wrench,
  Workflow,
} from 'lucide-react';

const iconMap = {
  code: { icon: Code2, color: 'text-blue-500' },
  database: { icon: Database, color: 'text-emerald-500' },
  layers: { icon: Layers, color: 'text-purple-500' },
  cpu: { icon: Cpu, color: 'text-amber-500' },
  terminal: { icon: Terminal, color: 'text-rose-500' },
  globe: { icon: Globe, color: 'text-cyan-500' },
  server: { icon: Server, color: 'text-indigo-500' },
  wrench: { icon: Wrench, color: 'text-orange-500' },
  workflow: { icon: Workflow, color: 'text-teal-500' },
};

const defaultFocuses = [
  { id: 'cf-1', label: 'React & Next.js', icon: 'code' },
  { id: 'cf-2', label: 'Node.js & MySQL', icon: 'database' },
  { id: 'cf-3', label: 'C++ & OOP Logic', icon: 'layers' },
];

export default function Hero({ profile = {} }) {
  const {
    name = 'Tewodros Endalamaw',
    status = '4th Year Computer Science Senior',
    institution = 'Hope Enterprise University College',
    location = 'Addis Ababa, Ethiopia',
    heroHeadline = 'Crafting clean, reliable web applications with modern engineering rigor.',
    shortBio = 'Specializing in React, Next.js, and Node.js with a strong problem-solving core in algorithms and C++.',
    cvUrl = '/CV.pdf',
    coreFocus = defaultFocuses,
  } = profile;

  const focusItems = Array.isArray(coreFocus) && coreFocus.length > 0 ? coreFocus : defaultFocuses;

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden subtle-grid" id="top">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{status} • {institution}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.12] mb-6">
            Hi, I’m <span className="text-blue-600 dark:text-blue-400">{name}</span>.
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-slate-800 dark:text-slate-200 leading-snug mb-5">
            {heroHeadline}
          </p>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            {shortBio}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 mb-12">
            <a
              href="#projects"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <span>Explore Projects</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
            >
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Download CV</span>
            </a>

            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Get in Touch</span>
            </a>
          </div>

          {/* Core Tech Pills */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wider text-[11px] text-slate-400 dark:text-slate-500">Core Focus:</span>
            {focusItems.map((item, idx) => {
              const iconKey = (item.icon || 'code').toLowerCase();
              const conf = iconMap[iconKey] || iconMap.code;
              const IconComp = conf.icon;
              return (
                <span key={item.id || idx} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <IconComp className={`w-3.5 h-3.5 ${conf.color}`} />
                  <span>{item.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
