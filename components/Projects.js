'use client';

import { useState } from 'react';
import { Github, ExternalLink, Info, FolderGit2 } from 'lucide-react';
import ProjectModal from './ProjectModal';

export default function Projects({ projects = [] }) {
  const [filter, setFilter] = useState('all');
  const [activeModalProject, setActiveModalProject] = useState(null);

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'web', label: 'Web & Full-Stack' },
    { id: 'cpp', label: 'C++ & Algorithms' },
  ];

  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    return project.category === filter;
  });

  return (
    <section className="py-20 border-t border-slate-200 dark:border-slate-800/80" id="projects" data-reveal>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-2">Portfolio</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Featured Systems & Applications
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Practical software engineering projects spanning full-stack web and object-oriented architectures.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  filter === cat.id
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-900/60 flex flex-col"
            >
              {/* Image Preview with overlay */}
              <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800 flex items-center justify-center">
                {project.image ? (
                  <>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center text-slate-400">
                      <FolderGit2 className="w-10 h-10 stroke-1" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FolderGit2 className="w-10 h-10 stroke-1" />
                  </div>
                )}
                {project.featured && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                    Featured
                  </span>
                )}
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 mb-3 line-clamp-1">
                    {project.tagline}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-4">
                    {project.description}
                  </p>
                </div>

                <div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags?.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setActiveModalProject(project)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                          title="GitHub Source"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noreferrer"
                          title="Live Demo"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={activeModalProject}
        isOpen={Boolean(activeModalProject)}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
}
