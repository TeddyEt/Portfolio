import { CheckCircle2, UserCheck, GraduationCap, MapPin } from 'lucide-react';

export default function About({ profile = {} }) {
  const {
    location = 'Addis Ababa, Ethiopia',
    status = '4th Year Computer Science Senior',
    institution = 'Hope Enterprise University College',
    aboutIntro = 'A builder focused on clarity, performance, and clean code.',
    aboutDescription = 'I enjoy solving real-world challenges through software. My focus is on full-stack web engineering with React, Next.js, Node.js, and relational databases, complemented by a deep analytical foundation in C++ and systems programming.',
  } = profile;

  return (
    <section className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30" id="about" data-reveal>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-2">About Me</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {aboutIntro}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base">
            <p>
              {aboutDescription}
            </p>
            <p>
              Currently in my senior year at Hope Enterprise University College, I have developed comprehensive academic and extracurricular software projects—ranging from automated student feedback collection systems and course enrollment portals to C++ object-oriented data structures applications.
            </p>
            <p>
              My goal is to join a forward-thinking engineering team where I can contribute to modern React, Next.js, and Node.js codebases while continuously learning industry best practices in scalable system design.
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Responsive & Accessible UI Engineering</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Full-Stack API & Database Architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Strong Algorithmic Core (C++ / OOP)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Git Collaboration & Clean Code</span>
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quick Highlights
            </h3>

            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Degree & Year</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{status}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{institution}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Availability</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Open to Roles & Internships</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Full-Stack, Frontend (React/Next.js)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
