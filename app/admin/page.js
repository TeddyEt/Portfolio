'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  Save,
  Plus,
  Trash2,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  UserCog,
  FolderGit2,
  Cpu,
  GraduationCap,
  KeyRound,
  Download,
  ArrowLeft,
  MoveUp,
  MoveDown,
} from 'lucide-react';

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Data state
  const [data, setData] = useState({
    profile: {
      name: '',
      title: '',
      status: '',
      institution: '',
      location: '',
      email: '',
      phone: '',
      github: '',
      linkedin: '',
      cvUrl: '/uploads/CV.pdf',
      heroHeadline: '',
      shortBio: '',
      aboutIntro: '',
      aboutDescription: '',
      coreFocus: [],
    },
    skills: [],
    projects: [],
    journey: [],
    settings: {
      adminPin: '2027',
    },
  });

  // Project editing state
  const [editingProject, setEditingProject] = useState(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Check saved session PIN on load
  useEffect(() => {
    const savedPin = sessionStorage.getItem('portfolio_admin_pin');
    if (savedPin) {
      setPin(savedPin);
      fetchData(savedPin);
    }
  }, []);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchData = async (enteredPin) => {
    setLoading(true);
    try {
      // 1. Verify PIN with server
      const verifyRes = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          pin: enteredPin,
        }),
      });

      if (!verifyRes.ok) {
        sessionStorage.removeItem('portfolio_admin_pin');
        setIsAuthenticated(false);
        showToast('Incorrect PIN. Please try again.', 'error');
        return;
      }

      // 2. Fetch portfolio data
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const json = await res.json();
        setData((prev) => ({
          ...prev,
          ...json,
          settings: {
            ...prev.settings,
            adminPin: enteredPin,
          },
        }));
        setIsAuthenticated(true);
        if (enteredPin) {
          sessionStorage.setItem('portfolio_admin_pin', enteredPin);
        }
      } else {
        showToast('Failed to load portfolio data', 'error');
      }
    } catch (err) {
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    fetchData(pin.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('portfolio_admin_pin');
    setIsAuthenticated(false);
    setPin('');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const activePin = pin || sessionStorage.getItem('portfolio_admin_pin');
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: activePin,
          data,
        }),
      });

      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast('All changes saved and published successfully!');
        // If PIN was updated in settings, sync it to the active session immediately
        if (data.settings?.adminPin) {
          setPin(data.settings.adminPin);
          sessionStorage.setItem('portfolio_admin_pin', data.settings.adminPin);
        }
      } else {
        showToast(resJson.error || 'Failed to save changes', 'error');
      }
    } catch (err) {
      showToast('Error sending update request', 'error');
    } finally {
      setSaving(false);
    }
  };

  // CV Upload
  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Please select a PDF file', 'error');
      return;
    }

    setUploadingCv(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('pin', pin || sessionStorage.getItem('portfolio_admin_pin'));
      fd.append('type', 'cv');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            cvUrl: json.url,
          },
        }));
        showToast('Resume PDF uploaded and linked!');
      } else {
        showToast(json.error || 'Failed to upload CV', 'error');
      }
    } catch (err) {
      showToast('Upload error', 'error');
    } finally {
      setUploadingCv(false);
    }
  };

  // Project Screenshot Upload
  const handleProjectImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('pin', pin || sessionStorage.getItem('portfolio_admin_pin'));
      fd.append('type', 'project');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEditingProject((prev) => ({
          ...prev,
          image: json.url,
        }));
        showToast('Image uploaded successfully!');
      } else {
        showToast(json.error || 'Failed to upload image', 'error');
      }
    } catch (err) {
      showToast('Image upload error', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Project CRUD helpers
  const handleEditProject = (proj) => {
    setEditingProject({ ...proj, tagsString: proj.tags?.join(', ') || '', highlightsString: proj.highlights?.join('\n') || '' });
    setIsNewProject(false);
  };

  const handleAddNewProject = () => {
    setEditingProject({
      id: `p_${Date.now()}`,
      title: 'New Project',
      tagline: 'Short description of this project',
      category: 'web',
      featured: false,
      image: '',
      tagsString: 'React, Next.js, Node.js',
      description: 'Comprehensive overview of what this application does.',
      highlightsString: 'Built with modern UI\nOptimized performance',
      github: '',
      demo: '',
    });
    setIsNewProject(true);
  };

  const handleSaveProjectModal = () => {
    if (!editingProject) return;

    const formattedTags = editingProject.tagsString
      ? editingProject.tagsString.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const formattedHighlights = editingProject.highlightsString
      ? editingProject.highlightsString.split('\n').map((h) => h.trim()).filter(Boolean)
      : [];

    const finalized = {
      ...editingProject,
      tags: formattedTags,
      highlights: formattedHighlights,
    };
    delete finalized.tagsString;
    delete finalized.highlightsString;

    if (isNewProject) {
      setData((prev) => ({
        ...prev,
        projects: [finalized, ...prev.projects],
      }));
    } else {
      setData((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === finalized.id ? finalized : p)),
      }));
    }

    setEditingProject(null);
    showToast('Project updated! Remember to click "Save All Changes" to publish.');
  };

  const handleDeleteProject = (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
    showToast('Project removed.');
  };

  const handleMoveProject = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= data.projects.length) return;
    const newProjects = [...data.projects];
    const [moved] = newProjects.splice(index, 1);
    newProjects.splice(targetIndex, 0, moved);
    setData((prev) => ({ ...prev, projects: newProjects }));
  };

  // Core Focus handlers
  const handleAddCoreFocus = () => {
    const newFocus = {
      id: 'cf-' + Date.now(),
      label: 'New Focus Area',
      icon: 'code',
    };
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        coreFocus: [...(prev.profile?.coreFocus || []), newFocus],
      },
    }));
    showToast('Added focus item. Remember to click "Save All Changes" to publish.');
  };

  const handleUpdateCoreFocus = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        coreFocus: (prev.profile?.coreFocus || []).map((cf) =>
          cf.id === id ? { ...cf, [field]: value } : cf
        ),
      },
    }));
  };

  const handleDeleteCoreFocus = (id) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        coreFocus: (prev.profile?.coreFocus || []).filter((cf) => cf.id !== id),
      },
    }));
    showToast('Focus item removed.');
  };

  const handleMoveCoreFocus = (index, direction) => {
    const list = [...(data.profile?.coreFocus || [])];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item);
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        coreFocus: list,
      },
    }));
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Auth gate render
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
            <UserCog className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-6">
            admin portal
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? <span>login...</span> : <span>login</span>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Public Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Toast Alert */}
      {message.text && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm animate-in fade-in slide-in-from-top-4 duration-200 ${
            message.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {message.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono text-xs font-bold"
              title="Return to website"
            >
              TE
            </Link>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Portfolio CMS Dashboard
              </h1>
              <p className="text-[11px] text-slate-500">Live Content Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>View Live Site</span>
            </Link>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Publishing...' : 'Save All Changes'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Logout from CMS"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Status</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'projects'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Projects ({data.projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cv')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'cv'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>CV / Resume Uploader</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'skills'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Skills Arsenal</span>
          </button>

          <button
            onClick={() => setActiveTab('journey')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'journey'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Journey & Education</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Security & Backups</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Personal & Academic Profile
                </h2>
                <p className="text-xs text-slate-500">
                  Update your contact details, 4th-year graduation status, and introductory headline.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={data.profile.name}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, name: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Headline Title
                  </label>
                  <input
                    type="text"
                    value={data.profile.title}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, title: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Status
                  </label>
                  <input
                    type="text"
                    value={data.profile.status}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, status: e.target.value } })
                    }
                    placeholder="e.g. 4th Year Computer Science Senior"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={data.profile.institution}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, institution: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={data.profile.email}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, email: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={data.profile.phone}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, phone: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    value={data.profile.github}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, github: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={data.profile.linkedin}
                    onChange={(e) =>
                      setData({ ...data, profile: { ...data.profile, linkedin: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hero Punchline / Headline
                </label>
                <input
                  type="text"
                  value={data.profile.heroHeadline}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, heroHeadline: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Hero Summary
                </label>
                <textarea
                  rows={2}
                  value={data.profile.shortBio}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, shortBio: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  About Me Description
                </label>
                <textarea
                  rows={3}
                  value={data.profile.aboutDescription}
                  onChange={(e) =>
                    setData({ ...data, profile: { ...data.profile, aboutDescription: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              {/* Core Focus Badges Editor */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Core Focus Badges (Hero Header)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Edit the highlighted skill pills shown right below your hero introduction.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCoreFocus}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Focus</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(!data.profile?.coreFocus || data.profile.coreFocus.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No core focus items configured. Click "Add Focus" to add one.</p>
                  ) : (
                    data.profile.coreFocus.map((cf, idx) => (
                      <div
                        key={cf.id || idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={cf.label || ''}
                            onChange={(e) => handleUpdateCoreFocus(cf.id, 'label', e.target.value)}
                            placeholder="e.g. React & Next.js"
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium"
                          />
                          <select
                            value={cf.icon || 'code'}
                            onChange={(e) => handleUpdateCoreFocus(cf.id, 'icon', e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                          >
                            <option value="code">Code Icon (&lt;/&gt;)</option>
                            <option value="database">Database Icon</option>
                            <option value="layers">Layers / Architecture Icon</option>
                            <option value="cpu">CPU / Systems Icon</option>
                            <option value="terminal">Terminal / CLI Icon</option>
                            <option value="globe">Globe / Web Icon</option>
                            <option value="server">Server Icon</option>
                            <option value="wrench">Wrench / Tool Icon</option>
                            <option value="workflow">Workflow Icon</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveCoreFocus(idx, -1)}
                            disabled={idx === 0}
                            className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveCoreFocus(idx, 1)}
                            disabled={idx === data.profile.coreFocus.length - 1}
                            className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoreFocus(cf.id)}
                            className="p-1.5 rounded text-rose-500 hover:text-rose-700"
                            title="Remove Focus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Projects Showcase
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add new projects, update screenshots, edit descriptions, or reorder display.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewProject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Project</span>
                </button>
              </div>

              {/* Projects List */}
              <div className="space-y-3">
                {data.projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {proj.image ? (
                        <img
                          src={proj.image}
                          alt={proj.title}
                          className="w-12 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-md bg-slate-200 dark:bg-slate-700 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {proj.title}
                          </h3>
                          {proj.featured && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{proj.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveProject(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveProject(idx, 1)}
                        disabled={idx === data.projects.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditProject(proj)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CV UPLOADER */}
          {activeTab === 'cv' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Resume / Curriculum Vitae
                </h2>
                <p className="text-xs text-slate-500">
                  Upload a fresh PDF copy of your CV. It automatically updates the download button on the public portfolio.
                </p>
              </div>

              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Upload New CV (PDF format)
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Current file: <span className="font-mono text-blue-500">{data.profile.cvUrl}</span>
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm transition-all">
                    <span>{uploadingCv ? 'Uploading...' : 'Choose PDF File'}</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleCvUpload}
                      disabled={uploadingCv}
                      className="hidden"
                    />
                  </label>

                  <a
                    href={data.profile.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Current CV</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Technical Skills Management
                </h2>
                <p className="text-xs text-slate-500">
                  Manage categories and skill badges (comma separated).
                </p>
              </div>

              <div className="space-y-4">
                {data.skills.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={cat.category}
                        onChange={(e) => {
                          const updated = [...data.skills];
                          updated[idx].category = e.target.value;
                          setData({ ...data, skills: updated });
                        }}
                        className="font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1"
                      />
                      <button
                        onClick={() => {
                          const updated = data.skills.filter((_, i) => i !== idx);
                          setData({ ...data, skills: updated });
                        }}
                        className="text-rose-500 p-1 text-xs hover:underline"
                      >
                        Remove Category
                      </button>
                    </div>

                    <input
                      type="text"
                      value={cat.items?.join(', ')}
                      onChange={(e) => {
                        const updated = [...data.skills];
                        updated[idx].items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                        setData({ ...data, skills: updated });
                      }}
                      placeholder="e.g. React.js, Next.js, Node.js"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      skills: [...data.skills, { category: 'New Category', items: ['Skill 1', 'Skill 2'] }],
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill Category</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: JOURNEY */}
          {activeTab === 'journey' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Journey & Education
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update timeline entries for degree, certifications, and experience.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      journey: [
                        {
                          year: '2027',
                          title: 'New Milestone',
                          organization: 'Organization Name',
                          description: 'Description of milestone or degree.',
                          type: 'education',
                        },
                        ...data.journey,
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="space-y-4">
                {data.journey.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={item.year}
                        onChange={(e) => {
                          const updated = [...data.journey];
                          updated[idx].year = e.target.value;
                          setData({ ...data, journey: updated });
                        }}
                        placeholder="Year / Period"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...data.journey];
                          updated[idx].title = e.target.value;
                          setData({ ...data, journey: updated });
                        }}
                        placeholder="Title / Qualification"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold sm:col-span-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={item.type}
                        onChange={(e) => {
                          const updated = [...data.journey];
                          updated[idx].type = e.target.value;
                          setData({ ...data, journey: updated });
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      >
                        <option value="education">Education</option>
                        <option value="certification">Certification</option>
                        <option value="experience">Experience</option>
                      </select>

                      <input
                        type="text"
                        value={item.organization}
                        onChange={(e) => {
                          const updated = [...data.journey];
                          updated[idx].organization = e.target.value;
                          setData({ ...data, journey: updated });
                        }}
                        placeholder="School or Institution"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:col-span-2"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...data.journey];
                        updated[idx].description = e.target.value;
                        setData({ ...data, journey: updated });
                      }}
                      placeholder="Details"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const updated = data.journey.filter((_, i) => i !== idx);
                          setData({ ...data, journey: updated });
                        }}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY & BACKUPS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Security & Data Backups
                </h2>
                <p className="text-xs text-slate-500">
                  Update your Admin PIN and download offline data backups.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Change Security PIN
                </h3>
                <div className="max-w-xs">
                  <input
                    type="password"
                    value={data.settings?.adminPin || ''}
                    onChange={(e) =>
                      setData({ ...data, settings: { ...data.settings, adminPin: e.target.value } })
                    }
                    placeholder="Enter new PIN"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Remember to click &quot;Save All Changes&quot; after setting a new PIN.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Export JSON Data Backup
                  </h3>
                  <p className="text-xs text-slate-500">
                    Download an offline copy of your entire portfolio data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PROJECT EDIT / ADD MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isNewProject ? 'Create New Project' : 'Edit Project Details'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={editingProject.category}
                  onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                >
                  <option value="web">Web & Full-Stack</option>
                  <option value="cpp">C++ & Algorithms</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={editingProject.tagline}
                onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>

            {/* Image Preview & Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Screenshot / Image Preview
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editingProject.image}
                  onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                  placeholder="/projects/sample.png or /uploads/..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProjectImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={editingProject.tagsString}
                onChange={(e) => setEditingProject({ ...editingProject, tagsString: e.target.value })}
                placeholder="React, Next.js, Node.js, MySQL"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Overview & Description
              </label>
              <textarea
                rows={3}
                value={editingProject.description}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Technical Highlights (one bullet per line)
              </label>
              <textarea
                rows={3}
                value={editingProject.highlightsString}
                onChange={(e) => setEditingProject({ ...editingProject, highlightsString: e.target.value })}
                placeholder="Feature 1&#10;Feature 2"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={editingProject.github}
                  onChange={(e) => setEditingProject({ ...editingProject, github: e.target.value })}
                  placeholder="https://github.com/TeddyEt/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Live Application URL (optional)
                </label>
                <input
                  type="text"
                  value={editingProject.demo}
                  onChange={(e) => setEditingProject({ ...editingProject, demo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featuredProj"
                checked={editingProject.featured}
                onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="featuredProj" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Display as &quot;Featured Project&quot;
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProjectModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
